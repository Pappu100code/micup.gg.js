'use strict';

const EventEmitter = require('events');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

let LiveKit = null;
try {
  LiveKit = require('@livekit/rtc-node');
} catch {}

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const FRAME_DURATION_MS = 20;
const SAMPLES_PER_FRAME = (SAMPLE_RATE * FRAME_DURATION_MS) / 1000;
const BYTES_PER_FRAME = SAMPLES_PER_FRAME * CHANNELS * 2;

class VoiceConnection extends EventEmitter {
  constructor(channel) {
    super();
    this.channel = channel;
    this.guildId = channel.guildId;
    this.client = channel.client;

    this.room = null;
    this.source = null;
    this.track = null;
    this.ffmpeg = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.isDestroyed = false;
    this.volume = 1.0;
  }

  setVolume(percent) {
    this.volume = Math.max(0, Math.min(200, Number(percent))) / 100;
    return this.volume;
  }

  async connect(options = {}) {
    if (!LiveKit) {
      throw new Error('@livekit/rtc-node is required for MicUp voice connections.');
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.client.removeListener('voiceServerUpdate', onServerUpdate);
        reject(new Error('Voice server connection timed out.'));
      }, 15000);

      const onServerUpdate = async (data) => {
        if (data.guild_id !== this.guildId) return;

        clearTimeout(timer);
        this.client.removeListener('voiceServerUpdate', onServerUpdate);

        try {
          this.room = new LiveKit.Room();
          await this.room.connect(data.endpoint, data.token, { autoSubscribe: false, dynacast: false });

          this.source = new LiveKit.AudioSource(SAMPLE_RATE, CHANNELS);
          this.track = LiveKit.LocalAudioTrack.createAudioTrack('audio', this.source);

          const trackOpts = new LiveKit.TrackPublishOptions({
            source: LiveKit.TrackSource.SOURCE_MICROPHONE,
            dtx: false,
            red: false,
            audioEncoding: { maxBitrate: 256000n }
          });

          await this.room.localParticipant.publishTrack(this.track, trackOpts);

          this.emit('ready');
          resolve(this);
        } catch (err) {
          reject(err);
        }
      };

      this.client.on('voiceServerUpdate', onServerUpdate);

      this.client.gateway.send({
        op: 4,
        d: {
          guild_id: this.guildId,
          channel_id: this.channel.id,
          self_deaf: true,
          self_mute: false
        }
      });
    });
  }

  play(audioUrl) {
    this.stop();
    if (!this.source) {
      throw new Error('Not connected to a voice channel.');
    }

    this.isPlaying = true;
    this.isPaused = false;

    this.ffmpeg = spawn(ffmpegPath, [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', audioUrl,
      '-vn',
      '-f', 's16le',
      '-ar', String(SAMPLE_RATE),
      '-ac', String(CHANNELS),
      'pipe:1'
    ], { stdio: ['ignore', 'pipe', 'ignore'] });

    let buffer = Buffer.alloc(0);
    let pumping = false;
    let ended = false;
    let nextFrameTime = Date.now();

    const cleanup = () => {
      if (ended) return;
      ended = true;
      this.isPlaying = false;
      this.isPaused = false;
      if (this.ffmpeg) {
        try { this.ffmpeg.kill('SIGTERM'); } catch {}
        this.ffmpeg = null;
      }
      this.emit('finish');
    };

    const pump = async () => {
      if (pumping) return;
      pumping = true;
      if (this.ffmpeg?.stdout) this.ffmpeg.stdout.pause();

      try {
        while (buffer.length >= BYTES_PER_FRAME && this.isPlaying && !ended) {
          while (this.isPaused && this.isPlaying && !ended) {
            await new Promise(r => setTimeout(r, 50));
            nextFrameTime = Date.now();
          }
          if (!this.isPlaying || ended) break;

          const chunk = buffer.subarray(0, BYTES_PER_FRAME);
          buffer = buffer.subarray(BYTES_PER_FRAME);

          const samples = new Int16Array(SAMPLES_PER_FRAME * CHANNELS);
          Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength).set(chunk);

          if (this.volume !== 1.0) {
            for (let i = 0; i < samples.length; i++) {
              samples[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * this.volume)));
            }
          }

          const frame = new LiveKit.AudioFrame(samples, SAMPLE_RATE, CHANNELS, SAMPLES_PER_FRAME);

          const delay = nextFrameTime - Date.now();
          if (delay > 0) {
            await new Promise(r => setTimeout(r, delay));
          }
          if (Date.now() - nextFrameTime > 200) {
            nextFrameTime = Date.now();
          }
          nextFrameTime += FRAME_DURATION_MS;

          try {
            await this.source.captureFrame(frame);
          } catch {
            cleanup();
            return;
          }
        }
      } finally {
        pumping = false;
        if (this.isPlaying && !ended && this.ffmpeg?.stdout) {
          this.ffmpeg.stdout.resume();
        }
      }
    };

    this.ffmpeg.stdout.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      pump();
    });

    this.ffmpeg.stdout.on('end', () => {
      const checkEnd = () => {
        if (!pumping && buffer.length < BYTES_PER_FRAME) {
          cleanup();
        } else {
          setTimeout(checkEnd, 40);
        }
      };
      checkEnd();
    });

    this.ffmpeg.on('error', (err) => {
      this.emit('error', err);
      cleanup();
    });

    this.emit('start');
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return false;
    this.isPaused = true;
    return true;
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return false;
    this.isPaused = false;
    return true;
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.ffmpeg) {
      try { this.ffmpeg.kill('SIGTERM'); } catch {}
      this.ffmpeg = null;
    }
  }

  async disconnect() {
    this.stop();
    this.isDestroyed = true;

    if (this.room) {
      try { await this.room.disconnect(); } catch {}
      this.room = null;
    }
    this.source = null;
    this.track = null;

    if (this.client.voiceConnections) {
      this.client.voiceConnections.delete(this.guildId);
    }

    this.client.gateway.send({
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_deaf: false,
        self_mute: false
      }
    });

    this.emit('disconnect');
  }
}

module.exports = VoiceConnection;

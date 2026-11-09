'use strict';

const Endpoints = require('./Endpoints');
const RESTError = require('./RESTError');
const pkg = require('../../package.json');

class RESTManager {
  constructor(client) {
    this.client = client;
    this.baseURL = client.options.apiBaseUrl || 'https://micup.gg/api/v10';
    this.userAgent = client.options.userAgent || `micup.gg.js/${pkg.version || '1.0.1'} (https://micup.gg)`;
  }

  get token() {
    return this.client.token;
  }

  _query(path, params) {
    if (!params || typeof params !== 'object') return path;
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
    if (!entries.length) return path;
    const qs = new URLSearchParams(entries).toString();
    return qs ? `${path}?${qs}` : path;
  }

  _payload(data) {
    if (typeof data === 'string') return { content: data };
    if (!data || typeof data !== 'object') return {};
    if (typeof data.toJSON === 'function') return { embeds: [data.toJSON()] };
    if (Array.isArray(data.embeds)) {
      return {
        ...data,
        embeds: data.embeds.map(e => (typeof e?.toJSON === 'function' ? e.toJSON() : e))
      };
    }
    return data;
  }

  async request(method, path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    const headers = {
      'User-Agent': this.userAgent,
      ...(this.token ? { Authorization: `Bot ${this.token}` } : {}),
      ...options.headers
    };

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    if (options.reason) {
      headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await fetch(url, { method, headers, body });

        if (res.status === 429) {
          const rateData = await res.json().catch(() => ({}));
          const retryAfter = (rateData.retry_after || 1) * 1000;
          this.client.emit('debug', `[REST] 429 on ${method} ${path}, retrying in ${retryAfter}ms`);
          await new Promise(r => setTimeout(r, retryAfter));
          continue;
        }

        if (res.status === 204) return null;

        const contentType = res.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await res.json() : await res.text();

        if (!res.ok) {
          const errMsg = data?.message || `HTTP ${res.status} ${res.statusText}`;
          const errCode = data?.code || 0;
          throw new RESTError(errMsg, res.status, errCode, method, path);
        }

        return data;
      } catch (err) {
        if (err instanceof RESTError || attempts >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempts));
      }
    }
  }

  // Gateway & Application
  getGateway() {
    return this.request('GET', Endpoints.gateway());
  }

  getGatewayBot() {
    return this.request('GET', Endpoints.gatewayBot());
  }

  getCurrentApplication() {
    return this.request('GET', Endpoints.currentApplication());
  }

  // Users & DMs
  getCurrentUser() {
    return this.request('GET', Endpoints.currentUser());
  }

  getUser(userId) {
    return this.request('GET', Endpoints.user(userId));
  }

  modifyCurrentUser(data) {
    return this.request('PATCH', Endpoints.currentUser(), { body: data });
  }

  getCurrentUserGuilds() {
    return this.request('GET', Endpoints.currentUserGuilds());
  }

  leaveGuild(guildId) {
    return this.request('DELETE', Endpoints.leaveGuild(guildId));
  }

  createDM(recipientId) {
    return this.request('POST', Endpoints.createDM(), { body: { recipient_id: recipientId } });
  }

  // Guilds
  getGuild(guildId) {
    return this.request('GET', Endpoints.guild(guildId));
  }

  getGuildPreview(guildId) {
    return this.request('GET', Endpoints.guildPreview(guildId));
  }

  modifyGuild(guildId, data, reason) {
    return this.request('PATCH', Endpoints.guild(guildId), { body: data, reason });
  }

  deleteGuild(guildId) {
    return this.request('DELETE', Endpoints.guild(guildId));
  }

  getGuildChannels(guildId) {
    return this.request('GET', Endpoints.guildChannels(guildId));
  }

  createGuildChannel(guildId, data, reason) {
    return this.request('POST', Endpoints.guildChannels(guildId), { body: data, reason });
  }

  modifyGuildChannelPositions(guildId, positions) {
    return this.request('PATCH', Endpoints.guildChannels(guildId), { body: positions });
  }

  getGuildActiveThreads(guildId) {
    return this.request('GET', Endpoints.guildActiveThreads(guildId));
  }

  getGuildMember(guildId, memberId) {
    return this.request('GET', Endpoints.guildMember(guildId, memberId));
  }

  getGuildMembers(guildId, options = {}) {
    return this.request('GET', this._query(Endpoints.guildMembers(guildId), options));
  }

  searchGuildMembers(guildId, query, limit = 20) {
    return this.request('GET', this._query(Endpoints.guildMemberSearch(guildId), { query, limit }));
  }

  modifyGuildMember(guildId, memberId, data, reason) {
    return this.request('PATCH', Endpoints.guildMember(guildId, memberId), { body: data, reason });
  }

  addGuildMemberRole(guildId, memberId, roleId, reason) {
    return this.request('PUT', Endpoints.guildMemberRole(guildId, memberId, roleId), { reason });
  }

  removeGuildMemberRole(guildId, memberId, roleId, reason) {
    return this.request('DELETE', Endpoints.guildMemberRole(guildId, memberId, roleId), { reason });
  }

  removeGuildMember(guildId, memberId, reason) {
    return this.request('DELETE', Endpoints.guildMember(guildId, memberId), { reason });
  }

  getGuildBans(guildId) {
    return this.request('GET', Endpoints.guildBans(guildId));
  }

  getGuildBan(guildId, userId) {
    return this.request('GET', Endpoints.guildBan(guildId, userId));
  }

  createGuildBan(guildId, userId, options = {}) {
    const body = {
      delete_message_days: options.deleteMessageDays || 0,
      delete_message_seconds: options.deleteMessageSeconds || 0
    };
    return this.request('PUT', Endpoints.guildBan(guildId, userId), { body, reason: options.reason });
  }

  removeGuildBan(guildId, userId, reason) {
    return this.request('DELETE', Endpoints.guildBan(guildId, userId), { reason });
  }

  getGuildRoles(guildId) {
    return this.request('GET', Endpoints.guildRoles(guildId));
  }

  createGuildRole(guildId, data = {}, reason) {
    return this.request('POST', Endpoints.guildRoles(guildId), { body: data, reason });
  }

  modifyGuildRolePositions(guildId, positions) {
    return this.request('PATCH', Endpoints.guildRoles(guildId), { body: positions });
  }

  modifyGuildRole(guildId, roleId, data, reason) {
    return this.request('PATCH', Endpoints.guildRole(guildId, roleId), { body: data, reason });
  }

  deleteGuildRole(guildId, roleId, reason) {
    return this.request('DELETE', Endpoints.guildRole(guildId, roleId), { reason });
  }

  getGuildInvites(guildId) {
    return this.request('GET', Endpoints.guildInvites(guildId));
  }

  getGuildAuditLog(guildId, options = {}) {
    return this.request('GET', this._query(Endpoints.guildAuditLogs(guildId), options));
  }

  getGuildIntegrations(guildId) {
    return this.request('GET', Endpoints.guildIntegrations(guildId));
  }

  deleteGuildIntegration(guildId, integrationId, reason) {
    return this.request('DELETE', Endpoints.guildIntegration(guildId, integrationId), { reason });
  }

  getGuildWidget(guildId) {
    return this.request('GET', Endpoints.guildWidget(guildId));
  }

  getGuildWidgetSettings(guildId) {
    return this.request('GET', Endpoints.guildWidgetSettings(guildId));
  }

  modifyGuildWidget(guildId, data, reason) {
    return this.request('PATCH', Endpoints.guildWidgetSettings(guildId), { body: data, reason });
  }

  getGuildVanityUrl(guildId) {
    return this.request('GET', Endpoints.guildVanityUrl(guildId));
  }

  getGuildVoiceRegions(guildId) {
    return this.request('GET', Endpoints.guildVoiceRegions(guildId));
  }

  getGuildWelcomeScreen(guildId) {
    return this.request('GET', Endpoints.guildWelcomeScreen(guildId));
  }

  modifyGuildWelcomeScreen(guildId, data, reason) {
    return this.request('PATCH', Endpoints.guildWelcomeScreen(guildId), { body: data, reason });
  }

  getGuildOnboarding(guildId) {
    return this.request('GET', Endpoints.guildOnboarding(guildId));
  }

  modifyGuildOnboarding(guildId, data, reason) {
    return this.request('PUT', Endpoints.guildOnboarding(guildId), { body: data, reason });
  }

  getGuildPruneCount(guildId, options = {}) {
    return this.request('GET', this._query(Endpoints.guildPrune(guildId), options));
  }

  beginGuildPrune(guildId, options = {}, reason) {
    return this.request('POST', Endpoints.guildPrune(guildId), { body: options, reason });
  }

  modifyCurrentUserVoiceState(guildId, data) {
    return this.request('PATCH', Endpoints.guildVoiceStateCurrentUser(guildId), { body: data });
  }

  modifyUserVoiceState(guildId, userId, data) {
    return this.request('PATCH', Endpoints.guildVoiceStateUser(guildId, userId), { body: data });
  }

  // Auto Moderation
  getAutoModRules(guildId) {
    return this.request('GET', Endpoints.guildAutoModRules(guildId));
  }

  getAutoModRule(guildId, ruleId) {
    return this.request('GET', Endpoints.guildAutoModRule(guildId, ruleId));
  }

  createAutoModRule(guildId, data, reason) {
    return this.request('POST', Endpoints.guildAutoModRules(guildId), { body: data, reason });
  }

  modifyAutoModRule(guildId, ruleId, data, reason) {
    return this.request('PATCH', Endpoints.guildAutoModRule(guildId, ruleId), { body: data, reason });
  }

  deleteAutoModRule(guildId, ruleId, reason) {
    return this.request('DELETE', Endpoints.guildAutoModRule(guildId, ruleId), { reason });
  }

  // Emojis & Stickers
  getGuildEmojis(guildId) {
    return this.request('GET', Endpoints.guildEmojis(guildId));
  }

  getGuildEmoji(guildId, emojiId) {
    return this.request('GET', Endpoints.guildEmoji(guildId, emojiId));
  }

  createGuildEmoji(guildId, data, reason) {
    return this.request('POST', Endpoints.guildEmojis(guildId), { body: data, reason });
  }

  modifyGuildEmoji(guildId, emojiId, data, reason) {
    return this.request('PATCH', Endpoints.guildEmoji(guildId, emojiId), { body: data, reason });
  }

  deleteGuildEmoji(guildId, emojiId, reason) {
    return this.request('DELETE', Endpoints.guildEmoji(guildId, emojiId), { reason });
  }

  getGuildStickers(guildId) {
    return this.request('GET', Endpoints.guildStickers(guildId));
  }

  getGuildSticker(guildId, stickerId) {
    return this.request('GET', Endpoints.guildSticker(guildId, stickerId));
  }

  createGuildSticker(guildId, data, reason) {
    return this.request('POST', Endpoints.guildStickers(guildId), { body: data, reason });
  }

  modifyGuildSticker(guildId, stickerId, data, reason) {
    return this.request('PATCH', Endpoints.guildSticker(guildId, stickerId), { body: data, reason });
  }

  deleteGuildSticker(guildId, stickerId, reason) {
    return this.request('DELETE', Endpoints.guildSticker(guildId, stickerId), { reason });
  }

  // Scheduled Events
  getGuildScheduledEvents(guildId, options = {}) {
    return this.request('GET', this._query(Endpoints.guildScheduledEvents(guildId), options));
  }

  getGuildScheduledEvent(guildId, eventId) {
    return this.request('GET', Endpoints.guildScheduledEvent(guildId, eventId));
  }

  createGuildScheduledEvent(guildId, data, reason) {
    return this.request('POST', Endpoints.guildScheduledEvents(guildId), { body: data, reason });
  }

  modifyGuildScheduledEvent(guildId, eventId, data, reason) {
    return this.request('PATCH', Endpoints.guildScheduledEvent(guildId, eventId), { body: data, reason });
  }

  deleteGuildScheduledEvent(guildId, eventId) {
    return this.request('DELETE', Endpoints.guildScheduledEvent(guildId, eventId));
  }

  getGuildScheduledEventUsers(guildId, eventId, options = {}) {
    return this.request('GET', this._query(Endpoints.guildScheduledEventUsers(guildId, eventId), options));
  }

  // Stage Instances
  createStageInstance(data, reason) {
    return this.request('POST', Endpoints.stageInstances(), { body: data, reason });
  }

  getStageInstance(channelId) {
    return this.request('GET', Endpoints.stageInstance(channelId));
  }

  modifyStageInstance(channelId, data, reason) {
    return this.request('PATCH', Endpoints.stageInstance(channelId), { body: data, reason });
  }

  deleteStageInstance(channelId, reason) {
    return this.request('DELETE', Endpoints.stageInstance(channelId), { reason });
  }

  // Channels
  getChannel(channelId) {
    return this.request('GET', Endpoints.channel(channelId));
  }

  modifyChannel(channelId, data, reason) {
    return this.request('PATCH', Endpoints.channel(channelId), { body: data, reason });
  }

  deleteChannel(channelId, reason) {
    return this.request('DELETE', Endpoints.channel(channelId), { reason });
  }

  getChannelMessages(channelId, options = {}) {
    return this.request('GET', this._query(Endpoints.channelMessages(channelId), options));
  }

  getChannelMessage(channelId, messageId) {
    return this.request('GET', Endpoints.channelMessage(channelId, messageId));
  }

  createMessage(channelId, data) {
    return this.request('POST', Endpoints.channelMessages(channelId), { body: this._payload(data) });
  }

  crosspostMessage(channelId, messageId) {
    return this.request('POST', Endpoints.channelCrosspost(channelId, messageId));
  }

  createReaction(channelId, messageId, emoji) {
    return this.request('PUT', Endpoints.channelReaction(channelId, messageId, emoji));
  }

  deleteOwnReaction(channelId, messageId, emoji) {
    return this.request('DELETE', Endpoints.channelReaction(channelId, messageId, emoji));
  }

  deleteUserReaction(channelId, messageId, emoji, userId) {
    return this.request('DELETE', Endpoints.channelUserReaction(channelId, messageId, emoji, userId));
  }

  getReactions(channelId, messageId, emoji, options = {}) {
    return this.request('GET', this._query(Endpoints.channelReaction(channelId, messageId, emoji), options));
  }

  deleteAllReactions(channelId, messageId) {
    return this.request('DELETE', Endpoints.channelReactions(channelId, messageId));
  }

  deleteAllReactionsForEmoji(channelId, messageId, emoji) {
    return this.request('DELETE', Endpoints.channelReaction(channelId, messageId, emoji));
  }

  editMessage(channelId, messageId, data) {
    return this.request('PATCH', Endpoints.channelMessage(channelId, messageId), { body: this._payload(data) });
  }

  deleteMessage(channelId, messageId, reason) {
    return this.request('DELETE', Endpoints.channelMessage(channelId, messageId), { reason });
  }

  bulkDeleteMessages(channelId, messageIds, reason) {
    return this.request('POST', Endpoints.channelBulkDelete(channelId), { body: { messages: messageIds }, reason });
  }

  editChannelPermissions(channelId, overwriteId, data, reason) {
    return this.request('PUT', Endpoints.channelPermissions(channelId, overwriteId), { body: data, reason });
  }

  deleteChannelPermission(channelId, overwriteId, reason) {
    return this.request('DELETE', Endpoints.channelPermissions(channelId, overwriteId), { reason });
  }

  getChannelInvites(channelId) {
    return this.request('GET', Endpoints.channelInvites(channelId));
  }

  createChannelInvite(channelId, data = {}, reason) {
    return this.request('POST', Endpoints.channelInvites(channelId), { body: data, reason });
  }

  triggerTypingIndicator(channelId) {
    return this.request('POST', Endpoints.channelTyping(channelId));
  }

  getPinnedMessages(channelId) {
    return this.request('GET', Endpoints.channelPins(channelId));
  }

  pinMessage(channelId, messageId, reason) {
    return this.request('PUT', Endpoints.channelPin(channelId, messageId), { reason });
  }

  unpinMessage(channelId, messageId, reason) {
    return this.request('DELETE', Endpoints.channelPin(channelId, messageId), { reason });
  }

  // Threads
  startThreadWithMessage(channelId, messageId, data, reason) {
    return this.request('POST', Endpoints.channelMessageThreads(channelId, messageId), { body: data, reason });
  }

  startThreadWithoutMessage(channelId, data, reason) {
    return this.request('POST', Endpoints.channelThreads(channelId), { body: data, reason });
  }

  joinThread(channelId) {
    return this.request('PUT', Endpoints.channelThreadMemberCurrentUser(channelId));
  }

  addThreadMember(channelId, userId) {
    return this.request('PUT', Endpoints.channelThreadMemberUser(channelId, userId));
  }

  leaveThread(channelId) {
    return this.request('DELETE', Endpoints.channelThreadMemberCurrentUser(channelId));
  }

  removeThreadMember(channelId, userId) {
    return this.request('DELETE', Endpoints.channelThreadMemberUser(channelId, userId));
  }

  getThreadMember(channelId, userId) {
    return this.request('GET', Endpoints.channelThreadMemberUser(channelId, userId));
  }

  getThreadMembers(channelId) {
    return this.request('GET', Endpoints.channelThreadMembers(channelId));
  }

  getArchivedThreads(channelId, type = 'public', options = {}) {
    const endpoint = type === 'private' ? Endpoints.channelArchivedThreadsPrivate(channelId) : Endpoints.channelArchivedThreadsPublic(channelId);
    return this.request('GET', this._query(endpoint, options));
  }

  // Webhooks
  createWebhook(channelId, data, reason) {
    return this.request('POST', Endpoints.channelWebhooks(channelId), { body: data, reason });
  }

  getChannelWebhooks(channelId) {
    return this.request('GET', Endpoints.channelWebhooks(channelId));
  }

  getGuildWebhooks(guildId) {
    return this.request('GET', Endpoints.guildWebhooks(guildId));
  }

  getWebhook(webhookId) {
    return this.request('GET', Endpoints.webhook(webhookId));
  }

  getWebhookWithToken(webhookId, token) {
    return this.request('GET', Endpoints.webhookToken(webhookId, token));
  }

  modifyWebhook(webhookId, data, reason) {
    return this.request('PATCH', Endpoints.webhook(webhookId), { body: data, reason });
  }

  modifyWebhookWithToken(webhookId, token, data) {
    return this.request('PATCH', Endpoints.webhookToken(webhookId, token), { body: data });
  }

  deleteWebhook(webhookId, reason) {
    return this.request('DELETE', Endpoints.webhook(webhookId), { reason });
  }

  deleteWebhookWithToken(webhookId, token) {
    return this.request('DELETE', Endpoints.webhookToken(webhookId, token));
  }

  executeWebhook(webhookId, token, data, wait = false) {
    const qs = wait ? '?wait=true' : '';
    return this.request('POST', `${Endpoints.webhookToken(webhookId, token)}${qs}`, { body: this._payload(data) });
  }

  // Invites
  getInvite(inviteCode, options = {}) {
    return this.request('GET', this._query(Endpoints.invite(inviteCode), options));
  }

  deleteInvite(inviteCode, reason) {
    return this.request('DELETE', Endpoints.invite(inviteCode), { reason });
  }

  // Voice
  getVoiceRegions() {
    return this.request('GET', Endpoints.voiceRegions());
  }

  // Application Commands
  getGlobalApplicationCommands(appId) {
    return this.request('GET', Endpoints.applicationCommands(appId));
  }

  createGlobalApplicationCommand(appId, data) {
    return this.request('POST', Endpoints.applicationCommands(appId), { body: data });
  }

  getGlobalApplicationCommand(appId, commandId) {
    return this.request('GET', Endpoints.applicationCommand(appId, commandId));
  }

  editGlobalApplicationCommand(appId, commandId, data) {
    return this.request('PATCH', Endpoints.applicationCommand(appId, commandId), { body: data });
  }

  deleteGlobalApplicationCommand(appId, commandId) {
    return this.request('DELETE', Endpoints.applicationCommand(appId, commandId));
  }

  bulkOverwriteGlobalApplicationCommands(appId, commands) {
    return this.request('PUT', Endpoints.applicationCommands(appId), { body: commands });
  }

  getGuildApplicationCommands(appId, guildId) {
    return this.request('GET', Endpoints.applicationGuildCommands(appId, guildId));
  }

  createGuildApplicationCommand(appId, guildId, data) {
    return this.request('POST', Endpoints.applicationGuildCommands(appId, guildId), { body: data });
  }

  getGuildApplicationCommand(appId, guildId, commandId) {
    return this.request('GET', Endpoints.applicationGuildCommand(appId, guildId, commandId));
  }

  editGuildApplicationCommand(appId, guildId, commandId, data) {
    return this.request('PATCH', Endpoints.applicationGuildCommand(appId, guildId, commandId), { body: data });
  }

  deleteGuildApplicationCommand(appId, guildId, commandId) {
    return this.request('DELETE', Endpoints.applicationGuildCommand(appId, guildId, commandId));
  }

  bulkOverwriteGuildApplicationCommands(appId, guildId, commands) {
    return this.request('PUT', Endpoints.applicationGuildCommands(appId, guildId), { body: commands });
  }

  // Interactions
  createInteractionResponse(interactionId, token, response) {
    return this.request('POST', Endpoints.interactionResponse(interactionId, token), { body: response });
  }

  getOriginalInteractionResponse(appId, token) {
    return this.request('GET', Endpoints.interactionOriginalResponse(appId, token));
  }

  editOriginalInteractionResponse(appId, token, data) {
    return this.request('PATCH', Endpoints.interactionOriginalResponse(appId, token), { body: data });
  }

  deleteOriginalInteractionResponse(appId, token) {
    return this.request('DELETE', Endpoints.interactionOriginalResponse(appId, token));
  }

  createFollowupMessage(appId, token, data) {
    return this.request('POST', Endpoints.interactionFollowup(appId, token), { body: data });
  }

  editFollowupMessage(appId, token, messageId, data) {
    return this.request('PATCH', Endpoints.interactionFollowupMessage(appId, token, messageId), { body: data });
  }

  deleteFollowupMessage(appId, token, messageId) {
    return this.request('DELETE', Endpoints.interactionFollowupMessage(appId, token, messageId));
  }
}

module.exports = RESTManager;

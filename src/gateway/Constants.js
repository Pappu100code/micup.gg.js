'use strict';

const ChannelType = {
  GUILD_TEXT: 0,
  DM: 1,
  GUILD_VOICE: 2,
  GROUP_DM: 3,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  ANNOUNCEMENT_THREAD: 10,
  PUBLIC_THREAD: 11,
  PRIVATE_THREAD: 12,
  GUILD_STAGE_VOICE: 13,
  GUILD_DIRECTORY: 14,
  GUILD_FORUM: 15
};

const ActivityType = {
  PLAYING: 0,
  STREAMING: 1,
  LISTENING: 2,
  WATCHING: 3,
  CUSTOM: 4,
  COMPETING: 5
};

const GatewayEvents = {
  READY: 'ready',
  RESUMED: 'resumed',
  MESSAGE_CREATE: 'messageCreate',
  MESSAGE_UPDATE: 'messageUpdate',
  MESSAGE_DELETE: 'messageDelete',
  MESSAGE_DELETE_BULK: 'messageDeleteBulk',
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  MESSAGE_REACTION_REMOVE_ALL: 'messageReactionRemoveAll',
  GUILD_CREATE: 'guildCreate',
  GUILD_UPDATE: 'guildUpdate',
  GUILD_DELETE: 'guildDelete',
  GUILD_MEMBER_ADD: 'guildMemberAdd',
  GUILD_MEMBER_UPDATE: 'guildMemberUpdate',
  GUILD_MEMBER_REMOVE: 'guildMemberRemove',
  GUILD_ROLE_CREATE: 'roleCreate',
  GUILD_ROLE_UPDATE: 'roleUpdate',
  GUILD_ROLE_DELETE: 'roleDelete',
  CHANNEL_CREATE: 'channelCreate',
  CHANNEL_UPDATE: 'channelUpdate',
  CHANNEL_DELETE: 'channelDelete',
  CHANNEL_PINS_UPDATE: 'channelPinsUpdate',
  TYPING_START: 'typingStart',
  USER_UPDATE: 'userUpdate',
  VOICE_STATE_UPDATE: 'voiceStateUpdate',
  VOICE_SERVER_UPDATE: 'voiceServerUpdate',
  WEBHOOKS_UPDATE: 'webhooksUpdate',
  INTERACTION_CREATE: 'interactionCreate'
};

module.exports = {
  ChannelType,
  ActivityType,
  GatewayEvents
};


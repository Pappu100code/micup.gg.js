'use strict';

const Endpoints = {
  // Gateway
  gateway: () => '/gateway',
  gatewayBot: () => '/gateway/bot',

  // Current Application & OAuth2
  currentApplication: () => '/oauth2/applications/@me',

  // Current User
  currentUser: () => '/users/@me',
  currentUserGuilds: () => '/users/@me/guilds',
  leaveGuild: (guildId) => `/users/@me/guilds/${guildId}`,
  createDM: () => '/users/@me/channels',
  user: (userId) => `/users/${userId}`,

  // Guilds
  guilds: () => '/guilds',
  guild: (guildId) => `/guilds/${guildId}`,
  guildPreview: (guildId) => `/guilds/${guildId}/preview`,
  guildChannels: (guildId) => `/guilds/${guildId}/channels`,
  guildActiveThreads: (guildId) => `/guilds/${guildId}/threads/active`,
  guildMembers: (guildId) => `/guilds/${guildId}/members`,
  guildMemberSearch: (guildId) => `/guilds/${guildId}/members/search`,
  guildMember: (guildId, memberId) => `/guilds/${guildId}/members/${memberId}`,
  guildMemberRole: (guildId, memberId, roleId) => `/guilds/${guildId}/members/${memberId}/roles/${roleId}`,
  guildBans: (guildId) => `/guilds/${guildId}/bans`,
  guildBan: (guildId, userId) => `/guilds/${guildId}/bans/${userId}`,
  guildRoles: (guildId) => `/guilds/${guildId}/roles`,
  guildRole: (guildId, roleId) => `/guilds/${guildId}/roles/${roleId}`,
  guildInvites: (guildId) => `/guilds/${guildId}/invites`,
  guildAuditLogs: (guildId) => `/guilds/${guildId}/audit-logs`,
  guildIntegrations: (guildId) => `/guilds/${guildId}/integrations`,
  guildIntegration: (guildId, integrationId) => `/guilds/${guildId}/integrations/${integrationId}`,
  guildWidget: (guildId) => `/guilds/${guildId}/widget.json`,
  guildWidgetSettings: (guildId) => `/guilds/${guildId}/widget`,
  guildVanityUrl: (guildId) => `/guilds/${guildId}/vanity-url`,
  guildVoiceRegions: (guildId) => `/guilds/${guildId}/regions`,
  guildWelcomeScreen: (guildId) => `/guilds/${guildId}/welcome-screen`,
  guildOnboarding: (guildId) => `/guilds/${guildId}/onboarding`,
  guildPrune: (guildId) => `/guilds/${guildId}/prune`,
  guildVoiceStateCurrentUser: (guildId) => `/guilds/${guildId}/voice-states/@me`,
  guildVoiceStateUser: (guildId, userId) => `/guilds/${guildId}/voice-states/${userId}`,

  // Auto Moderation
  guildAutoModRules: (guildId) => `/guilds/${guildId}/auto-moderation/rules`,
  guildAutoModRule: (guildId, ruleId) => `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,

  // Emojis & Stickers
  guildEmojis: (guildId) => `/guilds/${guildId}/emojis`,
  guildEmoji: (guildId, emojiId) => `/guilds/${guildId}/emojis/${emojiId}`,
  guildStickers: (guildId) => `/guilds/${guildId}/stickers`,
  guildSticker: (guildId, stickerId) => `/guilds/${guildId}/stickers/${stickerId}`,

  // Scheduled Events
  guildScheduledEvents: (guildId) => `/guilds/${guildId}/scheduled-events`,
  guildScheduledEvent: (guildId, eventId) => `/guilds/${guildId}/scheduled-events/${eventId}`,
  guildScheduledEventUsers: (guildId, eventId) => `/guilds/${guildId}/scheduled-events/${eventId}/users`,

  // Stage Instances
  stageInstances: () => '/stage-instances',
  stageInstance: (channelId) => `/stage-instances/${channelId}`,

  // Channels
  channel: (channelId) => `/channels/${channelId}`,
  channelMessages: (channelId) => `/channels/${channelId}/messages`,
  channelMessage: (channelId, messageId) => `/channels/${channelId}/messages/${messageId}`,
  channelCrosspost: (channelId, messageId) => `/channels/${channelId}/messages/${messageId}/crosspost`,
  channelReactions: (channelId, messageId) => `/channels/${channelId}/messages/${messageId}/reactions`,
  channelReaction: (channelId, messageId, emoji) => `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
  channelUserReaction: (channelId, messageId, emoji, userId) => `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/${userId}`,
  channelBulkDelete: (channelId) => `/channels/${channelId}/messages/bulk-delete`,
  channelPermissions: (channelId, overwriteId) => `/channels/${channelId}/permissions/${overwriteId}`,
  channelInvites: (channelId) => `/channels/${channelId}/invites`,
  channelTyping: (channelId) => `/channels/${channelId}/typing`,
  channelPins: (channelId) => `/channels/${channelId}/pins`,
  channelPin: (channelId, messageId) => `/channels/${channelId}/pins/${messageId}`,

  // Threads
  channelThreads: (channelId) => `/channels/${channelId}/threads`,
  channelMessageThreads: (channelId, messageId) => `/channels/${channelId}/messages/${messageId}/threads`,
  channelThreadMembers: (channelId) => `/channels/${channelId}/thread-members`,
  channelThreadMemberCurrentUser: (channelId) => `/channels/${channelId}/thread-members/@me`,
  channelThreadMemberUser: (channelId, userId) => `/channels/${channelId}/thread-members/${userId}`,
  channelArchivedThreadsPublic: (channelId) => `/channels/${channelId}/threads/archived/public`,
  channelArchivedThreadsPrivate: (channelId) => `/channels/${channelId}/threads/archived/private`,

  // Webhooks
  channelWebhooks: (channelId) => `/channels/${channelId}/webhooks`,
  guildWebhooks: (guildId) => `/guilds/${guildId}/webhooks`,
  webhook: (webhookId) => `/webhooks/${webhookId}`,
  webhookToken: (webhookId, token) => `/webhooks/${webhookId}/${token}`,
  webhookMessage: (webhookId, token, messageId) => `/webhooks/${webhookId}/${token}/messages/${messageId}`,

  // Invites
  invite: (inviteCode) => `/invites/${inviteCode}`,

  // Voice
  voiceRegions: () => '/voice/regions',

  // Application Commands (Slash Commands)
  applicationCommands: (appId) => `/applications/${appId}/commands`,
  applicationCommand: (appId, commandId) => `/applications/${appId}/commands/${commandId}`,
  applicationGuildCommands: (appId, guildId) => `/applications/${appId}/guilds/${guildId}/commands`,
  applicationGuildCommand: (appId, guildId, commandId) => `/applications/${appId}/guilds/${guildId}/commands/${commandId}`,

  // Interactions
  interactionResponse: (interactionId, token) => `/interactions/${interactionId}/${token}/callback`,
  interactionOriginalResponse: (appId, token) => `/webhooks/${appId}/${token}/messages/@original`,
  interactionFollowup: (appId, token) => `/webhooks/${appId}/${token}`,
  interactionFollowupMessage: (appId, token, messageId) => `/webhooks/${appId}/${token}/messages/${messageId}`
};

module.exports = Endpoints;

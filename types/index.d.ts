import { EventEmitter } from 'events';

export declare class Collection<K, V> extends Map<K, V> {
  find(fn: (value: V, key: K, collection: this) => boolean): V | undefined;
  filter(fn: (value: V, key: K, collection: this) => boolean): Collection<K, V>;
  map<T>(fn: (value: V, key: K, collection: this) => T): T[];
  some(fn: (value: V, key: K, collection: this) => boolean): boolean;
  every(fn: (value: V, key: K, collection: this) => boolean): boolean;
  first(): V | undefined;
  last(): V | undefined;
  random(): V | undefined;
  toJSON(): V[];
}

export declare class BaseManager<K, V> {
  client: Client;
  cache: Collection<K, V>;
  readonly size: number;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  resolve(resolvable: any): V | null;
  resolveId(resolvable: any): string | null;
}

export declare class GuildManager extends BaseManager<string, Guild> {
  fetch(id?: string): Promise<Guild | Collection<string, Guild>>;
}

export declare class ChannelManager extends BaseManager<string, Channel> {
  fetch(id: string): Promise<Channel>;
  delete(id: string, reason?: string): Promise<Channel | null>;
}

export declare class UserManager extends BaseManager<string, User> {
  fetch(id: string): Promise<User>;
  createDM(id: string): Promise<Channel>;
}

export declare class RoleManager extends BaseManager<string, Role> {
  guild: Guild;
  fetch(id?: string): Promise<Role | Collection<string, Role>>;
  create(data?: any, reason?: string): Promise<Role>;
  delete(id: string, reason?: string): Promise<Role | null>;
  edit(id: string, data: any, reason?: string): Promise<Role>;
}

export declare class GuildMemberManager extends BaseManager<string, GuildMember> {
  guild: Guild;
  fetch(idOrOptions?: string | { limit?: number; after?: string }): Promise<GuildMember | Collection<string, GuildMember>>;
  search(query: string, limit?: number): Promise<GuildMember[]>;
  ban(user: any, options?: any): Promise<any>;
  unban(user: any, reason?: string): Promise<any>;
  kick(user: any, reason?: string): Promise<any>;
}

export declare class MessageManager extends BaseManager<string, Message> {
  channel: TextChannel;
  fetch(idOrOptions?: string | { limit?: number; before?: string; after?: string; around?: string }): Promise<Message | Message[]>;
  delete(id: string, reason?: string): Promise<null>;
}

export declare const PermissionFlagsBits: Record<string, bigint>;

export declare class Permissions {
  bitfield: bigint;
  constructor(bitfield?: bigint | number | string);
  has(permission: string | bigint, checkAdmin?: boolean): boolean;
  add(...permissions: (string | bigint)[]): this;
  remove(...permissions: (string | bigint)[]): this;
  toArray(): string[];
  toJSON(): string;
}

export declare const GatewayIntentBits: Record<string, number>;

export declare class Intents {
  bitfield: number;
  constructor(bitfield?: number);
  has(intent: string | number): boolean;
  add(...intents: (string | number)[]): this;
  remove(...intents: (string | number)[]): this;
  static all(): number;
}

export declare class EmbedBuilder {
  data: any;
  constructor(data?: any);
  setTitle(title: string): this;
  setDescription(description: string): this;
  setUrl(url: string): this;
  setColor(color: number | string): this;
  setTimestamp(timestamp?: Date | number | string): this;
  setFooter(footer: { text: string; iconURL?: string; icon_url?: string }): this;
  setImage(url: string): this;
  setThumbnail(url: string): this;
  setAuthor(author: { name: string; url?: string; iconURL?: string; icon_url?: string }): this;
  addFields(...fields: Array<{ name: string; value: string; inline?: boolean }>): this;
  setFields(...fields: Array<{ name: string; value: string; inline?: boolean }>): this;
  toJSON(): any;
}

export declare class ActionRowBuilder {
  type: number;
  components: any[];
  constructor(data?: any);
  addComponents(...components: any[]): this;
  setComponents(...components: any[]): this;
  toJSON(): any;
}

export declare class ButtonBuilder {
  data: any;
  constructor(data?: any);
  setCustomId(customId: string): this;
  setLabel(label: string): this;
  setStyle(style: number): this;
  setUrl(url: string): this;
  setDisabled(disabled?: boolean): this;
  setEmoji(emoji: string | { name: string }): this;
  toJSON(): any;
}

export declare class User {
  id: string;
  username: string;
  discriminator: string;
  globalName: string | null;
  avatar: string | null;
  bot: boolean;
  flags: number;
  readonly tag: string;
  readonly mention: string;
  createDM(): Promise<Channel>;
  send(content: any): Promise<Message>;
  avatarURL(options?: { format?: string; size?: number }): string | null;
  toString(): string;
}

export declare class GuildMember {
  id: string;
  guildId: string;
  user: User | null;
  nick: string | null;
  avatar: string | null;
  roleIds: string[];
  joinedAt: Date | null;
  mute: boolean;
  deaf: boolean;
  communicationDisabledUntil: Date | null;
  readonly displayName: string;
  readonly mention: string;
  readonly permissions: Permissions;
  readonly voice: { channelId: string; channel: VoiceChannel | null; sessionId?: string; mute: boolean; deaf: boolean; selfMute: boolean; selfDeaf: boolean } | null;
  addRole(roleId: string | Role, reason?: string): Promise<this>;
  removeRole(roleId: string | Role, reason?: string): Promise<this>;
  kick(reason?: string): Promise<any>;
  ban(options?: { deleteMessageDays?: number; deleteMessageSeconds?: number; reason?: string }): Promise<any>;
  timeout(durationMs: number | null, reason?: string): Promise<any>;
  setNickname(nick: string | null, reason?: string): Promise<any>;
  toString(): string;
}

export declare class Role {
  id: string;
  guildId: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: Permissions;
  managed: boolean;
  mentionable: boolean;
  readonly mention: string;
  edit(data: any, reason?: string): Promise<this>;
  delete(reason?: string): Promise<this>;
  toString(): string;
}

export declare class Channel {
  id: string;
  name: string | null;
  type: number;
  guildId: string | null;
  parentId: string | null;
  position: number;
  readonly isText: boolean;
  readonly isVoice: boolean;
  readonly isCategory: boolean;
  readonly mention: string;
  fetch(): Promise<this>;
  delete(reason?: string): Promise<this>;
  edit(data: any, reason?: string): Promise<this>;
  toString(): string;
}

export declare class TextChannel extends Channel {
  topic: string | null;
  nsfw: boolean;
  rateLimitPerUser: number;
  lastMessageId: string | null;
  messages: MessageManager;
  send(content: any): Promise<Message>;
  bulkDelete(messages: string[] | Message[], reason?: string): Promise<any>;
  triggerTyping(): Promise<any>;
  fetchMessages(options?: { limit?: number; before?: string; after?: string; around?: string }): Promise<Message[]>;
  createInvite(options?: any, reason?: string): Promise<any>;
  createWebhook(data: any, reason?: string): Promise<Webhook>;
  fetchWebhooks(): Promise<Webhook[]>;
  setSlowmode(seconds: number, reason?: string): Promise<this>;
  setTopic(topic: string, reason?: string): Promise<this>;
}

export declare class VoiceChannel extends Channel {
  bitrate: number;
  userLimit: number;
  rtcRegion: string | null;
  readonly connection: VoiceConnection | null;
  join(options?: { selfMute?: boolean; selfDeaf?: boolean }): Promise<VoiceConnection>;
  leave(): Promise<void> | boolean;
  setUserLimit(limit: number, reason?: string): Promise<this>;
  setBitrate(bitrate: number, reason?: string): Promise<this>;
}

export declare class VoiceConnection extends EventEmitter {
  channel: VoiceChannel;
  guildId: string;
  client: Client;
  room: any;
  source: any;
  track: any;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  connect(options?: any): Promise<this>;
  play(audioUrl: string): void;
  pause(): boolean;
  resume(): boolean;
  stop(): void;
  disconnect(): Promise<void>;
  setVolume(volPercent: number): number;
}

export declare class GatewayManager extends EventEmitter {
  client: Client;
  ws: any;
  ping: number;
  connect(): void;
  disconnect(reconnect?: boolean): void;
  send(payload: any): void;
}

export declare class Message {
  id: string;
  channelId: string;
  guildId: string | null;
  content: string;
  author: User;
  member: GuildMember | null;
  timestamp: Date;
  editedTimestamp: Date | null;
  tts: boolean;
  mentionEveryone: boolean;
  mentions: User[];
  mentionRoles: string[];
  attachments: any[];
  embeds: any[];
  pinned: boolean;
  type: number;
  reply(content: any): Promise<Message>;
  edit(content: any): Promise<this>;
  delete(reason?: string): Promise<any>;
  react(emoji: string): Promise<any>;
  pin(reason?: string): Promise<any>;
  unpin(reason?: string): Promise<any>;
}

export declare class Webhook {
  id: string;
  type: number;
  guildId: string | null;
  channelId: string;
  name: string | null;
  avatar: string | null;
  token: string | null;
  url: string | null;
  send(content: any, options?: any): Promise<any>;
  edit(data: any, reason?: string): Promise<this>;
  delete(reason?: string): Promise<any>;
}

export declare class Guild {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  splash: string | null;
  ownerId: string;
  afkChannelId: string | null;
  afkTimeout: number;
  systemChannelId: string | null;
  rulesChannelId: string | null;
  verificationLevel: number;
  features: string[];
  vanityUrlCode: string | null;
  memberCount: number;
  channels: Collection<string, Channel>;
  roles: RoleManager;
  members: GuildMemberManager;
  voiceStates: Collection<string, any>;
  readonly voiceConnection: VoiceConnection | null;
  fetch(): Promise<this>;
  edit(data: any, reason?: string): Promise<this>;
  delete(): Promise<any>;
  createChannel(name: string, options?: any, reason?: string): Promise<Channel>;
  createRole(data?: any, reason?: string): Promise<Role>;
  fetchChannels(): Promise<Collection<string, Channel>>;
  fetchRoles(): Promise<RoleManager>;
  fetchMembers(options?: { limit?: number; after?: string }): Promise<GuildMemberManager>;
  fetchAuditLogs(options?: any): Promise<any>;
  fetchInvites(): Promise<any>;
  fetchWebhooks(): Promise<Webhook[]>;
  fetchBans(): Promise<any>;
  ban(userId: string | GuildMember | User, options?: any): Promise<any>;
  unban(userId: string | GuildMember | User, reason?: string): Promise<any>;
  kick(userId: string | GuildMember | User, reason?: string): Promise<any>;
  leave(): Promise<any>;
  iconURL(options?: { format?: string; size?: number }): string | null;
  bannerURL(options?: { format?: string; size?: number }): string | null;
}

export interface ClientOptions {
  apiBaseUrl?: string;
  gatewayUrl?: string;
  intents?: number;
  userAgent?: string;
  presence?: {
    status?: string;
    activities?: Array<{ name: string; type: number; url?: string }>;
    afk?: boolean;
  };
}

export declare class RESTManager {
  client: Client;
  baseURL: string;
  userAgent: string;
  constructor(client: Client);
  readonly token: string | null;
  request(method: string, path: string, options?: any): Promise<any>;
  getGateway(): Promise<any>;
  getGatewayBot(): Promise<any>;
  getCurrentApplication(): Promise<any>;
  getCurrentUser(): Promise<any>;
  getUser(userId: string): Promise<any>;
  modifyCurrentUser(data: any): Promise<any>;
  getCurrentUserGuilds(): Promise<any>;
  leaveGuild(guildId: string): Promise<any>;
  createDM(recipientId: string): Promise<any>;
  getGuild(guildId: string): Promise<any>;
  getGuildPreview(guildId: string): Promise<any>;
  modifyGuild(guildId: string, data: any, reason?: string): Promise<any>;
  deleteGuild(guildId: string): Promise<any>;
  getGuildChannels(guildId: string): Promise<any>;
  createGuildChannel(guildId: string, data: any, reason?: string): Promise<any>;
  modifyGuildChannelPositions(guildId: string, positions: any[]): Promise<any>;
  getGuildActiveThreads(guildId: string): Promise<any>;
  getGuildMember(guildId: string, memberId: string): Promise<any>;
  getGuildMembers(guildId: string, options?: any): Promise<any>;
  searchGuildMembers(guildId: string, query: string, limit?: number): Promise<any>;
  modifyGuildMember(guildId: string, memberId: string, data: any, reason?: string): Promise<any>;
  addGuildMemberRole(guildId: string, memberId: string, roleId: string, reason?: string): Promise<any>;
  removeGuildMemberRole(guildId: string, memberId: string, roleId: string, reason?: string): Promise<any>;
  removeGuildMember(guildId: string, memberId: string, reason?: string): Promise<any>;
  getGuildBans(guildId: string): Promise<any>;
  getGuildBan(guildId: string, userId: string): Promise<any>;
  createGuildBan(guildId: string, userId: string, options?: any): Promise<any>;
  removeGuildBan(guildId: string, userId: string, reason?: string): Promise<any>;
  getGuildRoles(guildId: string): Promise<any>;
  createGuildRole(guildId: string, data?: any, reason?: string): Promise<any>;
  modifyGuildRolePositions(guildId: string, positions: any[]): Promise<any>;
  modifyGuildRole(guildId: string, roleId: string, data: any, reason?: string): Promise<any>;
  deleteGuildRole(guildId: string, roleId: string, reason?: string): Promise<any>;
  getGuildInvites(guildId: string): Promise<any>;
  getGuildAuditLog(guildId: string, options?: any): Promise<any>;
  getGuildIntegrations(guildId: string): Promise<any>;
  deleteGuildIntegration(guildId: string, integrationId: string, reason?: string): Promise<any>;
  getGuildWidget(guildId: string): Promise<any>;
  getGuildWidgetSettings(guildId: string): Promise<any>;
  modifyGuildWidget(guildId: string, data: any, reason?: string): Promise<any>;
  getGuildVanityUrl(guildId: string): Promise<any>;
  getGuildVoiceRegions(guildId: string): Promise<any>;
  getGuildWelcomeScreen(guildId: string): Promise<any>;
  modifyGuildWelcomeScreen(guildId: string, data: any, reason?: string): Promise<any>;
  getGuildOnboarding(guildId: string): Promise<any>;
  modifyGuildOnboarding(guildId: string, data: any, reason?: string): Promise<any>;
  getGuildPruneCount(guildId: string, options?: any): Promise<any>;
  beginGuildPrune(guildId: string, options?: any, reason?: string): Promise<any>;
  modifyCurrentUserVoiceState(guildId: string, data: any): Promise<any>;
  modifyUserVoiceState(guildId: string, userId: string, data: any): Promise<any>;
  getAutoModRules(guildId: string): Promise<any>;
  getAutoModRule(guildId: string, ruleId: string): Promise<any>;
  createAutoModRule(guildId: string, data: any, reason?: string): Promise<any>;
  modifyAutoModRule(guildId: string, ruleId: string, data: any, reason?: string): Promise<any>;
  deleteAutoModRule(guildId: string, ruleId: string, reason?: string): Promise<any>;
  getGuildEmojis(guildId: string): Promise<any>;
  getGuildEmoji(guildId: string, emojiId: string): Promise<any>;
  createGuildEmoji(guildId: string, data: any, reason?: string): Promise<any>;
  modifyGuildEmoji(guildId: string, emojiId: string, data: any, reason?: string): Promise<any>;
  deleteGuildEmoji(guildId: string, emojiId: string, reason?: string): Promise<any>;
  getGuildStickers(guildId: string): Promise<any>;
  getGuildSticker(guildId: string, stickerId: string): Promise<any>;
  createGuildSticker(guildId: string, data: any, reason?: string): Promise<any>;
  modifyGuildSticker(guildId: string, stickerId: string, data: any, reason?: string): Promise<any>;
  deleteGuildSticker(guildId: string, stickerId: string, reason?: string): Promise<any>;
  getGuildScheduledEvents(guildId: string, options?: any): Promise<any>;
  getGuildScheduledEvent(guildId: string, eventId: string): Promise<any>;
  createGuildScheduledEvent(guildId: string, data: any, reason?: string): Promise<any>;
  modifyGuildScheduledEvent(guildId: string, eventId: string, data: any, reason?: string): Promise<any>;
  deleteGuildScheduledEvent(guildId: string, eventId: string): Promise<any>;
  getGuildScheduledEventUsers(guildId: string, eventId: string, options?: any): Promise<any>;
  createStageInstance(data: any, reason?: string): Promise<any>;
  getStageInstance(channelId: string): Promise<any>;
  modifyStageInstance(channelId: string, data: any, reason?: string): Promise<any>;
  deleteStageInstance(channelId: string, reason?: string): Promise<any>;
  getChannel(channelId: string): Promise<any>;
  modifyChannel(channelId: string, data: any, reason?: string): Promise<any>;
  deleteChannel(channelId: string, reason?: string): Promise<any>;
  getChannelMessages(channelId: string, options?: any): Promise<any>;
  getChannelMessage(channelId: string, messageId: string): Promise<any>;
  createMessage(channelId: string, data: any): Promise<any>;
  crosspostMessage(channelId: string, messageId: string): Promise<any>;
  createReaction(channelId: string, messageId: string, emoji: string): Promise<any>;
  deleteOwnReaction(channelId: string, messageId: string, emoji: string): Promise<any>;
  deleteUserReaction(channelId: string, messageId: string, emoji: string, userId: string): Promise<any>;
  getReactions(channelId: string, messageId: string, emoji: string, options?: any): Promise<any>;
  deleteAllReactions(channelId: string, messageId: string): Promise<any>;
  deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string): Promise<any>;
  editMessage(channelId: string, messageId: string, data: any): Promise<any>;
  deleteMessage(channelId: string, messageId: string, reason?: string): Promise<any>;
  bulkDeleteMessages(channelId: string, messageIds: string[], reason?: string): Promise<any>;
  editChannelPermissions(channelId: string, overwriteId: string, data: any, reason?: string): Promise<any>;
  deleteChannelPermission(channelId: string, overwriteId: string, reason?: string): Promise<any>;
  getChannelInvites(channelId: string): Promise<any>;
  createChannelInvite(channelId: string, data?: any, reason?: string): Promise<any>;
  triggerTypingIndicator(channelId: string): Promise<any>;
  getPinnedMessages(channelId: string): Promise<any>;
  pinMessage(channelId: string, messageId: string, reason?: string): Promise<any>;
  unpinMessage(channelId: string, messageId: string, reason?: string): Promise<any>;
  startThreadWithMessage(channelId: string, messageId: string, data: any, reason?: string): Promise<any>;
  startThreadWithoutMessage(channelId: string, data: any, reason?: string): Promise<any>;
  joinThread(channelId: string): Promise<any>;
  addThreadMember(channelId: string, userId: string): Promise<any>;
  leaveThread(channelId: string): Promise<any>;
  removeThreadMember(channelId: string, userId: string): Promise<any>;
  getThreadMember(channelId: string, userId: string): Promise<any>;
  getThreadMembers(channelId: string): Promise<any>;
  getArchivedThreads(channelId: string, type?: string, options?: any): Promise<any>;
  createWebhook(channelId: string, data: any, reason?: string): Promise<any>;
  getChannelWebhooks(channelId: string): Promise<any>;
  getGuildWebhooks(guildId: string): Promise<any>;
  getWebhook(webhookId: string): Promise<any>;
  getWebhookWithToken(webhookId: string, token: string): Promise<any>;
  modifyWebhook(webhookId: string, data: any, reason?: string): Promise<any>;
  modifyWebhookWithToken(webhookId: string, token: string, data: any): Promise<any>;
  deleteWebhook(webhookId: string, reason?: string): Promise<any>;
  deleteWebhookWithToken(webhookId: string, token: string): Promise<any>;
  executeWebhook(webhookId: string, token: string, data: any, wait?: boolean): Promise<any>;
  getInvite(inviteCode: string, options?: any): Promise<any>;
  deleteInvite(inviteCode: string, reason?: string): Promise<any>;
  getVoiceRegions(): Promise<any>;
  getGlobalApplicationCommands(appId: string): Promise<any>;
  createGlobalApplicationCommand(appId: string, data: any): Promise<any>;
  getGlobalApplicationCommand(appId: string, commandId: string): Promise<any>;
  editGlobalApplicationCommand(appId: string, commandId: string, data: any): Promise<any>;
  deleteGlobalApplicationCommand(appId: string, commandId: string): Promise<any>;
  bulkOverwriteGlobalApplicationCommands(appId: string, commands: any[]): Promise<any>;
  getGuildApplicationCommands(appId: string, guildId: string): Promise<any>;
  createGuildApplicationCommand(appId: string, guildId: string, data: any): Promise<any>;
  getGuildApplicationCommand(appId: string, guildId: string, commandId: string): Promise<any>;
  editGuildApplicationCommand(appId: string, guildId: string, commandId: string, data: any): Promise<any>;
  deleteGuildApplicationCommand(appId: string, guildId: string, commandId: string): Promise<any>;
  bulkOverwriteGuildApplicationCommands(appId: string, guildId: string, commands: any[]): Promise<any>;
  createInteractionResponse(interactionId: string, token: string, response: any): Promise<any>;
  getOriginalInteractionResponse(appId: string, token: string): Promise<any>;
  editOriginalInteractionResponse(appId: string, token: string, data: any): Promise<any>;
  deleteOriginalInteractionResponse(appId: string, token: string): Promise<any>;
  createFollowupMessage(appId: string, token: string, data: any): Promise<any>;
  editFollowupMessage(appId: string, token: string, messageId: string, data: any): Promise<any>;
  deleteFollowupMessage(appId: string, token: string, messageId: string): Promise<any>;
}

export declare class Client extends EventEmitter {
  token: string | null;
  user: User | null;
  readyTimestamp: number | null;
  readonly uptime: number;
  readonly ping: number;
  guilds: GuildManager;
  channels: ChannelManager;
  users: UserManager;
  voiceConnections: Collection<string, VoiceConnection>;
  rest: RESTManager;
  gateway: GatewayManager;
  constructor(options?: ClientOptions);
  login(token?: string): Promise<string>;
  destroy(): void;
  setActivity(name: string, type?: number): boolean;
  setStatus(status?: string): boolean;
  fetchGuild(id: string): Promise<Guild>;
  fetchChannel(id: string): Promise<Channel>;
  fetchUser(id: string): Promise<User>;
}

export declare const GatewayOpcodes: Record<string, number>;
export declare const VoiceOpcodes: Record<string, number>;
export declare const ChannelType: Record<string, number>;
export declare const ActivityType: Record<string, number>;
export declare const GatewayEvents: Record<string, string>;
export declare const Colors: Record<string, number>;
export declare function resolveColor(color: number | string): number;
export declare const version: string;

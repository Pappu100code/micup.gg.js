'use strict';

const Client = require('./client/Client');
const BaseClient = require('./client/BaseClient');
const RESTManager = require('./rest/RESTManager');
const Endpoints = require('./rest/Endpoints');
const RESTError = require('./rest/RESTError');
const GatewayManager = require('./gateway/GatewayManager');
const { GatewayOpcodes, VoiceOpcodes } = require('./gateway/Opcodes');
const { ChannelType, ActivityType, GatewayEvents } = require('./gateway/Constants');
const Guild = require('./structures/Guild');
const GuildMember = require('./structures/GuildMember');
const Role = require('./structures/Role');
const Channel = require('./structures/Channel');
const TextChannel = require('./structures/TextChannel');
const VoiceChannel = require('./structures/VoiceChannel');
const VoiceConnection = require('./voice/VoiceConnection');
const Message = require('./structures/Message');
const User = require('./structures/User');
const Webhook = require('./structures/Webhook');
const BaseManager = require('./managers/BaseManager');
const GuildManager = require('./managers/GuildManager');
const ChannelManager = require('./managers/ChannelManager');
const UserManager = require('./managers/UserManager');
const RoleManager = require('./managers/RoleManager');
const GuildMemberManager = require('./managers/GuildMemberManager');
const MessageManager = require('./managers/MessageManager');
const EmbedBuilder = require('./builders/EmbedBuilder');
const { ActionRowBuilder, ButtonBuilder } = require('./builders/ActionRowBuilder');
const Collection = require('./utils/Collection');
const { Permissions, PermissionFlagsBits } = require('./utils/Permissions');
const { Intents, GatewayIntentBits } = require('./utils/Intents');
const { Colors, resolveColor } = require('./utils/Colors');

const pkg = require('../package.json');

module.exports = {
  // Client & Network
  Client,
  BaseClient,
  RESTManager,
  GatewayManager,
  Endpoints,
  RESTError,

  // Constants & Enums
  GatewayOpcodes,
  VoiceOpcodes,
  ChannelType,
  ActivityType,
  GatewayEvents,

  // Structures
  Guild,
  GuildMember,
  Role,
  Channel,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
  Message,
  User,
  Webhook,

  // Data Managers & Caches
  BaseManager,
  GuildManager,
  ChannelManager,
  UserManager,
  RoleManager,
  GuildMemberManager,
  MessageManager,

  // Builders
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,

  // Utilities
  Collection,
  Permissions,
  PermissionFlagsBits,
  Intents,
  GatewayIntentBits,
  Colors,
  resolveColor,

  version: pkg.version
};


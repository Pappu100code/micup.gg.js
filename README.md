# micup.gg.js

A powerful, high-performance Node.js library that allows you to easily interact with the Micup API, Gateway WebSocket, and LiveKit WebRTC Voice with 100% API coverage.

---

## Installation

```bash
npm install micup.gg.js
```

### Optional Dependencies (Voice Support)

If you plan to join voice channels and stream live audio:

```bash
npm install @livekit/rtc-node ffmpeg-static
```

---

## Quick Start

```javascript
const { Client, GatewayIntentBits, EmbedBuilder } = require('micup.gg.js');

const client = new Client({
  intents: GatewayIntentBits.ALL
});

client.on('ready', () => {
  console.log(`[READY] Logged in as ${client.user.tag}`);
  client.setActivity('micup.gg', 0);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`Gateway Ping: ${client.ping}ms`)
      .setColor('#5865F2')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

client.login('YOUR_MICUP_BOT_TOKEN');
```

---

## Package Subpath Exports

`micup.gg.js` supports clean subpath imports:

```javascript
// Main client & core modules
const { Client, EmbedBuilder, Permissions } = require('micup.gg.js');

// Direct Voice Connection engine
const VoiceConnection = require('micup.gg.js/voice');

// Direct REST API manager
const RESTManager = require('micup.gg.js/rest');

// Direct Gateway WebSocket manager
const GatewayManager = require('micup.gg.js/gateway');

// Direct structures
const { Guild, Message, TextChannel, VoiceChannel } = require('micup.gg.js/structures');
```

---

## 100% Micup API Coverage Reference

Every REST endpoint on the Micup platform is accessible either through object-oriented structures (`client.guilds`, `guild.channels`, `message.reply`, etc.) or directly through `client.rest`:

### 1. Gateway & Applications
- `client.rest.getGateway()` - Retrieve gateway URL.
- `client.rest.getGatewayBot()` - Retrieve gateway URL with recommended shards.
- `client.rest.getCurrentApplication()` - Retrieve bot application information.

### 2. Users & Direct Messages
- `client.rest.getCurrentUser()` - Get current bot user.
- `client.rest.getUser(userId)` - Fetch user profile.
- `client.rest.modifyCurrentUser(data)` - Update bot profile (username, avatar).
- `client.rest.getCurrentUserGuilds()` - List guilds the bot is a member of.
- `client.rest.leaveGuild(guildId)` - Leave a guild.
- `client.rest.createDM(recipientId)` - Open direct message channel with user.

### 3. Guilds & Server Management
- `client.rest.getGuild(guildId)` - Fetch guild details.
- `client.rest.getGuildPreview(guildId)` - Fetch public preview of guild.
- `client.rest.modifyGuild(guildId, data, reason)` - Edit guild settings.
- `client.rest.deleteGuild(guildId)` - Delete guild (owner only).
- `client.rest.getGuildChannels(guildId)` - List guild channels.
- `client.rest.createGuildChannel(guildId, data, reason)` - Create text or voice channel.
- `client.rest.modifyGuildChannelPositions(guildId, positions)` - Reorder channels.
- `client.rest.getGuildActiveThreads(guildId)` - List active threads in guild.
- `client.rest.getGuildMembers(guildId, options)` - List guild members.
- `client.rest.getGuildMember(guildId, memberId)` - Fetch member profile.
- `client.rest.searchGuildMembers(guildId, query, limit)` - Search members by query.
- `client.rest.modifyGuildMember(guildId, memberId, data, reason)` - Timeout, nick, or mute member.
- `client.rest.addGuildMemberRole(guildId, memberId, roleId, reason)` - Assign role to member.
- `client.rest.removeGuildMemberRole(guildId, memberId, roleId, reason)` - Remove role from member.
- `client.rest.removeGuildMember(guildId, memberId, reason)` - Kick member.
- `client.rest.getGuildBans(guildId)` - List banned members.
- `client.rest.getGuildBan(guildId, userId)` - Fetch ban details for user.
- `client.rest.createGuildBan(guildId, userId, options)` - Ban user.
- `client.rest.removeGuildBan(guildId, userId, reason)` - Unban user.
- `client.rest.getGuildRoles(guildId)` - List server roles.
- `client.rest.createGuildRole(guildId, data, reason)` - Create a new role.
- `client.rest.modifyGuildRolePositions(guildId, positions)` - Reorder server roles.
- `client.rest.modifyGuildRole(guildId, roleId, data, reason)` - Edit role properties and permissions.
- `client.rest.deleteGuildRole(guildId, roleId, reason)` - Delete server role.
- `client.rest.getGuildInvites(guildId)` - List all active server invites.
- `client.rest.getGuildAuditLog(guildId, options)` - Retrieve server audit log.
- `client.rest.getGuildIntegrations(guildId)` - List server integrations.
- `client.rest.deleteGuildIntegration(guildId, integrationId, reason)` - Delete integration.
- `client.rest.getGuildWidget(guildId)` - Fetch widget JSON.
- `client.rest.getGuildWidgetSettings(guildId)` - Fetch widget settings.
- `client.rest.modifyGuildWidget(guildId, data, reason)` - Edit widget settings.
- `client.rest.getGuildVanityUrl(guildId)` - Fetch vanity invite URL code.
- `client.rest.getGuildVoiceRegions(guildId)` - List available voice regions for guild.
- `client.rest.getGuildWelcomeScreen(guildId)` - Fetch welcome screen.
- `client.rest.modifyGuildWelcomeScreen(guildId, data, reason)` - Edit welcome screen.
- `client.rest.getGuildOnboarding(guildId)` - Fetch onboarding flow.
- `client.rest.modifyGuildOnboarding(guildId, data, reason)` - Update onboarding settings.
- `client.rest.getGuildPruneCount(guildId, options)` - Count inactive members for prune.
- `client.rest.beginGuildPrune(guildId, options, reason)` - Prune inactive members.
- `client.rest.modifyCurrentUserVoiceState(guildId, data)` - Update bot mute/deaf/channel voice state.
- `client.rest.modifyUserVoiceState(guildId, userId, data)` - Update user voice state.

### 4. Auto Moderation
- `client.rest.getAutoModRules(guildId)` - List all auto moderation rules.
- `client.rest.getAutoModRule(guildId, ruleId)` - Fetch specific auto moderation rule.
- `client.rest.createAutoModRule(guildId, data, reason)` - Create auto moderation rule.
- `client.rest.modifyAutoModRule(guildId, ruleId, data, reason)` - Update auto moderation rule.
- `client.rest.deleteAutoModRule(guildId, ruleId, reason)` - Delete auto moderation rule.

### 5. Emojis & Stickers
- `client.rest.getGuildEmojis(guildId)` - List guild emojis.
- `client.rest.getGuildEmoji(guildId, emojiId)` - Fetch emoji.
- `client.rest.createGuildEmoji(guildId, data, reason)` - Upload new guild emoji.
- `client.rest.modifyGuildEmoji(guildId, emojiId, data, reason)` - Edit emoji name or roles.
- `client.rest.deleteGuildEmoji(guildId, emojiId, reason)` - Delete guild emoji.
- `client.rest.getGuildStickers(guildId)` - List guild stickers.
- `client.rest.getGuildSticker(guildId, stickerId)` - Fetch sticker.
- `client.rest.createGuildSticker(guildId, data, reason)` - Upload new sticker.
- `client.rest.modifyGuildSticker(guildId, stickerId, data, reason)` - Edit sticker.
- `client.rest.deleteGuildSticker(guildId, stickerId, reason)` - Delete sticker.

### 6. Scheduled Events
- `client.rest.getGuildScheduledEvents(guildId, options)` - List scheduled events.
- `client.rest.getGuildScheduledEvent(guildId, eventId)` - Fetch scheduled event.
- `client.rest.createGuildScheduledEvent(guildId, data, reason)` - Create scheduled event.
- `client.rest.modifyGuildScheduledEvent(guildId, eventId, data, reason)` - Edit scheduled event.
- `client.rest.deleteGuildScheduledEvent(guildId, eventId)` - Cancel scheduled event.
- `client.rest.getGuildScheduledEventUsers(guildId, eventId, options)` - List event subscribers.

### 7. Stage Instances
- `client.rest.createStageInstance(data, reason)` - Open stage instance.
- `client.rest.getStageInstance(channelId)` - Fetch stage instance.
- `client.rest.modifyStageInstance(channelId, data, reason)` - Edit stage topic.
- `client.rest.deleteStageInstance(channelId, reason)` - Close stage instance.

### 8. Channels & Messaging
- `client.rest.getChannel(channelId)` - Fetch channel.
- `client.rest.modifyChannel(channelId, data, reason)` - Update channel name, topic, bitrate, slowmode.
- `client.rest.deleteChannel(channelId, reason)` - Delete channel.
- `client.rest.getChannelMessages(channelId, options)` - Fetch message history.
- `client.rest.getChannelMessage(channelId, messageId)` - Fetch single message.
- `client.rest.createMessage(channelId, data)` - Send message, embed, or components.
- `client.rest.crosspostMessage(channelId, messageId)` - Publish announcement message.
- `client.rest.createReaction(channelId, messageId, emoji)` - Add reaction.
- `client.rest.deleteOwnReaction(channelId, messageId, emoji)` - Remove bot reaction.
- `client.rest.deleteUserReaction(channelId, messageId, emoji, userId)` - Remove user reaction.
- `client.rest.getReactions(channelId, messageId, emoji, options)` - List users who reacted.
- `client.rest.deleteAllReactions(channelId, messageId)` - Clear all reactions on message.
- `client.rest.deleteAllReactionsForEmoji(channelId, messageId, emoji)` - Clear specific reaction emoji.
- `client.rest.editMessage(channelId, messageId, data)` - Edit message content/embeds.
- `client.rest.deleteMessage(channelId, messageId, reason)` - Delete message.
- `client.rest.bulkDeleteMessages(channelId, messageIds, reason)` - Bulk delete 2-100 messages.
- `client.rest.editChannelPermissions(channelId, overwriteId, data, reason)` - Edit permission overwrite.
- `client.rest.deleteChannelPermission(channelId, overwriteId, reason)` - Delete permission overwrite.
- `client.rest.getChannelInvites(channelId)` - List channel invites.
- `client.rest.createChannelInvite(channelId, data, reason)` - Create invite to channel.
- `client.rest.triggerTypingIndicator(channelId)` - Trigger typing status.
- `client.rest.getPinnedMessages(channelId)` - List pinned messages.
- `client.rest.pinMessage(channelId, messageId, reason)` - Pin message.
- `client.rest.unpinMessage(channelId, messageId, reason)` - Unpin message.

### 9. Threads
- `client.rest.startThreadWithMessage(channelId, messageId, data, reason)` - Create thread on message.
- `client.rest.startThreadWithoutMessage(channelId, data, reason)` - Create standalone thread.
- `client.rest.joinThread(channelId)` - Join thread.
- `client.rest.addThreadMember(channelId, userId)` - Add user to thread.
- `client.rest.leaveThread(channelId)` - Leave thread.
- `client.rest.removeThreadMember(channelId, userId)` - Remove user from thread.
- `client.rest.getThreadMember(channelId, userId)` - Fetch thread member.
- `client.rest.getThreadMembers(channelId)` - List thread members.
- `client.rest.getArchivedThreads(channelId, type, options)` - List public or private archived threads.

### 10. Webhooks
- `client.rest.createWebhook(channelId, data, reason)` - Create channel webhook.
- `client.rest.getChannelWebhooks(channelId)` - List webhooks in channel.
- `client.rest.getGuildWebhooks(guildId)` - List webhooks in guild.
- `client.rest.getWebhook(webhookId)` - Fetch webhook details.
- `client.rest.getWebhookWithToken(webhookId, token)` - Fetch webhook without bot auth.
- `client.rest.modifyWebhook(webhookId, data, reason)` - Modify webhook.
- `client.rest.modifyWebhookWithToken(webhookId, token, data)` - Modify webhook with token.
- `client.rest.deleteWebhook(webhookId, reason)` - Delete webhook.
- `client.rest.deleteWebhookWithToken(webhookId, token)` - Delete webhook with token.
- `client.rest.executeWebhook(webhookId, token, data, wait)` - Execute webhook payload.

### 11. Application Commands (Slash Commands) & Interactions
- `client.rest.getGlobalApplicationCommands(appId)` - List global slash commands.
- `client.rest.createGlobalApplicationCommand(appId, data)` - Register global slash command.
- `client.rest.getGlobalApplicationCommand(appId, commandId)` - Fetch slash command.
- `client.rest.editGlobalApplicationCommand(appId, commandId, data)` - Edit slash command.
- `client.rest.deleteGlobalApplicationCommand(appId, commandId)` - Delete slash command.
- `client.rest.bulkOverwriteGlobalApplicationCommands(appId, commands)` - Bulk overwrite commands.
- `client.rest.getGuildApplicationCommands(appId, guildId)` - List guild-specific commands.
- `client.rest.createGuildApplicationCommand(appId, guildId, data)` - Register guild-specific command.
- `client.rest.getGuildApplicationCommand(appId, guildId, commandId)` - Fetch guild command.
- `client.rest.editGuildApplicationCommand(appId, guildId, commandId, data)` - Edit guild command.
- `client.rest.deleteGuildApplicationCommand(appId, guildId, commandId)` - Delete guild command.
- `client.rest.bulkOverwriteGuildApplicationCommands(appId, guildId, commands)` - Bulk overwrite guild commands.
- `client.rest.createInteractionResponse(interactionId, token, response)` - Respond to interaction callback.
- `client.rest.getOriginalInteractionResponse(appId, token)` - Fetch initial interaction message.
- `client.rest.editOriginalInteractionResponse(appId, token, data)` - Edit initial response.
- `client.rest.deleteOriginalInteractionResponse(appId, token)` - Delete initial response.
- `client.rest.createFollowupMessage(appId, token, data)` - Send followup interaction message.
- `client.rest.editFollowupMessage(appId, token, messageId, data)` - Edit followup message.
- `client.rest.deleteFollowupMessage(appId, token, messageId)` - Delete followup message.

---

## LiveKit WebRTC Voice Streaming

MicUp voice runs on LiveKit WebRTC. `micup.gg.js` includes a high-precision audio streaming pipeline:

```javascript
// Connect to user's voice channel
const voiceChannel = message.member.voice.channel;
if (voiceChannel) {
  const connection = await voiceChannel.join();

  // Stream live audio
  connection.play('https://streams.ilovemusic.de/iloveradio17.mp3');

  // Controls
  connection.setVolume(80); // 0% to 200%
  connection.pause();
  connection.resume();
  connection.stop();

  // Disconnect cleanly
  await connection.disconnect();
}
```

---

## EmbedBuilder

```javascript
const { EmbedBuilder } = require('micup.gg.js');

const embed = new EmbedBuilder()
  .setTitle('Security Alert')
  .setDescription('System Shield Activated')
  .setColor('#ED4245')
  .addFields(
    { name: 'Target', value: '<@1569262651543388162>', inline: true },
    { name: 'Status', value: 'Protected', inline: true }
  )
  .setFooter({ text: 'Powered by micup.gg.js' })
  .setTimestamp();

channel.send({ embeds: [embed] });
```

---

## Publishing to npm

To publish this package to npm:

```bash
# 1. Login to npm
npm login

# 2. Publish package
npm publish --access public
```

---

## Links

- GitHub Repository: https://github.com/Pappu100code/micupjs
- Issue Tracker: https://github.com/Pappu100code/micupjs/issues

---

## License

MIT License. Copyright (c) 2026 MicUp JS Contributors.

'use strict';

class ActionRowBuilder {
  constructor(data = {}) {
    this.type = 1;
    this.components = data.components || [];
  }

  addComponents(...components) {
    this.components.push(...components.flat(Infinity));
    return this;
  }

  setComponents(...components) {
    this.components = components.flat(Infinity);
    return this;
  }

  toJSON() {
    return {
      type: 1,
      components: this.components.map(c => (typeof c.toJSON === 'function' ? c.toJSON() : c))
    };
  }
}

class ButtonBuilder {
  constructor(data = {}) {
    this.data = {
      type: 2,
      style: data.style || 1,
      label: data.label || undefined,
      emoji: data.emoji || undefined,
      custom_id: data.custom_id || data.customId || undefined,
      url: data.url || undefined,
      disabled: data.disabled || false
    };
  }

  setCustomId(customId) {
    this.data.custom_id = customId;
    return this;
  }

  setLabel(label) {
    this.data.label = label;
    return this;
  }

  setStyle(style) {
    this.data.style = style;
    return this;
  }

  setUrl(url) {
    this.data.url = url;
    return this;
  }

  setDisabled(disabled = true) {
    this.data.disabled = Boolean(disabled);
    return this;
  }

  setEmoji(emoji) {
    this.data.emoji = typeof emoji === 'string' ? { name: emoji } : emoji;
    return this;
  }

  toJSON() {
    return { ...this.data };
  }
}

module.exports = {
  ActionRowBuilder,
  ButtonBuilder
};


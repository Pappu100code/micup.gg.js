'use strict';

const { resolveColor } = require('../utils/Colors');

/**
 * Fluent builder for Rich Embed objects.
 */
class EmbedBuilder {
  constructor(data = {}) {
    this.data = {
      title: data.title || undefined,
      description: data.description || undefined,
      url: data.url || undefined,
      timestamp: data.timestamp || undefined,
      color: data.color !== undefined ? resolveColor(data.color) : undefined,
      footer: data.footer ? { text: data.footer.text, icon_url: data.footer.icon_url || data.footer.iconURL } : undefined,
      image: data.image ? { url: data.image.url } : undefined,
      thumbnail: data.thumbnail ? { url: data.thumbnail.url } : undefined,
      author: data.author ? {
        name: data.author.name,
        url: data.author.url,
        icon_url: data.author.icon_url || data.author.iconURL
      } : undefined,
      fields: Array.isArray(data.fields) ? [...data.fields] : []
    };
  }

  setTitle(title) {
    this.data.title = String(title).slice(0, 256);
    return this;
  }

  setDescription(description) {
    this.data.description = String(description).slice(0, 4096);
    return this;
  }

  setUrl(url) {
    this.data.url = url;
    return this;
  }

  setColor(color) {
    this.data.color = resolveColor(color);
    return this;
  }

  setTimestamp(timestamp = new Date()) {
    if (timestamp instanceof Date) {
      this.data.timestamp = timestamp.toISOString();
    } else if (typeof timestamp === 'number') {
      this.data.timestamp = new Date(timestamp).toISOString();
    } else {
      this.data.timestamp = timestamp;
    }
    return this;
  }

  setFooter({ text, iconURL, icon_url } = {}) {
    this.data.footer = {
      text: String(text).slice(0, 2048),
      icon_url: iconURL || icon_url
    };
    return this;
  }

  setImage(url) {
    this.data.image = { url };
    return this;
  }

  setThumbnail(url) {
    this.data.thumbnail = { url };
    return this;
  }

  setAuthor({ name, url, iconURL, icon_url } = {}) {
    this.data.author = {
      name: String(name).slice(0, 256),
      url,
      icon_url: iconURL || icon_url
    };
    return this;
  }

  addFields(...fields) {
    const flattened = fields.flat(Infinity);
    for (const field of flattened) {
      if (!field || typeof field !== 'object') continue;
      this.data.fields.push({
        name: String(field.name).slice(0, 256),
        value: String(field.value).slice(0, 1024),
        inline: Boolean(field.inline)
      });
    }
    return this;
  }

  setFields(...fields) {
    this.data.fields = [];
    return this.addFields(...fields);
  }

  toJSON() {
    return { ...this.data };
  }
}

module.exports = EmbedBuilder;


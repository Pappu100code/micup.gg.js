'use strict';

const Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xFFFFFF,
  AQUA: 0x1ABC9C,
  GREEN: 0x57F287,
  BLUE: 0x3498DB,
  YELLOW: 0xFEE75C,
  PURPLE: 0x9B59B6,
  LUMINOUS_VIVID_PINK: 0xE91E63,
  GOLD: 0xF1C40F,
  ORANGE: 0xE67E22,
  RED: 0xED4245,
  GREY: 0x95A5A6,
  NAVY: 0x34495E,
  DARK_AQUA: 0x11806A,
  DARK_GREEN: 0x1F8B4C,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368A,
  DARK_GOLD: 0xC27C0E,
  DARK_ORANGE: 0xA84300,
  DARK_RED: 0x992D22,
  DARK_GREY: 0x7F8C8D,
  LIGHT_GREY: 0xBCC0C0,
  BLURPLE: 0x5865F2,
  FUCHSIA: 0xEB459E,
  SUCCESS: 0x57F287,
  WARNING: 0xFEE75C,
  DANGER: 0xED4245,
  INFO: 0x5865F2,
  MICUP: 0x6C5CE7
};

function resolveColor(color) {
  if (typeof color === 'string') {
    if (Colors[color.toUpperCase()] !== undefined) {
      return Colors[color.toUpperCase()];
    }
    if (color.startsWith('#')) {
      return parseInt(color.slice(1), 16);
    }
    return parseInt(color, 16);
  }
  return Number(color) || Colors.DEFAULT;
}

module.exports = { Colors, resolveColor };


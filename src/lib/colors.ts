import type { ScheduleColor } from "./types";

// The five section boards, full strength. Vermilion is held out for errata
// and must never appear here.
export const BOARD_HEX: Record<ScheduleColor, string> = {
  RED: "#C22F1F",
  BLUE: "#2843BC",
  YELLOW: "#F2B705",
  GREEN: "#4E9C43",
  ORANGE: "#E06214",
};

const INK = "#17150F";
const MILK = "#FDFCF6";

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function luminance([r, g, b]: [number, number, number]): number {
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

function contrast(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function compositeWhite(rgb: [number, number, number], alpha: number): [number, number, number] {
  return [
    rgb[0] * (1 - alpha) + 255 * alpha,
    rgb[1] * (1 - alpha) + 255 * alpha,
    rgb[2] * (1 - alpha) + 255 * alpha,
  ];
}

// Milk acetate over a board: binary-search the white overlay's alpha until the
// composite reading field lands in a fixed luminance band, so ink stays >= 7:1
// on every board while the board color still glows through the leaf.
const LEAF_BAND_MID = 0.66;

function solveLeafAlpha(boardHex: string): number {
  const rgb = hexToRgb(boardHex);
  if (luminance(rgb) >= LEAF_BAND_MID) return 0.55; // pale boards still read as a leaf
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (luminance(compositeWhite(rgb, mid)) < LEAF_BAND_MID) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const INK_L = luminance(hexToRgb(INK));
const MILK_L = luminance(hexToRgb(MILK));

export interface BoardStyle {
  /** Color name printed everywhere the color appears */
  label: string;
  /** Full-strength board hex */
  board: string;
  /** Direct print on the bare board: whichever of ink or milk reads stronger */
  onBoard: string;
  /** Milk-acetate leaf color: white at the solved alpha, laid over the board */
  leaf: string;
  leafAlpha: number;
}

function buildStyle(color: ScheduleColor, label: string): BoardStyle {
  const board = BOARD_HEX[color];
  const boardL = luminance(hexToRgb(board));
  const alpha = solveLeafAlpha(board);
  return {
    label,
    board,
    onBoard: contrast(MILK_L, boardL) >= contrast(INK_L, boardL) ? MILK : INK,
    leaf: `rgba(255, 255, 255, ${alpha.toFixed(3)})`,
    leafAlpha: alpha,
  };
}

export const COLOR_CONFIG: Record<ScheduleColor, BoardStyle> = {
  RED: buildStyle("RED", "Red"),
  BLUE: buildStyle("BLUE", "Blue"),
  YELLOW: buildStyle("YELLOW", "Yellow"),
  GREEN: buildStyle("GREEN", "Green"),
  ORANGE: buildStyle("ORANGE", "Orange"),
};

export function getColorStyle(color: ScheduleColor | null): BoardStyle | null {
  if (!color) return null;
  return COLOR_CONFIG[color] ?? null;
}

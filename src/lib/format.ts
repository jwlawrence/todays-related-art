/**
 * Related-art names like "Technology/PE" contain no spaces, and browsers
 * will not line-break at a slash — at display size they overflow their
 * leaf. Insert a zero-width space after each slash so the name can wrap
 * cleanly ("Technology/" / "PE") when the leaf is narrow.
 */
export function softBreakArt(art: string): string {
  return art.replace(/\//g, "/\u200B");
}

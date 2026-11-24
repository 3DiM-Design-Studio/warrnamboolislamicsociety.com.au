// The albums photos can be filed in. Adding a new album later only needs a line here.
export const ALBUMS = {
  friday: "Friday prayer",
  iftar: "Iftar",
  eid: "Eid",
  lectures: "Lectures",
  community: "Community",
} as const;

export type AlbumKey = keyof typeof ALBUMS;
export const ALBUM_KEYS = Object.keys(ALBUMS) as AlbumKey[];
export const isAlbum = (v: string): v is AlbumKey => v in ALBUMS;
export const albumLabel = (v: string) => (isAlbum(v) ? ALBUMS[v] : "Other");

/** Words that describe a photo for people who cannot see it. Uses the caption, or the album when there is none. */
export const photoLabel = (p: { caption: string; album: string }) => p.caption.trim() || `${albumLabel(p.album)} photo`;

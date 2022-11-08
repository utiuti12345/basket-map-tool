export interface Favorite {
  uid: string;
  park_id: number;
  sequence: number;
}

export function GenerateSequence(favorites: Favorite[]): number {
  return favorites.length + 1;
}

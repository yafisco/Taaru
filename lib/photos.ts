/** ".../tissu.jpg" -> ".../tissu-mini.jpg" (miniature envoyée avec la photo, pour les listes) */
export const cheminMiniature = (path: string) => path.replace(/\.jpg$/, "-mini.jpg");

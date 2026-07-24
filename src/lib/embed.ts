/**
 * Convierte un link normal de YouTube o Vimeo en su URL de embed (iframe).
 * Si no reconoce el formato, devuelve la URL tal cual (sirve para embeds ya armados).
 */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();

  // YouTube: watch?v=, youtu.be/, shorts/, o ya /embed/
  const yt =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/) ||
    u.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo: vimeo.com/12345 o player.vimeo.com/video/12345
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;

  return u;
}

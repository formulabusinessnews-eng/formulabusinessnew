function youtubeId(input: string) {
  const raw = input.trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
        id = url.pathname.split('/')[2] || '';
      } else {
        id = url.searchParams.get('v') || '';
      }
    }
    return /^[\w-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

/** Guarda o endereço de embed. Links watch, shorts e youtu.be incompletos permanecem como foram digitados. */
export function canonicalYoutubeUrl(input: string) {
  const id = youtubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : input;
}

/** Endereço usado no player do banner. */
export function youtubePlaybackUrl(input: string) {
  const id = youtubeId(input);
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  const raw = input.trim();
  if (!raw) return '';
  return raw.includes('?') ? `${raw}&autoplay=1` : `${raw}?autoplay=1`;
}

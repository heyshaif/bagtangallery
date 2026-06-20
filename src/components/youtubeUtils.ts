export function getYoutubeEmbedUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // 1. Check if it's a full iframe tag
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  
  // 2. Check if it's already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }
  
  // 3. Check if it's a short youtube link
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/');
    const idWithParams = parts[parts.length - 1];
    const id = idWithParams.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  
  // 4. Check if it's a watch url
  if (trimmed.includes('watch?v=')) {
    const parts = trimmed.split('watch?v=');
    const idWithParams = parts[parts.length - 1];
    const id = idWithParams.split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  
  // 5. If it's a pure video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }
  
  return trimmed;
}

export function getYoutubeVideoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // 1. If it's a full iframe
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      return getYoutubeVideoId(srcMatch[1]);
    }
  }
  
  // 2. From embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    const parts = trimmed.split('youtube.com/embed/');
    return parts[parts.length - 1].split('?')[0];
  }
  
  // 3. Short URL
  if (trimmed.includes('youtu.be/')) {
    return trimmed.split('youtu.be/')[1].split('?')[0];
  }
  
  // 4. Watch URL
  if (trimmed.includes('watch?v=')) {
    return trimmed.split('watch?v=')[1].split('&')[0];
  }
  
  // 5. Pure ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  return '';
}

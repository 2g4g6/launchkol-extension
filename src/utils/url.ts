/** Extract all URLs from a string */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

/** Get hostname without www prefix */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/** Get truncated path for display */
export function getTruncatedPath(url: string, maxLength: number = 30): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    if (path.length > maxLength) {
      return path.slice(0, maxLength) + "...";
    }
    return path || "/";
  } catch {
    return "";
  }
}

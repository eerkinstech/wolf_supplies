// Simple in-memory JSON fetch cache for the browser session.
// Use only for GET requests to public, mostly-static endpoints
// (e.g. menus, sliders, featured collections).

const jsonCache = new Map();

export const cachedJsonFetch = async (url, options = {}) => {
  const cacheKey = url;

  // Allow callers to opt-out of caching explicitly
  if (options && options.cache === 'no-cache') {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return res.json();
  }

  if (jsonCache.has(cacheKey)) {
    return jsonCache.get(cacheKey);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON response but received: ${text.slice(0,200)}`);
  }
  const data = await res.json();
  jsonCache.set(cacheKey, data);
  return data;
};


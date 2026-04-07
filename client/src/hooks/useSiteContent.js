import { useState, useEffect } from 'react';
import API from '../api/axios';

// Cache to avoid re-fetching within the same session
const _cache = {};

/**
 * Fetch a single site-content section.
 * Returns { data, loading } — data falls back to `fallback` until loaded.
 */
export function useSiteContent(section, fallback = {}) {
  const [data, setData]       = useState(_cache[section] || fallback);
  const [loading, setLoading] = useState(!_cache[section]);

  useEffect(() => {
    if (_cache[section]) { setData(_cache[section]); setLoading(false); return; }
    API.get(`/content/${section}`)
      .then((res) => {
        const d = res.data.data || fallback;
        _cache[section] = d;
        setData(d);
      })
      .catch(() => setData(fallback))
      .finally(() => setLoading(false));
  }, [section]); // eslint-disable-line

  return { data, loading };
}

/** Invalidate cache (call after admin saves content) */
export function invalidateContentCache(section) {
  if (section) delete _cache[section];
  else Object.keys(_cache).forEach((k) => delete _cache[k]);
}

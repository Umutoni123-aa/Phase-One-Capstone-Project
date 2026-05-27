const DEFAULT_SUBJECT = 'fiction'; 

const SUBJECTS_URL = 'https://openlibrary.org/subjects';
const SEARCH_URL   = 'https://openlibrary.org/search.json';

const HEADERS = { 'User-Agent': 'BookExplorerApp (student-project)' };

//Homepage load.

export async function fetchBySubject(subject = DEFAULT_SUBJECT, limit = 8) {
  const res = await fetch(`${SUBJECTS_URL}/${encodeURIComponent(subject)}.json?limit=${limit}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Subjects API ${res.status}`);
  const data = await res.json();
  return (data.works || []).map(normaliseWork);
}

//Search bar — Search API (flexible).

export async function fetchBySearch(query, limit = 8) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Search API ${res.status}`);
  const data = await res.json();
  return (data.docs || []).map(normaliseDoc);
}

export async function fetchSuggestions(query) {
  const url = `${SEARCH_URL}?title=${encodeURIComponent(query)}&limit=5&fields=key,title,author_name`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.docs || []).map(d => ({
    key: d.key,
    title: d.title || '',
    author: d.author_name?.[0] || '',
  }));
}

function coverUrl(id) {
  return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
}

function normaliseWork(w) {
  return {
    key:    w.key,
    title:  w.title  || 'Unknown Title',
    author: w.authors?.[0]?.name || 'Unknown Author',
    year:   w.first_publish_year || '—',
    cover:  coverUrl(w.cover_id),
  };
}

function normaliseDoc(d) {
  return {
    key:    d.key,
    title:  d.title  || 'Unknown Title',
    author: d.author_name?.[0] || 'Unknown Author',
    year:   d.first_publish_year || '—',
    cover:  coverUrl(d.cover_i),
  };
}

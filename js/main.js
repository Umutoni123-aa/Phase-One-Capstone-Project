import { fetchBySubject, fetchBySearch, fetchSuggestions } from './fetchBooks.js';
import { createBookCard } from './ui.js';

const grid        = document.getElementById('books-grid');
const loading     = document.getElementById('loading');
const noResults   = document.getElementById('no-results');
const searchBtn   = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');

// Render 

function renderBooks(books) {
  grid.innerHTML = '';
  if (books.length === 0) { noResults.classList.remove('hidden'); return; }
  noResults.classList.add('hidden');
  books.forEach(b => grid.appendChild(createBookCard(b)));
}

async function loadBooks(fetchFn) {
  loading.classList.remove('hidden');
  noResults.classList.add('hidden');
  grid.innerHTML = '';
  try {
    renderBooks(await fetchFn());
  } catch (e) {
    console.error(e);
    noResults.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

// Autocomplete 

let debounceTimer;

function showSuggestions(items) {
  suggestions.innerHTML = '';
  if (!items.length) { suggestions.classList.add('hidden'); return; }

  items.forEach(item => {
    const li = document.createElement('li');
    li.style.cssText = `
      padding:10px 16px; cursor:pointer; font-size:0.85rem;
      font-family:Inter,sans-serif; color:#1a1a2e;
      border-bottom:1px solid #f3f4f6;
      display:flex; flex-direction:column; gap:2px;
    `;

    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = '600';
    titleSpan.textContent = item.title;

    const authorSpan = document.createElement('span');
    authorSpan.style.cssText = 'font-size:0.72rem; color:#6b7280;';
    authorSpan.textContent = item.author;

    li.appendChild(titleSpan);
    li.appendChild(authorSpan);

    li.addEventListener('mousedown', () => {       
      searchInput.value = item.title;
      suggestions.classList.add('hidden');
      loadBooks(() => fetchBySearch(item.title));
    });

    suggestions.appendChild(li);
  });

  suggestions.classList.remove('hidden');
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (q.length < 1) { suggestions.classList.add('hidden'); return; }

  debounceTimer = setTimeout(async () => {
    const items = await fetchSuggestions(q);
    showSuggestions(items);
  }, 280);                 
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => suggestions.classList.add('hidden'), 150);
});

// Search

function doSearch() {
  const q = searchInput.value.trim();
  if (q) { suggestions.classList.add('hidden'); loadBooks(() => fetchBySearch(q)); }
}

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

// Initial load 

loadBooks(() => fetchBySubject());

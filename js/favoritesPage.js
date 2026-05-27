import { getFavorites } from './favorites.js';
import { createBookCard } from './ui.js';

const grid       = document.getElementById('favorites-grid');
const emptyState = document.getElementById('empty-state');

export function renderFavorites() {
  grid.innerHTML = '';
  const favorites = getFavorites();

  if (favorites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  favorites.forEach(book => {
    grid.appendChild(createBookCard(book, true, renderFavorites));
  });
}

renderFavorites();

const STORAGE_KEY = 'bookExplorerFavorites';

// Get all favorites from localStorage.
export function getFavorites() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFavorite(book) {
  const favorites = getFavorites();
  // Avoid duplicates
  const alreadyAdded = favorites.some((b) => b.key === book.key);
  if (!alreadyAdded) {
    favorites.push(book);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

// Remove a book from favorites by its key.
export function removeFavorite(bookKey) {
  const favorites = getFavorites().filter((b) => b.key !== bookKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

// Check if a book is already in favorites.
export function isFavorite(bookKey) {
  return getFavorites().some((b) => b.key === bookKey);
}

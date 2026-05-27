// ui.js — UI components and utilities

import { addFavorite, removeFavorite, isFavorite } from './favorites.js';

// Toast


export function showToast(message, type = 'success') {
  // Remove any existing toast first
  document.querySelector('.toast-msg')?.remove();

  const colours = {
    success: '#2d6a4f',
    info:    '#1a1a2e',
    warning: '#b45309',
  };

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = message;
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '24px',
    left:         '50%',
    transform:    'translateX(-50%) translateY(20px)',
    background:   colours[type] || colours.info,
    color:        '#fff',
    padding:      '10px 22px',
    borderRadius: '999px',
    fontSize:     '0.85rem',
    fontFamily:   'Inter, sans-serif',
    fontWeight:   '500',
    boxShadow:    '0 4px 20px rgba(0,0,0,0.18)',
    opacity:      '0',
    transition:   'opacity 0.25s ease, transform 0.25s ease',
    zIndex:       '9999',
    whiteSpace:   'nowrap',
  });

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Animate out after 2.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Placeholder for missing covers — generates a coloured block with title and author text

function buildPlaceholder(title, author) {
  const palettes = [
    { bg: '#1a1a2e', text: '#e8a045' },
    { bg: '#2d3561', text: '#a8dadc' },
    { bg: '#3d2b1f', text: '#e9c46a' },
    { bg: '#1b4332', text: '#95d5b2' },
    { bg: '#4a1942', text: '#f4acb7' },
    { bg: '#283618', text: '#dda15e' },
    { bg: '#03071e', text: '#f48c06' },
    { bg: '#370617', text: '#faa307' },
  ];
  const p = palettes[(title.charCodeAt(0) || 0) % palettes.length];
  const shortTitle  = title.length  > 36 ? title.slice(0, 34)  + '…' : title;
  const shortAuthor = author.length > 28 ? author.slice(0, 26) + '…' : author;

  // Returns a DOM element 
  const div = document.createElement('div');
  div.style.cssText = `
    width:100%; height:208px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; padding:16px;
    text-align:center; background:${p.bg};
  `;

  const titleEl = document.createElement('p');
  titleEl.style.cssText = `
    color:${p.text}; font-family:'Playfair Display',serif;
    font-size:0.9rem; font-weight:700; line-height:1.35;
    margin-bottom:6px; word-break:break-word;
  `;
  titleEl.textContent = shortTitle;

  const authorEl = document.createElement('p');
  authorEl.style.cssText = `
    color:rgba(255,255,255,0.55); font-family:'Inter',sans-serif;
    font-size:0.7rem;
  `;
  authorEl.textContent = shortAuthor;

  div.appendChild(titleEl);
  div.appendChild(authorEl);
  return div;
}

// Book Card
export function createBookCard(book, showRemove = false, onToggle = null) {
  const card = document.createElement('div');
  card.style.cssText = `
    background:#fff; border-radius:16px; overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:0 1px 6px rgba(0,0,0,0.07);
    transition:transform 0.2s ease, box-shadow 0.2s ease;
  `;
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)';
  });

  // Cover — DOM-built to avoid innerHTML escaping bugs
  if (book.cover) {
    const img = document.createElement('img');
    img.src   = book.cover;
    img.alt   = book.title + ' cover';
    img.style.cssText = 'width:100%; height:208px; object-fit:cover; display:block;';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.replaceWith(buildPlaceholder(book.title, book.author));
    });
    card.appendChild(img);
  } else {
    card.appendChild(buildPlaceholder(book.title, book.author));
  }

  // Info section
  const info = document.createElement('div');
  info.style.cssText = 'padding:14px 16px; display:flex; flex-direction:column; flex:1; gap:4px;';

  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `
    font-family:'Playfair Display',serif; font-size:0.95rem;
    font-weight:600; line-height:1.35; color:#1a1a2e;
    display:-webkit-box; -webkit-line-clamp:2;
    -webkit-box-orient:vertical; overflow:hidden;
  `;
  titleEl.textContent = book.title;

  const metaEl = document.createElement('p');
  metaEl.style.cssText = 'color:#6b7280; font-size:0.72rem; font-family:Inter,sans-serif;';
  metaEl.textContent = `${book.author} · ${book.year}`;

  // Button
  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'margin-top:auto; padding-top:10px;';

  const btn = document.createElement('button');
  const baseBtn = `
    width:100%; font-size:0.75rem; font-weight:600;
    font-family:Inter,sans-serif; padding:8px 12px;
    border-radius:8px; border:none; cursor:pointer;
    transition:background 0.2s, color 0.2s;
  `;

  function setFavStyle() {
    btn.style.cssText = baseBtn + 'background:#fef3c7; color:#92400e;';
    btn.textContent   = '+ Favourite';
  }
  function setSavedStyle() {
    btn.style.cssText = baseBtn + 'background:#d1fae5; color:#065f46; cursor:default;';
    btn.textContent   = ' Successfully Saved';
  }
  function setAlreadyStyle() {
    btn.style.cssText = baseBtn + 'background:#e0e7ff; color:#3730a3; cursor:default;';
    btn.textContent   = 'Already Saved';
  }
  function setRemoveStyle() {
    btn.style.cssText = baseBtn + 'background:#fee2e2; color:#991b1b;';
    btn.textContent   = ' Removed from Favourites';
  }

  if (showRemove) {
    setRemoveStyle();
    btn.addEventListener('click', () => {
      removeFavorite(book.key);
      showToast(`"${book.title}" removed from Favourites`, 'warning');
      if (onToggle) onToggle();
    });
  } else {
    // Homepage favourite button behaviour
    if (isFavorite(book.key)) {
      setSavedStyle();
      btn.disabled = true;
    } else {
      setFavStyle();
      btn.addEventListener('click', () => {
        addFavorite(book);

        // show "Saved" for 2 seconds
        setSavedStyle();
        btn.disabled = true;
        showToast(`"${book.title}" added to Favourites!`, 'success');

        // go back to "+ Favourite" but disabled (already saved)
        setTimeout(() => {
          setAlreadyStyle();
          // Re-enable so clicking again shows toast
          btn.disabled = false;
          btn.addEventListener('click', () => {
            showToast(`"${book.title}" is already in your Favourites`, 'info');
          }, { once: true });
        }, 2000);
      }, { once: true });
    }
  }

  btnWrap.appendChild(btn);
  info.appendChild(titleEl);
  info.appendChild(metaEl);
  info.appendChild(btnWrap);
  card.appendChild(info);

  return card;
}

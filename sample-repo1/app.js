// Birthday Gift Website JavaScript

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadWishes();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  const openBtn = document.getElementById('openBtn');
  const submitWishBtn = document.getElementById('submitWish');
  const giftBox = document.getElementById('giftBox');

  openBtn.addEventListener('click', openGift);
  giftBox.addEventListener('click', openGift);
  submitWishBtn.addEventListener('click', addWish);
  
  // Allow Enter key to submit wish
  document.getElementById('wishInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addWish();
    }
  });
}

// Open Gift Function
function openGift() {
  const giftContent = document.getElementById('giftContent');
  const openBtn = document.getElementById('openBtn');
  const giftBox = document.getElementById('giftBox');

  if (giftContent.classList.contains('hidden')) {
    giftContent.classList.remove('hidden');
    openBtn.textContent = 'Gift Opened! 🎉';
    openBtn.disabled = true;
    giftBox.style.animation = 'none';
    
    // Trigger confetti
    triggerConfetti();
  }
}

// Add Wish Function
function addWish() {
  const wishInput = document.getElementById('wishInput');
  const wishText = wishInput.value.trim();

  if (wishText === '') {
    alert('Please write a wish!');
    return;
  }

  // Get existing wishes
  let wishes = getWishes();

  // Create new wish object
  const wish = {
    id: Date.now(),
    text: wishText,
    timestamp: new Date().toLocaleString()
  };

  // Add to array
  wishes.unshift(wish);

  // Save to localStorage
  localStorage.setItem('birthday_wishes', JSON.stringify(wishes));

  // Clear input
  wishInput.value = '';

  // Re-render wishes
  renderWishes();
}

// Get Wishes from LocalStorage
function getWishes() {
  try {
    return JSON.parse(localStorage.getItem('birthday_wishes')) || [];
  } catch (e) {
    return [];
  }
}

// Load and Render Wishes
function loadWishes() {
  renderWishes();
}

function renderWishes() {
  const wishesList = document.getElementById('wishesList');
  const wishes = getWishes();

  if (wishes.length === 0) {
    wishesList.innerHTML = '<p class="empty-message">No wishes yet. Be the first to share!</p>';
    return;
  }

  wishesList.innerHTML = wishes.map(wish => `
    <div class="wish-item">
      <p style="margin: 0 0 5px 0;">${escapeHtml(wish.text)}</p>
      <small style="opacity: 0.7;">${wish.timestamp}</small>
      <button onclick="deleteWish(${wish.id})" style="float: right; background: none; border: none; color: #ff1493; cursor: pointer; font-size: 0.9rem;">Delete</button>
    </div>
  `).join('');
}

// Delete Wish
function deleteWish(id) {
  let wishes = getWishes();
  wishes = wishes.filter(w => w.id !== id);
  localStorage.setItem('birthday_wishes', JSON.stringify(wishes));
  renderWishes();
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Confetti Effect
function createConfetti() {
  const container = document.getElementById('confetti-container');
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.backgroundColor = ['#ff1493', '#ff69b4', '#ffd700', '#667eea', '#764ba2'][Math.floor(Math.random() * 5)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '0.7';
    confetti.style.pointerEvents = 'none';
    confetti.style.borderRadius = '50%';
    
    container.appendChild(confetti);
    
    animateConfetti(confetti);
  }
}

function animateConfetti(element) {
  let top = -10;
  let left = parseFloat(element.style.left);
  let velocity = Math.random() * 5 + 2;
  let drift = (Math.random() - 0.5) * 2;

  const animate = () => {
    top += velocity;
    left += drift;
    element.style.top = top + 'px';
    element.style.left = left + 'px';
    element.style.opacity = 1 - (top / window.innerHeight);

    if (top < window.innerHeight) {
      requestAnimationFrame(animate);
    } else {
      element.remove();
    }
  };

  animate();
}

function triggerConfetti() {
  createConfetti();
}

const API_URL = "https://script.google.com/macros/s/AKfycbwa3AAwInD7AbFg2MU9gw2Nnns5_RPPZ_qcX6-qJIEgZnapnbWm-lWfm-GGrh3UiqR9/exec";

// State Management
let state = {
  vocabulary: [],
  userStats: {
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    totalWords: 0,
    quizzesCompleted: 0,
    accuracy: 0
  },
  achievements: [],
  currentPage: 'dashboard',
  flashcardIndex: 0,
  quizScore: 0,
  quizQuestionIndex: 0,
  quizQuestions: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  setupNavigation();
  loadVocabulary();
  updateStats();
  setupEventListeners();
});

// Storage Functions
function loadFromStorage() {
  const savedState = localStorage.getItem('germanQuestState');
  if (savedState) {
    state = { ...state, ...JSON.parse(savedState) };
  }
}

function saveToStorage() {
  localStorage.setItem('germanQuestState', JSON.stringify(state));
}

// Navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  state.currentPage = page;
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Page-specific initialization
  if (page === 'vocabulary') {
    renderVocabulary();
  } else if (page === 'flashcards') {
    initFlashcards();
  } else if (page === 'quiz') {
    initQuiz();
  } else if (page === 'typing') {
    initTyping();
  } else if (page === 'memory') {
    initMemory();
  } else if (page === 'profile') {
    updateProfile();
  }
  
  saveToStorage();
}

// API Functions
async function loadVocabulary() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // Skip header row if present
    if (data.length > 0 && typeof data[0][0] === 'string') {
      state.vocabulary = data.slice(1).map(row => ({
        id: row[0],
        german: row[1],
        english: row[2],
        article: row[3],
        category: row[4],
        difficulty: row[5],
        learned: row[6]
      }));
    } else {
      state.vocabulary = data.map(row => ({
        id: row[0],
        german: row[1],
        english: row[2],
        article: row[3],
        category: row[4],
        difficulty: row[5],
        learned: row[6]
      }));
    }
    
    // Add sample vocabulary if empty
    if (state.vocabulary.length === 0) {
      state.vocabulary = getSampleVocabulary();
    }
    
    saveToStorage();
    updateStats();
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    // Use sample vocabulary on error
    state.vocabulary = getSampleVocabulary();
    saveToStorage();
  }
}

async function saveWord(data) {
  // Add to local state first
  const newWord = {
    id: Date.now(),
    ...data,
    learned: 'No'
  };
  state.vocabulary.push(newWord);
  state.userStats.totalWords++;
  addXP(5);
  saveToStorage();
  updateStats();
  
  // Use iframe method to bypass CORS
  try {
    const iframeName = 'google-sheets-iframe-' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = API_URL;
    form.target = iframeName;
    form.style.display = 'none';
    
    const germanInput = document.createElement('input');
    germanInput.type = 'hidden';
    germanInput.name = 'german';
    germanInput.value = data.german;
    form.appendChild(germanInput);
    
    const englishInput = document.createElement('input');
    englishInput.type = 'hidden';
    englishInput.name = 'english';
    englishInput.value = data.english;
    form.appendChild(englishInput);
    
    const articleInput = document.createElement('input');
    articleInput.type = 'hidden';
    articleInput.name = 'article';
    articleInput.value = data.article;
    form.appendChild(articleInput);
    
    const categoryInput = document.createElement('input');
    categoryInput.type = 'hidden';
    categoryInput.name = 'category';
    categoryInput.value = data.category;
    form.appendChild(categoryInput);
    
    const difficultyInput = document.createElement('input');
    difficultyInput.type = 'hidden';
    difficultyInput.name = 'difficulty';
    difficultyInput.value = data.difficulty;
    form.appendChild(difficultyInput);
    
    document.body.appendChild(form);
    form.submit();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 2000);
    
    showNotification('Word saved to Google Sheets!');
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    showNotification('Word saved locally (Google Sheets sync unavailable)');
  }
  
  return { status: 'success' };
}

function getSampleVocabulary() {
  return [
    { id: 1, german: 'Hund', english: 'Dog', article: 'der', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 2, german: 'Katze', english: 'Cat', article: 'die', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 3, german: 'Haus', english: 'House', article: 'das', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 4, german: 'Buch', english: 'Book', article: 'das', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 5, german: 'Auto', english: 'Car', article: 'das', category: 'Travel', difficulty: 'Easy', learned: 'No' },
    { id: 6, german: 'Wasser', english: 'Water', article: 'das', category: 'Food', difficulty: 'Easy', learned: 'No' },
    { id: 7, german: 'Brot', english: 'Bread', article: 'das', category: 'Food', difficulty: 'Easy', learned: 'No' },
    { id: 8, german: 'Freund', english: 'Friend', article: 'der', category: 'Family', difficulty: 'Medium', learned: 'No' },
    { id: 9, german: 'Schule', english: 'School', article: 'die', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 10, german: 'Arbeit', english: 'Work', article: 'die', category: 'Business', difficulty: 'Medium', learned: 'No' },
    { id: 11, german: 'von', english: 'from', article: '', category: 'General', difficulty: 'Easy', learned: 'No' },
    { id: 12, german: 'mit', english: 'with', article: '', category: 'General', difficulty: 'Easy', learned: 'No' }
  ];
}

// Vocabulary Management
function renderVocabulary() {
  const grid = document.getElementById('vocabulary-grid');
  const searchTerm = document.getElementById('search-vocab').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  const difficultyFilter = document.getElementById('difficulty-filter').value;
  
  let filtered = state.vocabulary.filter(word => {
    const matchesSearch = word.german.toLowerCase().includes(searchTerm) || 
                          word.english.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || word.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || word.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  grid.innerHTML = filtered.map(word => `
    <div class="vocab-card glass-card">
      <div class="vocab-card-header">
        <div>
          <div class="vocab-german">${word.german}</div>
          ${word.article ? `<div class="vocab-article">${word.article}</div>` : ''}
        </div>
        <button class="btn-secondary" onclick="toggleFavorite(${word.id})">⭐</button>
      </div>
      <div class="vocab-english">${word.english}</div>
      <div class="vocab-meta">
        <span class="vocab-badge">${word.category}</span>
        <span class="vocab-badge">${word.difficulty}</span>
      </div>
      <div class="vocab-actions">
        <button class="btn-secondary" onclick="editWord(${word.id})">Edit</button>
        <button class="btn-danger" onclick="deleteWord(${word.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function showAddWordModal() {
  document.getElementById('add-word-modal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function addWord(event) {
  event.preventDefault();
  
  const data = {
    german: document.getElementById('new-german').value,
    english: document.getElementById('new-english').value,
    article: document.getElementById('new-article').value,
    category: document.getElementById('new-category').value,
    difficulty: document.getElementById('new-difficulty').value
  };
  
  await saveWord(data);
  
  document.getElementById('add-word-form').reset();
  closeModal('add-word-modal');
  renderVocabulary();
  
  showNotification('Word added successfully!');
}

function deleteWord(id) {
  if (confirm('Are you sure you want to delete this word?')) {
    state.vocabulary = state.vocabulary.filter(w => w.id !== id);
    state.userStats.totalWords--;
    saveToStorage();
    renderVocabulary();
    updateStats();
    showNotification('Word deleted!');
  }
}

function editWord(id) {
  const word = state.vocabulary.find(w => w.id === id);
  if (word) {
    document.getElementById('new-german').value = word.german;
    document.getElementById('new-english').value = word.english;
    document.getElementById('new-article').value = word.article;
    document.getElementById('new-category').value = word.category;
    document.getElementById('new-difficulty').value = word.difficulty;
    
    // Remove old word
    state.vocabulary = state.vocabulary.filter(w => w.id !== id);
    
    showAddWordModal();
  }
}

function toggleFavorite(id) {
  showNotification('Added to favorites!');
}

// Flashcards
function initFlashcards() {
  state.flashcardIndex = 0;
  document.getElementById('flashcard-try-again').style.display = 'none';
  updateFlashcard();
}

function updateFlashcard() {
  const word = state.vocabulary[state.flashcardIndex];
  if (word) {
    document.getElementById('flashcard-german').textContent = word.german;
    document.getElementById('flashcard-article').textContent = word.article || '';
    document.getElementById('flashcard-english').textContent = word.english;
    document.getElementById('flashcard-category').textContent = word.category;
    document.getElementById('flashcard-progress').textContent = 
      `${state.flashcardIndex + 1} / ${state.vocabulary.length}`;
    
    // Show try again button at last card
    const tryAgainBtn = document.getElementById('flashcard-try-again');
    if (state.flashcardIndex === state.vocabulary.length - 1) {
      tryAgainBtn.style.display = 'inline-block';
    } else {
      tryAgainBtn.style.display = 'none';
    }
    
    // Reset flip
    document.getElementById('flashcard').classList.remove('flipped');
  }
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
  playSound('flip');
}

function nextCard() {
  if (state.flashcardIndex < state.vocabulary.length - 1) {
    state.flashcardIndex++;
    updateFlashcard();
  }
}

function previousCard() {
  if (state.flashcardIndex > 0) {
    state.flashcardIndex--;
    updateFlashcard();
  }
}

function shuffleCards() {
  state.vocabulary = state.vocabulary.sort(() => Math.random() - 0.5);
  state.flashcardIndex = 0;
  document.getElementById('flashcard-try-again').style.display = 'none';
  updateFlashcard();
  showNotification('Cards shuffled!');
}

function markCard(difficulty) {
  const xpMap = { hard: 2, medium: 5, easy: 10 };
  addXP(xpMap[difficulty]);
  nextCard();
  showNotification(`Marked as ${difficulty}! +${xpMap[difficulty]} XP`);
}

// Quiz
function initQuiz() {
  state.quizScore = 0;
  state.quizQuestionIndex = 0;
  state.quizQuestions = generateQuizQuestions();
  loadQuizQuestion();
}

function generateQuizQuestions() {
  const shuffled = [...state.vocabulary].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(10, shuffled.length)).map(word => {
    const wrongAnswers = state.vocabulary
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english);
    
    const options = [...wrongAnswers, word.english].sort(() => Math.random() - 0.5);
    
    return {
      word: word,
      correctAnswer: word.english,
      options: options
    };
  });
}

function loadQuizQuestion() {
  if (state.quizQuestionIndex >= state.quizQuestions.length) {
    endQuiz();
    return;
  }
  
  const question = state.quizQuestions[state.quizQuestionIndex];
  document.getElementById('quiz-word').textContent = question.word.article ? `${question.word.article} ${question.word.german}` : question.word.german;
  document.getElementById('quiz-progress').textContent = 
    `Question ${state.quizQuestionIndex + 1}/${state.quizQuestions.length}`;
  document.getElementById('quiz-score').textContent = `Score: ${state.quizScore}`;
  
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = question.options.map(option => `
    <button class="quiz-option" onclick="checkAnswer('${option}', '${question.correctAnswer}')">${option}</button>
  `).join('');
  
  document.getElementById('quiz-feedback').textContent = '';
}

function checkAnswer(selected, correct) {
  const feedback = document.getElementById('quiz-feedback');
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(opt => {
    opt.disabled = true;
    if (opt.textContent === correct) {
      opt.classList.add('correct');
    } else if (opt.textContent === selected && selected !== correct) {
      opt.classList.add('incorrect');
    }
  });
  
  if (selected === correct) {
    state.quizScore += 10;
    feedback.textContent = 'Correct! +10 XP';
    feedback.style.color = 'var(--accent-green)';
    addXP(10);
    playSound('correct');
    addParticleEffect(document.querySelector('.quiz-option.correct'), 'correct');
  } else {
    feedback.textContent = `Wrong! The answer was: ${correct}`;
    feedback.style.color = 'var(--accent-red)';
    playSound('wrong');
    addParticleEffect(document.querySelector('.quiz-option.incorrect'), 'wrong');
  }
  
  state.quizQuestionIndex++;
  
  setTimeout(() => {
    loadQuizQuestion();
  }, 1500);
}

function endQuiz() {
  const feedback = document.getElementById('quiz-feedback');
  document.getElementById('quiz-word').textContent = 'Quiz Complete!';
  document.getElementById('quiz-instruction').textContent = `Final Score: ${state.quizScore}`;
  document.getElementById('quiz-options').innerHTML = `
    <button class="btn-primary" onclick="initQuiz()">Try Again</button>
  `;
  
  state.userStats.quizzesCompleted++;
  state.userStats.accuracy = Math.round((state.quizScore / (state.quizQuestions.length * 10)) * 100);
  saveToStorage();
  updateStats();
  
  // Check for achievements
  if (state.quizScore === state.quizQuestions.length * 10) {
    unlockAchievement('perfect-score');
  }
  if (state.userStats.quizzesCompleted === 1) {
    unlockAchievement('first-quiz');
  }
}

// Gamification
function addXP(amount) {
  state.userStats.xp += amount;
  state.userStats.coins += Math.floor(amount / 2);
  
  // Level up every 100 XP
  const newLevel = Math.floor(state.userStats.xp / 100) + 1;
  if (newLevel > state.userStats.level) {
    state.userStats.level = newLevel;
    showNotification(`Level Up! You are now level ${newLevel}!`);
    playSound('levelup');
  }
  
  // Update streak
  updateStreak();
  
  saveToStorage();
  updateStats();
}

function updateStreak() {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem('lastActive');
  
  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive === yesterday.toDateString()) {
      state.userStats.streak++;
    } else if (lastActive !== today) {
      state.userStats.streak = 1;
    }
    
    localStorage.setItem('lastActive', today);
    
    // Check streak achievements
    if (state.userStats.streak >= 7) {
      unlockAchievement('7-day-streak');
    }
  }
}

function unlockAchievement(achievementId) {
  if (!state.achievements.includes(achievementId)) {
    state.achievements.push(achievementId);
    showNotification('Achievement Unlocked!');
    playSound('complete');
    saveToStorage();
  }
}

// Stats Update
function updateStats() {
  document.getElementById('xp-display').textContent = state.userStats.xp;
  document.getElementById('streak-display').textContent = state.userStats.streak;
  document.getElementById('coins-display').textContent = state.userStats.coins;
  document.getElementById('total-words').textContent = state.vocabulary.length;
  document.getElementById('accuracy').textContent = `${state.userStats.accuracy}%`;
  document.getElementById('level').textContent = state.userStats.level;
}

function updateProfile() {
  document.getElementById('profile-level').textContent = state.userStats.level;
  document.getElementById('profile-xp').textContent = state.userStats.xp;
  document.getElementById('profile-words').textContent = state.vocabulary.length;
  document.getElementById('profile-quizzes').textContent = state.userStats.quizzesCompleted;
  document.getElementById('profile-streak').textContent = state.userStats.streak;
  
  // Update achievements
  const achievementCards = document.querySelectorAll('.achievement-card');
  achievementCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes('first steps') && state.achievements.includes('first-quiz')) {
      card.classList.remove('locked');
    }
    if (title.includes('on fire') && state.achievements.includes('7-day-streak')) {
      card.classList.remove('locked');
    }
    if (title.includes('word collector') && state.vocabulary.length >= 100) {
      card.classList.remove('locked');
    }
    if (title.includes('perfect score') && state.achievements.includes('perfect-score')) {
      card.classList.remove('locked');
    }
  });
}

// Event Listeners
function setupEventListeners() {
  // Search and filter
  document.getElementById('search-vocab')?.addEventListener('input', renderVocabulary);
  document.getElementById('category-filter')?.addEventListener('change', renderVocabulary);
  document.getElementById('difficulty-filter')?.addEventListener('change', renderVocabulary);
  
  // Leaderboard tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In a real app, this would load different data
    });
  });
  
  // Close modal on outside click
  document.getElementById('add-word-modal').addEventListener('click', (e) => {
    if (e.target.id === 'add-word-modal') {
      closeModal('add-word-modal');
    }
  });
}

// Notifications
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Typing Challenge
let typingState = {
  words: [],
  currentIndex: 0,
  score: 0,
  timer: 0,
  timerInterval: null
};

function initTyping() {
  // Remove try again button if exists
  const existingBtn = document.getElementById('typing-try-again');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  // Show input and submit button
  document.getElementById('typing-input').style.display = 'block';
  document.getElementById('typing-submit-btn').style.display = 'block';
  
  typingState = {
    words: [...state.vocabulary].sort(() => Math.random() - 0.5).slice(0, 10),
    currentIndex: 0,
    score: 0,
    timer: 0,
    timerInterval: null
  };
  
  if (typingState.words.length === 0) {
    document.getElementById('typing-english-word').textContent = 'No words available';
    return;
  }
  
  loadTypingWord();
  startTypingTimer();
  
  const input = document.getElementById('typing-input');
  input.disabled = false;
  input.value = '';
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkTypingAnswer();
    }
  });
}

function loadTypingWord() {
  if (typingState.currentIndex >= typingState.words.length) {
    endTyping();
    return;
  }
  
  const word = typingState.words[typingState.currentIndex];
  document.getElementById('typing-english-word').textContent = word.english;
  document.getElementById('typing-input').value = '';
  document.getElementById('typing-feedback').textContent = '';
  document.getElementById('typing-feedback').className = 'typing-feedback';
  document.getElementById('typing-progress').textContent = `Word ${typingState.currentIndex + 1}/${typingState.words.length}`;
  document.getElementById('typing-score').textContent = `Score: ${typingState.score}`;
}

function checkTypingAnswer() {
  const input = document.getElementById('typing-input');
  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = typingState.words[typingState.currentIndex].german.toLowerCase();
  
  if (userAnswer === correctAnswer) {
    typingState.score += 15;
    document.getElementById('typing-feedback').textContent = 'Correct! +15 XP';
    document.getElementById('typing-feedback').className = 'typing-feedback correct';
    addXP(15);
    playSound('correct');
    addParticleEffect(document.getElementById('typing-input'), 'correct');
  } else {
    document.getElementById('typing-feedback').textContent = `Wrong! Correct answer: ${typingState.words[typingState.currentIndex].german}`;
    document.getElementById('typing-feedback').className = 'typing-feedback incorrect';
    playSound('wrong');
    addParticleEffect(document.getElementById('typing-input'), 'wrong');
  }
  
  typingState.currentIndex++;
  setTimeout(loadTypingWord, 1000);
}

function startTypingTimer() {
  typingState.timer = 0;
  typingState.timerInterval = setInterval(() => {
    typingState.timer++;
    document.getElementById('typing-timer').textContent = `Time: ${typingState.timer}s`;
  }, 1000);
}

function endTyping() {
  clearInterval(typingState.timerInterval);
  document.getElementById('typing-english-word').textContent = 'Typing Challenge Completed!';
  document.getElementById('typing-instruction').textContent = `Final Score: ${typingState.score} XP`;
  document.getElementById('typing-feedback').textContent = '';
  document.getElementById('typing-input').disabled = true;
  document.getElementById('typing-input').style.display = 'none';
  document.getElementById('typing-submit-btn').style.display = 'none';
  
  // Add try again button
  const container = document.querySelector('.typing-container');
  const existingBtn = document.getElementById('typing-try-again');
  if (!existingBtn) {
    const tryAgainBtn = document.createElement('button');
    tryAgainBtn.id = 'typing-try-again';
    tryAgainBtn.className = 'btn-primary';
    tryAgainBtn.textContent = 'Try Again';
    tryAgainBtn.onclick = initTyping;
    tryAgainBtn.style.marginTop = '1rem';
    container.appendChild(tryAgainBtn);
  }
  
  state.userStats.quizzesCompleted++;
  saveToStorage();
  updateStats();
}

// Memory Match
let memoryState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  isLocked: false
};

function initMemory() {
  if (state.vocabulary.length < 8) {
    document.getElementById('memory-grid').innerHTML = '<p>Need at least 8 words to play Memory Match!</p>';
    return;
  }
  
  // Hide try again button
  document.getElementById('memory-complete').style.display = 'none';
  
  const selectedWords = [...state.vocabulary].sort(() => Math.random() - 0.5).slice(0, 8);
  const cardPairs = [];
  
  selectedWords.forEach(word => {
    cardPairs.push({ id: word.id, type: 'german', content: word.german, pairId: word.id });
    cardPairs.push({ id: word.id + '_en', type: 'english', content: word.english, pairId: word.id });
  });
  
  memoryState = {
    cards: cardPairs.sort(() => Math.random() - 0.5),
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    isLocked: false
  };
  
  renderMemoryGrid();
  updateMemoryStats();
}

function renderMemoryGrid() {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = memoryState.cards.map((card, index) => `
    <div class="memory-card" data-index="${index}" onclick="flipMemoryCard(${index})">
      <div class="memory-card-content">${card.content}</div>
    </div>
  `).join('');
}

function flipMemoryCard(index) {
  if (memoryState.isLocked) return;
  
  const card = memoryState.cards[index];
  const cardElement = document.querySelector(`[data-index="${index}"]`);
  
  if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) return;
  
  cardElement.classList.add('flipped');
  playSound('flip');
  memoryState.flippedCards.push({ index, card });
  
  if (memoryState.flippedCards.length === 2) {
    memoryState.moves++;
    updateMemoryStats();
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  memoryState.isLocked = true;
  const [card1, card2] = memoryState.flippedCards;
  
  if (card1.card.pairId === card2.card.pairId && card1.card.type !== card2.card.type) {
    // Match found
    setTimeout(() => {
      document.querySelector(`[data-index="${card1.index}"]`).classList.add('matched');
      document.querySelector(`[data-index="${card2.index}"]`).classList.add('matched');
      playSound('match');
      memoryState.matchedPairs++;
      memoryState.flippedCards = [];
      memoryState.isLocked = false;
      updateMemoryStats();
      
      if (memoryState.matchedPairs === 8) {
        endMemory();
      }
    }, 500);
  } else {
    // No match
    setTimeout(() => {
      document.querySelector(`[data-index="${card1.index}"]`).classList.remove('flipped');
      document.querySelector(`[data-index="${card2.index}"]`).classList.remove('flipped');
      memoryState.flippedCards = [];
      memoryState.isLocked = false;
    }, 1000);
  }
}

function updateMemoryStats() {
  document.getElementById('memory-moves').textContent = `Moves: ${memoryState.moves}`;
  document.getElementById('memory-matches').textContent = `Matches: ${memoryState.matchedPairs}/8`;
}

function endMemory() {
  addXP(20);
  state.userStats.quizzesCompleted++;
  saveToStorage();
  updateStats();
  showNotification(`Memory Match Complete! ${memoryState.moves} moves - +20 XP`);
  playSound('complete');
  
  // Show try again button
  document.getElementById('memory-complete').style.display = 'block';
}

// Sound Effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'levelup':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'flip':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'match':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.45);
        oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  } catch (error) {
    console.log('Audio not supported or blocked');
  }
}

// Enhanced animations
function addParticleEffect(element, type) {
const rect = element.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
  
for (let i = 0; i < 10; i++) {
const particle = document.createElement('div');
particle.style.cssText = `
position: fixed;
width: 10px;
height: 10px;
background: ${type === 'correct' ? '#10b981' : type === 'wrong' ? '#ef4444' : '#7c3aed'};
border-radius: 50%;
pointer-events: none;
z-index: 9999;
left: ${centerX}px;
top: ${centerY}px;
`;
document.body.appendChild(particle);
  
const angle = (Math.PI * 2 * i) / 10;
const velocity = 100 + Math.random() * 100;
const vx = Math.cos(angle) * velocity;
const vy = Math.sin(angle) * velocity;
  
let x = centerX;
let y = centerY;
let opacity = 1;
  
const animate = () => {
x += vx * 0.016;
y += vy * 0.016;
opacity -= 0.02;
  
particle.style.left = x + 'px';
particle.style.top = y + 'px';
particle.style.opacity = opacity;
  
if (opacity > 0) {
requestAnimationFrame(animate);
} else {
particle.remove();
}
};
  
requestAnimationFrame(animate);
}
}

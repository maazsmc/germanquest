# German Quest 🇩🇪

A modern gamified German vocabulary learning website built with HTML, CSS, and vanilla JavaScript. Features Google Sheets integration for data persistence and a complete gamification system.

## Features

### 🎮 Game Modes
- **Multiple Choice Quiz** - Test your knowledge with randomized quizzes
- **Flashcards** - Interactive flip cards with difficulty rating
- **Typing Challenge** - Type the correct German translation (placeholder)
- **Memory Match** - Match German words with English (placeholder)

### 📚 Vocabulary Management
- Add, edit, and delete vocabulary words
- Search and filter by category/difficulty
- Favorite words for quick access
- Categories: General, Food, Travel, Business, Family
- Difficulty levels: Easy, Medium, Hard

### 🏆 Gamification
- **XP System** - Earn XP for learning activities
- **Levels** - Level up every 100 XP
- **Streaks** - Track daily learning streaks
- **Coins** - Earn coins alongside XP
- **Achievements** - Unlock badges for milestones

### 📊 Analytics
- Track total words learned
- Monitor quiz accuracy
- View quiz history
- Check daily activity

### 🎨 Design
- Premium dark UI with glassmorphism
- Neon purple/blue accents
- Smooth animations
- Gaming-style interface
- Fully responsive design
- Modern typography (Inter font)

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Google Sheets
- **Backend**: Google Apps Script
- **Storage**: LocalStorage for caching
- **No frameworks** - Pure vanilla JS implementation

## Project Structure

```
GermanQuest/
├── index.html          # Main application file
├── style.css           # Premium dark UI styles
├── script.js           # Core JavaScript functionality
├── assets/
│   ├── sounds/         # Sound effects (placeholder)
│   ├── images/         # Images (placeholder)
│   └── icons/          # Icons (placeholder)
├── pages/              # Additional pages (placeholder)
├── components/         # Reusable components (placeholder)
└── README.md           # This file
```

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet named "GermanQuestDB"
2. Create these tabs:
   - **Vocabulary**: ID, German, English, Article, Category, Difficulty, Learned
   - **UserStats**: Email, XP, Level, Coins, Streak
   - **QuizHistory**: Email, Word, Correct, Mode, Date

### 2. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project named "GermanQuestAPI"
3. Paste the following code:

```javascript
const sheet = SpreadsheetApp.openById("YOUR_SHEET_ID");

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const vocabSheet = sheet.getSheetByName("Vocabulary");
  
  vocabSheet.appendRow([
    new Date().getTime(),
    data.german,
    data.english,
    data.article,
    data.category,
    data.difficulty,
    "No"
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const vocabSheet = sheet.getSheetByName("Vocabulary");
  const data = vocabSheet.getDataRange().getValues();

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Replace `YOUR_SHEET_ID` with your Google Sheet ID
5. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
6. Copy the Web App URL

### 3. Configure the Website

1. Open `script.js`
2. Replace the `API_URL` with your Web App URL:

```javascript
const API_URL = "YOUR_APPS_SCRIPT_URL";
```

### 4. Run the Website

Simply open `index.html` in your web browser. No server required!

## Usage

### Adding Vocabulary
1. Navigate to the Vocabulary page
2. Click "+ Add Word"
3. Fill in the German word, English translation, article, category, and difficulty
4. Click "Add Word"

### Using Flashcards
1. Navigate to the Flashcards page
2. Click "Show Answer" to reveal the translation
3. Rate the card as Hard, Medium, or Easy
4. Use navigation buttons to move between cards
5. Click "Shuffle" to randomize the deck

### Taking Quizzes
1. Navigate to the Quiz page
2. Select the correct English translation for each German word
3. Earn 10 XP for each correct answer
4. Complete all 10 questions to see your final score

### Viewing Profile
1. Navigate to the Profile page
2. View your stats: XP, Level, Words Learned, Quizzes Completed, Streak
3. Check your achievement progress

## Gamification System

### XP Rewards
- Add word: +5 XP
- Flashcard (Easy): +10 XP
- Flashcard (Medium): +5 XP
- Flashcard (Hard): +2 XP
- Quiz correct answer: +10 XP

### Leveling
- Level up every 100 XP
- Higher levels unlock more features (future)

### Streaks
- Daily activity maintains streak
- 7-day streak unlocks "On Fire" achievement

### Achievements
- **First Steps**: Complete your first quiz
- **On Fire**: Reach a 7-day streak
- **Word Collector**: Learn 100 words
- **Perfect Score**: Get 100% on a quiz

## Customization

### Colors
Edit the CSS variables in `style.css`:

```css
:root {
  --bg-primary: #0f172a;
  --accent-purple: #7c3aed;
  --accent-blue: #3b82f6;
  /* ... more variables */
}
```

### Sample Vocabulary
The app includes 10 sample German words. Edit `getSampleVocabulary()` in `script.js` to customize.

## Future Enhancements

- [ ] Typing Challenge game mode
- [ ] Memory Match game mode
- [ ] Boss Battle mode
- [ ] Listening challenge (text-to-speech)
- [ ] Speaking challenge (speech recognition)
- [ ] AI example sentences
- [ ] AI tutor chatbot
- [ ] Smart recommendations
- [ ] Google Login integration
- [ ] Real-time multiplayer leaderboard
- [ ] Sound effects
- [ ] More achievements
- [ ] Daily challenges

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## License

This project is open source and available for educational purposes.

## Credits

Built with ❤️ using vanilla HTML, CSS, and JavaScript.
Design inspired by Duolingo, Discord, and modern gaming interfaces.

---

**Happy Learning! 🎓**

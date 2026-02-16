import { useState } from 'react';
import { Brain, Sparkles, Zap, Frown, Globe, Heart, TrendingUp, BookOpen, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VibeMatcher = ({ books, onVibeMatch }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [vibeResult, setVibeResult] = useState(null);

  // --- THE BRAIN: Vibe to Category Mapping ---
  const vibeMap = {
    // EMOTIONS -> CATEGORIES
    sad: ['Motivational', 'Psychology', 'Self-Help', 'Philosophy'],
    lonely: ['Fiction', 'Social Science', 'Philosophy'],
    angry: ['Psychology', 'Fiction', 'Management'],
    happy: ['Fiction', 'Adventure', 'Humor', 'Poetry'],
    excited: ['Sci-Fi', 'Adventure', 'Technology'],
    bored: ['Science', 'History', 'Biography', 'Art'],
    stressed: ['Health', 'Psychology', 'Religion', 'Mindfulness'],
    curious: ['Science', 'Technology', 'History', 'Philosophy'],
    
    // TOPICS -> CATEGORIES
    code: ['Coding', 'Technology', 'Computer Science', 'Engineering'],
    programming: ['Coding', 'Technology', 'Computer Science'],
    money: ['Business', 'Finance', 'Economics'],
    business: ['Business', 'Management', 'Finance'],
    love: ['Fiction', 'Romance', 'Poetry'],
    romance: ['Fiction', 'Romance'],
    space: ['Science', 'Astronomy', 'Sci-Fi'],
    universe: ['Science', 'Physics', 'Astronomy'],
    history: ['History', 'Politics', 'Biography'],
    math: ['Mathematics', 'Science', 'Engineering'],
    art: ['Art', 'Design', 'Photography'],
    study: ['Science', 'Engineering', 'Education'],
    exam: ['Education', 'Study Skills'],
    fitness: ['Health', 'Sports', 'Medicine']
  };

  const analyzeVibe = () => {
    if (!input) return;
    setAnalyzing(true);
    setVibeResult(null);

    // SIMULATED NEURAL PROCESSING
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const words = lowerInput.split(/\s+/); // Split sentence into words
      
      // 1. DETECT TARGET CATEGORIES based on words
      let targetCategories = new Set();
      
      words.forEach(word => {
        // Check if word matches our vibe map
        if (vibeMap[word]) {
          vibeMap[word].forEach(cat => targetCategories.add(cat));
        }
        // Also check exact category matches
        const exactCatMatch = books.find(b => b.category.toLowerCase() === word);
        if (exactCatMatch) targetCategories.add(exactCatMatch.category);
      });

      // 2. SCORING ALGORITHM for all 500 books
      let scoredBooks = books.map(book => {
        let score = 0;
        const bookTitle = book.title.toLowerCase();
        const bookCat = book.category.toLowerCase();
        const bookDesc = (book.description || '').toLowerCase();
        const bookAuthor = book.author.toLowerCase();

        // SCORE LOGIC:
        
        // A. Category Match (High Score)
        if (targetCategories.has(book.category)) {
          score += 50; 
        }

        // B. Title Keyword Match (Very High Score)
        words.forEach(w => {
          if (w.length > 2) { // Ignore small words like 'a', 'an'
            if (bookTitle.includes(w)) score += 40;
            if (bookCat.includes(w)) score += 30;
            if (bookDesc.includes(w)) score += 10;
            if (bookAuthor.includes(w)) score += 10;
          }
        });

        return { ...book, score };
      });

      // 3. SORT & PICK WINNER
      scoredBooks.sort((a, b) => b.score - a.score);
      
      const bestMatch = scoredBooks[0];
      const maxScore = bestMatch ? bestMatch.score : 0;

      // 4. DETERMINE VISUALS
      let detectedVibe = 'Neutral';
      let icon = <Globe className="w-8 h-8" />;
      let iconColor = "text-gray-500";

      if (maxScore > 80) {
        detectedVibe = 'Perfect Match';
        icon = <Sparkles className="w-8 h-8" />;
        iconColor = "text-purple-600";
      } else if (targetCategories.has('Motivational') || lowerInput.includes('sad')) {
        detectedVibe = 'Inspired';
        icon = <TrendingUp className="w-8 h-8" />;
        iconColor = "text-yellow-600";
      } else if (targetCategories.has('Coding')) {
        detectedVibe = 'Technical';
        icon = <Zap className="w-8 h-8" />;
        iconColor = "text-blue-600";
      } else if (targetCategories.has('Fiction')) {
        detectedVibe = 'Immersed';
        icon = <BookOpen className="w-8 h-8" />;
        iconColor = "text-green-600";
      } else if (targetCategories.has('Science')) {
        detectedVibe = 'Curious';
        icon = <Globe className="w-8 h-8" />;
        iconColor = "text-indigo-600";
      }

      // If score is 0, pick random fallback but vibe is "Mysterious"
      if (maxScore === 0 && books.length > 0) {
        const randomIndex = Math.floor(Math.random() * books.length);
        const randomBook = books[randomIndex];
        setVibeResult({
          book: randomBook,
          vibe: 'Mysterious',
          score: Math.floor(Math.random() * 20) + 10,
          icon: <Brain className="w-8 h-8 text-gray-500" />
        });
      } else if (bestMatch) {
        setVibeResult({
          book: bestMatch,
          vibe: detectedVibe,
          score: Math.min(99, maxScore), // Cap at 99
          icon: <div className={`p-2 bg-white dark:bg-gray-800 rounded-full ${iconColor}`}>{icon}</div>
        });
      }

      setAnalyzing(false);
    }, 1200); 
  };

  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`${cardBg} border rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Neural Vibe Matcher</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Type how you feel, we'll find the book.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyzeVibe()}
          placeholder="e.g. I feel lonely and want to learn coding..."
          className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button
          onClick={analyzeVibe}
          disabled={analyzing}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2"
        >
          {analyzing ? <Sparkles className="animate-spin" /> : 'Match Vibe'}
        </button>
      </div>

      {vibeResult && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-700/50 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
              {vibeResult.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                {vibeResult.vibe} Vibe • {vibeResult.score}% Match
              </p>
              <h4 className="font-bold text-gray-900 dark:text-white">{vibeResult.book.title}</h4>
              <p className="text-xs text-gray-500">{vibeResult.book.author} • {vibeResult.book.category}</p>
            </div>
          </div>
          <button 
            onClick={() => onVibeMatch(vibeResult.book._id)}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-600"
          >
            Read Now
          </button>
        </div>
      )}
    </div>
  );
};

export default VibeMatcher;
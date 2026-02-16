import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme } = useTheme();
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${bgClass} min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden`}>
      {/* Background Blobs for "Premium" Feel */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Icon */}
        <div className="inline-flex p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-6 animate-bounce">
          <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        {/* Headline */}
        <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight ${textMain}`}>
          Libro<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Sys</span>
        </h1>
        
        <p className={`text-xl md:text-2xl ${textSub} max-w-2xl mx-auto`}>
          The next-generation library management platform. <br className="hidden md:block" />
          Issue books, track history, and manage users effortlessly.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link 
            to="/books" 
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:-translate-y-1"
          >
            Browse Books <ArrowRight className="w-5 h-5" />
          </Link>
          
          {localStorage.getItem('token') ? (
            <Link 
              to="/dashboard" 
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-lg"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="bg-transparent border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 text-lg"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <FeatureCard icon={<Shield />} title="Secure" desc="Bank-grade security for user data." theme={theme} />
          <FeatureCard icon={<Zap />} title="Fast" desc="Instant search and issue tracking." theme={theme} />
          <FeatureCard icon={<Users />} title="Social" desc="Community-driven book recommendations." theme={theme} />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, theme }) => {
  const cardBg = theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-md border-gray-700' : 'bg-white/80 backdrop-blur-md border-gray-200';
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${cardBg} p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-4">
        {icon}
      </div>
      <h3 className={`text-xl font-bold ${textMain} mb-2`}>{title}</h3>
      <p className={textSub}>{desc}</p>
    </div>
  );
};

export default Home;

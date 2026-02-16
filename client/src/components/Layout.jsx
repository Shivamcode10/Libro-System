import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, BookOpen, Sun, Moon, Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-white/20 text-white shadow-inner scale-[0.97]"
      : "text-indigo-100 hover:text-white hover:bg-white/10 active:scale-95";

  const navBase = "sticky top-0 z-50 border-b transition-all duration-300";
  const navScrolled = theme === "dark" ? "bg-gray-900/95 backdrop-blur-lg shadow-2xl border-gray-800" : "bg-indigo-600/95 backdrop-blur-lg shadow-xl border-indigo-700";
  const navTop = theme === "dark" ? "bg-gray-900/70 backdrop-blur-md border-gray-800" : "bg-indigo-600/80 backdrop-blur-md border-indigo-600";

  // --- FIXED: Define links here to prevent iterable errors ---
  const navLinks = [
    { path: "/books", label: "Books" },
    { path: "/marketplace", label: "Marketplace" },
      { path: "/community", label: "Community" },
    { path: "/history", label: "History" },
    { path: "/profile", label: "Profile" }
  ];

  if (user?.role === "admin") {
    navLinks.push({ path: "/admin-dashboard", label: "Dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <nav className={`${navBase} ${scrolled ? navScrolled : navTop}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <div
              className="flex items-center gap-2 font-bold text-xl tracking-wider cursor-pointer transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate('/books')}
            >
              <BookOpen className="h-8 w-8" />
              <span className="hidden sm:inline">LibroSys</span>
            </div>

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-6 w-px bg-white/20 mx-2"></div>

              {/* THEME & USER */}
              <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="p-2 rounded-full transition-all hover:bg-white/20 active:scale-90" title="Toggle Theme">
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-indigo-400/50">
                  <span className="text-sm font-medium text-indigo-100">{user?.name}</span>
                  <button onClick={handleLogout} className="p-2 rounded-full transition-all hover:bg-red-500 hover:text-white active:scale-90" title="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
                
                {/* MOBILE LOGOUT ONLY */}
                <button onClick={handleLogout} className="sm:hidden p-2 rounded-full transition-all hover:bg-red-500 hover:text-white active:scale-90">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md text-white hover:bg-white/10">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-700 dark:bg-gray-900 border-t border-indigo-600 animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-white hover:bg-white/10 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>

      <footer className={`${theme === 'dark'
  ? 'bg-gray-900 border-t border-gray-800 text-gray-400'
  : 'bg-white border-t border-gray-200 text-gray-600'} py-8`}>

  <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-5">

    {/* Social Icons */}
    <div className="flex items-center gap-5">

      <a href="https://github.com/Shivamcode10" target="_blank" rel="noopener noreferrer"
        className="hover:scale-110 transition-transform hover:text-indigo-500">
        <Github className="w-5 h-5" />
      </a>

      <a href="https://www.linkedin.com/in/shivam-lahane-8a6baa203" target="_blank" rel="noopener noreferrer"
        className="hover:scale-110 transition-transform hover:text-blue-500">
        <Linkedin className="w-5 h-5" />
      </a>

      <a href="https://twitter.com/yourlink" target="_blank" rel="noopener noreferrer"
        className="hover:scale-110 transition-transform hover:text-sky-500">
        <Twitter className="w-5 h-5" />
      </a>

      <a href="https://instagram.com/yourlink" target="_blank" rel="noopener noreferrer"
        className="hover:scale-110 transition-transform hover:text-pink-500">
        <Instagram className="w-5 h-5" />
      </a>

      <a href="mailto:shivamlahane2210@gmail.com"
        className="hover:scale-110 transition-transform hover:text-red-500">
        <Mail className="w-5 h-5" />
      </a>

    </div>

    {/* Copyright */}
    <div className="text-center text-sm">
      &copy; {new Date().getFullYear()} <span className="font-semibold">LibroSys</span>. Built for Production.
    </div>

  </div>
</footer>


    </div>
  );
};

export default Layout;
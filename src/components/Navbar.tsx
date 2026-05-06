import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UtensilsCrossed, Search, Heart, Sun, Moon, LogOut, User as UserIcon, Plus, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, logout } from '../lib/firebase';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Recipes', href: '/recipes' },
  { name: 'Submit Recipe', href: '/submit' },
  { name: 'Drinks', href: '/drinks' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled || !isHome
          ? 'bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-gold/20 py-3 shadow-md'
          : 'bg-transparent border-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-ruby rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              DD
            </div>
            <span className={cn(
              "text-2xl font-serif font-black tracking-tight transition-colors",
              scrolled || !isHome ? "text-ruby dark:text-ruby" : "text-white"
            )}>
              دیسی دسترخوان
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[12px] font-black uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'transition-all duration-300 relative py-2',
                  location.pathname === link.href
                    ? (scrolled || !isHome ? 'text-ruby' : 'text-gold')
                    : (scrolled || !isHome ? 'text-coffee hover:text-ruby dark:text-dark-text dark:hover:text-ruby' : 'text-white hover:text-gold')
                )}
              >
                {link.name}
                {location.pathname === link.href && (
                  <motion.div 
                    layoutId="nav-underline"
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
                      scrolled || !isHome ? "bg-ruby" : "bg-gold"
                    )} 
                  />
                )}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-xl transition-all hover:scale-110",
                scrolled || !isHome ? "bg-ruby/5 text-ruby" : "bg-white/10 text-white"
              )}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/collections"
                  className={cn(
                    "p-2 rounded-xl transition-all hover:text-ruby",
                    scrolled || !isHome ? "text-coffee dark:text-dark-text" : "text-white"
                  )}
                  title="My Collections"
                >
                  <FolderHeart className="w-5 h-5" />
                </Link>
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ruby/5 dark:bg-white/5 border border-ruby/10 hover:border-ruby/30 transition-all"
                  title="My Profile"
                >
                  <span className={cn(
                    "font-bold text-[10px]",
                    scrolled || !isHome ? "text-coffee dark:text-dark-text" : "text-white"
                  )}>{user.displayName?.split(' ')[0]}</span>
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-full border border-ruby/20" alt="Avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-ruby/10 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-ruby" />
                    </div>
                  )}
                </Link>
                <button 
                  onClick={() => logout()}
                  className={cn(
                    "p-2 rounded-xl transition-all hover:text-ruby",
                    scrolled || !isHome ? "text-coffee dark:text-dark-text" : "text-white"
                  )}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold shadow-xl transition-all active:scale-95",
                  scrolled || !isHome 
                    ? "bg-ruby text-white hover:bg-coffee" 
                    : "bg-gold text-coffee hover:bg-white"
                )}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu and theme toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-xl transition-colors",
                scrolled || !isHome ? "text-coffee dark:text-dark-text" : "text-white"
              )}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                scrolled || !isHome ? "text-coffee hover:bg-gray-100 dark:text-dark-text dark:hover:bg-white/5" : "text-white hover:bg-white/10"
              )}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-dark-surface border-b border-gold/10 overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-4 pb-10 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-4 rounded-2xl text-lg font-bold transition-all text-right',
                    location.pathname === link.href
                      ? 'bg-ruby/5 text-ruby'
                      : 'text-coffee/70 dark:text-dark-text/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-ruby'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 px-4 flex flex-col gap-4">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl group"
                    >
                      <div className="flex items-center gap-3">
                        {user.photoURL && <img src={user.photoURL} className="w-10 h-10 rounded-full" alt="User" referrerPolicy="no-referrer" />}
                        <div className="text-right">
                          <div className="font-black text-coffee dark:text-dark-text group-hover:text-ruby transition-colors">{user.displayName}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-ruby/60 transition-colors">پروفائل دیکھیں</div>
                        </div>
                      </div>
                      <UserIcon className="w-5 h-5 text-ruby" />
                    </Link>
                    <Link 
                      to="/collections" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-4 bg-ruby/5 dark:bg-white/5 rounded-2xl group"
                    >
                      <span className="font-black text-coffee dark:text-dark-text group-hover:text-ruby transition-colors">میری کلیکشنز</span>
                      <FolderHeart className="w-5 h-5 text-ruby" />
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="w-full py-4 text-center text-ruby font-black text-sm uppercase tracking-widest hover:bg-ruby/5 rounded-2xl transition-all"
                    >
                      Log out
                    </button>
                </div>
              ) : (
                  <button 
                    onClick={() => { signInWithGoogle(); setIsOpen(false); }}
                    className="w-full py-4 bg-ruby text-white rounded-2xl font-black text-lg shadow-xl"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

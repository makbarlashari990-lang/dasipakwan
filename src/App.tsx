import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Drinks from './pages/Drinks';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import SubmitRecipe from './pages/SubmitRecipe';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <div className="min-h-screen bg-cream text-coffee font-sans selection:bg-ruby selection:text-white border-[8px] border-ruby relative dark:bg-dark-bg dark:text-dark-text transition-colors duration-300">
          <div className="fixed inset-0 pointer-events-none bg-motif z-0 dark:opacity-10" />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/drinks" element={<Drinks />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/submit" element={<SubmitRecipe />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collection/:id" element={<CollectionDetail />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
            <ScrollToTop />
          </div>
        </div>
      </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

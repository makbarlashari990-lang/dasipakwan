import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, ArrowRight, X, ChefHat as ChefIcon, Clock, Flame, Utensils, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recipes, Recipe } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';
import { cn } from '../lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const categoryDisplayNames: Record<string, string> = {
  'All': 'تمام',
  'Breakfast': 'ناشتہ',
  'Lunch': 'لنچ',
  'Dinner': 'ڈنر',
  'Street Food': 'اسٹریٹ فوڈ',
  'Desserts': 'میٹھا',
};

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Street Food', 'Desserts'] as const;

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'All';
type CookTimeRange = 'Any' | 'Under 30' | '30-60' | 'Over 60';

interface FilterState {
  difficulty: Difficulty;
  cookTimeRange: CookTimeRange;
  dietaryRestrictions: string[];
}

const DIETARY_OPTIONS = ['Spicy', 'Vegetarian', 'Gluten Free', 'Halal', 'Slow Cooked', 'Sweet'];

export default function Recipes() {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as typeof categories[number]) || 'All';
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1500);
  };
  
  const [filters, setFilters] = useState<FilterState>({
    difficulty: 'All',
    cookTimeRange: 'Any',
    dietaryRestrictions: [],
  });

  // Reset to first page when any filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, filters]);

  // Scroll to results when page changes
  useEffect(() => {
    if (currentPage > 1 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const toggleDietaryRestriction = (restriction: string) => {
    setFilters(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = filters.difficulty === 'All' || recipe.difficulty === filters.difficulty;
    
    let matchesCookTime = true;
    if (filters.cookTimeRange === 'Under 30') matchesCookTime = recipe.cookTimeMinutes < 30;
    else if (filters.cookTimeRange === '30-60') matchesCookTime = recipe.cookTimeMinutes >= 30 && recipe.cookTimeMinutes <= 60;
    else if (filters.cookTimeRange === 'Over 60') matchesCookTime = recipe.cookTimeMinutes > 60;

    const matchesDietary = filters.dietaryRestrictions.length === 0 || 
                          filters.dietaryRestrictions.every(r => recipe.dietaryRestrictions.includes(r));

    return matchesCategory && matchesSearch && matchesDifficulty && matchesCookTime && matchesDietary;
  });

  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
  const currentRecipes = filteredRecipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setFilters({
      difficulty: 'All',
      cookTimeRange: 'Any',
      dietaryRestrictions: [],
    });
  };

  return (
    <div className="pt-32 pb-24 text-right">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex flex-col md:flex-row-reverse md:items-end justify-between gap-8">
          <div className="text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4 justify-end"
            >
              <span className="w-8 h-px bg-ruby" /> ریسیپی والٹ
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-coffee dark:text-dark-text leading-tight">
              ہمارا لذیذ <br />
              <span className="text-ruby">مجموعہ</span>
            </h1>
          </div>
          
          <div className="flex-1 max-w-md w-full">
            <div className="relative group">
              <input
                type="text"
                placeholder="ریسیپی تلاش کریں..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-dark-surface border border-ruby/10 rounded-2xl py-4 pr-12 pl-6 focus:outline-none focus:ring-4 focus:ring-ruby/5 focus:border-ruby transition-all font-medium shadow-sm group-hover:shadow-md text-right dark:text-dark-text"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ruby transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-6">
        {/* Categories Row */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 flex-row-reverse">
          <div className="bg-coffee dark:bg-ruby text-white p-3 rounded-2xl ml-2 flex-shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-95 border border-ruby/5 whitespace-nowrap',
                activeCategory === category
                  ? 'bg-ruby text-white shadow-lg shadow-ruby/20'
                  : 'bg-white dark:bg-dark-surface text-coffee dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/5'
              )}
            >
              {categoryDisplayNames[category]}
            </button>
          ))}
          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className={cn(
              "mr-auto flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold border border-ruby/5 transition-all font-serif italic flex-row-reverse shadow-sm active:scale-95 flex-shrink-0",
              isFilterDrawerOpen || filters.difficulty !== 'All' || filters.cookTimeRange !== 'Any' || filters.dietaryRestrictions.length > 0
                ? "bg-ruby text-white"
                : "bg-white dark:bg-dark-surface text-coffee dark:text-dark-text hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
             <SlidersHorizontal className="w-4 h-4" /> مزید فلٹرز
             {(filters.difficulty !== 'All' || filters.cookTimeRange !== 'Any' || filters.dietaryRestrictions.length > 0) && (
               <span className="w-2 h-2 bg-gold rounded-full" />
             )}
          </button>
        </div>

        {/* Difficulty Row */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 flex-row-reverse border-t border-ruby/5 pt-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-ruby/40 ml-4 font-serif italic flex-shrink-0">مشکل کی سطح :</div>
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilters(prev => ({ ...prev, difficulty: d }))}
              className={cn(
                'px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border border-ruby/5 whitespace-nowrap',
                filters.difficulty === d
                  ? 'bg-coffee dark:bg-ruby text-white shadow-md'
                  : 'bg-white dark:bg-dark-surface text-coffee dark:text-dark-text hover:bg-ruby/5'
              )}
            >
              {d === 'All' ? 'تمام' : (d === 'Easy' ? 'آسان' : (d === 'Medium' ? 'متوسط' : 'مشکل'))}
            </button>
          ))}
        </div>

        {/* Dietary Prefs Row (New) */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 flex-row-reverse border-t border-ruby/5 pt-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-ruby/40 ml-4 font-serif italic flex-shrink-0">غذائی ترجیحات :</div>
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleDietaryRestriction(opt)}
              className={cn(
                'px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border border-ruby/5 whitespace-nowrap flex items-center gap-2 flex-row-reverse',
                filters.dietaryRestrictions.includes(opt)
                  ? 'bg-gold/20 border-gold text-coffee dark:text-dark-text shadow-sm'
                  : 'bg-white dark:bg-dark-surface text-coffee dark:text-dark-text hover:bg-ruby/5'
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                filters.dietaryRestrictions.includes(opt) 
                  ? "bg-gold border-gold" 
                  : "bg-transparent border-gray-300 dark:border-ruby/20"
              )}>
                {filters.dietaryRestrictions.includes(opt) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              {opt === 'Spicy' ? 'مرچوں والا' : 
               opt === 'Vegetarian' ? 'سبزی خور' : 
               opt === 'Gluten Free' ? 'گلوٹین فری' : 
               opt === 'Halal' ? 'حلال' : 
               opt === 'Slow Cooked' ? 'ہلکی آنچ' : 'میٹھا'}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-dark-surface z-[101] shadow-2xl flex flex-col p-8 text-right"
            >
              <div className="flex items-center justify-between mb-12 flex-row-reverse">
                <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text">ایڈوانسڈ فلٹرز</h2>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-3 hover:bg-ruby/10 rounded-2xl transition-colors text-ruby"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-12 pb-12">
                {/* Difficulty */}
                <section>
                  <div className="flex items-center gap-2 justify-end mb-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">مشکل کی سطح</span>
                    <ChefIcon className="w-4 h-4 text-ruby" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setFilters(prev => ({ ...prev, difficulty: d as Difficulty }))}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold transition-all",
                          filters.difficulty === d
                            ? "bg-ruby border-ruby text-white shadow-lg"
                            : "bg-gray-50 dark:bg-white/5 border-transparent text-coffee dark:text-dark-text hover:bg-gray-100"
                        )}
                      >
                        {d === 'All' ? 'تمام' : (d === 'Easy' ? 'آسان' : (d === 'Medium' ? 'متوسط' : 'مشکل'))}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Cook Time */}
                <section>
                  <div className="flex items-center gap-2 justify-end mb-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">پکانے کا وقت</span>
                    <Clock className="w-4 h-4 text-ruby" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Any', 'Under 30', '30-60', 'Over 60'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters(prev => ({ ...prev, cookTimeRange: t as CookTimeRange }))}
                        className={cn(
                          "py-4 rounded-xl border text-sm font-bold transition-all",
                          filters.cookTimeRange === t
                            ? "bg-ruby border-ruby text-white shadow-lg"
                            : "bg-gray-50 dark:bg-white/5 border-transparent text-coffee dark:text-dark-text hover:bg-gray-100"
                        )}
                      >
                        {t === 'Any' ? 'کوئی بھی' : (t === 'Under 30' ? '30 منٹ سے کم' : (t === '30-60' ? '30 سے 60 منٹ' : '60 منٹ سے زیادہ'))}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Dietary Restrictions */}
                <section>
                  <div className="flex items-center gap-2 justify-end mb-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">غذائی پابندیاں</span>
                    <Utensils className="w-4 h-4 text-ruby" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DIETARY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleDietaryRestriction(opt)}
                        className={cn(
                          "px-4 py-4 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3 flex-row-reverse",
                          filters.dietaryRestrictions.includes(opt)
                            ? "bg-ruby/5 border-ruby text-ruby"
                            : "bg-gray-50 dark:bg-white/5 border-transparent text-coffee dark:text-dark-text hover:bg-gray-100"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                          filters.dietaryRestrictions.includes(opt) 
                            ? "bg-ruby border-ruby shadow-[0_0_10px_rgba(224,30,90,0.3)]" 
                            : "bg-white dark:bg-dark-surface border-gray-300 dark:border-ruby/20"
                        )}>
                          {filters.dietaryRestrictions.includes(opt) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="flex-1 text-right">
                          {opt === 'Spicy' ? 'مرچوں والا' : 
                          opt === 'Vegetarian' ? 'سبزی خور' : 
                          opt === 'Gluten Free' ? 'گلوٹین فری' : 
                          opt === 'Halal' ? 'حلال' : 
                          opt === 'Slow Cooked' ? 'ہلکی آنچ' : 'میٹھا'}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="bg-ruby text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-ruby/20 hover:bg-coffee transition-all active:scale-95"
                >
                  فلٹرز لگائیں
                </button>
                <button 
                  onClick={clearFilters}
                  className="bg-gray-100 dark:bg-white/5 text-coffee dark:text-dark-text py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all active:scale-95"
                >
                  فلٹرز صاف کریں
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {currentRecipes.map((recipe, i) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={i} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-row-reverse items-center justify-center gap-2 py-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-ruby/10 text-ruby disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ruby hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex flex-row-reverse items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-12 h-12 rounded-xl font-bold transition-all active:scale-90 shadow-sm",
                        currentPage === pageNum
                          ? "bg-ruby text-white shadow-ruby/20"
                          : "bg-white dark:bg-dark-surface text-coffee dark:text-dark-text border border-ruby/5 hover:border-ruby/20"
                      )}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white dark:bg-dark-surface border border-ruby/10 text-ruby disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ruby hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-2">کوئی ریسیپی نہیں ملی</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium font-sans">اپنی کیٹیگری یا ایڈوانسڈ فلٹرز تبدیل کر کے دیکھیں۔</p>
            <button 
              onClick={clearFilters}
              className="mt-8 text-ruby font-bold underline underline-offset-4 decoration-gold/50"
            >
              تمام فلٹرز ختم کریں
            </button>
          </div>
        )}
      </div>

      {/* Newsletter / CTA omitted for brevity - keeping original structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-gold dark:bg-ruby rounded-[60px] p-8 md:p-16 flex flex-col lg:flex-row-reverse items-center justify-between gap-12 overflow-hidden relative group border-4 border-white dark:border-ruby/20 shadow-2xl">
          <div className="absolute inset-0 bg-motif opacity-5 pointer-events-none" />
          <div className="max-w-xl relative z-10 text-right text-coffee dark:text-dark-text">
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 leading-tight">ہر ہفتے نئی ریسیپیز اپنے <span className="text-ruby dark:text-gold">ان باکس</span> میں حاصل کریں!</h2>
            <p className="text-sm text-coffee/70 dark:text-dark-text/70 font-black mb-10 leading-relaxed uppercase tracking-widest">پاکستانی پکوانوں کا ہنر سیکھنے والے 50,000 سے زائد لوگوں میں شامل ہوں۔</p>
            
            {isSubscribed ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white/20 backdrop-blur-md rounded-3xl p-6 flex flex-row-reverse items-center justify-center gap-4 border border-white/30"
               >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                  <div className="text-right">
                     <div className="font-serif font-black text-xl mb-1 text-white">شکریہ!</div>
                     <div className="text-xs font-bold text-white/70">آپ کی رجسٹریشن مکمل ہو گئی ہے۔</div>
                  </div>
               </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row-reverse gap-4">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="اپنا ای میل درج کریں" 
                  className="flex-1 bg-white dark:bg-dark-surface rounded-full py-5 px-8 text-lg focus:outline-none shadow-xl focus:ring-4 focus:ring-ruby/10 transition-all text-right dark:text-dark-text"
                />
                <button 
                  disabled={isSubscribing}
                  className="bg-ruby dark:bg-gold text-white dark:text-coffee px-10 py-5 rounded-full font-bold text-lg hover:bg-coffee dark:hover:bg-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isSubscribing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'ابھی شامل ہوں'}
                </button>
              </form>
            )}
          </div>
          <motion.div 
            whileHover={{ rotate: -12, scale: 1.1 }}
            className="w-full lg:w-96 aspect-square bg-ruby dark:bg-gold rounded-[60px] flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-white dark:border-ruby/20"
          >
             <ChefIcon className="w-48 h-48 text-white/5 absolute -bottom-10 -left-10 rotate-12" />
             <div className="text-white dark:text-coffee text-center p-8">
                <div className="text-7xl mb-4 italic">DD</div>
                <h4 className="text-2xl font-serif font-black mb-2">کوکنگ ٹپس</h4>
                <p className="text-xs text-white/70 dark:text-coffee/70 font-black uppercase tracking-[0.2em]">خاص طور پر ہمارے ممبرز کے لیے</p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

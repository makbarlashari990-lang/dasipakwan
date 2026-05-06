import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, Clock, Users, Play, Search, ChefHat, Instagram, Star, CheckCircle2, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recipes, drinks } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

const categories = [
  { name: 'ناشتہ', id: 'Breakfast', icon: '🍳', count: '12+ ریسیپیز' },
  { name: 'لنچ', id: 'Lunch', icon: '🍲', count: '45+ ریسیپیز' },
  { name: 'ڈنر', id: 'Dinner', icon: '🥘', count: '30+ ریسیپیز' },
  { name: 'اسٹریٹ فوڈ', id: 'Street Food', icon: '🌯', count: '25+ ریسیپیز' },
  { name: 'میٹھا', id: 'Desserts', icon: '🍰', count: '18+ ریسیپیز' },
];

export default function Home() {
  const featuredRecipes = recipes.filter(r => r.featured);
  const trendingRecipes = recipes.filter(r => r.trending);
  
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

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

  const [selectedSocial, setSelectedSocial] = useState<string | null>(null);

  const socialImages = [
    'https://images.unsplash.com/photo-1549467720-df33ad3b6649?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606471679030-22c608bd7cd6?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601050690597-df056fb36793?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=1900&auto=format&fit=crop'
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2072&auto=format&fit=crop"
            alt="Pakistani Food Spread"
            className="w-full h-full object-cover transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full text-right">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white py-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6 text-gold font-bold uppercase tracking-[0.3em] text-xs justify-end"
            >
              اصلی ذائقے کا تجربہ کریں
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-serif font-black mb-8 leading-[1.1] tracking-tight">
              <span className="text-ruby">دیسی</span> دسترخوان <br />
              میں خوش آمدید
            </h1>
            
            <p className="text-lg text-white/80 mb-10 leading-relaxed font-medium max-w-md mr-auto opacity-90">
              پاکستان کے بھرپور پکوانوں کا سفر۔ لاہور کی مسالہ منڈیوں سے کراچی کے اسٹریٹ فوڈ تک۔
            </p>

            <div className="flex flex-col sm:flex-row-reverse gap-4 mb-10">
              <Link to="/recipes" className="bg-ruby text-white px-8 py-4 rounded-full font-bold text-base hover:bg-ruby/90 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-ruby/40 active:scale-95 group">
                ریسیپیز تلاش کریں <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
              </Link>
            </div>

            <div className="flex items-center gap-4 justify-end">
              <p className="text-xs font-medium text-white/70"><span className="font-bold text-gold">12,000</span> سے زائد شائقین میں شامل ہوں</p>
              <div className="flex -space-x-3 flex-row-reverse space-x-reverse">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-ruby shadow-xl bg-gray-600 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Featured dish on right (reduced size for zoom-out feel) */}
        <div className="absolute left-10 xl:left-20 top-1/2 -translate-y-1/2 z-20 hidden lg:block w-[380px]">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            className="w-full aspect-square bg-gold/5 rounded-[50px] relative overflow-hidden border-4 border-white shadow-2xl"
           >
              <img 
               src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800" 
               className="w-full h-full object-cover" 
               alt="Featured" 
               referrerPolicy="no-referrer"
            />
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-r-4 border-ruby text-right">
                 <h3 className="font-serif text-xl font-bold mb-1 text-coffee">سندھی بیف بریانی</h3>
                 <div className="flex justify-between text-[9px] font-black text-gold uppercase tracking-widest flex-row-reverse">
                    <span>45 منٹ</span>
                    <span>•</span>
                    <span>6 افراد</span>
                    <span>•</span>
                    <span>متوسط تیز</span>
                 </div>
              </div>
           </motion.div>
           <div className="absolute -top-6 -left-6 w-24 h-24 bg-ruby rounded-full flex items-center justify-center text-white border-4 border-cream shadow-2xl animate-pulse">
              <div className="text-center">
                 <span className="block text-[8px] uppercase font-black tracking-widest leading-none mb-1">مقبول</span>
                 <span className="block text-base font-black">ریسیپی</span>
              </div>
           </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-cream/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row-reverse md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl text-right">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-coffee leading-tight">خاص پکوان</h3>
            </div>
            <Link to="/recipes" className="text-ruby font-bold text-xs underline underline-offset-4 hover:text-ruby/70 transition-colors uppercase tracking-widest">
              تمام کیٹیگریز دیکھیں
            </Link>
          </div>

          {/* New Active Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/recipes?category=${cat.id}`}
                className="bg-white dark:bg-dark-surface p-8 rounded-[40px] shadow-xl border border-ruby/5 text-center group hover:bg-ruby hover:text-white transition-all active:scale-95"
              >
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{cat.icon}</div>
                <h4 className="font-serif font-black text-xl mb-1">{cat.name}</h4>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 group-hover:opacity-100">{cat.count}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredRecipes.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Drink Highlight Bento */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-4 rounded-[50px] overflow-hidden relative min-h-[420px] border-4 border-white shadow-xl">
               <img 
                 src="https://images.unsplash.com/photo-1550506389-e9977585fdd2?q=80&w=2070&auto=format&fit=crop" 
                 className="w-full h-full object-cover" 
                 alt="Lassi" 
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-l from-ruby/50 to-transparent" />
               <div className="absolute inset-y-0 right-0 p-10 md:p-16 flex flex-col justify-center max-w-xl text-white text-right">
                  <span className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-3">گرمیوں کا تحفہ</span>
                  <h2 className="text-4xl font-serif font-black mb-6 leading-tight">خالص <br /> پنجابی لسی</h2>
                  <p className="text-base font-medium text-white/80 mb-8">گاڑھی، ملائی دار اور مٹی کے برتنوں میں ٹھنڈی کی گئی۔ ایک ایسی روایت جو کبھی ختم نہیں ہوتی۔</p>
                  <Link to="/drinks" className="bg-white text-ruby px-8 py-4 rounded-full font-bold text-base hover:bg-gold hover:text-white transition-all w-fit shadow-xl mr-auto">
                    مشروبات دیکھیں
                  </Link>
               </div>
            </div>
            <Link 
              to="/drinks"
              className="bg-ruby rounded-[50px] p-8 flex flex-col justify-center items-center text-white shadow-xl border-4 border-white group cursor-pointer relative overflow-hidden active:scale-95 transition-all"
            >
               <div className="absolute inset-0 opacity-10 pointer-events-none bg-motif" />
               <span className="text-[10px] uppercase opacity-75 mb-1 font-bold tracking-widest text-center">مشروبات کی خاصیت</span>
               <h4 className="font-serif text-2xl font-bold mb-4 italic text-center leading-tight">خاص <br /> روح افزا</h4>
               <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🥤</div>
            </Link>
         </div>
      </section>

      {/* Social Highlights */}
      <section className="py-24 bg-[#2D2424] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <Instagram className="w-12 h-12 text-gold mx-auto mb-6" />
           <h2 className="text-3xl md:text-5xl font-serif font-black mb-12">ہماری فوڈی کمیونٹی میں شامل ہوں <br /><span className="text-gold">@DesiDastarkhwan</span></h2>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {socialImages.map((img, i) => (
                <motion.div 
                  key={i} 
                  layoutId={`social-${i}`}
                  onClick={() => setSelectedSocial(img)}
                  className="aspect-square relative group overflow-hidden rounded-3xl border-2 border-white/10 cursor-pointer"
                >
                   <img 
                      src={img} 
                      alt="Social img" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-ruby/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Instagram className="w-8 h-8" />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Social Preview Modal */}
      <AnimatePresence>
        {selectedSocial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSocial(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full aspect-square rounded-[60px] overflow-hidden shadow-2xl border-4 border-white/20"
            >
              <img src={selectedSocial} className="w-full h-full object-cover" alt="Full Preview" />
              <button 
                onClick={() => setSelectedSocial(null)}
                className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-ruby text-white rounded-full backdrop-blur-md transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

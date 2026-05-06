import { motion } from 'motion/react';
import { recipes, drinks } from '../data/recipes';
import { ArrowRight, Star, Heart, Info } from 'lucide-react';

export default function Drinks() {
  return (
    <div className="pt-32 pb-24 text-right">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
         <div className="max-w-3xl ml-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4 justify-end"
            >
              <span className="w-8 h-px bg-ruby" /> پیاس بجھانے والے مشروبات
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-serif font-black text-coffee leading-tight mb-8">
              مشروبات کا <br />
              <span className="text-ruby">کونہ</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              پاکستان کی فرحت بخش روح کا تجربہ کریں۔ ہمارے منتخب کردہ روایتی اور جدید مشروبات آپ کو ایک تازہ احساس دیں گے اور ہر مسالہ دار کھانے کے ذائقے کو دوبالا کریں گے۔
            </p>
         </div>
      </div>

      {/* Featured Drinks Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {drinks.map((drink, i) => (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-[50px] p-6 shadow-xl shadow-ruby/5 border border-ruby/5 overflow-hidden text-right"
              >
                  <div className="relative aspect-square overflow-hidden rounded-[40px] mb-8 border-4 border-white shadow-lg">
                      <img 
                        src={drink.image} 
                        alt={drink.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-ruby shadow-xl hover:bg-ruby hover:text-white transition-colors cursor-pointer">
                         <Heart className="w-5 h-5" />
                      </div>
                  </div>
                  
                  <div className="px-4 pb-4">
                     <div className="flex items-center gap-1 text-gold mb-3 justify-end">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <h3 className="text-3xl font-serif font-bold text-coffee mb-4 group-hover:text-ruby transition-colors">{drink.title}</h3>
                     <p className="text-gray-500 font-medium leading-relaxed mb-8">{drink.description}</p>
                     
                     <div className="flex items-center justify-between pt-6 border-t border-gold/10 flex-row-reverse">
                        <button className="flex items-center gap-2 bg-cream text-coffee px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-ruby hover:text-white transition-all shadow-sm flex-row-reverse">
                           <Info className="w-4 h-4" /> فوری دیکھیں
                        </button>
                        <button className="flex items-center gap-2 text-ruby font-bold text-sm hover:gap-4 transition-all flex-row-reverse">
                           <ArrowRight className="w-5 h-5 rotate-180" /> ریسیپی حاصل کریں
                        </button>
                     </div>
                  </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Special Feature */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-coffee rounded-[60px] overflow-hidden flex flex-col lg:flex-row-reverse items-center relative border-4 border-white shadow-2xl">
            <div className="absolute inset-0 bg-motif opacity-5 pointer-events-none" />
            <div className="flex-1 p-10 md:p-20 relative z-10 text-right">
               <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-8 leading-tight italic">اصلی <br /><span className="text-gold">دودھ پتی</span> چائے</h2>
               <p className="text-white/70 text-lg leading-relaxed font-medium mb-12">
                  پاکستانی مشروبات کی بے تاج بادشاہ۔ خالص دودھ، چائے کی پتی اور الائچی کے بہترین امتزاج سے کڑک چائے بنانے کا ہنر سیکھیں۔
               </p>
               <button className="bg-ruby text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gold hover:text-coffee transition-all shadow-2xl shadow-black/40 active:scale-95">
                  بنانے کا طریقہ دیکھیں
               </button>
            </div>
            <div className="flex-1 w-full lg:h-[600px] relative">
               <img 
                src="https://images.unsplash.com/photo-1544787210-2211d6e90a0d?q=80&w=1974&auto=format&fit=crop" 
                className="w-full h-full object-cover" 
                alt="Chai" 
                referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-l from-coffee via-transparent to-transparent lg:hidden" />
            </div>
         </div>
      </div>
    </div>
  );
}

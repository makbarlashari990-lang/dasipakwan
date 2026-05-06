import { motion } from 'motion/react';
import { Heart, Users, Globe, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
               <div className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4 justify-end">
                 ہمارا ورثہ <span className="w-8 h-px bg-ruby" />
               </div>
               <h1 className="text-5xl md:text-7xl font-serif font-black text-coffee mb-10 leading-tight">
                 دیسی دسترخوان <br />
                 <span className="text-ruby">کی کہانی</span>
               </h1>
               <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8 italic">
                 پاکستان میں کھانا صرف پیٹ بھرنے کا ذریعہ نہیں بلکہ یہ زندگی، خاندان اور تاریخ کا جشن ہے۔ لفظ <strong>'دسترخوان'</strong> اس روایتی کپڑے یا جگہ کو کہتے ہیں جہاں سب مل کر کھانا کھاتے ہیں۔
               </p>
               <p className="text-lg text-gray-500 font-medium leading-relaxed mb-12">
                 ہمارا مشن پاکستانی پکوانوں کی اصلی تکنیکوں اور ذائقوں کو محفوظ بنانا ہے۔ ہم دھیمی آنچ پر کھانا پکانے، بہترین مہمان نوازی اور ہاتھ سے پسے ہوئے مصالحوں کے جادو پر یقین رکھتے ہیں۔
               </p>
               
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 bg-white rounded-[40px] border border-ruby/5 shadow-xl shadow-ruby/5 group hover:border-ruby/20 transition-all text-center">
                     <Heart className="w-10 h-10 text-ruby mb-6 group-hover:scale-110 transition-transform mx-auto" />
                     <h4 className="text-xl font-serif font-black mb-2">لگن</h4>
                     <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">محبت سے سرشار</p>
                  </div>
                  <div className="p-8 bg-white rounded-[40px] border border-ruby/5 shadow-xl shadow-ruby/5 group hover:border-ruby/20 transition-all text-center">
                     <Award className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform mx-auto" />
                     <h4 className="text-xl font-serif font-black mb-2">اصلیت</h4>
                     <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">خاندانی ریسیپیز</p>
                  </div>
               </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
               <div className="relative z-10 rounded-[80px] overflow-hidden shadow-2xl rotate-3 border-4 border-white">
                  <img src="https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=2070&auto=format&fit=crop" className="w-full aspect-square object-cover" alt="Heritage food" />
               </div>
               <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gold rounded-full z-0 flex items-center justify-center p-10 rotate-12 shadow-2xl border-4 border-cream text-center">
                  <div>
                     <div className="text-4xl font-serif font-black text-ruby mb-2 italic">ہمارا ورثہ</div>
                     <div className="text-xs font-black uppercase tracking-[0.2em] text-coffee/60">پاکستان کے مصالحے</div>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Stats */}
      <div className="bg-ruby py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-motif opacity-5 pointer-events-none" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
               <div>
                  <div className="text-6xl font-serif font-black mb-4 text-gold italic">15+</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60 text-center">تحقیق کے سال</div>
               </div>
               <div>
                  <div className="text-6xl font-serif font-black mb-4 text-gold italic">500+</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60 text-center">آزمودہ ریسیپیز</div>
               </div>
               <div>
                  <div className="text-6xl font-serif font-black mb-4 text-gold italic">1M+</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60 text-center">خوش کک</div>
               </div>
               <div>
                  <div className="text-6xl font-serif font-black mb-4 text-gold italic">24/7</div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-60 text-center">مصالحوں کی اپ ڈیٹس</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

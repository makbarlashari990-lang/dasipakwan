import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, User, Clock, X, MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';

const posts = [
  {
    id: 1,
    title: 'بہترین بریانی کی خوشبو کے 5 راز',
    excerpt: 'کیا آپ نے کبھی سوچا ہے کہ ریسٹورنٹ کی بریانی کی خوشبو اتنی اچھی کیوں ہوتی ہے؟ یہ سب دم اور مصالحوں کے صحیح وقت کا کمال ہے...',
    category: 'کوکنگ ٹپس',
    date: '12 مئی، 2024',
    author: 'شیف عائشہ',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=2020&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'ہلدی کے 10 بہترین طبی فوائد',
    excerpt: 'ہلدی مشرق کا سنہرا مصالحہ ہے۔ جانیں کہ یہ بیماریوں کے خلاف قوت مدافعت اور سوزش میں کیسے مدد کرتی ہے...',
    category: 'صحت کی ٹپس',
    date: '10 مئی، 2024',
    author: 'ڈاکٹر سمیر',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'لاہور کی بہترین نہاری کا گائیڈ',
    excerpt: 'پھجا سے لے کر وارث تک، ہم نے والڈ سٹی کی تنگ گلیوں میں گھوم کر بہترین نہاری تلاش کی ہے...',
    category: 'کچن ہیکس',
    date: '08 مئی، 2024',
    author: 'حمزہ خان',
    image: 'https://images.unsplash.com/photo-1545244102-1482f3ed062b?q=80&w=1974&auto=format&fit=crop'
  }
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center justify-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4"
         >
           <span className="w-8 h-px bg-ruby" /> فکر و نظر
         </motion.div>
         <h1 className="text-5xl md:text-7xl font-serif font-black text-coffee mb-8">پکوانوں کی <span className="text-ruby">کہانیاں</span></h1>
         <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">پاکستانی کچن کے دل سے معلومات، ٹپس اور ورثے کی کہانیاں۔</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer bg-white p-6 rounded-[50px] shadow-xl border border-ruby/5 text-right"
              >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[40px] mb-8 shadow-inner border-4 border-white">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                         <span className="bg-ruby text-white text-[10px] uppercase font-black px-4 py-1.5 rounded-full shadow-lg">
                            {post.category}
                         </span>
                      </div>
                  </div>
                  <div className="px-2">
                     <div className="flex items-center gap-4 text-[10px] text-gold font-bold uppercase tracking-widest mb-4 flex-row-reverse justify-start">
                        <div className="flex items-center gap-1.5 flex-row-reverse"><Calendar className="w-3.5 h-3.5" /> {post.date}</div>
                        <div className="flex items-center gap-1.5 flex-row-reverse"><User className="w-3.5 h-3.5" /> {post.author}</div>
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-coffee mb-4 group-hover:text-ruby transition-colors leading-tight">
                        {post.title}
                     </h3>
                     <p className="text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                     </p>
                     <div className="flex items-center gap-2 text-ruby font-bold group-hover:gap-4 transition-all uppercase tracking-widest text-xs flex-row-reverse justify-start">
                        <ArrowRight className="w-5 h-5 rotate-180" /> کہانی پڑھیں
                     </div>
                  </div>
              </motion.article>
            ))}
         </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-dark-surface rounded-[50px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] text-right"
            >
               <div className="w-full md:w-1/2 relative bg-gray-100 h-64 md:h-full">
                  <img src={selectedPost.image} className="w-full h-full object-cover" alt="Post" />
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-6 right-6 p-4 bg-white/20 hover:bg-ruby text-white rounded-2xl backdrop-blur-md md:hidden"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col">
                  <div className="hidden md:flex justify-between items-center mb-10 flex-row-reverse">
                    <button onClick={() => setSelectedPost(null)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-ruby transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                    <div className="flex gap-4">
                      <button className="p-3 bg-ruby/5 text-ruby rounded-2xl hover:bg-ruby hover:text-white transition-all"><Share2 className="w-5 h-5" /></button>
                      <button className="p-3 bg-ruby/5 text-ruby rounded-2xl hover:bg-ruby hover:text-white transition-all"><MessageSquare className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-ruby font-black tracking-widest uppercase text-[10px] mb-4 justify-end">
                    {selectedPost.category} <span className="w-6 h-px bg-ruby" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-coffee dark:text-dark-text mb-6">{selectedPost.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-10 border-b border-gray-100 dark:border-white/5 pb-6 justify-end">
                    <div className="text-right">
                       <div className="font-bold text-coffee dark:text-dark-text text-sm">{selectedPost.author}</div>
                       <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedPost.date}</div>
                    </div>
                    <div className="w-12 h-12 bg-ruby/10 rounded-2xl flex items-center justify-center text-ruby">
                       <User className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-6 text-gray-600 dark:text-dark-text/70 text-lg leading-relaxed font-medium">
                     <p>{selectedPost.excerpt}</p>
                     <p>یہ بلاگ ابھی مکمل لکھا جا رہا ہے۔ پاکستانی پکوانوں کے مزید دلچسپ حقائق اور کہانیاں جاننے کے لیے ہمارے ساتھ جڑے رہیں۔</p>
                     <p>کچن کے روایتی ہیکس اور دادی اماں کے ٹوٹکے جلد ہی اس آرٹیکل کا حصہ بنیں گے۔</p>
                  </div>
                  
                  <div className="mt-12 bg-gold/5 p-8 rounded-[40px] border border-gold/10 text-center">
                     <h4 className="font-serif font-black text-coffee dark:text-dark-text mb-2">کیا آپ کو یہ تحریر پسند آئی؟</h4>
                     <p className="text-xs text-gray-500 mb-6">نیوز لیٹر جوائن کریں اور کوئی کہانی مس نہ کریں!</p>
                     <button className="w-full bg-ruby text-white py-4 rounded-full font-black shadow-lg">نیوز لیٹر جوائن کریں</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

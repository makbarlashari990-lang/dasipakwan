import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, FolderHeart, ArrowRight, Loader2, LogOut, Settings, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, logout } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { recipes } from '../data/recipes';

interface Collection {
  id: string;
  name: string;
  userId: string;
  recipeIds: string[];
  createdAt: any;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const q = query(
      collection(db, 'collections'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Collection[];
      setCollections(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching collections:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <Loader2 className="w-12 h-12 text-ruby animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-dark-surface rounded-[50px] p-8 md:p-12 shadow-2xl border border-ruby/5 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-ruby/5 blur-3xl rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12 text-right">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-ruby/20 p-1 bg-white dark:bg-dark-bg shadow-xl">
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt={user.displayName || 'Avatar'} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full rounded-full bg-ruby/10 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-ruby" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 w-8 h-8 bg-gold rounded-full border-4 border-white dark:border-dark-surface flex items-center justify-center">
                <Settings className="w-4 h-4 text-coffee" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-serif font-black text-coffee dark:text-dark-text mb-4">
                {user.displayName || 'خوش آمدید'}
              </h1>
              <div className="flex flex-col gap-2 items-center md:items-end">
                <div className="flex items-center gap-2 text-gray-500 font-bold flex-row-reverse">
                  <Mail className="w-4 h-4 text-ruby" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm font-black uppercase tracking-widest mt-4 flex-row-reverse">
                   <FolderHeart className="w-4 h-4 text-gold" />
                   <span>{collections.length} کلیکشنز</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => logout()}
              className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-coffee dark:text-dark-text rounded-2xl font-black text-sm hover:bg-ruby hover:text-white transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> لاگ آؤٹ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Collections */}
          <div className="lg:col-span-2 text-right">
            <div className="flex items-center justify-between mb-8 flex-row-reverse">
              <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text">آپ کے محفوظ کردہ فولڈرز</h2>
              <Link to="/collections" className="text-ruby font-black text-sm uppercase tracking-widest hover:underline">سب دیکھیں</Link>
            </div>

            {collections.length === 0 ? (
              <div className="bg-white dark:bg-dark-surface p-12 rounded-[50px] border-4 border-dashed border-ruby/10 text-center">
                <FolderHeart className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-coffee dark:text-dark-text mb-2">ابھی تک کوئی کلیکشن نہیں بنائی</h3>
                <p className="text-gray-400 font-medium mb-8">اپنی پسندیدہ ریسیپیز کو محفوظ کرنے کے لیے کلیکشنز بنائیں۔</p>
                <Link to="/recipes" className="inline-flex items-center gap-3 px-8 py-4 bg-ruby text-white rounded-full font-black shadow-xl hover:bg-coffee transition-all">
                  ریسیپیز دیکھیں <ArrowRight className="w-5 h-5 translate-x-1" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {collections.slice(0, 4).map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-dark-surface p-6 rounded-[40px] shadow-xl border border-ruby/5"
                  >
                    <div className="flex items-center gap-4 mb-6 flex-row-reverse">
                      <div className="w-12 h-12 bg-ruby/5 rounded-2xl flex items-center justify-center text-ruby">
                        <FolderHeart className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-serif font-black text-xl text-coffee dark:text-dark-text mb-1 truncate max-w-[150px]">{c.name}</h3>
                        <p className="text-xs font-bold text-gray-400">{c.recipeIds.length} ریسیپیز</p>
                      </div>
                    </div>
                    
                    <div className="flex -space-x-4 mb-6 flex-row-reverse space-x-reverse justify-end">
                      {c.recipeIds.slice(0, 3).map((rid, idx) => {
                        const recipe = recipes.find(r => r.id === rid);
                        if (!recipe) return null;
                        return (
                          <img 
                            key={rid} 
                            src={recipe.image} 
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-surface object-cover shadow-md" 
                            style={{ zIndex: 3 - idx }}
                            alt="Recipe"
                          />
                        );
                      })}
                      {c.recipeIds.length > 3 && (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border-2 border-white dark:border-dark-surface flex items-center justify-center text-[10px] font-black text-coffee dark:text-dark-text shadow-md">
                          +{c.recipeIds.length - 3}
                        </div>
                      )}
                    </div>

                    <Link 
                      to={`/collection/${c.id}`}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 text-coffee dark:text-dark-text rounded-2xl font-black text-[12px] hover:bg-ruby hover:text-white transition-all"
                    >
                       تفصیل دیکھیں <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Stats/Info */}
          <div className="space-y-8 text-right">
            <div className="bg-white dark:bg-dark-surface p-8 rounded-[40px] shadow-xl border border-ruby/5">
              <h3 className="text-xl font-serif font-black text-coffee dark:text-dark-text mb-6">پروفائل کی سرگرمی</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-ruby/5 rounded-2xl flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                       <FolderHeart className="w-5 h-5 text-ruby" />
                       <span className="font-bold text-sm">کلیکشنز</span>
                    </div>
                    <span className="font-black text-ruby text-lg">{collections.length}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gold/5 rounded-2xl flex-row-reverse">
                    <div className="flex items-center gap-3 flex-row-reverse">
                       <Heart className="w-5 h-5 text-gold" />
                       <span className="font-bold text-sm">پسندیدہ ریسیپیز</span>
                    </div>
                    <span className="font-black text-gold text-lg">
                      {collections.reduce((acc, curr) => acc + curr.recipeIds.length, 0)}
                    </span>
                 </div>
              </div>
            </div>

            <div className="bg-coffee text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-serif font-black mb-4">دیگر اراکین سے جڑیں</h3>
                  <p className="text-white/60 text-sm font-medium mb-6 leading-relaxed">اپنی ریسیپیز شیئر کریں اور دیکھیں کہ دوسرے کیا پکا رہے ہیں۔</p>
                  <Link to="/submit" className="flex items-center justify-center gap-3 w-full py-4 bg-ruby text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">
                    ریسیپی شیئر کریں <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-motif" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

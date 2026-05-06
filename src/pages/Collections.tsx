import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderHeart, Plus, MoreVertical, Trash2, ExternalLink, Loader2, Search, ArrowRight, Folder } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { recipes } from '../data/recipes';
import { cn } from '../lib/utils';

interface Collection {
  id: string;
  name: string;
  userId: string;
  recipeIds: string[];
  createdAt: any;
}

export default function Collections() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('کیا آپ اس کلیکشن کو حذف کرنا چاہتے ہیں؟')) {
      try {
        await deleteDoc(doc(db, 'collections', id));
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <Loader2 className="w-12 h-12 text-ruby animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 mb-16">
          <div className="text-right">
            <h1 className="text-5xl font-serif font-black text-coffee dark:text-dark-text mb-4">آپ کی ریسیپی کلیکشنز</h1>
            <p className="text-gray-500 font-medium">اپنی پسندیدہ ریسیپیز کو مختلف فولڈرز میں منظم کریں۔</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input 
                type="text" 
                placeholder="کلیکشن تلاش کریں..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white dark:bg-dark-surface border border-ruby/10 rounded-2xl outline-none focus:border-ruby/30 transition-all font-bold text-right"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            </div>
            <Link 
              to="/recipes"
              className="p-4 bg-ruby text-white rounded-2xl shadow-xl shadow-ruby/20 hover:scale-105 transition-all"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-[50px] border-4 border-dashed border-ruby/10">
            <Folder className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-coffee dark:text-dark-text mb-2">کوئی کلیکشن نہیں ملی</h3>
            <p className="text-gray-400 font-medium mb-8">نئی کلیکشن بنانے کے لیے کسی بھی ریسیپی پر جائیں اور اسے سیو کریں۔</p>
            <Link 
              to="/recipes"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ruby text-white rounded-full font-black shadow-xl hover:bg-coffee transition-all"
            >
              ریسیپیز دیکھیں <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => (
              <motion.div
                key={collection.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-surface p-8 rounded-[40px] shadow-xl border border-ruby/5 group hover:border-ruby/20 transition-all"
              >
                <div className="flex items-center justify-between mb-8 flex-row-reverse">
                  <div className="w-14 h-14 bg-ruby/5 rounded-2xl flex items-center justify-center text-ruby">
                    <FolderHeart className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(collection.id, e)}
                    className="p-3 bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-2">{collection.name}</h3>
                <p className="text-gray-400 text-sm font-bold mb-8">{collection.recipeIds.length} ریسیپیز</p>
                
                <div className="space-y-3 mb-8">
                  {collection.recipeIds.slice(0, 3).map((recipeId) => {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (!recipe) return null;
                    return (
                      <Link 
                        key={recipeId}
                        to={`/recipe/${recipeId}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group/item flex-row-reverse"
                      >
                        <img src={recipe.image} className="w-10 h-10 rounded-lg object-cover" alt={recipe.title} />
                        <span className="flex-1 text-sm font-bold text-coffee dark:text-dark-text truncate">{recipe.title}</span>
                        <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                  {collection.recipeIds.length > 3 && (
                    <div className="text-center text-xs font-black text-ruby py-2 bg-ruby/5 rounded-xl">
                      اور {collection.recipeIds.length - 3} مزید...
                    </div>
                  )}
                </div>

                <Link 
                  to={`/collection/${collection.id}`}
                  className="block w-full py-4 text-center bg-gray-100 dark:bg-white/5 text-coffee dark:text-dark-text rounded-2xl font-black text-sm hover:bg-ruby hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  کلیکشن کھولیں <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

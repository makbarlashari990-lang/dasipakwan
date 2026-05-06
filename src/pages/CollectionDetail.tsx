import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, FolderHeart, Trash2, Clock, Users, Star, ArrowRight, Loader2, Info } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { recipes } from '../data/recipes';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Collection {
  id: string;
  name: string;
  userId: string;
  recipeIds: string[];
  createdAt: any;
}

export default function CollectionDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'collections', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Collection;
        if (data.userId !== user.uid) {
          navigate('/collections');
          return;
        }
        setCollection({ id: docSnap.id, ...data });
      } else {
        navigate('/collections');
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching collection:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [id, user, authLoading, navigate]);

  const removeFromCollection = async (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!collection || !id) return;

    try {
      await updateDoc(doc(db, 'collections', id), {
        recipeIds: arrayRemove(recipeId)
      });
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <Loader2 className="w-12 h-12 text-ruby animate-spin mx-auto" />
      </div>
    );
  }

  if (!collection) return null;

  const collectionRecipes = recipes.filter(r => collection.recipeIds.includes(r.id));

  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12 flex-row-reverse">
          <Link to="/collections" className="flex items-center gap-2 text-gray-500 hover:text-ruby transition-colors font-bold text-sm uppercase tracking-widest flex-row-reverse">
            <ChevronLeft className="w-5 h-5 rotate-180" /> تمام کلیکشنز
          </Link>
          <div className="flex items-center gap-4 flex-row-reverse">
             <div className="w-16 h-16 bg-ruby text-white rounded-3xl flex items-center justify-center shadow-xl shadow-ruby/20">
                <FolderHeart className="w-8 h-8" />
             </div>
             <div className="text-right">
                <h1 className="text-4xl font-serif font-black text-coffee dark:text-dark-text">{collection.name}</h1>
                <p className="text-gray-400 font-bold">{collection.recipeIds.length} ریسیپیز</p>
             </div>
          </div>
        </div>

        {collectionRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-[50px] border border-ruby/5">
            <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-coffee dark:text-dark-text mb-2">اس کلیکشن میں ابھی کوئی ریسیپی نہیں ہے</h3>
            <Link to="/recipes" className="text-ruby font-black hover:underline">ریسیپیز شامل کریں</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collectionRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white dark:bg-dark-surface rounded-[40px] overflow-hidden shadow-xl border border-ruby/5"
              >
                <Link to={`/recipe/${recipe.id}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4 flex-row-reverse">
                      <span className="px-4 py-1 bg-ruby text-white text-[10px] font-black uppercase tracking-widest rounded-full">{recipe.category}</span>
                      <div className="flex items-center gap-1 text-gold">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-black">4.8</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-4 text-right">{recipe.title}</h3>
                    <div className="flex items-center gap-4 text-gray-400 text-xs font-bold justify-end">
                      <span className="flex items-center gap-1">{recipe.difficulty} <Users className="w-4 h-4" /></span>
                      <span className="flex items-center gap-1">{recipe.cookTime} <Clock className="w-4 h-4" /></span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => removeFromCollection(recipe.id, e)}
                  className="absolute top-4 left-4 p-3 bg-white/90 dark:bg-dark-surface/90 text-red-500 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="کلیکشن سے ہٹائیں"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

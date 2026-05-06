import React from 'react';
import { motion } from 'motion/react';
import { Clock, Users, Flame, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe } from '../data/recipes';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '../lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

const categoryMap: Record<string, string> = {
  'Breakfast': 'ناشتہ',
  'Lunch': 'لنچ',
  'Dinner': 'ڈنر',
  'Street Food': 'اسٹریٹ فوڈ',
  'Desserts': 'میٹھا',
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(recipe.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white dark:bg-dark-surface rounded-[40px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gold/10 text-right"
    >
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(recipe.id);
          }}
          className={cn(
            "p-3 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md rounded-2xl transition-all shadow-lg active:scale-90",
            favorite ? "text-ruby" : "text-gray-300 dark:text-gray-500 hover:text-ruby"
          )}
        >
          <Heart className={cn("w-5 h-5", favorite && "fill-current")} />
        </button>
      </div>

      <Link to={`/recipes/${recipe.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4">
            <span className="bg-ruby text-white text-[10px] uppercase tracking-widest font-bold py-1.5 px-4 rounded-full shadow-lg">
              {categoryMap[recipe.category] || recipe.category}
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-ruby/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-8">
          <div className="flex flex-wrap gap-2 justify-end mb-4">
            {recipe.dietaryRestrictions.slice(0, 2).map((r) => (
              <span key={r} className="text-[9px] font-black uppercase tracking-widest text-ruby/60 dark:text-ruby/40 px-2 py-1 bg-ruby/5 dark:bg-white/5 rounded-md">
                {r === 'Spicy' ? 'مرچوں والا' : 
                 r === 'Vegetarian' ? 'سبزی خور' : 
                 r === 'Gluten Free' ? 'گلوٹین فری' : 
                 r === 'Halal' ? 'حلال' : 
                 r === 'Slow Cooked' ? 'ہلکی آنچ' : 'میٹھا'}
              </span>
            ))}
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
              recipe.difficulty === 'Easy' ? "bg-green-100 text-green-700" :
              recipe.difficulty === 'Medium' ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            )}>
              {recipe.difficulty === 'Easy' ? 'آسان' : recipe.difficulty === 'Medium' ? 'متوسط' : 'مشکل'}
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-coffee dark:text-dark-text mb-3 group-hover:text-ruby transition-colors leading-tight">
            {recipe.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">
            {recipe.description}
          </p>
          
          <div className="flex items-center justify-between pt-6 border-t border-gold/10 flex-row-reverse">
            <div className="flex items-center gap-5 text-[10px] text-gold uppercase tracking-[0.2em] font-black flex-row-reverse">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {recipe.cookTime}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {recipe.servings} افراد
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-ruby flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-ruby/20">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RecipeCard;

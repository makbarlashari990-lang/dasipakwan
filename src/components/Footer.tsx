import { Link } from 'react-router-dom';
import { UtensilsCrossed, Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gold/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-right">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 justify-end mb-6 group">
              <span className="text-3xl font-serif font-black text-ruby">دیسی دسترخوان</span>
              <div className="w-10 h-10 bg-ruby rounded-full flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12 shadow-lg">DD</div>
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed max-w-sm ml-auto">
              پاکستان کی پہلی ڈیجیٹل کوک بک۔ ہمارا مقصد آپ کے کچن میں روایتی ذائقوں کو زندہ رکھنا اور نئی نسل کو اپنی ثقافت سے جوڑنا ہے۔
            </p>
          </div>
          <div>
            <h4 className="font-serif font-black text-xl text-coffee dark:text-dark-text mb-6">فوری لنکس</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li><Link to="/recipes" className="hover:text-ruby transition-colors">تمام ریسیپیز</Link></li>
              <li><Link to="/drinks" className="hover:text-ruby transition-colors">مشروبات</Link></li>
              <li><Link to="/blog" className="hover:text-ruby transition-colors">بلاگ</Link></li>
              <li><Link to="/submit" className="hover:text-ruby transition-colors">ریسیپی جمع کروائیں</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-black text-xl text-coffee dark:text-dark-text mb-6">ہمارے بارے میں</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li><Link to="/about" className="hover:text-ruby transition-colors">ہماری کہانی</Link></li>
              <li><Link to="/contact" className="hover:text-ruby transition-colors">رابطہ کریں</Link></li>
              <li><Link to="/collections" className="hover:text-ruby transition-colors">محفوظ کردہ فولڈرز</Link></li>
              <li><Link to="/profile" className="hover:text-ruby transition-colors">پروفائل</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-gold/5 flex flex-col md:flex-row-reverse justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-coffee/40 dark:text-dark-text/40">
           <div className="flex gap-8">
              <a href="#" className="hover:text-ruby transition-colors">انسٹاگرام</a>
              <a href="#" className="hover:text-ruby transition-colors">فیس بک</a>
              <a href="#" className="hover:text-ruby transition-colors">یوٹیوب</a>
           </div>
           <div>&copy; {new Date().getFullYear()} دیسی دسترخوان • تمام حقوق محفوظ ہیں</div>
           <div className="flex items-center gap-1">محبت کے ساتھ پاکستان سے <Heart className="w-3 h-3 text-ruby fill-current" /></div>
        </div>
      </div>
    </footer>
  );
}

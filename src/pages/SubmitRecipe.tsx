import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Plus, Minus, Upload, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, signInWithGoogle, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import VoiceInput from '../components/VoiceInput';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Street Food', 'Desserts'];
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function SubmitRecipe() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lunch',
    difficulty: 'Medium',
    prepTime: '',
    cookTime: '',
    servings: '',
    imageUrl: '',
    ingredients: [''],
    instructions: [''],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, value: string, field: 'ingredients' | 'instructions') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addField = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeField = (index: number, field: 'ingredients' | 'instructions') => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [field]: newArray }));
    }
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalImageUrl = formData.imageUrl;
      
      // If a file was uploaded, put it in Storage
      if (uploadedFile) {
        const storageRef = ref(storage, `recipes/${user.uid}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, uploadedFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const submissionData = {
        ...formData,
        imageUrl: finalImageUrl,
        authorId: user.uid,
        authorEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        // Filter out empty ingredients/instructions
        ingredients: formData.ingredients.filter(i => i.trim() !== ''),
        instructions: formData.instructions.filter(i => i.trim() !== ''),
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      setSuccess(true);
      setTimeout(() => navigate('/recipes'), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'submissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center">
        <Loader2 className="w-12 h-12 text-ruby animate-spin mx-auto" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-32 pb-24 text-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white dark:bg-dark-surface p-12 rounded-[50px] shadow-2xl border-4 border-gold/20"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-4xl font-serif font-black text-coffee dark:text-dark-text mb-4">شکریہ!</h2>
          <p className="text-gray-500 font-medium mb-8">آپ کی ریسیپی موصول ہو گئی ہے۔ جانچ پڑتال کے بعد اسے عام کر دیا جائے گا۔</p>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-ruby"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <div className="w-20 h-20 bg-ruby/5 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="w-10 h-10 text-ruby" />
          </div>
          <h1 className="text-5xl font-serif font-black text-coffee dark:text-dark-text mb-4">اپنی پسندیدہ ریسیپی شیئر کریں</h1>
          <p className="text-gray-500 font-medium max-w-lg text-center">پاکستان کے روایتی ذائقوں کو دنیا کے ساتھ شیئر کریں۔ آپ کی ریسیپی ہماری ٹیم کی تصدیق کے بعد لائیو ہو جائے گی۔</p>
        </div>

        {!user ? (
          <div className="bg-white dark:bg-dark-surface p-12 rounded-[50px] shadow-2xl text-center border border-ruby/5">
            <AlertCircle className="w-16 h-16 text-gold mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-4">لاگ ان ہونا ضروری ہے</h2>
            <p className="text-gray-500 mb-8">ریسیپی جمع کروانے کے لیے براہ کرم اپنے گوگل اکاؤنٹ سے لاگ ان کریں۔</p>
            <button 
              onClick={signInWithGoogle}
              className="px-12 py-5 bg-ruby text-white rounded-full font-black text-lg shadow-xl shadow-ruby/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              گوگل کے ساتھ لاگ ان کریں <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Basic Info */}
            <section className="bg-white dark:bg-dark-surface p-10 rounded-[50px] shadow-xl border border-ruby/5">
              <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-8 border-b border-ruby/5 pb-4">بنیادی تفصیلات</h3>
              <div className="space-y-6">
                <div className="relative group">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">ریسیپی کا نام</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="مثال کے طور پر: لاہوری چکن کڑاہی"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <VoiceInput 
                        onResult={(text) => setFormData(prev => ({ ...prev, title: text }))}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">مختصر تعارف</label>
                  <div className="relative">
                    <textarea 
                      name="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="ریسیپی کے بارے میں چند جملے لکھیں..."
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold resize-none"
                    />
                    <div className="absolute left-2 top-4">
                      <VoiceInput 
                        onResult={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">کیٹیگری</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">مشکل کی سطح</label>
                    <select 
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold appearance-none"
                    >
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Time & Servings */}
            <section className="bg-white dark:bg-dark-surface p-10 rounded-[50px] shadow-xl border border-ruby/5">
              <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-8 border-b border-ruby/5 pb-4">وقت اور افراد</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">تیاری کا وقت</label>
                  <input 
                    type="text" 
                    name="prepTime"
                    required
                    value={formData.prepTime}
                    onChange={handleInputChange}
                    placeholder="20 منٹ"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">پکانے کا وقت</label>
                  <input 
                    type="text" 
                    name="cookTime"
                    required
                    value={formData.cookTime}
                    onChange={handleInputChange}
                    placeholder="45 منٹ"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">کتنے افراد کے لیے</label>
                  <input 
                    type="text" 
                    name="servings"
                    required
                    value={formData.servings}
                    onChange={handleInputChange}
                    placeholder="4 افراد"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                  />
                </div>
              </div>
            </section>

            {/* Ingredients */}
            <section className="bg-white dark:bg-dark-surface p-10 rounded-[50px] shadow-xl border border-ruby/5">
              <div className="flex items-center justify-between mb-8 border-b border-ruby/5 pb-4 flex-row-reverse">
                <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text">اجزاء (Ingredients)</h3>
                <button 
                  type="button"
                  onClick={() => addField('ingredients')}
                  className="p-2 bg-ruby text-white rounded-xl hover:scale-110 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <button 
                      type="button"
                      onClick={() => removeField(idx, 'ingredients')}
                      className="p-3 text-gray-300 hover:text-ruby transition-colors hover:bg-ruby/5 rounded-xl"
                      title="Remove Ingredient"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative group">
                      <input 
                        type="text" 
                        required
                        value={ing}
                        onChange={(e) => handleArrayChange(idx, e.target.value, 'ingredients')}
                        placeholder={`جزو نمبر ${idx + 1}`}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                      />
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <VoiceInput 
                          onResult={(text) => handleArrayChange(idx, text, 'ingredients')}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <section className="bg-white dark:bg-dark-surface p-10 rounded-[50px] shadow-xl border border-ruby/5">
              <div className="flex items-center justify-between mb-8 border-b border-ruby/5 pb-4 flex-row-reverse">
                <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text">تیار کرنے کا طریقہ</h3>
                <button 
                  type="button"
                  onClick={() => addField('instructions')}
                  className="p-2 bg-ruby text-white rounded-xl hover:scale-110 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {formData.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <button 
                      type="button"
                      onClick={() => removeField(idx, 'instructions')}
                      className="p-3 text-gray-300 hover:text-ruby transition-colors hover:bg-ruby/5 rounded-xl mt-2"
                      title="Remove Step"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative group">
                      <textarea 
                        required
                        rows={2}
                        value={step}
                        onChange={(e) => handleArrayChange(idx, e.target.value, 'instructions')}
                        placeholder={`مرحلہ نمبر ${idx + 1}`}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold resize-none"
                      />
                      <div className="absolute left-2 top-4">
                        <VoiceInput 
                          onResult={(text) => handleArrayChange(idx, text, 'instructions')}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Image Upload */}
            <section className="bg-white dark:bg-dark-surface p-10 rounded-[50px] shadow-xl border border-ruby/5">
              <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-8 border-b border-ruby/5 pb-4">ریسیپی کی تصویر</h3>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-64 aspect-[4/3] bg-gray-50 dark:bg-white/5 rounded-3xl border-4 border-dashed border-gray-200 dark:border-white/10 overflow-hidden relative group flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {imagePreview || formData.imageUrl ? (
                        <motion.div 
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 group"
                        >
                          <img 
                            src={imagePreview || formData.imageUrl} 
                            className="w-full h-full object-cover" 
                            alt="Preview" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <label className="p-3 bg-white text-ruby rounded-2xl cursor-pointer hover:bg-ruby hover:text-white transition-all shadow-xl">
                              <Upload className="w-6 h-6" />
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                            <button 
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                setImagePreview(null);
                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                              }}
                              className="p-3 bg-ruby text-white rounded-2xl hover:bg-coffee transition-all shadow-xl"
                            >
                              <Minus className="w-6 h-6" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center text-gray-300 w-full h-full"
                        >
                          <Upload className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold uppercase tracking-widest">تصویر اپلوڈ کریں</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">یا تصویر کا لنک پیسٹ کریں</label>
                    <input 
                      type="url" 
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/20 rounded-2xl outline-none transition-all text-lg font-bold"
                    />
                    <p className="mt-4 text-xs text-gray-400 font-medium leading-relaxed">
                      بہترین نتائج کے لیے 4:3 ریشو کی تصویر استعمال کریں۔ اپلوڈ شدہ تصویر کو ترجیح دی جائے گی۔
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="p-6 bg-red-50 text-red-600 rounded-3xl font-bold flex items-center gap-3">
                <AlertCircle className="w-6 h-6" /> {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-6 bg-ruby text-white rounded-full font-black text-xl shadow-2xl shadow-ruby/30 hover:bg-coffee transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>جمع ہو رہی ہے... <Loader2 className="w-6 h-6 animate-spin" /></>
                ) : (
                  <>ریسیپی جمع کروائیں <ArrowRight className="w-6 h-6" /></>
                )}
              </button>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-12 py-6 bg-gray-100 dark:bg-white/5 text-coffee dark:text-dark-text rounded-full font-black text-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                کینسل کریں
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

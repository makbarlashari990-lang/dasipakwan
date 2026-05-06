import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, ChevronLeft, Heart, Share2, Printer, CheckCircle2, Bookmark, Star, Facebook, Twitter, Send, X, Camera, Upload, Image as ImageIcon, PartyPopper, Play, Sparkles, Wand2, Info, ChefHat, Utensils, Mic, MessageSquare, Plus, Minus, FolderHeart, Check, Search, Loader2, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize, Replace, Zap } from 'lucide-react';
import { recipes } from '../data/recipes';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '../lib/utils';
import React, { useState, useEffect, useRef } from 'react';
import VoiceInput from '../components/VoiceInput';
import { useAuth } from '../context/AuthContext';
import { db, signInWithGoogle, storage } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI, Type } from "@google/genai";

const categoryMap: Record<string, string> = {
  'Breakfast': 'ناشتہ',
  'Lunch': 'لنچ',
  'Dinner': 'ڈنر',
  'Street Food': 'اسٹریٹ فوڈ',
  'Desserts': 'میٹھا',
};

export default function RecipeDetail() {
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = recipe ? isFavorite(recipe.id) : false;
  const [showShare, setShowShare] = useState(false);
  const [isCookedModalOpen, setIsCookedModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const { user } = useAuth();
  const [hasCooked, setHasCooked] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [creationNote, setCreationNote] = useState('');
  const [creations, setCreations] = useState<any[]>([]);
  const [servings, setServings] = useState<number>(recipe ? parseInt(recipe.servings) : 4);

  const scalingFactor = recipe ? servings / parseInt(recipe.servings) : 1;

  const scaleQuantity = (text: string, factor: number) => {
    if (factor === 1) return text;
    
    // Regex matches: 1, 1.5, 1-2, 1/2
    // We want to avoid scaling if it's followed by "منٹ" (minutes) or "گھنٹے" (hours) or "ڈگری" (degrees)
    return text.replace(/(\d+(?:\.\d+)?|\d+(?:\/\d+)?)/g, (match, p1, offset, string) => {
      // Check for units to skip
      const followingText = string.slice(offset + match.length).trim();
      const skipUnits = ['منٹ', 'گھنٹے', 'گھنٹہ', 'degree', 'ڈگری', 'c', 'f'];
      if (skipUnits.some(unit => followingText.startsWith(unit))) {
        return match;
      }

      if (match.includes('/')) {
        const [num, den] = match.split('/').map(Number);
        if (isNaN(num) || isNaN(den)) return match;
        const val = (num / den) * factor;
        return val % 1 === 0 ? val.toString() : val.toFixed(1).replace(/\.0$/, '');
      }

      const val = parseFloat(match) * factor;
      return val % 1 === 0 ? val.toString() : val.toFixed(1).replace(/\.0$/, '');
    });
  };

  const fetchCreations = async () => {
    if (!id) return;
    try {
      const q = query(collection(db, 'creations'), where('recipeId', '==', id));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCreations(docs.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (error) {
      console.error("Error fetching creations:", error);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCreation = async () => {
    if (!user || !id || !selectedFile) return;

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `creations/${id}/${user.uid}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save to Firestore
      await addDoc(collection(db, 'creations'), {
        recipeId: id,
        userId: user.uid,
        userName: user.displayName || 'کُک',
        userImage: user.photoURL || '',
        imageUrl: downloadURL,
        note: creationNote.trim(),
        createdAt: serverTimestamp()
      });
      setIsCookedModalOpen(false);
      setUploadedImage(null);
      setSelectedFile(null);
      setCreationNote('');
      setHasCooked(true);
      fetchCreations();
    } catch (error) {
      console.error("Error submitting creation:", error);
      alert("تصویر اپلوڈ کرنے میں کوئی مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setIsUploading(false);
    }
  };
  const [personalIngredients, setPersonalIngredients] = useState<string[]>([]);
  const [personalSteps, setPersonalSteps] = useState<Record<number, string[]>>({});
  const [activeVoiceTarget, setActiveVoiceTarget] = useState<'ingredients' | 'instructions' | null>(null);

  const fetchCollections = async () => {
    if (!user) return;
    setIsLoadingCollections(true);
    try {
      const q = query(collection(db, 'collections'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCollections(docs);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const toggleRecipeInCollection = async (collectionId: string, isInCollection: boolean) => {
    if (!id) return;
    try {
      const collectionRef = doc(db, 'collections', collectionId);
      if (isInCollection) {
        await updateDoc(collectionRef, {
          recipeIds: arrayRemove(id)
        });
      } else {
        await updateDoc(collectionRef, {
          recipeIds: arrayUnion(id)
        });
      }
      fetchCollections(); // Refresh
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const createCollection = async () => {
    if (!user || !newCollectionName.trim() || !id) return;
    setIsCreatingCollection(true);
    try {
      await addDoc(collection(db, 'collections'), {
        name: newCollectionName.trim(),
        userId: user.uid,
        recipeIds: [id],
        createdAt: serverTimestamp()
      });
      setNewCollectionName('');
      fetchCollections();
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setIsCreatingCollection(false);
    }
  };
  
  const [activeTimers, setActiveTimers] = useState<Record<number, { remaining: number; total: number; isRunning: boolean; isFinished: boolean }>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          const idx = parseInt(key);
          if (next[idx].isRunning && next[idx].remaining > 0) {
            next[idx].remaining -= 1;
            changed = true;
            if (next[idx].remaining === 0) {
              next[idx].isRunning = false;
              next[idx].isFinished = true;
              // Play a subtle alarm sound
              const alarm = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              alarm.volume = 0.4;
              alarm.play().catch(() => {});
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const parseTime = (text: string) => {
    // English patterns: "5 minutes", "10-15 min", "1 hour"
    // Urdu patterns: "5 منٹ", "10 سے 15 منٹ"
    // We match numbers followed by time units. For ranges, we take the first/main number.
    const patterns = [
      /(\d+)\s*(?:سے|to|-)\s*(\d+)\s*(min|minute|minutes|hour|hr|h|منٹ|گھنٹہ|گھنٹے)/i,
      /(\d+)\s*(min|minute|minutes|hour|hr|h|منٹ|گھنٹہ|گھنٹے)/i
    ];

    let match = null;
    for (const pattern of patterns) {
      match = text.match(pattern);
      if (match) break;
    }

    if (!match) return null;
    
    // If it's a range like "10 to 15", we'll take the higher number for the timer 
    // or the first one. Let's take the first one as it's common for "at least X".
    let value = parseInt(match[1]);
    const unit = match[match.length - 1].toLowerCase();
    
    if (unit.startsWith('h') || unit === 'گھنٹہ' || unit === 'گھنٹے') {
      return value * 3600;
    }
    return value * 60;
  };

  const toggleTimer = (idx: number, seconds: number) => {
    setActiveTimers(prev => {
      const current = prev[idx];
      if (current) {
        return {
          ...prev,
          [idx]: { ...current, isRunning: !current.isRunning, isFinished: false }
        };
      }
      return {
        ...prev,
        [idx]: { remaining: seconds, total: seconds, isRunning: true, isFinished: false }
      };
    });
  };

  const resetTimer = (idx: number) => {
    setActiveTimers(prev => {
      const current = prev[idx];
      if (!current) return prev;
      return {
        ...prev,
        [idx]: { ...current, remaining: current.total, isRunning: false, isFinished: false }
      };
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Rating State
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [ratingStats, setRatingStats] = useState({ average: 4.8, total: 124 });
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);

  // AI Substitutions State
  const [substitutions, setSubstitutions] = useState<any[] | null>(null);
  const [desiTwist, setDesiTwist] = useState<string | null>(null);
  const [isAnalyzingSubstitutions, setIsAnalyzingSubstitutions] = useState(false);
  const [substitutionError, setSubstitutionError] = useState<string | null>(null);

  const fetchAISubstitutions = async () => {
    if (!recipe) return;
    setIsAnalyzingSubstitutions(true);
    setSubstitutionError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze these ingredients for the recipe "${recipe.title}" and suggest potential ingredient substitutions or variations. 
      Focus on:
      1. Common Pakistani pantry staples (e.g., if cream is missing, suggest malai or yogurt).
      2. Dietary needs (Vegetarian/Vegan alternatives, Gluten-free).
      3. Healthier alternatives (Lower fat, organic swaps).
      
      Ingredients: ${recipe.ingredients.join(', ')}
      
      Respond in Urdu Language. For each substitution, provide a category: 'پینٹری' (Pantry), 'ڈائٹ' (Dietary), or 'صحت' (Healthy).
      Also provide a 'Desi Twist' - a unique tip or variation using Pakistani culinary wisdom.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              substitutions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ingredient: { type: Type.STRING },
                    suggestions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          substitution: { type: Type.STRING },
                          reason: { type: Type.STRING },
                          category: { type: Type.STRING }
                        },
                        required: ["substitution", "reason", "category"]
                      }
                    }
                  },
                  required: ["ingredient", "suggestions"]
                }
              },
              desiTwist: { type: Type.STRING }
            },
            required: ["substitutions", "desiTwist"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setSubstitutions(data.substitutions);
      setDesiTwist(data.desiTwist);
    } catch (error) {
      console.error("Error fetching AI substitutions:", error);
      setSubstitutionError("AI تجزیہ کے دوران کوئی مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setIsAnalyzingSubstitutions(false);
    }
  };

  // Video State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleFullScreen = () => {
    const element = document.getElementById('ai-video-container');
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const [communityCreations, setCommunityCreations] = useState([
    { id: 1, user: 'سارہ احمد', image: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?q=80&w=2070&auto=format&fit=crop', date: '2 گھنٹے پہلے' },
    { id: 2, user: 'عمران خان', image: 'https://images.unsplash.com/photo-1545244102-1482f3ed062b?q=80&w=1974&auto=format&fit=crop', date: '5 گھنٹے پہلے' },
    { id: 3, user: 'زینب بی بی', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=2020&auto=format&fit=crop', date: '1 دن پہلے' },
  ]);

  const [generationStatus, setGenerationStatus] = useState('');
  const [storyboard, setStoryboard] = useState<any[] | null>(null);

  const statusSteps = [
    'ترکیب کا گہرا مطالعہ...',
    'منظر کشی اور اسکرپٹ رائٹنگ...',
    'صوتی اثرات اور موسیقی کا انتخاب...',
    'ویڈیو فریمز کی تیاری...',
    'حتمی پروڈکشن...'
  ];

  // Video Generation Logic
  const handleGenerateVideo = async () => {
    if (!recipe) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus(statusSteps[0]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Create a cinematic cooking video storyboard for the recipe "${recipe.title}". 
      Steps: ${recipe.instructions.join(' | ')}
      
      For each step, provide:
      1. 'narration': A poetic and professional culinary narration in Urdu.
      2. 'visualCue': A cinematic camera direction (e.g., 'Extreme Close-up', 'Slow Pan', 'Top-down show') in Urdu.
      3. 'mood': The emotional vibe (e.g., 'Sizzling', 'Fresh', 'Warm', 'Grand') in Urdu.
      
      Respond in JSON format as an array of steps.`;

      // Simulating progress while waiting for AI
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev;
          const next = prev + 5;
          const stepIndex = Math.floor((next / 100) * statusSteps.length);
          setGenerationStatus(statusSteps[Math.min(stepIndex, statusSteps.length - 1)]);
          return next;
        });
      }, 500);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                narration: { type: Type.STRING },
                visualCue: { type: Type.STRING },
                mood: { type: Type.STRING }
              },
              required: ["narration", "visualCue", "mood"]
            }
          }
        }
      });

      clearInterval(progressInterval);
      const data = JSON.parse(response.text);
      setStoryboard(data);
      setGenerationProgress(100);
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsVideoModalOpen(true);
        setIsVideoPlaying(true);
        setCurrentStep(0);
      }, 500);

    } catch (error) {
      console.error("AI Video Gen Error:", error);
      setIsGenerating(false);
      alert("ویڈیو تیار کرنے میں مسئلہ پیش آیا۔ متبادل ورژن دکھایا جا رہا ہے۔");
      setIsVideoModalOpen(true);
    }
  };

  const startVideo = () => {
    if (!recipe) return;
    videoIntervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= recipe.instructions.length) {
          setIsVideoPlaying(false);
          return prev; 
        }
        return prev + 1;
      });
    }, 5000); // 5 seconds per step
  };

  useEffect(() => {
    if (isVideoModalOpen && isVideoPlaying) {
      startVideo();
      audioRef.current?.play().catch(() => {});
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      audioRef.current?.pause();
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isVideoModalOpen, isVideoPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Load ratings from localStorage
  useEffect(() => {
    if (recipe) {
      const storedRating = localStorage.getItem(`recipe_rating_${recipe.id}`);
      if (storedRating) {
        setUserRating(parseInt(storedRating));
      }

      const storedStats = localStorage.getItem(`recipe_stats_${recipe.id}`);
      if (storedStats) {
        setRatingStats(JSON.parse(storedStats));
      } else {
        // Initial mock stats if none exist
        const initialStats = { average: 4.5 + Math.random() * 0.4, total: Math.floor(Math.random() * 50) + 20 };
        setRatingStats(initialStats);
        localStorage.setItem(`recipe_stats_${recipe.id}`, JSON.stringify(initialStats));
      }
    }
  }, [recipe?.id]);

  const handleRate = (rating: number) => {
    if (!recipe) return;
    
    const prevRating = userRating;
    setUserRating(rating);
    localStorage.setItem(`recipe_rating_${recipe.id}`, rating.toString());

    // Update community stats (simplified logic for demo)
    const newTotal = prevRating === 0 ? ratingStats.total + 1 : ratingStats.total;
    const newAverage = ((ratingStats.average * ratingStats.total) - prevRating + rating) / newTotal;
    
    const newStats = { average: parseFloat(newAverage.toFixed(1)), total: newTotal };
    setRatingStats(newStats);
    localStorage.setItem(`recipe_stats_${recipe.id}`, JSON.stringify(newStats));

    setShowRatingSuccess(true);
    setTimeout(() => setShowRatingSuccess(false), 3000);
  };

  if (!recipe) {
    return (
      <div className="pt-32 pb-24 text-center dark:text-dark-text">
        <h2 className="text-3xl font-bold mb-4">ریسیپی نہیں ملی</h2>
        <Link to="/recipes" className="text-ruby font-bold underline">تمام ریسیپیز پر واپس جائیں</Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = `${recipe.title} - دیسی دسترخوان`;

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#1877F2]'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#1DA1F2]'
    },
    {
      name: 'WhatsApp',
      icon: <Send className="w-5 h-5 rotate-45" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      color: 'bg-[#25D366]'
    }
  ];

  return (
    <div className="pt-24 pb-24 text-right dark:bg-dark-bg transition-colors duration-300">
      {/* Header / Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between flex-row-reverse no-print">
        <Link to="/recipes" className="flex items-center gap-2 text-gray-500 dark:text-dark-text/60 hover:text-ruby transition-colors font-bold text-sm uppercase tracking-widest flex-row-reverse">
          <ChevronLeft className="w-5 h-5 rotate-180" /> ریسیپیز پر واپس جائیں
        </Link>
        <div className="flex gap-4 relative">
          <button 
            onClick={() => setShowShare(!showShare)}
            className={cn(
              "p-2.5 rounded-full bg-white dark:bg-dark-surface border border-ruby/10 text-gray-400 dark:text-dark-text/40 hover:text-ruby transition-colors shadow-sm",
              showShare && "text-ruby bg-ruby/5"
            )}
          >
            <Share2 className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showShare && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute top-full mt-4 right-0 z-50 bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-2xl border border-ruby/10 flex flex-col gap-3 min-w-[200px]"
              >
                <div className="flex items-center justify-between gap-4 mb-2 border-b border-gray-100 dark:border-white/5 pb-2">
                  <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-ruby">
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">شیئر کریں</span>
                </div>
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group flex-row-reverse"
                    onClick={() => setShowShare(false)}
                  >
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg", link.color)}>
                      {link.icon}
                    </div>
                    <span className="text-sm font-bold text-coffee dark:text-dark-text">{link.name}</span>
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-gold text-coffee font-black text-xs uppercase tracking-widest shadow-xl shadow-gold/20 hover:bg-coffee hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="AI ویڈیو بنائیں"
          >
            {isGenerating ? 'تیار ہو رہا ہے...' : 'AI ویڈیو'}
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 transition-transform group-hover:scale-110" />}
          </button>

          <button 
            onClick={() => setIsPrintModalOpen(true)}
            className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-ruby text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-ruby/20 hover:bg-coffee transition-all active:scale-95"
            title="ریسیپی پرنٹ کریں"
          >
            پرنٹ کریں
            <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          <button 
            onClick={user ? () => { setIsCollectionModalOpen(true); fetchCollections(); } : signInWithGoogle}
            className={cn(
              "p-2.5 rounded-full bg-white dark:bg-dark-surface border border-ruby/10 transition-colors shadow-sm",
              collections.some(c => c.recipeIds.includes(id)) ? "text-ruby" : "text-gray-400 dark:text-dark-text/40 hover:text-ruby"
            )}
            title="کلیکشن میں شامل کریں"
          >
            <FolderHeart className={cn("w-5 h-5", collections.some(c => c.recipeIds.includes(id)) && "fill-current")} />
          </button>

          <button 
            onClick={() => toggleFavorite(recipe.id)}
            className={cn(
              "p-2.5 rounded-full bg-white dark:bg-dark-surface border border-ruby/10 transition-colors shadow-sm",
              favorite ? "text-ruby" : "text-gray-400 dark:text-dark-text/40 hover:text-ruby"
            )}
          >
            <Bookmark className={cn("w-5 h-5", favorite && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 justify-end">
               <div className="flex items-center gap-3 bg-white dark:bg-dark-surface px-6 py-3 rounded-2xl shadow-sm border border-ruby/5">
                  <div className="text-right">
                     <div className="text-lg font-black text-coffee dark:text-dark-text leading-none">{ratingStats.average}</div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ratingStats.total} ریویوز</div>
                  </div>
                  <div className="flex items-center gap-1 flex-row-reverse" onMouseLeave={() => setHoveredRating(0)}>
                    {[5, 4, 3, 2, 1].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleRate(s)}
                        onMouseEnter={() => setHoveredRating(s)}
                        className="focus:outline-none transition-all active:scale-150"
                        title={`${s} ستارے دیں`}
                      >
                        <Star 
                          className={cn(
                            "w-5 h-5 transition-all duration-300", 
                            (hoveredRating || userRating) >= s 
                              ? "fill-gold text-gold drop-shadow-[0_0_8px_rgba(255,184,0,0.4)] scale-110" 
                              : "text-gray-200 dark:text-gray-700 hover:text-gold/50"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
               </div>

               <AnimatePresence>
                 {showRatingSuccess && (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
                   >
                     شکریہ! آپ کی ریٹنگ محفوظ ہوگئی <CheckCircle2 className="w-3 h-3" />
                   </motion.div>
                 )}
               </AnimatePresence>

               <span className="bg-ruby text-white text-[10px] uppercase font-black tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg">
                 {categoryMap[recipe.category] || recipe.category}
               </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-black text-coffee dark:text-dark-text mb-8 leading-tight">
              {recipe.title}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-dark-text/70 mb-10 leading-relaxed font-medium">
              {recipe.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-8 bg-white dark:bg-dark-surface rounded-[40px] border border-ruby/5 shadow-xl shadow-ruby/5 mb-10 text-center transition-colors duration-300">
               <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-dark-text/40 font-bold mb-2 flex items-center gap-1.5 justify-center">
                    <Clock className="w-3.5 h-3.5 text-ruby" /> تیاری
                  </div>
                  <div className="text-lg font-black text-coffee dark:text-dark-text text-center">{recipe.prepTime}</div>
               </div>
               <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-dark-text/40 font-bold mb-2 flex items-center gap-1.5 justify-center">
                    <Clock className="w-3.5 h-3.5 text-ruby" /> پکانے کا وقت
                  </div>
                  <div className="text-lg font-black text-coffee dark:text-dark-text text-center">{recipe.cookTime}</div>
               </div>
               <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-dark-text/40 font-bold mb-2 flex items-center gap-1.5 justify-center">
                    <Users className="w-3.5 h-3.5 text-ruby" /> مقدار
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-6 h-6 rounded-full bg-ruby/10 text-ruby flex items-center justify-center hover:bg-ruby hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="text-lg font-black text-coffee dark:text-dark-text text-center min-w-[60px]">{servings} افراد</div>
                    <button 
                      onClick={() => setServings(servings + 1)}
                      className="w-6 h-6 rounded-full bg-ruby/10 text-ruby flex items-center justify-center hover:bg-ruby hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
               </div>
               <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-dark-text/40 font-bold mb-2 flex items-center gap-1.5 justify-center">
                    <ChefHat className="w-3.5 h-3.5 text-ruby" /> مشکل
                  </div>
                  <div className="text-lg font-black text-coffee dark:text-dark-text text-center">
                    {recipe.difficulty === 'Easy' ? 'آسان' : recipe.difficulty === 'Medium' ? 'متوسط' : 'مشکل'}
                  </div>
               </div>
               <div className="col-span-2 md:col-span-1">
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-dark-text/40 font-bold mb-2 flex items-center gap-1.5 justify-center">
                    <Utensils className="w-3.5 h-3.5 text-ruby" /> خاصیت
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {recipe.dietaryRestrictions.map((r, i) => (
                      <span key={i} className="text-[10px] font-bold text-ruby">
                        {r === 'Spicy' ? 'مرچوں والا' : 
                         r === 'Vegetarian' ? 'سبزی خور' : 
                         r === 'Gluten Free' ? 'گلوٹین فری' : 
                         r === 'Halal' ? 'حلال' : 
                         r === 'Slow Cooked' ? 'ہلکی آنچ' : 'میٹھا'}
                         {i < recipe.dietaryRestrictions.length - 1 && '،'}
                      </span>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 justify-end mb-10">
              <button 
                onClick={() => setIsCookedModalOpen(true)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-full font-black transition-all active:scale-95 shadow-xl",
                  hasCooked 
                    ? "bg-green-500 text-white" 
                    : "bg-ruby text-white hover:bg-coffee"
                )}
              >
                {hasCooked ? 'میں نے یہ پکایا ہے!' : 'میں نے یہ پکایا ہے'}
                <Camera className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="hidden sm:flex items-center gap-3 px-8 py-4 rounded-full font-black bg-white dark:bg-dark-surface border-2 border-ruby/10 text-ruby hover:bg-ruby/5 transition-all active:scale-95 shadow-lg"
              >
                ریسیپی پرنٹ کریں
                <Printer className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-black text-coffee dark:text-dark-text">عائشہ خان</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-dark-text/40 tracking-widest">روایتی ہوم شیف</div>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[80px] overflow-hidden shadow-2xl rotate-2 border-4 border-white dark:border-ruby/20">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full aspect-[5/6] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-ruby rounded-full z-0 flex items-center justify-center p-12 rotate-6 shadow-2xl border-8 border-cream dark:border-dark-surface transition-colors duration-300">
                <div className="text-white text-center">
                    <div className="text-4xl font-black mb-2">100%</div>
                    <div className="text-[10px] uppercase font-black tracking-widest leading-tight">اصلی روایتی ریسیپی</div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share This Recipe Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 no-print">
         <div className="bg-ruby/5 dark:bg-white/5 rounded-[50px] p-8 md:p-12 border border-ruby/10 flex flex-col md:flex-row-reverse items-center justify-between gap-8">
            <div className="text-right">
               <h3 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-2">دوستوں کے ساتھ شیئر کریں</h3>
               <p className="text-gray-500 dark:text-dark-text/60 font-medium">اگر آپ کو یہ ریسیپی پسند آئی ہے، تو اسے اپنے پیاروں کے ساتھ بانٹیں!</p>
            </div>
            <div className="flex gap-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all text-center",
                    link.color
                  )}
                  title={`Share on ${link.name}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
         </div>
      </div>

      {/* Instructions & Ingredients */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Ingredients */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-32">
              <div className="flex items-center gap-4 mb-6 justify-end">
                <div className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs">
                  آپ کو کن چیزوں کی ضرورت ہے <span className="w-8 h-px bg-ruby" />
                </div>
                <VoiceInput 
                  onResult={(text) => setPersonalIngredients(prev => [...prev, text])}
                  className="scale-75 origin-right"
                />
              </div>

              {/* Serving Scaler */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-[30px] border border-ruby/10 shadow-lg mb-8 flex items-center justify-between flex-row-reverse">
                 <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">مقدار منتخب کریں</div>
                    <div className="flex items-center gap-4 flex-row-reverse">
                       <button 
                         onClick={() => setServings(Math.max(1, servings - 1))}
                         className="w-10 h-10 rounded-xl bg-ruby/5 text-ruby flex items-center justify-center hover:bg-ruby hover:text-white transition-all active:scale-90"
                       >
                         <Minus className="w-5 h-5" />
                       </button>
                       <div className="flex flex-col items-center">
                          <input 
                            type="number" 
                            value={servings}
                            onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 bg-transparent text-2xl font-black text-coffee dark:text-dark-text text-center focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-gray-400">افراد</span>
                       </div>
                       <button 
                         onClick={() => setServings(servings + 1)}
                         className="w-10 h-10 rounded-xl bg-ruby/5 text-ruby flex items-center justify-center hover:bg-ruby hover:text-white transition-all active:scale-90"
                       >
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
                 <Users className="w-10 h-10 text-ruby/20" />
              </div>

              <h3 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-10">ضروری اجزاء</h3>
              <div className="space-y-6 mb-8">
                {recipe.ingredients.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-ruby/5 dark:hover:bg-ruby/10 transition-all group flex-row-reverse">
                    <div className="w-6 h-6 rounded-full border-2 border-ruby/20 flex-shrink-0 mt-1 group-hover:bg-ruby group-hover:border-ruby transition-all flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-coffee dark:text-dark-text font-bold leading-relaxed">
                      {scaleQuantity(item, scalingFactor)}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Substitutions Trigger */}
              <div className="mb-10 text-right">
                {!substitutions && !isAnalyzingSubstitutions && (
                  <button 
                    onClick={fetchAISubstitutions}
                    className="w-full p-6 bg-gold/10 hover:bg-gold/20 border-2 border-dashed border-gold/30 rounded-[40px] transition-all group"
                  >
                    <div className="flex items-center justify-center gap-3 mb-2 flex-row-reverse">
                      <Zap className="w-6 h-6 text-gold group-hover:scale-125 transition-transform" />
                      <span className="font-serif font-black text-coffee dark:text-dark-text">AI سے متبادل اجزاء پوچھیں</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">نیوٹریشن اور ہوم ککنگ ٹپس کے ساتھ بہترین متبادل دیکھیں</p>
                  </button>
                )}

                {isAnalyzingSubstitutions && (
                  <div className="w-full p-8 bg-white dark:bg-dark-surface rounded-[40px] shadow-xl border border-gold/20 text-center">
                    <div className="relative mb-6">
                      <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
                      <motion.div 
                         animate={{ scale: [1, 1.2, 1] }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="absolute inset-0 bg-gold/10 blur-xl rounded-full"
                      />
                    </div>
                    <h4 className="font-serif font-black text-coffee dark:text-dark-text mb-2">AI تجزیہ کر رہا ہے...</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">آپ کے کچن کے مطابق متبادل تلاش کیے جا رہے ہیں</p>
                  </div>
                )}

                {substitutionError && (
                  <div className="p-4 bg-ruby/5 text-ruby rounded-2xl text-sm font-bold flex items-center gap-2 justify-end">
                    {substitutionError}
                    <Info className="w-4 h-4" />
                  </div>
                )}

                <AnimatePresence>
                  {substitutions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between flex-row-reverse mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gold" />
                          <h4 className="font-serif font-black text-coffee dark:text-dark-text">AI اسمارٹ متبادل</h4>
                        </div>
                        <button onClick={() => { setSubstitutions(null); setDesiTwist(null); }} className="text-[10px] font-black text-ruby uppercase tracking-widest hover:underline">بند کریں</button>
                      </div>

                      {/* Desi Twist Box */}
                      {desiTwist && (
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="p-6 bg-coffee dark:bg-dark-surface rounded-[35px] text-white border-2 border-gold/30 relative overflow-hidden group shadow-xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-full bg-gold/5 animate-pulse" />
                          <Wand2 className="absolute top-4 left-4 w-12 h-12 text-gold/20 -rotate-12 group-hover:scale-125 transition-transform" />
                          <div className="relative z-10 text-right">
                             <div className="text-[10px] font-black uppercase tracking-widest text-gold mb-2">دیسی ٹوئسٹ</div>
                             <p className="text-sm font-bold leading-relaxed">{desiTwist}</p>
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="space-y-4">
                        {substitutions.map((item, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-dark-surface p-6 rounded-[35px] border border-ruby/5 shadow-lg relative overflow-hidden group"
                          >
                             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
                             <div className="relative z-10">
                               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 flex-row-reverse">
                                  <Replace className="w-3 h-3 text-gold" />
                                  <span>{item.ingredient} کے لیے</span>
                               </div>
                               <div className="space-y-4">
                                 {item.suggestions.map((s: any, sIdx: number) => (
                                   <div key={sIdx} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border-r-4 border-gold group/suggestion hover:bg-gold/5 transition-all">
                                      <div className="flex items-center justify-between mb-2 flex-row-reverse">
                                        <div className="font-black text-coffee dark:text-dark-text text-sm">{s.substitution}</div>
                                        <span className="text-[8px] px-2 py-1 bg-gold/20 text-gold rounded-full font-black uppercase tracking-widest">
                                          {s.category}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500 font-medium leading-relaxed text-right">{s.reason}</div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="p-5 bg-gold/5 rounded-[30px] flex items-center gap-4 flex-row-reverse border border-gold/10">
                         <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center text-gold shadow-sm">
                            <Info className="w-5 h-5" />
                         </div>
                         <p className="text-[10px] font-bold text-gray-500 text-right leading-tight flex-1">یہ تجاویز AI کے ذریعے تیار کی گئی ہیں۔ اپنی ضرورت کے مطابق استعمال کریں۔</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Personal Ingredients Log */}
              <AnimatePresence>
                {personalIngredients.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-gold/5 dark:bg-gold/10 border border-gold/20 rounded-[30px] mb-10"
                  >
                    <div className="flex items-center justify-between mb-4 flex-row-reverse">
                      <span className="text-[10px] uppercase font-black tracking-widest text-gold flex items-center gap-2">
                        اضافی اجزاء (ڈکٹیٹڈ) <Mic className="w-3 h-3" />
                      </span>
                      <button onClick={() => setPersonalIngredients([])} className="text-[10px] font-bold text-gray-400 hover:text-ruby">صاف کریں</button>
                    </div>
                    <ul className="space-y-2 text-right">
                      {personalIngredients.map((note, idx) => (
                        <li key={idx} className="text-sm font-bold text-coffee dark:text-dark-text opacity-70 flex items-center gap-2 justify-end">
                          {note} <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-16 order-1 lg:order-2">
             <div>
                <div className="flex items-center gap-4 mb-6 justify-end">
                  <div className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs">
                    ترکیب کا طریقہ <span className="w-8 h-px bg-ruby" />
                  </div>
                </div>
                <h3 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-10">ترتیب وار مراحل</h3>
                <div className="space-y-12 mb-16">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="relative pr-20 group">
                      <div className="absolute right-0 top-0 w-14 h-14 bg-coffee dark:bg-ruby text-white flex items-center justify-center rounded-3xl font-black text-2xl group-hover:bg-ruby dark:group-hover:bg-gold transition-colors shadow-lg">
                        {i + 1}
                      </div>
                      <div className="pt-3">
                         <div className="flex flex-col md:flex-row-reverse md:items-start justify-between gap-6 mb-6">
                            <p className="flex-1 text-xl text-gray-600 dark:text-dark-text/70 leading-relaxed font-medium">
                               {scaleQuantity(step, scalingFactor)}
                            </p>
                            
                            {/* Step Timer */}
                            {parseTime(step) && (
                               <motion.div 
                                  layout
                                  className={cn(
                                    "flex-shrink-0 flex items-center gap-3 p-4 rounded-3xl border self-end md:self-start flex-row-reverse transition-all duration-500",
                                    activeTimers[i]?.isFinished 
                                      ? "bg-green-500 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                                      : "bg-ruby/5 dark:bg-white/5 border-ruby/10"
                                  )}
                               >
                                  <div className="text-right">
                                     <div className={cn(
                                       "text-[10px] font-black uppercase tracking-widest mb-1",
                                       activeTimers[i]?.isFinished ? "text-white/80" : "text-ruby"
                                     )}>
                                        {activeTimers[i]?.isFinished ? "مکمل ہو گیا" : "ٹائمر"}
                                     </div>
                                     <div className={cn(
                                       "text-2xl font-mono font-black tabular-nums transition-colors",
                                       activeTimers[i]?.isFinished ? "text-white" : "text-coffee dark:text-dark-text"
                                     )}>
                                        {activeTimers[i] ? formatTimer(activeTimers[i].remaining) : formatTimer(parseTime(step) || 0)}
                                     </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                     {!activeTimers[i]?.isFinished ? (
                                       <button 
                                          onClick={() => toggleTimer(i, parseTime(step) || 0)}
                                          className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md",
                                            activeTimers[i]?.isRunning ? "bg-coffee text-white" : "bg-ruby text-white"
                                          )}
                                       >
                                          {activeTimers[i]?.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                                       </button>
                                     ) : (
                                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
                                          <Check className="w-6 h-6 text-white" />
                                       </div>
                                     )}
                                     {(activeTimers[i] || activeTimers[i]?.isFinished) && (
                                        <button 
                                          onClick={() => resetTimer(i)}
                                          className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                            activeTimers[i]?.isFinished 
                                              ? "bg-white/20 text-white hover:bg-white/30" 
                                              : "bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-ruby"
                                          )}
                                          title="دوبارہ شروع کریں"
                                        >
                                           <RotateCcw className="w-4 h-4" />
                                        </button>
                                     )}
                                  </div>
                               </motion.div>
                            )}
                         </div>

                         {/* Step Specific Notes & Voice Command */}
                         <div className="space-y-4">
                            <AnimatePresence>
                              {personalSteps[i]?.map((note, noteIdx) => (
                                 <motion.div 
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, scale: 0.9 }}
                                   key={noteIdx} 
                                   className="flex items-center gap-3 justify-end bg-gold/5 dark:bg-gold/10 p-4 rounded-3xl border border-gold/10 group/note"
                                 >
                                    <button 
                                      onClick={() => setPersonalSteps(prev => ({
                                        ...prev,
                                        [i]: prev[i].filter((_, idx) => idx !== noteIdx)
                                      }))}
                                      className="p-1 text-ruby/20 hover:text-ruby opacity-0 group-hover/note:opacity-100 transition-all active:scale-90"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                    <span className="text-coffee dark:text-dark-text font-bold text-sm text-right flex-1">{note}</span>
                                    <MessageSquare className="w-4 h-4 text-gold" />
                                 </motion.div>
                              ))}
                            </AnimatePresence>
                            
                            <div className="flex gap-3 justify-end items-center mt-6">
                               <div className="flex-1 max-w-[400px] relative">
                                 <input 
                                   type="text" 
                                   placeholder="اس مرحلے کے لیے کوئی نوٹ یا متبادل لکھیں..."
                                   className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-ruby/10 rounded-2xl outline-none text-sm font-bold text-right transition-all"
                                   onKeyDown={(e) => {
                                     if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                       const text = (e.target as HTMLInputElement).value.trim();
                                       setPersonalSteps(prev => ({
                                         ...prev,
                                         [i]: [...(prev[i] || []), text]
                                       }));
                                       (e.target as HTMLInputElement).value = '';
                                     }
                                   }}
                                 />
                                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <VoiceInput 
                                      onResult={(text) => setPersonalSteps(prev => ({
                                        ...prev,
                                        [i]: [...(prev[i] || []), text]
                                      }))}
                                      className="scale-90"
                                    />
                                 </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             
             {/* Pro Tip Box */}
             <div className="bg-coffee dark:bg-dark-surface text-white rounded-[50px] p-10 md:p-14 relative overflow-hidden shadow-2xl border-4 border-white dark:border-ruby/20 transition-colors duration-300">
                <ChefHat className="w-64 h-64 text-white/5 absolute -top-10 -left-10 rotate-12" />
                <div className="relative z-10 max-w-xl text-right ml-auto">
                   <div className="flex items-center gap-3 mb-6 justify-end">
                      <span className="text-xs uppercase font-black tracking-widest text-gold">شیف کا خاص مشورہ</span>
                      <div className="w-10 h-10 rounded-xl bg-ruby flex items-center justify-center shadow-lg">
                         <Star className="w-6 h-6 text-white fill-current" />
                      </div>
                   </div>
                   <h4 className="text-4xl font-serif font-black mb-6 italic">خوشبو میں مہارت</h4>
                   <p className="text-white/70 dark:text-dark-text/70 text-lg leading-relaxed font-medium mb-8">
                     فوڈ اسٹریٹ جیسی خوشبو کے لیے ہمیشہ تازہ پسے ہوئے مصالحے استعمال کریں۔ پہلے سے پیک شدہ مصالحے وقت کے ساتھ اپنی خوشبو کھو دیتے ہیں۔ آخر میں کوئلے کا دھواں (دم) اس ڈش کو ایک الگ ہی مقام پر لے جاتا ہے۔
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Community Creations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 no-print">
         <div className="flex items-center justify-between mb-12 flex-row-reverse">
            <div className="text-right">
               <div className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4 justify-end">
                 کمیونٹی کی محنت <span className="w-8 h-px bg-ruby" />
               </div>
               <h3 className="text-4xl font-serif font-black text-coffee dark:text-dark-text">ہمارے کُکس کی تیاریاں</h3>
            </div>
            <div className="hidden md:flex items-center gap-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
               <span>شیئر کی گئی تصاویر</span>
               <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12">
             {creations.length > 0 ? (
               creations.map((c) => (
                  <div key={c.id} className="aspect-square rounded-[40px] overflow-hidden group relative shadow-lg">
                     <img 
                        src={c.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform" 
                        alt="Community Creation" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-ruby/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-3">
                           <img src={c.userImage || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-white font-black text-sm mb-1">{c.userName}</span>
                        <p className="text-white/80 text-[10px] font-medium line-clamp-2">{c.note}</p>
                     </div>
                  </div>
               ))
             ) : (
                [1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-[40px] overflow-hidden group relative bg-gray-100 dark:bg-white/5 animate-pulse" />
                ))
             )}
          </div>
       </div>

      {/* I Cooked This Modal */}
      <AnimatePresence>
        {isCookedModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCookedModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-[50px] overflow-hidden shadow-2xl border-8 border-white dark:border-ruby/20 p-10 text-right no-print"
            >
              {!user ? (
                <div className="py-10 text-center">
                   <div className="w-20 h-20 bg-ruby/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-ruby">
                      <Users className="w-10 h-10" />
                   </div>
                   <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-4">لاگ ان کریں</h2>
                   <p className="text-gray-500 mb-8">تصویر اپلوڈ کرنے کے لیے لاگ ان کرنا ضروری ہے۔</p>
                   <button onClick={signInWithGoogle} className="bg-ruby text-white px-10 py-4 rounded-full font-black shadow-lg hover:bg-coffee transition-all">گوگل کے ساتھ سائن ان کریں</button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8 flex-row-reverse">
                    <div className="w-16 h-16 bg-ruby/10 rounded-3xl flex items-center justify-center text-ruby">
                      <Camera className="w-8 h-8" />
                    </div>
                    <button 
                      onClick={() => setIsCookedModalOpen(false)}
                      className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-ruby transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-4">اپنی تخلیق کی تصویر شیئر کریں!</h2>
                  <p className="text-gray-500 dark:text-dark-text/60 font-medium mb-8">آپ کی تصویر ہماری کمیونٹی کے لیے باعثِ ترغیب ہوگی۔</p>

                  <div className="space-y-6">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className={cn(
                        "aspect-video rounded-3xl border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden",
                        uploadedImage ? "border-ruby/20" : "border-gray-200 dark:border-white/10 group-hover:border-ruby/20"
                      )}>
                        {uploadedImage ? (
                          <img src={uploadedImage} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-gray-300 mb-3" />
                            <span className="text-sm font-bold text-gray-400">تصویر منتخب کریں</span>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea 
                      placeholder="اپنا تجربہ لکھیں (اختیاری)..."
                      value={creationNote}
                      onChange={(e) => setCreationNote(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/10 rounded-3xl outline-none transition-all font-bold text-right resize-none h-24"
                    />

                    <button 
                      onClick={submitCreation}
                      disabled={!uploadedImage || isUploading}
                      className="w-full bg-ruby text-white py-5 rounded-full font-black text-lg shadow-xl shadow-ruby/20 hover:bg-coffee active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isUploading && <Loader2 className="w-6 h-6 animate-spin" />}
                      {isUploading ? 'اپلوڈ ہو رہا ہے...' : 'محفوظ کریں اور شیئر کریں'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row h-[80vh]"
              id="ai-video-container"
              onMouseMove={handleMouseMove}
              onTouchStart={handleMouseMove}
            >
              <audio 
                ref={audioRef}
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                loop
              />
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className={cn(
                  "absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-ruby rounded-2xl text-white transition-all shadow-lg backdrop-blur-md",
                  !showControls && "opacity-0 cursor-none"
                )}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player Area */}
              <div className="flex-1 relative bg-dark-surface overflow-hidden group cursor-none">
                <div onClick={() => setIsVideoPlaying(!isVideoPlaying)} className="absolute inset-0 z-10 cursor-pointer" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 1.1, x: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: storyboard && currentStep > 0 && storyboard[currentStep - 1].visualCue.includes('Close') ? 1.4 : 1,
                      x: storyboard && currentStep > 0 && storyboard[currentStep - 1].visualCue.includes('Pan') ? [0, -50, 0] : 0,
                      transition: { duration: 5, ease: "linear" }
                    }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={currentStep === 0 ? recipe.image : `https://images.unsplash.com/photo-${1504674900247 + (id?.length || 0) + currentStep}-0877df9cc236?auto=format&fit=crop&q=80&w=1200`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  </motion.div>
                </AnimatePresence>

                {/* Subtitles Overlay */}
                <div className="absolute bottom-16 left-12 right-12 z-10 text-right">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/60 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 mb-6 justify-end">
                      {storyboard && currentStep > 0 && currentStep <= storyboard.length && (
                        <div className="flex items-center gap-2 mr-auto">
                          <span className="text-[8px] bg-gold/20 text-gold px-3 py-1 rounded-full font-black uppercase tracking-widest border border-gold/30">
                            {storyboard[currentStep - 1].visualCue}
                          </span>
                          <span className="text-[8px] bg-ruby/20 text-ruby px-3 py-1 rounded-full font-black uppercase tracking-widest border border-ruby/30">
                            {storyboard[currentStep - 1].mood}
                          </span>
                        </div>
                      )}
                      <span className="bg-ruby text-white text-[10px] uppercase font-black px-4 py-1.5 rounded-full shadow-lg">
                        {currentStep === 0 ? 'تعارف' : `مرحلہ ${currentStep}`}
                      </span>
                      <ChefHat className="w-5 h-5 text-gold animate-bounce" />
                    </div>
                    
                    <p className="text-2xl md:text-5xl text-white font-black leading-tight font-serif drop-shadow-xl mb-4">
                      {currentStep === 0 ? recipe.title : recipe.instructions[currentStep - 1]}
                    </p>

                    {storyboard && currentStep > 0 && currentStep <= storyboard.length && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gold/80 text-lg md:text-xl font-bold leading-relaxed italic"
                      >
                        {storyboard[currentStep - 1].narration}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                {/* Top Controls Overlay */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-8 left-8 flex items-center gap-4 z-20"
                    >
                       <button 
                         onClick={(e) => { e.stopPropagation(); setIsVideoPlaying(!isVideoPlaying); }}
                         className="p-5 bg-white/10 hover:bg-ruby text-white rounded-3xl transition-all shadow-xl backdrop-blur-md border border-white/10"
                       >
                         {isVideoPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setCurrentStep(0); setIsVideoPlaying(true); }}
                         className="p-5 bg-white/10 hover:bg-gold text-coffee rounded-3xl transition-all shadow-xl backdrop-blur-md border border-white/10"
                       >
                         <RotateCcw className="w-8 h-8" />
                       </button>

                       {/* Volume Controls */}
                       <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/10 group/volume relative h-[72px]">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-2 text-white hover:text-ruby transition-colors"
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                          </button>
                          <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              setVolume(parseFloat(e.target.value));
                              setIsMuted(false);
                            }}
                            className="w-24 h-1.5 accent-ruby bg-white/20 rounded-full cursor-pointer appearance-none"
                          />
                       </div>

                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                         className="p-5 bg-white/10 hover:bg-white/20 text-white rounded-3xl transition-all shadow-xl backdrop-blur-md border border-white/10"
                       >
                         {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step Indicator Overlay (Top Right) */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute top-8 right-24 z-20 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-widest"
                    >
                       {currentStep + 1} / {recipe.instructions.length + 1} مراحل
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Progress Bar (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/10 z-30">
                   <motion.div 
                     className="h-full bg-gold shadow-[0_0_25px_rgba(255,184,0,0.6)]"
                     animate={{ width: `${((currentStep + 1) / (recipe.instructions.length + 1)) * 100}%` }}
                     transition={{ duration: 0.5 }}
                   />
                </div>
              </div>

              {/* Steps List Sidebar (Desktop) */}
              <div className="w-full md:w-80 bg-dark-bg border-l border-white/5 p-8 flex flex-col no-scrollbar overflow-y-auto">
                 <h3 className="text-xl font-black text-white mb-8 text-right font-serif flex items-center gap-2 justify-end">
                    AI گائیڈڈ کوکنگ
                    <Sparkles className="w-5 h-5 text-gold" />
                 </h3>
                 <div className="space-y-6">
                    <button 
                      onClick={() => setCurrentStep(0)}
                      className={cn(
                        "w-full p-4 rounded-2xl text-right transition-all border-2",
                        currentStep === 0 ? "border-ruby bg-ruby/10 text-ruby" : "border-transparent bg-white/5 text-white/50 hover:bg-white/10"
                      )}
                    >
                      <div className="text-[10px] font-black uppercase mb-1">تعارف</div>
                      <div className="text-sm font-bold truncate">{recipe.title}</div>
                    </button>
                    {recipe.instructions.map((step, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentStep(idx + 1)}
                        className={cn(
                          "w-full p-4 rounded-2xl text-right transition-all border-2",
                          currentStep === idx + 1 ? "border-ruby bg-ruby/10 text-ruby" : "border-transparent bg-white/5 text-white/50 hover:bg-white/10"
                        )}
                      >
                        <div className="text-[10px] font-black uppercase mb-1">مرحلہ {idx + 1}</div>
                        <div className="text-sm font-bold line-clamp-2">{step}</div>
                      </button>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generating Modal */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-surface p-12 rounded-[50px] shadow-2xl text-center"
            >
              <div className="relative mb-12">
                <div className="w-32 h-32 rounded-[40px] bg-gold/10 border-4 border-gold/20 flex items-center justify-center mx-auto relative z-10">
                   <div className="relative">
                      <Wand2 className="w-12 h-12 text-gold animate-pulse" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-t-2 border-gold rounded-full"
                      />
                   </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gold/5 blur-3xl rounded-full" />
              </div>

              <h2 className="text-2xl font-serif font-black text-coffee dark:text-dark-text mb-4">AI ویڈیو تیار کی جا رہی ہے</h2>
              <p className="text-gray-500 font-medium mb-10 h-6">{generationStatus}</p>

              <div className="bg-gray-100 dark:bg-white/5 h-3 rounded-full overflow-hidden mb-4 relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gold"
                  animate={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="text-xs font-black text-gold uppercase tracking-[0.2em]">{generationProgress}% مکمل</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Confirmation Modal */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-[50px] overflow-hidden shadow-2xl border-8 border-white dark:border-ruby/20 p-10 text-right no-print"
            >
              <div className="flex justify-between items-start mb-8 flex-row-reverse">
                <div className="w-16 h-16 bg-ruby/10 rounded-3xl flex items-center justify-center text-ruby">
                  <Printer className="w-8 h-8" />
                </div>
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-ruby transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-4">کیا آپ ریسیپی پرنٹ کرنا چاہتے ہیں؟</h2>
              <p className="text-gray-500 dark:text-dark-text/60 font-medium mb-10 leading-relaxed">
                ہم آپ کے لیے ریسیپی کو ایک خوبصورت اور پڑھنے میں آسان فارمیٹ میں تیار کریں گے۔ اس میں ریسیپی کی تصویر، اجزاء اور تمام مراحل شامل ہوں گے۔
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                   onClick={() => {
                     setIsPrintModalOpen(false);
                     setTimeout(() => window.print(), 300);
                   }}
                   className="bg-ruby text-white py-5 rounded-full font-black text-lg shadow-xl shadow-ruby/20 hover:bg-coffee active:scale-95 transition-all"
                >
                  ہاں، پرنٹ کریں
                </button>
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-gray-100 dark:bg-white/5 text-coffee dark:text-dark-text py-5 rounded-full font-black text-lg hover:bg-gray-200 transition-all active:scale-95"
                >
                  کینسل کریں
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-2 justify-end text-ruby/40 italic text-xs font-bold">
                 <span>پرنٹ صرف منتخب ریسیپی پر لاگو ہوگا</span>
                 <Info className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save to Collection Modal */}
      <AnimatePresence>
        {isCollectionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollectionModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-[50px] overflow-hidden shadow-2xl border-8 border-white dark:border-ruby/20 p-10 text-right no-print"
            >
              <div className="flex justify-between items-start mb-8 flex-row-reverse">
                <div className="w-16 h-16 bg-ruby/10 rounded-3xl flex items-center justify-center text-ruby">
                  <FolderHeart className="w-8 h-8" />
                </div>
                <button 
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-ruby transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-3xl font-serif font-black text-coffee dark:text-dark-text mb-2">کلیکشن میں محفوظ کریں</h2>
              <p className="text-gray-500 dark:text-dark-text/60 font-medium mb-8">اس ریسیپی کو اپنے کسی پسندیدہ فولڈر میں شامل کریں۔</p>

              {/* Collection List */}
              <div className="space-y-3 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingCollections ? (
                  <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-ruby" /></div>
                ) : (
                  collections.map(c => {
                    const isInCollection = c.recipeIds?.includes(id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleRecipeInCollection(c.id, isInCollection)}
                        className={cn(
                          "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between flex-row-reverse group",
                          isInCollection 
                            ? "bg-ruby/5 border-ruby/20 text-ruby" 
                            : "bg-gray-50 border-transparent text-gray-400 hover:border-ruby/10"
                        )}
                      >
                        <div className="flex items-center gap-4 flex-row-reverse">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isInCollection ? "bg-ruby text-white" : "bg-white text-gray-200")}>
                            {isInCollection ? <Check className="w-5 h-5" /> : <FolderHeart className="w-5 h-5" />}
                          </div>
                          <span className="font-black text-lg">{c.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{(c.recipeIds || []).length} ریسیپیز</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Create New Collection */}
              <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex gap-3">
                  <button 
                    onClick={createCollection}
                    disabled={isCreatingCollection || !newCollectionName.trim()}
                    className="p-5 bg-ruby text-white rounded-2xl shadow-lg shadow-ruby/20 disabled:opacity-50 hover:bg-coffee transition-all"
                  >
                    {isCreatingCollection ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                  </button>
                  <input 
                    type="text" 
                    placeholder="نیا فولڈر بنائیں..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-ruby/10 rounded-2xl outline-none transition-all font-bold text-right"
                    onKeyPress={(e) => e.key === 'Enter' && createCollection()}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
               
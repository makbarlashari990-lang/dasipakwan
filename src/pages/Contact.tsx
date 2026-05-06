import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
               <div className="flex items-center gap-2 text-ruby font-black tracking-[0.2em] uppercase text-xs mb-4 justify-end">
                 رابطہ کریں <span className="w-8 h-px bg-ruby" />
               </div>
               <h1 className="text-5xl md:text-7xl font-serif font-black text-coffee mb-10 leading-tight">
                 کھانے پر <br />
                 <span className="text-ruby">بات کریں</span>
               </h1>
               <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12 italic">
                 ریسیپی کے بارے میں کوئی سوال؟ تعاون میں دلچسپی؟ یا صرف اپنی کوکنگ کی کامیابی شیئر کرنا چاہتے ہیں؟ ہمیں آپ سے بات کر کے خوشی ہوگی۔
               </p>
               
               <div className="space-y-8 mb-16">
                  <div className="flex items-center gap-6 group flex-row-reverse">
                     <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-ruby/5 border border-ruby/5 flex items-center justify-center group-hover:bg-ruby transition-all">
                        <Mail className="w-6 h-6 text-ruby group-hover:text-white" />
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">ہمیں ای میل کریں</div>
                        <div className="text-xl font-serif font-black text-coffee">hello@desidastarkhwan.pk</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 group flex-row-reverse">
                     <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-ruby/5 border border-ruby/5 flex items-center justify-center group-hover:bg-ruby transition-all">
                        <Phone className="w-6 h-6 text-ruby group-hover:text-white" />
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">ہمیں کال کریں</div>
                        <div className="text-xl font-serif font-black text-coffee">+92 300 1234567</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 group flex-row-reverse">
                     <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-ruby/5 border border-ruby/5 flex items-center justify-center group-hover:bg-ruby transition-all">
                        <MapPin className="w-6 h-6 text-ruby group-hover:text-white" />
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">پتہ</div>
                        <div className="text-xl font-serif font-black text-coffee">لاہور، پاکستان</div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 justify-end">
                  {[Youtube, Instagram, Facebook, Twitter].map((Icon, i) => (
                    <a key={i} href="#" className="w-14 h-14 rounded-2xl bg-coffee text-white flex items-center justify-center hover:bg-ruby hover:-rotate-12 transition-all shadow-xl border-2 border-white">
                       <Icon className="w-6 h-6" />
                    </a>
                  ))}
               </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 md:p-14 rounded-[60px] shadow-2xl shadow-ruby/10 border-4 border-white relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-motif opacity-5 pointer-events-none" />
               <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">پورا نام</label>
                        <input 
                          type="text" 
                          placeholder="نام درج کریں" 
                          className="w-full bg-cream rounded-3xl px-8 py-5 focus:outline-none focus:ring-4 focus:ring-ruby/10 transition-all font-bold text-coffee text-right"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">ای میل</label>
                        <input 
                          type="email" 
                          placeholder="example@email.com" 
                          className="w-full bg-cream rounded-3xl px-8 py-5 focus:outline-none focus:ring-4 focus:ring-ruby/10 transition-all font-bold text-coffee text-right"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">موضوع</label>
                     <select className="w-full bg-cream rounded-3xl px-8 py-5 focus:outline-none focus:ring-4 focus:ring-ruby/10 transition-all font-black text-coffee appearance-none text-right">
                        <option>عام معلومات</option>
                        <option>ریسیپی پر فیڈبیک</option>
                        <option>تعاون</option>
                        <option>میڈیا سے متعلقہ سوالات</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">پیغام</label>
                     <textarea 
                        rows={4} 
                        placeholder="ہمیں کچھ بتائیں..." 
                        className="w-full bg-cream rounded-[30px] px-8 py-5 focus:outline-none focus:ring-4 focus:ring-ruby/10 transition-all font-bold text-coffee resize-none text-right"
                      />
                  </div>
                  <button className="w-full bg-ruby text-white py-6 rounded-full font-black text-lg hover:bg-coffee transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group flex-row-reverse">
                    پیغام بھیجیں <Send className="w-5 h-5 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform rotate-180" />
                  </button>
               </form>
            </motion.div>
         </div>
      </div>
    </div>
  );
}

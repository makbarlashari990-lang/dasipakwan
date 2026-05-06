export interface Recipe {
  id: string;
  title: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Street Food' | 'Desserts';
  image: string;
  prepTime: string;
  cookTime: string;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryRestrictions: string[];
  servings: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  trending?: boolean;
  featured?: boolean;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    title: 'مٹن کڑاہی',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb36793?q=80&w=2070&auto=format&fit=crop',
    prepTime: '20 منٹ',
    cookTime: '45 منٹ',
    cookTimeMinutes: 45,
    difficulty: 'Medium',
    dietaryRestrictions: ['Spicy', 'Halal'],
    servings: '4',
    description: 'تازہ ٹماٹر، ہری مرچ اور ادرک کے ساتھ کڑاہی میں پکا ہوا ایک کلاسک پاکستانی پکوان۔',
    ingredients: [
      '1 کلو مٹن',
      '500 گرام ٹماٹر',
      '4-5 ہری مرچیں',
      '2 چمچ ادرک لہسن کا پیسٹ',
      '1 کپ تیل/گھی',
      'سجاوٹ کے لیے ہرا دھنیا',
      'سجاوٹ کے لیے کٹی ہوئی ادرک',
      'مصالحے: نمک، کٹی ہوئی لال مرچ، کالی مرچ'
    ],
    instructions: [
      'ایک کڑاہی میں تیل گرم کریں اور مٹن ڈالیں۔ رنگ بدلنے تک فرائی کریں۔',
      'ادرک لہسن کا پیسٹ ڈالیں اور مزید 5 منٹ تک بھونیں۔',
      'ٹماٹر (دو حصوں میں کٹے ہوئے) شامل کریں اور ڈھانپ دیں۔ ٹماٹروں کو نرم ہونے دیں۔',
      'ٹماٹر کا چھلکا اتاریں اور انہیں مٹن میں میش کریں۔',
      'مصالحے شامل کریں اور تیز آنچ پر پکائیں جب تک کہ تیل الگ نہ ہو جائے۔',
      'ہری مرچ، ادرک اور دھنیا سے سجائیں۔'
    ],
    featured: true,
    trending: true
  },
  {
    id: '2',
    title: 'بیف نہاری',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1545244102-1482f3ed062b?q=80&w=1974&auto=format&fit=crop',
    prepTime: '30 منٹ',
    cookTime: '6-8 گھنٹے',
    cookTimeMinutes: 420,
    difficulty: 'Hard',
    dietaryRestrictions: ['Slow Cooked', 'Halal'],
    servings: '6',
    description: 'دھیمی آنچ پر پکا ہوا بیف شینک سٹیو، جو روایتی طور پر لاہور اور کراچی میں ناشتے کے طور پر کھایا جاتا ہے۔',
    ingredients: [
      '1.5 کلو بیف بنگ',
      '1 کپ تیل/گھی',
      'دیسی نہاری مصالحہ',
      'گاڑھا کرنے کے لیے آٹے کا آمیزہ',
      'سجاوٹ: تلی ہوئی پیاز، لیموں، ادرک، ہرا دھنیا'
    ],
    instructions: [
      'تیل میں مصالحے کے ساتھ گوشت کو بھونیں۔',
      'پانی شامل کریں اور اسے 6-8 گھنٹے تک دھیمی آنچ پر پکنے دیں یہاں تک کہ گوشت بالکل نرم ہو جائے۔',
      'آٹے کے آمیزے سے گاڑھا کریں اور مزید 20 منٹ تک پکنے دیں۔',
      'تازہ نان کے ساتھ گرما گرم پیش کریں۔'
    ],
    featured: true
  },
  {
    id: '3',
    title: 'چکن بریانی',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=2020&auto=format&fit=crop',
    prepTime: '40 منٹ',
    cookTime: '35 منٹ',
    cookTimeMinutes: 35,
    difficulty: 'Medium',
    dietaryRestrictions: ['Spicy', 'Halal'],
    servings: '5',
    description: 'پاکستانی پکوانوں کی "شان"۔ خوشبودار باسمتی چاول اور مصالحہ دار چکن کی تہیں پکارتی بریانی۔',
    ingredients: [
      '1 کلو باسمتی چاول',
      '1 کلو چکن',
      '3 پیاز (باریک کٹے ہوئے)',
      '1 کپ دہی',
      'بریانی مصالحہ',
      'زعفران اور دودھ کا آمیزہ',
      'پودینہ اور دھنیا کے پتے'
    ],
    instructions: [
      'ثابت مصالحوں کے ساتھ چاولوں کو ابال لیں۔',
      'پیاز، ٹماٹر اور مصالحوں کے ساتھ چکن کا قورمہ تیار کریں۔',
      'دہی پھینٹ کر چکن میں شامل کریں۔',
      'چاول اور چکن کی تہیں لگائیں، اوپر زعفرانی دودھ ڈالیں۔',
      'برتن کو سیل کریں (دم لگائیں) اور 15-20 منٹ تک ہلکی آنچ پر پکائیں۔'
    ],
    featured: true,
    trending: true
  },
  {
    id: '4',
    title: 'گلاب جامن',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1528642461031-645391fd6f9f?q=80&w=2072&auto=format&fit=crop',
    prepTime: '20 منٹ',
    cookTime: '15 منٹ',
    cookTimeMinutes: 15,
    difficulty: 'Medium',
    dietaryRestrictions: ['Sweet', 'Vegetarian'],
    servings: '8',
    description: 'نرم، تلے ہوئے آٹے کے بال جو الائچی کے ذائقے والے میٹھے شیرے میں ڈبوئے ہوئے ہیں۔',
    ingredients: [
      '2 کپ کھویا',
      '1/2 کپ میدہ',
      'الائچی پاؤڈر',
      'شیرہ: 2 کپ چینی، 1 کپ پانی',
      'تلنے کے لیے تیل'
    ],
    instructions: [
      'کھویا اور میدہ ملا کر نرم آٹا گوندھ لیں۔',
      'بغیر دراڑ کے چھوٹی گیندیں بنائیں۔',
      'بہت ہلکی آنچ پر گہرا سنہرا ہونے تک ڈیپ فرائی کریں۔',
      'پیش کرنے سے پہلے کم از کم 30 منٹ تک گرم شیرے میں بھگو دیں۔'
    ]
  },
  {
    id: '5',
    title: 'چپلی کباب',
    category: 'Street Food',
    image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?q=80&w=2070&auto=format&fit=crop',
    prepTime: '25 منٹ',
    cookTime: '10 منٹ',
    cookTimeMinutes: 10,
    difficulty: 'Easy',
    dietaryRestrictions: ['Gluten Free', 'Spicy', 'Halal'],
    servings: '4',
    description: 'بیف یا مٹن کے قیمے، انار دانہ اور مصالحوں سے بنے پشتون طرز کے چپٹے کباب۔',
    ingredients: [
      '500 گرام قیمہ',
      '1 باریک کٹی ہوئی پیاز',
      '1 چمچ انار دانہ',
      'کٹا ہوا دھنیا اور زیرہ',
      'مکئی کا آٹا',
      'ٹماٹر کے قتلے'
    ],
    instructions: [
      'قیمے کو تمام مصالحوں اور مکئی کے آٹے کے ساتھ ملائیں۔',
      'چپٹی ٹکیاں بنائیں اور اوپر ٹماٹر کا قتلہ دبائیں۔',
      'تیل یا چربی میں فرائی کریں جب تک کہ اچھی طرح پک نہ جائیں۔'
    ],
    trending: true
  }
];

export const drinks = [
  {
    id: 'd1',
    title: 'میٹھی لسی',
    description: 'روایتی پنجابی دہی کا مشروب جو مٹی کے برتنوں میں ٹھنڈا کر کے پیش کیا جاتا ہے۔',
    image: 'https://images.unsplash.com/photo-1550506389-e9977585fdd2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'd2',
    title: 'روح افزا دودھ',
    description: 'گلاب کے ذائقے والا دودھ، جو ہر پاکستانی گرمی کا خاص مشروب ہے۔',
    image: 'https://images.unsplash.com/photo-1517311739265-79a6d7010f3c?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'd3',
    title: 'منٹ لیمونیڈ',
    description: 'تازہ پودینے اور لیموں کے ساتھ ایک فرحت بخش مشروب۔',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1974&auto=format&fit=crop'
  }
];

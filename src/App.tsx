import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
const ThreeDModel = lazy(() => import('./components/ThreeDModel'));
import { 
  ShoppingBag, 
  MapPin, 
  ChevronRight, 
  Droplets, 
  Star, 
  ArrowRight,
  Clock,
  Instagram,
  Youtube,
  Facebook,
  Menu,
  X,
  Share2,
  Minus,
  Plus
} from 'lucide-react';
import StoreLocator from './components/StoreLocator';

// Dr Pepper Variants Data
const variants = [
  {
    id: 'original',
    name: 'Original',
    tagline: 'The One & Only',
    color: 'from-[#A3002A] to-[#3B1F1F]',
    flavorIntensity: 95,
    description: 'A signature blend of 23 flavors that delivers an unexplainable, bold taste.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'zero',
    name: 'Zero Sugar',
    tagline: '23 Flavors. 0 Sugar.',
    color: 'from-black to-[#3B1F1F]',
    flavorIntensity: 92,
    description: 'All 23 flavors, zero sugar. The same mysterious taste you love, without the calories.',
    image: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'cherry',
    name: 'Cherry',
    tagline: 'Smooth & Tart',
    color: 'from-[#7A0019] to-[#3B1F1F]',
    flavorIntensity: 88,
    description: 'A smooth cherry twist that complements the original 23 flavors perfectly.',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'cream-soda',
    name: 'Cream Soda',
    tagline: 'Velvety Vanilla',
    color: 'from-[#FFF3E0] to-[#E5BE01]',
    flavorIntensity: 85,
    description: 'Smooth vanilla cream meets the bold taste of Dr Pepper for a velvety finish.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800'
  }
];

// Pre-calculate bubble data to keep render pure
const BUBBLES = [...Array(20)].map((_, i) => ({
  id: i,
  width: Math.random() * 20 + 5,
  height: Math.random() * 20 + 5,
  x: Math.random() * 100 + '%',
  duration: Math.random() * 10 + 10,
  delay: Math.random() * 20
}));

// Social Feed Images
const SOCIAL_IMAGES = [
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1556740734-7547457c1099?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1563229654-e0b628f8047c?auto=format&fit=crop&q=80&w=600"
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('04:22:15');
  const [cart, setCart] = useState<{ id: string, name: string, count: number, price: number, image: string }[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const addToCart = (product: typeof variants[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, count: item.count + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, count: 1, price: 5.99, image: product.image }];
    });
    
    setLastAdded(product.name);
    setTimeout(() => setLastAdded(null), 3000);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCount = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newCount = Math.max(1, item.count + delta);
        return { ...item, count: newCount };
      }
      return item;
    }));
  };

  const [clubStep, setClubStep] = useState<'input' | 'preferences' | 'success'>('input');
  const [clubData, setClubData] = useState({ name: '', email: '', flavor: '' });
  const [memberId, setMemberId] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setClubData(prev => ({ 
      ...prev, 
      name: formData.get('name') as string, 
      email: formData.get('email') as string 
    }));
    setClubStep('preferences');
  };

  const handleFlavorSelect = useCallback((flavor: string) => {
    setClubData(prev => ({ ...prev, flavor }));
    const id = 'DP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setMemberId(id);
    setClubStep('success');
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.count, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.count), 0);

  // Simple countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Mock countdown logic
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        if (s > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${(s - 1).toString().padStart(2, '0')}`;
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#A3002A] text-[#FFF3E0] font-sans selection:bg-[#3B1F1F] selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10 h-20 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black italic tracking-tighter cursor-pointer"
          >
            Dr <span className="text-[#FF2E2E]">Pepper</span>
          </motion.div>
          
          <div className="hidden md:flex gap-8 uppercase text-xs font-black tracking-widest opacity-80">
            {['Products', 'Our Story', 'Rewards', 'Shop'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF2E2E] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#shop" className="hidden sm:flex px-6 py-2 border-2 border-[#FFF3E0] rounded-full text-[10px] font-black uppercase hover:bg-[#FFF3E0] hover:text-[#A3002A] transition-all">
            Find Near You
          </a>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="px-8 py-2 bg-[#FF2E2E] text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-black/20 hover:scale-105 transition-transform active:scale-95 text-center flex items-center gap-2 relative"
          >
            <motion.div
              animate={cartCount > 0 ? { scale: [1, 1.2, 1] } : {}}
              key={cartCount}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              My Stash {cartCount > 0 && <span className="bg-white text-[#FF2E2E] px-1.5 py-0.5 rounded-full text-[8px]">{cartCount}</span>}
            </motion.div>
          </button>
          
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#3B1F1F] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-black italic uppercase">
              {['Products', 'Our Story', 'Rewards', 'Shop'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setIsMenuOpen(false)}>
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(163,0,42,0.1)_0%,_transparent_70%)] animate-pulse"></div>
            {/* Animated Bubbles */}
            {BUBBLES.map((bubble) => (
              <motion.div
                key={bubble.id}
                className="absolute bg-white/10 rounded-full blur-[2px]"
                initial={{ 
                  width: bubble.width, 
                  height: bubble.height,
                  x: bubble.x, 
                  y: '110%' 
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: bubble.duration, 
                  repeat: Infinity,
                  delay: bubble.delay
                }}
              />
            ))}
          </div>

          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-9xl font-black leading-[0.85] uppercase italic mb-8 tracking-tighter">
                Taste the <br/><span className="text-white drop-shadow-glow">Unexpected</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium opacity-90 max-w-lg mb-12">
                23 distinct flavors, blended into one mysterious, spicy, and satisfying symphony. It's not just a soda. It's a Pepper.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#products" className="px-10 py-5 bg-[#FF2E2E] text-white rounded-full font-black uppercase text-sm shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 active:scale-95">
                  Buy Now <ShoppingBag size={18} />
                </a>
                <a href="#shop" className="px-10 py-5 border-2 border-white/20 rounded-full font-black uppercase text-sm hover:bg-white/10 transition-all flex items-center gap-3">
                  Find Near You <MapPin size={18} />
                </a>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-drpepper-burgundy bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center">
                      <Star size={16} className="text-[#FF2E2E]" fill="#FF2E2E" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-[#FF2E2E] gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-70">1M+ Fan Reviews</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="relative aspect-square flex items-center justify-center min-h-[500px]"
            >
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/20">Loading 3D Experience...</div>}>
                <ThreeDModel />
              </Suspense>
              
              {/* Limited Edition Badge */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 right-0 w-32 h-32 bg-drpepper-cola border border-white/10 rounded-full flex items-center justify-center p-4 text-center z-20 shadow-2xl"
              >
                <div className="text-[10px] font-black uppercase leading-[1]">
                  Strawberries <br /> & Cream <br /> <span className="text-[#FF2E2E]">Limited</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Product Showcase */}
        <section id="products" className="py-32 px-6 md:px-12 bg-drpepper-cola relative overflow-hidden">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div>
                <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-4">Choose Your <span className="text-[#FF2E2E]">Vibe</span></h2>
                <p className="text-xl opacity-70 max-w-xl font-medium uppercase tracking-tight">The perfect balance of sweet, spicy, and mysterious in every drop.</p>
              </div>
              <button className="flex items-center gap-4 text-sm font-black uppercase tracking-widest group">
                View All Flavors <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {variants.map((v) => (
                <motion.div
                  key={v.id}
                  initial="initial"
                  whileHover="hover"
                  variants={{
                    initial: { y: 0, scale: 1 },
                    hover: { y: -10, scale: 1.02 }
                  }}
                  className="bg-white/5 rounded-[40px] p-6 md:p-8 border border-white/10 flex flex-col items-center justify-between group cursor-pointer transition-all duration-500 min-h-[550px] md:min-h-[600px] relative overflow-hidden"
                >
                  {/* Smooth Gradient Background Transition */}
                  <motion.div 
                    variants={{
                      initial: { opacity: 0, scale: 1.1 },
                      hover: { opacity: 0.2, scale: 1 }
                    }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 bg-gradient-to-br ${v.color} pointer-events-none`}
                  />

                  {/* Large Background Text (Visible and Stylized) */}
                  <div className="absolute top-4 left-0 w-full text-[100px] font-black italic uppercase text-white/[0.08] whitespace-nowrap pointer-events-none z-0 group-hover:text-[#FF2E2E]/15 transition-all duration-700 leading-none">
                    {v.name}
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Social Sharing Buttons */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {[
                      { Icon: Youtube, name: 'Youtube' },
                      { Icon: Facebook, name: 'Facebook' },
                      { Icon: Instagram, name: 'Instagram' },
                      { Icon: Share2, name: 'Link' }
                    ].map(({ Icon, name }, idx) => (
                      <div key={idx} className="relative group/tooltip">
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 46, 46, 1)' }}
                          whileActive={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Sharing ${v.name} on ${name}`);
                          }}
                        >
                          <Icon size={14} />
                        </motion.button>
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-white rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10">
                          Share on {name}
                        </div>
                      </div>
                    ))}
                  </div>

                  
                  <div className={`w-full aspect-[1/1] bg-gradient-to-b ${v.color} rounded-[2rem] shadow-2xl relative mb-6 group-hover:scale-105 transition-transform duration-500 z-10 p-2 overflow-hidden border border-white/10`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:12px_12px]"></div>
                    <img 
                      src={v.image} 
                      className="w-full h-full object-cover rounded-[1.5rem] shadow-inner brightness-110 contrast-125 saturate-150" 
                      alt={v.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>

                  <div className="text-center w-full relative z-10 space-y-4">
                    <div>
                      <h4 className="text-2xl md:text-3xl font-black italic uppercase mb-1 tracking-tighter leading-none">{v.name}</h4>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${v.flavorIntensity}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="h-full bg-[#FF2E2E]"
                          />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">{v.flavorIntensity}% Kick</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] font-bold opacity-60 leading-relaxed line-clamp-2 h-8">{v.description}</p>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(v);
                      }}
                      className={`w-full py-4 rounded-xl font-black uppercase text-[10px] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 ${
                        lastAdded === v.name 
                          ? 'bg-green-600 border-green-800 text-white scale-105' 
                          : 'bg-[#FF2E2E] border-red-900 text-white hover:bg-white hover:text-drpepper-burgundy hover:border-white'
                      }`}
                    >
                      {lastAdded === v.name ? (
                        <>✓ Added to Stash</>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Narrative Section - Our Story */}
        <section id="our-story" className="py-40 px-6 md:px-12 bg-drpepper-burgundy relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-drpepper-red/20 blur-[120px] rounded-full"></div>
          <div className="container mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-64 bg-drpepper-cola rounded-[40px] border border-white/10 overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="Vintage Waco" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest">Waco Drugstore Origins</div>
                  </div>
                  <div className="h-48 bg-drpepper-red/20 rounded-[40px] backdrop-blur-xl border border-white/10 flex items-center justify-center p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-center relative z-10">
                      <div className="text-5xl font-black italic mb-2">1885</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest">Established</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="h-48 bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center p-8 hover:bg-[#FF2E2E]/20 transition-colors">
                     <Droplets size={40} className="text-[#FF2E2E] animate-bounce" />
                  </div>
                  <div className="h-64 bg-drpepper-cola rounded-[40px] border border-white/10 overflow-hidden relative group">
                    <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="World's Fair 1904" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest">1904 World's Fair Breakout</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className="text-[#FF2E2E] font-black uppercase tracking-widest text-xs mb-6 inline-block">The Legend of the 23</span>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-none mb-8 tracking-tighter">A Story <br /><span className="text-white">Centuries Deep.</span></h2>
              <div className="space-y-6 mb-12">
                <p className="text-xl font-medium opacity-80 leading-relaxed">
                  Before the icons, before the global reach, there was a man named Charles Alderton in Waco, Texas. He didn't just want to make a soda; he wanted to capture the smell of a drugstore—a complex, fruity, and aromatic blend that became the America's oldest major soft drink.
                </p>
                <p className="text-base opacity-60 leading-relaxed">
                  From the legendary 10-2-4 "Dr Pepper Time" to the modern mysterious 23-flavor blend, we've remained fearlessly original. We are the square peg in the round hole of the soda world.
                </p>
              </div>
              
              <div className="space-y-8">
                {[
                  { title: 'Born in Waco', desc: 'Crafted in 1885 by a pharmacist who dared to blend 23 unique syrups.' },
                  { title: 'The 10-2-4 Rule', desc: 'A vintage mantra for energy: Drink a Pepper at 10, 2, and 4 o\'clock.' },
                  { title: 'Mystery Intact', desc: 'Only three people on Earth know the full recipe of the 23 flavors.' },
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex gap-6 items-start group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF2E2E] transition-colors">
                      <ChevronRight size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase italic mb-1 group-hover:text-[#FF2E2E] transition-colors">{item.title}</h4>
                      <p className="text-sm opacity-60 font-bold uppercase tracking-tight">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Promotions / Urgency - Rewards */}
        <section id="rewards" className="py-20 md:py-32 px-4 md:px-12 bg-black overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(163,0,42,0.2)_0%,_transparent_50%)]"></div>
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-[#3B1F1F] to-[#1a0a0a] rounded-[30px] md:rounded-[60px] p-6 sm:p-10 md:p-16 lg:p-20 relative border border-white/5 shadow-3xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 mb-6">
                  <div className="px-3 py-1 bg-[#FF2E2E] text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Pepper Rewards Program
                  </div>
                  <div className="flex items-center gap-2 text-[9px] md:text-xs font-bold opacity-60 uppercase">
                    <Clock size={12} /> Ends in {timeLeft}
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black italic uppercase mb-6 leading-tight">Limited <br className="hidden sm:block" /> Rewards <span className="text-[#FF2E2E] md:hidden lg:inline">&gt;</span></h3>
                <p className="text-sm md:text-base lg:text-lg font-medium opacity-70 max-w-md mb-8 mx-auto md:mx-0">
                  The more you sip, the more you win. Exclusive access to limited drops, merch, and VIP events in Waco.
                </p>
                <div className="flex justify-center md:justify-start">
                  <a 
                    href="#join-the-club" 
                    className="px-8 md:px-10 py-4 md:py-5 bg-[#FF2E2E] text-white rounded-full font-black uppercase text-[10px] md:text-xs shadow-xl hover:scale-105 transition-transform active:scale-95 inline-block"
                  >
                    Join the Club
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 aspect-video md:aspect-square relative max-w-sm md:max-w-none">
                <img 
                  src="https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover rounded-2xl md:rounded-[50px] shadow-2xl rotate-2 md:rotate-3 hover:rotate-0 transition-transform duration-700"
                  alt="Rewards Program"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Store Locator CTA - Shop */}
        <section id="shop" className="py-32 px-6 md:px-12 bg-drpepper-cola">
          <div className="container mx-auto max-w-5xl text-center">
            <MapPin size={64} className="mx-auto text-[#FF2E2E] mb-12" />
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase mb-8 leading-tight md:leading-none">Find a Pepper <br className="hidden sm:block" /> Near You</h2>
            <p className="text-lg md:text-xl font-medium opacity-70 mb-12 max-w-2xl mx-auto px-4">
              Craving the 23? We've mapped out every store, supermarket, and fountain within your reach.
            </p>
            
            <StoreLocator />
          </div>
        </section>

        {/* Social Feed */}
        <section className="py-32 bg-drpepper-burgundy overflow-hidden">
          <div className="px-6 md:px-12 mb-16">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase text-center">#DrPepperMoment</h2>
          </div>
          <div className="flex gap-4 animate-marquee whitespace-nowrap border-y border-white/5 py-12 bg-black/10">
            {[...SOCIAL_IMAGES, ...SOCIAL_IMAGES, ...SOCIAL_IMAGES].map((imgUrl, i) => {
              const socialLinks = [
                'https://www.instagram.com/rakshya.rajbanshi_?igsh=Ym1zeTF1NG1nYmwx',
                'https://www.facebook.com/rakshya.rajbanshi.9'
              ];
              const link = socialLinks[i % socialLinks.length];
              
              return (
                <a 
                  key={i} 
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-72 md:w-96 flex-shrink-0 group relative overflow-hidden rounded-[40px] border border-white/10 shadow-2xl block"
                >
                  <img 
                    src={imgUrl} 
                    className="w-full h-[500px] object-cover hover:scale-110 transition-transform duration-1000"
                    alt={`Pepper Fan Moment ${i + 1}`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="text-sm font-black uppercase text-[#FF2E2E]">@PepperFan_{100 + (i % SOCIAL_IMAGES.length)}</div>
                    <p className="text-xs font-medium opacity-70 mt-2 italic capitalize tracking-tight whitespace-normal leading-relaxed">Nothing beats the first cold sip on a hot day. One word: Perfection. 🥤🔥</p>
                    <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-40">
                      <Share2 size={10} /> View Post
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Join the Club Section (NEW) */}
        <section id="join-the-club" className="py-20 md:py-40 bg-drpepper-cola relative overflow-hidden pb-40 md:pb-60">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,_rgba(255,46,46,0.15)_0%,_transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_rgba(163,0,42,0.1)_0%,_transparent_50%)]"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-12 relative z-10">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-20">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 text-center lg:text-left w-full"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6 md:mb-8">
                  <span className="w-2 h-2 rounded-full bg-[#FF2E2E] animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pepper Insider Rewards</span>
                </div>
                <h2 className="text-[2.5rem] sm:text-6xl md:text-8xl lg:text-[110px] font-black italic uppercase leading-[0.85] mb-6 md:mb-8 tracking-tighter">
                  Join the <br /><span className="text-white">Elite 23.</span>
                </h2>
                <p className="text-sm md:text-2xl font-medium opacity-70 max-w-2xl mb-8 md:mb-12 lg:mx-0 mx-auto leading-relaxed">
                  Be the first to hear about secret flavor drops, legendary merch collaborations, and exclusive Waco events. This isn't just a club—it's a lifestyle.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 text-[9px] md:text-sm font-black uppercase tracking-widest text-[#FF2E2E]">
                    <Clock size={16} className="md:w-[20px] md:h-[20px]" /> Limited Spots Left
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  <div className="flex items-center gap-3 text-[9px] md:text-sm font-black uppercase tracking-widest opacity-60">
                    <Star size={16} className="md:w-[20px] md:h-[20px] fill-current" /> 12.4k Joined Today
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-[480px] relative"
              >
                <div className="bg-white/5 backdrop-blur-3xl p-8 sm:p-10 md:p-14 rounded-[30px] sm:rounded-[50px] border border-white/10 shadow-3xl relative overflow-hidden group">
                  {/* Subtle Background Decoration */}
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FF2E2E]/10 blur-[80px] rounded-full group-hover:bg-[#FF2E2E]/20 transition-colors duration-700"></div>
                  
                  <div className="relative z-10 min-h-[480px] flex flex-col">
                    <AnimatePresence mode="wait">
                      {clubStep === 'input' && (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <h3 className="text-2xl md:text-3xl font-black italic uppercase mb-6 md:mb-8 leading-none text-center lg:text-left">Get the Access</h3>
                          <form onSubmit={handleInitialSubmit} className="space-y-4 md:space-y-6">
                            <div className="space-y-2 md:space-y-4">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Name</label>
                              <input 
                                type="text" 
                                name="name"
                                placeholder="Rakshya Rajbanshi" 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 text-xs md:text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF2E2E] focus:bg-white/10 transition-all font-sans"
                              />
                            </div>
                            <div className="space-y-2 md:space-y-4">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                              <input 
                                type="email" 
                                name="email"
                                placeholder="rakshyaraj31@gmail.com" 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-4 md:py-5 text-xs md:text-sm font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF2E2E] focus:bg-white/10 transition-all font-sans"
                              />
                            </div>
                            <div className="pt-2 md:pt-4">
                              <button 
                                type="submit"
                                className="w-full py-5 md:py-6 bg-[#FF2E2E] text-white rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 md:gap-4 relative overflow-hidden group/btn"
                              >
                                <span className="relative z-10 flex items-center gap-2 md:gap-3 italic">
                                  Initialize Membership <ArrowRight size={18} />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                              </button>
                            </div>
                            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] opacity-30 text-center leading-relaxed">
                              By joining, you agree to our Terms of the 23 and acknowledge the mysterious nature of our flavor secrets.
                            </p>
                          </form>
                        </motion.div>
                      )}

                      {clubStep === 'preferences' && (
                        <motion.div
                          key="preferences"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col h-full"
                        >
                          <h3 className="text-2xl md:text-3xl font-black italic uppercase mb-6 md:mb-8 leading-none text-center lg:text-left">Select Your Signature</h3>
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            {variants.map(v => (
                              <button
                                key={v.id}
                                onClick={() => handleFlavorSelect(v.name)}
                                className="group/item relative overflow-hidden rounded-2xl border border-white/10 p-4 hover:border-[#FF2E2E] transition-all bg-white/5 text-left"
                              >
                                <img src={v.image} className="w-full h-24 object-cover rounded-lg mb-3 grayscale group-hover/item:grayscale-0 transition-all" alt={v.name} />
                                <span className="text-[10px] font-black uppercase italic block">{v.name}</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                          <button onClick={() => setClubStep('input')} className="mt-8 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <ChevronRight size={12} className="rotate-180" /> Back to details
                          </button>
                        </motion.div>
                      )}

                      {clubStep === 'success' && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center flex flex-col items-center justify-center py-8"
                        >
                          <motion.div 
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 bg-[#FF2E2E] rounded-full flex items-center justify-center mb-8 shadow-glow"
                          >
                             <Star size={32} className="text-white" fill="white" />
                          </motion.div>
                          <h3 className="text-3xl md:text-4xl font-black italic uppercase mb-4 leading-none tracking-tighter">Welcome, {clubData.name.split(' ')[0] || 'Pepper Fan'}</h3>
                          <p className="text-sm font-medium opacity-60 mb-10 leading-relaxed max-w-[280px] mx-auto">
                            Your status in the <span className="text-[#FF2E2E]">Elite 23</span> has been initialized. Prepare for secret flavor drops.
                          </p>
                          
                          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 w-full mb-8 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2E2E] to-transparent"></div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Member Access ID</div>
                            <div className="text-2xl md:text-3xl font-mono font-black text-[#FF2E2E] tracking-widest">{memberId}</div>
                          </div>
                          
                          <button 
                            onClick={() => {
                               setClubStep('input');
                               setClubData({ name: '', email: '', flavor: '' });
                            }}
                            className="text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
                          >
                             Apply for New Designation
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Floating Elements Around Form - Responsive position */}
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-16 h-16 md:w-24 md:h-24 bg-drpepper-burgundy border border-white/10 rounded-2xl md:rounded-3xl backdrop-blur-xl flex items-center justify-center -z-10 shadow-2xl"
                >
                  <Star className="text-[#FF2E2E]" fill="#FF2E2E" size={20} />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-14 h-14 md:w-20 md:h-20 bg-drpepper-cola border border-white/10 rounded-2xl md:rounded-[40px] backdrop-blur-xl flex items-center justify-center -z-10 shadow-2xl"
                >
                  <Droplets className="text-[#FF2E2E]" size={16} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-24 px-6 md:px-12 border-t border-white/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="text-6xl font-black italic tracking-tighter mb-8">
                Dr <span className="text-[#FF2E2E]">Pepper</span>
              </div>
              <p className="text-xl font-medium opacity-60 max-w-sm mb-12">
                Since 1885, we've been crafting the unexplainable. Join the revolution of the 23 flavors.
              </p>
              <div className="flex gap-4">
                {[
                  { Icon: Instagram, link: 'https://www.instagram.com/rakshya.rajbanshi_?igsh=Ym1zeTF1NG1nYmwx' },
                  { Icon: Youtube, link: 'https://youtube.com/@rockxya?si=tjKheXbn6xWsr7uj' },
                  { Icon: Facebook, link: 'https://www.facebook.com/rakshya.rajbanshi.9' }
                ].map(({ Icon, link }, i) => (
                  <a 
                    key={i} 
                    href={link} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#FF2E2E] transition-colors border border-white/10 group"
                  >
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-8 text-[#FF2E2E]">The Goods</h5>
              <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                <a href="#" className="hover:text-white transition-colors">Products</a>
                <a href="#" className="hover:text-white transition-colors">Our Story</a>
                <a href="#" className="hover:text-white transition-colors">Rewards</a>
                <a href="#" className="hover:text-white transition-colors">Apparel</a>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-8 text-[#FF2E2E]">Support</h5>
              <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Nutrition Info</a>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            <div>© 2026 DR PEPPER/SEVEN UP, INC. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-12">
              <span>EST. 1885 WACO, TX</span>
              <span>SUSTAINABILITY RE-ENGAGED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Bar (Mobile Conversion) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-2 shadow-3xl md:hidden">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="px-8 py-4 bg-drpepper-cream text-drpepper-burgundy rounded-full font-black uppercase text-xs shadow-xl active:scale-95 text-center relative"
        >
          My Stash
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF2E2E] text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] border-2 border-white/10">
              {cartCount}
            </span>
          )}
        </button>
        <a href="#shop" className="px-8 py-4 text-white rounded-full font-black uppercase text-xs text-center border-l border-white/10">Find</a>
        <a href="#our-story" className="px-8 py-4 text-white rounded-full font-black uppercase text-xs text-center border-l border-white/10">Story</a>
      </div>

      <AnimatePresence>
        {lastAdded && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[60] bg-white text-[#A3002A] px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-[#A3002A]/10"
          >
            <div className="w-8 h-8 bg-[#A3002A] rounded-full flex items-center justify-center text-white">
              <ShoppingBag size={14} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Added to Collection</div>
              <div className="text-sm font-black italic uppercase">{lastAdded} Dr Pepper</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#250d0d] z-[101] shadow-4xl flex flex-col border-l border-white/10"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Stash</h2>
                  <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">{cartCount} Items Collected</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <ShoppingBag size={64} className="mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest">Your collection is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 group"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black italic uppercase text-sm">{item.name}</h4>
                        <p className="text-[10px] font-black text-[#FF2E2E] mb-3">${(item.price * item.count).toFixed(2)}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-black/40 rounded-full border border-white/10 px-3 py-1">
                            <button onClick={() => updateCount(item.id, -1)} className="p-1 opacity-50 hover:opacity-100"><Minus size={12} /></button>
                            <span className="w-8 text-center text-xs font-black">{item.count}</span>
                            <button onClick={() => updateCount(item.id, 1)} className="p-1 opacity-50 hover:opacity-100"><Plus size={12} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black uppercase opacity-20 hover:opacity-100 hover:text-red-500 transition-all underline underline-offset-4">Remove</button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-[#1a0505] border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase opacity-40">Subtotal</span>
                    <span className="text-2xl font-black italic tracking-tighter">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      alert('Selection finalized! Your 23-flavor bundle is being prepared for shipment.');
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-6 bg-[#FF2E2E] text-white rounded-[2rem] font-black uppercase text-sm shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Finalize Collection <ArrowRight size={18} />
                  </button>
                  <p className="text-[8px] text-center font-black uppercase opacity-20 tracking-widest">Free Shipping on all 23-flavor bundles</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

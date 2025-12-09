import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, ExternalLink, Gift, DollarSign, Image as ImageIcon, X, Share2, Clock, Filter, Link as LinkIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Gift as GiftType, CATEGORIES } from '../types';

// Skeleton Component
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}></div>
);

export const Dashboard = () => {
  const { gifts, getGiftProgress, contribute, contributions } = useData(); // Assuming 'contributions' is available to force re-render if needed, though getGiftProgress handles it
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'almost' | 'recent' | string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter Logic
  const availableGifts = gifts.filter(g => 
    g.ownerId !== user?.id && 
    (g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.includes(searchTerm))
  ).filter(g => {
    const progress = getGiftProgress(g.id);
    if (filterType === 'all') return true;
    if (filterType === 'almost') return progress.percentage >= 80 && progress.percentage < 100;
    if (filterType === 'recent') {
       const date = new Date(g.createdAt);
       const now = new Date();
       const diffTime = Math.abs(now.getTime() - date.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       return diffDays <= 7;
    }
    // Category filter
    if (CATEGORIES.includes(filterType)) return g.category === filterType;
    return true;
  });

  const handleContribute = (giftId: string) => {
    if (amount <= 0) return;
    contribute(giftId, amount);
    setAmount(0);
  };

  const openModal = (gift: GiftType) => {
    setSelectedGift(gift);
    setCurrentImageIndex(0);
    setAmount(0);
  };

  const closeModal = () => {
    setSelectedGift(null);
  };

  const handleShare = async () => {
    if (!selectedGift) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ayuda a conseguir: ${selectedGift.name}`,
          text: selectedGift.description,
          url: window.location.href,
        });
      } catch (err) { console.log('Share aborted'); }
    } else {
      navigator.clipboard.writeText(`Mira este regalo: ${selectedGift.name} - Código: ${selectedGift.code}`);
      alert('Información copiada al portapapeles');
    }
  };

  const getDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOwnerPaymentLink = (ownerId: string) => {
    // In a real app we would join users table, here we simulate or check local storage if available globally
    // For simplicity, we can't easily access owner object here without fetching all users.
    // Let's assume we don't show it here unless we change DataContext to provide users map.
    // Feature request asked for it in profile, displayed in modal?
    // Let's rely on the Gift object having owner info if we had joined it, but currently we don't.
    // Skipping owner payment link in modal for now as it requires schema refactor to include Owner object in Gift or User lookup.
    return null; 
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explorar Regalos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ayuda a tus amigos a conseguir sus deseos.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilterType('almost')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'almost' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
        >
          Casi Listos
        </button>
        <button 
          onClick={() => setFilterType('recent')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'recent' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
        >
          Recientes
        </button>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === cat ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden h-96">
               <Skeleton className="h-48 w-full" />
               <div className="p-6 space-y-4">
                 <div className="flex justify-between">
                   <Skeleton className="h-6 w-1/2" />
                   <Skeleton className="h-6 w-16" />
                 </div>
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
                 <Skeleton className="h-8 w-full mt-4" />
               </div>
             </div>
           ))
        ) : availableGifts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Gift className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-lg text-slate-500 dark:text-slate-400">No hay regalos disponibles en esta categoría.</p>
          </div>
        ) : (
          availableGifts.map(gift => {
            const progress = getGiftProgress(gift.id);
            const isCompleted = progress.remaining === 0;
            const mainImage = gift.images && gift.images.length > 0 ? gift.images[0] : null;
            const daysLeft = getDaysLeft(gift.deadline);

            return (
              <div 
                key={gift.id} 
                onClick={() => openModal(gift)}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden relative bg-slate-50 dark:bg-slate-700">
                  {mainImage ? (
                    <img 
                      src={mainImage} 
                      alt={gift.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-sm font-medium">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {gift.code}
                  </div>
                  {gift.category && (
                    <div className="absolute top-2 left-2 bg-indigo-500/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm">
                      {gift.category}
                    </div>
                  )}
                  {isCompleted && (
                     <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-green-600 text-white px-4 py-1 rounded-full font-bold shadow-lg transform -rotate-6">COMPLETADO</span>
                     </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{gift.name}</h3>
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{gift.price}€</span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{gift.description}</p>
                  
                  {daysLeft !== null && !isCompleted && (
                    <div className={`flex items-center gap-1 text-xs mb-3 font-medium ${daysLeft <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {daysLeft < 0 ? 'Expirado' : `${daysLeft} días restantes`}
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      <span>Progreso</span>
                      <span>{progress.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-brand-500'}`} 
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal Pop-up */}
      {selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left: Gallery */}
            <div className="md:w-1/2 bg-slate-50 dark:bg-slate-900 p-6 flex flex-col justify-center relative">
               {selectedGift.images && selectedGift.images.length > 0 ? (
                 <>
                   <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-800 mb-4">
                     <img 
                       src={selectedGift.images[currentImageIndex]} 
                       alt={selectedGift.name} 
                       className="w-full h-full object-cover"
                     />
                   </div>
                   {selectedGift.images.length > 1 && (
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                       {selectedGift.images.map((img, idx) => (
                         <button 
                           key={idx}
                           onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                           className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${currentImageIndex === idx ? 'border-brand-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                         >
                           <img src={img} alt="" className="w-full h-full object-cover" />
                         </button>
                       ))}
                     </div>
                   )}
                 </>
               ) : (
                  <div className="aspect-square w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-20 h-20 mb-4 opacity-30" />
                    <span className="text-lg font-medium">No hay imágenes disponibles</span>
                  </div>
               )}
            </div>

            {/* Right: Info & Action */}
            <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto bg-white dark:bg-slate-800">
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <div className="flex gap-2 mb-2">
                       <span className="inline-block bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                         {selectedGift.code}
                       </span>
                       {selectedGift.category && (
                         <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                           {selectedGift.category}
                         </span>
                       )}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{selectedGift.name}</h2>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={handleShare} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors" title="Compartir">
                     <Share2 className="w-6 h-6" />
                   </button>
                   <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors">
                     <X className="w-6 h-6" />
                   </button>
                 </div>
               </div>

               <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                 {selectedGift.description}
               </p>

               {selectedGift.link && (
                 <a 
                   href={selectedGift.link} 
                   target="_blank" 
                   rel="noreferrer" 
                   className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium mb-8"
                 >
                   <ExternalLink className="w-4 h-4" /> Ver producto en tienda
                 </a>
               )}

               <div className="mt-auto bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  {(() => {
                    const progress = getGiftProgress(selectedGift.id);
                    const isCompleted = progress.remaining === 0;
                    const pieData = [
                      { name: 'Recaudado', value: progress.current },
                      { name: 'Restante', value: progress.remaining },
                    ];

                    return (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-20 h-20 flex-shrink-0">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={40}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="none"
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? (isCompleted ? '#22c55e' : '#d946ef') : '#94a3b8'} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-end mb-1">
                               <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Meta Total</span>
                               <span className="text-2xl font-bold text-slate-900 dark:text-white">{selectedGift.price}€</span>
                             </div>
                             <div className="text-sm text-slate-500 dark:text-slate-400">
                               Recaudado: <span className="text-brand-600 dark:text-brand-400 font-bold">{progress.current.toFixed(2)}€</span>
                               <span className="mx-2">•</span>
                               Falta: <span className="text-slate-700 dark:text-slate-300 font-bold">{progress.remaining.toFixed(2)}€</span>
                             </div>
                           </div>
                        </div>

                        {!isCompleted ? (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Realizar Aportación</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                  type="number" 
                                  min="1" 
                                  max={progress.remaining}
                                  value={amount || ''}
                                  onChange={(e) => setAmount(Number(e.target.value))}
                                  placeholder="Cantidad..."
                                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                />
                              </div>
                              <button 
                                onClick={() => handleContribute(selectedGift.id)}
                                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-none"
                              >
                                Aportar
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">
                              Tu aportación es anónima para otros usuarios.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-xl text-center font-bold">
                            ¡Regalo Completado! 🎉
                          </div>
                        )}
                      </div>
                    );
                  })()}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
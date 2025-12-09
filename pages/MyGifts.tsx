import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Gift as GiftIcon, Plus, Trash2, Edit2, Sparkles, Loader2, X, Image as ImageIcon, Lightbulb, Wand2 } from 'lucide-react';
import { Gift, CATEGORIES } from '../types';
import { generateGiftDescription, improveDescription, suggestGiftIdeas } from '../services/gemini';

export const MyGifts = () => {
  const { gifts, addGift, removeGift, getGiftProgress, notify } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [improvingAI, setImprovingAI] = useState(false);
  const [suggestingAI, setSuggestingAI] = useState(false);
  
  // Idea generation state
  const [interests, setInterests] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Gift>>({
    name: '',
    code: '',
    price: 0,
    description: '',
    link: '',
    images: [],
    deadline: '',
    category: CATEGORIES[0]
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const myGifts = gifts.filter(g => g.ownerId === user?.id);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      price: 0,
      description: '',
      link: '',
      images: [],
      deadline: '',
      category: CATEGORIES[0]
    });
    setCurrentImageUrl('');
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setLoadingAI(true);
    const desc = await generateGiftDescription(formData.name);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleImproveDescription = async () => {
    if (!formData.description) return;
    setImprovingAI(true);
    const improved = await improveDescription(formData.description);
    setFormData(prev => ({ ...prev, description: improved }));
    setImprovingAI(false);
  };

  const handleSuggestIdeas = async () => {
    if (!interests) return;
    setSuggestingAI(true);
    const results = await suggestGiftIdeas(interests);
    setIdeas(results);
    setSuggestingAI(false);
  };

  const useIdea = (idea: string) => {
    setFormData(prev => ({ ...prev, name: idea }));
    setIsIdeaModalOpen(false);
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (currentImageUrl && (formData.images?.length || 0) < 5) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), currentImageUrl]
      }));
      setCurrentImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.code || !formData.price) return;

    const finalImages = formData.images || [];

    const newGift: Gift = {
      id: formData.id || crypto.randomUUID(),
      ownerId: user.id,
      name: formData.name,
      code: formData.code,
      price: Number(formData.price),
      description: formData.description || '',
      link: formData.link || '',
      imageUrl: finalImages[0] || '',
      images: finalImages,
      createdAt: new Date().toISOString(),
      deadline: formData.deadline,
      category: formData.category
    };

    await addGift(newGift);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro? Se eliminarán también las aportaciones asociadas.')) {
      await removeGift(id);
    }
  };

  const handleEdit = (gift: Gift) => {
    setFormData(gift);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mis Listas de Regalos</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsIdeaModalOpen(true)}
            className="bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
          >
            <Lightbulb className="w-5 h-5" /> ¿Ideas?
          </button>
          <button 
            onClick={handleOpenModal}
            className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" /> Nuevo Regalo
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {myGifts.length === 0 ? (
           <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
             <GiftIcon className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-4" />
             <h3 className="text-xl font-medium text-slate-400">Aún no has creado ningún regalo</h3>
             <p className="text-slate-400">¡Empieza añadiendo uno para que tus amigos puedan aportar!</p>
           </div>
        ) : (
          myGifts.map(gift => {
            const progress = getGiftProgress(gift.id);
            const displayImage = (gift.images && gift.images.length > 0) ? gift.images[0] : null;

            return (
              <div key={gift.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 transition-colors">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={gift.name} 
                    className="w-24 h-24 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 flex flex-col items-center justify-center text-slate-400">
                     <ImageIcon className="w-6 h-6 mb-1" />
                     <span className="text-[10px] font-medium">Sin imagen</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{gift.name}</h3>
                       <div className="flex gap-2 mt-1">
                         <span className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-800">
                           {gift.code}
                         </span>
                         {gift.deadline && (
                           <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800">
                             {new Date(gift.deadline).toLocaleDateString()}
                           </span>
                         )}
                       </div>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => handleEdit(gift)} className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(gift.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                   
                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 truncate">{gift.description}</p>
                   
                   <div className="mt-4">
                     <div className="flex justify-between text-xs mb-1">
                       <span className="text-slate-500 dark:text-slate-400">Recaudado: {progress.current.toFixed(2)}€</span>
                       <span className="font-bold text-slate-700 dark:text-slate-300">Meta: {gift.price}€</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }}></div>
                     </div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.id ? 'Editar Regalo' : 'Crear Regalo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Límite</label>
                  <input 
                    type="date"
                    value={formData.deadline || ''} 
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio (€)</label>
                  <input 
                    type="number"
                    required 
                    min="1"
                    value={formData.price || ''} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
                  <input 
                    required 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleGenerateDescription}
                      disabled={!formData.name || loadingAI}
                      className="text-xs bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                    >
                      {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generar
                    </button>
                    <button 
                      type="button" 
                      onClick={handleImproveDescription}
                      disabled={!formData.description || improvingAI}
                      className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                    >
                      {improvingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      Mejorar
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  placeholder="Detalles sobre el regalo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link de Compra</label>
                <input 
                  type="url"
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
                  placeholder="https://tienda.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Imágenes (Máx 5)</label>
                <div className="flex gap-2 mb-2">
                   <input 
                    type="url"
                    value={currentImageUrl}
                    onChange={e => setCurrentImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    className="flex-1 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 text-sm px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button 
                    type="button"
                    onClick={handleAddImage}
                    disabled={!currentImageUrl}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    Añadir
                  </button>
                </div>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-lg bg-slate-100" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-none">
                  {formData.id ? 'Guardar Cambios' : 'Crear Regalo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ideas Modal */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> Sugerir Ideas
              </h2>
              <button onClick={() => setIsIdeaModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Dime qué le gusta a esta persona y te daré 3 ideas.</p>
              <textarea 
                rows={2}
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="Ej: Cocina italiana, Star Wars, Senderismo..."
                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 px-3 py-2"
              />
              <button 
                onClick={handleSuggestIdeas}
                disabled={!interests || suggestingAI}
                className="w-full bg-slate-900 dark:bg-brand-600 text-white font-bold py-2 rounded-xl hover:bg-slate-800 dark:hover:bg-brand-700 transition-colors flex justify-center items-center gap-2"
              >
                {suggestingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dame Ideas"}
              </button>

              {ideas.length > 0 && (
                <div className="space-y-2 mt-4">
                  {ideas.map((idea, idx) => (
                     <button 
                       key={idx} 
                       onClick={() => useIdea(idea)}
                       className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors border border-slate-100 dark:border-slate-600"
                     >
                       {idea}
                     </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
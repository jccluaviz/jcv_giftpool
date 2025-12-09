import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Download, Trash2, Calendar, TrendingUp, Edit2, X } from 'lucide-react';
import { generateContributionCertificate } from '../services/pdf';
import { Contribution } from '../types';

export const Contributions = () => {
  const { contributions, gifts, removeContribution, editContribution, getGiftProgress } = useData();
  const { user } = useAuth();
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const myContributions = contributions.filter(c => c.userId === user?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalContributed = myContributions.reduce((sum, c) => sum + c.amount, 0);

  const handleDownloadPDF = () => {
    if (user) {
      generateContributionCertificate(user, myContributions, gifts);
    }
  };

  const openEdit = (c: Contribution) => {
    setEditingId(c.id);
    setEditAmount(c.amount);
  };

  const handleUpdate = async () => {
    if (editingId && editAmount > 0) {
      await editContribution(editingId, editAmount);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Aportaciones</h1>
          <p className="text-slate-500">Gestiona tu historial y descarga certificados.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
           <div className="bg-brand-50 p-2 rounded-lg">
             <TrendingUp className="w-6 h-6 text-brand-600" />
           </div>
           <div>
             <p className="text-xs text-slate-500 font-medium">Total Aportado</p>
             <p className="text-xl font-bold text-slate-900">{totalContributed.toFixed(2)}€</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Historial</h2>
          <button 
            onClick={handleDownloadPDF}
            disabled={myContributions.length === 0}
            className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
        
        {myContributions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No has realizado ninguna aportación todavía.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myContributions.map(contribution => {
              const gift = gifts.find(g => g.id === contribution.giftId);
              return (
                <div key={contribution.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img 
                      src={gift?.imageUrl || 'https://picsum.photos/50'} 
                      alt="Gift" 
                      className="w-12 h-12 rounded-full object-cover bg-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900">{gift ? gift.name : 'Regalo eliminado'}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(contribution.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-bold text-brand-600">+{contribution.amount.toFixed(2)}€</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEdit(contribution)}
                        className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                        title="Editar cantidad"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('¿Seguro que quieres eliminar esta aportación?')) removeContribution(contribution.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar aportación"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Editar Aportación</h2>
              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Cantidad (€)</label>
                <input 
                  type="number" 
                  min="1"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full rounded-xl border-slate-200 focus:ring-brand-500 focus:border-brand-500 text-lg"
                />
              </div>
              <button 
                onClick={handleUpdate}
                className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
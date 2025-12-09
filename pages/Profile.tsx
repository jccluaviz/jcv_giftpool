import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Save, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { notify } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword(user.password || '');
      setAvatarUrl(user.avatarUrl || '');
      setPaymentLink(user.paymentLink || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await updateProfile({
        ...user,
        name,
        email,
        password,
        avatarUrl,
        paymentLink
      });
      notify('Perfil actualizado correctamente', 'success');
    } catch (err) {
      notify('Error al actualizar perfil', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Mi Perfil</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 overflow-hidden shadow-inner">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name}</h2>
            <p className="text-slate-500 dark:text-slate-400">Gestiona tus datos personales</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 h-12 px-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 h-12 px-4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 h-12 px-4"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Extras</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> URL Avatar (Opcional)</span>
                </label>
                <input 
                  type="url" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 h-12 px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Link de Pago (PayPal.me / Bizum)</span>
                </label>
                <input 
                  type="url" 
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://paypal.me/tu_usuario"
                  className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 h-12 px-4"
                />
                <p className="text-xs text-slate-400 mt-1">Este enlace aparecerá en tus regalos para facilitar el pago.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
             <button type="submit" className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-brand-700 transition-colors">
               <Save className="w-5 h-5" /> Guardar Cambios
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
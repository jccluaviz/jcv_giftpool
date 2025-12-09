import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gift, ArrowRight, Loader2 } from 'lucide-react';

export const Auth = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-brand-600 p-3 rounded-2xl shadow-lg shadow-brand-200 dark:shadow-none">
            <Gift className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          {isLogin ? 'Bienvenido a GiftPool' : 'Crea tu cuenta'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          La plataforma colaborativa para hacer regalos.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-3xl sm:px-10 border border-slate-100 dark:border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="appearance-none block w-full px-3 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="appearance-none block w-full px-3 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="appearance-none block w-full px-3 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            {error && <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                   <span className="flex items-center gap-2">
                     {isLogin ? 'Iniciar Sesión' : 'Registrarse'} <ArrowRight className="w-4 h-4" />
                   </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">o</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

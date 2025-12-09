import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Gift, Home, User as UserIcon, LogOut, List, DollarSign, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { notification } = useData();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? 'text-brand-700 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-300 font-semibold' 
    : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300';

  if (!user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Gift className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">
                  GiftPool
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive('/')}`}>
                <Home className="w-4 h-4" /> Inicio
              </Link>
              <Link to="/my-gifts" className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive('/my-gifts')}`}>
                <List className="w-4 h-4" /> Mis Listas
              </Link>
              <Link to="/contributions" className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive('/contributions')}`}>
                <DollarSign className="w-4 h-4" /> Mis Aportaciones
              </Link>
              <Link to="/profile" className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive('/profile')}`}>
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  )}
                </div>
                Perfil
              </Link>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

              <button 
                onClick={toggleTheme} 
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Cambiar tema"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button onClick={logout} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Bar (Bottom) */}
        <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around py-3 z-50 pb-safe">
           <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <Home className="w-6 h-6" />
              <span className="text-[10px]">Inicio</span>
           </Link>
           <Link to="/my-gifts" className={`flex flex-col items-center gap-1 ${location.pathname === '/my-gifts' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <List className="w-6 h-6" />
              <span className="text-[10px]">Listas</span>
           </Link>
           <Link to="/contributions" className={`flex flex-col items-center gap-1 ${location.pathname === '/contributions' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <DollarSign className="w-6 h-6" />
              <span className="text-[10px]">Aportes</span>
           </Link>
           <button onClick={toggleTheme} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
             {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
             <span className="text-[10px]">Tema</span>
           </button>
           <Link to="/profile" className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <UserIcon className="w-6 h-6" />
              <span className="text-[10px]">Perfil</span>
           </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 md:mb-0">
        {children}
      </main>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50 ${
          notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};
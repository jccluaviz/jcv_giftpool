import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Gift, Contribution } from '../types';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface DataContextType {
  gifts: Gift[];
  contributions: Contribution[];
  refreshData: () => void;
  addGift: (gift: Gift) => Promise<void>;
  removeGift: (id: string) => Promise<void>;
  contribute: (giftId: string, amount: number) => Promise<void>;
  editContribution: (contributionId: string, newAmount: number) => Promise<void>;
  removeContribution: (id: string) => Promise<void>;
  getGiftProgress: (giftId: string) => { current: number, total: number, percentage: number, remaining: number };
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  notification: { message: string, type: string, id: number } | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: string, id: number } | null>(null);

  const refreshData = () => {
    setGifts(storageService.getGifts());
    setContributions(storageService.getContributions());
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3000);
  };

  const addGift = async (gift: Gift) => {
    await storageService.saveGift(gift);
    refreshData();
    notify('Regalo guardado correctamente', 'success');
  };

  const removeGift = async (id: string) => {
    await storageService.deleteGift(id);
    refreshData();
    notify('Regalo eliminado', 'success');
  };

  const contribute = async (giftId: string, amount: number) => {
    if (!user) return;
    
    // Check limits
    const { remaining } = getGiftProgress(giftId);
    if (amount > remaining) {
      notify(`La cantidad supera el precio restante (${remaining.toFixed(2)}€)`, 'error');
      return;
    }

    await storageService.addContribution({
      giftId,
      userId: user.id,
      amount,
      date: new Date().toISOString()
    });
    
    refreshData();
    
    // Simulate Email to all users
    const gift = gifts.find(g => g.id === giftId);
    const newRemaining = remaining - amount;
    console.log(`[SIMULATED EMAIL] To: ALL_USERS, Subject: Nueva aportación! Body: Alguien ha aportado a ${gift?.name}. Faltan ${newRemaining.toFixed(2)}€.`);
    
    notify(`Aportación realizada. Se ha notificado a todos los usuarios.`, 'success');
  };

  const editContribution = async (contributionId: string, newAmount: number) => {
    const contribution = contributions.find(c => c.id === contributionId);
    if (!contribution) return;

    // Calculate limit: (Current Remaining + Old Amount)
    const { remaining } = getGiftProgress(contribution.giftId);
    const maxAllowed = remaining + contribution.amount;

    if (newAmount > maxAllowed) {
      notify(`La cantidad supera el precio total (Máx: ${maxAllowed.toFixed(2)}€)`, 'error');
      return;
    }

    await storageService.updateContribution(contributionId, newAmount);
    refreshData();
    notify('Aportación actualizada correctamente', 'success');
  };

  const removeContribution = async (id: string) => {
    await storageService.deleteContribution(id);
    refreshData();
    notify('Aportación eliminada', 'info');
  };

  const getGiftProgress = (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return { current: 0, total: 0, percentage: 0, remaining: 0 };
    
    const totalCollected = contributions
      .filter(c => c.giftId === giftId)
      .reduce((sum, c) => sum + c.amount, 0);
      
    const percentage = Math.min(100, (totalCollected / gift.price) * 100);
    
    return {
      current: totalCollected,
      total: gift.price,
      percentage,
      remaining: Math.max(0, gift.price - totalCollected)
    };
  };

  return (
    <DataContext.Provider value={{ 
      gifts, 
      contributions, 
      refreshData, 
      addGift, 
      removeGift, 
      contribute,
      editContribution,
      removeContribution,
      getGiftProgress,
      notify,
      notification
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
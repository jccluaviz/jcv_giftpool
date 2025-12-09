import { User, Gift, Contribution } from '../types';

const STORAGE_KEYS = {
  USERS: 'gp_users',
  GIFTS: 'gp_gifts',
  CONTRIBUTIONS: 'gp_contributions',
  CURRENT_USER: 'gp_current_user_id',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Safer ID generator for all environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const storageService = {
  // --- Auth ---
  register: async (user: Omit<User, 'id'>): Promise<User> => {
    await delay(300);
    const users = storageService.getUsers();
    if (users.find(u => u.email === user.email)) {
      throw new Error('El correo ya está registrado.');
    }
    const newUser = { ...user, id: generateId() };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await delay(300);
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciales inválidas.');
    return user;
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  updateUser: async (user: User): Promise<void> => {
    await delay(200);
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  // --- Gifts ---
  getGifts: (): Gift[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GIFTS);
    if (!data) return [];
    
    const parsedGifts: Gift[] = JSON.parse(data);
    // Migration logic: ensure 'images' array exists
    return parsedGifts.map(g => ({
      ...g,
      images: g.images || (g.imageUrl ? [g.imageUrl] : [])
    }));
  },

  saveGift: async (gift: Gift): Promise<void> => {
    await delay(200);
    const gifts = storageService.getGifts();
    const index = gifts.findIndex(g => g.id === gift.id);
    if (index !== -1) {
      gifts[index] = gift;
    } else {
      gifts.push(gift);
    }
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
  },

  deleteGift: async (giftId: string): Promise<void> => {
    await delay(200);
    let gifts = storageService.getGifts();
    gifts = gifts.filter(g => g.id !== giftId);
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
    
    // Cascade delete contributions
    let contributions = storageService.getContributions();
    contributions = contributions.filter(c => c.giftId !== giftId);
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
  },

  // --- Contributions ---
  getContributions: (): Contribution[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
    return data ? JSON.parse(data) : [];
  },

  addContribution: async (contribution: Omit<Contribution, 'id'>): Promise<Contribution> => {
    await delay(200);
    const contributions = storageService.getContributions();
    const newContribution = { ...contribution, id: generateId(), date: new Date().toISOString() };
    contributions.push(newContribution);
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
    return newContribution;
  },

  deleteContribution: async (id: string): Promise<void> => {
    await delay(200);
    let contributions = storageService.getContributions();
    contributions = contributions.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
  },

  updateContribution: async (id: string, amount: number): Promise<void> => {
    await delay(200);
    const contributions = storageService.getContributions();
    const index = contributions.findIndex(c => c.id === id);
    if (index !== -1) {
      contributions[index].amount = amount;
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
    }
  }
};

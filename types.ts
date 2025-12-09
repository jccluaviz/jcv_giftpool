export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // stored for demo auth
  avatarUrl?: string; // New: Custom avatar
  paymentLink?: string; // New: PayPal/Bizum/Me link
}

export interface Gift {
  id: string;
  ownerId: string; // User who wants the gift
  code: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; // Deprecated
  images: string[]; 
  link: string;
  createdAt: string;
  deadline?: string; // New: Event date
  category?: string; // New: Tech, Home, etc.
}

export interface Contribution {
  id: string;
  giftId: string;
  userId: string;
  amount: number;
  date: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export const CATEGORIES = [
  'Tecnología',
  'Hogar',
  'Moda',
  'Viajes',
  'Ocio',
  'Deportes',
  'Otros'
];
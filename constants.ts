import { Group, Category } from './types';

export const INITIAL_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Dev React France',
    description: 'Rejoignez la plus grande communauté de développeurs React en France. Entraide, veille technologique et bonne humeur ! ⚛️',
    link: 'https://chat.whatsapp.com/example1',
    category: Category.TECH,
    membersCount: 245,
    isVerified: true,
    createdAt: Date.now() - 10000000
  },
  {
    id: '2',
    name: 'Business & Crypto',
    description: 'Discussions sérieuses sur l\'entrepreneuriat, les crypto-monnaies et les investissements passifs. Pas de spam svp.',
    link: 'https://chat.whatsapp.com/example2',
    category: Category.BUSINESS,
    membersCount: 890,
    isVerified: false,
    createdAt: Date.now() - 5000000
  },
  {
    id: '3',
    name: 'Randonnées Paris',
    description: 'Groupe pour organiser des sorties rando autour de Paris le week-end. Tous niveaux acceptés 🥾.',
    link: 'https://chat.whatsapp.com/example3',
    category: Category.SPORTS,
    membersCount: 120,
    isVerified: true,
    createdAt: Date.now() - 2000000
  },
  {
    id: '4',
    name: 'Apprendre l\'Anglais',
    description: 'Practice your English skills daily with native speakers and learners. Voice notes encouraged!',
    link: 'https://chat.whatsapp.com/example4',
    category: Category.EDUCATION,
    membersCount: 56,
    isVerified: false,
    createdAt: Date.now()
  },
  {
    id: '5',
    name: 'Memes 24/7',
    description: 'Le meilleur de l\'humour internet. Attention, contenu parfois décalé. 😂',
    link: 'https://chat.whatsapp.com/example5',
    category: Category.FUN,
    membersCount: 1024,
    isVerified: true,
    createdAt: Date.now() - 80000000
  }
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.TECH]: 'bg-blue-100 text-blue-800',
  [Category.FUN]: 'bg-pink-100 text-pink-800',
  [Category.BUSINESS]: 'bg-gray-100 text-gray-800',
  [Category.EDUCATION]: 'bg-yellow-100 text-yellow-800',
  [Category.SOCIAL]: 'bg-purple-100 text-purple-800',
  [Category.HOBBIES]: 'bg-green-100 text-green-800',
  [Category.SPORTS]: 'bg-orange-100 text-orange-800',
  [Category.OTHER]: 'bg-slate-100 text-slate-800',
};

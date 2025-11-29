export enum Category {
  TECH = 'Technologie',
  FUN = 'Divertissement',
  BUSINESS = 'Business',
  EDUCATION = 'Éducation',
  SOCIAL = 'Rencontres',
  HOBBIES = 'Loisirs',
  SPORTS = 'Sports',
  OTHER = 'Autre'
}

export interface Group {
  id: string;
  name: string;
  description: string;
  link: string;
  category: Category;
  membersCount: number; // Simulated
  isVerified?: boolean;
  createdAt: number;
}

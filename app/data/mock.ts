import { IPost } from '../models/Post';
import { IUser } from '../models/User';
import { Statistics, File, Folder, ActionLog, User } from '../types';

// Mise à jour des utilisateurs mock avec les nouveaux champs
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Alex Martin',
    email: 'alex@example.com',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-03'),
  }
];

// Le reste du fichier reste inchangé...
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Utilisateurs par défaut - à remplacer par une base de données plus tard
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'jean.dupont@famille.com',
    name: 'Jean Dupont',
    role: 'admin'
  },
  {
    id: '2',
    email: 'marie.dupont@famille.com', 
    name: 'Marie Dupont',
    role: 'user'
  },
  {
    id: '3',
    email: 'pierre.dupont@famille.com',
    name: 'Pierre Dupont',
    role: 'user'
  }
];

// Mots de passe par défaut (à hasher en production)
const defaultPasswords: { [email: string]: string } = {
  'jean.dupont@famille.com': 'password123',
  'marie.dupont@famille.com': 'password123',
  'pierre.dupont@famille.com': 'password123'
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getUserByEmail(email: string): User | null {
  return defaultUsers.find(user => user.email === email) || null;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  // Pour l'instant, simple vérification du mot de passe
  // Plus tard, on utilisera des mots de passe hashés
  if (defaultPasswords[email] === password) {
    return user;
  }
  
  return null;
}

export function getAllUsers(): User[] {
  return defaultUsers;
}

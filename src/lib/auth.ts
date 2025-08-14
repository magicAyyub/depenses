import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users } from './db';
import { eq } from 'drizzle-orm';
import type { User } from './schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface LoginResult {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  token?: string;
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  message?: string;
}

// Hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Générer un token JWT
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Vérifier un token JWT
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Connexion utilisateur
export async function signIn(emailOrUsername: string, password: string): Promise<LoginResult> {
  try {
    // Chercher par email ou nom d'utilisateur
    const [user] = await db.select().from(users)
      .where(
        emailOrUsername.includes('@') 
          ? eq(users.email, emailOrUsername)
          : eq(users.username, emailOrUsername)
      )
      .limit(1);
    
    if (!user) {
      return { success: false, message: 'Utilisateur non trouvé' };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Mot de passe incorrect' };
    }

    const token = generateToken(user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Connexion réussie'
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, message: 'Erreur lors de la connexion' };
  }
}

// Inscription utilisateur
export async function registerUser(
  email: string,
  username: string,
  fullName: string,
  password: string,
  isAdmin: boolean = false
): Promise<RegisterResult> {
  try {
    const [existingUser] = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser) {
      return { success: false, message: 'Un utilisateur avec cet email existe déjà' };
    }

    const [existingUsername] = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUsername) {
      return { success: false, message: 'Ce nom d\'utilisateur est déjà pris' };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      email,
      username,
      fullName,
      passwordHash,
      isAdmin,
    }).returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      user: userWithoutPassword,
      message: 'Utilisateur créé avec succès'
    };
  } catch (error) {
    console.error('Register user error:', error);
    return { success: false, message: 'Erreur lors de la création de l\'utilisateur' };
  }
}

// Obtenir un utilisateur par son token
export async function getCurrentUser(token: string): Promise<Omit<User, 'passwordHash'> | null> {
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return null;
    }

    const [user] = await db.select().from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Déconnexion utilisateur (côté client)
export function signOut(): void {
  // Cette fonction sera utilisée côté client pour effacer les données locales
  // La vraie déconnexion se fait via l'API /auth/logout qui supprime le cookie
  if (typeof window !== 'undefined') {
    // Rediriger vers la page de connexion ou recharger la page
    window.location.href = '/login';
  }
}

// Obtenir un utilisateur par son ID
export async function getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
  try {
    const [user] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}

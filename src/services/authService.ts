import { User, AuthSession } from '../types';

const STORAGE_KEYS = {
  USERS: 'smart_civic_registered_users_v2',
  SESSION: 'smart_civic_auth_session_v2',
};

// Default Initial Accounts (Pre-configured for demonstration)
const DEFAULT_USERS: User[] = [
  {
    id: 'user_cit_default',
    name: 'Hemant Pandey',
    email: 'citizen@smartcivic.in',
    mobile: '+91 98201 44521',
    role: 'citizen',
    password: 'Password@123',
    createdAt: '2026-09-01T08:30:00Z',
  },
  {
    id: 'user_admin_default',
    name: 'Er. Vikramaditya Shinde',
    email: 'admin@smartcivic.gov.in',
    mobile: '+91 98190 11200',
    role: 'admin',
    password: 'Admin@123',
    createdAt: '2026-08-15T09:00:00Z',
  },
];

class AuthService {
  private users: User[] = [];
  private currentSession: AuthSession | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Load registered users
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...DEFAULT_USERS];
        this.persistUsers();
      }

      // Load session
      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (storedSession) {
        const session: AuthSession = JSON.parse(storedSession);
        // Verify expiration (30 days validity)
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          this.logout();
        }
      }
    } catch (e) {
      console.error('Failed to initialize auth service:', e);
      this.users = [...DEFAULT_USERS];
      this.currentSession = null;
    }
  }

  private persistUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to persist users:', e);
    }
  }

  private persistSession(session: AuthSession | null) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error('Failed to persist session:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Auth queries ---
  public isAuthenticated(): boolean {
    return this.currentSession !== null && this.currentSession.expiresAt > Date.now();
  }

  public getCurrentUser(): User | null {
    if (!this.isAuthenticated()) return null;
    return this.currentSession!.user;
  }

  public isAdmin(): boolean {
    return this.isAuthenticated() && this.currentSession!.user.role === 'admin';
  }

  public isCitizen(): boolean {
    return this.isAuthenticated() && this.currentSession!.user.role === 'citizen';
  }

  // --- Actions ---
  public login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const found = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    // Create session (expires in 30 days)
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: AuthSession = {
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        mobile: found.mobile,
        role: found.role,
        createdAt: found.createdAt,
      },
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    this.currentSession = session;
    this.persistSession(session);
    this.notify();

    return { success: true, user: session.user };
  }

  public register(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): { success: boolean; user?: User; error?: string } {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if email already registered
    if (this.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'This email is already registered. Please sign in instead.' };
    }

    if (!data.name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser: User = {
      id: `user_cit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      mobile: data.mobile.trim() || '+91 98000 00000',
      role: 'citizen', // Strictly citizen! Admin accounts cannot be created via public registration.
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.persistUsers();

    // Auto-login registered citizen
    return this.login(newUser.email, data.password);
  }

  public logout() {
    this.currentSession = null;
    this.persistSession(null);
    this.notify();
  }

  public getDemoCredentials() {
    return {
      citizen: { email: 'citizen@smartcivic.in', password: 'Password@123', name: 'Hemant Pandey' },
      admin: { email: 'admin@smartcivic.gov.in', password: 'Admin@123', name: 'Er. Vikramaditya Shinde' },
    };
  }
}

export const authService = new AuthService();

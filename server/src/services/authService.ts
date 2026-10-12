import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'golden-dynasty-super-secret-key';

interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  avatar: string;
  createdAt: number;
}

// In-memory user store
const users = new Map<string, UserRecord>();

export const authService = {
  async register(username: string, passwordPlain: string, avatar: string) {
    if (users.has(username.toLowerCase())) {
      throw new Error('Username already taken.');
    }
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user: UserRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username,
      passwordHash,
      avatar,
      createdAt: Date.now()
    };
    users.set(username.toLowerCase(), user);
    
    const token = jwt.sign({ id: user.id, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '24h' });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    };
  },

  async login(username: string, passwordPlain: string) {
    const user = users.get(username.toLowerCase());
    if (!user) {
      throw new Error('Invalid username or password.');
    }
    
    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password.');
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '24h' });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    };
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return null;
    }
  },

  updateAvatar(username: string, newAvatar: string) {
    const user = users.get(username.toLowerCase());
    if (user) {
      user.avatar = newAvatar;
      return user;
    }
    return null;
  },

  isUsernameTaken(username: string, currentUsername?: string): boolean {
    const key = username.toLowerCase().trim();
    const curr = (currentUsername || '').toLowerCase().trim();
    if (curr && key === curr) return false;
    return users.has(key);
  },

  updateProfile(currentUsername: string, newUsername: string, displayName: string, avatar: string) {
    const oldKey = (currentUsername || '').toLowerCase().trim();
    const newKey = (newUsername || '').toLowerCase().trim();

    if (newKey !== oldKey && users.has(newKey)) {
      throw new Error('Username already taken.');
    }

    let existing = oldKey ? users.get(oldKey) : undefined;
    if (existing) {
      if (newKey !== oldKey) {
        users.delete(oldKey);
      }
      existing.username = newUsername;
      existing.avatar = avatar;
      users.set(newKey, existing);
      return existing;
    } else {
      const user: UserRecord = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        username: newUsername,
        passwordHash: '',
        avatar,
        createdAt: Date.now()
      };
      users.set(newKey, user);
      return user;
    }
  }
};

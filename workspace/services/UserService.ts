import { Database } from '../config/database';
import { hashPassword, comparePassword } from '../utils/crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static db = Database.getInstance();

  static async findAll(): Promise<User[]> {
    return this.db.query('SELECT * FROM users');
  }

  static async findById(id: string): Promise<User | null> {
    const users = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const users = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  }

  static async create(data: Partial<User>): Promise<User> {
    const hashedPassword = await hashPassword(data.password!);
    const user = {
      ...data,
      password: hashedPassword,
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // TODO: Implement proper database insertion
    return user as User;
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    // TODO: Implement update logic
    throw new Error('Not implemented');
  }

  static async delete(id: string): Promise<void> {
    // TODO: Implement delete logic
    throw new Error('Not implemented');
  }

  static async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    return isValid ? user : null;
  }
}

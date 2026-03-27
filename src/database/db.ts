import { Sequelize } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import config from './config/config';
import { User } from './models/User';
import { Customer } from './models/Customer';
import { Shipment } from './models/Shipment';

const env = process.env.NODE_ENV || 'development';
const envConfig = config[env as keyof typeof config];

const db = new Sequelize({
  ...envConfig,
  models: [User, Customer, Shipment],
  logging: false,
});

async function seedDefaultUsers() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@nexbridge.local').trim().toLowerCase();
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  if (!existingAdmin) {
    await User.create({
      email: adminEmail,
      password: passwordHash,
      name: 'Administrator',
      role: 'admin',
      isActive: true,
    } as any);
    console.log(`Seeded admin user: ${adminEmail} (password from SEED_DEFAULT_PASSWORD or default)`);
  }
}

async function initializeDatabase() {
  try {
    await db.sync({ alter: true });
    await seedDefaultUsers();
    console.log('Database synced successfully (Nexbridge)');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
}

export { db, initializeDatabase };

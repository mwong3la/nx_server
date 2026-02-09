import { Sequelize } from 'sequelize-typescript';
import config from './config/config';
import { User } from './models/User';
import { Vehicle } from './models/Vehicle';
import { Inspection } from './models/Inspection';
import { DiagnosticReport } from './models/DiagnosticReport';
import { SubscriptionPlan } from './models/SubscriptionPlan';
import { Subscription } from './models/Subscription';
import { Payment } from './models/Payment';

const env = process.env.NODE_ENV || 'development';
const envConfig = config[env as keyof typeof config];

const db = new Sequelize({
  ...envConfig,
  models: [
    User,
    Vehicle,
    Inspection,
    DiagnosticReport,
    SubscriptionPlan,
    Subscription,
    Payment,
  ],
  define: {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  logging: false,
});

async function seedSubscriptionPlans() {
  const count = await SubscriptionPlan.count();
  if (count > 0) return;
  await SubscriptionPlan.bulkCreate([
    { name: 'Starter', slug: 'starter', description: 'Basic inspections', priceMonthly: 19.99, priceYearly: 199.99, features: ['5 inspections/year', 'Basic report'], inspectionLimit: 5 },
    { name: 'Pro', slug: 'pro', description: 'Full diagnostic oversight', priceMonthly: 39.99, priceYearly: 399.99, features: ['Unlimited inspections', 'Full diagnostic report', 'Priority support'], inspectionLimit: null },
  ]);
  console.log('Seeded subscription plans');
}

async function initializeDatabase() {
  try {
    await db.sync({ alter: true });
    await seedSubscriptionPlans();
    console.log('Database synced successfully (Coltium-Auto)');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
}

export { db, initializeDatabase };

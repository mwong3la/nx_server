"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
const sequelize_typescript_1 = require("sequelize-typescript");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("./config/config"));
const User_1 = require("./models/User");
const Vehicle_1 = require("./models/Vehicle");
const Inspection_1 = require("./models/Inspection");
const DiagnosticReport_1 = require("./models/DiagnosticReport");
const SubscriptionPlan_1 = require("./models/SubscriptionPlan");
const Subscription_1 = require("./models/Subscription");
const Payment_1 = require("./models/Payment");
const env = process.env.NODE_ENV || 'development';
const envConfig = config_1.default[env];
const db = new sequelize_typescript_1.Sequelize({
    ...envConfig,
    models: [
        User_1.User,
        Vehicle_1.Vehicle,
        Inspection_1.Inspection,
        DiagnosticReport_1.DiagnosticReport,
        SubscriptionPlan_1.SubscriptionPlan,
        Subscription_1.Subscription,
        Payment_1.Payment,
    ],
    logging: false,
});
exports.db = db;
async function seedSubscriptionPlans() {
    const count = await SubscriptionPlan_1.SubscriptionPlan.count();
    if (count > 0)
        return;
    await SubscriptionPlan_1.SubscriptionPlan.bulkCreate([
        { name: 'Starter', slug: 'starter', description: 'Basic inspections', priceMonthly: 19.99, priceYearly: 199.99, features: ['5 inspections/year', 'Basic report'], inspectionLimit: 5 },
        { name: 'Pro', slug: 'pro', description: 'Full diagnostic oversight', priceMonthly: 39.99, priceYearly: 399.99, features: ['Unlimited inspections', 'Full diagnostic report', 'Priority support'], inspectionLimit: null },
    ]);
    console.log('Seeded subscription plans');
}
async function seedDefaultUsers() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@coltium-auto.com';
    const techEmail = process.env.SEED_TECH_EMAIL || 'tech@coltium-auto.com';
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'Coltium123!';
    const existingAdmin = await User_1.User.findOne({ where: { email: adminEmail } });
    const existingTech = await User_1.User.findOne({ where: { email: techEmail } });
    const passwordHash = await bcrypt_1.default.hash(defaultPassword, 10);
    if (!existingAdmin) {
        await User_1.User.create({
            email: adminEmail,
            password: passwordHash,
            name: 'Coltium Admin',
            role: 'admin',
            isActive: true,
        });
        console.log(`Seeded admin user: ${adminEmail} / ${defaultPassword}`);
    }
    if (!existingTech) {
        await User_1.User.create({
            email: techEmail,
            password: passwordHash,
            name: 'Coltium Technician',
            role: 'technician',
            isActive: true,
        });
        console.log(`Seeded technician user: ${techEmail} / ${defaultPassword}`);
    }
}
async function initializeDatabase() {
    try {
        await db.sync({ alter: true });
        await seedSubscriptionPlans();
        await seedDefaultUsers();
        console.log('Database synced successfully (Coltium-Auto)');
    }
    catch (error) {
        console.error('Failed to sync database:', error);
    }
}

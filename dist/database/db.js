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
const Customer_1 = require("./models/Customer");
const Shipment_1 = require("./models/Shipment");
const env = process.env.NODE_ENV || 'development';
const envConfig = config_1.default[env];
const db = new sequelize_typescript_1.Sequelize({
    ...envConfig,
    models: [User_1.User, Customer_1.Customer, Shipment_1.Shipment],
    logging: false,
});
exports.db = db;
async function seedDefaultUsers() {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@nexbridge.local').trim().toLowerCase();
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'ChangeMe123!';
    const existingAdmin = await User_1.User.findOne({ where: { email: adminEmail } });
    const passwordHash = await bcrypt_1.default.hash(defaultPassword, 10);
    if (!existingAdmin) {
        await User_1.User.create({
            email: adminEmail,
            password: passwordHash,
            name: 'Administrator',
            role: 'admin',
            isActive: true,
        });
        console.log(`Seeded admin user: ${adminEmail} (password from SEED_DEFAULT_PASSWORD or default)`);
    }
}
async function initializeDatabase() {
    try {
        await db.sync({ alter: true });
        await seedDefaultUsers();
        console.log('Database synced successfully (Nexbridge)');
    }
    catch (error) {
        console.error('Failed to sync database:', error);
    }
}

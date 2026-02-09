"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
const sequelize_typescript_1 = require("sequelize-typescript");
const config_1 = __importDefault(require("./config/config"));
const Goal_1 = __importDefault(require("./models/Goal"));
const KPI_1 = __importDefault(require("./models/KPI"));
const Event_1 = __importDefault(require("./models/Event"));
const DonationIn_1 = __importDefault(require("./models/DonationIn"));
const DonationOut_1 = __importDefault(require("./models/DonationOut"));
const DonationGoal_1 = __importStar(require("./models/DonationGoal"));
const User_1 = require("./models/User");
const Feedback_1 = require("./models/Feedback");
const AuditLog_1 = require("./models/AuditLog");
const Organization_1 = require("./models/Organization");
const Volunteer_1 = require("./models/Volunteer");
const Participant_1 = require("./models/Participant");
const Media_1 = require("./models/Media");
const Comment_1 = __importDefault(require("./models/Comment"));
const Theme_1 = __importDefault(require("./models/Theme"));
const Partner_1 = require("./models/Partner");
const Gallery_1 = require("./models/Gallery");
const News_1 = require("./models/News");
const DownloadableContent_1 = require("./models/DownloadableContent");
const env = process.env.NODE_ENV || 'development';
const envConfig = config_1.default[env];
const db = new sequelize_typescript_1.Sequelize({
    ...envConfig,
    models: [
        User_1.User,
        Organization_1.Organization,
        Theme_1.default,
        AuditLog_1.AuditLog,
        Goal_1.default,
        KPI_1.default,
        DonationIn_1.default,
        DonationGoal_1.default,
        DonationOut_1.default,
        DonationGoal_1.DonationOutGoal,
        Event_1.default,
        Volunteer_1.Volunteer,
        Participant_1.Participant,
        Partner_1.Partner,
        Feedback_1.Feedback,
        Media_1.Media,
        Comment_1.default,
        Gallery_1.Gallery,
        News_1.News,
        DownloadableContent_1.DownloadableContent,
    ],
    define: {
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    modelMatch: (filename, member) => {
        return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    },
    logging: false
});
exports.db = db;
Goal_1.default.initializeHooks();
KPI_1.default.initializeHooks();
Theme_1.default.hasMany(Goal_1.default, { foreignKey: 'themeId' });
Goal_1.default.belongsTo(Theme_1.default, { foreignKey: 'themeId' });
async function initializeDatabase() {
    try {
        // if (process.env.NODE_ENV === 'development') {
        await db.sync({ alter: true });
        // }
        console.log('Database synced successfuly!');
    }
    catch (error) {
        console.error('Failed to sync database:', error);
    }
}

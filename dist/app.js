"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_routes_1 = __importDefault(require("./routes/api.routes"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./database/db");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, cors_1.default)({
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
    res.json({ message: "Coltium-Auto API", version: "1.0" });
});
app.use("/api/v1", api_routes_1.default);
async function startServer() {
    try {
        await (0, db_1.initializeDatabase)();
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();

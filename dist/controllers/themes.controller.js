"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTheme = exports.updateTheme = exports.getThemeById = exports.getThemes = exports.createTheme = void 0;
const Theme_1 = __importDefault(require("../database/models/Theme"));
const Goal_1 = __importDefault(require("../database/models/Goal"));
const createTheme = async (req, res) => {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ message: 'Theme name is required' });
        return;
    }
    try {
        const theme = await Theme_1.default.create({
            name: name.trim(),
            description: description?.trim(),
        });
        res.status(201).json(theme);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create theme', error });
    }
};
exports.createTheme = createTheme;
const getThemes = async (_req, res) => {
    try {
        const themes = await Theme_1.default.findAll({ order: [['created_at', 'DESC']] });
        res.status(200).json(themes);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch themes', error });
    }
};
exports.getThemes = getThemes;
const getThemeById = async (req, res) => {
    try {
        const { id } = req.params;
        const theme = await Theme_1.default.findByPk(id, {
            include: [{
                    model: Goal_1.default,
                    as: 'goals',
                }],
            order: [['goals', 'created_at', 'DESC']],
        });
        if (!theme) {
            res.status(404).json({ message: 'Theme not found' });
            return;
        }
        res.status(200).json(theme);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
exports.getThemeById = getThemeById;
const updateTheme = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const theme = await Theme_1.default.findByPk(id);
        if (!theme) {
            res.status(404).json({ message: 'Theme not found' });
            return;
        }
        if (name && typeof name === 'string')
            theme.name = name.trim();
        if (description && typeof description === 'string')
            theme.description = description.trim();
        await theme.save();
        res.status(200).json(theme);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update theme', error });
        return;
    }
};
exports.updateTheme = updateTheme;
const deleteTheme = async (req, res) => {
    const { id } = req.params;
    try {
        const theme = await Theme_1.default.findByPk(id);
        if (!theme) {
            res.status(404).json({ message: 'Theme not found' });
            return;
        }
        await theme.destroy();
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete theme', error });
    }
};
exports.deleteTheme = deleteTheme;

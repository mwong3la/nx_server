"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.containerClient = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
let containerClient;
if (AZURE_STORAGE_CONNECTION_STRING && containerName) {
    const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    exports.containerClient = containerClient = blobServiceClient.getContainerClient(containerName);
}
else {
    console.warn('[Azure Blob] Missing connection string or container name. Blob client not initialized.');
}

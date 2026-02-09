"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToAzure = uploadBufferToAzure;
const azureBlob_1 = require("../lib/azureBlob");
const uuid_1 = require("uuid");
async function uploadBufferToAzure(file) {
    const blobName = `${(0, uuid_1.v4)()}-${file.originalname}`;
    const blockBlobClient = azureBlob_1.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });
    return blockBlobClient.url;
}

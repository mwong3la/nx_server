import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import dotenv from 'dotenv'
dotenv.config()

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

let containerClient: ContainerClient | undefined;

if (AZURE_STORAGE_CONNECTION_STRING && containerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  containerClient = blobServiceClient.getContainerClient(containerName);
} else {
  console.warn('[Azure Blob] Missing connection string or container name. Blob client not initialized.');
}

export { containerClient };

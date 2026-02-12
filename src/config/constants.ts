import { PublicKey } from '@solana/web3.js';

// ========================================
// Network & RPC
// ========================================
export const SOLANA_CLUSTER = 'devnet';
export const HELIUS_API_KEY = '1c441d66-4509-4232-9422-44aa5359dec3';
export const NFT_STORAGE_API_KEY = '8940dce4.8f29a3a8d6f440f6b7e5f3e2f79bbb77';
export const RPC_ENDPOINT = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
export const HELIUS_DAS_URL = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// ========================================
// On-Chain Addresses (Devnet)
// These should be populated after running scripts/setup-devnet.ts
// ========================================
export const MERKLE_TREE_ADDRESS = new PublicKey('11111111111111111111111111111111'); // placeholder
export const COLLECTION_MINT_ADDRESS = new PublicKey('11111111111111111111111111111111'); // placeholder
export const SKR_MINT_ADDRESS = new PublicKey('11111111111111111111111111111111'); // placeholder — mock SKR-DEV token
export const TREE_AUTHORITY = new PublicKey('11111111111111111111111111111111'); // placeholder

// ========================================
// SKR Economics
// ========================================
export const SKR_DECIMALS = 9;
export const MINT_FEE_SKR = 1; // 1 SKR burned per mint
export const TIP_AMOUNTS = [1, 5, 10]; // SKR tip presets

// ========================================
// Image Processing
// ========================================
export const MAX_IMAGE_WIDTH = 1200;
export const IMAGE_QUALITY = 0.8; // 80% JPEG quality

// ========================================
// Feed / Query Config
// ========================================
export const FEED_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const BALANCE_STALE_TIME = 30 * 1000; // 30 seconds
export const FEED_PAGE_SIZE = 20;

// ========================================
// App Identity (MWA)
// ========================================
export const APP_IDENTITY = {
  name: 'SolFLux',
  uri: 'https://solflux.app',
  icon: 'favicon.ico',
};

// ========================================
// IPFS Gateways
// ========================================
export const IPFS_GATEWAY = 'https://nftstorage.link/ipfs/';

// ========================================
// Bubblegum Program
// ========================================
export const BUBBLEGUM_PROGRAM_ID = new PublicKey(
  'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'
);

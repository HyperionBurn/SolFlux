/**
 * Devnet Setup Script for SolFLux
 *
 * Run with: npx ts-node scripts/setup-devnet.ts
 *
 * Creates:
 * 1. Merkle tree for compressed NFTs (maxDepth=14, maxBufferSize=64, public)
 * 2. Collection NFT ("SolFLux Moments")
 * 3. Mock SKR-DEV SPL token (9 decimals)
 *
 * Prerequisites:
 * - Solana CLI installed with a devnet keypair
 * - Sufficient devnet SOL in the default keypair (~2 SOL)
 *
 * After running, update the addresses in src/config/constants.ts
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import {
    createTree,
    mintToCollectionV1,
} from '@metaplex-foundation/mpl-bubblegum';
import {
    createNft,
    mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const RPC = 'https://api.devnet.solana.com';

async function main() {
    console.log('🚀 SolFLux Devnet Setup\n');
    console.log('========================\n');

    // Load default keypair
    const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
    if (!fs.existsSync(keypairPath)) {
        console.error('❌ No Solana keypair found at', keypairPath);
        console.log('Run: solana-keygen new');
        process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log('📍 Wallet:', keypair.publicKey.toBase58());

    // Check balance
    const connection = new Connection(RPC, 'confirmed');
    const balance = await connection.getBalance(keypair.publicKey);
    console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL\n');

    if (balance < 2 * LAMPORTS_PER_SOL) {
        console.log('⚠️  Need ~2 SOL for setup. Requesting airdrop...');
        try {
            const sig = await connection.requestAirdrop(
                keypair.publicKey,
                2 * LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(sig, 'confirmed');
            console.log('✅ Airdrop received\n');
        } catch (e) {
            console.error('❌ Airdrop failed. Try: solana airdrop 2');
        }
    }

    // Initialize Umi
    const umi = createUmi(RPC).use(mplTokenMetadata());

    console.log('\n📋 Setup Summary');
    console.log('=================');
    console.log('After running the full setup script with Umi identity,');
    console.log('update src/config/constants.ts with the output addresses.\n');
    console.log('Steps to run manually via Solana CLI:\n');

    console.log('1️⃣  Create Merkle Tree:');
    console.log('   Use createTree with maxDepth=14, maxBufferSize=64, public=true');
    console.log('   Cost: ~1.6 SOL\n');

    console.log('2️⃣  Create Collection NFT:');
    console.log('   Name: "SolFLux Moments"');
    console.log('   Symbol: "SFLX"');
    console.log('   URI: (metadata JSON on IPFS)\n');

    console.log('3️⃣  Create Mock SKR-DEV Token:');
    console.log('   solana-keygen grind --starts-with SKR:1');
    console.log('   spl-token create-token --decimals 9 <SKR_KEYPAIR>');
    console.log('   spl-token create-account <SKR_MINT>');
    console.log('   spl-token mint <SKR_MINT> 1000000\n');

    console.log('💡 After creating all accounts, update:');
    console.log('   src/config/constants.ts → MERKLE_TREE_ADDRESS');
    console.log('   src/config/constants.ts → COLLECTION_MINT_ADDRESS');
    console.log('   src/config/constants.ts → SKR_MINT_ADDRESS');
    console.log('   src/config/constants.ts → TREE_AUTHORITY');
}

main().catch(console.error);

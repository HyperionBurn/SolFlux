/**
 * cNFT Minting Service — Bubblegum mintToCollectionV1
 * Builds mint transactions using raw web3.js instructions
 * (Avoids Umi-to-MWA bridge complexity for hackathon reliability)
 */
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    AccountMeta,
} from '@solana/web3.js';
// Inline program IDs to avoid spl-account-compression type issues
const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey(
    'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'
);
const SPL_NOOP_PROGRAM_ID = new PublicKey(
    'noopb9bkMVfRPU8AsBHBNRg6eTKQWRvkUGBCk3Jip9p'
);
import {
    MERKLE_TREE_ADDRESS,
    COLLECTION_MINT_ADDRESS,
    BUBBLEGUM_PROGRAM_ID,
    RPC_ENDPOINT,
} from '../config/constants';
import { buildBurnInstruction } from './skr';

// Token Metadata Program
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Derive the tree authority PDA
 */
function getTreeAuthority(merkleTree: PublicKey): PublicKey {
    const [treeAuthority] = PublicKey.findProgramAddressSync(
        [merkleTree.toBuffer()],
        BUBBLEGUM_PROGRAM_ID
    );
    return treeAuthority;
}

/**
 * Derive the bubblegum signer PDA
 */
function getBubblegumSigner(): PublicKey {
    const [signer] = PublicKey.findProgramAddressSync(
        [Buffer.from('collection_cpi')],
        BUBBLEGUM_PROGRAM_ID
    );
    return signer;
}

/**
 * Derive metadata PDA for collection
 */
function getMetadataPDA(mint: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    return pda;
}

/**
 * Derive master edition PDA for collection
 */
function getMasterEditionPDA(mint: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    return pda;
}

/**
 * Build Bubblegum mintToCollectionV1 instruction data
 */
function buildMintToCollectionV1Data(
    name: string,
    symbol: string,
    uri: string,
    creators: Array<{ address: PublicKey; verified: boolean; share: number }>,
    sellerFeeBasisPoints: number = 0,
    isMutable: boolean = false
): Buffer {
    // Bubblegum mintToCollectionV1 discriminator
    const discriminator = Buffer.from([153, 18, 178, 47, 197, 158, 86, 15]);

    // Serialize metadata args using Borsh-like encoding
    const nameBytes = Buffer.from(name);
    const symbolBytes = Buffer.from(symbol);
    const uriBytes = Buffer.from(uri);

    const buffers: Buffer[] = [discriminator];

    // MetadataArgs struct
    // name (string)
    const nameLen = Buffer.alloc(4);
    nameLen.writeUInt32LE(nameBytes.length);
    buffers.push(nameLen, nameBytes);

    // symbol (string)
    const symbolLen = Buffer.alloc(4);
    symbolLen.writeUInt32LE(symbolBytes.length);
    buffers.push(symbolLen, symbolBytes);

    // uri (string)
    const uriLen = Buffer.alloc(4);
    uriLen.writeUInt32LE(uriBytes.length);
    buffers.push(uriLen, uriBytes);

    // seller_fee_basis_points (u16)
    const fee = Buffer.alloc(2);
    fee.writeUInt16LE(sellerFeeBasisPoints);
    buffers.push(fee);

    // creators (option<vec>)
    if (creators.length > 0) {
        buffers.push(Buffer.from([1])); // Some
        const creatorsLen = Buffer.alloc(4);
        creatorsLen.writeUInt32LE(creators.length);
        buffers.push(creatorsLen);
        for (const creator of creators) {
            buffers.push(creator.address.toBuffer());
            buffers.push(Buffer.from([creator.verified ? 1 : 0]));
            buffers.push(Buffer.from([creator.share]));
        }
    } else {
        buffers.push(Buffer.from([0])); // None
    }

    // primary_sale_happened (bool)
    buffers.push(Buffer.from([0]));

    // is_mutable (bool)
    buffers.push(Buffer.from([isMutable ? 1 : 0]));

    // edition_nonce (option<u8>) - None
    buffers.push(Buffer.from([0]));

    // token_standard (option<TokenStandard>) - Some(NonFungible)
    buffers.push(Buffer.from([1, 0]));

    // collection (option<Collection>) - Some
    buffers.push(Buffer.from([1]));
    buffers.push(Buffer.from([1])); // verified = true
    buffers.push(COLLECTION_MINT_ADDRESS.toBuffer());

    // uses (option<Uses>) - None
    buffers.push(Buffer.from([0]));

    // token_program_version - Original
    buffers.push(Buffer.from([0]));

    // creator_verified (bool) - for collection
    buffers.push(Buffer.from([0]));

    return Buffer.concat(buffers);
}

/**
 * Build a complete mint transaction with SKR burn
 */
export async function buildMintTransaction(
    payerPubkey: PublicKey,
    metadataUri: string,
    name: string,
    connection: Connection
): Promise<Transaction> {
    const treeAuthority = getTreeAuthority(MERKLE_TREE_ADDRESS);
    const bubblegumSigner = getBubblegumSigner();
    const collectionMetadata = getMetadataPDA(COLLECTION_MINT_ADDRESS);
    const collectionEdition = getMasterEditionPDA(COLLECTION_MINT_ADDRESS);

    const data = buildMintToCollectionV1Data(
        name,
        'SFLX',
        metadataUri,
        [{ address: payerPubkey, verified: false, share: 100 }],
        0,
        false
    );

    const keys: AccountMeta[] = [
        { pubkey: treeAuthority, isSigner: false, isWritable: true },
        { pubkey: payerPubkey, isSigner: false, isWritable: true }, // leaf_owner
        { pubkey: payerPubkey, isSigner: false, isWritable: true }, // leaf_delegate
        { pubkey: MERKLE_TREE_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: payerPubkey, isSigner: true, isWritable: true }, // payer
        { pubkey: payerPubkey, isSigner: true, isWritable: false }, // tree_delegate (creator)
        { pubkey: COLLECTION_MINT_ADDRESS, isSigner: false, isWritable: false }, // collection_authority_record_pda
        { pubkey: payerPubkey, isSigner: true, isWritable: false }, // collection_authority
        { pubkey: COLLECTION_MINT_ADDRESS, isSigner: false, isWritable: false }, // collection_mint
        { pubkey: collectionMetadata, isSigner: false, isWritable: true }, // collection_metadata
        { pubkey: collectionEdition, isSigner: false, isWritable: false }, // edition_account
        { pubkey: bubblegumSigner, isSigner: false, isWritable: false },
        { pubkey: SPL_NOOP_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    const mintInstruction = new TransactionInstruction({
        programId: BUBBLEGUM_PROGRAM_ID,
        keys,
        data,
    });

    const tx = new Transaction();

    // Add SKR burn instruction (1 SKR mint fee)
    try {
        const burnIx = await buildBurnInstruction(payerPubkey);
        tx.add(burnIx);
    } catch (e) {
        console.warn('SKR burn skipped (token may not be set up):', e);
    }

    // Add mint instruction
    tx.add(mintInstruction);

    const latestBlockhash = await connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = payerPubkey;

    return tx;
}

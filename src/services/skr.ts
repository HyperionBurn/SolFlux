/**
 * SKR Token Service — tipping economy + mint fee burns
 */
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    createTransferCheckedInstruction,
    createBurnCheckedInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { SKR_MINT_ADDRESS, SKR_DECIMALS, MINT_FEE_SKR, RPC_ENDPOINT } from '../config/constants';

/**
 * Build a tip transaction (SPL transferChecked)
 * Optionally creates the recipient's ATA if it doesn't exist
 */
export async function buildTipTransaction(
    senderPubkey: PublicKey,
    recipientPubkey: PublicKey,
    amount: number,
    connection: Connection
): Promise<Transaction> {
    const tx = new Transaction();

    const senderATA = await getAssociatedTokenAddress(
        SKR_MINT_ADDRESS,
        senderPubkey
    );

    const recipientATA = await getAssociatedTokenAddress(
        SKR_MINT_ADDRESS,
        recipientPubkey
    );

    // Check if recipient ATA exists, create if not
    try {
        await getAccount(connection, recipientATA);
    } catch {
        tx.add(
            createAssociatedTokenAccountInstruction(
                senderPubkey, // payer
                recipientATA, // ata
                recipientPubkey, // owner
                SKR_MINT_ADDRESS // mint
            )
        );
    }

    // Transfer SKR
    const rawAmount = BigInt(amount) * BigInt(10 ** SKR_DECIMALS);
    tx.add(
        createTransferCheckedInstruction(
            senderATA,
            SKR_MINT_ADDRESS,
            recipientATA,
            senderPubkey,
            rawAmount,
            SKR_DECIMALS
        )
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = senderPubkey;

    return tx;
}

/**
 * Build a burn instruction for mint fee (1 SKR)
 */
export async function buildBurnInstruction(
    ownerPubkey: PublicKey
): Promise<TransactionInstruction> {
    const ownerATA = await getAssociatedTokenAddress(
        SKR_MINT_ADDRESS,
        ownerPubkey
    );

    const burnAmount = BigInt(MINT_FEE_SKR) * BigInt(10 ** SKR_DECIMALS);

    return createBurnCheckedInstruction(
        ownerATA,
        SKR_MINT_ADDRESS,
        ownerPubkey,
        burnAmount,
        SKR_DECIMALS
    );
}

/**
 * Get SKR token balance for a wallet
 */
export async function getTokenBalance(
    ownerPubkey: PublicKey,
    connection: Connection
): Promise<number> {
    try {
        const ata = await getAssociatedTokenAddress(SKR_MINT_ADDRESS, ownerPubkey);
        const account = await getAccount(connection, ata);
        return Number(account.amount) / 10 ** SKR_DECIMALS;
    } catch {
        return 0;
    }
}

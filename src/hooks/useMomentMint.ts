/**
 * useMomentMint — orchestrates the full mint pipeline
 * compress → upload image → upload metadata → build tx → MWA sign
 */
import { useState, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { useMobileWallet } from '../utils/useMobileWallet';
import { useAuthorization } from '../utils/useAuthorization';
import { compressImage, uploadToIPFS } from '../services/upload';
import { createAndUploadMetadata } from '../services/metadata';
import { buildMintTransaction } from '../services/mint';
import { CaptureResult, MintStep } from '../types';
import { RPC_ENDPOINT } from '../config/constants';
import * as Haptics from 'expo-haptics';

export function useMomentMint() {
    const [step, setStep] = useState<MintStep>(MintStep.IDLE);
    const [error, setError] = useState<string | null>(null);
    const [txSignature, setTxSignature] = useState<string | null>(null);
    const { signAndSendTransaction } = useMobileWallet();
    const { selectedAccount } = useAuthorization();

    const mintMoment = useCallback(
        async (capture: CaptureResult): Promise<string | null> => {
            if (!selectedAccount) {
                setError('Wallet not connected');
                return null;
            }

            try {
                setError(null);
                setTxSignature(null);

                // Step 1: Compress image
                setStep(MintStep.COMPRESSING);
                const compressedUri = await compressImage(capture.uri);

                // Step 2: Upload image to IPFS
                setStep(MintStep.UPLOADING_IMAGE);
                const imageCid = await uploadToIPFS(compressedUri);

                // Step 3: Build & upload metadata
                setStep(MintStep.UPLOADING_METADATA);
                const momentName = `SolFLux Moment — ${capture.locationName}`;
                const description = `Captured at ${capture.locationName} on ${new Date(capture.timestamp).toLocaleDateString()}`;
                const metadataUri = await createAndUploadMetadata(
                    momentName,
                    description,
                    imageCid,
                    {
                        latitude: capture.latitude,
                        longitude: capture.longitude,
                        timestamp: capture.timestamp,
                        locationName: capture.locationName,
                    }
                );

                // Step 4: Build transaction
                setStep(MintStep.BUILDING_TX);
                const connection = new Connection(RPC_ENDPOINT, 'confirmed');
                const tx = await buildMintTransaction(
                    selectedAccount.publicKey,
                    metadataUri,
                    momentName,
                    connection
                );

                // Step 5: Sign & send via MWA
                setStep(MintStep.SIGNING);
                const slot = await connection.getSlot();
                const signature = await signAndSendTransaction(tx, slot);

                // Step 6: Confirm
                setStep(MintStep.CONFIRMING);
                await connection.confirmTransaction(signature, 'confirmed');

                setTxSignature(signature);
                setStep(MintStep.SUCCESS);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                return signature;
            } catch (e: any) {
                console.error('Mint error:', e);
                setError(e.message || 'Minting failed');
                setStep(MintStep.ERROR);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return null;
            }
        },
        [selectedAccount, signAndSendTransaction]
    );

    const reset = useCallback(() => {
        setStep(MintStep.IDLE);
        setError(null);
        setTxSignature(null);
    }, []);

    return {
        mintMoment,
        step,
        error,
        txSignature,
        reset,
        isLoading: ![MintStep.IDLE, MintStep.SUCCESS, MintStep.ERROR].includes(step),
    };
}

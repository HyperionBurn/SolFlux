/**
 * useSKRTip — builds and sends a tip transaction via MWA
 */
import { useState, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useMobileWallet } from '../utils/useMobileWallet';
import { useAuthorization } from '../utils/useAuthorization';
import { buildTipTransaction } from '../services/skr';
import { RPC_ENDPOINT } from '../config/constants';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';

export function useSKRTip() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signAndSendTransaction } = useMobileWallet();
    const { selectedAccount } = useAuthorization();
    const queryClient = useQueryClient();

    const tip = useCallback(
        async (recipientAddress: string, amount: number): Promise<string | null> => {
            if (!selectedAccount) {
                setError('Wallet not connected');
                return null;
            }

            try {
                setIsLoading(true);
                setError(null);

                const connection = new Connection(RPC_ENDPOINT, 'confirmed');
                const recipientPubkey = new PublicKey(recipientAddress);

                const tx = await buildTipTransaction(
                    selectedAccount.publicKey,
                    recipientPubkey,
                    amount,
                    connection
                );

                const slot = await connection.getSlot();
                const signature = await signAndSendTransaction(tx, slot);

                await connection.confirmTransaction(signature, 'confirmed');

                // Haptic success feedback
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Invalidate SKR balance query to force refresh
                queryClient.invalidateQueries({ queryKey: ['skr-balance'] });

                return signature;
            } catch (e: any) {
                console.error('Tip error:', e);
                setError(e.message || 'Tip failed');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [selectedAccount, signAndSendTransaction, queryClient]
    );

    return { tip, isLoading, error };
}

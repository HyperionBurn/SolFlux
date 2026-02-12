/**
 * useSKRBalance — fetches SKR token balance with periodic refresh
 */
import { useQuery } from '@tanstack/react-query';
import { Connection, PublicKey } from '@solana/web3.js';
import { getTokenBalance } from '../services/skr';
import { useAuthorization } from '../utils/useAuthorization';
import { RPC_ENDPOINT, BALANCE_STALE_TIME } from '../config/constants';

export function useSKRBalance() {
    const { selectedAccount } = useAuthorization();

    return useQuery<number>({
        queryKey: ['skr-balance', selectedAccount?.publicKey?.toBase58()],
        queryFn: async () => {
            if (!selectedAccount) return 0;
            const connection = new Connection(RPC_ENDPOINT, 'confirmed');
            return getTokenBalance(selectedAccount.publicKey, connection);
        },
        enabled: !!selectedAccount,
        staleTime: BALANCE_STALE_TIME,
        refetchInterval: BALANCE_STALE_TIME,
        retry: 1,
    });
}

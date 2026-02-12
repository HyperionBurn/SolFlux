/**
 * useUserMoments — fetches a user's own moments via Helius DAS
 */
import { useQuery } from '@tanstack/react-query';
import { getUserMoments } from '../services/das';
import { Moment } from '../types';
import { FEED_STALE_TIME } from '../config/constants';

export function useUserMoments(ownerAddress: string | null) {
    return useQuery<Moment[]>({
        queryKey: ['user-moments', ownerAddress],
        queryFn: () => getUserMoments(ownerAddress!),
        enabled: !!ownerAddress,
        staleTime: FEED_STALE_TIME,
        retry: 2,
    });
}

/**
 * useMomentFeed — fetches collection feed via Helius DAS
 */
import { useQuery } from '@tanstack/react-query';
import { getCollectionMoments } from '../services/das';
import { Moment } from '../types';
import { FEED_STALE_TIME } from '../config/constants';

export function useMomentFeed(page: number = 1) {
    return useQuery<Moment[]>({
        queryKey: ['moment-feed', page],
        queryFn: () => getCollectionMoments(page),
        staleTime: FEED_STALE_TIME,
        retry: 2,
        placeholderData: (prev) => prev,
    });
}

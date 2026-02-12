/**
 * Helius DAS (Digital Asset Standard) API client
 * Used to query compressed NFTs without a custom backend
 */
import { HELIUS_DAS_URL, COLLECTION_MINT_ADDRESS, FEED_PAGE_SIZE } from '../config/constants';
import { DASAsset, DASResponse, Moment } from '../types';

/**
 * Makes a DAS API request
 */
async function dasRequest(method: string, params: object): Promise<any> {
    const response = await fetch(HELIUS_DAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'solflux',
            method,
            params,
        }),
    });

    if (!response.ok) {
        throw new Error(`DAS API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`DAS API error: ${data.error.message}`);
    }
    return data.result;
}

/**
 * Get all moments in the SolFLux collection (feed)
 */
export async function getCollectionMoments(
    page: number = 1,
    limit: number = FEED_PAGE_SIZE
): Promise<Moment[]> {
    const result: DASResponse = await dasRequest('getAssetsByGroup', {
        groupKey: 'collection',
        groupValue: COLLECTION_MINT_ADDRESS.toBase58(),
        page,
        limit,
        sortBy: { sortBy: 'created', sortDirection: 'desc' },
    });

    return result.items.map(assetToMoment);
}

/**
 * Get moments owned by a specific wallet (profile)
 */
export async function getUserMoments(
    ownerAddress: string,
    page: number = 1,
    limit: number = FEED_PAGE_SIZE
): Promise<Moment[]> {
    const result: DASResponse = await dasRequest('getAssetsByOwner', {
        ownerAddress,
        page,
        limit,
        sortBy: { sortBy: 'created', sortDirection: 'desc' },
    });

    // Filter to only SolFLux moments
    const solfluxMoments = result.items.filter((asset) => {
        const attrs = asset.content?.metadata?.attributes || [];
        return attrs.some((a) => a.trait_type === 'app' && a.value === 'SolFLux');
    });

    return solfluxMoments.map(assetToMoment);
}

/**
 * Get a single moment by asset ID
 */
export async function getMomentDetail(assetId: string): Promise<Moment> {
    const result: DASAsset = await dasRequest('getAsset', { id: assetId });
    return assetToMoment(result);
}

/**
 * Convert DAS asset to Moment model
 */
function assetToMoment(asset: DASAsset): Moment {
    const attrs = asset.content?.metadata?.attributes || [];
    const getAttr = (key: string) =>
        attrs.find((a) => a.trait_type === key)?.value || '';

    const creator = asset.creators?.[0]?.address || asset.ownership?.owner || 'Unknown';

    return {
        id: asset.id,
        name: asset.content?.metadata?.name || 'Untitled Moment',
        description: asset.content?.metadata?.description || '',
        imageUri:
            asset.content?.links?.image ||
            asset.content?.files?.[0]?.uri ||
            '',
        creator,
        creatorDisplay: truncateAddress(creator),
        latitude: parseFloat(getAttr('latitude') as string) || 0,
        longitude: parseFloat(getAttr('longitude') as string) || 0,
        locationName: (getAttr('location_name') as string) || 'Unknown Location',
        timestamp: parseInt(getAttr('timestamp') as string, 10) || Date.now(),
        tipCount: 0, // TODO: Track via on-chain or off-chain
        assetId: asset.id,
    };
}

/**
 * Truncate wallet address for display
 */
function truncateAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Metaplex-compatible metadata builder for SolFLux moments
 */
import { MomentAttributes } from '../types';
import { uploadMetadataToIPFS, resolveIPFS } from './upload';

/**
 * Builds Metaplex-compatible metadata JSON
 */
export function buildMomentMetadata(
    name: string,
    description: string,
    imageCid: string,
    attributes: MomentAttributes
) {
    return {
        name,
        symbol: 'SFLX',
        description,
        image: resolveIPFS(imageCid),
        external_url: 'https://solflux.app',
        attributes: [
            { trait_type: 'latitude', value: attributes.latitude.toString() },
            { trait_type: 'longitude', value: attributes.longitude.toString() },
            { trait_type: 'timestamp', value: attributes.timestamp.toString() },
            { trait_type: 'location_name', value: attributes.locationName },
            { trait_type: 'app', value: 'SolFLux' },
        ],
        properties: {
            category: 'image',
            files: [
                {
                    uri: resolveIPFS(imageCid),
                    type: 'image/jpeg',
                },
            ],
            creators: [],
        },
    };
}

/**
 * Builds metadata and uploads to IPFS
 * Returns the metadata JSON URI
 */
export async function createAndUploadMetadata(
    name: string,
    description: string,
    imageCid: string,
    attributes: MomentAttributes
): Promise<string> {
    const metadata = buildMomentMetadata(name, description, imageCid, attributes);
    const metadataCid = await uploadMetadataToIPFS(metadata);
    return resolveIPFS(metadataCid);
}

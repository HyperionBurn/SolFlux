/**
 * Image upload service - compression + IPFS upload via NFT.Storage
 */
import * as ImageManipulator from 'expo-image-manipulator';
import { MAX_IMAGE_WIDTH, IMAGE_QUALITY, NFT_STORAGE_API_KEY } from '../config/constants';

/**
 * Compresses an image for optimal upload size
 */
export async function compressImage(uri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_IMAGE_WIDTH } }],
        {
            compress: IMAGE_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
        }
    );
    return result.uri;
}

/**
 * Uploads a file to IPFS via NFT.Storage
 * Returns the IPFS CID
 */
export async function uploadToIPFS(fileUri: string): Promise<string> {
    // Read the file as blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
            'Content-Type': blob.type || 'image/jpeg',
        },
        body: blob,
    });

    if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        throw new Error(`NFT.Storage upload failed: ${error}`);
    }

    const data = await uploadResponse.json();
    return data.value.cid;
}

/**
 * Uploads JSON metadata to IPFS via NFT.Storage
 * Returns the IPFS CID
 */
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
    const jsonBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
    });

    const uploadResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
        },
        body: jsonBlob,
    });

    if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        throw new Error(`NFT.Storage metadata upload failed: ${error}`);
    }

    const data = await uploadResponse.json();
    return data.value.cid;
}

/**
 * Resolves an IPFS CID to a gateway URL
 */
export function resolveIPFS(cid: string): string {
    return `https://nftstorage.link/ipfs/${cid}`;
}

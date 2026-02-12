import { PublicKey } from '@solana/web3.js';

/**
 * Core data model for a "Moment" - a captured cNFT
 */
export interface Moment {
    id: string; // DAS asset ID
    name: string;
    description: string;
    imageUri: string; // IPFS resolved URI
    creator: string; // wallet address
    creatorDisplay: string; // truncated address
    latitude: number;
    longitude: number;
    locationName: string;
    timestamp: number; // unix timestamp
    tipCount: number; // total SKR tips received
    mintSignature?: string; // tx signature
    assetId?: string; // on-chain asset ID
}

/**
 * Metadata attributes for cNFT
 */
export interface MomentAttributes {
    latitude: number;
    longitude: number;
    timestamp: number;
    locationName: string;
}

/**
 * Capture state from camera
 */
export interface CaptureResult {
    uri: string; // local file URI
    width: number;
    height: number;
    latitude: number;
    longitude: number;
    locationName: string;
    timestamp: number;
}

/**
 * Mint progress steps
 */
export enum MintStep {
    IDLE = 'IDLE',
    COMPRESSING = 'COMPRESSING',
    UPLOADING_IMAGE = 'UPLOADING_IMAGE',
    UPLOADING_METADATA = 'UPLOADING_METADATA',
    BUILDING_TX = 'BUILDING_TX',
    SIGNING = 'SIGNING',
    CONFIRMING = 'CONFIRMING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

/**
 * Navigation param types
 */
export type RootStackParamList = {
    MainTabs: undefined;
    MintScreen: { capture: CaptureResult };
    MomentDetail: { moment: Moment };
};

export type TabParamList = {
    Feed: undefined;
    Camera: undefined;
    Profile: undefined;
};

/**
 * DAS API response types
 */
export interface DASAsset {
    id: string;
    content: {
        json_uri: string;
        metadata: {
            name: string;
            description: string;
            attributes?: Array<{
                trait_type: string;
                value: string | number;
            }>;
        };
        links?: {
            image?: string;
        };
        files?: Array<{
            uri: string;
            mime: string;
        }>;
    };
    ownership: {
        owner: string;
    };
    compression?: {
        compressed: boolean;
        tree: string;
        leaf_index: number;
    };
    creators?: Array<{
        address: string;
        verified: boolean;
        share: number;
    }>;
}

export interface DASResponse {
    total: number;
    limit: number;
    page: number;
    items: DASAsset[];
}

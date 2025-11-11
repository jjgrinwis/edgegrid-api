/**
 * Crypto utilities for EdgeGrid authentication using Web APIs
 * Compatible with web workers and Zuplo environment
 */
import { CryptoHelpers } from "./types.js";
export declare class WebCryptoHelpers implements CryptoHelpers {
    private static readonly MAX_BODY;
    /**
     * Creates a timestamp in EdgeGrid format: "yyyyMMddTHH:mm:ss+0000"
     */
    createTimestamp(): string;
    /**
     * Generates a UUID v4 using Web Crypto API
     */
    generateUUID(): string;
    /**
     * Creates SHA256 hash and returns base64 encoded result
     */
    sha256Hash(data: string | ArrayBuffer): Promise<string>;
    /**
     * Creates HMAC-SHA256 signature and returns base64 encoded result
     */
    hmacSha256(data: string, key: string): Promise<string>;
    /**
     * Encodes ArrayBuffer to base64 string
     * Uses chunked processing to avoid call stack limits and improve performance
     */
    base64Encode(buffer: ArrayBuffer): string;
    /**
     * Canonicalizes headers for signing (lowercase keys, trimmed values, tab separated)
     */
    canonicalizeHeaders(headers: Record<string, string>): string;
    /**
     * Creates content hash for request body
     */
    createContentHash(request: {
        method: string;
        body?: string | ArrayBuffer | Uint8Array;
        headers?: Record<string, string>;
    }): Promise<string>;
    /**
     * Creates the signing key from timestamp and client secret
     */
    createSigningKey(timestamp: string, clientSecret: string): Promise<string>;
    /**
     * Creates the data string that will be signed
     */
    createDataToSign(request: {
        method: string;
        url: string;
        headersToSign?: string[];
        headers?: Record<string, string>;
    }, authHeader: string, contentHash: string): Promise<string>;
}
//# sourceMappingURL=crypto-helpers.d.ts.map
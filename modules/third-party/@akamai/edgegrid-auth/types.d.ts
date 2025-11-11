/**
 * TypeScript types for EdgeGrid Web Worker authentication
 */
export interface EdgeGridConfig {
    clientToken: string;
    clientSecret: string;
    accessToken: string;
    host: string;
}
export interface EdgeGridRequest {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string | ArrayBuffer | Uint8Array;
    queryParams?: Record<string, string>;
    headersToSign?: string[];
}
export interface AuthenticatedRequest extends EdgeGridRequest {
    url: string;
    headers: Record<string, string>;
}
export interface EdgeGridAuth {
    generateAuthHeader(request: EdgeGridRequest): Promise<string>;
    authenticateRequest(request: EdgeGridRequest): Promise<AuthenticatedRequest>;
}
export interface CryptoHelpers {
    createTimestamp(): string;
    generateUUID(): string;
    sha256Hash(data: string | ArrayBuffer): Promise<string>;
    hmacSha256(data: string, key: string): Promise<string>;
    base64Encode(data: ArrayBuffer): string;
    canonicalizeHeaders(headers: Record<string, string>): string;
}
//# sourceMappingURL=types.d.ts.map
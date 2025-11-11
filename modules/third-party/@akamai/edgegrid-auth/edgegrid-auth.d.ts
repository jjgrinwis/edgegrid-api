/**
 * EdgeGrid Authentication for Web Workers / Zuplo Environment
 * Pure TypeScript implementation using Web APIs
 */
import { EdgeGridConfig, EdgeGridRequest, AuthenticatedRequest, EdgeGridAuth } from './types.js';
export type { EdgeGridConfig, EdgeGridRequest, AuthenticatedRequest, EdgeGridAuth } from './types.js';
export { WebCryptoHelpers } from './crypto-helpers.js';
export declare class EdgeGridAuthenticator implements EdgeGridAuth {
    private config;
    private crypto;
    private static readonly FORBIDDEN_HEADERS;
    constructor(config: EdgeGridConfig);
    /**
     * Generates the complete authorization header for an EdgeGrid request
     */
    generateAuthHeader(request: EdgeGridRequest): Promise<string>;
    /**
     * Internal method to generate auth header with pre-computed URL and headers
     */
    private generateAuthHeaderInternal;
    /**
     * Authenticates a request by adding the authorization header
     * Optimized to avoid duplicate URL building and header normalization
     */
    authenticateRequest(request: EdgeGridRequest): Promise<AuthenticatedRequest>;
    /**
     * Builds the complete URL from host, path, and query parameters
     */
    private buildUrl;
    /**
     * Filters out forbidden headers that should not be included in EdgeGrid signing
     */
    private filterForbiddenHeaders;
    /**
     * Normalizes headers with default content-type and accept headers
     * Also filters out forbidden headers that should not be signed
     */
    private normalizeHeaders;
    /**
     * Checks if a header exists (case-insensitive)
     * Uses Set for O(1) lookup instead of O(n) iteration
     */
    private hasHeaderIgnoreCase;
}
/**
 * Factory function to create an EdgeGrid authenticator
 */
export declare function createEdgeGridAuth(config: EdgeGridConfig): EdgeGridAuthenticator;
/**
 * Convenience function to quickly generate an auth header
 */
export declare function generateEdgeGridAuthHeader(config: EdgeGridConfig, request: EdgeGridRequest): Promise<string>;
//# sourceMappingURL=edgegrid-auth.d.ts.map
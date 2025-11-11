/**
 * @fileoverview EdgeGrid Authentication Library
 * Pure TypeScript implementation for web workers and modern JavaScript environments
 */
export type { EdgeGridConfig, EdgeGridRequest, AuthenticatedRequest, EdgeGridAuth, CryptoHelpers, } from "./types.js";
export { WebCryptoHelpers } from "./crypto-helpers.js";
export { EdgeGridAuthenticator, createEdgeGridAuth, generateEdgeGridAuthHeader, } from "./edgegrid-auth.js";
export { createEdgeGridAuth as default } from "./edgegrid-auth.js";
//# sourceMappingURL=index.d.ts.map
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/@akamai/edgegrid-auth/dist/index.mjs
var WebCryptoHelpers = class _WebCryptoHelpers {
  static {
    __name(this, "_WebCryptoHelpers");
  }
  static MAX_BODY = 131072;
  // 128KB
  /**
   * Creates a timestamp in EdgeGrid format: "yyyyMMddTHH:mm:ss+0000"
   */
  createTimestamp() {
    const date = /* @__PURE__ */ new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}:${minutes}:${seconds}+0000`;
  }
  /**
   * Generates a UUID v4 using Web Crypto API
   */
  generateUUID() {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      array[6] = array[6] & 15 | 64;
      array[8] = array[8] & 63 | 128;
      const hex = Array.from(
        array,
        (byte) => byte.toString(16).padStart(2, "0")
      ).join("");
      return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
        12,
        16
      )}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
    } catch (error) {
      throw new Error(`UUID generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Creates SHA256 hash and returns base64 encoded result
   */
  async sha256Hash(data) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
      return this.base64Encode(hashBuffer);
    } catch (error) {
      throw new Error(`SHA256 hashing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Creates HMAC-SHA256 signature and returns base64 encoded result
   */
  async hmacSha256(data, key) {
    try {
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(key);
      const dataBuffer = encoder.encode(data);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
      return this.base64Encode(signature);
    } catch (error) {
      throw new Error(`HMAC-SHA256 signing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Encodes ArrayBuffer to base64 string
   * Uses chunked processing to avoid call stack limits and improve performance
   */
  base64Encode(buffer) {
    try {
      const bytes = new Uint8Array(buffer);
      const CHUNK_SIZE = 8192;
      let binary = "";
      for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
        binary += String.fromCharCode(...chunk);
      }
      return btoa(binary);
    } catch (error) {
      throw new Error(`Base64 encoding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Canonicalizes headers for signing (lowercase keys, trimmed values, tab separated)
   */
  canonicalizeHeaders(headers) {
    const formattedHeaders = [];
    for (const [key, value] of Object.entries(headers)) {
      const normalizedValue = value.trim().replace(/\s+/g, " ");
      formattedHeaders.push(`${key.toLowerCase()}:${normalizedValue}`);
    }
    return formattedHeaders.join("	");
  }
  /**
   * Creates content hash for request body
   */
  async createContentHash(request) {
    if (request.method !== "POST" || !request.body) {
      return "";
    }
    let bodyData;
    const contentType = request.headers?.["Content-Type"] || request.headers?.["content-type"];
    const isTarball = request.body instanceof Uint8Array && (contentType === "application/gzip" || contentType === "application/tar+gzip");
    if (typeof request.body === "string") {
      bodyData = request.body;
    } else if (request.body instanceof ArrayBuffer) {
      bodyData = request.body;
    } else if (request.body instanceof Uint8Array) {
      bodyData = request.body.buffer instanceof ArrayBuffer ? request.body.buffer.slice(
        request.body.byteOffset,
        request.body.byteOffset + request.body.byteLength
      ) : new ArrayBuffer(0);
    } else {
      bodyData = JSON.stringify(request.body);
    }
    if (typeof bodyData === "string" && bodyData.length > _WebCryptoHelpers.MAX_BODY) {
      bodyData = bodyData.substring(0, _WebCryptoHelpers.MAX_BODY);
    } else if (bodyData instanceof ArrayBuffer && bodyData.byteLength > _WebCryptoHelpers.MAX_BODY) {
      bodyData = bodyData.slice(0, _WebCryptoHelpers.MAX_BODY);
    }
    return this.sha256Hash(bodyData);
  }
  /**
   * Creates the signing key from timestamp and client secret
   */
  async createSigningKey(timestamp, clientSecret) {
    return this.hmacSha256(timestamp, clientSecret);
  }
  /**
   * Creates the data string that will be signed
   */
  async createDataToSign(request, authHeader, contentHash) {
    const url = new URL(request.url);
    const headersToSignHash = request.headersToSign?.length ? this.canonicalizeHeaders(
      Object.fromEntries(
        request.headersToSign.map((header) => [
          header,
          request.headers?.[header] || ""
        ])
      )
    ) : "";
    const dataToSign = [
      request.method.toUpperCase(),
      url.protocol.replace(":", ""),
      url.host,
      url.pathname + url.search,
      headersToSignHash,
      contentHash,
      authHeader
    ];
    return dataToSign.join("	");
  }
};
var EdgeGridAuthenticator = class _EdgeGridAuthenticator {
  static {
    __name(this, "_EdgeGridAuthenticator");
  }
  config;
  crypto;
  // Headers that should never be included in EdgeGrid signing
  static FORBIDDEN_HEADERS = /* @__PURE__ */ new Set([
    "authorization",
    "host",
    "content-length",
    "connection",
    "upgrade",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding"
  ]);
  constructor(config) {
    if (!config.clientToken?.trim()) {
      throw new Error("EdgeGrid config error: clientToken is required and cannot be empty");
    }
    if (!config.clientSecret?.trim()) {
      throw new Error("EdgeGrid config error: clientSecret is required and cannot be empty");
    }
    if (!config.accessToken?.trim()) {
      throw new Error("EdgeGrid config error: accessToken is required and cannot be empty");
    }
    if (!config.host?.trim()) {
      throw new Error("EdgeGrid config error: host is required and cannot be empty");
    }
    this.config = {
      ...config,
      host: config.host.startsWith("https://") ? config.host : `https://${config.host}`
    };
    this.crypto = new WebCryptoHelpers();
  }
  /**
   * Generates the complete authorization header for an EdgeGrid request
   */
  async generateAuthHeader(request) {
    const url = this.buildUrl(request.path, request.queryParams);
    const normalizedHeaders = this.normalizeHeaders(request.headers || {});
    return this.generateAuthHeaderInternal(request, url, normalizedHeaders);
  }
  /**
   * Internal method to generate auth header with pre-computed URL and headers
   */
  async generateAuthHeaderInternal(request, url, normalizedHeaders) {
    const timestamp = this.crypto.createTimestamp();
    const nonce = this.crypto.generateUUID();
    const authComponents = {
      client_token: this.config.clientToken,
      access_token: this.config.accessToken,
      timestamp,
      nonce
    };
    const authPairs = Object.entries(authComponents).map(([key, value]) => `${key}=${value}`).join(";");
    const unsignedAuthHeader = `EG1-HMAC-SHA256 ${authPairs};`;
    const requestForSigning = {
      ...request,
      url,
      headers: normalizedHeaders
    };
    const contentHash = await this.crypto.createContentHash(requestForSigning);
    const dataToSign = await this.crypto.createDataToSign(
      requestForSigning,
      unsignedAuthHeader,
      contentHash
    );
    const signingKey = await this.crypto.createSigningKey(timestamp, this.config.clientSecret);
    const signature = await this.crypto.hmacSha256(dataToSign, signingKey);
    return `${unsignedAuthHeader}signature=${signature}`;
  }
  /**
   * Authenticates a request by adding the authorization header
   * Optimized to avoid duplicate URL building and header normalization
   */
  async authenticateRequest(request) {
    const url = this.buildUrl(request.path, request.queryParams);
    const normalizedHeaders = this.normalizeHeaders(request.headers || {});
    const authHeader = await this.generateAuthHeaderInternal(request, url, normalizedHeaders);
    return {
      ...request,
      url,
      headers: {
        ...normalizedHeaders,
        "Authorization": authHeader
      }
    };
  }
  /**
   * Builds the complete URL from host, path, and query parameters
   */
  buildUrl(path, queryParams) {
    const url = new URL(path, this.config.host);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }
  /**
   * Filters out forbidden headers that should not be included in EdgeGrid signing
   */
  filterForbiddenHeaders(headers) {
    const filtered = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (!_EdgeGridAuthenticator.FORBIDDEN_HEADERS.has(lowerKey)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }
  /**
   * Normalizes headers with default content-type and accept headers
   * Also filters out forbidden headers that should not be signed
   */
  normalizeHeaders(headers) {
    const filtered = this.filterForbiddenHeaders(headers);
    const normalized = { ...filtered };
    if (!this.hasHeaderIgnoreCase(normalized, "Content-Type")) {
      normalized["Content-Type"] = "application/json";
    }
    if (!this.hasHeaderIgnoreCase(normalized, "Accept")) {
      normalized["Accept"] = "application/json";
    }
    if (!this.hasHeaderIgnoreCase(normalized, "User-Agent")) {
      normalized["User-Agent"] = "EdgeGrid-WebWorker/1.0.0";
    }
    return normalized;
  }
  /**
   * Checks if a header exists (case-insensitive)
   * Uses Set for O(1) lookup instead of O(n) iteration
   */
  hasHeaderIgnoreCase(headers, headerName) {
    const lowerHeaderName = headerName.toLowerCase();
    const headerKeysLower = new Set(Object.keys(headers).map((k) => k.toLowerCase()));
    return headerKeysLower.has(lowerHeaderName);
  }
};
function createEdgeGridAuth(config) {
  return new EdgeGridAuthenticator(config);
}
__name(createEdgeGridAuth, "createEdgeGridAuth");
async function generateEdgeGridAuthHeader(config, request) {
  const auth = new EdgeGridAuthenticator(config);
  return auth.generateAuthHeader(request);
}
__name(generateEdgeGridAuthHeader, "generateEdgeGridAuthHeader");
export {
  EdgeGridAuthenticator,
  WebCryptoHelpers,
  createEdgeGridAuth,
  createEdgeGridAuth as default,
  generateEdgeGridAuthHeader
};

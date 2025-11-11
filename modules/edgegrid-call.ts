import { environment, ZuploContext, ZuploRequest } from "@zuplo/runtime";
import createEdgeGridAuth from "./third-party/@akamai/edgegrid-auth";
import type { EdgeGridConfig } from "./third-party/@akamai/edgegrid-auth/types";
import { servers } from "../config/routes.oas.json";

export default async function (
  request: ZuploRequest,
  context: ZuploContext,
): Promise<Response> {
  try {
    // Get credentials from environment variables
    const clientToken = environment.AKAMAI_CLIENT_TOKEN;
    const clientSecret = environment.AKAMAI_CLIENT_SECRET;
    const accessToken = environment.AKAMAI_ACCESS_TOKEN;
    const host = environment.AKAMAI_HOST;

    // Validate required environment variables
    if (!clientToken || !clientSecret || !accessToken || !host) {
      context.log.error("Missing required Akamai environment variables");
      return new Response(
        JSON.stringify({
          error: "Configuration Error",
          message: "Missing required Akamai credentials",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate servers configuration
    if (!servers || servers.length === 0) {
      context.log.error("No servers configured in OpenAPI specification");
      return new Response(
        JSON.stringify({
          error: "Configuration Error",
          message: "No API servers configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create EdgeGrid configuration
    const edgeGridConfig: EdgeGridConfig = {
      clientToken,
      clientSecret,
      accessToken,
      host,
    };

    // Build the full path with base path from Edge Diagnostics API
    // we're getting the base path from the OpenAPI specification servers array
    const basePath = new URL(servers[0].url).pathname;
    const originalUrl = new URL(request.url);
    const fullPath = `${basePath}${originalUrl.pathname}${originalUrl.search}`;

    // Read request body once for both authentication and forwarding
    const requestBody = await request.text();

    // Generate authenticated request
    const authenticator = createEdgeGridAuth(edgeGridConfig);
    const authRequest = await authenticator.authenticateRequest({
      method: request.method,
      path: fullPath,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestBody,
    });

    // Build target URL
    const targetUrl = `https://${edgeGridConfig.host}${authRequest.path}`;
    context.log.info(`Proxying ${request.method} request to: ${targetUrl}`);

    // Make authenticated request to Akamai API
    // Only send body for methods that support it (not GET/HEAD)
    const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
    const shouldIncludeBody =
      methodsWithBody.includes(request.method.toUpperCase()) && requestBody;

    const response = await fetch(targetUrl, {
      method: authRequest.method,
      headers: authRequest.headers,
      body: shouldIncludeBody ? requestBody : undefined,
    });

    if (!response.ok) {
      context.log.error(
        `Akamai API error: ${response.status} ${response.statusText} for ${request.method} ${targetUrl}`,
      );
    }

    // Return response with all headers from Akamai API (pass through body directly)
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    context.log.error(
      `EdgeGrid proxy error for ${request.method} ${request.url}:`,
      error,
    );
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to process EdgeGrid request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

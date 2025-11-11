# Akamai EdgeGrid API Proxy

A Zuplo-based API gateway that proxies authenticated requests to the Akamai Edge Diagnostics API using EdgeGrid authentication.

## Overview

This project provides a secure API proxy for accessing Akamai's Edge Diagnostics API. It handles EdgeGrid authentication automatically, allowing you to make authenticated requests to Akamai's API endpoints without managing the complex authentication process in your client applications.

## Features

- EdgeGrid authentication for Akamai API requests
- Automatic request signing with Akamai credentials
- Proxy to Akamai Edge Diagnostics API v1
- Built on Zuplo's API gateway platform
- TypeScript support
- Environment-based credential management

## Prerequisites

- Node.js (v18 or later recommended)
- Zuplo CLI
- Akamai EdgeGrid API credentials:
  - Client Token
  - Client Secret
  - Access Token
  - API Host

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd edgegrid-api
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Set up the required environment variables for Akamai authentication:

```bash
AKAMAI_CLIENT_TOKEN=your_client_token
AKAMAI_CLIENT_SECRET=your_client_secret
AKAMAI_ACCESS_TOKEN=your_access_token
AKAMAI_HOST=your_api_host.akamaiapis.net
```

These credentials can be obtained from your Akamai Control Center under Identity & Access Management.

## Usage

### Development

Run the development server:

```bash
npm run dev
```

### Testing

Run tests:

```bash
npm test
```

### Building

Bundle the project:

```bash
npm run bundle
```

## API Endpoints

The proxy forwards requests to the Akamai Edge Diagnostics API v1 (`/edge-diagnostics/v1`). All API endpoints are automatically authenticated using your configured EdgeGrid credentials.

### Example Requests

**Locate IP Address:**
```bash
POST /edge-diagnostics/v1/ip-addresses
Content-Type: application/json

{
  "ipAddresses": ["84.27.144.50"]
}
```

**Get Edge Locations:**
```bash
GET /edge-diagnostics/v1/edge-locations
```

## Project Structure

```
edgegrid-api/
├── modules/
│   ├── create-auth-header.ts    # EdgeGrid authentication policy
│   ├── edgegrid-call.ts          # Main proxy handler
│   └── third-party/              # Third-party dependencies
│       └── @akamai/
│           └── edgegrid-auth/    # EdgeGrid authentication library
├── config/
│   ├── policies.json             # Zuplo policies configuration
│   └── routes.oas.json           # OpenAPI routes definition
├── package.json
└── README.md
```

## How It Works

1. **Request Reception**: The API receives an incoming request to a proxied endpoint
2. **Authentication**: The EdgeGrid authentication policy (`create-auth-header.ts`) generates the required authentication headers using your Akamai credentials
3. **Request Forwarding**: The authenticated request is forwarded to the Akamai Edge Diagnostics API (`edgegrid-call.ts`)
4. **Response Handling**: The response from Akamai is returned to the client

## Development

### Linting

```bash
npm run lint
```

### Documentation

Build and run documentation:

```bash
npm run docs
```

## Technology Stack

- **Zuplo**: API gateway platform
- **TypeScript**: Type-safe JavaScript
- **Akamai EdgeGrid Auth**: Official Akamai authentication library
- **ESBuild**: Fast JavaScript bundler

## Security

- All Akamai credentials are stored as environment variables
- EdgeGrid authentication ensures secure API access
- Requests are signed with HMAC-based signatures
- No credentials are exposed in client applications

## License

Private

## Support

For issues or questions, please contact the maintainer or create an issue in the repository.

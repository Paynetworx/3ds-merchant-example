# 3D Secure Merchant Example Application

A reference implementation demonstrating how to integrate with Paynetworx 3DS (3D Secure) endpoint for secure payment processing.

## Overview

This repository provides an example of 3D Secure integration for online merchants. 3D Secure (3DS) is a security protocol designed to provide an additional layer of security for online credit and debit card transactions. This implementation demonstrates both the backend server integration and frontend payment form implementation using modern web technologies.

## Features

- Complete 3DS 2.0 workflow implementation
- Frontend payment form with card data collection
- Backend integration with Paynetworx 3DS API
- Docker containerization for easy testing
- Support for both frictionless flow and challenge flow
- Vue.js and TypeScript implementation

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker and Docker Compose (for containerized deployment)
- Node.js and npm (for local development)
- TypeScript development environment
- Access to Paynetworx 3DS environment (credentials required)

## Architecture

### Backend

The backend component is built with Express.js (Node.js) and handles:
- Hosting the payment web application
- Communicating with the Paynetworx 3DS API
- Managing the authentication flow
- Processing transaction responses

Key API endpoints:
- `/api/auth`: Initiates the payment authorization process
- `/api/3ds_method/:tranId`: Handles 3DS method verification
- `/api/challenge/:tranId`: Processes the challenge completion

### Frontend

The frontend is a Vue.js application that provides:
- Payment form for card details collection
- 3DS flow integration
- User experience during authentication
- Response handling

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Paynetworx/3ds-merchant-example.git
cd 3ds-merchant-example
```

### 2. Configure environment

Create a `docker-compose.yml` file by copying the example and updating it with your credentials:

```bash
cp docker-compose.yml.example docker-compose.yml
```

Edit the `docker-compose.yml` file to include:
- Your Paynetworx 3DS endpoint URL
- Your API username and password
- Any other environment-specific configurations

### 3. Build and run with Docker

```bash
# Build the Docker image
docker build .

# Start the containers
docker compose up -d
```

### 4. Access the application

Once running, access the payment demo at:

```
http://localhost:8080
```

## 3DS Flow Explanation

This implementation handles the complete 3DS authentication flow:

1. **Card Data Collection**: Gather payment card details from the customer
2. **Authentication Initiation**: Send card details to the 3DS server
3. **Method Verification** (Browser fingerprinting): Collect browser data for risk assessment
4. **Authentication Request**: Process authentication with the card issuer
5. **Challenge Flow** (if required): Present challenge screen to the customer
6. **Authentication Result**: Receive and process the authentication result
7. **Payment Authorization**: Complete the payment transaction

The flow supports both frictionless (no challenge required) and challenge flows based on the issuer's risk assessment.

## Development and Testing

For local development:

```bash
# Install backend dependencies
cd backend
npm install
npm run dev

# In a separate terminal, install and run frontend
cd frontend
npm install
npm run serve
```

## Security Considerations

- This is not a production ready implementation, just a basic implemention to help you understand the integration process
- Never store card data permanently
- Always use HTTPS for production environments
- Follow PCI-DSS requirements for handling card data
- Implement proper error handling and logging

## Troubleshooting

Common issues and solutions:

- **Connection errors**: Verify network connectivity and API credentials
- **Authentication failures**: Check card details and 3DS enrollment
- **Challenge flow issues**: Ensure proper handling of redirect URLs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Disclaimer

This is a reference implementation for educational purposes. Before going live with a payment integration, ensure all security and compliance requirements are met.

## Contact

For questions or support regarding this implementation, please contact Paynetworx support.

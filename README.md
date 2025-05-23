# ChainForex

An open-source forex trading bot built on the Sui blockchain, powered by Pyth Network for real-time price data.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sui](https://img.shields.io/badge/Sui-Network-blue)](https://sui.io/)
[![Pyth](https://img.shields.io/badge/Pyth-Oracle-orange)](https://pyth.network/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

### 💡 Summary Statement:

**ChainForex** is a pioneering open-source protocol that automates forex trading on the blockchain. By combining real-time data from **Pyth** with the speed and security of **Sui**, ChainForex empowers developers and traders to experiment with, contribute to, and build upon the future of decentralized finance in the global forex market.

### 📦 Package Information:

- **Package Name**: chainforex
- **Version**: 1.0.0
- **Author**: Samuel Elias
- **License**: MIT

### 🔄 Latest Updates:

- Added Markets page with real-time Pyth Network price feeds
- Implemented professional forex trading interface
- Added mock trading functionality for testing
- Integrated automated trading bot capabilities

---

## 🚀 Development Setup

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Sui CLI
- Git

### Project Structure

```
chainforex/
├── move/               # Sui Move smart contracts
│   ├── sources/       # Contract source files
│   └── Move.toml      # Move package manifest
├── frontend/          # React frontend application
│   ├── src/          # Frontend source code
│   └── package.json  # Frontend dependencies
├── contracts/        # Additional contract utilities
└── docs/            # Documentation
```

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chainforex.git
   cd chainforex
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Build Move contracts:
   ```bash
   yarn move:build
   ```

4. Start frontend development server:
   ```bash
   yarn frontend:dev
   ```

### Available Scripts

- `yarn frontend:dev` - Start frontend development server
- `yarn frontend:build` - Build frontend for production
- `yarn move:build` - Build Move contracts
- `yarn move:test` - Run Move contract tests
- `yarn move:publish` - Publish contracts to Sui network

### Environment Setup

Create a `.env` file in the frontend directory:
```env
VITE_SUI_NETWORK=devnet
VITE_PYTH_ENDPOINT=https://xc-testnet.pyth.network
```

## 🌟 Overview

ChainForex is a decentralized, open-source forex trading bot that operates entirely on-chain. It leverages real-time price data from Pyth Network and executes trades automatically using smart contracts on the Sui blockchain.

### Key Features

- 🔄 Automated forex trading using trend-following strategies
- 📊 Real-time price data from Pyth Network
- 📝 Smart contract execution on Sui blockchain
- 📈 Transparent on-chain trade history
- 🔓 Open-source codebase for community collaboration
- 🎨 Modern React frontend with Sui SDK integration

## 🚀 Getting Started

### Prerequisites

- Sui CLI installed
- Node.js (v16 or higher)
- Git
- Sui Wallet Browser Extension

### Frontend Tech Stack

- **React 18** - UI framework
- **@mysten/sui.js** - Sui JavaScript SDK
- **@mysten/wallet-kit** - Sui Wallet integration
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type safety and better developer experience

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chainforex.git

# Navigate to project directory
cd chainforex

# Install dependencies
npm install
```

### Frontend Configuration

1. Create a `.env` file in the frontend directory:

```bash
VITE_SUI_NETWORK=devnet
VITE_PYTH_ENDPOINT=your_endpoint
VITE_CONTRACT_ADDRESS=your_contract_address
```

### Running the Application

```bash
# Start the frontend development server
npm run dev

# Build for production
npm run build
```

## 🛠 Technical Architecture

### Frontend Architecture

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
│   ├── useSui.ts      # Sui SDK integration
│   ├── usePyth.ts     # Pyth Network data hooks
│   └── useWallet.ts   # Wallet connection hooks
├── pages/             # Page components
├── services/          # API and blockchain services
├── store/             # State management
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

### Sui SDK Integration

```typescript
// Example of Sui SDK usage
import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const client = new SuiClient({ url: "https://fullnode.devnet.sui.io" });

// Example transaction
const txb = new TransactionBlock();
// Add transaction logic here
```

### Wallet Integration

```typescript
// Example of wallet integration
import { ConnectButton } from "@mysten/wallet-kit";

function WalletConnection() {
  return (
    <div>
      <ConnectButton />
    </div>
  );
}
```

### Smart Contracts (Move)

- Trading logic implementation
- Order execution
- Position management

### Pyth Network Integration

- Real-time forex price feeds
- Price verification and validation
- Oracle data consumption

## 💻 Development

### Frontend Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

### Code Style

- ESLint configuration for React and TypeScript
- Prettier for code formatting
- Husky for pre-commit hooks

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/README.md)
- [Sui Network](https://sui.io/)
- [Pyth Network](https://pyth.network/)
- [Sui SDK Documentation](https://sdk.mystenlabs.com/typescript)
- [Sui Wallet Kit](https://kit.suiwallet.io/)

## ⚠️ Disclaimer

This software is in beta and should be used at your own risk. The authors take no responsibility for financial losses incurred through the use of this trading bot.

## 📞 Contact

- GitHub Issues: For bug reports and feature requests
- Discord: [Join our community](your_discord_link)
- Twitter: [@ChainForex](your_twitter_link)

---

Built with ❤️ by the ChainForex Team

# Cross-Chain Wallet Activity Dashboard

A minimal, production-ready Web3 dashboard for viewing wallet activity across multiple blockchain networks (Ethereum, Polygon, Arbitrum). Built with React, TypeScript, ethers.js, and Alchemy RPC.

## 🚀 Features

- **Wallet Connection**: Connect MetaMask wallet with seamless connection/disconnection handling
- **Multi-Chain Support**: View transactions across Ethereum, Polygon, and Arbitrum
- **Transaction History**: Display last 10 transactions with detailed information:
  - Timestamp
  - Transaction type (sent/received)
  - Amount in native token and USD equivalent
  - Recipient/Sender addresses
  - Network/Chain name
  - Status (pending, confirmed, failed)
- **Chain Selection**: Filter transactions by selected blockchain networks
- **Network Switching**: Switch MetaMask network directly from the dashboard
- **Loading States**: Proper loading indicators while fetching data
- **Error Handling**: Graceful error handling for network failures, rate limits, and invalid addresses
- **Responsive Design**: Mobile-first responsive UI built with Tailwind CSS
- **Caching**: 2-minute cache to avoid redundant RPC calls
- **LocalStorage Persistence**: Remembers selected chain preference

## screenshot
- I have added a screenshot folder also where the screenshot of the project working is present.

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Alchemy API keys (free tier available at [alchemy.com](https://www.alchemy.com/))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cross-chain-wallet-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_ALCHEMY_ETHEREUM=your_ethereum_api_key_here
   VITE_ALCHEMY_POLYGON=your_polygon_api_key_here
   VITE_ALCHEMY_ARBITRUM=your_arbitrum_api_key_here
   ```

   To get your Alchemy API keys:
   1. Sign up at [alchemy.com](https://www.alchemy.com/)
   2. Create a new app for each network (Ethereum, Polygon, Arbitrum)
   3. Copy the HTTP API key from each app's dashboard
   4. Paste them into your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in the terminal)

## 📁 Project Structure

```
cross-chain-wallet-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── ChainSelector.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── TransactionList.tsx
│   │   └── WalletConnection.tsx
│   ├── context/             # React Context providers
│   │   └── WalletContext.tsx
│   ├── services/            # External service integrations
│   │   └── alchemy.ts       # Alchemy RPC service with caching
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── errors.ts        # Error handling utilities
│   │   ├── formatters.ts    # Formatting helpers
│   │   └── storage.ts        # LocalStorage utilities
│   ├── styles/              # Global styles
│   │   └── index.css
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── .env.example             # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🏗️ Architecture

### Component Structure

The application follows a component-based architecture with clear separation of concerns:

- **App.tsx**: Main application wrapper with WalletProvider
- **WalletConnection**: Handles wallet connection/disconnection UI
- **ChainSelector**: Multi-chain selection with network switching
- **TransactionList**: Fetches and displays transaction history
- **TransactionItem**: Individual transaction card component
- **LoadingSpinner**: Loading state indicators
- **ErrorDisplay**: Error message display with retry functionality

### State Management

**Context API** is used for state management, specifically:

- **WalletContext**: Manages wallet connection state, address, chain ID, and provider instance
  - Why Context API? For this application size, Context API provides:
    - Simpler setup than Redux/Zustand
    - Built-in React solution (no external dependencies)
    - Sufficient for the scope of wallet state
    - Easy to understand and maintain

### Service Layer

**Alchemy Service** (`src/services/alchemy.ts`):
- Handles all RPC calls to Alchemy endpoints
- Implements 2-minute caching to reduce redundant API calls
- Retry logic with exponential backoff for rate limit errors
- Error handling and transformation
- Multi-chain transaction fetching

### Multi-Chain Fetch Strategy

**Parallel Fetching** is used for multi-chain transaction fetching:

- **Why Parallel?**
  - Faster overall response time (all chains fetch simultaneously)
  - Better user experience (results appear as they complete)
  - Efficient resource utilization
  - Independent chain failures don't block other chains

- **Implementation**: `Promise.all()` is used to fetch from all selected chains concurrently, with individual error handling per chain.

### Styling Approach

**Tailwind CSS** is used for styling:

- **Why Tailwind?**
  - Rapid development with utility classes
  - Consistent design system
  - Small production bundle size (purged unused classes)
  - Mobile-first responsive design
  - No runtime CSS-in-JS overhead

- **Tradeoffs**:
  - Slightly larger HTML (mitigated by purging)
  - Learning curve for utility-first approach
  - Less component-scoped styling (acceptable for this project size)

## 🔧 Configuration

### Environment Variables

The application requires Alchemy API keys for each supported network. These are loaded at build time via Vite's environment variable system.

**Required Variables:**
- `VITE_ALCHEMY_ETHEREUM`: Ethereum mainnet API key
- `VITE_ALCHEMY_POLYGON`: Polygon mainnet API key
- `VITE_ALCHEMY_ARBITRUM`: Arbitrum One API key

### Supported Chains

Currently supported chains (defined in `src/types/index.ts`):
- **Ethereum** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)

To add more chains:
1. Add chain configuration to `SUPPORTED_CHAINS` in `src/types/index.ts`
2. Add corresponding environment variable
3. Update `CHAIN_IDS` array

## 🎨 UI/UX Decisions

### Mobile-First Design

The application uses a **mobile-first** approach:
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Stacked layouts on mobile, side-by-side on desktop
- Touch-friendly button sizes
- Readable text sizes on all devices

### Visual Hierarchy

- **Header**: Clear title and description
- **Wallet Connection**: Prominent connection button when disconnected
- **Chain Selection**: Visual checkboxes with selected state
- **Transactions**: Card-based layout with clear status indicators
- **Color Coding**: 
  - Green for received transactions
  - Red for sent transactions
  - Status badges (green/yellow/red)

### Loading & Error States

- **Loading**: Spinner with descriptive text
- **Errors**: Red-bordered error boxes with retry functionality
- **Empty States**: Helpful messages when no data is available

## 🐛 Error Handling

The application handles various error scenarios:

1. **Network Connection Failures**: Shows user-friendly message with retry option
2. **Rate Limiting (429)**: Automatic retry with exponential backoff
3. **Invalid Wallet Address**: Validation before API calls
4. **MetaMask Not Installed**: Clear instructions to install extension
5. **Chain Switching Failures**: Error messages with context
6. **RPC Provider Errors**: Graceful degradation with error messages

## ⚡ Performance Optimizations

1. **Caching**: 2-minute cache for transaction data to reduce RPC calls
2. **Parallel Fetching**: Multi-chain data fetched concurrently
3. **Lazy Loading**: Components only render when needed
4. **Memoization**: React hooks optimized to prevent unnecessary re-renders
5. **Code Splitting**: Vite automatically splits code for optimal loading

## 🔒 Security Considerations

- **No Private Keys**: Application never handles private keys (MetaMask manages them)
- **Read-Only Operations**: Only reads transaction history (no write operations)
- **Environment Variables**: API keys stored in `.env` (not committed to git)
- **Input Validation**: Wallet addresses validated before use

## 📝 Assumptions & Tradeoffs

### Assumptions

1. **MetaMask Only**: Currently supports MetaMask wallet (can be extended to WalletConnect)
2. **Last 10 Transactions**: Fetches last 10 transactions per chain (configurable)
3. **USD Pricing**: Uses placeholder USD conversion (in production, integrate price API like CoinGecko)
4. **Standard RPC**: Uses standard JSON-RPC methods (Alchemy enhanced APIs available but not required)

### Tradeoffs

1. **Transaction Fetching**: Uses block scanning approach (slower but works with standard RPC)
   - **Alternative**: Alchemy's `getAssetTransfers` API (faster, requires Alchemy-specific endpoints)
2. **Caching Duration**: 2 minutes (balance between freshness and performance)
3. **Error Recovery**: Manual retry (could add automatic retry with exponential backoff)
4. **State Management**: Context API (sufficient for current scope, could migrate to Zustand if complexity grows)

## 🚧 Known Limitations

1. **Transaction History**: Limited to recent blocks (last 1000 blocks scanned)
   - **Future**: Integrate Alchemy's transaction history API for complete history
2. **USD Pricing**: Placeholder calculation (not real-time)
   - **Future**: Integrate CoinGecko or similar price API
3. **Token Transfers**: Only shows native token transfers (ETH, MATIC)
   - **Future**: Support ERC-20 token transfers
4. **Pagination**: Shows only last 10 transactions
   - **Future**: Add pagination for more transactions
5. **Network Detection**: Requires manual network switching
   - **Future**: Auto-detect and prompt for network switching

## 🔮 Future Improvements

1. **Enhanced Transaction Details**: 
   - Gas fees breakdown
   - Transaction receipt details
   - Link to block explorer

2. **Price Integration**:
   - Real-time USD conversion via CoinGecko API
   - Historical price charts

3. **Token Support**:
   - ERC-20 token transfers
   - NFT transfers
   - Token balances

4. **Advanced Features**:
   - Transaction filtering (by type, date, amount)
   - Export transaction history (CSV/JSON)
   - Dark mode toggle
   - Multi-wallet support

5. **Testing**:
   - Unit tests for utilities and services
   - Integration tests for wallet connection
   - E2E tests for user flows

6. **Performance**:
   - Virtual scrolling for large transaction lists
   - Optimistic UI updates
   - Service worker for offline support

## 📚 Technologies Used

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **ethers.js v5**: Ethereum library for wallet interaction
- **Tailwind CSS**: Utility-first CSS framework
- **Alchemy**: Blockchain RPC provider

## 📄 License

This project is built for assessment purposes.

## 🤝 Contributing

This is an assessment project. For questions or improvements, please refer to the assessment guidelines.

---

**Built with ❤️ for Web3**


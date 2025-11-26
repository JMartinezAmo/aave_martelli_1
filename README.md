# Aave v3 Carry Trade Bot

**Automated carry trade bot with leverage looping on Aave v3**

This is an **EXPERIMENTAL** bot for educational purposes and small capital experimentation (~€1,000). It implements a carry trade strategy by:

1. Depositing stablecoin collateral (e.g., USDC)
2. Borrowing another stablecoin (e.g., USDT)
3. Swapping borrowed tokens back to collateral
4. Re-depositing to create leverage (looping)
5. Profiting from the spread between deposit APY and borrow APY

## 📚 Guías Completas para Novatos

Este proyecto incluye guías detalladas diseñadas para democratizar el acceso al carry trade en DeFi:

- **[GUÍA DE DEPLOYMENT](./GUIA_DEPLOYMENT.md)** - Instalación paso a paso para principiantes
  - Requisitos previos y herramientas necesarias
  - Configuración completa del proyecto
  - Verificación y troubleshooting
  - Mejores prácticas de seguridad

- **[GUÍA DE USO](./GUIA_USO.md)** - Cómo usar el bot efectivamente
  - Conceptos fundamentales de carry trade
  - Interpretación de APYs, spread y health factor
  - Estrategias para principiantes
  - Gestión de riesgos y ejemplos prácticos
  - Escenarios de emergencia

**¿Eres novato?** Empieza por la [Guía de Deployment](./GUIA_DEPLOYMENT.md) y luego continúa con la [Guía de Uso](./GUIA_USO.md).

## ⚠️ CRITICAL WARNINGS

**DO NOT USE WITH LARGE CAPITAL**

This code is experimental and intended for learning purposes only. Risks include:

- **Liquidation risk**: If health factor drops below 1.0, your position will be liquidated
- **Rate risk**: APY spreads can turn negative, causing losses
- **Depeg risk**: Stablecoins can lose their peg, causing significant losses
- **Smart contract risk**: Bugs in this code or underlying protocols
- **Gas costs**: Can eat into profits, especially on Ethereum mainnet
- **Slippage**: DEX swaps may have unfavorable execution

**USE AT YOUR OWN RISK. ONLY USE CAPITAL YOU CAN AFFORD TO LOSE.**

## Architecture

```
├── config/              # Configuration files
│   ├── networks.ts      # Network addresses (Aave, tokens, DEX)
│   └── strategy.ts      # Strategy parameters (risk limits, APY thresholds)
├── src/
│   ├── infrastructure/  # Provider, contracts
│   ├── aave/           # Aave service layer (supply, borrow, repay, withdraw)
│   ├── swaps/          # DEX swap service (Uniswap v3)
│   ├── strategy/       # Core looping logic
│   └── cli.ts          # Command-line interface
├── test/
│   ├── unit/           # Unit tests for calculations
│   └── integration/    # Integration tests with mainnet fork
└── abis/               # Contract ABIs
```

## Features

- **Modular architecture**: Separate concerns (infrastructure, Aave, swaps, strategy)
- **Type-safe**: Written in TypeScript with strong types
- **Conservative defaults**: 1.8 min health factor, 70% max LTV usage
- **Risk controls**: Configurable limits, safety margins, spread thresholds
- **Dry run mode**: Simulate operations without sending transactions
- **Testing**: Unit tests + integration tests with Hardhat fork
- **Easy configuration**: All parameters in config files

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:

```env
# RPC endpoint (Infura, Alchemy, etc.)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Your private key (NEVER commit this!)
PRIVATE_KEY=0x...

# Network (default: mainnet)
NETWORK=mainnet

# Optional: Enable debug logs
DEBUG=false
```

### 3. Configure strategy

Edit `config/strategy.ts` to adjust:

- `collateralAsset`: Collateral token (default: USDC)
- `debtAsset`: Debt token (default: USDT)
- `maxLoops`: Max loops per operation (default: 3)
- `minHealthFactor`: Min health factor target (default: 1.8)
- `maxLtvUsage`: Max % of available borrows to use (default: 70%)
- `minSpreadBps`: Min spread to open/add loops (default: 10 bps = 0.1%)
- `slippageBps`: Max slippage on swaps (default: 50 bps = 0.5%)
- `dryRun`: Simulate without transactions (default: false)

### 4. Build

```bash
npm run build
```

## Usage

### Commands

#### Check position status

```bash
npm run dev -- status
```

Shows:
- Total collateral and debt
- Health factor
- Available to borrow
- Current APYs
- Spread profitability

#### Open new position

```bash
npm run dev -- open <amount>
```

Example: Open position with 1000 USDC:

```bash
npm run dev -- open 1000
```

This will:
1. Deposit 1000 USDC as collateral
2. Check APY spread
3. Perform up to N loops (configured in `maxLoops`)
4. Each loop: borrow → swap → re-deposit
5. Stop when risk limits reached

#### Add more loops

```bash
npm run dev -- add
```

Adds more leverage to existing position (if safe to do so).

#### Reduce leverage

```bash
npm run dev -- delever <targetHF>
```

Example: Deleverage to health factor 2.5:

```bash
npm run dev -- delever 2.5
```

This will:
1. Calculate debt to repay
2. Withdraw collateral
3. Swap to debt token
4. Repay debt

## Testing

### Unit tests

Test pure calculation logic (no blockchain):

```bash
npm run test:unit
```

### Integration tests

Test with Hardhat mainnet fork:

```bash
# Set fork RPC URL
export MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
export FORK=true

# Run tests
npm run test:integration
```

Integration tests:
- Fork mainnet at current block
- Fund test account with USDC
- Execute real transactions on fork
- Verify position health and constraints

### All tests

```bash
npm test
```

## How It Works

### Carry Trade Strategy

The bot profits from the **APY spread** between supplying and borrowing:

```
Net APY = (Deposit APY × Leverage) - (Borrow APY × (Leverage - 1))
```

Example with 3x leverage:
- Deposit APY: 5%
- Borrow APY: 4%
- Net APY ≈ (5% × 3) - (4% × 2) = 15% - 8% = 7%

### Looping Process

Each loop increases leverage:

1. **Initial state**: 1000 USDC deposited
2. **Loop 1**: Borrow 700 USDT → Swap to 700 USDC → Deposit
3. **Loop 2**: Borrow 490 USDT → Swap to 490 USDC → Deposit
4. **Loop 3**: Borrow 343 USDT → Swap to 343 USDC → Deposit

Final state:
- Total collateral: ~2533 USDC
- Total debt: ~1533 USDT
- Leverage: ~2.5x
- Health factor: ~1.8 (safe)

### Risk Management

The bot has multiple safety layers:

1. **Min health factor**: Never goes below configured threshold (default 1.8)
2. **Max LTV usage**: Uses only % of available borrows (default 70%)
3. **Safety margin**: Applies margin to calculated amounts (default 90%)
4. **Spread check**: Won't loop if spread below minimum (default 0.1%)
5. **Slippage protection**: Limits DEX swap slippage (default 0.5%)

## Configuration Reference

### Network Config (`config/networks.ts`)

Official Aave v3 and Uniswap v3 addresses for Ethereum mainnet.

To add other networks (Polygon, Arbitrum, etc.), add entries to the `networks` object.

### Strategy Config (`config/strategy.ts`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `network` | mainnet | Network to use |
| `collateralAsset` | USDC | Collateral token symbol |
| `debtAsset` | USDT | Debt token symbol |
| `maxLoops` | 3 | Max loops per operation |
| `minHealthFactor` | 1.8 | Min target health factor |
| `maxLtvUsage` | 70 | Max % of available borrows (0-100) |
| `minSpreadBps` | 10 | Min spread to loop (bps) |
| `slippageBps` | 50 | Max swap slippage (bps) |
| `borrowSafetyMargin` | 0.90 | Safety factor for borrows (0-1) |
| `dryRun` | false | Simulate without transactions |

## Development

### Project structure

- **config/**: Network addresses and strategy parameters
- **src/infrastructure/**: Provider, contract instances
- **src/aave/**: Aave v3 interaction (supply, borrow, repay, withdraw)
- **src/swaps/**: Uniswap v3 swap logic
- **src/strategy/**: Core business logic (calculations, looping)
- **src/cli.ts**: CLI entry point
- **abis/**: Contract ABIs for Aave and Uniswap
- **test/**: Unit and integration tests

### Adding new networks

1. Add network config in `config/networks.ts`:

```typescript
arbitrum: {
  chainId: 42161,
  name: 'Arbitrum One',
  aave: {
    poolAddressesProvider: '0x...',
    pool: '0x...',
    poolDataProvider: '0x...',
  },
  tokens: {
    USDC: '0x...',
    USDT: '0x...',
  },
  dex: {
    uniswapV3Router: '0x...',
    uniswapV3Quoter: '0x...',
  },
}
```

2. Update `.env`:

```
NETWORK=arbitrum
```

### Extending functionality

To add new features:

1. **New token pairs**: Add addresses in `config/networks.ts`
2. **Different DEX**: Implement new swap service in `src/swaps/`
3. **Advanced strategies**: Extend `src/strategy/loopingStrategy.ts`
4. **Better price feeds**: Integrate Chainlink or Aave oracles

## Common Issues

### "Insufficient balance"

You don't have enough tokens. Check balance:

```bash
npm run dev -- status
```

### "Spread below minimum"

Current APY spread is too low. Options:
- Wait for better rates
- Lower `minSpreadBps` in config (⚠️ increases risk)
- Try different token pair

### "Health factor below minimum"

Position too risky. Deleverage:

```bash
npm run dev -- delever 2.0
```

### "No safe borrow capacity remaining"

Already at max leverage for safety limits. Options:
- Deleverage first
- Increase collateral (manually or via `add` if spread good)

### Tests failing on fork

Ensure:
- `MAINNET_RPC_URL` is set
- RPC endpoint has archive data
- `FORK=true` is set

## Useful Resources

- [Aave v3 Docs](https://docs.aave.com/developers/getting-started/readme)
- [Aave v3 Deployed Contracts](https://docs.aave.com/developers/deployed-contracts/v3-mainnet)
- [Uniswap v3 Docs](https://docs.uniswap.org/protocol/reference/deployments)
- [Hardhat Network Forking](https://hardhat.org/hardhat-network/docs/guides/forking-other-networks)

## License

MIT

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk. The authors are not responsible for any losses incurred through the use of this software.

**NOT FINANCIAL ADVICE. DO YOUR OWN RESEARCH.**

# ⚽ GoalBet — World Cup 2026 Prediction Market

> Built on X Layer Mainnet for the XCup Hackathon

GoalBet is a fully on-chain outcome prediction market for World Cup 2026 matches. Users stake OKB on match outcomes, winners claim proportional payouts, and correct predictors earn exclusive NFT fan badges — all without accounts, KYC, or middlemen.

GoalBet is a real-world example of the permissionless outcome market vision described in the X Layer Exchange OS whitepaper.

---

## 🌐 Live

- **App:** https://goalbet-umber.vercel.app
- **Betting:** https://goalbet-umber.vercel.app/app
- **Leaderboard:** https://goalbet-umber.vercel.app/leaderboard
- **Admin:** https://goalbet-umber.vercel.app/admin
- **Twitter:** [@GoalBetApp](https://x.com/GoalBetApp)

---

## 📄 Contracts (X Layer Mainnet — ChainID 196)

| Contract | Address |
|---|---|
| PredictionMarket.sol | [0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278](https://www.okx.com/explorer/xlayer/address/0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278) |
| FanBadge.sol (ERC-1155) | [0x9CC371D5a337cdbaE3e37B0b8EBD6E47f3101C9f](https://www.okx.com/explorer/xlayer/address/0x9CC371D5a337cdbaE3e37B0b8EBD6E47f3101C9f) |

Both contracts are verified on OKX Explorer.

---

## ✨ Features

- **On-chain prediction markets** — Bet on World Cup match outcomes (Team A / Draw / Team B)
- **OKB staking** — Stake native OKB tokens on predictions
- **Proportional payouts** — Winners split 95% of the pool proportionally
- **NFT fan badges** — ERC-1155 badges minted to correct predictors
- **AI Agent** — Auto-creates markets from live World Cup fixture data
- **Leaderboard** — Ranked by correct predictions and accuracy %
- **Bet history** — Track all past predictions
- **Countdown timers** — Live countdown to each match
- **Share bets** — Share predictions directly to Twitter
- **No KYC** — Just connect your OKX Wallet and go

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | X Layer Mainnet (ChainID 196) |
| Smart Contracts | Solidity 0.8.28 |
| Contract Framework | Hardhat |
| Frontend | React 18 |
| Blockchain Library | ethers.js v5.7.2 |
| Routing | react-router-dom v6 |
| Wallet | OKX Wallet |
| Deployment | Vercel |
| NFT Standard | ERC-1155 |
| AI Agent | Node.js |
| Fixtures API | football-data.org |

---

## 🏗 How It Works

1. **Connect** your OKX Wallet on X Layer
2. **Pick** an upcoming World Cup match
3. **Stake** OKB on your predicted outcome
4. **Wait** for the match to finish
5. **Claim** your OKB winnings + NFT badge if you called it right

---

## 🤖 AI Agent

The AI Agent automatically creates new prediction markets from World Cup 2026 fixture data. Run it from the admin panel or via terminal:

```bash
cd goalbet
node agent.js
```

---

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/Megacollins/goalbet-frontend.git
cd goalbet-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

App runs on `http://localhost:3000`

---

## 📐 Architecture

- **PredictionMarket.sol** — Handles market creation, bet placement, resolution and payouts
- **FanBadge.sol** — ERC-1155 NFT contract, mints badges to winners after each market resolves
- **React Frontend** — Reads markets from blockchain, connects to OKX Wallet for transactions
- **Admin Panel** — Owner-protected dashboard for market management and AI agent
- **AI Agent** — Node.js script that fetches fixtures and calls createMarket() on-chain

---

## 🔮 Roadmap

- [ ] USDC support alongside OKB
- [ ] Mobile app (React Native)
- [ ] Accumulator/parlay betting
- [ ] The Graph integration for faster indexing
- [ ] Cross-chain via OKX Bridge
- [ ] Governance token

---

## 🏆 XCup Hackathon

Built for the X Layer XCup Hackathon — May 2026.

GoalBet demonstrates how Exchange OS's vision of permissionless outcome markets can be realized on X Layer today. Anyone can create a market, anyone can bet, everything settles on-chain.

---

*Built on X Layer · Powered by OKB · World Cup 2026*
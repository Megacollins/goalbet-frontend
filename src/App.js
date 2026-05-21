import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';

const PREDICTION_MARKET_ADDRESS = "0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278";

const PREDICTION_MARKET_ABI = [
  "function marketCount() view returns (uint256)",
  "function createMarket(string,string,string) returns (uint256)",
  "function placeBet(uint256,uint8) payable",
  "function claimWinnings(uint256)",
  "function getMarket(uint256) view returns (tuple(uint256 id, string teamA, string teamB, string matchDate, uint256 totalTeamA, uint256 totalDraw, uint256 totalTeamB, uint8 result, bool resolved, bool exists))",
  "function getBet(uint256,address) view returns (tuple(uint256 amount, uint8 choice, bool claimed))"
];

const MATCHES = [
  { id: 1, teamA: "Brazil", teamB: "Argentina", date: "Jun 15, 2026", flagA: "br", flagB: "ar" },
  { id: 2, teamA: "France", teamB: "England", date: "Jun 16, 2026", flagA: "fr", flagB: "gb-eng" },
  { id: 3, teamA: "Germany", teamB: "Spain", date: "Jun 17, 2026", flagA: "de", flagB: "es" },
  { id: 4, teamA: "Portugal", teamB: "Morocco", date: "Jun 18, 2026", flagA: "pt", flagB: "ma" },
  { id: 5, teamA: "USA", teamB: "Mexico", date: "Jun 19, 2026", flagA: "us", flagB: "mx" },
  { id: 6, teamA: "Japan", teamB: "South Korea", date: "Jun 20, 2026", flagA: "jp", flagB: "kr" },
];

const Flag = ({ code, alt }) => (
  <img
    className="flag"
    src={`https://flagcdn.com/48x36/${code}.png`}
    alt={alt}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
);

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const fetchMyBets = useCallback(async (contractInstance, userAccount) => {
    if (!contractInstance || !userAccount) return;
    try {
      setLoadingBets(true);
      const bets = [];
      for (const match of MATCHES) {
        const bet = await contractInstance.getBet(match.id, userAccount);
        if (bet.amount.toString() !== "0") {
          const market = await contractInstance.getMarket(match.id);
          bets.push({
            matchId: match.id,
            match,
            amount: ethers.utils.formatEther(bet.amount),
            choice: Number(bet.choice),
            claimed: bet.claimed,
            resolved: market.resolved,
            result: Number(market.result),
          });
        }
      }
      setMyBets(bets);
    } catch (err) {
      console.error("Error fetching bets:", err);
    } finally {
      setLoadingBets(false);
    }
  }, []);

  const connectWallet = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError("Please install OKX Wallet!");
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xC4' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xC4',
              chainName: 'X Layer Mainnet',
              nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
              rpcUrls: ['https://rpc.xlayer.tech'],
              blockExplorerUrls: ['https://www.okx.com/explorer/xlayer'],
            }],
          });
        }
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      const predictionContract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        signer
      );

      setAccount(accounts[0]);
      setContract(predictionContract);
      await fetchMyBets(predictionContract, accounts[0]);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const placeBet = async () => {
    if (!contract || !selectedMatch || selectedOutcome === null) return;
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);
      const amount = ethers.utils.parseEther(betAmount);
      const tx = await contract.placeBet(selectedMatch.id, selectedOutcome, {
        value: amount,
        gasLimit: 300000
      });
      await tx.wait();
      setTxHash(tx.hash);
      setSelectedMatch(null);
      setSelectedOutcome(null);
      await fetchMyBets(contract, account);
    } catch (err) {
      setError("Transaction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const claimWinnings = async (matchId) => {
    if (!contract) return;
    try {
      setClaimingId(matchId);
      const tx = await contract.claimWinnings(matchId, { gasLimit: 300000 });
      await tx.wait();
      await fetchMyBets(contract, account);
    } catch (err) {
      setError("Claim failed: " + err.message);
    } finally {
      setClaimingId(null);
    }
  };

  const getBetStatus = (bet) => {
    if (!bet.resolved) return { label: "⏳ Pending", color: "#888" };
    if (bet.claimed) return { label: "✅ Claimed", color: "#00ff88" };
    if (bet.choice === bet.result) return { label: "🏆 Won!", color: "#00ff88" };
    return { label: "❌ Lost", color: "#ff6b6b" };
  };

  const getOutcomeLabel = (choice, match) => {
    if (choice === 1) return `${match.teamA} Wins`;
    if (choice === 2) return "Draw";
    if (choice === 3) return `${match.teamB} Wins`;
    return "Unknown";
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">GoalBet</span>
          <span className="logo-badge">X Layer</span>
        </div>
        {account ? (
          <div className="account">
            <span className="account-dot"></span>
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect OKX Wallet
          </button>
        )}
      </header>

      {/* Hero */}
      <div className="hero">
        <h1>World Cup 2026</h1>
        <p>Predict match outcomes. Stake OKB. Win NFT badges.</p>
        {!account && (
          <button className="hero-btn" onClick={connectWallet}>
            Start Predicting →
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="error-banner">{error}</div>}

      {/* Success */}
      {txHash && (
        <div className="success-banner">
          ✅ Bet placed! <a href={`https://www.okx.com/explorer/xlayer/tx/${txHash}`} target="_blank" rel="noreferrer">View on Explorer</a>
        </div>
      )}

      {/* Matches */}
      <div className="matches-section">
        <h2>Upcoming Matches</h2>
        <div className="matches-grid">
          {MATCHES.map((match) => (
            <div
              key={match.id}
              className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
              onClick={() => { setSelectedMatch(match); setSelectedOutcome(null); }}
            >
              <div className="match-date">📅 {match.date}</div>
              <div className="match-teams">
                <div className="team">
                  <Flag code={match.flagA} alt={match.teamA} />
                  <span className="team-name">{match.teamA}</span>
                </div>
                <div className="vs">VS</div>
                <div className="team">
                  <Flag code={match.flagB} alt={match.teamB} />
                  <span className="team-name">{match.teamB}</span>
                </div>
              </div>
              <div className="match-footer">Tap to predict</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Bets */}
      {account && (
        <div className="bets-section">
          <div className="bets-header">
            <h2>My Bets</h2>
            <button className="refresh-btn" onClick={() => fetchMyBets(contract, account)}>
              🔄 Refresh
            </button>
          </div>
          {loadingBets ? (
            <div className="bets-loading">Loading your bets...</div>
          ) : myBets.length === 0 ? (
            <div className="bets-empty">No bets placed yet. Pick a match above! ⚽</div>
          ) : (
            <div className="bets-grid">
              {myBets.map((bet) => {
                const status = getBetStatus(bet);
                return (
                  <div key={bet.matchId} className="bet-card">
                    <div className="bet-match">
                      <Flag code={bet.match.flagA} alt={bet.match.teamA} />
                      <span>{bet.match.teamA} vs {bet.match.teamB}</span>
                      <Flag code={bet.match.flagB} alt={bet.match.teamB} />
                    </div>
                    <div className="bet-details">
                      <div className="bet-row">
                        <span className="bet-label">Your Pick</span>
                        <span className="bet-value">{getOutcomeLabel(bet.choice, bet.match)}</span>
                      </div>
                      <div className="bet-row">
                        <span className="bet-label">Amount</span>
                        <span className="bet-value">{bet.amount} OKB</span>
                      </div>
                      <div className="bet-row">
                        <span className="bet-label">Status</span>
                        <span className="bet-value" style={{ color: status.color }}>{status.label}</span>
                      </div>
                    </div>
                    {bet.resolved && bet.choice === bet.result && !bet.claimed && (
                      <button
                        className="claim-btn"
                        onClick={() => claimWinnings(bet.matchId)}
                        disabled={claimingId === bet.matchId}
                      >
                        {claimingId === bet.matchId ? "Claiming..." : "💰 Claim Winnings"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bet Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Place Your Prediction</h3>
            <div className="modal-match">
              <Flag code={selectedMatch.flagA} alt={selectedMatch.teamA} />
              {selectedMatch.teamA} vs {selectedMatch.teamB}
              <Flag code={selectedMatch.flagB} alt={selectedMatch.teamB} />
            </div>
            <div className="outcomes">
              <button
                className={`outcome-btn ${selectedOutcome === 1 ? 'active' : ''}`}
                onClick={() => setSelectedOutcome(1)}
              >
                <Flag code={selectedMatch.flagA} alt={selectedMatch.teamA} /> {selectedMatch.teamA} Wins
              </button>
              <button
                className={`outcome-btn ${selectedOutcome === 2 ? 'active' : ''}`}
                onClick={() => setSelectedOutcome(2)}
              >
                🤝 Draw
              </button>
              <button
                className={`outcome-btn ${selectedOutcome === 3 ? 'active' : ''}`}
                onClick={() => setSelectedOutcome(3)}
              >
                <Flag code={selectedMatch.flagB} alt={selectedMatch.teamB} /> {selectedMatch.teamB} Wins
              </button>
            </div>
            <div className="bet-input">
              <label>Bet Amount (OKB)</label>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                min="0.001"
                step="0.001"
              />
            </div>
            <button
              className="place-bet-btn"
              onClick={placeBet}
              disabled={!account || selectedOutcome === null || loading}
            >
              {loading ? "Placing Bet..." : !account ? "Connect Wallet First" : "Place Bet ⚽"}
            </button>
            <button className="cancel-btn" onClick={() => setSelectedMatch(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Built on X Layer • Powered by OKB • World Cup 2026</p>
        <p className="footer-social">
          Follow us on <a href="https://x.com/GoalBetApp" target="_blank" rel="noreferrer">𝕏 @GoalBetApp</a>
        </p>
        <p className="contract-addr">Contract: {PREDICTION_MARKET_ADDRESS}</p>
      </footer>
    </div>
  );
}

export default App;
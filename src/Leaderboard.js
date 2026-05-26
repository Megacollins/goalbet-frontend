import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const PREDICTION_MARKET_ADDRESS = "0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278";

const PREDICTION_MARKET_ABI = [
  "function marketCount() view returns (uint256)",
  "function getMarket(uint256) view returns (tuple(uint256 id, string teamA, string teamB, string matchDate, uint256 totalTeamA, uint256 totalDraw, uint256 totalTeamB, uint8 result, bool resolved, bool exists))",
  "function getBet(uint256,address) view returns (tuple(uint256 amount, uint8 choice, bool claimed))",
  "event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 choice, uint256 amount)"
];

function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const contract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        provider
      );

      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 5000);
      const chunkSize = 50;

      let allEvents = [];
      for (let from = startBlock; from <= currentBlock; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, currentBlock);
        try {
          const filter = contract.filters.BetPlaced();
          const events = await contract.queryFilter(filter, from, to);
          allEvents = [...allEvents, ...events];
        } catch (e) {
          console.log(`Skipping ${from}-${to}`);
        }
      }

      const bettorMap = {};
      for (const event of allEvents) {
        const bettor = event.args.bettor.toLowerCase();
        const amount = parseFloat(ethers.utils.formatEther(event.args.amount));
        const marketId = Number(event.args.marketId);
        const choice = Number(event.args.choice);

        if (!bettorMap[bettor]) {
          bettorMap[bettor] = {
            address: event.args.bettor,
            totalBets: 0,
            totalVolume: 0,
            correctPredictions: 0,
            bets: []
          };
        }

        bettorMap[bettor].totalBets++;
        bettorMap[bettor].totalVolume += amount;
        bettorMap[bettor].bets.push({ marketId, choice });
      }

      const count = await contract.marketCount();
      const marketPromises = [];
      for (let i = 1; i <= Number(count); i++) {
        marketPromises.push(contract.getMarket(i));
      }
      const allMarkets = await Promise.all(marketPromises);

      for (const bettor of Object.values(bettorMap)) {
        for (const bet of bettor.bets) {
          const market = allMarkets[bet.marketId - 1];
          if (market && market.resolved && Number(market.result) === bet.choice) {
            bettor.correctPredictions++;
          }
        }
      }

      const sorted = Object.values(bettorMap)
        .sort((a, b) => b.correctPredictions - a.correctPredictions || b.totalVolume - a.totalVolume)
        .slice(0, 20);

      setLeaders(sorted);
    } catch (err) {
      setError("Failed to load leaderboard: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const shortAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="leaderboard-app">
      <header className="leaderboard-header">
        <div className="leaderboard-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>⚽</span>
          <span className="leaderboard-logo-text">GoalBet</span>
        </div>
        <div className="leaderboard-header-right">
          <button className="leaderboard-back-btn" onClick={() => navigate('/app')}>
            ← Back to App
          </button>
        </div>
      </header>

      <div className="leaderboard-content">
        <div className="leaderboard-hero">
          <h1>🏆 Leaderboard</h1>
          <p>Top predictors on GoalBet — ranked by correct predictions</p>
        </div>

        {error && <div className="leaderboard-error">{error}</div>}

        {loading ? (
          <div className="leaderboard-loading">
            <div className="leaderboard-spinner">⚽</div>
            <p>Loading leaderboard from blockchain...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="leaderboard-empty">
            <p>No predictions yet. Be the first! ⚽</p>
            <button className="leaderboard-cta-btn" onClick={() => navigate('/app')}>
              Start Predicting →
            </button>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-table-header">
              <span>Rank</span>
              <span>Wallet</span>
              <span>Correct</span>
              <span>Total Bets</span>
              <span>Volume</span>
            </div>
            {leaders.map((leader, index) => (
              <div key={leader.address} className={`leaderboard-row ${index < 3 ? 'leaderboard-top' : ''}`}>
                <span className="leaderboard-rank">{getRankEmoji(index)}</span>
                <span className="leaderboard-address">
                  <a href={`https://www.okx.com/explorer/xlayer/address/${leader.address}`} target="_blank" rel="noreferrer">
                    {shortAddress(leader.address)}
                  </a>
                </span>
                <span className="leaderboard-correct">
                  {leader.correctPredictions > 0 ? (
                    <span className="leaderboard-badge">✅ {leader.correctPredictions}</span>
                  ) : '—'}
                </span>
                <span className="leaderboard-bets">{leader.totalBets}</span>
                <span className="leaderboard-volume">{leader.totalVolume.toFixed(4)} OKB</span>
              </div>
            ))}
          </div>
        )}

        <div className="leaderboard-footer-note">
          <p>Rankings based on on-chain data from X Layer · Updates on refresh</p>
          <button className="leaderboard-refresh-btn" onClick={fetchLeaderboard}>
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
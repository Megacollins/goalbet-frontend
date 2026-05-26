import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
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

const FLAG_CODES = {
  "Brazil": "br", "Argentina": "ar", "France": "fr", "England": "gb-eng",
  "Germany": "de", "Spain": "es", "Portugal": "pt", "Morocco": "ma",
  "USA": "us", "Mexico": "mx", "Japan": "jp", "South Korea": "kr",
  "Italy": "it", "Netherlands": "nl", "Belgium": "be", "Croatia": "hr",
  "Uruguay": "uy", "Colombia": "co", "Ecuador": "ec", "Senegal": "sn",
  "Ghana": "gh", "Cameroon": "cm", "Nigeria": "ng", "Australia": "au",
  "South Africa": "za", "Tunisia": "tn", "Iran": "ir", "Serbia": "rs",
  "Denmark": "dk", "Poland": "pl", "Saudi Arabia": "sa", "Algeria": "dz",
  "Turkey": "tr", "Chile": "cl", "Egypt": "eg", "New Zealand": "nz",
  "Romania": "ro", "Venezuela": "ve", "Hungary": "hu", "Peru": "pe",
  "Ivory Coast": "ci", "Czech Republic": "cz", "Czechia": "cz",
  "Bosnia-Herzegovina": "ba", "Paraguay": "py", "Qatar": "qa",
  "Switzerland": "ch", "Canada": "ca"
};

const getFlag = (teamName) => FLAG_CODES[teamName] || "un";

const useCountdown = (matchDate) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const match = new Date(matchDate + " 18:00:00 UTC").getTime();
      const diff = match - now;

      if (diff <= 0) {
        setTimeLeft('Started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m`);
    };

    calculate();
    const timer = setInterval(calculate, 60000);
    return () => clearInterval(timer);
  }, [matchDate]);

  return timeLeft;
};

const Flag = ({ code, alt }) => (
  <img
    className="flag"
    src={`https://flagcdn.com/48x36/${code}.png`}
    alt={alt}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
);

const MatchCountdown = ({ date }) => {
  const timeLeft = useCountdown(date);
  if (!timeLeft) return null;
  return (
    <span className="match-countdown">⏱ {timeLeft}</span>
  );
};

function App() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [pastBets, setPastBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchMarkets = useCallback(async () => {
    try {
      setLoadingMarkets(true);
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const readContract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        provider
      );
      const count = await readContract.marketCount();
      const hidden = JSON.parse(localStorage.getItem('hiddenMarkets') || '[]');

      const promises = [];
      for (let i = 1; i <= Number(count); i++) {
        promises.push(readContract.getMarket(i));
      }
      const allMarkets = await Promise.all(promises);

      const marketList = [];
      for (const market of allMarkets) {
        if (!market.resolved && !hidden.includes(Number(market.id))) {
          marketList.push({
            id: Number(market.id),
            teamA: market.teamA,
            teamB: market.teamB,
            date: market.matchDate,
            flagA: getFlag(market.teamA),
            flagB: getFlag(market.teamB),
            totalTeamA: ethers.utils.formatEther(market.totalTeamA),
            totalDraw: ethers.utils.formatEther(market.totalDraw),
            totalTeamB: ethers.utils.formatEther(market.totalTeamB),
          });
        }
      }
      setMarkets(marketList);
    } catch (err) {
      console.error("Error fetching markets:", err);
    } finally {
      setLoadingMarkets(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const fetchMyBets = useCallback(async (contractInstance, userAccount) => {
    if (!contractInstance || !userAccount) return;
    try {
      setLoadingBets(true);
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const readContract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        provider
      );
      const count = await readContract.marketCount();

      const betPromises = [];
      const marketPromises = [];
      for (let i = 1; i <= Number(count); i++) {
        betPromises.push(contractInstance.getBet(i, userAccount));
        marketPromises.push(readContract.getMarket(i));
      }
      const allBets = await Promise.all(betPromises);
      const allBetMarkets = await Promise.all(marketPromises);

      const activeBets = [];
      const historyBets = [];

      for (let i = 0; i < allBets.length; i++) {
        const bet = allBets[i];
        const market = allBetMarkets[i];
        const marketId = i + 1;

        if (bet.amount.toString() !== "0") {
          const betData = {
            matchId: marketId,
            match: {
              teamA: market.teamA,
              teamB: market.teamB,
              flagA: getFlag(market.teamA),
              flagB: getFlag(market.teamB),
            },
            amount: ethers.utils.formatEther(bet.amount),
            choice: Number(bet.choice),
            claimed: bet.claimed,
            resolved: market.resolved,
            result: Number(market.result),
          };

          if (!market.resolved) {
            activeBets.push(betData);
          } else if (Number(bet.choice) === Number(market.result)) {
            activeBets.push(betData);
          } else {
            historyBets.push(betData);
          }
        }
      }
      setMyBets(activeBets);
      setPastBets(historyBets);
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

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setMyBets([]);
    setPastBets([]);
    setTxHash(null);
    setError(null);
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
      await fetchMarkets();
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

  const shareBet = (bet) => {
    const outcome = getOutcomeLabel(bet.choice, bet.match);
    const text = `I just bet on ${bet.match.teamA} vs ${bet.match.teamB} — picking ${outcome} on GoalBet ⚽\n\nOn-chain prediction market built on @XLayerOfficial\n\n🌐 goalbet-umber.vercel.app\n\n#GoalBet #XLayer #WorldCup2026`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const BetCard = ({ bet, showClaim = false }) => {
    const status = getBetStatus(bet);
    return (
      <div className={`bet-card ${bet.resolved && bet.choice !== bet.result ? 'bet-card-lost' : ''}`}>
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
        <div className="bet-card-actions">
          {showClaim && bet.resolved && bet.choice === bet.result && !bet.claimed && (
            <button
              className="claim-btn"
              onClick={() => claimWinnings(bet.matchId)}
              disabled={claimingId === bet.matchId}
            >
              {claimingId === bet.matchId ? "Claiming..." : "💰 Claim Winnings"}
            </button>
          )}
          <button className="share-btn" onClick={() => shareBet(bet)}>
            🐦 Share
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">⚽ GoalBet</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => { navigate('/'); setSidebarOpen(false); }}>
            🏠 Home
          </button>
          <button className="sidebar-link" onClick={() => { navigate('/leaderboard'); setSidebarOpen(false); }}>
            🏆 Leaderboard
          </button>
          <button className="sidebar-link" onClick={() => {
            setSidebarOpen(false);
            setTimeout(() => {
              const el = document.getElementById('bet-history');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else setShowHistory(true);
            }, 100);
          }}>
            📜 Bet History
          </button>
        </nav>
      </div>

      <header className="header">
        <div className="header-left">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">⚽</span>
            <span className="logo-text">GoalBet</span>
            <span className="logo-badge">X Layer</span>
          </div>
        </div>
        {account ? (
          <div className="account-wrapper">
            <div className="account">
              <span className="account-dot"></span>
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect OKX Wallet
          </button>
        )}
      </header>

      <div className="hero">
        <h1>World Cup 2026</h1>
        <p>Predict match outcomes. Stake OKB. Win NFT badges.</p>
        {!account && (
          <button className="hero-btn" onClick={connectWallet}>
            Start Predicting →
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {txHash && (
        <div className="success-banner">
          ✅ Bet placed! <a href={`https://www.okx.com/explorer/xlayer/tx/${txHash}`} target="_blank" rel="noreferrer">View on Explorer</a>
        </div>
      )}

      <div className="matches-section">
        <h2>Upcoming Matches</h2>
        {loadingMarkets ? (
          <div style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Loading matches from blockchain...</div>
        ) : markets.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No active markets available.</div>
        ) : (
          <div className="matches-grid">
            {markets.map((match) => (
              <div
                key={match.id}
                className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                onClick={() => { setSelectedMatch(match); setSelectedOutcome(null); }}
              >
                <div className="match-date">
                  📅 {match.date}
                  <MatchCountdown date={match.date} />
                </div>
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
                <div className="match-total-pool">
                  💰 Pool: {(parseFloat(match.totalTeamA) + parseFloat(match.totalDraw) + parseFloat(match.totalTeamB)).toFixed(4)} OKB
                </div>
                <div className="match-footer">Tap to predict</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {account && (
        <>
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
              <div className="bets-empty">No active bets. Pick a match above! ⚽</div>
            ) : (
              <div className="bets-grid">
                {myBets.map((bet) => (
                  <BetCard key={bet.matchId} bet={bet} showClaim={true} />
                ))}
              </div>
            )}
          </div>

          <div id="bet-history" className="bets-section">
            <div className="bets-header">
              <h2>Bet History</h2>
              <button className="refresh-btn" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? '🙈 Hide' : '👁 Show'}
              </button>
            </div>
            {pastBets.length === 0 ? (
              <div className="bets-empty">No past bets yet.</div>
            ) : showHistory ? (
              <div className="bets-grid">
                {pastBets.map((bet) => (
                  <BetCard key={bet.matchId} bet={bet} showClaim={false} />
                ))}
              </div>
            ) : (
              <div className="bets-empty" style={{ cursor: 'pointer' }} onClick={() => setShowHistory(true)}>
                {pastBets.length} past bet{pastBets.length > 1 ? 's' : ''} — click Show to view
              </div>
            )}
          </div>
        </>
      )}

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
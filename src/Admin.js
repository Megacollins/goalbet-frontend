import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const PREDICTION_MARKET_ADDRESS = "0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278";
const FAN_BADGE_ADDRESS = "0x9CC371D5a337cdbaE3e37B0b8EBD6E47f3101C9f";
const OWNER_ADDRESS = "0x7d6c05edac00AF30054659aD65e10481bE3f4997";

const PREDICTION_MARKET_ABI = [
  "function marketCount() view returns (uint256)",
  "function createMarket(string,string,string) returns (uint256)",
  "function placeBet(uint256,uint8) payable",
  "function claimWinnings(uint256)",
  "function resolveMarket(uint256,uint8)",
  "function withdrawFees()",
  "function getMarket(uint256) view returns (tuple(uint256 id, string teamA, string teamB, string matchDate, uint256 totalTeamA, uint256 totalDraw, uint256 totalTeamB, uint8 result, bool resolved, bool exists))",
  "function getBet(uint256,address) view returns (tuple(uint256 amount, uint8 choice, bool claimed))",
  "event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 choice, uint256 amount)"
];

const FAN_BADGE_ABI = [
  "function mintBatch(address[] calldata _winners, uint256 _tokenId, uint256 _marketId) external",
  "function mintWinnerBadge(address _winner, uint256 _tokenId, uint256 _marketId) external"
];

const OUTCOME_NAMES = ["None", "Team A Wins", "Draw", "Team B Wins"];

const WC_FIXTURES = [
  { homeTeam: { name: "Netherlands" }, awayTeam: { name: "Ecuador" }, utcDate: "2026-06-14T15:00:00Z" },
  { homeTeam: { name: "Senegal" }, awayTeam: { name: "USA" }, utcDate: "2026-06-14T18:00:00Z" },
  { homeTeam: { name: "Australia" }, awayTeam: { name: "Nigeria" }, utcDate: "2026-06-15T15:00:00Z" },
  { homeTeam: { name: "England" }, awayTeam: { name: "Tunisia" }, utcDate: "2026-06-15T18:00:00Z" },
  { homeTeam: { name: "Spain" }, awayTeam: { name: "Colombia" }, utcDate: "2026-06-16T15:00:00Z" },
  { homeTeam: { name: "France" }, awayTeam: { name: "Mexico" }, utcDate: "2026-06-16T18:00:00Z" },
  { homeTeam: { name: "Argentina" }, awayTeam: { name: "Nigeria" }, utcDate: "2026-06-17T15:00:00Z" },
  { homeTeam: { name: "Germany" }, awayTeam: { name: "Japan" }, utcDate: "2026-06-17T18:00:00Z" },
  { homeTeam: { name: "Portugal" }, awayTeam: { name: "Iran" }, utcDate: "2026-06-18T15:00:00Z" },
  { homeTeam: { name: "Belgium" }, awayTeam: { name: "Croatia" }, utcDate: "2026-06-18T18:00:00Z" },
  { homeTeam: { name: "Uruguay" }, awayTeam: { name: "Italy" }, utcDate: "2026-06-19T15:00:00Z" },
  { homeTeam: { name: "Switzerland" }, awayTeam: { name: "Cameroon" }, utcDate: "2026-06-19T18:00:00Z" },
  { homeTeam: { name: "Denmark" }, awayTeam: { name: "Serbia" }, utcDate: "2026-06-20T15:00:00Z" },
  { homeTeam: { name: "Poland" }, awayTeam: { name: "Saudi Arabia" }, utcDate: "2026-06-20T18:00:00Z" },
  { homeTeam: { name: "Ghana" }, awayTeam: { name: "Algeria" }, utcDate: "2026-06-21T15:00:00Z" },
  { homeTeam: { name: "Turkey" }, awayTeam: { name: "Chile" }, utcDate: "2026-06-21T18:00:00Z" },
  { homeTeam: { name: "Egypt" }, awayTeam: { name: "New Zealand" }, utcDate: "2026-06-22T15:00:00Z" },
  { homeTeam: { name: "Romania" }, awayTeam: { name: "Venezuela" }, utcDate: "2026-06-22T18:00:00Z" },
  { homeTeam: { name: "Hungary" }, awayTeam: { name: "Ivory Coast" }, utcDate: "2026-06-23T15:00:00Z" },
  { homeTeam: { name: "Czech Republic" }, awayTeam: { name: "Peru" }, utcDate: "2026-06-23T18:00:00Z" },
];

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Admin() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [fanBadgeContract, setFanBadgeContract] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [contractBalance, setContractBalance] = useState("0");
  const [newMarket, setNewMarket] = useState({ teamA: '', teamB: '', date: '' });
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [mintingId, setMintingId] = useState(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [hiddenMarkets, setHiddenMarkets] = useState(() => {
    const saved = localStorage.getItem('hiddenMarkets');
    return saved ? JSON.parse(saved) : [];
  });

  const addLog = (msg) => setAgentLogs(prev => [...prev, msg]);

  const fetchMarkets = useCallback(async (contractInstance) => {
    try {
      setLoading(true);
      const count = await contractInstance.marketCount();
      const marketList = [];
      for (let i = 1; i <= Number(count); i++) {
        const market = await contractInstance.getMarket(i);
        marketList.push({
          id: Number(market.id),
          teamA: market.teamA,
          teamB: market.teamB,
          date: market.matchDate,
          totalTeamA: ethers.utils.formatEther(market.totalTeamA),
          totalDraw: ethers.utils.formatEther(market.totalDraw),
          totalTeamB: ethers.utils.formatEther(market.totalTeamB),
          totalPool: ethers.utils.formatEther(
            market.totalTeamA.add(market.totalDraw).add(market.totalTeamB)
          ),
          result: Number(market.result),
          resolved: market.resolved,
        });
      }
      setMarkets(marketList);
    } catch (err) {
      setError("Failed to fetch markets: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContractBalance = useCallback(async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const balance = await provider.getBalance(PREDICTION_MARKET_ADDRESS);
      setContractBalance(ethers.utils.formatEther(balance));
    } catch (err) {
      console.error("Error fetching balance:", err);
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
      const badgeContract = new ethers.Contract(
        FAN_BADGE_ADDRESS,
        FAN_BADGE_ABI,
        signer
      );
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      setContract(predictionContract);
      setFanBadgeContract(badgeContract);
      if (connectedAccount.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        setIsOwner(true);
        await fetchMarkets(predictionContract);
        await fetchContractBalance();
      } else {
        setIsOwner(false);
        setError("Access denied. This panel is only for the contract owner.");
      }
    } catch (err) {
      setError("Failed to connect: " + err.message);
    }
  };

  const runAIAgent = async () => {
    if (!contract) return;
    try {
      setAgentRunning(true);
      setAgentLogs([]);
      setError(null);
      setSuccess(null);

      addLog("🤖 AI Agent starting...");
      addLog("📋 Loading World Cup 2026 fixture database...");

      const matches = WC_FIXTURES;
      addLog(`✅ Loaded ${matches.length} World Cup 2026 fixtures`);
      addLog("🔗 Reading existing markets from contract...");

      const count = await contract.marketCount();
      const existingMarkets = [];
      for (let i = 1; i <= Number(count); i++) {
        const market = await contract.getMarket(i);
        existingMarkets.push({ teamA: market.teamA, teamB: market.teamB });
      }

      addLog(`✅ Found ${existingMarkets.length} existing markets on-chain`);

      const newFixtures = matches.filter(m => {
        const tA = m.homeTeam.name;
        const tB = m.awayTeam.name;
        return !existingMarkets.some(
          em => em.teamA && em.teamB && (
            (em.teamA.toLowerCase() === tA.toLowerCase() && em.teamB.toLowerCase() === tB.toLowerCase()) ||
            (em.teamA.toLowerCase() === tB.toLowerCase() && em.teamB.toLowerCase() === tA.toLowerCase())
          )
        );
      }).slice(0, 5);

      if (newFixtures.length === 0) {
        addLog("✅ All fixtures already have markets. Nothing to do!");
        setSuccess("✅ Agent finished — all fixtures already on-chain!");
        return;
      }

      addLog(`📋 Found ${newFixtures.length} new fixtures to create`);
      addLog("🚀 Creating markets on-chain...");

      let created = 0;
      for (const match of newFixtures) {
        const teamA = match.homeTeam.name;
        const teamB = match.awayTeam.name;
        const date = formatDate(match.utcDate);
        addLog(`⚽ Creating: ${teamA} vs ${teamB} — ${date}`);
        try {
          const tx = await contract.createMarket(teamA, teamB, date, { gasLimit: 300000 });
          await tx.wait();
          addLog(`✅ Created! TX: ${tx.hash.slice(0, 20)}...`);
          created++;
        } catch (err) {
          addLog(`❌ Failed: ${err.message.slice(0, 60)}`);
        }
      }

      addLog(`🎉 Agent finished! ${created} new markets created.`);
      setSuccess(`🤖 AI Agent created ${created} new markets!`);
      await fetchMarkets(contract);

    } catch (err) {
      setError("Agent error: " + err.message);
      addLog("❌ Agent error: " + err.message);
    } finally {
      setAgentRunning(false);
    }
  };

  const toggleMarketVisibility = (marketId) => {
    setHiddenMarkets(prev => {
      const updated = prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId];
      localStorage.setItem('hiddenMarkets', JSON.stringify(updated));
      return updated;
    });
  };

  const resolveMarket = async (marketId, outcome) => {
    if (!contract) return;
    try {
      setResolvingId(marketId);
      setError(null);
      setSuccess(null);
      const tx = await contract.resolveMarket(marketId, outcome, { gasLimit: 300000 });
      await tx.wait();
      setSuccess(`✅ Market ${marketId} resolved as ${OUTCOME_NAMES[outcome]}!`);
      await fetchMarkets(contract);
      await fetchContractBalance();
    } catch (err) {
      setError("Failed to resolve: " + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const mintBadgesToWinners = async (market) => {
    if (!contract || !fanBadgeContract) return;
    try {
      setMintingId(market.id);
      setError(null);
      setSuccess(null);

      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const readContract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        provider
      );

      // Only scan last 500 blocks to avoid timeout
      const currentBlock = await provider.getBlockNumber();
      const startBlock = currentBlock - 500;
      const chunkSize = 50;

      let allEvents = [];
      for (let from = startBlock; from <= currentBlock; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, currentBlock);
        try {
          const filter = readContract.filters.BetPlaced(market.id);
          const events = await readContract.queryFilter(filter, from, to);
          allEvents = [...allEvents, ...events];
        } catch (e) {
          console.log(`Skipping block range ${from}-${to}`);
        }
      }

      const winningOutcome = market.result;
      const winners = allEvents
        .filter(e => Number(e.args.choice) === winningOutcome)
        .map(e => e.args.bettor);

      // If no events found in recent blocks, use the market's bettor data differently
      if (winners.length === 0) {
        setError("No winners found in recent blocks. Try using the manual mint option.");
        return;
      }

      const uniqueWinners = [...new Set(winners)];
      const tx = await fanBadgeContract.mintBatch(
        uniqueWinners,
        winningOutcome,
        market.id,
        { gasLimit: 500000 }
      );
      await tx.wait();
      setSuccess(`🎖 Minted badges to ${uniqueWinners.length} winner(s) for Market #${market.id}!`);
    } catch (err) {
      setError("Failed to mint badges: " + err.message);
    } finally {
      setMintingId(null);
    }
  };

  const withdrawFees = async () => {
    if (!contract) return;
    try {
      setWithdrawing(true);
      setError(null);
      setSuccess(null);
      const tx = await contract.withdrawFees({ gasLimit: 300000 });
      await tx.wait();
      setSuccess("✅ Fees withdrawn successfully!");
      await fetchContractBalance();
    } catch (err) {
      setError("Failed to withdraw: " + err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const createMarket = async () => {
    if (!contract || !newMarket.teamA || !newMarket.teamB || !newMarket.date) return;
    try {
      setCreatingMarket(true);
      setError(null);
      setSuccess(null);
      const tx = await contract.createMarket(newMarket.teamA, newMarket.teamB, newMarket.date, { gasLimit: 300000 });
      await tx.wait();
      setSuccess(`✅ Market created: ${newMarket.teamA} vs ${newMarket.teamB}!`);
      setNewMarket({ teamA: '', teamB: '', date: '' });
      await fetchMarkets(contract);
    } catch (err) {
      setError("Failed to create market: " + err.message);
    } finally {
      setCreatingMarket(false);
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-logo">
          <span>⚽</span>
          <span className="admin-logo-text">GoalBet</span>
          <span className="admin-badge">Admin Panel</span>
        </div>
        <div className="admin-header-right">
          {account && (
            <span className="admin-account">
              {isOwner ? "👑 Owner" : "⛔ Not Owner"} — {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          )}
          <button className="admin-back-btn" onClick={() => navigate('/')}>
            ← Back to App
          </button>
        </div>
      </header>

      <div className="admin-content">
        {!account ? (
          <div className="admin-connect">
            <div className="admin-connect-card">
              <h2>🔐 Admin Access</h2>
              <p>Connect your owner wallet to access the admin panel.</p>
              <button className="admin-connect-btn" onClick={connectWallet}>
                Connect OKX Wallet
              </button>
            </div>
          </div>
        ) : !isOwner ? (
          <div className="admin-connect">
            <div className="admin-connect-card">
              <h2>⛔ Access Denied</h2>
              <p>Only the contract owner can access this panel.</p>
              <p className="admin-owner-addr">Owner: {OWNER_ADDRESS}</p>
              <button className="admin-back-btn" onClick={() => navigate('/')}>
                ← Back to App
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="stat-label">Total Markets</span>
                <span className="stat-value">{markets.length}</span>
              </div>
              <div className="admin-stat">
                <span className="stat-label">Active Markets</span>
                <span className="stat-value">{markets.filter(m => !m.resolved).length}</span>
              </div>
              <div className="admin-stat">
                <span className="stat-label">Resolved Markets</span>
                <span className="stat-value">{markets.filter(m => m.resolved).length}</span>
              </div>
              <div className="admin-stat">
                <span className="stat-label">Contract Balance</span>
                <span className="stat-value">{parseFloat(contractBalance).toFixed(4)} OKB</span>
              </div>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {success && <div className="admin-success">{success}</div>}

            <div className="admin-section">
              <h2>🤖 AI Agent</h2>
              <div className="admin-agent-card">
                <div className="admin-agent-info">
                  <p>Automatically scans World Cup 2026 fixtures and creates missing prediction markets on-chain.</p>
                  <button
                    className="admin-agent-btn"
                    onClick={runAIAgent}
                    disabled={agentRunning}
                  >
                    {agentRunning ? "🔄 Agent Running..." : "🤖 Run AI Agent"}
                  </button>
                </div>
                {agentLogs.length > 0 && (
                  <div className="admin-agent-logs">
                    {agentLogs.map((log, i) => (
                      <div key={i} className="admin-agent-log">{log}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-section">
              <h2>💰 Fees</h2>
              <div className="admin-fees-card">
                <p>Available to withdraw: <strong>{parseFloat(contractBalance).toFixed(4)} OKB</strong></p>
                <button
                  className="admin-withdraw-btn"
                  onClick={withdrawFees}
                  disabled={withdrawing || parseFloat(contractBalance) === 0}
                >
                  {withdrawing ? "Withdrawing..." : "Withdraw All Fees"}
                </button>
              </div>
            </div>

            <div className="admin-section">
              <h2>➕ Create New Market</h2>
              <div className="admin-create-card">
                <div className="admin-create-form">
                  <input
                    className="admin-input"
                    placeholder="Team A (e.g. Brazil)"
                    value={newMarket.teamA}
                    onChange={e => setNewMarket({ ...newMarket, teamA: e.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Team B (e.g. Argentina)"
                    value={newMarket.teamB}
                    onChange={e => setNewMarket({ ...newMarket, teamB: e.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Match Date (e.g. Jun 25, 2026)"
                    value={newMarket.date}
                    onChange={e => setNewMarket({ ...newMarket, date: e.target.value })}
                  />
                  <button
                    className="admin-create-btn"
                    onClick={createMarket}
                    disabled={creatingMarket || !newMarket.teamA || !newMarket.teamB || !newMarket.date}
                  >
                    {creatingMarket ? "Creating..." : "Create Market"}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <h2>🏟️ Markets</h2>
              {loading ? (
                <div className="admin-loading">Loading markets...</div>
              ) : (
                <div className="admin-markets">
                  {markets.map((market) => (
                    <div key={market.id} className={`admin-market-card ${market.resolved ? 'resolved' : ''} ${hiddenMarkets.includes(market.id) ? 'hidden-market' : ''}`}>
                      <div className="admin-market-header">
                        <span className="admin-market-id">#{market.id}</span>
                        <span className="admin-market-title">{market.teamA} vs {market.teamB}</span>
                        <span className="admin-market-date">📅 {market.date}</span>
                        {hiddenMarkets.includes(market.id) && (
                          <span className="admin-hidden-badge">🙈 Hidden</span>
                        )}
                        {market.resolved ? (
                          <span className="admin-resolved-badge">✅ {OUTCOME_NAMES[market.result]}</span>
                        ) : (
                          <span className="admin-active-badge">🟢 Active</span>
                        )}
                      </div>
                      <div className="admin-market-stats">
                        <div className="admin-market-stat">
                          <span>{market.teamA} Wins</span>
                          <strong>{market.totalTeamA} OKB</strong>
                        </div>
                        <div className="admin-market-stat">
                          <span>Draw</span>
                          <strong>{market.totalDraw} OKB</strong>
                        </div>
                        <div className="admin-market-stat">
                          <span>{market.teamB} Wins</span>
                          <strong>{market.totalTeamB} OKB</strong>
                        </div>
                        <div className="admin-market-stat total">
                          <span>Total Pool</span>
                          <strong>{market.totalPool} OKB</strong>
                        </div>
                      </div>
                      <div className="admin-market-actions">
                        {!market.resolved && (
                          <div className="admin-resolve-btns">
                            <p className="admin-resolve-label">Resolve as:</p>
                            <button
                              className="admin-resolve-btn team-a"
                              onClick={() => resolveMarket(market.id, 1)}
                              disabled={resolvingId === market.id}
                            >
                              {resolvingId === market.id ? "..." : `🏆 ${market.teamA} Wins`}
                            </button>
                            <button
                              className="admin-resolve-btn draw"
                              onClick={() => resolveMarket(market.id, 2)}
                              disabled={resolvingId === market.id}
                            >
                              {resolvingId === market.id ? "..." : "🤝 Draw"}
                            </button>
                            <button
                              className="admin-resolve-btn team-b"
                              onClick={() => resolveMarket(market.id, 3)}
                              disabled={resolvingId === market.id}
                            >
                              {resolvingId === market.id ? "..." : `🏆 ${market.teamB} Wins`}
                            </button>
                          </div>
                        )}
                        {market.resolved && (
                          <button
                            className="admin-mint-btn"
                            onClick={() => mintBadgesToWinners(market)}
                            disabled={mintingId === market.id}
                          >
                            {mintingId === market.id ? "Minting..." : "🎖 Mint Badges to Winners"}
                          </button>
                        )}
                        <button
                          className={`admin-toggle-btn ${hiddenMarkets.includes(market.id) ? 'visible' : ''}`}
                          onClick={() => toggleMarketVisibility(market.id)}
                        >
                          {hiddenMarkets.includes(market.id) ? '👁 Show in App' : '🙈 Hide from App'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
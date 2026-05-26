import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const PREDICTION_MARKET_ADDRESS = "0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278";

const PREDICTION_MARKET_ABI = [
  "function marketCount() view returns (uint256)",
  "function getMarket(uint256) view returns (tuple(uint256 id, string teamA, string teamB, string matchDate, uint256 totalTeamA, uint256 totalDraw, uint256 totalTeamB, uint8 result, bool resolved, bool exists))",
  "event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 choice, uint256 amount)"
];

const RANKS = ["🥇", "🥈", "🥉"];
const COLORS = [
  { bg: "#0d1f0d", text: "#00ff88" },
  { bg: "#1a1a2e", text: "#7b68ee" },
  { bg: "#2d1a0a", text: "#ff9f43" },
  { bg: "#0d1a2d", text: "#54a0ff" },
  { bg: "#1a0d2d", text: "#a29bfe" },
  { bg: "#2d0d1a", text: "#ff6b81" },
  { bg: "#0d2d1a", text: "#00d2d3" },
];

function initials(str) {
  const w = str.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : str.slice(0, 2).toUpperCase();
}

function shortAddress(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [names, setNames] = useState(() => {
    try { return JSON.parse(localStorage.getItem('goalbet_names') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.providers.JsonRpcProvider("https://rpc.xlayer.tech");
      const contract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        provider
      );

      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 500);
      const chunkSize = 50;

      let allEvents = [];
      for (let from = startBlock; from <= currentBlock; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, currentBlock);
        try {
          const events = await contract.queryFilter(contract.filters.BetPlaced(), from, to);
          allEvents = [...allEvents, ...events];
        } catch (e) {
          console.log(`Skipping ${from}-${to}`);
        }
      }

      const count = await contract.marketCount();
      const marketPromises = [];
      for (let i = 1; i <= Number(count); i++) {
        marketPromises.push(contract.getMarket(i));
      }
      const allMarkets = await Promise.all(marketPromises);

      const bettorMap = {};
      for (const event of allEvents) {
        const addr = event.args.bettor.toLowerCase();
        const marketId = Number(event.args.marketId);
        const choice = Number(event.args.choice);

        if (!bettorMap[addr]) {
          bettorMap[addr] = { address: event.args.bettor, total: 0, correct: 0 };
        }
        bettorMap[addr].total++;

        const market = allMarkets[marketId - 1];
        if (market && market.resolved && Number(market.result) === choice) {
          bettorMap[addr].correct++;
        }
      }

      const sorted = Object.values(bettorMap)
        .sort((a, b) => b.correct - a.correct || b.total - a.total)
        .slice(0, 20);

      setPlayers(sorted);
    } catch (err) {
      setError("Failed to load: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const doRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const saveName = () => {
    const updated = { ...names, [nameInput.trim().toLowerCase()]: nameInput.trim() };
    setNames(updated);
    localStorage.setItem('goalbet_names', JSON.stringify(updated));
    setModalOpen(false);
  };

  const maxCorrect = Math.max(...players.map(p => p.correct), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap');
        .lb-wrap { min-height: 100vh; background: #0a0a0a; color: #fff; font-family: 'Inter', sans-serif; padding: 0; }
        .lb-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; background: #111; border-bottom: 1px solid #222; position: sticky; top: 0; z-index: 100; }
        .lb-header-left { display: flex; align-items: center; gap: 12px; }
        .lb-logo-btn { background: none; border: none; cursor: pointer; font-size: 20px; font-weight: 800; color: #00ff88; display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; }
        .lb-back { background: transparent; color: #888; border: 1px solid #333; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .lb-back:hover { border-color: #00ff88; color: #00ff88; }
        .lb-content { max-width: 900px; margin: 0 auto; padding: 48px 32px; }
        .lb-hero { margin-bottom: 32px; }
        .lb-hero h1 { font-size: 36px; font-weight: 900; margin-bottom: 8px; }
        .lb-hero p { font-size: 15px; color: #666; }
        .lb-chain-badge { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 11px; color: #00ff88; background: rgba(0,255,136,0.08); border-radius: 20px; padding: 4px 12px; margin-bottom: 28px; border: 1px solid rgba(0,255,136,0.2); }
        .lb-chain-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .lb-actions { display: flex; gap: 8px; margin-bottom: 24px; }
        .lb-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; border: 1px solid #333; border-radius: 8px; padding: 8px 16px; background: #111; transition: all 0.2s; font-family: 'Inter', sans-serif; color: #888; }
        .lb-btn:hover { border-color: #00ff88; color: #00ff88; }
        .lb-btn.primary { background: #00ff88; color: #000; border-color: #00ff88; font-weight: 700; }
        .lb-btn.primary:hover { background: #00cc6a; }
        .lb-table { width: 100%; border-collapse: collapse; background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
        .lb-table thead th { font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.08em; padding: 14px 20px; text-align: left; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; }
        .lb-table thead th.right { text-align: right; }
        .lb-row { border-bottom: 1px solid #1a1a1a; transition: background 0.15s; }
        .lb-row:last-child { border-bottom: none; }
        .lb-row:hover { background: #151515; }
        .lb-row.top3 { background: rgba(0,255,136,0.03); }
        .lb-row td { padding: 14px 20px; vertical-align: middle; }
        .rank-cell { font-family: 'DM Mono', monospace; font-size: 13px; color: #555; width: 40px; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; font-family: 'DM Mono', monospace; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-name { font-size: 14px; font-weight: 600; color: #fff; }
        .user-wallet { font-family: 'DM Mono', monospace; font-size: 12px; color: #555; margin-top: 2px; }
        .pct-cell { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 600; text-align: right; color: #00ff88; }
        .correct-cell { font-family: 'DM Mono', monospace; font-size: 13px; color: #888; text-align: right; }
        .bar-cell { width: 100px; }
        .bar-track { height: 4px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 2px; background: #00ff88; }
        .lb-footer { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; }
        .lb-count { font-size: 12px; color: #444; font-family: 'DM Mono', monospace; }
        .loading-wrap { text-align: center; padding: 80px 20px; color: #555; }
        .spinning { animation: spin 1s linear infinite; display: inline-block; font-size: 32px; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal { background: #111; border: 1px solid #333; border-radius: 12px; padding: 28px; width: 340px; max-width: 90vw; }
        .modal-title { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
        .modal-sub { font-size: 12px; color: #666; margin: 0 0 20px; font-family: 'DM Mono', monospace; }
        .modal label { font-size: 12px; color: #888; display: block; margin-bottom: 8px; }
        .modal input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #333; border-radius: 8px; font-size: 14px; background: #1a1a1a; color: #fff; margin-bottom: 8px; font-family: 'Inter', sans-serif; }
        .modal-hint { font-size: 11px; color: #555; margin: 0 0 20px; font-family: 'DM Mono', monospace; }
        .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .modal-cancel { background: transparent; border: 1px solid #333; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; color: #888; font-family: 'Inter', sans-serif; }
        .modal-save { background: #00ff88; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; color: #000; font-family: 'Inter', sans-serif; font-weight: 700; }
        .lb-error { background: #2d1b1b; color: #ff6b6b; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
      `}</style>

      <div className="lb-wrap">
        <header className="lb-header">
          <div className="lb-header-left">
            <button className="lb-logo-btn" onClick={() => navigate('/')}>
              ⚽ GoalBet
            </button>
          </div>
          <button className="lb-back" onClick={() => navigate('/app')}>
            ← Back to App
          </button>
        </header>

        <div className="lb-content">
          <div className="lb-hero">
            <h1>🏆 Leaderboard</h1>
            <p>Top predictors on GoalBet — ranked by correct predictions</p>
          </div>

          <div className="lb-chain-badge">
            <span className="lb-chain-dot" />
            Live · X Layer on-chain data
          </div>

          <div className="lb-actions">
            <button className="lb-btn primary" onClick={() => setModalOpen(true)}>
              ✏️ Set display name
            </button>
            <button className="lb-btn" onClick={doRefresh} disabled={refreshing}>
              <span className={refreshing ? "spinning" : ""}>🔄</span> Refresh
            </button>
          </div>

          {error && <div className="lb-error">{error}</div>}

          {loading ? (
            <div className="loading-wrap">
              <div className="spinning">⚽</div>
              <p>Loading from blockchain...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="loading-wrap">
              <p>No predictions yet. Be the first!</p>
              <br />
              <button className="lb-btn primary" onClick={() => navigate('/app')}>
                Start Predicting →
              </button>
            </div>
          ) : (
            <>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Predictor</th>
                    <th className="right">Accuracy</th>
                    <th className="right">Correct</th>
                    <th className="bar-cell" />
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
                    const barW = Math.round((p.correct / maxCorrect) * 100);
                    const col = COLORS[i % COLORS.length];
                    const displayName = names[p.address.toLowerCase()];
                    const avatarStr = displayName
                      ? initials(displayName)
                      : p.address.slice(2, 4).toUpperCase();

                    return (
                      <tr key={p.address} className={i < 3 ? "lb-row top3" : "lb-row"}>
                        <td className="rank-cell">
                          {i < 3 ? <span style={{ fontSize: 18 }}>{RANKS[i]}</span> : i + 1}
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="avatar" style={{ background: col.bg, color: col.text }}>
                              {avatarStr}
                            </div>
                            <div>
                              <div className="user-name">
                                {displayName || shortAddress(p.address)}
                              </div>
                              {displayName && (
                                <div className="user-wallet">{shortAddress(p.address)}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="pct-cell">{pct}%</td>
                        <td className="correct-cell">{p.correct}/{p.total}</td>
                        <td className="bar-cell">
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${barW}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="lb-footer">
                <span className="lb-count">{players.length} predictors ranked</span>
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <p className="modal-title">Set display name</p>
            <p className="modal-sub">Stored locally on your device</p>
            <label>Display name (optional)</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. GoldenBoot.eth"
              maxLength={32}
            />
            <p className="modal-hint">Leave blank to show wallet address instead.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="modal-save" onClick={saveName}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
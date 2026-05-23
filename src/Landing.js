import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      <nav className="landing-nav">
        <div className="landing-logo">
          <span>⚽</span>
          <span className="landing-logo-text">GoalBet</span>
          <span className="landing-logo-tag">BETA</span>
        </div>
        <div className="landing-nav-links">
          <a href="https://x.com/GoalBetApp" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com/Megacollins/goalbet-frontend" target="_blank" rel="noreferrer">GitHub</a>
          <button className="landing-launch-btn-sm" onClick={() => navigate('/app')}>Open App</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <div className="landing-live-badge">
            <span className="landing-live-dot" />
            LIVE · World Cup 2026
          </div>
          <h1>The smartest way to<br /><span className="landing-hero-highlight">predict football.</span></h1>
          <p className="landing-hero-sub">
            On-chain prediction markets for World Cup 2026.
            Stake OKB, call the result, collect your winnings — no middlemen, no bookies.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-launch-btn" onClick={() => navigate('/app')}>Start Predicting</button>
            <a className="landing-ghost-btn" href="https://www.okx.com/explorer/xlayer/address/0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278" target="_blank" rel="noreferrer">View Contract</a>
          </div>
        </div>

        <div className="landing-odds-cards">
          <div className="landing-odds-card">
            <div className="landing-odds-match">Brazil vs Argentina</div>
            <div className="landing-odds-row">
              <div className="landing-odds-item active"><span>Brazil</span><strong>2.10</strong></div>
              <div className="landing-odds-item"><span>Draw</span><strong>3.40</strong></div>
              <div className="landing-odds-item"><span>Argentina</span><strong>2.80</strong></div>
            </div>
          </div>
          <div className="landing-odds-card landing-odds-card-2">
            <div className="landing-odds-match">France vs England</div>
            <div className="landing-odds-row">
              <div className="landing-odds-item"><span>France</span><strong>1.90</strong></div>
              <div className="landing-odds-item"><span>Draw</span><strong>3.20</strong></div>
              <div className="landing-odds-item active"><span>England</span><strong>3.10</strong></div>
            </div>
          </div>
          <div className="landing-odds-card landing-odds-card-3">
            <div className="landing-odds-match">Germany vs Spain</div>
            <div className="landing-odds-row">
              <div className="landing-odds-item"><span>Germany</span><strong>2.40</strong></div>
              <div className="landing-odds-item active"><span>Draw</span><strong>3.10</strong></div>
              <div className="landing-odds-item"><span>Spain</span><strong>2.20</strong></div>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-stats-bar">
        <div className="landing-stat-item">
          <span className="landing-stat-num">12+</span>
          <span className="landing-stat-label">Live Markets</span>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <span className="landing-stat-num">OKB</span>
          <span className="landing-stat-label">Native Token</span>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <span className="landing-stat-num">5%</span>
          <span className="landing-stat-label">Platform Fee</span>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <span className="landing-stat-num">ERC-1155</span>
          <span className="landing-stat-label">NFT Badges</span>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <span className="landing-stat-num">X Layer</span>
          <span className="landing-stat-label">Blockchain</span>
        </div>
      </div>

      <section className="landing-how">
        <p className="landing-section-tag">How it works</p>
        <h2>Three steps. That's it.</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-icon">🔗</div>
            <span className="landing-step-num">01</span>
            <h3>Connect Wallet</h3>
            <p>Use OKX Wallet on X Layer. Takes 30 seconds if you haven't done it before.</p>
          </div>
          <div className="landing-step-line" />
          <div className="landing-step">
            <div className="landing-step-icon">⚽</div>
            <span className="landing-step-num">02</span>
            <h3>Pick and Stake</h3>
            <p>Browse live World Cup matches. Pick Team A, Draw, or Team B and stake OKB.</p>
          </div>
          <div className="landing-step-line" />
          <div className="landing-step">
            <div className="landing-step-icon">🏆</div>
            <span className="landing-step-num">03</span>
            <h3>Win and Collect</h3>
            <p>Correct predictions earn OKB payouts and exclusive NFT fan badges.</p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <p className="landing-section-tag">Why GoalBet</p>
        <h2>No account. No KYC. Just a wallet.</h2>
        <div className="landing-features-grid">
          <div className="landing-feature-card landing-feature-large">
            <span className="landing-feature-icon">⛓️</span>
            <h3>Fully On-Chain</h3>
            <p>Every bet, every payout, every market lives on X Layer. No servers, no databases, no trust required. Verify anything on OKX Explorer.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🎖️</span>
            <h3>NFT Fan Badges</h3>
            <p>Win matches and collect ERC-1155 badges as proof of your predictions.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">💰</span>
            <h3>Fair Payouts</h3>
            <p>Winners split 95% of the pool proportionally. Simple math, no surprises.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🤖</span>
            <h3>AI Agent</h3>
            <p>Our AI agent auto-creates markets from live World Cup fixture data.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🔐</span>
            <h3>Non-Custodial</h3>
            <p>Your funds never leave your wallet until you place a bet. You stay in control.</p>
          </div>
        </div>
      </section>

      <section className="landing-contracts">
        <p className="landing-section-tag">Transparent</p>
        <h2>Verified on X Layer</h2>
        <p className="landing-contracts-sub">Both contracts are open source and verified on OKX Explorer.</p>
        <div className="landing-contract-list">
          <a href="https://www.okx.com/explorer/xlayer/address/0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278" target="_blank" rel="noreferrer" className="landing-contract-item">
            <div>
              <span className="landing-contract-name">PredictionMarket.sol</span>
              <span className="landing-contract-desc">Handles all bets, markets and payouts</span>
            </div>
            <span className="landing-contract-addr">0x0d8C...D278 ↗</span>
          </a>
          <a href="https://www.okx.com/explorer/xlayer/address/0x9CC371D5a337cdbaE3e37B0b8EBD6E47f3101C9f" target="_blank" rel="noreferrer" className="landing-contract-item">
            <div>
              <span className="landing-contract-name">FanBadge.sol (ERC-1155)</span>
              <span className="landing-contract-desc">Mints NFT badges to winning predictors</span>
            </div>
            <span className="landing-contract-addr">0x9CC3...C9f ↗</span>
          </a>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-glow" />
        <h2>The World Cup is here. Are you in?</h2>
        <p>No sign up. No KYC. Just connect your OKX Wallet and start predicting.</p>
        <button className="landing-launch-btn" onClick={() => navigate('/app')}>Start Predicting</button>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-left">
          <span className="landing-footer-logo">⚽ GoalBet</span>
          <span>Built on X Layer · Powered by OKB · World Cup 2026</span>
        </div>
        <div className="landing-footer-right">
          <a href="https://x.com/GoalBetApp" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com/Megacollins/goalbet-frontend" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.okx.com/explorer/xlayer/address/0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278" target="_blank" rel="noreferrer">Explorer</a>
        </div>
      </footer>

    </div>
  );
}

export default Landing;
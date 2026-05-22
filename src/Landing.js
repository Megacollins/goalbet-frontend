import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span>⚽</span>
          <span className="landing-logo-text">GoalBet</span>
        </div>
        <div className="landing-nav-links">
          <a href="https://x.com/GoalBetApp" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com/Megacollins/goalbet-frontend" target="_blank" rel="noreferrer">GitHub</a>
          <button className="landing-launch-btn-sm" onClick={() => navigate('/app')}>
            Open App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <p className="landing-hero-tag">Built on X Layer · World Cup 2026</p>
        <h1>
          Put your predictions<br />
          <span className="landing-hero-highlight">where your mouth is.</span>
        </h1>
        <p className="landing-hero-sub">
          GoalBet lets you stake OKB on World Cup match outcomes — 
          no bookies, no middlemen, just you and the blockchain.
          Win and take home OKB payouts plus a limited NFT badge.
        </p>
        <button className="landing-launch-btn" onClick={() => navigate('/app')}>
          Start Predicting →
        </button>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <p className="landing-section-tag">How it works</p>
        <h2>Three steps. That's it.</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="landing-step-num">1</span>
            <h3>Connect your wallet</h3>
            <p>Use OKX Wallet on X Layer. Takes 30 seconds if you haven't done it before.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">2</span>
            <h3>Pick a match & stake OKB</h3>
            <p>Choose any upcoming World Cup game. Pick Team A, Draw, or Team B. Stake as little as 0.001 OKB.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">3</span>
            <h3>Claim your winnings</h3>
            <p>If you called it right, claim your share of the pool plus an NFT badge that proves it.</p>
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="landing-different">
        <p className="landing-section-tag">Why GoalBet</p>
        <h2>No account. No KYC.<br />Just a wallet.</h2>
        <div className="landing-cards">
          <div className="landing-card">
            <h3>Transparent by default</h3>
            <p>Every bet, every payout, every market is on-chain. 
               You can verify anything on the OKX Explorer anytime.</p>
          </div>
          <div className="landing-card">
            <h3>Winners get badges</h3>
            <p>Correct predictions earn you ERC-1155 NFT badges. 
               Call 3 matches right and you unlock the World Cup Prophet badge.</p>
          </div>
          <div className="landing-card">
            <h3>Fair payouts</h3>
            <p>Winners split 95% of the pool proportionally to their stake. 
               5% goes to platform fees. Simple math, no surprises.</p>
          </div>
          <div className="landing-card">
            <h3>Real World Cup matches</h3>
            <p>Markets are created from live fixture data automatically. 
               New matches go live as the tournament progresses.</p>
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section className="landing-contracts">
        <p className="landing-section-tag">On-chain</p>
        <h2>Verified on X Layer</h2>
        <p className="landing-contracts-sub">
          Both contracts are open source and verified on OKX Explorer.
        </p>
        <div className="landing-contract-list">
          
            href="https://www.okx.com/explorer/xlayer/address/0x0d8C307303C17cfe4c1Bbe1A023C45B230F6D278"
            target="_blank"
            rel="noreferrer"
            className="landing-contract-item"
          >
            <span className="landing-contract-name">PredictionMarket.sol</span>
            <span className="landing-contract-addr">0x0d8C...D278 ↗</span>
          </a>
          
            href="https://www.okx.com/explorer/xlayer/address/0x9CC371D5a337cdbaE3e37B0b8EBD6E47f3101C9f"
            target="_blank"
            rel="noreferrer"
            className="landing-contract-item"
          >
            <span className="landing-contract-name">FanBadge.sol (ERC-1155)</span>
            <span className="landing-contract-addr">0x9CC3...C9f ↗</span>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2>The World Cup is happening.<br />Are you in?</h2>
        <button className="landing-launch-btn" onClick={() => navigate('/app')}>
          Start Predicting →
        </button>
        <p className="landing-cta-sub">
          No sign up. Just connect your OKX Wallet and go.
        </p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-left">
          <span>⚽ GoalBet</span>
          <span>Built on X Layer · Powered by OKB</span>
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
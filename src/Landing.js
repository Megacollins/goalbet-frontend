* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing {
  min-height: 100vh;
  background: #080808;
  color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* Nav */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position: sticky;
  top: 0;
  background: rgba(8,8,8,0.95);
  backdrop-filter: blur(12px);
  z-index: 100;
}

.landing-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
}

.landing-logo-text {
  color: #00ff88;
}

.landing-logo-tag {
  background: rgba(0,255,136,0.1);
  color: #00ff88;
  border: 1px solid rgba(0,255,136,0.3);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.landing-nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.landing-nav-links a {
  color: #555;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.landing-nav-links a:hover {
  color: #fff;
}

.landing-launch-btn-sm {
  background: #00ff88;
  color: #000;
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.landing-launch-btn-sm:hover {
  background: #00cc6a;
}

/* Hero */
.landing-hero {
  position: relative;
  padding: 80px 48px 60px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
  min-height: 600px;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(123,104,238,0.06) 0%, transparent 60%),
    #080808;
}

.landing-hero-glow {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.landing-hero-content {
  flex: 1;
  max-width: 580px;
  padding-top: 20px;
}

.landing-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,255,136,0.08);
  border: 1px solid rgba(0,255,136,0.2);
  color: #00ff88;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 28px;
}

.landing-live-dot {
  width: 7px;
  height: 7px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.landing-hero h1 {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #fff;
  letter-spacing: -0.02em;
}

.landing-hero-highlight {
  color: #00ff88;
}

.landing-hero-sub {
  font-size: 17px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 40px;
  max-width: 480px;
}

.landing-hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.landing-launch-btn {
  background: #00ff88;
  color: #000;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
  display: inline-block;
  text-decoration: none;
}

.landing-launch-btn:hover {
  background: #00cc6a;
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0,255,136,0.25);
}

.landing-ghost-btn {
  color: #555;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #222;
  padding: 14px 24px;
  border-radius: 8px;
  transition: all 0.2s;
}

.landing-ghost-btn:hover {
  border-color: #444;
  color: #fff;
}

/* Odds Cards */
.landing-odds-cards {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 340px;
  padding-top: 10px;
}

.landing-odds-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px 18px;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}

.landing-odds-card:hover {
  border-color: rgba(0,255,136,0.2);
  background: rgba(255,255,255,0.05);
}

.landing-odds-card-2 {
  opacity: 0.85;
  transform: translateX(12px);
}

.landing-odds-card-3 {
  opacity: 0.65;
  transform: translateX(24px);
}

.landing-odds-match {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
  font-weight: 600;
}

.landing-odds-row {
  display: flex;
  gap: 8px;
}

.landing-odds-item {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  transition: all 0.2s;
}

.landing-odds-item.active {
  background: rgba(0,255,136,0.08);
  border-color: rgba(0,255,136,0.25);
}

.landing-odds-item span {
  display: block;
  font-size: 10px;
  color: #555;
  margin-bottom: 4px;
}

.landing-odds-item.active span {
  color: #00ff88;
}

.landing-odds-item strong {
  font-size: 15px;
  color: #fff;
  font-weight: 700;
}

.landing-odds-item.active strong {
  color: #00ff88;
}

/* Stats Bar */
.landing-stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 24px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.01);
}

.landing-stat-item {
  text-align: center;
  padding: 0 40px;
}

.landing-stat-num {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #00ff88;
  margin-bottom: 4px;
}

.landing-stat-label {
  display: block;
  font-size: 11px;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.landing-stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.06);
}

/* Section tag */
.landing-section-tag {
  font-size: 11px;
  color: #00ff88;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 700;
}

/* How it works */
.landing-how {
  padding: 80px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.landing-how h2 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 56px;
  color: #fff;
  letter-spacing: -0.01em;
}

.landing-steps {
  display: flex;
  align-items: center;
  gap: 0;
  max-width: 900px;
}

.landing-step {
  flex: 1;
  padding-right: 32px;
}

.landing-step-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.landing-step-num {
  display: block;
  font-size: 11px;
  color: #00ff88;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.landing-step h3 {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}

.landing-step p {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

.landing-step-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, rgba(0,255,136,0.3), rgba(0,255,136,0.1));
  flex-shrink: 0;
  margin: 0 16px;
  margin-bottom: 60px;
}

/* Features */
.landing-features {
  padding: 80px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.landing-features h2 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 48px;
  line-height: 1.2;
  color: #fff;
  letter-spacing: -0.01em;
}

.landing-features-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
  max-width: 1000px;
}

.landing-feature-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 28px;
  transition: all 0.2s;
}

.landing-feature-card:hover {
  border-color: rgba(0,255,136,0.15);
  background: rgba(255,255,255,0.04);
}

.landing-feature-large {
  grid-row: span 2;
}

.landing-feature-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 16px;
}

.landing-feature-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #fff;
}

.landing-feature-card p {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

/* Contracts */
.landing-contracts {
  padding: 80px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.landing-contracts h2 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #fff;
}

.landing-contracts-sub {
  font-size: 15px;
  color: #555;
  margin-bottom: 32px;
}

.landing-contract-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
}

.landing-contract-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 18px 22px;
  text-decoration: none;
  transition: all 0.2s;
}

.landing-contract-item:hover {
  border-color: rgba(0,255,136,0.2);
  background: rgba(0,255,136,0.03);
}

.landing-contract-name {
  display: block;
  font-size: 14px;
  color: #ccc;
  font-weight: 600;
  margin-bottom: 4px;
}

.landing-contract-desc {
  display: block;
  font-size: 12px;
  color: #444;
}

.landing-contract-addr {
  font-size: 13px;
  color: #00ff88;
  font-family: monospace;
  flex-shrink: 0;
}

/* CTA */
.landing-cta {
  padding: 100px 48px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 100%, rgba(0,255,136,0.05) 0%, transparent 60%);
}

.landing-cta-glow {
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(0,255,136,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.landing-cta h2 {
  font-size: 44px;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #fff;
  letter-spacing: -0.02em;
}

.landing-cta p {
  font-size: 16px;
  color: #555;
  margin-bottom: 36px;
}

/* Footer */
.landing-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 48px;
  color: #333;
  font-size: 13px;
}

.landing-footer-logo {
  display: block;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
  font-size: 15px;
}

.landing-footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.landing-footer-right {
  display: flex;
  gap: 24px;
}

.landing-footer-right a {
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.landing-footer-right a:hover {
  color: #00ff88;
}

.match-total-pool {
  font-size: 12px;
  color: #555;
  text-align: center;
  margin-bottom: 8px;
}
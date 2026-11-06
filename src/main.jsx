import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Activity, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ArrowUpRight, ArrowDownRight, ShieldAlert, X, Copy, Check, PlusCircle, 
  Ticket, BarChart3, LineChart, MessageCircle, ArrowDownToLine, 
  Terminal, CheckCircle2, Clock, History, Flame, AlertCircle, Sparkles 
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaTrader (RM5)")}`;
const RATE_RM_TO_SCOREBOARD = 1000;

// Helper simpan terus ke LocalStorage (Kekal & Serta-merta)
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } 
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const genPin = () => `BK5-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

// Penjana lilin mengikut Timeframe (1M, 5M, 15M, 1H)
const genCandles = (tf, currentPrice) => {
  const cfg = {
    "1M": { count: 24, vol: 0.025, step: 1 },
    "5M": { count: 18, vol: 0.055, step: 5 },
    "15M": { count: 14, vol: 0.11, step: 15 },
    "1H": { count: 10, vol: 0.22, step: 60 }
  }[tf] || { count: 20, vol: 0.03, step: 1 };

  let base = currentPrice - (cfg.count * cfg.vol * 0.4);
  const list = [];
  const now = new Date();

  for (let i = 0; i < cfg.count; i++) {
    const delta = (Math.random() * cfg.vol * 2 - cfg.vol);
    const open = Math.max(0.1, +(base).toFixed(4));
    const close = Math.max(0.1, +(open + delta).toFixed(4));
    const high = +(Math.max(open, close) + Math.random() * (cfg.vol * 0.4)).toFixed(4);
    const low = +(Math.min(open, close) - Math.random() * (cfg.vol * 0.4)).toFixed(4);
    const t = new Date(now.getTime() - (cfg.count - i) * cfg.step * 60000);
    const time = tf === "1H" ? `${t.getHours().toString().padStart(2, '0')}:00` : `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
    list.push({ id: `${tf}-${i}`, open, close, high, low, time });
    base = close;
  }
  list[list.length - 1].close = currentPrice;
  return list;
};

function App() {
  // Pangkalan Data Pengguna Kekal
  const [usersDb, setUsersDb] = useState(() => load("baka_users_db", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("baka_active_user", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Pasaran & Graf Kekal
  const [chartMode, setChartMode] = useState("candle");
  const [timeframe, setTimeframe] = useState(() => load("baka_timeframe", "1M"));
  const [price, setPrice] = useState(() => load("baka_price", 2.50));
  const [prevPrice, setPrevPrice] = useState(() => load("baka_prev_price", 2.50));
  const [marketBias, setMarketBias] = useState(() => load("baka_bias", "neutral"));
  const [candles, setCandles] = useState(() => load("baka_candles", genCandles("1M", 2.50)));
  const [priceHistory, setPriceHistory] = useState(() => load("baka_history", [2.45, 2.47, 2.48, 2.49, 2.50]));

  // Sejarah Pips & Transaksi
  const [leverage, setLeverage] = useState(1);
  const [tradeAmount, setTradeAmount] = useState("");
  const [orderType, setOrderType] = useState("buy");
  const [pipsHistory, setPipsHistory] = useState(() => load("baka_pips", [
    { id: 1, pips: "+12.0", type: "TICK", oldPrice: 2.4880, newPrice: 2.5000, isPositive: true, time: "Terkini" }
  ]));

  // Database PIN & Withdraw
  const [pinDb, setPinDb] = useState(() => load("baka_pins", [{ code: "BK5-7788-9900", value: 5, status: "AVAILABLE" }]));
  const [withdrawReqs, setWithdrawReqs] = useState(() => load("baka_withdraws", []));

  // Modal States
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });
  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ ign: "", rm: "5" });
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Simpan automatik setiap kali harga/graf berubah
  useEffect(() => {
    save("baka_price", price);
    save("baka_prev_price", prevPrice);
    save("baka_bias", marketBias);
    save("baka_candles", candles);
    save("baka_history", priceHistory);
    save("baka_pips", pipsHistory);
    save("baka_timeframe", timeframe);
  }, [price, prevPrice, marketBias, candles, priceHistory, pipsHistory, timeframe]);

  // Tukar Timeframe Secara Drastik
  const switchTimeframe = (tf) => {
    setTimeframe(tf);
    const updated = genCandles(tf, price);
    setCandles(updated);
    setPriceHistory(updated.map((c) => c.close));
    save("baka_timeframe", tf);
    save("baka_candles", updated);
    showToast(`Timeframe: ${tf}`);
  };

  // Gelung Pasaran Masa Nyata
  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      setPrice((curr) => {
        setPrevPrice(curr);
        let change = (Math.random() * 0.04 - 0.02);
        if (marketBias === "bull") change += 0.02;
        if (marketBias === "bear") change -= 0.02;

        const next = Math.max(0.01, +(curr * (1 + change)).toFixed(4));
        setPriceHistory((h) => [...h.slice(-30), next]);

        const deltaPips = +((next - curr) * 10000).toFixed(1);
        if (deltaPips !== 0) {
          setPipsHistory((prev) => [
            { id: Date.now(), pips: deltaPips > 0 ? `+${deltaPips}` : `${deltaPips}`, type: "TICK", oldPrice: curr, newPrice: next, isPositive: deltaPips > 0, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 14)
          ]);
        }

        setCandles((prev) => {
          tickCount++;
          const last = prev[prev.length - 1];
          const threshold = timeframe === "1M" ? 4 : timeframe === "5M" ? 8 : timeframe === "15M" ? 12 : 16;
          if (tickCount >= threshold) {
            tickCount = 0;
            const now = new Date();
            const timeLabel = timeframe === "1H" ? `${now.getHours().toString().padStart(2, '0')}:00` : `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            return [...prev.slice(1), { id: Date.now(), open: next, close: next, high: next, low: next, time: timeLabel }];
          }
          return [...prev.slice(0, -1), { ...last, close: next, high: Math.max(last.high, next), low: Math.min(last.low, next) }];
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [marketBias, timeframe]);

  // Auth: Daftar & Login
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila isi semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
      }
      const newUser = { username: u, password: p, fiatBalance: 0, bakaBalance: 0, trades: [] };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("baka_users_db", updated);
      setCurrentUsername(u);
      save("baka_active_user", u);
      setShowAuth(false);
      showToast(`🎉 Selamat datang, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      save("baka_active_user", found.username);
      setShowAuth(false);
      showToast(`Log masuk berjaya!`);
    }
    setAuthForm({ user: "", pass: "", err: "" });
  };

  const handleLogout = () => {
    setCurrentUsername("");
    save("baka_active_user", "");
    showToast("Anda telah log keluar.");
  };

  const updateUserBalance = (fields) => {
    if (!currentUser) return;
    const updated = usersDb.map((u) => u.username === currentUser.username ? { ...u, ...fields } : u);
    setUsersDb(updated);
    save("baka_users_db", updated);
  };

  const requireUser = (fn) => {
    if (!currentUser) { setAuthForm({ user: "", pass: "", err: "Sila log masuk atau daftar akaun dahulu!" }); setShowAuth(true); return; }
    fn();
  };

  // Trade Beli & Jual
  const handleTrade = (e) => {
    e.preventDefault();
    requireUser(() => {
      const qty = parseFloat(tradeAmount);
      if (!qty || qty <= 0) return;
      if (orderType === "buy") {
        const cost = +((qty * price) / leverage).toFixed(2);
        if (currentUser.fiatBalance < cost) return showToast("Baki RM tidak cukup! Sila beli PIN di WhatsApp.");
        const newTrade = { id: Date.now(), type: `BUY (${leverage}x)`, qty: qty * leverage, price, total: cost, time: new Date().toLocaleTimeString() };
        updateUserBalance({ fiatBalance: +(currentUser.fiatBalance - cost).toFixed(2), bakaBalance: +(currentUser.bakaBalance + qty * leverage).toFixed(4), trades: [newTrade, ...currentUser.trades.slice(0, 15)] });
        showToast(`Berjaya Beli ${qty * leverage} $BAKA!`);
      } else {
        if (currentUser.bakaBalance < qty) return showToast("Baki $BAKA tidak mencukupi!");
        const gain = +(qty * price).toFixed(2);
        const newTrade = { id: Date.now(), type: `SELL (${leverage}x)`, qty, price, total: gain, time: new Date().toLocaleTimeString() };
        updateUserBalance({ fiatBalance: +(currentUser.fiatBalance + gain).toFixed(2), bakaBalance: +(currentUser.bakaBalance - qty).toFixed(4), trades: [newTrade, ...currentUser.trades.slice(0, 15)] });
        showToast(`Berjaya Jual ${qty} $BAKA (+RM ${gain})!`);
      }
      setTradeAmount("");
    });
  };

  // Tebus PIN
  const handleRedeem = (e) => {
    e.preventDefault();
    requireUser(() => {
      const code = inputPin.trim().toUpperCase();
      const target = pinDb.find((p) => p.code.toUpperCase() === code);
      if (!target) return showToast("❌ Kod PIN tidak wujud!");
      if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

      updateUserBalance({ fiatBalance: +(currentUser.fiatBalance + target.value).toFixed(2) });
      const updatedPins = pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p);
      setPinDb(updatedPins);
      save("baka_pins", updatedPins);
      setInputPin("");
      setShowRedeem(false);
      showToast(`🎉 +RM ${target.value}.00 dimasukkan ke akaun anda!`);
    });
  };

  // Withdraw ke Minecraft Scoreboard
  const handleWithdraw = (e) => {
    e.preventDefault();
    requireUser(() => {
      const amt = parseFloat(withdrawForm.rm);
      const ign = withdrawForm.ign.trim();
      if (!ign || !amt || amt <= 0) return showToast("Sila lengkapkan maklumat!");
      if (currentUser.fiatBalance < amt) return showToast("Baki modal RM tidak mencukupi!");

      const earned = Math.floor(amt * RATE_RM_TO_SCOREBOARD);
      updateUserBalance({ fiatBalance: +(currentUser.fiatBalance - amt).toFixed(2) });
      const newReq = { id: Date.now(), username: currentUser.username, gamerTag: ign, amountRM: amt, scoreboardMoney: earned, command: `/scoreboard players add ${ign} money ${earned}`, status: "PENDING" };
      const updatedReqs = [newReq, ...withdrawReqs];
      setWithdrawReqs(updatedReqs);
      save("baka_withdraws", updatedReqs);
      setShowWithdraw(false);
      setWithdrawForm({ ign: "", rm: "5" });
      showToast(`✅ Permintaan Withdraw RM ${amt} ($${earned.toLocaleString()} Money) dihantar!`);
    });
  };

  // Admin PUMP & DUMP
  const triggerPump = (pct) => {
    const next = +(price * (1 + pct / 100)).toFixed(4);
    setPrevPrice(price);
    setPrice(next);
    save("baka_price", next);
    showToast(`🚀 PUMP +${pct}%!`);
  };

  const triggerDump = (pct) => {
    const next = Math.max(0.01, +(price * (1 - pct / 100)).toFixed(4));
    setPrevPrice(price);
    setPrice(next);
    save("baka_price", next);
    showToast(`📉 DUMP -${pct}%!`);
  };

  // Skala Graf
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const minC = Math.min(...lows) * 0.99;
  const maxC = Math.max(...highs) * 1.01;
  const range = maxC - minC || 1;
  const getY = (val) => 220 - ((val - minC) / range) * 180;
  const isUp = price >= prevPrice;
  const currentPriceY = getY(price);
  const latestCandle = candles[candles.length - 1] || { open: price, high: price, low: price, close: price };
  const currentTickPips = +((price - prevPrice) * 10000).toFixed(1);
  const candleW = timeframe === "1M" ? 11 : timeframe === "5M" ? 15 : timeframe === "15M" ? 20 : 28;

  return (
    <div className="container">
      {toast && <div className="toast">{toast}</div>}

      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"><Activity size={24} /></div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>BakaTrader Pro</h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>
              {currentUser ? `Akaun: ${currentUser.username}` : "Mod Tetamu (Guest)"}
            </p>
          </div>
        </div>

        <div className="nav-right">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono"><User size={15} /> {currentUser.username}</button>
              <button className="btn-pill btn-withdraw mono" onClick={() => setShowWithdraw(true)}><ArrowDownToLine size={15} /> Withdraw Server</button>
              <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeem(true)}><KeyRound size={15} /> Tebus PIN</button>
              <button className="btn-pill btn-logout mono" onClick={handleLogout}><LogOut size={15} /> Keluar</button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}><LogIn size={15} /> Log Masuk</button>
              <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}><UserPlus size={15} /> Daftar Akaun</button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>{isAdmin ? <Unlock size={15} /> : <Lock size={15} />} Admin (200200)</button>
        </div>
      </header>

      {/* Banner Peringatan Tetamu */}
      {!currentUser && (
        <div className="guest-banner">
          <div className="guest-banner-left">
            <AlertCircle size={24} color="var(--cyan)" />
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800 }}>Anda Sedang Dalam Mod Tetamu</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sila <strong>Log Masuk</strong> atau <strong>Daftar Akaun</strong> untuk menyimpan baki RM, berdagang $BAKA, dan withdraw ke Scoreboard Minecraft!</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}><Sparkles size={14} /> Daftar Sekarang</button>
            <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>Log Masuk</button>
          </div>
        </div>
      )}

      {/* Stats Pengguna */}
      <section className="stats-grid">
        <div className="card">
          <span className="stat-label mono">Baki Modal Tunai (MYR)</span>
          <div className="stat-val mono" style={{ color: "#fff" }}>
            {currentUser ? `RM ${currentUser.fiatBalance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}` : <span className="stat-locked-badge" onClick={() => setShowAuth(true)}><Lock size={16} /> Sila Log Masuk</span>}
          </div>
          <div className="stat-actions-row">
            <button className="btn-pill btn-withdraw mono" style={{ fontSize: "0.78rem" }} onClick={() => requireUser(() => setShowWithdraw(true))}><ArrowDownToLine size={14} /> Withdraw Server</button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mono"><MessageCircle size={15} /> Beli PIN</a>
          </div>
        </div>

        <div className="card">
          <span className="stat-label mono">Pegangan $BAKA</span>
          <div className="stat-val mono" style={{ color: "var(--green)" }}>
            {currentUser ? `${currentUser.bakaBalance.toFixed(4)} BAKA` : <span className="stat-locked-badge" onClick={() => setShowAuth(true)}><Lock size={16} /> Sila Log Masuk</span>}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>Boleh dijual untuk dapatkan duit Scoreboard</span>
        </div>

        <div className="card">
          <span className="stat-label mono">Kadar Pengeluaran Server</span>
          <div className="stat-val mono" style={{ color: "var(--cyan)", fontSize: "1.2rem" }}>RM 1.00 = $1,000</div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>Scoreboard Money Bedrock (money)</span>
        </div>
      </section>

      {/* Trading Grid */}
      <div className="trading-grid">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>HARGA PASARAN SEMASA</span>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 800, color: isUp ? "var(--green)" : "var(--red)" }}>RM {price.toFixed(4)}</div>
            </div>

            <div className="chart-controls-toolbar">
              <div className="pips-badge mono" style={{ color: currentTickPips >= 0 ? "var(--green)" : "var(--red)" }}>
                {currentTickPips >= 0 ? `+${currentTickPips}` : `${currentTickPips}`} Pips
              </div>
              <div className="btn-group">
                {["1M", "5M", "15M", "1H"].map((tf) => (
                  <button key={tf} className={`btn-mode mono ${timeframe === tf ? "active" : ""}`} onClick={() => switchTimeframe(tf)}>{tf}</button>
                ))}
              </div>
              <div className="btn-group">
                <button className={`btn-mode mono ${chartMode === "candle" ? "active" : ""}`} onClick={() => setChartMode("candle")}><BarChart3 size={14} /> Lilin</button>
                <button className={`btn-mode mono ${chartMode === "line" ? "active" : ""}`} onClick={() => setChartMode("line")}><LineChart size={14} /> Line</button>
              </div>
            </div>
          </div>

          <div className="ohlc-bar mono">
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <span>O: <strong style={{ color: "#fff" }}>{latestCandle.open.toFixed(3)}</strong></span>
              <span>H: <strong style={{ color: "var(--green)" }}>{latestCandle.high.toFixed(3)}</strong></span>
              <span>L: <strong style={{ color: "var(--red)" }}>{latestCandle.low.toFixed(3)}</strong></span>
              <span>C: <strong style={{ color: "#fff" }}>{latestCandle.close.toFixed(3)}</strong></span>
            </div>
            <span>Timeframe: <strong style={{ color: "var(--cyan)" }}>{timeframe}</strong></span>
          </div>

          {/* SVG Chart */}
          <div className="chart-box">
            <svg viewBox="0 0 500 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              {[50, 130, 210, 290, 370].map((x, i) => (
                <line key={i} x1={x} y1={10} x2={x} y2={230} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              ))}
              {[0.2, 0.5, 0.8].map((pct, i) => {
                const y = getY(minC + range * pct);
                return (
                  <g key={i}>
                    <line x1={0} y1={y} x2={440} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <text x={444} y={y + 3} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">{(minC + range * pct).toFixed(3)}</text>
                  </g>
                );
              })}
              <line x1={0} y1={currentPriceY} x2={440} y2={currentPriceY} stroke={isUp ? "var(--green)" : "var(--red)"} strokeDasharray="3 3" strokeWidth="1.2" />
              <rect x={441} y={Math.max(5, Math.min(218, currentPriceY - 8))} width={56} height={16} fill={isUp ? "var(--green)" : "var(--red)"} rx="3" />
              <text x={445} y={Math.max(16, Math.min(229, currentPriceY + 4))} fill="#000" fontSize="9" fontWeight="800" fontFamily="JetBrains Mono">{price.toFixed(3)}</text>

              {chartMode === "candle" ? (
                candles.map((c, i) => {
                  const x = 15 + i * (410 / candles.length);
                  const isBull = c.close >= c.open;
                  const col = isBull ? "var(--green)" : "var(--red)";
                  const yH = getY(c.high);
                  const yL = getY(c.low);
                  const yO = getY(c.open);
                  const yC = getY(c.close);
                  return (
                    <g key={c.id}>
                      <line x1={x + candleW / 2} y1={yH} x2={x + candleW / 2} y2={yL} stroke={col} strokeWidth="1.5" />
                      <rect x={x} y={Math.min(yO, yC)} width={candleW} height={Math.max(3, Math.abs(yC - yO))} fill={col} rx="2" />
                    </g>
                  );
                })
              ) : (
                <polyline fill="none" stroke={isUp ? "var(--green)" : "var(--red)"} strokeWidth="2.5" points={priceHistory.map((val, idx) => `${(idx / (priceHistory.length - 1)) * 430 + 10},${220 - ((val - minC) / range) * 180}`).join(" ")} />
              )}
            </svg>
          </div>
        </div>

        {/* Order Desk */}
        <div className="card order-desk-wrapper">
          {!currentUser && (
            <div className="desk-lock-overlay">
              <Lock size={32} color="var(--gold)" style={{ marginBottom: "0.5rem" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>Akses Dagangan Dikunci</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Sila log masuk atau daftar akaun percuma.</p>
              <button className="btn-pill btn-redeem mono" style={{ marginTop: "1rem" }} onClick={() => { setAuthTab("register"); setShowAuth(true); }}><UserPlus size={14} /> Daftar / Log Masuk</button>
            </div>
          )}

          <div className="tab-row">
            <button className={`tab-btn buy ${orderType === "buy" ? "active" : ""}`} onClick={() => setOrderType("buy")}>BELI $BAKA</button>
            <button className={`tab-btn sell ${orderType === "sell" ? "active" : ""}`} onClick={() => setOrderType("sell")}>JUAL $BAKA</button>
          </div>

          <div>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}><Flame size={13} color="var(--gold)" /> GANDAAN LEVERAGE</span>
            <div className="leverage-selector mono">
              {[1, 2, 5, 10].map((lev) => (
                <button key={lev} type="button" className={`btn-lev ${leverage === lev ? "active" : ""}`} onClick={() => setLeverage(lev)}>{lev}x</button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTrade}>
            <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>KUANTITI $BAKA</label>
            <input type="number" step="any" className="input-styled mono" placeholder="0.00" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} required />
            <div style={{ background: "#060913", padding: "0.75rem", borderRadius: "8px", marginTop: "0.8rem", border: "1px solid var(--border-ui)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <span>Nilai Posisi:</span>
                <span className="mono" style={{ color: "#fff", fontWeight: 700 }}>RM {((parseFloat(tradeAmount) || 0) * price * leverage).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                <span>Margin Diperlukan:</span>
                <span className="mono" style={{ color: "var(--gold)", fontWeight: 700 }}>RM {((parseFloat(tradeAmount) || 0) * price).toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" className={`btn-action-order mono ${orderType}`}>
              {currentUser ? `Sahkan ${orderType === "buy" ? "Beli" : "Jual"} (${leverage}x)` : "Sila Log Masuk"}
            </button>
          </form>
        </div>
      </div>

      {/* Rekod Sejarah */}
      <section className="history-section">
        <div className="card">
          <h4 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
            <History size={16} color="var(--cyan)" /> Rekod Sejarah Pips
          </h4>
          <div className="table-box">
            <table>
              <thead>
                <tr><th>Masa</th><th>Perubahan</th><th>Harga Lama ➔ Baru</th></tr>
              </thead>
              <tbody className="mono">
                {pipsHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.time}</td>
                    <td style={{ color: item.isPositive ? "var(--green)" : "var(--red)", fontWeight: 800 }}>{item.pips} Pips</td>
                    <td>{item.oldPrice.toFixed(4)} ➔ {item.newPrice.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
            <Clock size={16} color="var(--gold)" /> Transaksi Anda
          </h4>
          <div className="table-box">
            <table>
              <thead>
                <tr><th>Masa</th><th>Jenis</th><th>Kuantiti</th><th>Jumlah</th></tr>
              </thead>
              <tbody className="mono">
                {currentUser && currentUser.trades && currentUser.trades.length > 0 ? (
                  currentUser.trades.map((t) => (
                    <tr key={t.id}>
                      <td>{t.time}</td>
                      <td style={{ color: t.type.includes("BUY") ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{t.type}</td>
                      <td>{t.qty.toFixed(2)}</td>
                      <td>RM {t.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>{currentUser ? "Belum ada rekod transaksi." : "Sila log masuk untuk melihat rekod."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Withdraw Scoreboard */}
      {showWithdraw && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)" }}><ArrowDownToLine size={20} /> Withdraw ke Minecraft Scoreboard</h3>
              <button onClick={() => setShowWithdraw(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MINECRAFT GAMERTAG / IGN</label>
                <input type="text" className="input-styled mono" placeholder="Cth: SteveMY" value={withdrawForm.ign} onChange={(e) => setWithdrawForm({ ...withdrawForm, ign: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>JUMLAH RM NAK WITHDRAW</label>
                <input type="number" step="1" min="1" max={currentUser ? currentUser.fiatBalance : 0} className="input-styled mono" value={withdrawForm.rm} onChange={(e) => setWithdrawForm({ ...withdrawForm, rm: e.target.value })} required />
              </div>
              <div style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Duit Scoreboard:</span>
                  <span className="mono" style={{ color: "var(--green)", fontWeight: 800 }}>${((parseFloat(withdrawForm.rm) || 0) * RATE_RM_TO_SCOREBOARD).toLocaleString()} Money</span>
                </div>
              </div>
              <button type="submit" className="btn-action-order mono" style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#fff" }}>Hantar Permintaan Withdraw</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Auth */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="auth-tabs mono">
              <button className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>
            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "1rem" }}>{authForm.err}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Cth: AbuTrader" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>
              <button type="submit" className="btn-action-order mono buy">{authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun Percuma"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tebus PIN */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}><Ticket size={20} /> Tebus PIN Top-up RM 5.00</h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.7rem", marginBottom: "1.2rem" }}>
              <MessageCircle size={16} /> Beli PIN di WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeem}>
              <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN (BK5-XXXX-XXXX)</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-action-order mono buy" style={{ marginTop: "1rem" }}>Tebus Sekarang (+RM 5.00)</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin (PIN 200200) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gold)" }}><ShieldAlert size={20} /> Admin Dashboard (200200)</h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN Salah!"); }}>
                <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "6px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                <button type="submit" className="btn-action-order mono" style={{ background: "var(--gold)", color: "#000", marginTop: "1rem" }}>Buka Kunci Admin</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Permintaan Withdraw */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}><Terminal size={16} /> Permintaan Withdraw ({withdrawReqs.length})</h4>
                  <div className="pin-list">
                    {withdrawReqs.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>Tiada permintaan withdraw.</p> : withdrawReqs.map((req) => (
                      <div key={req.id} style={{ background: "#0b1120", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#fff" }}>IGN: {req.gamerTag} ({req.username}) - RM {req.amountRM}</strong>
                          <span className={`badge-status ${req.status === "PENDING" ? "badge-pending" : "badge-avail"}`}>{req.status}</span>
                        </div>
                        <div className="command-snippet mono">
                          <span>{req.command}</span>
                          <button onClick={() => { navigator.clipboard.writeText(req.command); showToast("Command disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
                        </div>
                        {req.status === "PENDING" && (
                          <button onClick={() => { const up = withdrawReqs.map((r) => r.id === req.id ? { ...r, status: "SELESAI" } : r); setWithdrawReqs(up); save("baka_withdraws", up); showToast("Selesai!"); }} className="btn-pill btn-redeem mono" style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center" }}><CheckCircle2 size={14} /> Tandakan Telah Masuk di Server</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penjana PIN */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--green)" }}>Jana PIN RM5</h4>
                    <button onClick={() => { const code = genPin(); const up = [{ code, value: 5, status: "AVAILABLE" }, ...pinDb]; setPinDb(up); save("baka_pins", up); showToast(`PIN: ${code}`); }} className="btn-pill btn-redeem mono" style={{ fontSize: "0.75rem" }}><PlusCircle size={14} /> + Jana 1x PIN</button>
                  </div>
                  <div className="pin-list">
                    {pinDb.map((pin, i) => (
                      <div key={i} className="pin-row mono">
                        <span><strong>{pin.code}</strong> (RM {pin.value})</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`badge-status ${pin.status === "AVAILABLE" ? "badge-avail" : "badge-used"}`}>{pin.status === "AVAILABLE" ? "BELUM DIPAKAI" : `DITEBUS (${pin.usedBy})`}</span>
                          {pin.status === "AVAILABLE" && <button onClick={() => { navigator.clipboard.writeText(pin.code); showToast("PIN disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PUMP & DUMP */}
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--green)" }}>KAWALAN PUMP</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <button onClick={() => triggerPump(15)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+15% PUMP</button>
                    <button onClick={() => triggerPump(35)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+35% PUMP</button>
                    <button onClick={() => triggerPump(70)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+70% MEGA</button>
                  </div>
                </div>

                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--red)" }}>KAWALAN DUMP</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <button onClick={() => triggerDump(15)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-15% DUMP</button>
                    <button onClick={() => triggerDump(35)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-35% CRASH</button>
                    <button onClick={() => triggerDump(70)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-70% NUKE</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

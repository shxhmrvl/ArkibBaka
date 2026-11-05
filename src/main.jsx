import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Activity, Lock, Unlock, KeyRound, User, 
  ArrowUpRight, ArrowDownRight, ShieldAlert, X, 
  Copy, Check, PlusCircle, Ticket, BarChart3, LineChart
} from "lucide-react";

const ADMIN_PIN = "200200";

const generateRandomPinCode = () => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `BK5-${part1}-${part2}`;
};

// Menjana data lilin (Candlestick) permulaan
const generateInitialCandles = () => {
  let base = 2.40;
  const list = [];
  for (let i = 0; i < 18; i++) {
    const delta = (Math.random() * 0.08 - 0.04);
    const open = base;
    const close = Math.max(0.01, +(open + delta).toFixed(4));
    const high = +(Math.max(open, close) + Math.random() * 0.03).toFixed(4);
    const low = +(Math.min(open, close) - Math.random() * 0.03).toFixed(4);
    list.push({ id: i, open, close, high, low });
    base = close;
  }
  return list;
};

function App() {
  // Pengguna Semasa
  const [username, setUsername] = useState(() => localStorage.getItem("bakact_user") || "Trader_1");
  const [fiatBalance, setFiatBalance] = useState(() => parseFloat(localStorage.getItem(`baka_fiat_${username}`)) || 0.0);
  const [bakaBalance, setBakaBalance] = useState(() => parseFloat(localStorage.getItem(`baka_coin_${username}`)) || 10.0);

  // Pasaran & Graf
  const [chartMode, setChartMode] = useState("candle"); // 'candle' atau 'line'
  const [price, setPrice] = useState(2.50);
  const [prevPrice, setPrevPrice] = useState(2.50);
  const [candles, setCandles] = useState(generateInitialCandles);
  const [priceHistory, setPriceHistory] = useState([2.30, 2.38, 2.45, 2.42, 2.50]);
  const [marketBias, setMarketBias] = useState("neutral");

  // Transaksi
  const [tradeAmount, setTradeAmount] = useState("");
  const [orderType, setOrderType] = useState("buy");
  const [orderHistory, setOrderHistory] = useState(() => {
    const s = localStorage.getItem(`baka_trades_${username}`);
    return s ? JSON.parse(s) : [];
  });

  // Sistem Baucar PIN
  const [pinDatabase, setPinDatabase] = useState(() => {
    const savedPins = localStorage.getItem("baka_pin_database");
    return savedPins ? JSON.parse(savedPins) : [
      { code: "BK5-7788-9900", value: 5, status: "AVAILABLE", createdAt: "Asal" }
    ];
  });

  // Modals & UI
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [inputPinCode, setInputPinCode] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [tempUser, setTempUser] = useState("");

  // Admin Auth
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Simpan data ke localStorage
  useEffect(() => {
    localStorage.setItem("bakact_user", username);
    localStorage.setItem(`baka_fiat_${username}`, fiatBalance.toString());
    localStorage.setItem(`baka_coin_${username}`, bakaBalance.toString());
    localStorage.setItem(`baka_trades_${username}`, JSON.stringify(orderHistory));
    localStorage.setItem("baka_pin_database", JSON.stringify(pinDatabase));
  }, [username, fiatBalance, bakaBalance, orderHistory, pinDatabase]);

  // Gelung Masa Nyata Pasaran & Pembentukan Lilin (Candlestick Engine)
  useEffect(() => {
    let tickCounter = 0;

    const interval = setInterval(() => {
      setPrice((current) => {
        setPrevPrice(current);
        let change = (Math.random() * 0.04 - 0.02);
        if (marketBias === "bull") change += 0.02;
        if (marketBias === "bear") change -= 0.02;

        const next = Math.max(0.01, +(current * (1 + change)).toFixed(4));
        setPriceHistory((h) => [...h.slice(-25), next]);

        // Kemas kini data Candlestick
        setCandles((prevCandles) => {
          tickCounter++;
          const lastCandle = prevCandles[prevCandles.length - 1];

          // Setiap 4 tick, buka lilin baru. Jika belum, kemas kini lilin semasa
          if (tickCounter >= 4) {
            tickCounter = 0;
            const newCandle = {
              id: Date.now(),
              open: next,
              close: next,
              high: next,
              low: next
            };
            return [...prevCandles.slice(-17), newCandle];
          } else {
            const updated = {
              ...lastCandle,
              close: next,
              high: Math.max(lastCandle.high, next),
              low: Math.min(lastCandle.low, next)
            };
            return [...prevCandles.slice(0, -1), updated];
          }
        });

        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [marketBias]);

  // Transaksi Beli / Jual
  const handleExecuteTrade = (e) => {
    e.preventDefault();
    const qty = parseFloat(tradeAmount);
    if (!qty || qty <= 0) return;

    if (orderType === "buy") {
      const cost = +(qty * price).toFixed(2);
      if (fiatBalance < cost) {
        showToast("Baki RM tidak cukup! Sila tebus PIN daripada Admin.");
        return;
      }
      setFiatBalance((b) => +(b - cost).toFixed(2));
      setBakaBalance((b) => +(b + qty).toFixed(4));
      
      const newOrder = { id: Date.now(), type: "BUY", qty, price, total: cost, time: new Date().toLocaleTimeString() };
      setOrderHistory((prev) => [newOrder, ...prev.slice(0, 15)]);
      showToast(`Berjaya Beli ${qty} $BAKA (RM ${cost})`);
    } else {
      if (bakaBalance < qty) {
        showToast("Baki $BAKA tidak mencukupi!");
        return;
      }
      const gains = +(qty * price).toFixed(2);
      setBakaBalance((b) => +(b - qty).toFixed(4));
      setFiatBalance((b) => +(b + gains).toFixed(2));

      const newOrder = { id: Date.now(), type: "SELL", qty, price, total: gains, time: new Date().toLocaleTimeString() };
      setOrderHistory((prev) => [newOrder, ...prev.slice(0, 15)]);
      showToast(`Berjaya Jual ${qty} $BAKA (+RM ${gains})`);
    }
    setTradeAmount("");
  };

  // Tebus PIN
  const handleRedeemPin = (e) => {
    e.preventDefault();
    const cleanCode = inputPinCode.trim().toUpperCase();
    const targetPin = pinDatabase.find((p) => p.code.toUpperCase() === cleanCode);

    if (!targetPin) {
      showToast("❌ Kod PIN tidak wujud!");
      return;
    }

    if (targetPin.status === "USED") {
      showToast(`❌ PIN ini telah ditebus oleh ${targetPin.usedBy || "pengguna lain"}!`);
      return;
    }

    setFiatBalance((b) => +(b + targetPin.value).toFixed(2));
    setPinDatabase((prev) =>
      prev.map((p) =>
        p.code.toUpperCase() === cleanCode
          ? { ...p, status: "USED", usedBy: username, usedAt: new Date().toLocaleTimeString() }
          : p
      )
    );

    setInputPinCode("");
    setShowRedeemModal(false);
    showToast(`🎉 Tahniah! +RM ${targetPin.value}.00 berjaya dimasukkan!`);
  };

  // Admin: Jana PIN RM5
  const handleAdminGeneratePin = () => {
    const newCode = generateRandomPinCode();
    const newEntry = {
      code: newCode,
      value: 5,
      status: "AVAILABLE",
      createdAt: new Date().toLocaleTimeString()
    };
    setPinDatabase([newEntry, ...pinDatabase]);
    showToast(`PIN Baru Dijana: ${newCode} (RM5)`);
  };

  const copyPinToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`PIN ${code} disalin!`);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (adminPinInput === ADMIN_PIN) {
      setIsAdminAuth(true);
      setAdminPinInput("");
      showToast("Akses Admin Disahkan!");
    } else {
      showToast("PIN Salah! Akses ditolak.");
      setAdminPinInput("");
    }
  };

  // PUMP / DUMP
  const triggerPump = (pct) => {
    setPrice((curr) => {
      const next = +(curr * (1 + pct / 100)).toFixed(4);
      setPriceHistory((h) => [...h.slice(-25), next]);
      setCandles((cList) => {
        const last = cList[cList.length - 1];
        const updated = { ...last, close: next, high: Math.max(last.high, next) };
        return [...cList.slice(0, -1), updated];
      });
      return next;
    });
    showToast(`🚀 PUMP +${pct}%!`);
  };

  const triggerDump = (pct) => {
    setPrice((curr) => {
      const next = Math.max(0.01, +(curr * (1 - pct / 100)).toFixed(4));
      setPriceHistory((h) => [...h.slice(-25), next]);
      setCandles((cList) => {
        const last = cList[cList.length - 1];
        const updated = { ...last, close: next, low: Math.min(last.low, next) };
        return [...cList.slice(0, -1), updated];
      });
      return next;
    });
    showToast(`📉 DUMP -${pct}%!`);
  };

  // Skala untuk Candlestick & Line SVG
  const allCandleHighs = candles.map((c) => c.high);
  const allCandleLows = candles.map((c) => c.low);
  const minCandle = Math.min(...allCandleLows) * 0.99;
  const maxCandle = Math.max(...allCandleHighs) * 1.01;
  const candleRange = maxCandle - minCandle || 1;

  const getY = (val) => 220 - ((val - minCandle) / candleRange) * 190;

  // Skala Line Chart
  const minP = Math.min(...priceHistory) * 0.98;
  const maxP = Math.max(...priceHistory) * 1.02;
  const linePoints = priceHistory.map((val, idx) => {
    const x = (idx / (priceHistory.length - 1)) * 500;
    const y = 200 - ((val - minP) / (maxP - minP || 1)) * 170;
    return `${x},${y}`;
  }).join(" ");

  const isUp = price >= prevPrice;
  const latestCandle = candles[candles.length - 1] || { open: price, high: price, low: price, close: price };

  return (
    <div className="container">
      {toast && <div className="toast">{toast}</div>}

      {/* Header Bar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>BakaTrader Exchange</h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>
              Sistem Dagangan Candlestick & Baucar RM5
            </p>
          </div>
        </div>

        <div className="nav-right">
          <button className="btn-pill btn-user mono" onClick={() => setShowUserModal(true)}>
            <User size={15} /> {username}
          </button>

          <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeemModal(true)}>
            <KeyRound size={15} /> Tebus PIN (RM5)
          </button>

          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdminAuth ? <Unlock size={15} /> : <Lock size={15} />} Admin (200200)
          </button>
        </div>
      </header>

      {/* Stats Pengguna */}
      <section className="stats-grid">
        <div className="card">
          <span className="stat-label mono">Baki Modal Tunai (MYR)</span>
          <div className="stat-val mono" style={{ color: "#fff" }}>
            RM {fiatBalance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Beli PIN daripada Admin untuk top-up
          </span>
        </div>

        <div className="card">
          <span className="stat-label mono">Pegangan $BAKA</span>
          <div className="stat-val mono" style={{ color: "var(--green)" }}>
            {bakaBalance.toFixed(4)} <span style={{ fontSize: "0.8rem" }}>BAKA</span>
          </div>
        </div>

        <div className="card">
          <span className="stat-label mono">Nilai Bersih Portfolio</span>
          <div className="stat-val mono" style={{ color: "var(--gold)" }}>
            RM {(fiatBalance + (bakaBalance * price)).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </section>

      {/* Trading Grid */}
      <div className="trading-grid">
        {/* Graf Carta Pasaran (Candlestick / Line) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>HARGA PASARAN SEMASA</span>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 800, color: isUp ? "var(--green)" : "var(--red)" }}>
                RM {price.toFixed(4)}
              </div>
            </div>

            {/* Butang Tukar Mod Candlestick / Line */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div className="chart-mode-group">
                <button 
                  className={`btn-mode mono ${chartMode === "candle" ? "active" : ""}`}
                  onClick={() => setChartMode("candle")}
                >
                  <BarChart3 size={14} /> Candlestick
                </button>
                <button 
                  className={`btn-mode mono ${chartMode === "line" ? "active" : ""}`}
                  onClick={() => setChartMode("line")}
                >
                  <LineChart size={14} /> Line
                </button>
              </div>

              <span className="mono" style={{
                padding: "0.3rem 0.6rem", borderRadius: "6px",
                background: isUp ? "rgba(0,192,135,0.15)" : "rgba(244,63,94,0.15)",
                color: isUp ? "var(--green)" : "var(--red)", fontWeight: 700
              }}>
                {isUp ? "+" : ""}{(((price - prevPrice) / prevPrice) * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Info Bar OHLC */}
          {chartMode === "candle" && (
            <div className="ohlc-bar mono">
              <span>O: <strong style={{ color: "#fff" }}>{latestCandle.open.toFixed(3)}</strong></span>
              <span>H: <strong style={{ color: "var(--green)" }}>{latestCandle.high.toFixed(3)}</strong></span>
              <span>L: <strong style={{ color: "var(--red)" }}>{latestCandle.low.toFixed(3)}</strong></span>
              <span>C: <strong style={{ color: "#fff" }}>{latestCandle.close.toFixed(3)}</strong></span>
            </div>
          )}

          {/* Paparan Graf SVG */}
          <div className="chart-box">
            {chartMode === "candle" ? (
              // Paparan Candlestick SVG
              <svg viewBox="0 0 500 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                {candles.map((c, i) => {
                  const candleWidth = 14;
                  const x = 20 + i * (460 / candles.length);
                  const isBullish = c.close >= c.open;
                  const candleColor = isBullish ? "var(--green)" : "var(--red)";

                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);
                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);

                  const rectY = Math.min(yOpen, yClose);
                  const rectHeight = Math.max(3, Math.abs(yClose - yOpen));

                  return (
                    <g key={c.id}>
                      {/* Sumbu Lilin (Wick) */}
                      <line
                        x1={x + candleWidth / 2}
                        y1={yHigh}
                        x2={x + candleWidth / 2}
                        y2={yLow}
                        stroke={candleColor}
                        strokeWidth="1.5"
                      />
                      {/* Badan Lilin (Body) */}
                      <rect
                        x={x}
                        y={rectY}
                        width={candleWidth}
                        height={rectHeight}
                        fill={candleColor}
                        rx="2"
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              // Paparan Line Chart SVG
              <svg viewBox="0 0 500 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <polyline
                  fill="none"
                  stroke={isUp ? "var(--green)" : "var(--red)"}
                  strokeWidth="3"
                  points={linePoints}
                />
              </svg>
            )}
          </div>
        </div>

        {/* Order Desk */}
        <div className="card">
          <div className="tab-row">
            <button 
              className={`tab-btn buy ${orderType === "buy" ? "active" : ""}`}
              onClick={() => setOrderType("buy")}
            >
              BELI $BAKA
            </button>
            <button 
              className={`tab-btn sell ${orderType === "sell" ? "active" : ""}`}
              onClick={() => setOrderType("sell")}
            >
              JUAL $BAKA
            </button>
          </div>

          <form onSubmit={handleExecuteTrade}>
            <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              KUANTITI $BAKA
            </label>
            <input
              type="number"
              step="any"
              className="input-styled mono"
              placeholder="0.00"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              required
            />

            <div style={{ background: "#090e1a", padding: "0.8rem", borderRadius: "8px", marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>Jumlah Harga:</span>
                <span className="mono" style={{ color: "#fff", fontWeight: 700 }}>
                  RM {((parseFloat(tradeAmount) || 0) * price).toFixed(2)}
                </span>
              </div>
            </div>

            <button type="submit" className={`btn-action-order mono ${orderType}`}>
              {orderType === "buy" ? "Sahkan Beli $BAKA" : "Sahkan Jual $BAKA"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL TEBUS PIN (RM5) */}
      {showRedeemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}>
                <Ticket size={20} /> Tebus PIN Top-up RM 5.00
              </h3>
              <button onClick={() => setShowRedeemModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Dapatkan kod PIN daripada Admin. Setiap PIN bernilai <strong>RM 5.00</strong> dan hanya boleh digunakan <strong>sekali sahaja</strong>.
            </p>

            <form onSubmit={handleRedeemPin}>
              <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                MASUKKAN KOD PIN (Cth: BK5-XXXX-XXXX)
              </label>
              <input
                type="text"
                className="input-styled mono"
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px", textTransform: "uppercase" }}
                placeholder="BK5-0000-0000"
                value={inputPinCode}
                onChange={(e) => setInputPinCode(e.target.value)}
                autoFocus
                required
              />

              <button type="submit" className="btn-action-order mono buy" style={{ marginTop: "1.2rem" }}>
                Tebus Sekarang (+RM 5.00)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN DASHBOARD (PIN 200200) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gold)" }}>
                <ShieldAlert size={20} /> Admin Dashboard & Penjana PIN
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {!isAdminAuth ? (
              <form onSubmit={handleAdminVerify}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
                  Masukkan PIN Pentadbir (200200) untuk kawal pasaran & jana PIN:
                </p>
                <input
                  type="password"
                  maxLength={6}
                  className="input-styled mono"
                  style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "6px" }}
                  placeholder="••••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-action-order mono" style={{ background: "var(--gold)", color: "#000", marginTop: "1rem" }}>
                  Buka Kunci Admin
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Penjana PIN Sekali Pakai (RM5) */}
                <div style={{ background: "#090e1a", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", color: "var(--green)" }}>Jana PIN Top-up RM 5</h4>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Satu PIN hanya boleh ditebus sekali</p>
                    </div>
                    <button 
                      onClick={handleAdminGeneratePin}
                      className="btn-pill btn-redeem mono"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <PlusCircle size={14} /> + Jana 1x PIN
                    </button>
                  </div>

                  <div className="pin-list">
                    {pinDatabase.map((pin, idx) => (
                      <div key={idx} className="pin-row mono">
                        <div>
                          <strong>{pin.code}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>(RM {pin.value})</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`badge-status ${pin.status === "AVAILABLE" ? "badge-avail" : "badge-used"}`}>
                            {pin.status === "AVAILABLE" ? "BELUM DIPAKAI" : `DITEBUS (${pin.usedBy})`}
                          </span>
                          {pin.status === "AVAILABLE" && (
                            <button
                              onClick={() => copyPinToClipboard(pin.code)}
                              style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}
                              title="Salin PIN"
                            >
                              {copiedCode === pin.code ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kawalan PUMP & DUMP Pasaran */}
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--green)" }}>KAWALAN PUMP (LONJAKAN HARGA)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <button onClick={() => triggerPump(15)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+15% PUMP</button>
                    <button onClick={() => triggerPump(35)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+35% PUMP</button>
                    <button onClick={() => triggerPump(70)} className="tab-btn mono" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>+70% MEGA</button>
                  </div>
                </div>

                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--red)" }}>KAWALAN DUMP (KEJATUHAN HARGA)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <button onClick={() => triggerDump(15)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-15% DUMP</button>
                    <button onClick={() => triggerDump(35)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-35% CRASH</button>
                    <button onClick={() => triggerDump(70)} className="tab-btn mono" style={{ border: "1px solid var(--red)", color: "var(--red)" }}>-70% NUKE</button>
                  </div>
                </div>

                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>TREND BIAS PASARAN</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <button onClick={() => setMarketBias("bull")} className="tab-btn mono" style={{ background: marketBias === "bull" ? "var(--green)" : "transparent", color: marketBias === "bull" ? "#000" : "#fff", border: "1px solid var(--border-ui)" }}>BULL 🐂</button>
                    <button onClick={() => setMarketBias("neutral")} className="tab-btn mono" style={{ background: marketBias === "neutral" ? "var(--cyan)" : "transparent", color: marketBias === "neutral" ? "#000" : "#fff", border: "1px solid var(--border-ui)" }}>NEUTRAL ⚖️</button>
                    <button onClick={() => setMarketBias("bear")} className="tab-btn mono" style={{ background: marketBias === "bear" ? "var(--red)" : "transparent", color: marketBias === "bear" ? "#000" : "#fff", border: "1px solid var(--border-ui)" }}>BEAR 🐻</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TUKAR AKAUN */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.8rem" }}>Tukar Akaun Trader</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Masukkan nama pengguna untuk memuatkan baki akaun berkenaan:
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (tempUser.trim()) {
                setUsername(tempUser.trim());
                setShowUserModal(false);
                setTempUser("");
                showToast(`Log masuk sebagai ${tempUser.trim()}`);
              }
            }}>
              <input
                type="text"
                className="input-styled mono"
                placeholder="cth: Abu_Trader"
                value={tempUser}
                onChange={(e) => setTempUser(e.target.value)}
                required
              />
              <button type="submit" className="btn-action-order mono buy" style={{ marginTop: "1rem" }}>
                Tukar Akaun
              </button>
            </form>
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

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  TrendingUp, TrendingDown, ShieldAlert, Lock, Unlock, 
  DollarSign, Activity, Sliders, Wallet, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, RefreshCw, X 
} from "lucide-react";

const ADMIN_PIN = "200200";

function App() {
  // Status Pasaran
  const [price, setPrice] = useState(2.50);
  const [prevPrice, setPrevPrice] = useState(2.50);
  const [priceHistory, setPriceHistory] = useState([2.30, 2.35, 2.42, 2.40, 2.48, 2.50]);
  const [marketBias, setMarketBias] = useState("neutral"); // 'neutral', 'bull', 'bear'

  // Portfolio Pengguna
  const [fiatBalance, setFiatBalance] = useState(10000.00); // RM Tunai
  const [bakaBalance, setBakaBalance] = useState(250.00);   // $BAKA Coin
  const [tradeAmount, setTradeAmount] = useState("");
  const [orderType, setOrderType] = useState("buy"); // 'buy' or 'sell'
  const [orderHistory, setOrderHistory] = useState([]);

  // Admin Dashboard States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  // Gelung Pergerakan Harga Automatik (Setiap 1.5 saat)
  useEffect(() => {
    const timer = setInterval(() => {
      setPrice((current) => {
        setPrevPrice(current);
        
        let deltaPercent = (Math.random() * 0.04 - 0.02); // turun naik rawak -2% ke +2%
        
        if (marketBias === "bull") {
          deltaPercent += 0.025; // Trend positif kuat
        } else if (marketBias === "bear") {
          deltaPercent -= 0.025; // Trend negatif kuat
        }

        const next = Math.max(0.01, +(current * (1 + deltaPercent)).toFixed(4));
        
        setPriceHistory((hist) => [...hist.slice(-25), next]);
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [marketBias]);

  // Fungsi Transaksi Beli / Jual
  const handleExecuteOrder = (e) => {
    e.preventDefault();
    const qty = parseFloat(tradeAmount);
    if (!qty || qty <= 0) return;

    if (orderType === "buy") {
      const totalCost = +(qty * price).toFixed(2);
      if (fiatBalance < totalCost) {
        showAlert("Baki tunai RM tidak mencukupi!");
        return;
      }
      setFiatBalance((b) => +(b - totalCost).toFixed(2));
      setBakaBalance((b) => +(b + qty).toFixed(4));
      
      setOrderHistory((h) => [
        { id: Date.now(), type: "BUY", qty, price, total: totalCost, time: new Date().toLocaleTimeString() },
        ...h.slice(0, 15)
      ]);
      showAlert(`Berjaya Beli ${qty} $BAKA (RM ${totalCost})`);
    } else {
      if (bakaBalance < qty) {
        showAlert("Baki $BAKA tidak mencukupi untuk dijual!");
        return;
      }
      const totalGain = +(qty * price).toFixed(2);
      setBakaBalance((b) => +(b - qty).toFixed(4));
      setFiatBalance((b) => +(b + totalGain).toFixed(2));

      setOrderHistory((h) => [
        { id: Date.now(), type: "SELL", qty, price, total: totalGain, time: new Date().toLocaleTimeString() },
        ...h.slice(0, 15)
      ]);
      showAlert(`Berjaya Jual ${qty} $BAKA (Dapat RM ${totalGain})`);
    }
    setTradeAmount("");
  };

  // Log Masuk Admin
  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuth(true);
      setPinInput("");
      showAlert("Akses Admin Disahkan!");
    } else {
      showAlert("PIN Salah! Akses ditolak.");
      setPinInput("");
    }
  };

  // Tindakan Pengarah Pasaran (Admin Controls)
  const triggerPump = (pct) => {
    setPrice((curr) => {
      const pumped = +(curr * (1 + pct / 100)).toFixed(4);
      setPriceHistory((h) => [...h.slice(-25), pumped]);
      return pumped;
    });
    showAlert(`🚀 PUMP AKTIF: Pasaran melonjak +${pct}%!`);
  };

  const triggerDump = (pct) => {
    setPrice((curr) => {
      const dumped = Math.max(0.001, +(curr * (1 - pct / 100)).toFixed(4));
      setPriceHistory((h) => [...h.slice(-25), dumped]);
      return dumped;
    });
    showAlert(`📉 DUMP AKTIF: Pasaran jatuh -${pct}%!`);
  };

  const applyCustomPrice = (e) => {
    e.preventDefault();
    const target = parseFloat(customPriceInput);
    if (!target || target <= 0) return;
    setPrice(target);
    setPriceHistory((h) => [...h.slice(-25), target]);
    setCustomPriceInput("");
    showAlert(`Harga $BAKA ditetapkan ke RM ${target.toFixed(4)}!`);
  };

  // Pengiraan Graf SVG
  const minVal = Math.min(...priceHistory) * 0.98;
  const maxVal = Math.max(...priceHistory) * 1.02;
  const points = priceHistory.map((val, idx) => {
    const x = (idx / (priceHistory.length - 1)) * 500;
    const y = 200 - ((val - minVal) / (maxVal - minVal || 1)) * 180;
    return `${x},${y}`;
  }).join(" ");

  const isPositive = price >= prevPrice;
  const totalNetWorth = +(fiatBalance + (bakaBalance * price)).toFixed(2);

  return (
    <div className="trade-container">
      {/* Toast Notifikasi */}
      {alertMsg && (
        <div style={{
          position: "fixed", bottom: "2rem", right: "2rem",
          background: "#00c087", color: "#000", padding: "0.8rem 1.4rem",
          borderRadius: "10px", fontWeight: 800, zIndex: 10000,
          boxShadow: "0 0 20px rgba(0, 192, 135, 0.4)"
        }}>
          {alertMsg}
        </div>
      )}

      {/* Header Bar */}
      <header className="header-bar">
        <div className="logo-area">
          <div className="logo-icon">
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
              BakaTrader <span style={{ color: "var(--green)", fontSize: "0.85rem" }}>EXCHANGE</span>
            </h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Pair: BAKA / MYR
            </p>
          </div>
        </div>

        <button 
          className="btn-admin-trigger mono"
          onClick={() => setShowAdminModal(true)}
        >
          {isAdminAuth ? <Unlock size={16} /> : <Lock size={16} />}
          <span>{isAdminAuth ? "Admin Console (Aktif)" : "Admin Access"}</span>
        </button>
      </header>

      {/* Ringkasan Dompet Pengguna */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card-box">
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>BAKI MODAL TUNAI</span>
          <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginTop: "0.3rem" }}>
            RM {fiatBalance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card-box">
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PEGANGAN $BAKA COIN</span>
          <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--green)", marginTop: "0.3rem" }}>
            {bakaBalance.toFixed(4)} <span style={{ fontSize: "0.8rem" }}>BAKA</span>
          </div>
        </div>

        <div className="card-box">
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>JUMLAH NILAI BERSIH (NET WORTH)</span>
          <div className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--gold)", marginTop: "0.3rem" }}>
            RM {totalNetWorth.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </section>

      {/* Grid Pasaran: Graf Harga & Meja Pesanan */}
      <div className="market-grid">
        {/* Graf Live SVG */}
        <div className="card-box">
          <div className="chart-header">
            <div>
              <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>HARGA PASARAN SEMASA</span>
              <div className="price-big mono" style={{ color: isPositive ? "var(--green)" : "var(--red)" }}>
                RM {price.toFixed(4)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="mono" style={{ 
                display: "inline-flex", alignItems: "center", gap: "0.2rem",
                padding: "0.3rem 0.6rem", borderRadius: "6px",
                background: isPositive ? "rgba(0,192,135,0.15)" : "rgba(244,63,94,0.15)",
                color: isPositive ? "var(--green)" : "var(--red)",
                fontWeight: 700, fontSize: "0.85rem"
              }}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {(((price - prevPrice) / prevPrice) * 100).toFixed(2)}%
              </span>
              <div className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Mode: {marketBias.toUpperCase()}
              </div>
            </div>
          </div>

          {/* SVG Realtime Graph */}
          <div className="chart-svg-container">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <polyline
                fill="none"
                stroke={isPositive ? "var(--green)" : "var(--red)"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        {/* Meja Pesanan (Order Desk) */}
        <div className="card-box order-desk">
          <div className="tab-switch">
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

          <form onSubmit={handleExecuteOrder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label">Kuantiti BakaCoin</label>
              <input
                type="number"
                step="any"
                className="trade-input mono"
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                required
              />
            </div>

            <div style={{ background: "#080b12", padding: "0.8rem", borderRadius: "8px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Anggaran Jumlah:</span>
                <span className="mono" style={{ color: "#fff", fontWeight: 700 }}>
                  RM {((parseFloat(tradeAmount) || 0) * price).toFixed(2)}
                </span>
              </div>
            </div>

            <button type="submit" className={`btn-execute mono ${orderType}`}>
              {orderType === "buy" ? "BUAT PESANAN BELI" : "BUAT PESANAN JUAL"}
            </button>
          </form>
        </div>
      </div>

      {/* Sejarah Transaksi */}
      <section className="card-box">
        <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Rekod Transaksi Pengguna</h3>
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Masa</th>
                <th>Jenis</th>
                <th>Kuantiti</th>
                <th>Harga Transaksi</th>
                <th>Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="mono">
              {orderHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    Belum ada sebarang transaksi dibuat.
                  </td>
                </tr>
              ) : (
                orderHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.time}</td>
                    <td style={{ color: item.type === "BUY" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                      {item.type}
                    </td>
                    <td>{item.qty} BAKA</td>
                    <td>RM {item.price.toFixed(4)}</td>
                    <td>RM {item.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL ADMIN DASHBOARD (PIN: 200200) */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gold)" }}>
                <ShieldAlert size={22} />
                <h3 style={{ fontSize: "1.15rem" }}>BakaTrader Central Bank Admin</h3>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {!isAdminAuth ? (
              // Skrin Masukkan PIN
              <form onSubmit={handleAdminAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Sila masukkan PIN Pentadbir 6-digit untuk mengawal turun naik pasaran.
                </p>
                <input
                  type="password"
                  maxLength={6}
                  className="trade-input mono"
                  style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px" }}
                  placeholder="••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-pump mono" style={{ width: "100%", padding: "0.8rem" }}>
                  Sahkan PIN Pentadbir
                </button>
              </form>
            ) : (
              // Panel Kawalan Pasaran
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Butang Manipulasi PUMP */}
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 700 }}>
                    KAWALAN LONJAKAN (PUMP MARKET)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <button onClick={() => triggerPump(10)} className="btn-pump mono">+10% PUMP</button>
                    <button onClick={() => triggerPump(25)} className="btn-pump mono">+25% PUMP</button>
                    <button onClick={() => triggerPump(50)} className="btn-pump mono">+50% MEGA</button>
                  </div>
                </div>

                {/* Butang Manipulasi DUMP */}
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--red)", fontWeight: 700 }}>
                    KAWALAN KEJATUHAN (DUMP MARKET)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <button onClick={() => triggerDump(10)} className="btn-dump mono">-10% CRASH</button>
                    <button onClick={() => triggerDump(25)} className="btn-dump mono">-25% DIP</button>
                    <button onClick={() => triggerDump(50)} className="btn-dump mono">-50% NUKE</button>
                  </div>
                </div>

                {/* Tetapan Trend Automatik */}
                <div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>
                    KECENDERUNGAN PASARAN (MARKET BIAS)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <button 
                      onClick={() => { setMarketBias("bull"); showAlert("Mod Bullish Diaktifkan!"); }}
                      className="tab-btn mono"
                      style={{ border: "1px solid var(--green)", color: marketBias === "bull" ? "#000" : "var(--green)", background: marketBias === "bull" ? "var(--green)" : "transparent" }}
                    >
                      BULLISH 🐂
                    </button>
                    <button 
                      onClick={() => { setMarketBias("neutral"); showAlert("Mod Neutral Diaktifkan!"); }}
                      className="tab-btn mono"
                      style={{ border: "1px solid var(--border-ui)", color: "#fff", background: marketBias === "neutral" ? "rgba(255,255,255,0.15)" : "transparent" }}
                    >
                      NEUTRAL ⚖️
                    </button>
                    <button 
                      onClick={() => { setMarketBias("bear"); showAlert("Mod Bearish Diaktifkan!"); }}
                      className="tab-btn mono"
                      style={{ border: "1px solid var(--red)", color: marketBias === "bear" ? "#fff" : "var(--red)", background: marketBias === "bear" ? "var(--red)" : "transparent" }}
                    >
                      BEARISH 🐻
                    </button>
                  </div>
                </div>

                {/* Tetapkan Harga Khusus */}
                <form onSubmit={applyCustomPrice} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="number"
                    step="0.0001"
                    className="trade-input mono"
                    style={{ fontSize: "0.85rem" }}
                    placeholder="Tetapkan Harga (cth: 5.00)"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                  />
                  <button type="submit" className="btn-pump mono" style={{ whiteSpace: "nowrap" }}>
                    Set Harga
                  </button>
                </form>
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

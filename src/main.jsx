import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Activity, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ArrowUpRight, ArrowDownRight, ShieldAlert, X, 
  Copy, Check, PlusCircle, Ticket, BarChart3, LineChart, 
  MessageCircle, ArrowDownToLine, Terminal, CheckCircle2 
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaTrader (RM5)")}`;

// Kadar Penukaran: RM 1.00 = $1,000 Scoreboard Money
const RATE_RM_TO_SCOREBOARD = 1000;

const generateRandomPinCode = () => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `BK5-${part1}-${part2}`;
};

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
  // Pangkalan Data Pengguna
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem("baka_users_db");
    return saved ? JSON.parse(saved) : [
      { username: "trader_demo", password: "123", fiatBalance: 15.00, bakaBalance: 5.0, trades: [] }
    ];
  });

  // Pengguna Semasa
  const [currentUsername, setCurrentUsername] = useState(() => {
    return localStorage.getItem("baka_active_user") || "trader_demo";
  });

  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Pasaran & Graf
  const [chartMode, setChartMode] = useState("candle");
  const [price, setPrice] = useState(2.50);
  const [prevPrice, setPrevPrice] = useState(2.50);
  const [candles, setCandles] = useState(generateInitialCandles);
  const [priceHistory, setPriceHistory] = useState([2.30, 2.38, 2.45, 2.42, 2.50]);
  const [marketBias, setMarketBias] = useState("neutral");

  // Transaksi
  const [tradeAmount, setTradeAmount] = useState("");
  const [orderType, setOrderType] = useState("buy");

  // Sistem Baucar PIN
  const [pinDatabase, setPinDatabase] = useState(() => {
    const savedPins = localStorage.getItem("baka_pin_database");
    return savedPins ? JSON.parse(savedPins) : [
      { code: "BK5-7788-9900", value: 5, status: "AVAILABLE", createdAt: "Asal" }
    ];
  });

  // SISTEM WITHDRAW KE SERVER MINECRAFT SCOREBOARD
  const [withdrawRequests, setWithdrawRequests] = useState(() => {
    const saved = localStorage.getItem("baka_withdraw_requests");
    return saved ? JSON.parse(saved) : [];
  });

  // Modals & UI
  const [showAuthModal, setShowAuthModal] = useState(!currentUser);
  const [authTab, setAuthTab] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [inputPinCode, setInputPinCode] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawGamerTag, setWithdrawGamerTag] = useState("");
  const [withdrawAmountRM, setWithdrawAmountRM] = useState("5");

  const [showAdmin, setShowAdmin] = useState(false);

  // Admin Auth
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    localStorage.setItem("baka_users_db", JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem("baka_active_user", currentUsername);
    } else {
      localStorage.removeItem("baka_active_user");
    }
  }, [currentUsername]);

  useEffect(() => {
    localStorage.setItem("baka_pin_database", JSON.stringify(pinDatabase));
  }, [pinDatabase]);

  useEffect(() => {
    localStorage.setItem("baka_withdraw_requests", JSON.stringify(withdrawRequests));
  }, [withdrawRequests]);

  // Gelung Pasaran Masa Nyata & Candlestick
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

        setCandles((prevCandles) => {
          tickCounter++;
          const lastCandle = prevCandles[prevCandles.length - 1];

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

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");
    const cleanUser = authUsername.trim();

    if (!cleanUser || !authPassword) {
      setAuthError("Sila lengkapkan username dan password.");
      return;
    }

    if (usersDb.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      setAuthError("Username ini sudah didaftarkan!");
      return;
    }

    const newUser = {
      username: cleanUser,
      password: authPassword,
      fiatBalance: 0.0,
      bakaBalance: 0.0,
      trades: []
    };

    setUsersDb([...usersDb, newUser]);
    setCurrentUsername(cleanUser);
    setShowAuthModal(false);
    setAuthUsername("");
    setAuthPassword("");
    showToast(`🎉 Selamat datang, ${cleanUser}!`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    const cleanUser = authUsername.trim();

    const existingUser = usersDb.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === authPassword
    );

    if (!existingUser) {
      setAuthError("Username atau Password salah!");
      return;
    }

    setCurrentUsername(existingUser.username);
    setShowAuthModal(false);
    setAuthUsername("");
    setAuthPassword("");
    showToast(`Log masuk berjaya sebagai ${existingUser.username}`);
  };

  const handleLogout = () => {
    setCurrentUsername("");
    setShowAuthModal(true);
    setAuthTab("login");
    showToast("Anda telah log keluar.");
  };

  const updateCurrentUserData = (updatedFields) => {
    if (!currentUser) return;
    setUsersDb((prev) =>
      prev.map((u) => (u.username === currentUser.username ? { ...u, ...updatedFields } : u))
    );
  };

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const qty = parseFloat(tradeAmount);
    if (!qty || qty <= 0) return;

    if (orderType === "buy") {
      const cost = +(qty * price).toFixed(2);
      if (currentUser.fiatBalance < cost) {
        showToast("Baki RM tidak mencukupi! Sila beli PIN di WhatsApp Admin.");
        return;
      }

      const newFiat = +(currentUser.fiatBalance - cost).toFixed(2);
      const newBaka = +(currentUser.bakaBalance + qty).toFixed(4);
      const newTrade = { id: Date.now(), type: "BUY", qty, price, total: cost, time: new Date().toLocaleTimeString() };

      updateCurrentUserData({
        fiatBalance: newFiat,
        bakaBalance: newBaka,
        trades: [newTrade, ...(currentUser.trades || []).slice(0, 15)]
      });

      showToast(`Berjaya Beli ${qty} $BAKA (RM ${cost})`);
    } else {
      if (currentUser.bakaBalance < qty) {
        showToast("Baki $BAKA tidak mencukupi!");
        return;
      }

      const gains = +(qty * price).toFixed(2);
      const newBaka = +(currentUser.bakaBalance - qty).toFixed(4);
      const newFiat = +(currentUser.fiatBalance + gains).toFixed(2);
      const newTrade = { id: Date.now(), type: "SELL", qty, price, total: gains, time: new Date().toLocaleTimeString() };

      updateCurrentUserData({
        fiatBalance: newFiat,
        bakaBalance: newBaka,
        trades: [newTrade, ...(currentUser.trades || []).slice(0, 15)]
      });

      showToast(`Berjaya Jual ${qty} $BAKA (+RM ${gains})`);
    }
    setTradeAmount("");
  };

  const handleRedeemPin = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

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

    updateCurrentUserData({
      fiatBalance: +(currentUser.fiatBalance + targetPin.value).toFixed(2)
    });

    setPinDatabase((prev) =>
      prev.map((p) =>
        p.code.toUpperCase() === cleanCode
          ? { ...p, status: "USED", usedBy: currentUser.username, usedAt: new Date().toLocaleTimeString() }
          : p
      )
    );

    setInputPinCode("");
    setShowRedeemModal(false);
    showToast(`🎉 Tahniah! +RM ${targetPin.value}.00 berjaya dimasukkan!`);
  };

  // PENGELUARAN (WITHDRAW) DUIT WEB KE SCOREBOARD MONEY MINECRAFT
  const handleWithdrawToServer = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const amt = parseFloat(withdrawAmountRM);
    const ign = withdrawGamerTag.trim();

    if (!ign) {
      showToast("Sila masukkan Minecraft GamerTag / IGN anda!");
      return;
    }

    if (!amt || amt <= 0) {
      showToast("Sila masukkan jumlah RM yang sah.");
      return;
    }

    if (currentUser.fiatBalance < amt) {
      showToast("Baki modal RM anda tidak mencukupi untuk withdraw!");
      return;
    }

    // Kira Scoreboard Money yang akan didapat (cth: RM5 = $5,000 Scoreboard money)
    const scoreboardEarned = Math.floor(amt * RATE_RM_TO_SCOREBOARD);

    // Tolak baki RM pengguna di web
    updateCurrentUserData({
      fiatBalance: +(currentUser.fiatBalance - amt).toFixed(2)
    });

    // Cipta Rekod Tiket Pengeluaran untuk Admin proses
    const newRequest = {
      id: Date.now(),
      username: currentUser.username,
      gamerTag: ign,
      amountRM: amt,
      scoreboardMoney: scoreboardEarned,
      command: `/scoreboard players add ${ign} money ${scoreboardEarned}`,
      status: "PENDING",
      time: new Date().toLocaleTimeString()
    };

    setWithdrawRequests([newRequest, ...withdrawRequests]);
    setShowWithdrawModal(false);
    setWithdrawGamerTag("");
    showToast(`✅ Permintaan Withdraw RM ${amt.toFixed(2)} ($${scoreboardEarned.toLocaleString()} Money) dihantar ke Admin!`);
  };

  // Admin Selesaikan / Approve Withdraw
  const handleApproveWithdraw = (id) => {
    setWithdrawRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "SELESAI" } : r))
    );
    showToast("Permintaan ditandakan sebagai SELESAI!");
  };

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

  const copyTextToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    showToast(`${label} disalin ke clipboard!`);
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

  // PENGIRAAN SKALA & GRID GRAF
  const allCandleHighs = candles.map((c) => c.high);
  const allCandleLows = candles.map((c) => c.low);
  const minCandle = Math.min(...allCandleLows) * 0.992;
  const maxCandle = Math.max(...allCandleHighs) * 1.008;
  const candleRange = maxCandle - minCandle || 1;
  const getY = (val) => 220 - ((val - minCandle) / candleRange) * 180;

  const gridLevels = [0.15, 0.38, 0.62, 0.85].map((pct) => {
    const pVal = minCandle + candleRange * pct;
    return { y: getY(pVal), price: pVal };
  });

  const verticalGridXs = [50, 130, 210, 290, 370];

  const minP = Math.min(...priceHistory) * 0.985;
  const maxP = Math.max(...priceHistory) * 1.015;
  const linePoints = priceHistory.map((val, idx) => {
    const x = (idx / (priceHistory.length - 1)) * 430 + 10;
    const y = 220 - ((val - minP) / (maxP - minP || 1)) * 180;
    return `${x},${y}`;
  }).join(" ");

  const isUp = price >= prevPrice;
  const currentPriceY = getY(price);
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
              Sistem Dagangan & Pengeluaran Scoreboard Money
            </p>
          </div>
        </div>

        <div className="nav-right">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={15} /> {currentUser.username}
              </button>

              <button className="btn-pill btn-withdraw mono" onClick={() => setShowWithdrawModal(true)}>
                <ArrowDownToLine size={15} /> Withdraw ke Server
              </button>

              <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeemModal(true)}>
                <KeyRound size={15} /> Tebus PIN
              </button>

              <button className="btn-pill btn-logout mono" onClick={handleLogout} title="Log Keluar">
                <LogOut size={15} /> Keluar
              </button>
            </>
          ) : (
            <button className="btn-pill btn-user mono" onClick={() => setShowAuthModal(true)}>
              <LogIn size={15} /> Log Masuk / Daftar
            </button>
          )}

          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdminAuth ? <Unlock size={15} /> : <Lock size={15} />} Admin (200200)
          </button>
        </div>
      </header>

      {/* Stats Pengguna & Petak Tindakan */}
      <section className="stats-grid">
        <div className="card">
          <span className="stat-label mono">Baki Modal Tunai (MYR)</span>
          <div className="stat-val mono" style={{ color: "#fff" }}>
            RM {currentUser ? currentUser.fiatBalance.toLocaleString("en-MY", { minimumFractionDigits: 2 }) : "0.00"}
          </div>

          <div className="stat-actions-row">
            <button 
              className="btn-pill btn-withdraw mono"
              style={{ fontSize: "0.78rem", padding: "0.45rem 0.85rem" }}
              onClick={() => setShowWithdrawModal(true)}
            >
              <ArrowDownToLine size={14} /> Withdraw Server
            </button>

            <a 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp mono"
              title="Chat WhatsApp Admin 018-3915460"
            >
              <MessageCircle size={15} /> Beli PIN
            </a>
          </div>
        </div>

        <div className="card">
          <span className="stat-label mono">Pegangan $BAKA</span>
          <div className="stat-val mono" style={{ color: "var(--green)" }}>
            {currentUser ? currentUser.bakaBalance.toFixed(4) : "0.0000"} <span style={{ fontSize: "0.8rem" }}>BAKA</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
            Jual coin untuk dapatkan RM dan withdraw ke Scoreboard
          </span>
        </div>

        <div className="card">
          <span className="stat-label mono">Kadar Pengeluaran Server</span>
          <div className="stat-val mono" style={{ color: "var(--cyan)", fontSize: "1.2rem" }}>
            RM 1.00 = $1,000
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
            Scoreboard Money Bedrock (Objektif: money)
          </span>
        </div>
      </section>

      {/* Trading Grid */}
      <div className="trading-grid">
        {/* Graf Carta Pasaran dengan Grid Realistik */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>HARGA PASARAN SEMASA</span>
              <div className="mono" style={{ fontSize: "2rem", fontWeight: 800, color: isUp ? "var(--green)" : "var(--red)" }}>
                RM {price.toFixed(4)}
              </div>
            </div>

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

          {chartMode === "candle" && (
            <div className="ohlc-bar mono">
              <span>O: <strong style={{ color: "#fff" }}>{latestCandle.open.toFixed(3)}</strong></span>
              <span>H: <strong style={{ color: "var(--green)" }}>{latestCandle.high.toFixed(3)}</strong></span>
              <span>L: <strong style={{ color: "var(--red)" }}>{latestCandle.low.toFixed(3)}</strong></span>
              <span>C: <strong style={{ color: "#fff" }}>{latestCandle.close.toFixed(3)}</strong></span>
            </div>
          )}

          <div className="chart-box">
            <svg viewBox="0 0 500 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              {verticalGridXs.map((xVal, idx) => (
                <line
                  key={`v-${idx}`}
                  x1={xVal}
                  y1={10}
                  x2={xVal}
                  y2={230}
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeDasharray="4 4"
                />
              ))}

              {gridLevels.map((lvl, idx) => (
                <g key={`h-${idx}`}>
                  <line
                    x1={0}
                    y1={lvl.y}
                    x2={440}
                    y2={lvl.y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={444}
                    y={lvl.y + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    {lvl.price.toFixed(3)}
                  </text>
                </g>
              ))}

              <line
                x1={0}
                y1={currentPriceY}
                x2={440}
                y2={currentPriceY}
                stroke={isUp ? "var(--green)" : "var(--red)"}
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.85"
              />
              <rect
                x={441}
                y={Math.max(5, Math.min(218, currentPriceY - 8))}
                width={56}
                height={16}
                fill={isUp ? "var(--green)" : "var(--red)"}
                rx="3"
              />
              <text
                x={445}
                y={Math.max(16, Math.min(229, currentPriceY + 4))}
                fill="#000"
                fontSize="9"
                fontWeight="800"
                fontFamily="JetBrains Mono"
              >
                {price.toFixed(3)}
              </text>

              {chartMode === "candle" ? (
                candles.map((c, i) => {
                  const candleWidth = 13;
                  const x = 15 + i * (410 / candles.length);
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
                      <line
                        x1={x + candleWidth / 2}
                        y1={yHigh}
                        x2={x + candleWidth / 2}
                        y2={yLow}
                        stroke={candleColor}
                        strokeWidth="1.5"
                      />
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
                })
              ) : (
                <polyline
                  fill="none"
                  stroke={isUp ? "var(--green)" : "var(--red)"}
                  strokeWidth="2.5"
                  points={linePoints}
                />
              )}
            </svg>
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
              {currentUser
                ? orderType === "buy" ? "Sahkan Beli $BAKA" : "Sahkan Jual $BAKA"
                : "Log Masuk Untuk Berdagang"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL WITHDRAW KE SERVER MINECRAFT SCOREBOARD */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)" }}>
                <ArrowDownToLine size={20} /> Withdraw ke Server Minecraft (Scoreboard)
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Tukarkan baki RM anda ke dalam mata wang <strong>Scoreboard Money (Bedrock)</strong>. Admin akan memasukkan duit ke akaun server anda.
            </p>

            <form onSubmit={handleWithdrawToServer}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  MINECRAFT GAMERTAG / IGN ANDA
                </label>
                <input
                  type="text"
                  className="input-styled mono"
                  placeholder="Cth: SteveMY / HafizCraft"
                  value={withdrawGamerTag}
                  onChange={(e) => setWithdrawGamerTag(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  JUMLAH RM NAK WITHDRAW
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={currentUser ? currentUser.fiatBalance : 0}
                  className="input-styled mono"
                  placeholder="Cth: 5"
                  value={withdrawAmountRM}
                  onChange={(e) => setWithdrawAmountRM(e.target.value)}
                  required
                />
              </div>

              <div style={{ background: "#090e1a", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Duit Scoreboard Diterima:</span>
                  <span className="mono" style={{ color: "var(--green)", fontWeight: 800 }}>
                    ${((parseFloat(withdrawAmountRM) || 0) * RATE_RM_TO_SCOREBOARD).toLocaleString()} Money
                  </span>
                </div>
              </div>

              <button type="submit" className="btn-action-order mono" style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", color: "#fff" }}>
                Hantar Permintaan Withdraw
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUTH (LOGIN & REGISTER) */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              {currentUser && (
                <button onClick={() => setShowAuthModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="auth-tabs mono">
              <button 
                className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`}
                onClick={() => { setAuthTab("login"); setAuthError(""); }}
              >
                <LogIn size={14} style={{ display: "inline", marginRight: "4px" }} /> Log Masuk
              </button>
              <button 
                className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`}
                onClick={() => { setAuthTab("register"); setAuthError(""); }}
              >
                <UserPlus size={14} style={{ display: "inline", marginRight: "4px" }} /> Daftar Akaun
              </button>
            </div>

            {authError && (
              <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "1rem" }}>
                {authError}
              </div>
            )}

            <form onSubmit={authTab === "login" ? handleLogin : handleRegister}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input
                  type="text"
                  className="input-styled mono"
                  placeholder="Cth: AbuTrader"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input
                  type="password"
                  className="input-styled mono"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-action-order mono buy">
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun & Mula Dagang"}
              </button>
            </form>
          </div>
        </div>
      )}

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

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
              Belum ada kod PIN? Beli terus daripada Admin secara rasmi:
            </p>

            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mono"
              style={{ width: "100%", justifyContent: "center", padding: "0.7rem", marginBottom: "1.2rem", fontSize: "0.88rem" }}
            >
              <MessageCircle size={16} /> Hubungi Admin di WhatsApp (018-3915460)
            </a>

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

              <button type="submit" className="btn-action-order mono buy" style={{ marginTop: "1rem" }}>
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
                <ShieldAlert size={20} /> Admin Dashboard & Pengurusan Server
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {!isAdminAuth ? (
              <form onSubmit={handleAdminVerify}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>
                  Masukkan PIN Pentadbir (200200) untuk menguruskan pengeluaran dan pasaran:
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
                {/* SENARAI PENGELUARAN KE SERVER (WITHDRAW REQUESTS) */}
                <div style={{ background: "#090e1a", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Terminal size={16} /> Permintaan Withdraw Duit Scoreboard ({withdrawRequests.length})
                    </h4>
                  </div>

                  <div className="pin-list">
                    {withdrawRequests.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
                        Tiada sebarang permintaan withdraw setakat ini.
                      </p>
                    ) : (
                      withdrawRequests.map((req) => (
                        <div key={req.id} style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong style={{ color: "#fff" }}>IGN: {req.gamerTag}</strong>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                                ({req.username}) - RM {req.amountRM.toFixed(2)}
                              </span>
                            </div>
                            <span className={`badge-status ${req.status === "PENDING" ? "badge-pending" : "badge-avail"}`}>
                              {req.status}
                            </span>
                          </div>

                          {/* Command Box dengan butang salin */}
                          <div className="command-snippet mono">
                            <span>{req.command}</span>
                            <button
                              onClick={() => copyTextToClipboard(req.command, "Command")}
                              style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}
                              title="Salin Command untuk ditampal dalam Minecraft"
                            >
                              {copiedCode === req.command ? <Check size={14} /> : <Copy size={14} />} Salin
                            </button>
                          </div>

                          {req.status === "PENDING" && (
                            <button
                              onClick={() => handleApproveWithdraw(req.id)}
                              className="btn-pill btn-redeem mono"
                              style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center", fontSize: "0.75rem" }}
                            >
                              <CheckCircle2 size={14} /> Tandakan Telah Dimasukkan di Server
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

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
                              onClick={() => copyTextToClipboard(pin.code, "PIN")}
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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

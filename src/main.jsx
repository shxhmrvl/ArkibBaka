import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Activity, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ArrowUpRight, ArrowDownRight, ShieldAlert, X, 
  Copy, Check, PlusCircle, Ticket, BarChart3, LineChart, 
  MessageCircle, ArrowDownToLine, Terminal, CheckCircle2,
  ZoomIn, ZoomOut, RotateCcw
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaTrader (RM5)")}`;

const RATE_RM_TO_SCOREBOARD = 1000;

const generateRandomPinCode = () => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `BK5-${part1}-${part2}`;
};

// Menjana data lilin awal dengan rekod sejarah yang mencukupi
const generateInitialCandles = () => {
  let base = 2.40;
  const list = [];
  for (let i = 0; i < 40; i++) {
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

  // ZOOM CONTROLS (Bilangan lilin/titik yang dipaparkan)
  // Default: 18, Min: 10 (Zoom In Terperinci), Max: 40 (Zoom Out Sejarah Penuh)
  const [zoomCount, setZoomCount] = useState(18);

  // SEJARAH PIPS (1 Pip = 0.0001)
  const [pipsHistory, setPipsHistory] = useState([
    { id: 1, pips: "+12.0", isPositive: true, time: "Baru tadi" },
    { id: 2, pips: "-4.5", isPositive: false, time: "1m lepas" },
    { id: 3, pips: "+25.1", isPositive: true, time: "2m lepas" }
  ]);

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

  // Sistem Withdraw Scoreboard
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

  // Gelung Pasaran Masa Nyata, Candlestick & Kiraan Pips
  useEffect(() => {
    let tickCounter = 0;

    const interval = setInterval(() => {
      setPrice((current) => {
        setPrevPrice(current);
        let change = (Math.random() * 0.04 - 0.02);
        if (marketBias === "bull") change += 0.02;
        if (marketBias === "bear") change -= 0.02;

        const next = Math.max(0.01, +(current * (1 + change)).toFixed(4));
        setPriceHistory((h) => [...h.slice(-45), next]);

        // Kiraan Pips: (next - current) * 10,000
        const deltaPipsVal = +((next - current) * 10000).toFixed(1);
        if (deltaPipsVal !== 0) {
          const newPipRecord = {
            id: Date.now(),
            pips: deltaPipsVal > 0 ? `+${deltaPipsVal}` : `${deltaPipsVal}`,
            isPositive: deltaPipsVal > 0,
            time: new Date().toLocaleTimeString()
          };
          setPipsHistory((prev) => [newPipRecord, ...prev.slice(0, 10)]);
        }

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
            return [...prevCandles.slice(-44), newCandle];
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

  // Fungsi Zoom In dan Zoom Out
  const handleZoomIn = () => {
    setZoomCount((prev) => Math.max(10, prev - 4));
  };

  const handleZoomOut = () => {
    setZoomCount((prev) => Math.min(40, prev + 4));
  };

  const handleResetZoom = () => {
    setZoomCount(18);
  };

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

    setCurrentUsername(exist

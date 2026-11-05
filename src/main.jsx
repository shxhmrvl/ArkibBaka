import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Zap, Cpu, HardDrive, Terminal, Shield, ArrowUpRight, 
  Coins, Activity, Power, RefreshCw, Send, Check
} from "lucide-react";

// Senarai perkakasan melombong yang boleh dibeli
const RIG_STORE = [
  {
    id: "cpu_rig",
    name: "Celeron Dual-Core Miner",
    desc: "Melombong asas menggunakan kuasa thread CPU.",
    cost: 5,
    hashBonus: 2.5,
    count: 0
  },
  {
    id: "gpu_1660",
    name: "NVIDIA GTX 1660 Super",
    desc: "Rig bajet yang efisien untuk algoritma BakaCrypt.",
    cost: 25,
    hashBonus: 15.0,
    count: 0
  },
  {
    id: "gpu_4090",
    name: "RTX 4090 Monster Rig",
    desc: "Kad grafik ekstrem dengan kuasa VRAM 24GB.",
    cost: 100,
    hashBonus: 75.0,
    count: 0
  },
  {
    id: "asic_s19",
    name: "BakaMiner ASIC Pro",
    desc: "Cip pemprosesan khas SHA-256 direka khas melombong blok.",
    cost: 450,
    hashBonus: 350.0,
    count: 0
  }
];

function App() {
  // Simpanan data dalam localStorage
  const [balance, setBalance] = useState(() => {
    const s = localStorage.getItem("baka_balance");
    return s ? parseFloat(s) : 0.00;
  });

  const [blocksFound, setBlocksFound] = useState(() => {
    const s = localStorage.getItem("baka_blocks");
    return s ? parseInt(s) : 0;
  });

  const [inventory, setInventory] = useState(() => {
    const s = localStorage.getItem("baka_rigs");
    return s ? JSON.parse(s) : RIG_STORE;
  });

  const [isMining, setIsMining] = useState(false);
  const [manualClicks, setManualClicks] = useState(0);
  const [logs, setLogs] = useState([
    { id: 1, time: "INIT", text: "BakaCoin ($BAKA) Node v2.6.4 Ready. Algoritma: BakaCrypt-256.", type: "normal" }
  ]);
  const [walletTarget, setWalletTarget] = useState("");
  const [toast, setToast] = useState("");

  // Kiraan hashrate semasa berdasarkan perkakasan
  const baseHashrate = isMining ? 1.0 : 0.0;
  const hardwareHashrate = inventory.reduce((total, item) => total + (item.count * item.hashBonus), 0);
  const totalHashrate = (baseHashrate + hardwareHashrate).toFixed(1);

  // Auto-save data
  useEffect(() => {
    localStorage.setItem("baka_balance", balance.toString());
    localStorage.setItem("baka_blocks", blocksFound.toString());
    localStorage.setItem("baka_rigs", JSON.stringify(inventory));
  }, [balance, blocksFound, inventory]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const addLog = (text, type = "normal") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Date.now() + Math.random(), time, text, type }, ...prev.slice(0, 40)]);
  };

  // Mining Engine Loop (Setiap saat menjana BAKA sekiranya aktif atau ada rig)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeHash = parseFloat(totalHashrate);
      if (activeHash <= 0) return;

      // Pendapatan BAKA sesaat mengikut hashrate
      const reward = (activeHash * 0.005);
      setBalance((prev) => +(prev + reward).toFixed(4));

      // Simulasi carian hash
      const randomNonce = Math.floor(Math.random() * 9999999).toString(16);
      const mockHash = "0000" + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      // Peluang jumpa blok rawak
      if (Math.random() < 0.25) {
        const bonusBlock = +(Math.random() * 0.5 + 0.1).toFixed(2);
        setBalance((prev) => +(prev + bonusBlock).toFixed(4));
        setBlocksFound((b) => b + 1);
        addLog(`🏆 BLOK DITEMUI! Nonce: 0x${randomNonce} -> Ganjaran +${bonusBlock} $BAKA`, "success");
      } else {
        addLog(`Hashing #Nonce: 0x${randomNonce} [${mockHash.substring(0, 20)}...] (${totalHashrate} MH/s)`, "hash");
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [totalHashrate]);

  // Butang klik manual melombong pantas
  const handleManualClick = () => {
    const reward = 0.05;
    setBalance((prev) => +(prev + reward).toFixed(4));
    setManualClicks((c) => c + 1);
    addLog(`⚡ MANUAL MINE: +${reward} $BAKA disahkan ke wallet.`, "success");
  };

  // Membeli Rig Upgrade
  const buyUpgrade = (rigId) => {
    const target = inventory.find((i) => i.id === rigId);
    if (!target || balance < target.cost) {
      showToast("Baki BakaCoin tidak mencukupi!");
      return;
    }

    setBalance((prev) => +(prev - target.cost).toFixed(4));
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === rigId) {
          return {
            ...item,
            count: item.count + 1,
            cost: Math.round(item.cost * 1.35) // Harga naik 35% setiap pembelian
          };
        }
        return item;
      })
    );
    showToast(`Berjaya menaik taraf ${target.name}!`);
    addLog(`⚙️ UPGRADE: ${target.name} dipasang. +${target.hashBonus} MH/s ditambah.`, "success");
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!walletTarget || balance <= 0) return;
    const amount = balance;
    setBalance(0);
    showToast(`Berjaya pindah ${amount} BAKA ke ${walletTarget}!`);
    addLog(`🚀 TRANSFER: ${amount} $BAKA dihantar ke sasaran [${walletTarget}].`, "success");
    setWalletTarget("");
  };

  return (
    <div className="app-container">
      {toast && <div className="toast-bar">{toast}</div>}

      {/* Navbar */}
      <nav className="panel nav-header">
        <div className="logo-badge">
          <div className="logo-circle">
            <Coins size={22} color="#000" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>BakaCoin Mining Node</h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>Network: BakaChain Mainnet</p>
          </div>
        </div>

        <div className="node-status">
          <span className="pulse"></span>
          <span>Node Aktif (Ping: 12ms)</span>
        </div>
      </nav>

      {/* Status & Metrik Utama */}
      <div className="metrics-grid">
        <div className="panel metric-card">
          <div className="metric-title"><Coins size={14} color="var(--gold)" /> Jumlah BakaCoin ($BAKA)</div>
          <div className="metric-val mono" style={{ color: "var(--gold)" }}>
            {balance.toFixed(4)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            ≈ RM {(balance * 0.45).toFixed(2)} MYR
          </span>
        </div>

        <div className="panel metric-card">
          <div className="metric-title"><Zap size={14} color="var(--cyan)" /> Jumlah Kuasa (Hashrate)</div>
          <div className="metric-val mono" style={{ color: "var(--cyan)" }}>
            {totalHashrate} <span style={{ fontSize: "0.9rem" }}>MH/s</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            {inventory.reduce((a, b) => a + b.count, 0)} Rig perkakasan beroperasi
          </span>
        </div>

        <div className="panel metric-card">
          <div className="metric-title"><Activity size={14} color="var(--primary)" /> Blok Disahkan</div>
          <div className="metric-val mono" style={{ color: "var(--primary)" }}>
            {blocksFound}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Target Kesukaran: 0x0000FFFF
          </span>
        </div>
      </div>

      {/* Grid Perlombongan & Terminal */}
      <div className="mining-layout">
        {/* Unit Rig Utama */}
        <div className="panel rig-box">
          <h3 style={{ fontSize: "1.2rem" }}>Enjin Perlombongan BakaCrypt</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "0.3rem" }}>
            Tekan butang untuk melombong secara manual atau hidupkan rig automatik.
          </p>

          <button
            className={`mine-power-btn ${isMining ? "active" : ""}`}
            onClick={handleManualClick}
          >
            <Power size={48} />
            <span className="mono" style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              {isMining ? "MINING AKTIF" : "KLIK MINE"}
            </span>
          </button>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setIsMining(!isMining)}
              style={{
                background: isMining ? "var(--danger)" : "var(--primary)",
                border: "none",
                color: "#000",
                fontWeight: 800,
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <RefreshCw size={16} /> {isMining ? "Hentikan Generator" : "Jalankan Auto-Rig"}
            </button>
          </div>
        </div>

        {/* Terminal Langsung */}
        <div className="terminal-window">
          <div className="terminal-header">
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Terminal size={14} color="var(--cyan)" /> BakaNode Debug Console
            </span>
            <span className="mono">STREAMING LIVE</span>
          </div>

          <div className="terminal-logs mono">
            {logs.map((log) => (
              <div key={log.id} className="log-row">
                <span className="log-time">[{log.time}]</span>
                <span className={log.type === "success" ? "log-success" : log.type === "hash" ? "log-hash" : ""}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kedai Perkakasan Rig Upgrades */}
      <div className="shop-section">
        <h3 className="shop-title">
          <HardDrive size={20} color="var(--cyan)" /> Perkakasan Perlombongan (Rig Market)
        </h3>

        <div className="hardware-grid">
          {inventory.map((rig) => (
            <div key={rig.id} className="panel hardware-card">
              <div className="hw-info">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>{rig.name}</h4>
                  <span className="mono" style={{ background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem" }}>
                    Dimiliki: {rig.count}
                  </span>
                </div>
                <p>{rig.desc}</p>
                <div className="hw-stat mono">+{rig.hashBonus} MH/s setiap unit</div>
              </div>

              <button
                cl

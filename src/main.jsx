import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Zap, Cpu, HardDrive, Terminal as TermIcon, 
  Coins, Activity, Power, Volume2, VolumeX, 
  Flame, Gauge, Globe, Send, CheckCircle2 
} from "lucide-react";

// Senarai Rig Hardware Store
const INITIAL_RIGS = [
  { id: "cpu_tier1", name: "Threadripper CPU 64-Core", hash: 3.5, cost: 8, count: 0 },
  { id: "gpu_tier2", name: "RTX 4090 Dual OC Edition", hash: 22.0, cost: 35, count: 0 },
  { id: "asic_tier3", name: "BakaMiner S21 Hydro ASIC", hash: 95.0, cost: 180, count: 0 },
  { id: "quantum_tier4", name: "Quantum Cryo-Cluster 9000", hash: 420.0, cost: 750, count: 0 }
];

// Senarai Mining Pools
const POOLS = [
  { id: "my", name: "BakaMY - Cyberjaya Node", ping: "8ms", diff: "0x0000FFFF" },
  { id: "sg", name: "BakaSG - Jurong Datahub", ping: "16ms", diff: "0x0001A8F2" },
  { id: "jp", name: "BakaJP - Tokyo Cluster", ping: "62ms", diff: "0x0002F4B0" }
];

function App() {
  const [balance, setBalance] = useState(() => {
    const s = localStorage.getItem("bakacoin_bal_v2");
    return s ? parseFloat(s) : 0.0;
  });

  const [blocks, setBlocks] = useState(() => {
    const s = localStorage.getItem("bakacoin_blk_v2");
    return s ? parseInt(s) : 0;
  });

  const [rigs, setRigs] = useState(() => {
    const s = localStorage.getItem("bakacoin_rigs_v2");
    return s ? JSON.parse(s) : INITIAL_RIGS;
  });

  const [isMining, setIsMining] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPool, setSelectedPool] = useState(POOLS[0]);
  const [overclock, setOverclock] = useState(100); // 100% standard
  const [toast, setToast] = useState("");
  const [walletTarget, setWalletTarget] = useState("");

  const [logs, setLogs] = useState([
    { id: 1, time: "INIT", text: "Protokol BakaCrypt-256 diaktifkan. Sambungan selamat sedia.", color: "#10b981" }
  ]);

  // Audio synthesizer beeps menggunakan Web Audio API
  const playSound = (freq = 880, duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio tidak disokong atau belum ada interaksi pengguna
    }
  };

  const addLog = (text, color = "#94a3b8") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Date.now() + Math.random(), time, text, color }, ...prev.slice(0, 35)]);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Simpan data secara automatik
  useEffect(() => {
    localStorage.setItem("bakacoin_bal_v2", balance.toString());
    localStorage.setItem("bakacoin_blk_v2", blocks.toString());
    localStorage.setItem("bakacoin_rigs_v2", JSON.stringify(rigs));
  }, [balance, blocks, rigs]);

  // Kiraan Hashrate Semasa
  const baseHash = isMining ? 1.0 : 0.0;
  const rigHash = rigs.reduce((sum, item) => sum + (item.count * item.hash), 0);
  const totalHash = ((baseHash + rigHash) * (overclock / 100)).toFixed(1);

  // Status Suhu & Kipas berdasarkan Overclock & Hashrate
  const gpuTemp = Math.min(95, Math.floor(45 + (parseFloat(totalHash) * 0.15) + ((overclock - 100) * 0.5)));
  const fanRpm = Math.min(4200, Math.floor(1200 + (gpuTemp * 32)));

  // Gelung Perlombongan Utama (Mining Loop)
  useEffect(() => {
    const interval = setInterval(() => {
      const hashVal = parseFloat(totalHash);
      if (hashVal <= 0) return;

      // Hasil lombong setiap detik
      const earned = hashVal * 0.006;
      setBalance((b) => +(b + earned).toFixed(4));

      const nonce = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
      const blockHash = "0000" + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      // Kebarangkalian temui blok
      if (Math.random() < 0.28) {
        const reward = +(Math.random() * 0.8 + 0.2).toFixed(3);
        setBalance((b) => +(b + reward).toFixed(4));
        setBlocks((bl) => bl + 1);
        playSound(1200, 0.15);
        addLog(`💎 BLOK BARU DISAHKAN! Hash: ${blockHash.slice(0, 16)}... Ganjaran: +${reward} $BAKA`, "#f59e0b");
      } else {
        addLog(`[${selectedPool.id.toUpperCase()}] Nonce: 0x${nonce} -> Target disahkan (${totalHash} MH/s)`, "#06b6d4");
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [totalHash, selectedPool]);

  // Klik lombong manual
  const handleManualMining = () => {
    const reward = 0.08;
    setBalance((b) => +(b + reward).toFixed(4));
    playSound(650, 0.05);
    addLog(`⚡ MANUAL HIT: 0.08 $BAKA diproses ke mempool.`, "#10b981");
  };

  // Pembelian Naik Taraf Rig
  const buyRig = (rigId) => {
    const target = rigs.find((r) => r.id === rigId);
    if (!target || balance < target.cost) {
      showToast("Baki $BAKA tidak mencukupi!");
      return;
    }

    setBalance((b) => +(b - target.cost).toFixed(4));
    setRigs((prev) =>
      prev.map((r) => {
        if (r.id === rigId) {
          return { ...r, count: r.count + 1, cost: Math.round(r.cost * 1.35) };
        }
        return r;
      })
    );
    playSound(1400, 0.1);
    showToast(`Berjaya membeli ${target.name}!`);
    addLog(`⚙️ HARDWARE: ${target.name} dipasang (+${target.hash} MH/s).`, "#10b981");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!walletTarget.trim() || balance <= 0) return;
    const sent = balance;
    setBalance(0.0);
    showToast(`Berjaya pindah ${sent.toFixed(3)} $BAKA!`);
    addLog(`📤 PEMINDAHAN: ${sent.toFixed(3)} $BAKA dipindahkan ke ${walletTarget}.`, "#f59e0b");
    setWalletTarget("");
  };

  return (
    <div className="wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      {/* Top Navbar */}
      <header className="card topbar">
        <div className="brand-badge">
          <div className="brand-icon">
            <Coins size={24} color="#000" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>BakaCoin Mining Terminal</h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>
              Algoritma: BakaCrypt-256 (Stratum+TCP)
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          <button 
            className="pill-btn mono" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Buka/Tutup Audio"
          >
            {soundEnabled ? <Volume2 size={16} color="var(--primary)" /> : <VolumeX size={16} color="var(--muted)" />}
            <span>{soundEnabled ? "Audio ON" : "Muted"}</span>
          </button>

          <div className="pill-btn mono" style={{ border: "1px solid var(--primary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />
            <span>Pool: {selectedPool.ping}</span>
          </div>
        </div>
      </header>

      {/* Quick Status Metrics */}
      <section className="metrics">
        <div className="card">
          <div className="metric-title"><Coins size={14} color="var(--gold)" /> Baki BakaCoin ($BAKA)</div>
          <div className="metric-value mono" style={{ color: "var(--gold)" }}>
            {balance.toFixed(4)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            ≈ RM {(balance * 0.45).toFixed(2)} MYR
          </span>
        </div>

        <div className="card">
          <div className="metric-title"><Zap size={14} color="var(--cyan)" /> Jumlah Kuasa Hash</div>
          <div className="metric-value mono" style={{ color: "var(--cyan)" }}>
            {totalHash} <span style={{ fontSize: "0.9rem" }}>MH/s</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Efisiensi: 98.4%
          </span>
        </div>

        <div className="card">
          <div className="metric-title"><Activity size={14} color="var(--primary)" /> Blok Diterbitkan</div>
          <div className="metric-value mono" style={{ color: "var(--primary)" }}>
            {blocks}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Kesukaran: {selectedPool.diff}
          </span>
        </div>
      </section>

      {/* Dashboard Utama: Mining Trigger & Terminal */}
      <section className="dashboard-grid">
        {/* Unit Rig Utama */}
        <div className="card mining-rig">
          <h3 style={{ fontSize: "1.15rem" }}>Pusat Kawalan Rig Perlombongan</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            Tekan sfera teras untuk melombong secara pantas atau mulakan enjin berterusan.
          </p>

          <button
            className={`pulse-circle ${isMining ? "active" : ""}`}
            onClick={handleManualMining}
          >
            <Power size={50} />
            <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 800 }}>
              {isMining ? "RIG AKTIF" : "KLIK MINE"}
            </span>
          </button>

          <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setIsMining(!isMining)}
              style={{
                background: isMining ? "var(--red)" : "var(--primary)",
                border: "none",
                color: "#000",
                fontWeight: 800,
                padding: "0.6rem 1.4rem",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              {isMining ? "Hentikan Rig" : "Mulakan Auto-Mining"}
            </button>
          </div>

          {/* Telemetri Suhu & Overclocking */}
          <div className="telemetry mono">
            <div className="gauge">
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>SUHU RIG</span>
              <div style={{ color: gpuTemp > 80 ? "var(--red)" : "var(--primary)", fontWeight: 700 }}>
                {gpuTemp}°C
              </div>
            </div>

            <div className="gauge">
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>KIPAS GPU</span>
              <div style={{ color: "var(--cyan)", fontWeight: 700 }}>{fanRpm} RPM</div>
            </div>

            <div className="gauge">
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>CLOCK RATE</span>
              <div style={{ color: "var(--gold)", fontWeight: 700 }}>{overclock}%</div>
            </div>
          </div>
        </div>

        {/* Terminal Konsol Langsung */}
        <div className="terminal">
          <div className="term-top">
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <TermIcon size={14} color="var(--cyan)" /> Live Node Console
            </span>
            <span className="mono">ACTIVE POOL: {selectedPool.id.toUpperCase()}</span>
          </div>

          <div className="term-body mono">
            {logs.map((log) => (
              <div key={log.id} className="log-item">
                <span style={{ color: "var(--muted)", marginRight: "0.4rem" }}>[{log.time}]</span>
                <span style={{ color: log.color }}>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Mining Pool */}
      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
          <Globe size={18} color="var(--cyan)" /> Pilihan Rangkaian Pelayan (Stratum Mining Pools)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.8rem" }}>
          {POOLS.map((pool) => (
            <button
              key={pool.id}
              onClick={() => {
                setSelectedPool(pool);
                addLog(`🌐 POOL SWITCH: Bersambung ke ${pool.name} (${pool.ping}).`, "#06b6d4");
              }}
              className="card"
              style={{
                cursor: "pointer",
                textAlign: "left",
                border: selectedPool.id === pool.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                background: selectedPool.id === pool.id ? "rgba(16, 185, 129, 0.1)" : "rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{pool.name}</div>
              <div className="mono" style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                Latensi: <span style={{ color: "var(--primary)" }}>{pool.ping}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Kedai Perkakasan Hardware */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <HardDrive size={20} color="var(--primary)" /> Kedai Naik Taraf Rig (Hardware Market)
        </h3>
        <div className="market-grid">
          {rigs.map((rig) => (
            <div key={rig.id} className="card item-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.98rem" }}>{rig.name}</h4>
                  <span className="mono" style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                    x{rig.count}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: "0.82rem", color: "var(--cyan)", marginTop: "0.4rem" }}>
                  +{rig.hash} MH/s kuasa lombong
                </div>
              </div>

              <button
                className="btn-buy-upgrade mono"
                disabled={balance < rig.cost}
                onClick={() => buyRig(rig.id)}
              >
                <span>Beli Unit</span>
                <span>{rig.cost} $BAKA</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pemindahan Dompet */}
      <section className="card">
        <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <Send size={18} color="var(--gold)" /> Pindahkan $BAKA Ke Akaun Pemain
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
          Keluarkan BakaCoin yang berjaya dilombong ke GamerTag Bedrock anda.
        </p>

        <form onSubmit={handleWithdraw} style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <input
            type="text"
            className="mono"
            style={{
              flex: 1,
              minWidth: "220px",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "#fff",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              outline: "none"
            }}
            placeholder="Minecraft GamerTag / Alamat Dompet"
            value={walletTarget}
            onChange={(e) => setWalletTarget(e.target.value)}
            required
          />
          <button
            type="submit"
            className="mono"
            style={{
              background: "linear-gradient(135deg, var(--gold), #d97706)",
              border: "none",
              color: "#000",
              fontWeight: 800,
              padding: "0.75rem 1.4rem",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Tebus Baki ({balance.toFixed(2)} BAKA)
          </button>
        </form>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

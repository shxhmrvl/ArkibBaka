import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Shield, Zap, Gift, User, LogIn, LogOut, UserPlus, 
  Copy, PlusCircle, Ticket, MessageCircle, Lock, Unlock, 
  Clock, CheckCircle2, X, Coins, Crown, Package, Key, 
  ThumbsUp, CalendarCheck, Star, AlertCircle, Info, Layers, MapPin
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaCrew Store (RM5)")}`;

const SERVER_IP = "baka.skyes.me";
const SERVER_PORT = "19205";
const BEDROCK_VOTE_URL = "https://minecraftpocket-servers.com/";

const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const genPin = () => `BK5-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

// Senarai Hadiah & Item Kedai Server BakaCrew
const STORE_ITEMS = [
  {
    id: "rank_vip",
    name: "Rank VIP Bedrock",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 15,
    icon: "Crown",
    desc: "Akses /fly di Plot, awalan tag [VIP] emas, dan 5x Claim Tanah.",
    command: (ign) => `/tag "${ign}" add VIP`
  },
  {
    id: "rank_mvp",
    name: "Rank MVP BakaLegend",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 35,
    icon: "Shield",
    desc: "Semua kelebihan VIP + akses /feed, /heal, dan kit eksklusif.",
    command: (ign) => `/tag "${ign}" add MVP`
  },
  {
    id: "kit_netherite",
    name: "Kit Netherite God",
    category: "Kits",
    tagClass: "tag-kit",
    price: 10,
    icon: "Package",
    desc: "Set Netherite Armor (Protection IV + Unbreaking III) & Pedang God.",
    command: (ign) => `/give "${ign}" netherite_sword 1 0 {"minecraft:item_lock":{"mode":"lock_in_inventory"}}`
  },
  {
    id: "kit_elytra",
    name: "Pek Sayap Elytra",
    category: "Kits",
    tagClass: "tag-kit",
    price: 8,
    icon: "Zap",
    desc: "1x Sayap Elytra (Mending + Unbreaking III) & 64x Bunga Api.",
    command: (ign) => `/give "${ign}" elytra 1`
  },
  {
    id: "money_50k",
    name: "Scoreboard $50K",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 5,
    icon: "Coins",
    desc: "$50,000 dimasukkan terus ke Scoreboard 'money' akaun anda.",
    command: (ign) => `/scoreboard players add "${ign}" money 50000`
  },
  {
    id: "money_250k",
    name: "Scoreboard $250K",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 20,
    icon: "Coins",
    desc: "$250,000 Scoreboard Money untuk sewa plot spawn dan berdagang.",
    command: (ign) => `/scoreboard players add "${ign}" money 250000`
  },
  {
    id: "key_legend",
    name: "3x Kunci Crate",
    category: "Crates",
    tagClass: "tag-crate",
    price: 6,
    icon: "Key",
    desc: "Kunci peti misteri di Spawn untuk cabutan senjata langka.",
    command: (ign) => `/give "${ign}" tripwire_hook 3 0 {"minecraft:can_place_on":{"blocks":["chest"]}}`
  }
];

function App() {
  const [usersDb, setUsersDb] = useState(() => load("bc_users_db", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("bc_active_user", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  const [pinDb, setPinDb] = useState(() => load("bc_pins", [{ code: "BK5-9988-1122", value: 5, status: "AVAILABLE" }]));
  const [claimsList, setClaimsList] = useState(() => load("bc_claims", []));

  const [serverOnline, setServerOnline] = useState(true);
  const [playerCount, setPlayerCount] = useState({ online: 8, max: 30 });
  const [activeCategory, setActiveCategory] = useState("Semua");

  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", ign: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");

  const [buyItemModal, setBuyItemModal] = useState(null);
  const [claimIgn, setClaimIgn] = useState("");

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch(`https://api.mcsrvstat.us/bedrock/3/${SERVER_IP}:${SERVER_PORT}`)
      .then((res) => res.json())
      .then((data) => {
        setServerOnline(data.online);
        if (data.players) setPlayerCount({ online: data.players.online || 0, max: data.players.max || 30 });
      })
      .catch(() => {});
  }, []);

  const updateUser = (fields) => {
    if (!currentUser) return;
    const updated = usersDb.map((u) => u.username === currentUser.username ? { ...u, ...fields } : u);
    setUsersDb(updated);
    save("bc_users_db", updated);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    const ign = authForm.ign.trim();
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila lengkapkan maklumat!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Nama pengguna ini sudah berdaftar!" });
      }
      const newUser = { username: u, password: p, gamerTag: ign || u, balanceRM: 0, lastDaily: null, streak: 0, lastVote: null };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("bc_users_db", updated);
      setCurrentUsername(u);
      save("bc_active_user", u);
      setShowAuth(false);
      showToast(`Selamat datang, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Nama pengguna atau kata laluan tidak tepat!" });
      setCurrentUsername(found.username);
      save("bc_active_user", found.username);
      setShowAuth(false);
      showToast("Log masuk berjaya!");
    }
    setAuthForm({ user: "", pass: "", ign: "", err: "" });
  };

  // Ganjaran Harian RM 0.05
  const handleDailyClaim = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();
    if (currentUser.lastDaily === today) {
      return showToast("Ganjaran harian telah diambil. Sila kembali esok.");
    }
    updateUser({
      balanceRM: +(currentUser.balanceRM + 0.05).toFixed(2),
      lastDaily: today,
      streak: (currentUser.streak || 0) + 1
    });
    showToast("Ganjaran harian berjaya diambil (+RM 0.05)!");
  };

  // Undian Bedrock RM 0.25
  const handleBedrockVote = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();
    if (currentUser.lastVote === today) {
      return showToast("Undian telah dibuat untuk hari ini. Sila undi lagi esok.");
    }
    window.open(BEDROCK_VOTE_URL, "_blank");
    updateUser({
      balanceRM: +(currentUser.balanceRM + 0.25).toFixed(2),
      lastVote: today
    });
    showToast("Terima kasih mengundi! Bonus +RM 0.25 dikreditkan.");
  };

  const handleRedeemPin = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const code = inputPin.trim().toUpperCase();
    const target = pinDb.find((p) => p.code.toUpperCase() === code);
    if (!target) return showToast("Kod PIN tidak sah.");
    if (target.status === "USED") return showToast(`PIN telah ditebus oleh ${target.usedBy}.`);

    updateUser({ balanceRM: +(currentUser.balanceRM + target.value).toFixed(2) });
    const updatedPins = pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p);
    setPinDb(updatedPins);
    save("bc_pins", updatedPins);
    setInputPin("");
    setShowRedeem(false);
    showToast(`+RM ${target.value}.00 berjaya dimasukkan ke dompet.`);
  };

  const handleConfirmBuy = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const ign = (claimIgn || currentUser.gamerTag || "").trim();
    if (!ign) return showToast("Sila masukkan GamerTag Minecraft anda!");

    if (currentUser.balanceRM < buyItemModal.price) {
      return showToast("Baki tidak cukup. Sila beli PIN di WhatsApp Admin.");
    }

    updateUser({ balanceRM: +(currentUser.balanceRM - buyItemModal.price).toFixed(2) });

    const newClaim = {
      id: Date.now(),
      username: currentUser.username,
      gamerTag: ign,
      itemName: buyItemModal.name,
      price: buyItemModal.price,
      command: buyItemModal.command(ign),
      status: "PENDING",
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    const updatedClaims = [newClaim, ...claimsList];
    setClaimsList(updatedClaims);
    save("bc_claims", updatedClaims);

    setBuyItemModal(null);
    setClaimIgn("");
    showToast(`Tebusan ${buyItemModal.name} berjaya dihantar.`);
  };

  const handleApproveClaim = (id) => {
    const updated = claimsList.map((c) => c.id === id ? { ...c, status: "SELESAI" } : c);
    setClaimsList(updated);
    save("bc_claims", updated);
    showToast("Penebusan ditandakan selesai.");
  };

  const todayStr = new Date().toDateString();
  const isVotedToday = currentUser?.lastVote === todayStr;
  const isDailyClaimed = currentUser?.lastDaily === todayStr;

  const filteredItems = activeCategory === "Semua" 
    ? STORE_ITEMS 
    : STORE_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <div className="container">
      {toast && <div className="toast mono">{toast}</div>}

      {/* Bar Navigasi Mobile-First */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon"><Server size={18} /></div>
          <div className="brand-text">
            <h2>BakaCrew Hub</h2>
            <p className="mono">Bedrock Dedicated</p>
          </div>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={12} /> {currentUser.gamerTag || currentUser.username}
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeem(true)}>
                <Ticket size={12} /> PIN
              </button>
              <button className="btn-pill btn-logout mono" onClick={() => { setCurrentUsername(""); save("bc_active_user", ""); showToast("Log keluar selesai."); }} title="Keluar">
                <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                Log Masuk
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                Daftar
              </button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)} title="Pusat Admin">
            {isAdmin ? <Unlock size={12} /> : <Lock size={12} />} Admin
          </button>
        </div>
      </nav>

      {/* Maklumat Sambungan Pelayan */}
      <div className="server-bar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: serverOnline ? "var(--green)" : "var(--red)", boxShadow: serverOnline ? "0 0 6px var(--green)" : "none" }}></span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>BakaCrew SMP</span>
          </div>
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {playerCount.online}/{playerCount.max} Online
          </span>
        </div>

        <div className="conn-badges mono">
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>IP:</span>
            <strong style={{ color: "var(--green)" }}>{SERVER_IP}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_IP); showToast("IP disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={12} /></button>
          </div>
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>Port:</span>
            <strong style={{ color: "var(--cyan)" }}>{SERVER_PORT}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_PORT); showToast("Port disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={12} /></button>
          </div>
        </div>
      </div>

      {/* Grid 3 Petak: Dompet, Daily Check-In & Bedrock Vote */}
      <div className="dash-grid">
        {/* Petak Dompet */}
        <div className="card dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono stat-label">Baki Dompet</span>
            <Coins size={14} color="var(--green)" />
          </div>
          <div className="val-big mono" style={{ color: "var(--green)" }}>
            RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}
          </div>
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.6rem" }}>
            <button className="btn-pill btn-redeem mono" style={{ flex: 1, justifyContent: "center" }} onClick={() => currentUser ? setShowRedeem(true) : setShowAuth(true)}>
              <Ticket size={12} /> Tebus PIN
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ flex: 1, justifyContent: "center" }}>
              <MessageCircle size={12} /> Beli PIN
            </a>
          </div>
        </div>

        {/* Petak Daily Streak (RM 0.05) */}
        <div className="card dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.68rem", color: "var(--gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <CalendarCheck size={12} /> GANJARAN HARIAN
            </span>
            <span className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Streak: {currentUser?.streak || 0}H</span>
          </div>
          <div className="streak-row mono">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className={`streak-box ${(currentUser?.streak || 0) >= day ? "done" : ""}`}>
                H{day}
              </div>
            ))}
          </div>
          <button 
            className="btn-buy-item mono" 
            style={{ 
              marginTop: "0.6rem", 
              background: isDailyClaimed ? "#1e293b" : "linear-gradient(135deg, var(--gold), #d97706)", 
              color: isDailyClaimed ? "var(--text-muted)" : "#000",
              cursor: isDailyClaimed ? "not-allowed" : "pointer"
            }}
            onClick={handleDailyClaim}
            disabled={isDailyClaimed}
          >
            <Star size={12} /> {isDailyClaimed ? "Selesai Hari Ini" : "Ambil RM 0.05"}
          </button>
        </div>

        {/* Petak Bedrock Vote (+RM 0.25) */}
        <div className="card dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.68rem", color: "var(--cyan)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <ThumbsUp size={12} /> UNDI PELAYAN
            </span>
            <span className="mono" style={{ fontSize: "0.65rem", color: isVotedToday ? "var(--green)" : "var(--gold)" }}>
              {isVotedToday ? "Selesai" : "Sedia"}
            </span>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem", lineHeight: 1.35 }}>
            Sokong server di portal Bedrock & tuntut kredit percuma sekali sehari.
          </p>
          <button 
            className="btn-buy-item mono" 
            style={{ 
              marginTop: "0.6rem", 
              background: isVotedToday ? "#1e293b" : "linear-gradient(135deg, var(--cyan), #0284c7)", 
              color: isVotedToday ? "var(--text-muted)" : "#fff",
              cursor: isVotedToday ? "not-allowed" : "pointer"
            }}
            onClick={handleBedrockVote}
            disabled={isVotedToday}
          >
            <ThumbsUp size={12} /> {isVotedToday ? "Selesai Hari Ini" : "Undi & Tuntut (+RM0.25)"}
          </button>
        </div>
      </div>

      {/* KEDAI ITEM: SUSUN ATUR GRID 2 LAJUR MESRA MOBILE */}
      <div>
        <div className="store-header">
          <h3>
            <Gift size={16} color="var(--green)" /> Kedai Hadiah & Pangkat
          </h3>

          {/* Swipeable Filter Pills */}
          <div className="filter-group mono">
            {["Semua", "Ranks", "Kits", "Scoreboard", "Crates"].map((cat) => (
              <button 
                key={cat} 
                className={`btn-filter ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid on Mobile */}
        <div className="store-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <div>
                <div className="item-top">
                  <div className="item-icon-box">
                    {item.icon === "Crown" && <Crown size={16} color="var(--gold)" />}
                    {item.icon === "Shield" && <Shield size={16} color="var(--cyan)" />}
                    {item.icon === "Package" && <Package size={16} color="var(--green)" />}
                    {item.icon === "Zap" && <Zap size={16} color="var(--gold)" />}
                    {item.icon === "Coins" && <Coins size={16} color="var(--green)" />}
                    {item.icon === "Key" && <Key size={16} color="#c084fc" />}
                  </div>
                  <span className={`item-tag mono ${item.tagClass}`}>{item.category}</span>
                </div>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
              </div>

              <div className="item-bottom">
                <div className="item-price-row">
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Harga:</span>
                  <span className="mono item-price-val">RM {item.price.toFixed(2)}</span>
                </div>
                <button 
                  className="btn-buy-item mono"
                  onClick={() => {
                    if (!currentUser) return setShowAuth(true);
                    setClaimIgn(currentUser.gamerTag || "");
                    setBuyItemModal(item);
                  }}
                >
                  <Gift size={11} /> Tebus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAKLUMAT PELAYAN BAKACREW (DATA INTERNET) */}
      <div className="server-info-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <Info size={16} color="var(--cyan)" />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800 }}>Informasi Pelayan BakaCrew SMP</h3>
        </div>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          <strong>BakaCrew</strong> ialah <em>Bedrock Dedicated Server (BDS)</em> berteraskan komuniti Malaysia yang bertujuan menyatukan pemain Bedrock tempatan di bawah satu dunia SMP yang stabil dan mesra.
        </p>

        <div className="info-stats-grid">
          <div className="info-stat-box">
            <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }} className="mono">PLATFORM</span>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--green)", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Layers size={12} /> Bedrock Dedicated
            </div>
          </div>
          <div className="info-stat-box">
            <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }} className="mono">LOKASI</span>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--cyan)", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <MapPin size={12} /> Malaysia (93%+ Uptime)
            </div>
          </div>
          <div className="info-stat-box">
            <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }} className="mono">EKONOMI</span>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--gold)", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Coins size={12} /> Scoreboard 'money'
            </div>
          </div>
          <div className="info-stat-box">
            <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }} className="mono">DAFTAR OLEH</span>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#fff", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <User size={12} /> Lightinityy & Staff
            </div>
          </div>
        </div>

        <div className="lore-tags mono">
          {["SMP", "Semi-Vanilla", "Economy", "Land Claiming", "Spawn Market", "Roleplay"].map((t) => (
            <span key={t} className="lore-tag">#{t}</span>
          ))}
        </div>
      </div>

      {/* Rekod Penebusan Akaun (Kad Mudah Alih) */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.65rem" }}>
          <Clock size={14} color="var(--cyan)" /> Rekod Penebusan Akaun Anda
        </h4>

        <div className="mobile-claims-list mono">
          {claimsList.filter((c) => currentUser && c.username === currentUser.username).length === 0 ? (
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
              {currentUser ? "Belum ada rekod penebusan." : "Sila log masuk untuk melihat rekod."}
            </p>
          ) : (
            claimsList.filter((c) => currentUser && c.username === currentUser.username).map((c) => (
              <div key={c.id} className="claim-item-row">
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.76rem" }}>{c.itemName}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.64rem" }}>{c.gamerTag} • {c.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--green)", fontWeight: 800, fontSize: "0.76rem" }}>RM {c.price.toFixed(2)}</div>
                  <span className={`badge-status ${c.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{c.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Sahkan Pembelian Item */}
      {buyItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <h3 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--green)" }}>
                <Gift size={16} /> Tebus: {buyItemModal.name}
              </h3>
              <button onClick={() => setBuyItemModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleConfirmBuy}>
              <div style={{ marginBottom: "0.8rem" }}>
                <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>MINECRAFT GAMERTAG / IGN</label>
                <input 
                  type="text" 
                  className="input-styled mono" 
                  placeholder="Cth: SteveMY" 
                  value={claimIgn} 
                  onChange={(e) => setClaimIgn(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.65rem", borderRadius: "6px", marginBottom: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span>Harga:</span>
                  <strong className="mono" style={{ color: "#fff" }}>RM {buyItemModal.price.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>Baki Dompet:</span>
                  <strong className="mono" style={{ color: "var(--green)" }}>RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}</strong>
                </div>
              </div>

              <button type="submit" className="btn-buy-item mono" style={{ padding: "0.6rem" }}>
                Sahkan Penebusan (RM {buyItemModal.price.toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Log Masuk / Daftar */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid var(--border-ui)", marginBottom: "0.85rem" }} className="mono">
              <button style={{ flex: 1, padding: "0.5rem", background: "none", border: "none", color: authTab === "login" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "login" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer", fontSize: "0.76rem" }} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button style={{ flex: 1, padding: "0.5rem", background: "none", border: "none", color: authTab === "register" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "register" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer", fontSize: "0.76rem" }} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>

            {authForm.err && (
              <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.5rem", borderRadius: "6px", fontSize: "0.72rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <AlertCircle size={12} /> {authForm.err}
              </div>
            )}

            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: "0.65rem" }}>
                <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Nama pengguna" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>

              {authTab === "register" && (
                <div style={{ marginBottom: "0.65rem" }}>
                  <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>BEDROCK GAMERTAG</label>
                  <input type="text" className="input-styled mono" placeholder="Nama dalam Minecraft" value={authForm.ign} onChange={(e) => setAuthForm({ ...authForm, ign: e.target.value })} required />
                </div>
              )}

              <div style={{ marginBottom: "0.9rem" }}>
                <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="Kata laluan" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>

              <button type="submit" className="btn-buy-item mono" style={{ padding: "0.6rem" }}>
                {authTab === "login" ? "Log Masuk" : "Daftar Pemain"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tebus PIN */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--green)" }}><Ticket size={16} /> Tebus PIN Tambah Nilai</h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.55rem", marginBottom: "0.85rem" }}>
              <MessageCircle size={13} /> Beli PIN di WhatsApp (018-3915460)
            </a>
            <form onSubmit={handleRedeemPin}>
              <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>KOD PIN (BK5-XXXX-XXXX)</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy-item mono" style={{ marginTop: "0.85rem", padding: "0.6rem" }}>Tebus Sekarang (+RM 5.00)</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin (PIN 200200) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)" }}><Shield size={16} /> Pusat Kawalan Pentadbir</h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN tidak sah!"); }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>Masukkan kod PIN Pentadbir:</p>
                <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "4px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                <button type="submit" className="btn-buy-item mono" style={{ background: "var(--gold)", color: "#000", marginTop: "0.85rem", padding: "0.6rem" }}>Buka Akses Admin</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* Permintaan Tebusan Hadiah */}
                <div style={{ background: "#060913", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-ui)" }}>
                  <h4 style={{ fontSize: "0.82rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                    <Gift size={13} /> Permintaan Tebusan ({claimsList.length})
                  </h4>
                  <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                    {claimsList.length === 0 ? <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", padding: "0.6rem" }}>Tiada tebusan.</p> : claimsList.map((req) => (
                      <div key={req.id} style={{ background: "#0b1120", border: "1px solid var(--border-ui)", padding: "0.6rem", borderRadius: "6px", marginBottom: "0.4rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem" }}>
                          <strong style={{ color: "#fff" }}>{req.gamerTag} ({req.itemName})</strong>
                          <span className={`badge-status ${req.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{req.status}</span>
                        </div>
                        <div className="command-snippet mono">
                          <span>{req.command}</span>
                          <button onClick={() => { navigator.clipboard.writeText(req.command); showToast("Command disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>
                            <Copy size={11} />
                          </button>
                        </div>
                        {req.status === "PENDING" && (
                          <button onClick={() => handleApproveClaim(req.id)} className="btn-pill btn-redeem mono" style={{ marginTop: "0.4rem", width: "100%", justifyContent: "center", fontSize: "0.68rem" }}>
                            <CheckCircle2 size={11} /> Tandakan Selesai
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penjana PIN RM5 */}
                <div style={{ background: "#060913", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <h4 style={{ fontSize: "0.82rem", color: "var(--green)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Ticket size={13} /> Jana PIN RM 5
                    </h4>
                    <button onClick={() => { const code = genPin(); const up = [{ code, value: 5, status: "AVAILABLE" }, ...pinDb]; setPinDb(up); save("bc_pins", up); showToast(`PIN: ${code}`); }} className="btn-pill btn-redeem mono" style={{ fontSize: "0.68rem" }}>
                      <PlusCircle size={11} /> + Jana PIN
                    </button>
                  </div>
                  <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                    {pinDb.map((pin, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0.2rem", borderBottom: "1px solid var(--border-ui)", fontSize: "0.72rem" }} className="mono">
                        <span><strong>{pin.code}</strong> (RM{pin.value})</span>
                        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                          <span className={`badge-status ${pin.status === "AVAILABLE" ? "badge-done" : "badge-pending"}`}>{pin.status === "AVAILABLE" ? "BELUM" : "DITEBUS"}</span>
                          {pin.status === "AVAILABLE" && (
                            <button onClick={() => { navigator.clipboard.writeText(pin.code); showToast("PIN disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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

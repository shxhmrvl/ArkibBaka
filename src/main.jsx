import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Shield, Zap, Gift, User, LogIn, LogOut, UserPlus, 
  Copy, PlusCircle, Ticket, MessageCircle, Lock, Unlock, 
  Clock, CheckCircle2, X, Coins, Crown, Package, Key, 
  ThumbsUp, CalendarCheck, Star, AlertCircle, Info, Globe, 
  Check, Layers, BookOpen, MapPin
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
    desc: "Akses arahan /fly di kawasan Plot, awalan tag [VIP] emas, dan 5x Claim Tanah tambahan.",
    command: (ign) => `/tag "${ign}" add VIP`
  },
  {
    id: "rank_mvp",
    name: "Rank MVP BakaLegend",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 35,
    icon: "Shield",
    desc: "Semua kelebihan VIP + akses /feed, /heal cooldown rendah, dan kit bulanan eksklusif.",
    command: (ign) => `/tag "${ign}" add MVP`
  },
  {
    id: "kit_netherite",
    name: "Kit Netherite Full God",
    category: "Kits",
    tagClass: "tag-kit",
    price: 10,
    icon: "Package",
    desc: "1 Set Lengkap Netherite Armor (Protection IV + Unbreaking III) & Pedang God.",
    command: (ign) => `/give "${ign}" netherite_sword 1 0 {"minecraft:item_lock":{"mode":"lock_in_inventory"}}`
  },
  {
    id: "kit_elytra",
    name: "Pek Penerbangan Elytra",
    category: "Kits",
    tagClass: "tag-kit",
    price: 8,
    icon: "Zap",
    desc: "1x Sayap Elytra (Mending + Unbreaking III) dan 64x Bunga Api Roket.",
    command: (ign) => `/give "${ign}" elytra 1`
  },
  {
    id: "money_50k",
    name: "Scoreboard $50,000 Money",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 5,
    icon: "Coins",
    desc: "$50,000 dimasukkan terus ke baki Scoreboard objektif 'money' akaun anda.",
    command: (ign) => `/scoreboard players add "${ign}" money 50000`
  },
  {
    id: "money_250k",
    name: "Scoreboard $250,000 Money",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 20,
    icon: "Coins",
    desc: "$250,000 Scoreboard Money untuk membeli plot kedai spawn dan berdagang.",
    command: (ign) => `/scoreboard players add "${ign}" money 250000`
  },
  {
    id: "key_legend",
    name: "3x Kunci Crate Legendary",
    category: "Crates",
    tagClass: "tag-crate",
    price: 6,
    icon: "Key",
    desc: "Kunci peti misteri di Spawn untuk cabutan senjata langka dan kosmetik.",
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

  // Ambil data status pelayan Bedrock live dari API
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
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila lengkapkan semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Nama pengguna ini telah berdaftar!" });
      }
      const newUser = { 
        username: u, 
        password: p, 
        gamerTag: ign || u, 
        balanceRM: 0, 
        lastDaily: null, 
        streak: 0,
        lastVote: null 
      };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("bc_users_db", updated);
      setCurrentUsername(u);
      save("bc_active_user", u);
      setShowAuth(false);
      showToast(`Selamat datang ke BakaCrew, ${u}!`);
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

    const newStreak = (currentUser.streak || 0) + 1;
    const rewardBonus = 0.05;

    updateUser({
      balanceRM: +(currentUser.balanceRM + rewardBonus).toFixed(2),
      lastDaily: today,
      streak: newStreak
    });

    showToast(`Ganjaran harian berjaya diambil (+RM ${rewardBonus.toFixed(2)})!`);
  };

  // Undian Bedrock RM 0.25 Sehari Sekali
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

    showToast("Terima kasih mengundi! Bonus +RM 0.25 telah dikreditkan.");
  };

  const handleRedeemPin = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const code = inputPin.trim().toUpperCase();
    const target = pinDb.find((p) => p.code.toUpperCase() === code);

    if (!target) return showToast("Kod PIN tidak sah.");
    if (target.status === "USED") return showToast(`PIN telah digunakan oleh ${target.usedBy}.`);

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
      return showToast("Baki dompet tidak mencukupi. Sila beli PIN di WhatsApp Admin.");
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
      time: new Date().toLocaleTimeString()
    };

    const updatedClaims = [newClaim, ...claimsList];
    setClaimsList(updatedClaims);
    save("bc_claims", updatedClaims);

    setBuyItemModal(null);
    setClaimIgn("");
    showToast(`Permintaan tebusan item ${buyItemModal.name} telah dihantar.`);
  };

  const handleApproveClaim = (id) => {
    const updated = claimsList.map((c) => c.id === id ? { ...c, status: "SELESAI" } : c);
    setClaimsList(updated);
    save("bc_claims", updated);
    showToast("Penebusan ditandakan sebagai selesai.");
  };

  const todayStr = new Date().toDateString();
  const isVotedToday = currentUser?.lastVote === todayStr;
  const isDailyClaimed = currentUser?.lastDaily === todayStr;

  const filteredItems = activeCategory === "Semua" 
    ? STORE_ITEMS 
    : STORE_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <div className="container">
      {toast && <div className="toast">{toast}</div>}

      {/* Bar Navigasi */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon"><Server size={22} /></div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>BakaCrew Hub</h2>
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--green)" }}>Minecraft Bedrock Dedicated</p>
          </div>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={14} /> {currentUser.gamerTag || currentUser.username}
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeem(true)}>
                <Ticket size={14} /> Tebus PIN
              </button>
              <button className="btn-pill btn-logout mono" onClick={() => { setCurrentUsername(""); save("bc_active_user", ""); showToast("Log keluar selesai."); }}>
                <LogOut size={14} /> Keluar
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                <LogIn size={14} /> Log Masuk
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                <UserPlus size={14} /> Daftar
              </button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />} Admin (200200)
          </button>
        </div>
      </nav>

      {/* Maklumat Sambungan Pelayan */}
      <div className="server-bar">
        <div>
          <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: serverOnline ? "var(--green)" : "var(--red)", boxShadow: serverOnline ? "0 0 8px var(--green)" : "none" }}></span>
            Pelayan Minecraft Bedrock SMP
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {serverOnline ? `${playerCount.online} / ${playerCount.max} Pemain Aktif Dalam Talian` : "Pelayan Sedang Diselenggara"}
          </p>
        </div>

        <div className="conn-badges mono">
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>IP:</span>
            <strong style={{ color: "var(--green)" }}>{SERVER_IP}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_IP); showToast("Alamat IP disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={13} /></button>
          </div>
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>Port:</span>
            <strong style={{ color: "var(--cyan)" }}>{SERVER_PORT}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_PORT); showToast("Nombor Port disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={13} /></button>
          </div>
        </div>
      </div>

      {/* Grid 3 Petak: Dompet, Daily Check-In & Bedrock Vote */}
      <div className="dash-grid">
        {/* Petak Dompet */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Baki Dompet Simpanan</span>
            <Coins size={16} color="var(--green)" />
          </div>
          <div className="val-big mono" style={{ color: "var(--green)" }}>
            RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            Beli PIN daripada WhatsApp Admin untuk menambah baki.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
            <button className="btn-pill btn-redeem mono" style={{ fontSize: "0.75rem" }} onClick={() => currentUser ? setShowRedeem(true) : setShowAuth(true)}>
              <Ticket size={13} /> Masukkan PIN
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ fontSize: "0.75rem" }}>
              <MessageCircle size={13} /> Beli PIN (018-3915460)
            </a>
          </div>
        </div>

        {/* Petak Daily Streak (RM 0.05) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CalendarCheck size={14} /> GANJARAN HARIAN
            </span>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Streak: {currentUser?.streak || 0} Hari</span>
          </div>
          <div className="val-big" style={{ fontSize: "1.15rem", marginTop: "0.3rem" }}>
            Tuntut RM 0.05 Setiap Hari
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
              marginTop: "0.8rem", 
              background: isDailyClaimed ? "#1e293b" : "linear-gradient(135deg, var(--gold), #d97706)", 
              color: isDailyClaimed ? "var(--text-muted)" : "#000",
              cursor: isDailyClaimed ? "not-allowed" : "pointer"
            }}
            onClick={handleDailyClaim}
            disabled={isDailyClaimed}
          >
            <Star size={14} /> {isDailyClaimed ? "Telah Diambil Hari Ini" : "Ambil Ganjaran (RM 0.05)"}
          </button>
        </div>

        {/* Petak Bedrock Vote (+RM 0.25) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--cyan)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ThumbsUp size={14} /> UNDIAN PELAYAN
            </span>
            <span className="mono" style={{ fontSize: "0.72rem", color: isVotedToday ? "var(--green)" : "var(--gold)" }}>
              {isVotedToday ? "Selesai Hari Ini" : "Sedia Mengundi"}
            </span>
          </div>
          <div className="val-big" style={{ fontSize: "1.15rem", marginTop: "0.3rem" }}>
            Undi Pelayan (+RM 0.25)
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem", lineHeight: 1.4 }}>
            Sokong pelayan di senarai Bedrock untuk menerima bonus tambahan harian.
          </p>
          <button 
            className="btn-buy-item mono" 
            style={{ 
              marginTop: "0.8rem", 
              background: isVotedToday ? "#1e293b" : "linear-gradient(135deg, var(--cyan), #0284c7)", 
              color: isVotedToday ? "var(--text-muted)" : "#fff",
              cursor: isVotedToday ? "not-allowed" : "pointer"
            }}
            onClick={handleBedrockVote}
            disabled={isVotedToday}
          >
            <ThumbsUp size={14} /> {isVotedToday ? "Selesai Untuk Hari Ini" : "Undi & Tuntut (+RM 0.25)"}
          </button>
        </div>
      </div>

      {/* KEDAI ITEM: SUSUN ATUR GRID 2 LAJUR PADA TELEFON PINTAR */}
      <div>
        <div className="store-header">
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Gift size={18} color="var(--green)" /> Kedai Hadiah & Pangkat Pelayan
            </h3>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Pilih item, pangkat, atau duit Scoreboard untuk ditebus terus ke pelayan Bedrock anda.
            </p>
          </div>

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
              <span className={`item-tag mono ${item.tagClass}`}>{item.category}</span>
              <div>
                <div className="item-icon-box">
                  {item.icon === "Crown" && <Crown size={18} color="var(--gold)" />}
                  {item.icon === "Shield" && <Shield size={18} color="var(--cyan)" />}
                  {item.icon === "Package" && <Package size={18} color="var(--green)" />}
                  {item.icon === "Zap" && <Zap size={18} color="var(--gold)" />}
                  {item.icon === "Coins" && <Coins size={18} color="var(--green)" />}
                  {item.icon === "Key" && <Key size={18} color="#c084fc" />}
                </div>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Harga:</span>
                  <span className="mono" style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--green)" }}>
                    RM {item.price.toFixed(2)}
                  </span>
                </div>
                <button 
                  className="btn-buy-item mono"
                  onClick={() => {
                    if (!currentUser) return setShowAuth(true);
                    setClaimIgn(currentUser.gamerTag || "");
                    setBuyItemModal(item);
                  }}
                >
                  <Gift size={13} /> Tebus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEKSYEN MAKLUMAT & INFORMASI PELAYAN BAKACREW (DATA INTERNET) */}
      <div className="server-info-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Info size={18} color="var(--cyan)" />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Mengenai Pelayan BakaCrew SMP</h3>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <strong>BakaCrew</strong> merupakan sebuah <em>Bedrock Dedicated Server (BDS)</em> berteraskan komuniti yang diasaskan di <strong>Malaysia</strong>. Pelayan ini diwujudkan khas dengan wawasan menyatukan seluruh komuniti pemain Minecraft Bedrock tempatan di bawah satu dunia kelangsungan hidup (*Survival Multiplayer - SMP*) yang harmoni, stabil, dan berprestasi tinggi.
        </p>

        {/* 4 Kotak Statistik & Maklumat Teknikal */}
        <div className="info-stats-grid">
          <div className="info-stat-box">
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }} className="mono">Platform Pelayan</span>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--green)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Layers size={14} /> Bedrock Dedicated Only
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>MCPE, Windows 10/11, Konsol</p>
          </div>

          <div className="info-stat-box">
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }} className="mono">Lokasi & Kestabilan</span>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--cyan)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <MapPin size={14} /> Malaysia (Uptime 93%+)
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Ping rendah & bebas lag tempatan</p>
          </div>

          <div className="info-stat-box">
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }} className="mono">Ekonomi Server</span>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--gold)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Coins size={14} /> Scoreboard System
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Objektif 'money' & kedai pasar spawn</p>
          </div>

          <div className="info-stat-box">
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }} className="mono">Daftar Rasmi</span>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <User size={14} /> Lightinityy & Staff
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>BakaCrew Management Team</p>
          </div>
        </div>

        {/* Tag Rasmi Pelayan */}
        <div style={{ marginTop: "0.8rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Tag & Ciri-Ciri Rasmi Pelayan:</span>
          <div className="lore-tags mono">
            {["SMP Survival", "Semi-Vanilla", "Economy Driven", "Land Claiming", "Anti-Grief", "Spawn Market", "Roleplay", "Malaysia SEA"].map((t) => (
              <span key={t} className="lore-tag">#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Rekod Penebusan Akaun */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h4 style={{ fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem" }}>
          <Clock size={16} color="var(--cyan)" /> Rekod Penebusan Akaun Anda
        </h4>
        <div className="table-box">
          <table>
            <thead>
              <tr><th>Masa</th><th>GamerTag</th><th>Item / Hadiah</th><th>Harga</th><th>Status</th></tr>
            </thead>
            <tbody className="mono">
              {claimsList.filter((c) => currentUser && c.username === currentUser.username).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>
                    {currentUser ? "Belum ada rekod penebusan hadiah." : "Sila log masuk untuk melihat rekod akaun anda."}
                  </td>
                </tr>
              ) : (
                claimsList.filter((c) => currentUser && c.username === currentUser.username).map((c) => (
                  <tr key={c.id}>
                    <td>{c.time}</td>
                    <td style={{ color: "#fff", fontWeight: 700 }}>{c.gamerTag}</td>
                    <td>{c.itemName}</td>
                    <td style={{ color: "var(--green)" }}>RM {c.price.toFixed(2)}</td>
                    <td><span className={`badge-status ${c.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{c.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Sahkan Pembelian Item */}
      {buyItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}>
                <Gift size={18} /> Sahkan Penebusan: {buyItemModal.name}
              </h3>
              <button onClick={() => setBuyItemModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmBuy}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG / IGN</label>
                <input 
                  type="text" 
                  className="input-styled mono" 
                  placeholder="Cth: SteveMY" 
                  value={claimIgn} 
                  onChange={(e) => setClaimIgn(e.target.value)} 
                  required 
                />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem", display: "block" }}>
                  Item atau pangkat akan diberikan terus kepada nama akaun ini di dalam pelayan.
                </span>
              </div>

              <div style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  <span>Harga Item:</span>
                  <strong className="mono" style={{ color: "#fff" }}>RM {buyItemModal.price.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                  <span>Baki Dompet Anda:</span>
                  <strong className="mono" style={{ color: "var(--green)" }}>RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}</strong>
                </div>
              </div>

              <button type="submit" className="btn-buy-item mono" style={{ padding: "0.65rem" }}>
                Sahkan & Potong Baki (RM {buyItemModal.price.toFixed(2)})
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
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid var(--border-ui)", marginBottom: "1rem" }} className="mono">
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", color: authTab === "login" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "login" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", color: authTab === "register" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "register" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>

            {authForm.err && (
              <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <AlertCircle size={14} /> {authForm.err}
              </div>
            )}

            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: "0.8rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>NAMA PENGGUNA</label>
                <input type="text" className="input-styled mono" placeholder="Nama log masuk" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>

              {authTab === "register" && (
                <div style={{ marginBottom: "0.8rem" }}>
                  <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG</label>
                  <input type="text" className="input-styled mono" placeholder="Nama di dalam Minecraft Bedrock" value={authForm.ign} onChange={(e) => setAuthForm({ ...authForm, ign: e.target.value })} required />
                </div>
              )}

              <div style={{ marginBottom: "1.2rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>KATA LALUAN</label>
                <input type="password" className="input-styled mono" placeholder="Kata laluan akaun" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>

              <button type="submit" className="btn-buy-item mono" style={{ padding: "0.65rem" }}>
                {authTab === "login" ? "Log Masuk Sekarang" : "Daftar Akaun Pemain"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tebus PIN RM5 */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}><Ticket size={18} /> Tebus PIN Tambah Nilai RM 5.00</h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.7rem", marginBottom: "1.2rem" }}>
              <MessageCircle size={15} /> Hubungi WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeemPin}>
              <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN (BK5-XXXX-XXXX)</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.15rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy-item mono" style={{ marginTop: "1rem", padding: "0.65rem" }}>Tebus Sekarang (+RM 5.00)</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Dashboard (PIN 200200) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--gold)" }}><Shield size={18} /> Pusat Kawalan Pentadbir</h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN tidak sah!"); }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.8rem" }}>Masukkan kod PIN Pentadbir (200200):</p>
                <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "6px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                <button type="submit" className="btn-buy-item mono" style={{ background: "var(--gold)", color: "#000", marginTop: "1rem", padding: "0.65rem" }}>Buka Akses Admin</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Senarai Permintaan Tebusan Hadiah */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <h4 style={{ fontSize: "0.92rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                    <Gift size={15} /> Permintaan Tebusan Item Pelayan ({claimsList.length})
                  </h4>
                  <div className="table-box" style={{ maxHeight: "200px" }}>
                    {claimsList.length === 0 ? <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>Tiada sebarang rekod tebusan.</p> : claimsList.map((req) => (
                      <div key={req.id} style={{ background: "#0b1120", border: "1px solid var(--border-ui)", padding: "0.75rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#fff" }}>IGN: {req.gamerTag} ({req.itemName})</strong>
                          <span className={`badge-status ${req.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{req.status}</span>
                        </div>
                        <div className="command-snippet mono">
                          <span>{req.command}</span>
                          <button onClick={() => { navigator.clipboard.writeText(req.command); showToast("Arahan Bedrock disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <Copy size={12} /> Salin
                          </button>
                        </div>
                        {req.status === "PENDING" && (
                          <button onClick={() => handleApproveClaim(req.id)} className="btn-pill btn-redeem mono" style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center", fontSize: "0.75rem" }}>
                            <CheckCircle2 size={13} /> Tandakan Item Telah Diberikan
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penjana PIN RM5 */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.92rem", color: "var(--green)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Ticket size={15} /> Jana PIN Tambah Nilai RM 5
                    </h4>
                    <button onClick={() => { const code = genPin(); const up = [{ code, value: 5, status: "AVAILABLE" }, ...pinDb]; setPinDb(up); save("bc_pins", up); showToast(`PIN: ${code}`); }} className="btn-pill btn-redeem mono" style={{ fontSize: "0.75rem" }}>
                      <PlusCircle size={13} /> Jana 1x PIN
                    </button>
                  </div>
                  <div className="table-box" style={{ maxHeight: "150px" }}>
                    {pinDb.map((pin, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border-ui)", fontSize: "0.8rem" }} className="mono">
                        <span><strong>{pin.code}</strong> (RM {pin.value})</span>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span className={`badge-status ${pin.status === "AVAILABLE" ? "badge-done" : "badge-pending"}`}>{pin.status === "AVAILABLE" ? "BELUM DIGUNAKAN" : "DITEBUS"}</span>
                          {pin.status === "AVAILABLE" && (
                            <button onClick={() => { navigator.clipboard.writeText(pin.code); showToast("Kod PIN disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>
                              <Copy size={13} />
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

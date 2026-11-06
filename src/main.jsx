import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Shield, Zap, Gift, User, LogIn, LogOut, UserPlus, 
  Copy, PlusCircle, Ticket, MessageCircle, Lock, Unlock, 
  Clock, CheckCircle2, X, Sparkles, Coins, Crown, 
  Package, Key, ThumbsUp 
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaCrew Store (RM5)")}`;

const SERVER_IP = "baka.skyes.me";
const SERVER_PORT = "19205";
// Pautan portal undian Bedrock pelayan
const BEDROCK_VOTE_URL = "https://minecraftpocket-servers.com/";

// Storan selamat LocalStorage
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
    desc: "Akses arahan /fly di Plot, Awalan tag [VIP] emas, 5x Claim Tanah tambahan.",
    command: (ign) => `/tag "${ign}" add VIP`
  },
  {
    id: "rank_mvp",
    name: "Rank MVP BakaLegend",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 35,
    icon: "Shield",
    desc: "Semua kelebihan VIP + akses /feed, /heal cooldown rendah, Kit bulanan eksklusif.",
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
    desc: "1x Sayap Elytra (Mending + Unbreaking III) beserta 64x Bunga Api Roket.",
    command: (ign) => `/give "${ign}" elytra 1`
  },
  {
    id: "money_50k",
    name: "Scoreboard $50,000 Money",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 5,
    icon: "Coins",
    desc: "$50,000 dimasukkan terus ke baki duit Scoreboard pelayan anda.",
    command: (ign) => `/scoreboard players add "${ign}" money 50000`
  },
  {
    id: "money_250k",
    name: "Scoreboard $250,000 Money",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 20,
    icon: "Coins",
    desc: "$250,000 Scoreboard Money untuk beli plot kedai spawn dan berdagang.",
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

  // PIN & Claims Database
  const [pinDb, setPinDb] = useState(() => load("bc_pins", [{ code: "BK5-9988-1122", value: 5, status: "AVAILABLE" }]));
  const [claimsList, setClaimsList] = useState(() => load("bc_claims", []));

  // Server Live Status
  const [serverOnline, setServerOnline] = useState(true);
  const [playerCount, setPlayerCount] = useState({ online: 8, max: 30 });

  // Filter Kategori
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Modals
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

  // Semak live status server Bedrock
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

  // Log Masuk & Daftar
  const handleAuth = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    const ign = authForm.ign.trim();
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila isi semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
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
      showToast(`🎉 Selamat datang ke BakaCrew, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      save("bc_active_user", found.username);
      setShowAuth(false);
      showToast(`Log masuk berjaya!`);
    }
    setAuthForm({ user: "", pass: "", ign: "", err: "" });
  };

  // Ganjaran Log Masuk Harian (Daily Streak)
  const handleDailyClaim = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();
    if (currentUser.lastDaily === today) {
      return showToast("⚠️ Anda sudah tuntut hadiah hari ini. Datang lagi esok!");
    }

    const newStreak = (currentUser.streak || 0) + 1;
    const rewardBonus = newStreak % 7 === 0 ? 2.0 : 0.50;

    updateUser({
      balanceRM: +(currentUser.balanceRM + rewardBonus).toFixed(2),
      lastDaily: today,
      streak: newStreak
    });

    showToast(`🎁 Hadiah harian dituntut! +RM ${rewardBonus.toFixed(2)} (Streak Hari ke-${newStreak})!`);
  };

  // SISTEM BEDROCK VOTE (+RM 0.25 SEHARI SEKALI)
  const handleBedrockVote = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();

    if (currentUser.lastVote === today) {
      return showToast("⚠️ Anda telah membuat undian hari ini. Sila undi lagi esok!");
    }

    // Buka laman undian Bedrock di tab baharu
    window.open(BEDROCK_VOTE_URL, "_blank");

    // Kreditkan bonus RM 0.25 ke dompet
    updateUser({
      balanceRM: +(currentUser.balanceRM + 0.25).toFixed(2),
      lastVote: today
    });

    showToast("🎉 Terima kasih mengundi BakaCrew! +RM 0.25 telah dikreditkan ke akaun anda!");
  };

  // Tebus PIN RM5
  const handleRedeemPin = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const code = inputPin.trim().toUpperCase();
    const target = pinDb.find((p) => p.code.toUpperCase() === code);

    if (!target) return showToast("❌ Kod PIN tidak wujud!");
    if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

    updateUser({ balanceRM: +(currentUser.balanceRM + target.value).toFixed(2) });
    const updatedPins = pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p);
    setPinDb(updatedPins);
    save("bc_pins", updatedPins);
    setInputPin("");
    setShowRedeem(false);
    showToast(`🎉 +RM ${target.value}.00 berjaya dimasukkan ke baki dompet!`);
  };

  // Beli Hadiah
  const handleConfirmBuy = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const ign = (claimIgn || currentUser.gamerTag || "").trim();
    if (!ign) return showToast("Sila masukkan GamerTag Minecraft anda!");

    if (currentUser.balanceRM < buyItemModal.price) {
      return showToast("Baki dompet RM tidak mencukupi! Sila beli PIN di WhatsApp Admin.");
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
    showToast(`✅ Pembelian berjaya! Permintaan tebusan item ${buyItemModal.name} dihantar ke Admin.`);
  };

  const handleApproveClaim = (id) => {
    const updated = claimsList.map((c) => c.id === id ? { ...c, status: "SELESAI" } : c);
    setClaimsList(updated);
    save("bc_claims", updated);
    showToast("Penebusan ditandakan sebagai SELESAI!");
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

      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon"><Server size={24} /></div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>BakaCrew Hub</h2>
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--green)" }}>Minecraft Bedrock Malaysia</p>
          </div>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={15} /> {currentUser.gamerTag || currentUser.username}
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => setShowRedeem(true)}>
                <Ticket size={15} /> Tebus PIN
              </button>
              <button className="btn-pill btn-logout mono" onClick={() => { setCurrentUsername(""); save("bc_active_user", ""); showToast("Log keluar berjaya."); }}>
                <LogOut size={15} /> Keluar
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                <LogIn size={15} /> Log Masuk
              </button>
              <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                <UserPlus size={15} /> Daftar Pemain
              </button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />} Admin (200200)
          </button>
        </div>
      </nav>

      {/* Status Live Server Bedrock */}
      <div className="server-bar">
        <div>
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: serverOnline ? "var(--green)" : "var(--red)", boxShadow: serverOnline ? "0 0 10px var(--green)" : "none" }}></span>
            Pelayan Bedrock BakaCrew SMP
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {serverOnline ? `${playerCount.online} / ${playerCount.max} Pemain Online Sekarang` : "Server Sedang Offline / Penyelenggaraan"}
          </p>
        </div>

        <div className="conn-badges mono">
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>IP:</span>
            <strong style={{ color: "var(--green)" }}>{SERVER_IP}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_IP); showToast("IP Pelayan Disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={13} /></button>
          </div>
          <div className="badge-tag">
            <span style={{ color: "var(--text-muted)" }}>Port:</span>
            <strong style={{ color: "var(--cyan)" }}>{SERVER_PORT}</strong>
            <button onClick={() => { navigator.clipboard.writeText(SERVER_PORT); showToast("Port Disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={13} /></button>
          </div>
        </div>
      </div>

      {/* Grid 3 Petak: Dompet, Daily Check-In & Bedrock Vote */}
      <div className="dash-grid">
        {/* Petak Dompet */}
        <div className="card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Baki Dompet Simpanan</span>
          <div className="val-big mono" style={{ color: "var(--green)" }}>
            RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            Beli PIN di WhatsApp untuk tambah baki dompet.
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

        {/* Petak Daily Streak */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 700 }}>🎁 DAILY CHECK-IN</span>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Streak: {currentUser?.streak || 0} Hari</span>
          </div>
          <div className="val-big" style={{ fontSize: "1.15rem", marginTop: "0.3rem" }}>
            Ganjaran Harian (+RM0.50)
          </div>
          <div className="streak-row mono">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className={`streak-box ${(currentUser?.streak || 0) >= day ? "done" : ""}`}>
                Day {day}
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
            <Sparkles size={14} /> {isDailyClaimed ? "✓ Dituntut Hari Ini" : "Tuntut Ganjaran Hari Ini"}
          </button>
        </div>

        {/* PETAK BEDROCK VOTE BONUS (+RM 0.25) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--cyan)", fontWeight: 700 }}>🗳️ BEDROCK VOTE BONUS</span>
            <span className="mono" style={{ fontSize: "0.72rem", color: isVotedToday ? "var(--green)" : "var(--gold)" }}>
              {isVotedToday ? "✓ SELESAI HARI INI" : "★ SEDIA DIUNDI"}
            </span>
          </div>
          <div className="val-big" style={{ fontSize: "1.15rem", marginTop: "0.3rem" }}>
            Undi Server BakaCrew (+RM0.25)
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem", lineHeight: 1.4 }}>
            Undi di portal server Bedrock setiap hari untuk menyokong pelayan & kumpul kredit percuma!
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
            <ThumbsUp size={14} /> {isVotedToday ? "✓ Sudah Diundi Hari Ini" : "Buka Vote & Tuntut (+RM0.25)"}
          </button>
        </div>
      </div>

      {/* BakaStore: Penebusan Hadiah & Rank */}
      <div>
        <div className="store-header">
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Gift size={20} color="var(--green)" /> Kedai Hadiah & Rank Server BakaCrew
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Pilih item, rank atau pek duit Scoreboard untuk ditebus terus ke pelayan Bedrock anda.
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

        {/* Grid Kad Item */}
        <div className="store-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <span className={`item-tag mono ${item.tagClass}`}>{item.category}</span>
              <div>
                <div className="item-icon-box">
                  {item.icon === "Crown" && <Crown size={22} color="var(--gold)" />}
                  {item.icon === "Shield" && <Shield size={22} color="var(--cyan)" />}
                  {item.icon === "Package" && <Package size={22} color="var(--green)" />}
                  {item.icon === "Zap" && <Zap size={22} color="var(--gold)" />}
                  {item.icon === "Coins" && <Coins size={22} color="var(--green)" />}
                  {item.icon === "Key" && <Key size={22} color="#c084fc" />}
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{item.name}</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Harga:</span>
                  <span className="mono" style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--green)" }}>
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
                  <Gift size={14} /> Tebus Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rekod Penebusan Pemain */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h4 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.8rem" }}>
          <Clock size={16} color="var(--cyan)" /> Rekod Penebusan Hadiah Anda
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
                    {currentUser ? "Belum ada sebarang hadiah ditebus." : "Sila log masuk untuk melihat rekod anda."}
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

      {/* Modal Sahkan Tebus Hadiah */}
      {buyItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}>
                <Gift size={20} /> Sahkan Penebusan: {buyItemModal.name}
              </h3>
              <button onClick={() => setBuyItemModal(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmBuy}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG / IGN</label>
                <input 
                  type="text" 
                  className="input-styled mono" 
                  placeholder="Cth: SteveMY" 
                  value={claimIgn} 
                  onChange={(e) => setClaimIgn(e.target.value)} 
                  required 
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem", display: "block" }}>
                  Item atau rank akan diberikan terus ke nama GamerTag ini dalam pelayan.
                </span>
              </div>

              <div style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span>Harga Item:</span>
                  <strong className="mono" style={{ color: "#fff" }}>RM {buyItemModal.price.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                  <span>Baki Dompet Anda:</span>
                  <strong className="mono" style={{ color: "var(--green)" }}>RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}</strong>
                </div>
              </div>

              <button type="submit" className="btn-buy-item mono">
                Sahkan & Potong Baki (RM {buyItemModal.price.toFixed(2)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Auth */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pusat Akses Pemain</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid var(--border-ui)", marginBottom: "1rem" }} className="mono">
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", color: authTab === "login" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "login" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", color: authTab === "register" ? "var(--green)" : "var(--text-muted)", borderBottom: authTab === "register" ? "2px solid var(--green)" : "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>

            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "1rem" }}>{authForm.err}</div>}

            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: "0.8rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Username portal" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>

              {authTab === "register" && (
                <div style={{ marginBottom: "0.8rem" }}>
                  <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG</label>
                  <input type="text" className="input-styled mono" placeholder="Nama dalam Minecraft Bedrock" value={authForm.ign} onChange={(e) => setAuthForm({ ...authForm, ign: e.target.value })} required />
                </div>
              )}

              <div style={{ marginBottom: "1.2rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>

              <button type="submit" className="btn-buy-item mono">
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun Pemain"}
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
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "va

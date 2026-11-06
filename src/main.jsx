import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Shield, Zap, Gift, User, LogIn, LogOut, UserPlus, 
  Copy, PlusCircle, Ticket, MessageCircle, Lock, Unlock, 
  Clock, CheckCircle2, X, Coins, Crown, Package, Key, 
  ThumbsUp, CalendarCheck, Star, AlertCircle, Radio, Tag, HelpCircle
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

// Senarai Produk & Item BakaCrew Store Gaya FallXD
const STORE_ITEMS = [
  {
    id: "rank_mvp",
    name: "Rank MVP BakaLegend",
    category: "Ranks",
    ribbon: "TERLARIS",
    ribbonClass: "ribbon-best",
    price: 35.0,
    icon: "Shield",
    desc: "Pangkat tertinggi pelayan dengan kelebihan menyeluruh & akses istimewa.",
    specs: ["Akses /fly, /feed & /heal", "Prefix [MVP] bercahaya di chat", "15x Land Claim tanpa had saiz", "Pek Kit MVP bulanan automatik"],
    command: (ign) => `/tag "${ign}" add MVP`
  },
  {
    id: "rank_vip",
    name: "Rank VIP Bedrock",
    category: "Ranks",
    ribbon: "POPULAR",
    ribbonClass: "ribbon-pop",
    price: 15.0,
    icon: "Crown",
    desc: "Akses arahan /fly di kawasan Plot, awalan [VIP], dan 5x Claim Tanah.",
    specs: ["Akses /fly di Plot binaan", "Tag [VIP] emas kekal", "5x Claim Tanah tambahan", "Kit VIP permulaan"],
    command: (ign) => `/tag "${ign}" add VIP`
  },
  {
    id: "kit_netherite",
    name: "Kit Netherite Full God",
    category: "Kits",
    ribbon: "BEST VALUE",
    ribbonClass: "ribbon-val",
    price: 10.0,
    icon: "Package",
    desc: "1 Set Lengkap Netherite Armor (Protection IV) & Pedang God.",
    specs: ["Full Netherite Prot IV", "Netherite Sword Sharpness V", "Unbreaking III & Mending", "Anti-Drop Inventory Lock"],
    command: (ign) => `/give "${ign}" netherite_sword 1 0 {"minecraft:item_lock":{"mode":"lock_in_inventory"}}`
  },
  {
    id: "kit_elytra",
    name: "Pek Sayap Elytra",
    category: "Kits",
    ribbon: "HOT ITEM",
    ribbonClass: "ribbon-pop",
    price: 8.0,
    icon: "Zap",
    desc: "1x Sayap Elytra Mending & 64x Bunga Api Roket penerbangan pantas.",
    specs: ["Sayap Elytra Durabiliti Penuh", "Enchant Mending & Unbreaking III", "64x Roket Kelajuan 3", "Penghantaran Segera"],
    command: (ign) => `/give "${ign}" elytra 1`
  },
  {
    id: "money_250k",
    name: "Scoreboard $250,000",
    category: "Scoreboard",
    ribbon: "EKONOMI",
    ribbonClass: "ribbon-best",
    price: 20.0,
    icon: "Coins",
    desc: "$250,000 Scoreboard 'money' untuk sewa plot spawn & berniaga.",
    specs: ["250K Duit Scoreboard", "Masuk Terus ke /scoreboard", "Boleh Guna di Pasar Spawn", "Bebas Cukai Server"],
    command: (ign) => `/scoreboard players add "${ign}" money 250000`
  },
  {
    id: "money_50k",
    name: "Scoreboard $50,000",
    category: "Scoreboard",
    ribbon: "BAJET",
    ribbonClass: "ribbon-val",
    price: 5.0,
    icon: "Coins",
    desc: "$50,000 dimasukkan terus ke objektif 'money' akaun anda.",
    specs: ["50K Duit Scoreboard", "Sesuai Untuk Ahli Baru", "Beli Blok & Makanan", "Penghantaran Pantas"],
    command: (ign) => `/scoreboard players add "${ign}" money 50000`
  },
  {
    id: "key_legend",
    name: "3x Kunci Crate Legendary",
    category: "Crates",
    ribbon: "GACHA",
    ribbonClass: "ribbon-pop",
    price: 6.0,
    icon: "Key",
    desc: "Kunci peti misteri Spawn untuk cabutan senjata kosmetik unik.",
    specs: ["3x Kunci Peti Legendary", "Peluang Dapat Senjata Rahsia", "Kosmetik Efek Partikel", "Buka di Spawn Crate"],
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

  const [buyModalItem, setBuyModalItem] = useState(null);
  const [claimIgn, setClaimIgn] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Semak status pelayan Minecraft Bedrock secara masa nyata
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
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila lengkapkan semua maklumat!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Nama pengguna ini telah wujud!" });
      }
      const newUser = { username: u, password: p, gamerTag: ign || u, balanceRM: 0, lastDaily: null, streak: 0, lastVote: null };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("bc_users_db", updated);
      setCurrentUsername(u);
      save("bc_active_user", u);
      setShowAuth(false);
      showToast(`Pendaftaran berjaya: ${u}`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Nama pengguna atau kata laluan tidak sah!" });
      setCurrentUsername(found.username);
      save("bc_active_user", found.username);
      setShowAuth(false);
      showToast("Log masuk berjaya!");
    }
    setAuthForm({ user: "", pass: "", ign: "", err: "" });
  };

  const handleDailyClaim = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();
    if (currentUser.lastDaily === today) {
      return showToast("Ganjaran harian telah diambil hari ini.");
    }
    updateUser({
      balanceRM: +(currentUser.balanceRM + 0.05).toFixed(2),
      lastDaily: today,
      streak: (currentUser.streak || 0) + 1
    });
    showToast("Bonus ganjaran harian (+RM 0.05) dikreditkan!");
  };

  const handleBedrockVote = () => {
    if (!currentUser) return setShowAuth(true);
    const today = new Date().toDateString();
    if (currentUser.lastVote === today) {
      return showToast("Undian telah selesai untuk hari ini.");
    }
    window.open(BEDROCK_VOTE_URL, "_blank");
    updateUser({
      balanceRM: +(currentUser.balanceRM + 0.25).toFixed(2),
      lastVote: today
    });
    showToast("Terima kasih mengundi! Bonus RM 0.25 dikreditkan.");
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

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "BAKACREW") {
      setPromoDiscount(1.0);
      showToast("Kupon 'BAKACREW' sah! Diskaun RM 1.00 digunakan.");
    } else {
      showToast("Kupon tidak sah.");
    }
  };

  const handleConfirmBuy = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const ign = (claimIgn || currentUser.gamerTag || "").trim();
    if (!ign) return showToast("Sila masukkan GamerTag Minecraft!");

    const finalPrice = Math.max(0.5, buyModalItem.price - promoDiscount);

    if (currentUser.balanceRM < finalPrice) {
      return showToast("Baki dompet tidak mencukupi. Sila beli PIN di WhatsApp.");
    }

    updateUser({ balanceRM: +(currentUser.balanceRM - finalPrice).toFixed(2) });

    const newClaim = {
      id: Date.now(),
      username: currentUser.username,
      gamerTag: ign,
      itemName: buyModalItem.name,
      price: finalPrice,
      command: buyModalItem.command(ign),
      status: "PENDING",
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    const updatedClaims = [newClaim, ...claimsList];
    setClaimsList(updatedClaims);
    save("bc_claims", updatedClaims);

    setBuyModalItem(null);
    setClaimIgn("");
    setPromoCode("");
    setPromoDiscount(0);
    showToast(`Penebusan ${buyModalItem.name} berjaya dihantar ke sistem!`);
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
    <div>
      {toast && <div className="toast mono">{toast}</div>}

      {/* 1. Marquee Pengumuman */}
      <div className="announcement-bar mono">
        <div className="marquee-content">
          <Radio size={14} color="var(--cyan)" />
          <span>Sistem Penebusan Automatik BakaCrew • Kod Kupon Diskaun: <strong>BAKACREW</strong> • Status Server: <strong>Online</strong></span>
        </div>
      </div>

      <div className="container">
        {/* 2. Navbar Modern */}
        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon"><Server size={20} /></div>
            <div>
              <div className="brand-title">BakaCrew Store</div>
              <div className="brand-badge mono">Official Server Provider</div>
            </div>
          </div>

          <div className="nav-actions">
            {currentUser ? (
              <>
                <button className="btn-pill btn-user mono">
                  <User size={13} /> {currentUser.gamerTag || currentUser.username}
                </button>
                <button className="btn-pill btn-green-gradient mono" onClick={() => setShowRedeem(true)}>
                  <Ticket size={13} /> Tebus PIN
                </button>
                <button className="btn-pill btn-user mono" onClick={() => { setCurrentUsername(""); save("bc_active_user", ""); showToast("Log keluar selesai."); }}>
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <>
                <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                  Log Masuk
                </button>
                <button className="btn-pill btn-primary-gradient mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                  Daftar
                </button>
              </>
            )}
            <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
              {isAdmin ? <Unlock size={13} /> : <Lock size={13} />} Admin
            </button>
          </div>
        </nav>

        {/* 3. Hero Section Gaya FallXD Store */}
        <section className="hero-section">
          <div className="verified-badge mono">
            <CheckCircle2 size={13} /> Verified Game Store • BakaCrew Bedrock Malaysia
          </div>
          <h1 className="hero-title">
            Topup Pangkat & Item <span>Minecraft Bedrock</span> Instan
          </h1>
          <p className="hero-desc">
            Dapatkan Rank VIP/MVP, Kit Pertarungan Netherite, dan Pek Wang Scoreboard secara pantas dengan sistem arahan pelayan automatik.
          </p>

          {/* 3 Kad Jaminan Pengguna */}
          <div className="trust-grid mono">
            <div className="trust-card">
              <div className="trust-icon"><Zap size={18} /></div>
              <div>
                <h4>Sistem Automatik</h4>
                <p>Pesanan dijana terus ke arahan konsol</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon"><Shield size={18} /></div>
              <div>
                <h4>Uptime 99.9%</h4>
                <p>Pelayan Dedicated stabil & bebas lag</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon"><CheckCircle2 size={18} /></div>
              <div>
                <h4>Harga Jujur & Telus</h4>
                <p>Tiada caj tersembunyi, jaminan penuh</p>
              </div>
            </div>
          </div>

          {/* Telemetri Sambungan Pelayan */}
          <div className="server-bar mono">
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: serverOnline ? "var(--green)" : "var(--red)", boxShadow: serverOnline ? "0 0 8px var(--green)" : "none" }}></span>
              <strong style={{ fontSize: "0.82rem" }}>BakaCrew SMP</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({playerCount.online}/{playerCount.max} Pemain)</span>
            </div>

            <div className="conn-badges">
              <div className="badge-tag">
                <span style={{ color: "var(--text-muted)" }}>IP:</span>
                <strong style={{ color: "var(--cyan)" }}>{SERVER_IP}</strong>
                <button onClick={() => { navigator.clipboard.writeText(SERVER_IP); showToast("IP disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={12} /></button>
              </div>
              <div className="badge-tag">
                <span style={{ color: "var(--text-muted)" }}>Port:</span>
                <strong style={{ color: "var(--cyan)" }}>{SERVER_PORT}</strong>
                <button onClick={() => { navigator.clipboard.writeText(SERVER_PORT); showToast("Port disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}><Copy size={12} /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Baki & Ganjaran Percuma */}
        <div className="dash-grid">
          {/* Kad Baki Dompet */}
          <div className="dash-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Baki Dompet Anda</span>
                <Coins size={16} color="var(--green)" />
              </div>
              <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--green)", margin: "0.25rem 0" }}>
                RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Gunakan baki untuk membuat pesanan item atau rank.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.85rem" }}>
              <button className="btn-pill btn-green-gradient mono" style={{ flex: 1, justifyContent: "center" }} onClick={() => currentUser ? setShowRedeem(true) : setShowAuth(true)}>
                <Ticket size={12} /> Tebus PIN
              </button>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-user mono" style={{ flex: 1, justifyContent: "center" }}>
                <MessageCircle size={12} /> Beli PIN
              </a>
            </div>
          </div>

          {/* Kad Ganjaran Harian RM 0.05 */}
          <div className="dash-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <CalendarCheck size={13} /> GANJARAN HARIAN
                </span>
                <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{currentUser?.streak || 0}H Streak</span>
              </div>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold)", margin: "0.25rem 0" }}>
                +RM 0.05
              </div>
              <div className="streak-row mono">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className={`streak-box ${(currentUser?.streak || 0) >= day ? "done" : ""}`}>
                    H{day}
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="btn-pill mono" 
              style={{ 
                width: "100%", justifyContent: "center", marginTop: "0.75rem",
                background: isDailyClaimed ? "#1e293b" : "linear-gradient(135deg, var(--gold), #d97706)", 
                color: isDailyClaimed ? "var(--text-muted)" : "#000",
                cursor: isDailyClaimed ? "not-allowed" : "pointer"
              }}
              onClick={handleDailyClaim}
              disabled={isDailyClaimed}
            >
              <Star size={12} /> {isDailyClaimed ? "Telah Diambil Hari Ini" : "Ambil Ganjaran (RM 0.05)"}
            </button>
          </div>

          {/* Kad Undian Bedrock RM 0.25 */}
          <div className="dash-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--cyan)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <ThumbsUp size={13} /> UNDIAN PELAYAN
                </span>
                <span className="mono" style={{ fontSize: "0.68rem", color: isVotedToday ? "var(--green)" : "var(--gold)" }}>
                  {isVotedToday ? "Selesai" : "Sedia"}
                </span>
              </div>
              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--cyan)", margin: "0.25rem 0" }}>
                +RM 0.25
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Undi server di portal senarai Bedrock untuk menuntut bonus kredit harian.
              </p>
            </div>
            <button 
              className="btn-pill mono" 
              style={{ 
                width: "100%", justifyContent: "center", marginTop: "0.75rem",
                background: isVotedToday ? "#1e293b" : "linear-gradient(135deg, var(--cyan), #0284c7)", 
                color: isVotedToday ? "var(--text-muted)" : "#fff",
                cursor: isVotedToday ? "not-allowed" : "pointer"
              }}
              onClick={handleBedrockVote}
              disabled={isVotedToday}
            >
              <ThumbsUp size={12} /> {isVotedToday ? "Selesai Hari Ini" : "Undi & Tuntut (+RM 0.25)"}
            </button>
          </div>
        </div>

        {/* 4. Katalog Produk BakaCrew Store */}
        <section>
          <div className="catalog-header">
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Gift size={18} color="var(--cyan)" /> Pakej Pangkat & Barangan Pelayan
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Pilih kategori dan buat pesanan terus ke akaun Minecraft Bedrock anda.
              </p>
            </div>

            <div className="category-scroll mono">
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

          <div className="product-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="product-card">
                <div>
                  <span className={`ribbon-badge mono ${item.ribbonClass}`}>{item.ribbon}</span>

                  <div className="product-icon-frame">
                    {item.icon === "Crown" && <Crown size={22} color="var(--gold)" />}
                    {item.icon === "Shield" && <Shield size={22} color="var(--cyan)" />}
                    {item.icon === "Package" && <Package size={22} color="var(--green)" />}
                    {item.icon === "Zap" && <Zap size={22} color="var(--gold)" />}
                    {item.icon === "Coins" && <Coins size={22} color="var(--green)" />}
                    {item.icon === "Key" && <Key size={22} color="#c084fc" />}
                  </div>

                  <div className="product-name">{item.name}</div>
                  <div className="product-desc">{item.desc}</div>

                  <div className="specs-list mono">
                    {item.specs.map((spec, idx) => (
                      <div key={idx} className="spec-item">
                        <Check size={11} color="var(--cyan)" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="price-pill-box">
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Harga:</span>
                    <strong className="mono" style={{ fontSize: "1rem", color: "var(--cyan)" }}>
                      RM {item.price.toFixed(2)}
                    </strong>
                  </div>

                  <button 
                    className="btn-buy-action mono"
                    onClick={() => {
                      if (!currentUser) return setShowAuth(true);
                      setClaimIgn(currentUser.gamerTag || "");
                      setBuyModalItem(item);
                    }}
                  >
                    <Zap size={13} /> Beli Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ Section Ala FallXD Store */}
        <section className="faq-section">
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <HelpCircle size={18} color="var(--cyan)" />
            <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>Soalan Lazim (FAQ)</h4>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h5>Bagaimanakah item diberikan di dalam server?</h5>
              <p>Selepas pesanan dibuat, sistem menjana tiket arahan rasmi. Admin akan menyelaraskan arahan tersebut terus ke GamerTag akaun anda dalam permainan.</p>
            </div>
            <div className="faq-item">
              <h5>Berapa lamakah masa proses penebusan?</h5>
              <p>Penebusan mengambil masa sekitar 1 hingga 15 minit bergantung kepada kehadiran admin di dalam talian.</p>
            </div>
            <div className="faq-item">
              <h5>Bagaimana cara menambah baki dompet RM?</h5>
              <p>Anda boleh menekan butang 'Beli PIN' untuk menghubungi WhatsApp Admin rasmi (018-3915460) bagi mendapatkan kod baucar PIN bernilai RM 5.00.</p>
            </div>
            <div className="faq-item">
              <h5>Adakah pangkat yang dibeli bersifat kekal?</h5>
              <p>Ya, semua pangkat seperti VIP dan MVP BakaLegend adalah sah seumur hidup sepanjang musim pelayan BakaCrew SMP berjalan.</p>
            </div>
          </div>
        </section>

        {/* 6. WhatsApp Support Banner */}
        <div className="wa-banner">
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>Perlukan Bantuan Segera?</h4>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Hubungi Khidmat Pelanggan rasmi BakaCrew Store di talian WhatsApp 018-3915460 untuk urusan tambah nilai atau pertanyaan server.
            </p>
          </div>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-green-gradient mono" style={{ padding: "0.6rem 1.1rem" }}>
            <MessageCircle size={15} /> Hubungi WhatsApp Rasmi
          </a>
        </div>

        {/* 7. Rekod Penebusan Akaun */}
        <div className="claims-card">
          <h4 style={{ fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.85rem" }}>
            <Clock size={16} color="var(--cyan)" /> Rekod Pesanan & Penebusan Anda
          </h4>

          <div className="mono">
            {claimsList.filter((c) => currentUser && c.username === currentUser.username).length === 0 ? (
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
                {currentUser ? "Belum ada sebarang pesanan dibuat." : "Sila log masuk untuk melihat rekod akaun anda."}
              </p>
            ) : (
              claimsList.filter((c) => currentUser && c.username === currentUser.username).map((c) => (
                <div key={c.id} className="claim-row">
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.78rem" }}>{c.itemName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>{c.gamerTag} • {c.time}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--cyan)", fontWeight: 800, fontSize: "0.8rem" }}>RM {c.price.toFixed(2)}</div>
                    <span className={`badge-status ${c.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Pengesahan Pembelian & Kupon Diskaun */}
        {buyModalItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--cyan)" }}>
                  <Zap size={16} /> Pengesahan Pesanan: {buyModalItem.name}
                </h3>
                <button onClick={() => { setBuyModalItem(null); setPromoDiscount(0); setPromoCode(""); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
              </div>

              <form onSubmit={handleConfirmBuy}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG / IGN</label>
                  <input 
                    type="text" 
                    className="input-styled mono" 
                    placeholder="Cth: SteveMY" 
                    value={claimIgn} 
                    onChange={(e) => setClaimIgn(e.target.value)} 
                    required 
                  />
                </div>

                {/* Input Kod Kupon Diskaun */}
                <div style={{ marginBottom: "0.85rem" }}>
                  <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>KOD KUPON PROMO (PILIHAN: BAKACREW)</label>
                  <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
                    <input 
                      type="text" 
                      className="input-styled mono" 
                      style={{ marginTop: 0 }}
                      placeholder="Masukkan Kupon" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)} 
                    />
                    <button type="button" onClick={handleApplyPromo} className="btn-pill btn-primary-gradient mono">
                      Guna
                    </button>
                  </div>
                </div>

                <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border-ui)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>Harga Asal:</span>
                    <strong className="mono" style={{ color: "#fff" }}>RM {buyModalItem.price.toFixed(2)}</strong>
                  </div>
                  {promoDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--green)", marginTop: "0.2rem" }}>
                      <span>Diskaun Kupon:</span>
                      <strong className="mono">-RM {promoDiscount.toFixed(2)}</strong>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#fff", marginTop: "0.35rem", borderTop: "1px dashed var(--border-ui)", paddingTop: "0.35rem" }}>
                    <span>Jumlah Bayaran:</span>
                    <strong className="mono" style={{ color: "var(--cyan)" }}>RM {Math.max(0.5, buyModalItem.price - promoDiscount).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    <span>Baki Dompet Anda:</span>
                    <strong className="mono" style={{ color: "var(--green)" }}>RM {currentUser ? currentUser.balanceRM.toFixed(2) : "0.00"}</strong>
                  </div>
                </div>

                <button type="submit" className="btn-buy-action mono">
                  Bayar & Hantar Pesanan
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
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
                <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid var(--border-ui)", marginBottom: "0.85rem" }} className="mono">
                <button style={{ flex: 1, padding: "0.5rem", background: "none", border: "none", color: authTab === "login" ? "var(--cyan)" : "var(--text-muted)", borderBottom: authTab === "login" ? "2px solid var(--cyan)" : "none", fontWeight: 700, cursor: "pointer", fontSize: "0.76rem" }} onClick={() => setAuthTab("login")}>Log Masuk</button>
                <button style={{ flex: 1, padding: "0.5rem", background: "none", border: "none", color: authTab === "register" ? "var(--cyan)" : "var(--text-muted)", borderBottom: authTab === "register" ? "2px solid var(--cyan)" : "none", fontWeight: 700, cursor: "pointer", fontSize: "0.76rem" }} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
              </div>

              {authForm.err && (
                <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.5rem", borderRadius: "6px", fontSize: "0.72rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <AlertCircle size={12} /> {authForm.err}
                </div>
              )}

              <form onSubmit={handleAuth}>
                <div style={{ marginBottom: "0.65rem" }}>
                  <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>NAMA PENGGUNA</label>
                  <input type="text" className="input-styled mono" placeholder="Nama pengguna" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
                </div>

                {authTab === "register" && (
                  <div style={{ marginBottom: "0.65rem" }}>
                    <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>MINECRAFT BEDROCK GAMERTAG</label>
                    <input type="text" className="input-styled mono" placeholder="GamerTag dalam permainan" value={authForm.ign} onChange={(e) => setAuthForm({ ...authForm, ign: e.target.value })} required />
                  </div>
                )}

                <div style={{ marginBottom: "0.9rem" }}>
                  <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>KATA LALUAN</label>
                  <input type="password" className="input-styled mono" placeholder="Kata laluan" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
                </div>

                <button type="submit" className="btn-buy-action mono">
                  {authTab === "login" ? "Log Masuk Sekarang" : "Daftar Akaun Baharu"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Tebus PIN Tambah Nilai */}
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
                <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN (BK5-XXXX-XXXX)</label>
                <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.1rem", letterSpacing: "1px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
                <button type="submit" className="btn-buy-action mono" style={{ marginTop: "0.85rem", background: "linear-gradient(135deg, var(--green), #059669)", color: "#000" }}>Tebus Sekarang (+RM 5.00)</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Admin Dashboard (PIN 200200) */}
        {showAdmin && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <h3 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)" }}><Shield size={16} /> Pusat Kawalan Pentadbir</h3>
                <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={16} /></button>
              </div>

              {!isAdmin ? (
                <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN tidak sah!"); }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>Masukkan kod PIN Pentadbir (200200):</p>
                  <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "4px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                  <button type="submit" className="btn-buy-action mono" style={{ background: "var(--gold)", color: "#000", marginTop: "0.85rem" }}>Buka Akses Admin</button>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {/* Senarai Permintaan Tebusan Hadiah */}
                  <div style={{ background: "var(--bg-deep)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-ui)" }}>
                    <h4 style={{ fontSize: "0.82rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                      <Gift size={13} /> Senarai Penebusan ({claimsList.length})
                    </h4>
                    <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                      {claimsList.length === 0 ? <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", padding: "0.6rem" }}>Tiada tebusan aktif.</p> : claimsList.map((req) => (
                        <div key={req.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-ui)", padding: "0.6rem", borderRadius: "6px", marginBottom: "0.4rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem" }}>
                            <strong style={{ color: "#fff" }}>IGN: {req.gamerTag} ({req.itemName})</strong>
                            <span className={`badge-status ${req.status === "PENDING" ? "badge-pending" : "badge-done"}`}>{req.status}</span>
                          </div>
                          <div className="command-snippet mono">
                            <span>{req.command}</span>
                            <button onClick={() => { navigator.clipboard.writeText(req.command); showToast("Command disalin."); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>
                              <Copy size={11} />
                            </button>
                          </div>
                          {req.status === "PENDING" && (
                            <button onClick={() => handleApproveClaim(req.id)} className="btn-pill btn-primary-gradient mono" style={{ marginTop: "0.4rem", width: "100%", justifyContent: "center", fontSize: "0.68rem" }}>
                              <CheckCircle2 size={11} /> Sahkan & Beri Item
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Penjana PIN RM5 */}
                  <div style={{ background: "var(--bg-deep)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-ui)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <h4 style={{ fontSize: "0.82rem", color: "var(--green)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Ticket size={13} /> Jana PIN RM 5
                      </h4>
                      <button onClick={() => { const code = genPin(); const up = [{ code, value: 5, status: "AVAILABLE" }, ...pinDb]; setPinDb(up); save("bc_pins", up); showToast(`PIN: ${code}`); }} className="btn-pill btn-green-gradient mono" style={{ fontSize: "0.68rem" }}>
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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  ShoppingBag, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ShieldAlert, X, Copy, Check, PlusCircle, Ticket, 
  MessageCircle, Terminal, CheckCircle2, Package, Sparkles, 
  Server, Globe, Film, Bot, Music, ExternalLink, ArrowRight
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaHub (RM5)")}`;
const SERVER_IP = "baka.skyes.me";
const SERVER_PORT = "19205";

// Helper LocalStorage Serta-merta
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } 
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const genPin = () => `BK5-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

// Senarai Katalog Produk Rasmi
const INITIAL_PRODUCTS = [
  // 1. Minecraft Bedrock BakaCrew
  {
    id: "mc_vip",
    category: "bedrock",
    title: "Rank VIP BakaCrew (Permanent)",
    desc: "Akses fly di lobby, 3x /sethome, prefix [VIP] berwarna zamrud & kit VIP mingguan.",
    price: 10.0,
    type: "minecraft",
    deliveryCmd: "/tag add {IGN} VIP"
  },
  {
    id: "mc_money_20k",
    category: "bedrock",
    title: "Pakej $20,000 Scoreboard Money",
    desc: "Duit scoreboard tunai dimasukkan terus ke baki akaun in-game Bedrock anda.",
    price: 5.0,
    type: "minecraft",
    deliveryCmd: "/scoreboard players add {IGN} money 20000"
  },
  {
    id: "mc_spawner",
    category: "bedrock",
    title: "3x Kunci Peti Spawner Crate",
    desc: "Buka peti spawner mistik di Spawn untuk peluang dapat Iron Golem & Blaze Spawner.",
    price: 8.0,
    type: "minecraft",
    deliveryCmd: "/give {IGN} tripwire_hook 3"
  },

  // 2. Template Laman Web
  {
    id: "tpl_kahwin",
    category: "template",
    title: "Template Kad Kahwin Digital VIP",
    desc: "Lengkap dengan borang RSVP, muzik latar, Google Maps & kaunter kiraan detik.",
    price: 15.0,
    type: "digital",
    downloadUrl: "https://github.com/example/wedding-invitation-template"
  },
  {
    id: "tpl_landing",
    category: "template",
    title: "Template Landing Page Bisnes / Jualan",
    desc: "Moden, pantas, mesra SEO & siap butang WhatsApp Checkout berkonversi tinggi.",
    price: 20.0,
    type: "digital",
    downloadUrl: "https://github.com/example/business-landing-page"
  },
  {
    id: "tpl_portfolio",
    category: "template",
    title: "Template Portfolio Dark Cyberpunk",
    desc: "Gaya developer moden dengan paparan projek, kemahiran animasi & mod gelap.",
    price: 12.0,
    type: "digital",
    downloadUrl: "https://github.com/example/dev-portfolio-template"
  },
  {
    id: "tpl_resume",
    category: "template",
    title: "Template Resume / CV ATS-Friendly",
    desc: "Format templat profesional yang mudah melepasi imbasan sistem kerja syarikat.",
    price: 8.0,
    type: "digital",
    downloadUrl: "https://github.com/example/ats-resume-template"
  },

  // 3. Akaun Premium & Digital
  {
    id: "prm_chatgpt",
    category: "premium",
    title: "ChatGPT Plus (Shared 1 Bulan)",
    desc: "Akses tanpa had ke model GPT-4o, analisis kod & penjana imej DALL-E 3.",
    price: 15.0,
    type: "account",
    credential: "Login: baka_gpt@skyes.me | Password: GptBaka#2026"
  },
  {
    id: "prm_netflix",
    category: "premium",
    title: "Netflix 4K Ultra HD (1 Profil 1 Bulan)",
    desc: "Profil persendirian dengan kunci PIN peribadi. Tontonan 4K HDR tanpa gangguan.",
    price: 12.0,
    type: "account",
    credential: "Login: netflix_my@skyes.me | Profil 3 (PIN: 8821)"
  },
  {
    id: "prm_spotify",
    category: "premium",
    title: "Spotify Premium (Individu 1 Bulan)",
    desc: "Dengar lagu kualiti tinggi tanpa iklan, langkau tanpa had & boleh muat turun.",
    price: 7.0,
    type: "account",
    credential: "Login: spot_my@skyes.me | Password: MusicBaka!2026"
  },
  {
    id: "prm_youtube",
    category: "premium",
    title: "YouTube Premium + YT Music (1 Bulan)",
    desc: "Tonton video tanpa iklan, main di latar belakang skrin telefon & YouTube Music.",
    price: 8.0,
    type: "account",
    credential: "Jemputan Family Slot dihantar terus ke email Google anda."
  }
];

function App() {
  // Pangkalan Data Pengguna
  const [usersDb, setUsersDb] = useState(() => load("bakahub_users_db", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("bakahub_active_user", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Status Kedai & Kategori
  const [activeCategory, setActiveCategory] = useState("all");
  const [products] = useState(INITIAL_PRODUCTS);

  // Baucar PIN & Senarai Pesanan Pembelian
  const [pinDb, setPinDb] = useState(() => load("bakahub_pins", [
    { code: "BK5-8888-9999", value: 5, status: "AVAILABLE" }
  ]));
  const [orders, setOrders] = useState(() => load("bakahub_orders", []));

  // Modal States
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ignInput, setIgnInput] = useState("");

  const [showInventory, setShowInventory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const copyServerIP = () => {
    navigator.clipboard.writeText(`${SERVER_IP}:${SERVER_PORT}`);
    setCopied(true);
    showToast("IP Pelayan Bedrock disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Auth: Daftar & Login
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila lengkapkan maklumat!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username ini sudah didaftarkan!" });
      }
      const newUser = { username: u, password: p, balance: 0.0, purchases: [] };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("bakahub_users_db", updated);
      setCurrentUsername(u);
      save("bakahub_active_user", u);
      setShowAuth(false);
      showToast(`🎉 Selamat datang ke BakaHub, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      save("bakahub_active_user", found.username);
      setShowAuth(false);
      showToast(`Log masuk berjaya!`);
    }
    setAuthForm({ user: "", pass: "", err: "" });
  };

  const handleLogout = () => {
    setCurrentUsername("");
    save("bakahub_active_user", "");
    showToast("Anda telah log keluar.");
  };

  const updateUserBalance = (fields) => {
    if (!currentUser) return;
    const updated = usersDb.map((u) => u.username === currentUser.username ? { ...u, ...fields } : u);
    setUsersDb(updated);
    save("bakahub_users_db", updated);
  };

  const requireUser = (fn) => {
    if (!currentUser) { 
      setAuthForm({ user: "", pass: "", err: "Sila log masuk atau daftar akaun terlebih dahulu!" }); 
      setShowAuth(true); 
      return; 
    }
    fn();
  };

  // Tebus Baucar PIN RM5
  const handleRedeem = (e) => {
    e.preventDefault();
    requireUser(() => {
      const code = inputPin.trim().toUpperCase();
      const target = pinDb.find((p) => p.code.toUpperCase() === code);
      if (!target) return showToast("❌ Kod PIN tidak wujud!");
      if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

      updateUserBalance({ balance: +(currentUser.balance + target.value).toFixed(2) });
      const updatedPins = pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p);
      setPinDb(updatedPins);
      save("bakahub_pins", updatedPins);
      setInputPin("");
      setShowRedeem(false);
      showToast(`🎉 +RM ${target.value}.00 dimasukkan ke baki dompet anda!`);
    });
  };

  // Beli Produk
  const handlePurchase = (e) => {
    e.preventDefault();
    if (!selectedProduct || !currentUser) return;

    if (currentUser.balance < selectedProduct.price) {
      showToast("Baki tidak cukup! Sila beli PIN di WhatsApp Admin.");
      return;
    }

    if (selectedProduct.type === "minecraft" && !ignInput.trim()) {
      showToast("Sila masukkan Minecraft GamerTag / IGN anda!");
      return;
    }

    const newBalance = +(currentUser.balance - selectedProduct.price).toFixed(2);
    const newOrder = {
      id: Date.now(),
      username: currentUser.username,
      productTitle: selectedProduct.title,
      category: selectedProduct.category,
      price: selectedProduct.price,
      type: selectedProduct.type,
      ign: selectedProduct.type === "minecraft" ? ignInput.trim() : null,
      command: selectedProduct.type === "minecraft" ? selectedProduct.deliveryCmd.replace("{IGN}", ignInput.trim()) : null,
      downloadUrl: selectedProduct.downloadUrl || null,
      credential: selectedProduct.credential || null,
      status: selectedProduct.type === "minecraft" ? "PENDING DELIVERY" : "SELESAI",
      date: new Date().toLocaleDateString("ms-MY")
    };

    // Tolak baki & tambah ke inventori pengguna
    updateUserBalance({
      balance: newBalance,
      purchases: [newOrder, ...(currentUser.purchases || [])]
    });

    // Simpan ke rekod pesanan keseluruhan
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    save("bakahub_orders", updatedOrders);

    setSelectedProduct(null);
    setIgnInput("");
    showToast(`✅ Pembelian ${selectedProduct.title} berjaya!`);
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="container">
      {toast && <div className="toast">{toast}</div>}

      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"><ShoppingBag size={24} /></div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>BakaHub Market</h2>
            <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>
              Komuniti Bedrock & Produk Digital
            </p>
          </div>
        </div>

        <div className="nav-right">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono"><User size={15} /> {currentUser.username}</button>
              <button className="btn-pill btn-cyan mono" onClick={() => setShowInventory(true)}>
                <Package size={15} /> Peti Saya ({currentUser.purchases?.length || 0})
              </button>
              <button className="btn-pill btn-green mono" onClick={() => setShowRedeem(true)}>
                <KeyRound size={15} /> Tebus PIN
              </button>
              <button className="btn-pill btn-logout mono" onClick={handleLogout}><LogOut size={15} /> Keluar</button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                <LogIn size={15} /> Log Masuk
              </button>
              <button className="btn-pill btn-green mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                <UserPlus size={15} /> Daftar Akaun
              </button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />} Admin (200200)
          </button>
        </div>
      </header>

      {/* Hero Banner Komuniti & IP Server */}
      <section className="hero-banner">
        <div>
          <span className="prod-tag tag-bedrock">Pelayan Rasmi Minecraft Bedrock</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.2rem" }}>
            Pusat Hadiah BakaCrew & Gedung Digital
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
            Dapatkan rank in-game, template website perkahwinan/bisnes, dan langganan premium dengan baki BakaHub anda.
          </p>
        </div>

        <div className="server-ip-badge mono">
          <Server size={18} color="var(--green)" />
          <span>{SERVER_IP}:{SERVER_PORT}</span>
          <button 
            onClick={copyServerIP}
            style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", display: "flex", alignItems: "center" }}
            title="Salin IP Bedrock"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </section>

      {/* Baki Dompet & Quick Actions */}
      <section className="wallet-bar">
        <div className="card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Baki Dompet Anda
          </span>
          <div className="stat-val mono" style={{ color: "#fff" }}>
            {currentUser ? `RM ${currentUser.balance.toFixed(2)}` : "Sila Log Masuk"}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-pill btn-green mono" onClick={() => requireUser(() => setShowRedeem(true))}>
              <KeyRound size={14} /> Masukkan PIN Top-up
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mono">
              <MessageCircle size={15} /> Beli PIN (018-3915460)
            </a>
          </div>
        </div>

        <div className="card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Barangan Dimiliki
          </span>
          <div className="stat-val mono" style={{ color: "var(--cyan)" }}>
            {currentUser ? `${currentUser.purchases?.length || 0} Item` : "--"}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem", display: "block" }}>
            Semak kod lesen, pautan muat turun & status Minecraft di Peti Saya.
          </span>
        </div>
      </section>

      {/* Kategori Filter Tabs */}
      <div className="filter-row mono">
        <button 
          className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          <Sparkles size={16} /> Semua Produk
        </button>
        <button 
          className={`filter-btn ${activeCategory === "bedrock" ? "active" : ""}`}
          onClick={() => setActiveCategory("bedrock")}
        >
          <Server size={16} /> Server Bedrock BakaCrew
        </button>
        <button 
          className={`filter-btn ${activeCategory === "template" ? "active" : ""}`}
          onClick={() => setActiveCategory("template")}
        >
          <Globe size={16} /> Template Laman Web
        </button>
        <button 
          className={`filter-btn ${activeCategory === "premium" ? "active" : ""}`}
          onClick={() => setActiveCategory("premium")}
        >
          <Bot size={16} /> Langganan Premium
        </button>
      </div>

      {/* Senarai Kad Produk */}
      <section className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="product-card">
            <div>
              <span className={`prod-tag tag-${p.category}`}>
                {p.category === "bedrock" ? "Minecraft Bedrock" : p.category === "template" ? "Website Template" : "Akaun Premium"}
              </span>
              <h3 className="prod-title">{p.title}</h3>
              <p className="prod-desc">{p.desc}</p>
            </div>

            <div className="prod-footer">
              <span className="price-text mono">RM {p.price.toFixed(2)}</span>
              <button 
                className="btn-buy mono"
                onClick={() => requireUser(() => setSelectedProduct(p))}
              >
                Beli Sekarang <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* MODAL PENGESAHAN BELIAN */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Sahkan Pembelian</h3>
              <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)", marginBottom: "1.2rem" }}>
              <h4 style={{ color: "var(--green)", fontSize: "1.05rem" }}>{selectedProduct.title}</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{selectedProduct.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.8rem", borderTop: "1px solid var(--border-ui)", paddingTop: "0.5rem" }}>
                <span>Harga Produk:</span>
                <strong className="mono" style={{ color: "var(--green)", fontSize: "1.1rem" }}>RM {selectedProduct.price.toFixed(2)}</strong>
              </div>
            </div>

            <form onSubmit={handlePurchase}>
              {selectedProduct.type === "minecraft" && (
                <div style={{ marginBottom: "1.2rem" }}>
                  <label className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)", display: "block", marginBottom: "0.3rem" }}>
                    MASUKKAN GAMERTAG / IGN MINECRAFT ANDA:
                  </label>
                  <input 
                    type="text" 
                    className="input-styled mono" 
                    placeholder="Cth: SteveMY / HafizCraft" 
                    value={ignInput} 
                    onChange={(e) => setIgnInput(e.target.value)} 
                    required 
                  />
                  <small style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem", display: "block" }}>
                    Hadiah akan dihantar terus ke akaun Bedrock server anda.
                  </small>
                </div>
              )}

              <button type="submit" className="btn-buy mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem" }}>
                Tolak RM {selectedProduct.price.toFixed(2)} & Dapatkan Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PETI SAYA / INVENTORI PENGGUNA */}
      {showInventory && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)" }}>
                <Package size={20} /> Peti Simpanan & Pembelian Saya
              </h3>
              <button onClick={() => setShowInventory(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {(!currentUser.purchases || currentUser.purchases.length === 0) ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Anda belum membeli sebarang produk.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {currentUser.purchases.map((item) => (
                  <div key={item.id} style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "0.9rem", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{item.productTitle}</strong>
                      <span className={`badge-status ${item.status === "SELESAI" ? "badge-avail" : "badge-pending"}`}>{item.status}</span>
                    </div>

                    {item.type === "minecraft" && (
                      <div className="command-snippet mono">
                        <span>IGN: {item.ign} | Menunggu Admin serahkan item</span>
                      </div>
                    )}

                    {item.type === "digital" && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-pill btn-cyan mono" style={{ display: "inline-flex", fontSize: "0.75rem" }}>
                          <ExternalLink size={14} /> Buka / Muat Turun Template
                        </a>
                      </div>
                    )}

                    {item.type === "account" && (
                      <div className="command-snippet mono">
                        <span>{item.credential}</span>
                        <button onClick={() => { navigator.clipboard.writeText(item.credential); showToast("Butiran log masuk disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="auth-tabs mono">
              <button className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>
            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "1rem" }}>{authForm.err}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Cth: HafizBaka" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>
              <button type="submit" className="btn-buy mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem" }}>
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun Percuma"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TEBUS PIN RM5 */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}>
                <Ticket size={20} /> Tebus PIN Top-up RM 5.00
              </h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.7rem", marginBottom: "1.2rem" }}>
              <MessageCircle size={16} /> Beli PIN di WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeem}>
              <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN (BK5-XXXX-XXXX)</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem", marginTop: "1rem" }}>
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
                <ShieldAlert size={20} /> Admin Dashboard (200200)
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN Salah!"); }}>
                <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "6px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                <button type="submit" className="btn-pill btn-admin mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem", marginTop: "1rem" }}>Buka Kunci Admin</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Penyerahan Hadiah Minecraft */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                    <Terminal size={16} /> Pesanan Hadiah Minecraft ({orders.filter(o => o.type === "minecraft").length})
                  </h4>
                  <div className="pin-list">
                    {orders.filter(o => o.type === "minecraft").map((ord) => (
                      <div key={ord.id} style={{ background: "#0b1120", border: "1px solid var(--border-ui)", padding: "0.8rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#fff" }}>IGN: {ord.ign} ({ord.productTitle})</strong>
                          <span className={`badge-status ${ord.status === "SELESAI" ? "badge-avail" : "badge-pending"}`}>{ord.status}</span>
                        </div>
                        <div className="command-snippet mono">
                          <span>{ord.command}</span>
                          <button onClick={() => { navigator.clipboard.writeText(ord.command); showToast("Command Minecraft disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
                        </div>
                        {ord.status !== "SELESAI" && (
                          <button onClick={() => {
                            const updated = orders.map(o => o.id === ord.id ? { ...o, status: "SELESAI" } : o);
                            setOrders(updated);
                            save("bakahub_orders", updated);
                            showToast("Pesanan ditandakan selesai!");
                          }} className="btn-pill btn-green mono" style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center" }}>
                            <CheckCircle2 size={14} /> Tandakan Telah Diberikan Dalam Server
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penjana PIN RM5 */}
                <div style={{ background: "#060913", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--green)" }}>Jana PIN RM5</h4>
                    <button onClick={() => {
                      const code = genPin();
                      const updated = [{ code, value: 5, status: "AVAILABLE" }, ...pinDb];
                      setPinDb(updated);
                      save("bakahub_pins", updated);
                      showToast(`PIN Dijana: ${code}`);
                    }} className="btn-pill btn-green mono" style={{ fontSize: "0.75rem" }}>
                      <PlusCircle size={14} /> + Jana 1x PIN
                    </button>
                  </div>
                  <div className="pin-list">
                    {pinDb.map((pin, i) => (
                      <div key={i} className="pin-row mono">
                        <span><strong>{pin.code}</strong> (RM {pin.value})</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`badge-status ${pin.status === "AVAILABLE" ? "badge-avail" : "badge-used"}`}>
                            {pin.status === "AVAILABLE" ? "BELUM DIPAKAI" : `DITEBUS (${pin.usedBy})`}
                          </span>
                          {pin.status === "AVAILABLE" && (
                            <button onClick={() => { navigator.clipboard.writeText(pin.code); showToast("PIN disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
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

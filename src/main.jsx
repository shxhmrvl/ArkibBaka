import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  ShoppingBag, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ShieldAlert, X, Copy, Check, PlusCircle, Ticket, MessageCircle, 
  Terminal, CheckCircle2, Package, Sparkles, Globe, Bot, 
  ExternalLink, ArrowRight, Eye, Tag, Search, ShoppingCart, 
  Download, Film, Music, Code, HelpCircle, Star, SlidersHorizontal
} from "lucide-react";

const ADMIN_PIN = "200200";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaHub Market")}`;

// Helper LocalStorage Serta-merta (Zero Data-loss)
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } 
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// Sintesis Audio Web Chime (Tanpa fail luaran)
const playChime = (type = "success") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(type === "success" ? 587.33 : 329.63, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(type === "success" ? 880 : 220, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
};

const genPinCode = () => `BK5-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
const genLicenseKey = () => `BK-LIC-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

// 100% PRODUK DIGITAL TULEN (Templates, Accounts & Source Code)
const INITIAL_PRODUCTS = [
  // Kategori: Template Website
  {
    id: "tpl_kahwin_vip",
    category: "template",
    title: "Template Kad Kahwin Digital VIP",
    desc: "Borang RSVP automatik, lagu latar auto-play, countdown timer & integrasi Google Maps / Waze.",
    price: 15.0,
    rating: 4.9,
    sales: 142,
    features: ["Responsif Telefon / Desktop", "Audio Latar & RSVP Form", "Countdown & Lokasi Majlis"],
    previewType: "wedding",
    downloadUrl: "https://github.com/example/wedding-rsvp-template"
  },
  {
    id: "tpl_saas_landing",
    category: "template",
    title: "Template SaaS & Startup Landing Page",
    desc: "Direka khas untuk jualan perisian dan produk digital dengan skor kelajuan 99% Google Lighthouse.",
    price: 25.0,
    rating: 5.0,
    sales: 89,
    features: ["Next.js & Tailwind CSS", "Pricing Table & FAQ", "Formulir Lead Generation"],
    previewType: "saas",
    downloadUrl: "https://github.com/example/saas-landing-template"
  },
  {
    id: "tpl_portfolio_dev",
    category: "template",
    title: "Template Developer Portfolio Cyberpunk",
    desc: "Portfolio dark-mode ultra moden dengan kesan animasi neon, paparan projek & borang mesej.",
    price: 12.0,
    rating: 4.8,
    sales: 210,
    features: ["Animasi Framer Motion", "Showcase Projek Interaktif", "CV Download Button"],
    previewType: "portfolio",
    downloadUrl: "https://github.com/example/dev-portfolio-cyber"
  },
  {
    id: "tpl_resume_ats",
    category: "template",
    title: "Template Resume & CV ATS-Friendly Pro",
    desc: "Format templat moden yang disahkan melepasi sistem tapisan ATS syarikat korporat antarabangsa.",
    price: 8.0,
    rating: 4.7,
    sales: 320,
    features: ["Format Web & PDF", "Struktur Standard ATS", "Mudah Edit dalam 5 Minit"],
    previewType: "resume",
    downloadUrl: "https://github.com/example/ats-resume-template"
  },

  // Kategori: Akaun Premium & AI
  {
    id: "prm_chatgpt_plus",
    category: "account",
    title: "ChatGPT Plus (Shared 1 Bulan)",
    desc: "Akses tanpa had ke model GPT-4o, analisis data mendalam & penjana imej DALL-E 3 berkualiti tinggi.",
    price: 18.0,
    rating: 4.9,
    sales: 412,
    features: ["Akses Model GPT-4o Terpantas", "Penjana Imej DALL-E 3", "Jaminan Waranti 30 Hari"],
    credentialSeed: "Email: gpt_plus@bakahub.me | Kata Laluan: BakaGPT#2026"
  },
  {
    id: "prm_netflix_uhd",
    category: "account",
    title: "Netflix 4K Ultra HD (1 Profil Peribadi)",
    desc: "Profil sendiri lengkap dengan kunci PIN 4-digit. Tontonan 4K HDR tanpa perkongsian skrin.",
    price: 14.0,
    rating: 5.0,
    sales: 650,
    features: ["Kualiti 4K Ultra HD", "Profil Khas dengan PIN", "Sokongan Semua Peranti"],
    credentialSeed: "Email: nflx_my@bakahub.me | Profil 3 (PIN Peribadi: 7721)"
  },
  {
    id: "prm_spotify_prem",
    category: "account",
    title: "Spotify Premium Individu (1 Bulan)",
    desc: "Mendengar muzik tanpa sebarang iklan, muat turun lagu luar talian & kualiti audio tertinggi.",
    price: 7.0,
    rating: 4.9,
    sales: 580,
    features: ["Tanpa Iklan Sepenuhnya", "Muat Turun Lagu Offline", "Langkau Lagu Tanpa Had"],
    credentialSeed: "Email: spot_vip@bakahub.me | Kata Laluan: MusicBaka#2026"
  },
  {
    id: "prm_youtube_prem",
    category: "account",
    title: "YouTube Premium + YouTube Music",
    desc: "Tonton video tanpa iklan, main di latar belakang skrin telefon & akses aplikasi YouTube Music.",
    price: 9.0,
    rating: 4.8,
    sales: 290,
    features: ["Video Tanpa Gangguan Iklan", "Main Video Belakang Skrin", "Termasuk YT Music App"],
    credentialSeed: "Jemputan Slot Keluarga dihantar terus ke email Google anda."
  },

  // Kategori: Source Code & UI Kits
  {
    id: "src_react_boilerplate",
    category: "source",
    title: "React SaaS Full Boilerplate + Auth",
    desc: "Kod sumber lengkap siap integrasi Supabase Auth, Tailwind UI & gerbang pembayaran sedia guna.",
    price: 35.0,
    rating: 5.0,
    sales: 78,
    features: ["TypeScript & React Vite", "Supabase Auth & Database", "Komponen UI Lengkap"],
    previewType: "code",
    downloadUrl: "https://github.com/example/react-saas-starter"
  }
];

function App() {
  // Pangkalan Data Pengguna
  const [usersDb, setUsersDb] = useState(() => load("bakahub_users_v2", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("bakahub_session_v2", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Produk & Penapis
  const [products, setProducts] = useState(() => load("bakahub_products_v2", INITIAL_PRODUCTS));
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Troli Beli-Belah (Shopping Cart)
  const [cart, setCart] = useState(() => load("bakahub_cart_v2", []));
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Baucar PIN Database
  const [pinDb, setPinDb] = useState(() => load("bakahub_pins_v2", [
    { code: "BK5-8888-9999", value: 5, status: "AVAILABLE" },
    { code: "BK5-1111-2222", value: 10, status: "AVAILABLE" }
  ]));

  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");

  const [previewProduct, setPreviewProduct] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProdForm, setNewProdForm] = useState({ title: "", category: "template", desc: "", price: "10" });

  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Simpanan Tetap
  useEffect(() => save("bakahub_users_v2", usersDb), [usersDb]);
  useEffect(() => save("bakahub_session_v2", currentUsername), [currentUsername]);
  useEffect(() => save("bakahub_products_v2", products), [products]);
  useEffect(() => save("bakahub_cart_v2", cart), [cart]);
  useEffect(() => save("bakahub_pins_v2", pinDb), [pinDb]);

  // Auth Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila lengkapkan maklumat!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
      }
      const newUser = { username: u, password: p, balance: 10.0, library: [] }; // Bonus RM10 daftar!
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      setCurrentUsername(u);
      setShowAuth(false);
      playChime("success");
      showToast(`🎉 Selamat datang! Bonus kredit RM 10.00 diberikan.`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      setShowAuth(false);
      playChime("success");
      showToast(`Log masuk berjaya!`);
    }
    setAuthForm({ user: "", pass: "", err: "" });
  };

  const handleLogout = () => {
    setCurrentUsername("");
    showToast("Anda telah log keluar.");
  };

  const updateUser = (fields) => {
    if (!currentUser) return;
    const updated = usersDb.map((u) => u.username === currentUser.username ? { ...u, ...fields } : u);
    setUsersDb(updated);
  };

  const requireUser = (fn) => {
    if (!currentUser) {
      setAuthForm({ user: "", pass: "", err: "Sila log masuk atau daftar akaun dahulu!" });
      setShowAuth(true);
      return;
    }
    fn();
  };

  // Tebus Baucar PIN
  const handleRedeem = (e) => {
    e.preventDefault();
    requireUser(() => {
      const code = inputPin.trim().toUpperCase();
      const target = pinDb.find((p) => p.code.toUpperCase() === code);
      if (!target) return showToast("❌ Kod PIN tidak sah!");
      if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

      updateUser({ balance: +(currentUser.balance + target.value).toFixed(2) });
      setPinDb(pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p));
      setInputPin("");
      setShowRedeem(false);
      playChime("success");
      showToast(`🎉 +RM ${target.value}.00 dimasukkan ke baki dompet anda!`);
    });
  };

  // Troli & Kupon Diskaun
  const addToCart = (product) => {
    if (cart.some((item) => item.id === product.id)) {
      return showToast("Produk sudah ada di dalam troli!");
    }
    setCart([...cart, product]);
    playChime("success");
    showToast(`${product.title} ditambah ke troli!`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const applyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (clean === "BAKA50") {
      setDiscountPercent(50);
      showToast("🎉 Kupon BAKA50 (Diskaun 50%) diaktifkan!");
    } else if (clean === "LAUNCH") {
      setDiscountPercent(20);
      showToast("🎉 Kupon LAUNCH (Diskaun 20%) diaktifkan!");
    } else {
      showToast("Kupon tidak sah.");
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const cartTotal = +(cartSubtotal * (1 - discountPercent / 100)).toFixed(2);

  // Checkout Pembelian (Single atau Dari Troli)
  const executeCheckout = (itemsToBuy, totalCost) => {
    requireUser(() => {
      if (currentUser.balance < totalCost) {
        return showToast("Baki dompet RM tidak mencukupi! Sila top-up PIN dahulu.");
      }

      const generatedOrders = itemsToBuy.map((item) => ({
        id: Date.now() + Math.random(),
        title: item.title,
        category: item.category,
        price: item.price,
        licenseKey: genLicenseKey(),
        downloadUrl: item.downloadUrl || null,
        credential: item.credentialSeed || null,
        purchasedAt: new Date().toLocaleDateString("ms-MY")
      }));

      updateUser({
        balance: +(currentUser.balance - totalCost).toFixed(2),
        library: [...generatedOrders, ...(currentUser.library || [])]
      });

      // Kosongkan troli jika item dibeli dari troli
      setCart(cart.filter((c) => !itemsToBuy.some((b) => b.id === c.id)));
      setShowCartDrawer(false);
      playChime("success");
      showToast(`✅ Pembelian berjaya! Item disimpan ke Peti Digital.`);
    });
  };

  // Tambah Produk Baharu oleh Admin
  const handleCreateProduct = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(newProdForm.price);
    if (!newProdForm.title || !priceNum) return;

    const newP = {
      id: `custom_${Date.now()}`,
      category: newProdForm.category,
      title: newProdForm.title,
      desc: newProdForm.desc || "Produk digital premium sedia dimuat turun.",
      price: priceNum,
      rating: 5.0,
      sales: 0,
      features: ["Akses Seumur Hidup", "Sokongan Percuma", "Kemas Kini Terkini"],
      downloadUrl: "https://github.com/example/download-file"
    };

    setProducts([newP, ...products]);
    setNewProdForm({ title: "", category: "template", desc: "", price: "10" });
    showToast("Produk baharu berjaya diterbitkan di kedai!");
  };

  // Carian & Penapis
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-container">
      {toast && <div className="toast-msg">{toast}</div>}

      {/* Navbar Moden */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon"><ShoppingBag size={24} /></div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>BakaHub Market</h2>
            <p className="mono" style={{ fontSize: "0.74rem", color: "var(--cyan)" }}>
              {currentUser ? `Akaun: ${currentUser.username}` : "Pusat Produk Digital & AI"}
            </p>
          </div>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={15} /> {currentUser.username}
              </button>
              <button className="btn-pill btn-cyan mono" onClick={() => setShowInventory(true)}>
                <Package size={15} /> Peti Saya ({currentUser.library?.length || 0})
              </button>
              <button className="btn-pill btn-green mono" onClick={() => setShowRedeem(true)}>
                <KeyRound size={15} /> Tebus PIN
              </button>
              <button className="btn-pill btn-user mono" onClick={handleLogout} title="Log Keluar">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                <LogIn size={15} /> Log Masuk
              </button>
              <button className="btn-pill btn-green mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                <UserPlus size={15} /> Daftar Percuma
              </button>
            </>
          )}

          {/* Butang Troli */}
          <button className="btn-pill btn-cart-nav mono" onClick={() => setShowCartDrawer(true)}>
            <ShoppingCart size={16} />
            <span>Troli</span>
            {cart.length > 0 && <span className="cart-count-badge">{cart.length}</span>}
          </button>

          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />} Admin
          </button>
        </div>
      </nav>

      {/* Hero Showcase Header */}
      <section className="hero-box">
        <div className="hero-left">
          <div className="badge-gradient">
            <Sparkles size={14} /> Gedung Templat & Perisian Digital #1
          </div>
          <h1 className="hero-title">
            Bina Projek Pantas dengan <span>Templat & Akaun Premium</span>
          </h1>
          <p className="hero-desc">
            Dapatkan templat kad kahwin interaktif, kod portfolio developer, serta langganan ChatGPT Plus, Netflix 4K dan Spotify pada harga komuniti paling berbaloi.
          </p>
        </div>

        {/* WhatsApp Card Callout */}
        <div style={{ background: "rgba(6, 10, 20, 0.8)", border: "1px solid var(--border-ui)", padding: "1.2rem", borderRadius: "14px", textAlign: "center" }}>
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Perlu Bantuan / Top-up Manual?</span>
          <div style={{ margin: "0.6rem 0" }}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono">
              <MessageCircle size={16} /> WhatsApp Admin (018-3915460)
            </a>
          </div>
          <small className="mono" style={{ fontSize: "0.7rem", color: "var(--green)" }}>● Khidmat Sokongan Pantas</small>
        </div>
      </section>

      {/* Ringkasan Baki Dompet */}
      <section className="wallet-card-grid">
        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Baki Dompet Digital
          </span>
          <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
            {currentUser ? `RM ${currentUser.balance.toFixed(2)}` : "Sila Log Masuk"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-pill btn-green mono" onClick={() => requireUser(() => setShowRedeem(true))}>
              <KeyRound size={14} /> Masukkan PIN Baucar
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono">
              Beli PIN (WhatsApp)
            </a>
          </div>
        </div>

        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Lesen & Produk Dimiliki
          </span>
          <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--cyan)", marginTop: "0.2rem" }}>
            {currentUser ? `${currentUser.library?.length || 0} Item` : "--"}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
            Semua kod lesen, fail templat & akaun disimpan kekal di Peti Digital anda.
          </span>
        </div>
      </section>

      {/* Kategori Tabs & Carian Pintar */}
      <div className="toolbar-row">
        <div className="filter-group mono">
          <button 
            className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            Semua Produk
          </button>
          <button 
            className={`filter-btn ${activeCategory === "template" ? "active" : ""}`}
            onClick={() => setActiveCategory("template")}
          >
            <Globe size={15} /> Templat Laman Web
          </button>
          <button 
            className={`filter-btn ${activeCategory === "account" ? "active" : ""}`}
            onClick={() => setActiveCategory("account")}
          >
            <Bot size={15} /> Akaun & AI Premium
          </button>
          <button 
            className={`filter-btn ${activeCategory === "source" ? "active" : ""}`}
            onClick={() => setActiveCategory("source")}
          >
            <Code size={15} /> Kod Sumber / UI Kit
          </button>
        </div>

        <div className="search-input-box">
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Cari templat atau akaun..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Kad Produk Digital */}
      <section className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="prod-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`prod-tag tag-${p.category}`}>
                  {p.category === "template" ? "Website Template" : p.category === "account" ? "Akaun Premium" : "Source Code"}
                </span>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--gold)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Star size={12} fill="var(--gold)" /> {p.rating} ({p.sales})
                </span>
              </div>

              <h3 className="prod-title">{p.title}</h3>
              <p className="prod-desc">{p.desc}</p>

              {/* Senarai Kelebihan Produk */}
              <div className="prod-features-list mono">
                {p.features?.map((f, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Check size={13} color="var(--green)" /> {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="prod-footer">
              <span className="prod-price mono">RM {p.price.toFixed(2)}</span>

              <div className="prod-actions-row">
                {p.previewType && (
                  <button 
                    className="btn-action-icon"
                    onClick={() => setPreviewProduct(p)}
                    title="Pratonton Langsung (Live Demo)"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <button 
                  className="btn-action-icon"
                  onClick={() => addToCart(p)}
                  title="Tambah ke Troli"
                >
                  <ShoppingCart size={16} />
                </button>
                <button 
                  className="btn-buy-now mono"
                  onClick={() => executeCheckout([p], p.price)}
                >
                  Beli
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MODAL PRATONTON LANGSUNG (LIVE DEMO PREVIEW) */}
      {previewProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Eye size={20} color="var(--cyan)" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Pratonton: {previewProduct.title}</h3>
              </div>
              <button onClick={() => setPreviewProduct(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {/* Mockup Frame Tetingkap Pelayar Interaktif */}
            <div className="mockup-preview-window">
              <div className="mockup-topbar">
                <span className="mockup-dot" style={{ background: "#f43f5e" }} />
                <span className="mockup-dot" style={{ background: "#f59e0b" }} />
                <span className="mockup-dot" style={{ background: "#00c087" }} />
                <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  https://demo.bakahub.me/{previewProduct.previewType}
                </span>
              </div>

              <div className="mockup-body">
                {previewProduct.previewType === "wedding" && (
                  <div>
                    <h2 style={{ fontFamily: "serif", fontSize: "1.8rem", color: "var(--gold)" }}>Walimatulurus Adam & Hawa</h2>
                    <p className="mono" style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>Sabtu, 28 Disember | Dewan Perdana KL</p>
                    <div style={{ margin: "1.2rem 0", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <span className="btn-pill btn-green mono" style={{ fontSize: "0.72rem" }}>🎵 Lagu Latar Aktif</span>
                      <span className="btn-pill btn-cyan mono" style={{ fontSize: "0.72rem" }}>📍 Buka Waze / Maps</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>*Templat responsif siap borang ucapan & RSVP kehadiran tetamu.</p>
                  </div>
                )}

                {previewProduct.previewType === "saas" && (
                  <div>
                    <span className="badge-gradient">🚀 v2.4 SaaS Platform</span>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.4rem" }}>Urus Perniagaan Anda 10x Lebih Pantas</h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Tingkatkan konversi jualan dengan susun atur templat moden.</p>
                    <button className="btn-buy-now mono" style={{ margin: "1rem auto 0 auto" }}>Cuba Percuma 14 Hari</button>
                  </div>
                )}

                {previewProduct.previewType === "portfolio" && (
                  <div>
                    <span className="mono" style={{ color: "var(--green)", fontSize: "0.85rem" }}>&gt; console.log("Hello, I am Fullstack Dev")</span>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.4rem" }}>Farid Hazwan — Software Engineer</h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>React • Node.js • Cloud Architecture • Cyberpunk UI</p>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
                      <span className="btn-pill btn-cyan mono" style={{ fontSize: "0.75rem" }}>Lihat Projek</span>
                      <span className="btn-pill btn-user mono" style={{ fontSize: "0.75rem" }}>Hubungi Saya</span>
                    </div>
                  </div>
                )}

                {previewProduct.previewType === "resume" && (
                  <div>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>MOHD DANIAL BIN AZMAN</h3>
                    <p className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>Senior Data Analyst | Certified Scrum Master</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.8rem", maxWidth: "400px" }}>
                      Format tajuk, pemenggalan kemahiran, dan tipografi dioptimumkan khas untuk melepasi tapisan ATS automatik.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--green)" }}>
                RM {previewProduct.price.toFixed(2)}
              </span>
              <button 
                className="btn-buy-now mono"
                onClick={() => {
                  setPreviewProduct(null);
                  executeCheckout([previewProduct], previewProduct.price);
                }}
              >
                Beli Templat Ini Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TROLI BELI-BELAH (SHOPPING CART DRAWER) */}
      {showCartDrawer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingCart size={20} color="var(--cyan)" /> Troli Pembelian ({cart.length})
              </h3>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Troli anda masih kosong.</p>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.2rem" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#060a14", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                      <div>
                        <strong style={{ fontSize: "0.9rem" }}>{item.title}</strong>
                        <div className="mono" style={{ fontSize: "0.8rem", color: "var(--green)" }}>RM {item.price.toFixed(2)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Kupon Diskaun Input */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem" }}>
                  <input 
                    type="text" 
                    className="input-styled mono" 
                    style={{ textTransform: "uppercase", margin: 0 }}
                    placeholder="Kod Kupon (cth: BAKA50)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon} className="btn-pill btn-cyan mono">Tebus</button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-ui)", paddingTop: "0.8rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <span>Jumlah Kasar:</span>
                    <span className="mono">RM {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--green)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                      <span>Diskaun ({discountPercent}%):</span>
                      <span className="mono">- RM {(cartSubtotal * discountPercent / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 800, marginTop: "0.4rem" }}>
                    <span>Jumlah Perlu Bayar:</span>
                    <span className="mono" style={{ color: "var(--green)" }}>RM {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="btn-buy-now mono" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
                  onClick={() => executeCheckout(cart, cartTotal)}
                >
                  Bayar Guna Baki Dompet (RM {cartTotal.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PETI SAYA / INVENTORI PENGGUNA */}
      {showInventory && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--cyan)" }}>
                <Package size={22} /> Peti Digital & Lesen Saya
              </h3>
              <button onClick={() => setShowInventory(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {(!currentUser.library || currentUser.library.length === 0) ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Anda belum memiliki sebarang produk digital.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {currentUser.library.map((item, idx) => (
                  <div key={idx} style={{ background: "#060913", border: "1px solid var(--border-ui)", padding: "1rem", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "1rem", color: "#fff" }}>{item.title}</strong>
                      <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.purchasedAt}</span>
                    </div>

                    <div className="code-key-badge mono">
                      <span>Lesen: {item.licenseKey}</span>
                      <button onClick={() => { navigator.clipboard.writeText(item.licenseKey); showToast("Kod lesen disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
                    </div>

                    {item.downloadUrl && (
                      <div style={{ marginTop: "0.6rem" }}>
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-pill btn-cyan mono" style={{ fontSize: "0.75rem" }}>
                          <Download size={14} /> Muat Turun Fail Templat (ZIP/GitHub)
                        </a>
                      </div>
                    )}

                    {item.credential && (
                      <div className="code-key-badge mono" style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "var(--gold)" }}>
                        <span>{item.credential}</span>
                        <button onClick={() => { navigator.clipboard.writeText(item.credential); showToast("Butiran log masuk disalin!"); }} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer" }}>Salin</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AUTH (LOGIN & REGISTER) */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="auth-tabs mono">
              <button className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Daftar Percuma (Bonus RM10)</button>
            </div>
            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.6rem", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "1rem" }}>{authForm.err}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Cth: FaridDigital" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem" }}>
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun & Tebus RM10"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TEBUS PIN BAUCA */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--green)" }}>
                <Ticket size={20} /> Tebus PIN Top-up Dompet
              </h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginBottom: "1.2rem" }}>
              <MessageCircle size={16} /> Beli PIN di WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeem}>
              <label className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN BAUCA</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-0000-0000" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "1rem" }}>
                Tebus Masuk Baki
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
                <ShieldAlert size={20} /> Admin Control Center (200200)
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("PIN Salah!"); }}>
                <input type="password" maxLength={6} className="input-styled mono" style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "6px" }} placeholder="••••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} autoFocus />
                <button type="submit" className="btn-pill btn-admin mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem", marginTop: "1rem" }}>Buka Akses Admin</button>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {/* Terbit Produk Digital Baharu */}
                <div style={{ background: "#060a14", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--cyan)", marginBottom: "0.6rem" }}>+ Terbitkan Produk Digital Baharu</h4>
                  <form onSubmit={handleCreateProduct}>
                    <input type="text" className="input-styled mono" placeholder="Nama Produk / Template" value={newProdForm.title} onChange={(e) => setNewProdForm({ ...newProdForm, title: e.target.value })} required />
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                      <select className="input-styled mono" value={newProdForm.category} onChange={(e) => setNewProdForm({ ...newProdForm, category: e.target.value })}>
                        <option value="template">Website Template</option>
                        <option value="account">Akaun Premium</option>
                        <option value="source">Source Code</option>
                      </select>
                      <input type="number" step="1" className="input-styled mono" placeholder="Harga RM" value={newProdForm.price} onChange={(e) => setNewProdForm({ ...newProdForm, price: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}>Terbit ke Pasaran</button>
                  </form>
                </div>

                {/* Penjana Baucar PIN */}
                <div style={{ background: "#060a14", padding: "1rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--green)" }}>Jana PIN Baucar Top-up</h4>
                    <button onClick={() => {
                      const code = genPinCode();
                      const updated = [{ code, value: 10, status: "AVAILABLE" }, ...pinDb];
                      setPinDb(updated);
                      save("bakahub_pins_v2", updated);
                      showToast(`PIN Dijana: ${code} (RM10)`);
                    }} className="btn-pill btn-green mono" style={{ fontSize: "0.75rem" }}>
                      <PlusCircle size={14} /> + Jana PIN RM10
                    </button>
                  </div>
                  <div className="pin-list" style={{ maxHeight: "150px", overflowY: "auto", marginTop: "0.6rem" }}>
                    {pinDb.map((pin, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#0c1322", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
                        <span><strong>{pin.code}</strong> (RM {pin.value})</span>
                        <span style={{ color: pin.status === "AVAILABLE" ? "var(--green)" : "var(--red)" }}>
                          {pin.status === "AVAILABLE" ? "BELUM DIPAKAI" : "DITEBUS"}
                        </span>
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

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  ShoppingBag, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ShieldAlert, X, Copy, PlusCircle, Ticket, MessageCircle, 
  Package, Sparkles, Globe, Bot, ArrowRight, Eye, Search, 
  ShoppingCart, Download, Code, Star, Trash2, Check,
  Send, LifeBuoy, Inbox, Clock, CheckCircle2, Crown, Zap, ShieldCheck, Menu
} from "lucide-react";

const ADMIN_PIN = "200200";
const SUPPORT_EMAIL = "shhmrvl@gmail.com";
const WHATSAPP_PHONE = "018-3915460";
const WHATSAPP_LINK = "https://wa.me/60183915460?text=Salam%20Admin,%20saya%20nak%20beli%20PIN%20Topup%20BakaHub%20Market";

// Helper LocalStorage
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } 
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const genPinWithVal = (value) => `BK${value}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

const INITIAL_PRODUCTS = [
  {
    id: "tpl_kahwin_vip",
    category: "template",
    title: "Template Kad Kahwin Digital VIP",
    desc: "Borang RSVP automatik, lagu latar auto-play, countdown timer & integrasi Google Maps / Waze.",
    price: 15.0,
    rating: 4.9,
    sales: 142,
    previewImg: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Templat jemputan kahwin digital moden dengan susunan fon elegan. Pengunjung boleh mengesahkan kehadiran melalui borang RSVP terus ke spreadsheet/WhatsApp, mendengar lagu pengantin, serta navigasi Waze/Maps.",
    features: ["Responsif Telefon / Desktop", "Audio Latar & RSVP Form", "Countdown & Lokasi Majlis"]
  },
  {
    id: "tpl_saas_landing",
    category: "template",
    title: "Template SaaS & Startup Landing Page",
    desc: "Direka khas untuk jualan produk digital dengan kelajuan tinggi & borang leads siap.",
    price: 25.0,
    rating: 5.0,
    sales: 89,
    previewImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Landing page berprestasi tinggi yang dioptimumkan untuk konversi jualan perisian SaaS. Dilengkapi dengan jadual harga (Pricing Table), testimoni pelanggan, dan reka bentuk gelap (Dark Mode).",
    features: ["Next.js & Tailwind CSS", "Pricing Table & FAQ", "Formulir Jualan Siap"]
  },
  {
    id: "tpl_portfolio_dev",
    category: "template",
    title: "Template Developer Portfolio Cyberpunk",
    desc: "Portfolio dark-mode moden dengan kesan animasi neon, paparan projek & borang mesej.",
    price: 12.0,
    rating: 4.8,
    sales: 210,
    previewImg: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Pamerkan kepakaran pengaturcaraan anda dengan gaya futuristik. Mengandungi galeri projek dengan penapis kategori, garis masa pengalaman kerja, dan borang perhubungan yang kemas.",
    features: ["Animasi Framer Motion", "Showcase Projek Interaktif", "CV Download Button"]
  },
  {
    id: "tpl_resume_ats",
    category: "template",
    title: "Template Resume & CV ATS-Friendly Pro",
    desc: "Format templat moden yang melepasi sistem tapisan ATS syarikat antarabangsa.",
    price: 8.0,
    rating: 4.7,
    sales: 320,
    previewImg: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Dibina khas mengikut piawaian sistem tapisan Applicant Tracking System (ATS). Tipografi dan susunan maklumat disusun rapi untuk memaksimumkan peluang temuduga kerja.",
    features: ["Format Web & PDF", "Standard ATS Terbukti", "Mudah Edit dalam 5 Minit"]
  },
  {
    id: "prm_chatgpt_plus",
    category: "account",
    title: "ChatGPT Plus (Shared 1 Bulan)",
    desc: "Akses ke model GPT-4o, analisis data mendalam & penjana imej DALL-E 3 berkualiti tinggi.",
    price: 18.0,
    rating: 4.9,
    sales: 412,
    previewImg: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Langganan akaun ChatGPT Plus selama 30 hari. Akses penuh kepada model GPT-4o terpantas, penterjemahan, dan pemprosesan fail dokumen terus.",
    features: ["Akses Model GPT-4o", "Penjana Imej DALL-E 3", "Jaminan Waranti 30 Hari"]
  },
  {
    id: "prm_netflix_uhd",
    category: "account",
    title: "Netflix 4K Ultra HD (1 Profil Peribadi)",
    desc: "Profil sendiri lengkap dengan kunci PIN 4-digit. Tontonan 4K HDR tanpa perkongsian skrin.",
    price: 14.0,
    rating: 5.0,
    sales: 650,
    previewImg: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Akaun rasmi Netflix pelan Premium 4K Ultra HD. Profil peribadi dilindungi PIN 4-digit tersendiri tanpa sebarang gangguan daripada pengguna lain.",
    features: ["Kualiti 4K Ultra HD", "Profil Khas dengan PIN", "Sokongan Semua Peranti"]
  },
  {
    id: "prm_spotify_prem",
    category: "account",
    title: "Spotify Premium Individu (1 Bulan)",
    desc: "Mendengar muzik tanpa sebarang iklan, muat turun lagu luar talian & kualiti audio tertinggi.",
    price: 7.0,
    rating: 4.9,
    sales: 580,
    previewImg: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Penstriman muzik tanpa had tanpa iklan. Boleh memuat turun album untuk dimainkan secara luar talian dengan kualiti audio jernih 320kbps.",
    features: ["Tanpa Iklan Sepenuhnya", "Muat Turun Lagu Offline", "Langkau Tanpa Had"]
  },
  {
    id: "src_react_boilerplate",
    category: "source",
    title: "React SaaS Full Boilerplate + Auth",
    desc: "Kod sumber lengkap siap integrasi Supabase Auth, Tailwind UI & gerbang pembayaran sedia guna.",
    price: 35.0,
    rating: 5.0,
    sales: 78,
    previewImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Pakej asas permulaan projek perisian lengkap. Siap dibina dengan sistem pendaftaran akaun Supabase, pengesahan email, dan komponen UI moden.",
    features: ["TypeScript & React Vite", "Supabase Auth & Database", "Komponen UI Lengkap"]
  }
];

function App() {
  // Pangkalan Data Pengguna
  const [usersDb, setUsersDb] = useState(() => load("bakahub_users_v6", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("bakahub_session_v6", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Produk & Kategori
  const [products, setProducts] = useState(() => load("bakahub_products_v6", INITIAL_PRODUCTS));
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pesanan & Peti Masuk
  const [orders, setOrders] = useState(() => load("bakahub_orders_v6", []));

  // Troli & Kupon
  const [cart, setCart] = useState(() => load("bakahub_cart_v6", []));
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Baucar PIN
  const [pinDb, setPinDb] = useState(() => load("bakahub_pins_v6", [
    { code: "BK5-8888-9999", value: 5, status: "AVAILABLE" },
    { code: "BK10-1111-2222", value: 10, status: "AVAILABLE" },
    { code: "BK50-3333-4444", value: 50, status: "AVAILABLE" }
  ]));

  // Hamburger Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);
  const [showInbox, setShowInbox] = useState(false);

  // Tiket Bantuan
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", category: "Masalah Pembelian / Topup", message: "" });
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Admin Portal
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("orders");
  const [adminMsgInputs, setAdminMsgInputs] = useState({});
  const [newProd, setNewProd] = useState({
    title: "", category: "template", desc: "", price: "15",
    previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma"
  });

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Sync LocalStorage
  useEffect(() => save("bakahub_users_v6", usersDb), [usersDb]);
  useEffect(() => save("bakahub_session_v6", currentUsername), [currentUsername]);
  useEffect(() => save("bakahub_products_v6", products), [products]);
  useEffect(() => save("bakahub_orders_v6", orders), [orders]);
  useEffect(() => save("bakahub_cart_v6", cart), [cart]);
  useEffect(() => save("bakahub_pins_v6", pinDb), [pinDb]);

  // Click outside to close Hamburger Dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  // Auth: Daftar / Login (TANPA BONUS PENDAFTARAN)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila isi semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
      }
      // Dilarang sebarang bonus pendaftaran (balance: 0.0)
      const newUser = { 
        username: u, 
        password: p, 
        balance: 0.0, 
        hasClaimedFirstRechargeBonus: false,
        recharges: []
      };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      setCurrentUsername(u);
      setShowAuth(false);
      showToast(`🎉 Akaun berjaya didaftarkan. Selamat datang, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      setShowAuth(false);
      showToast(`Log masuk berjaya!`);
    }
    setAuthForm({ user: "", pass: "", err: "" });
  };

  const handleLogout = () => {
    setCurrentUsername("");
    setMenuOpen(false);
    showToast("Anda telah log keluar.");
  };

  const updateUserBalance = (fields) => {
    if (!currentUser) return;
    const updated = usersDb.map((u) => u.username === currentUser.username ? { ...u, ...fields } : u);
    setUsersDb(updated);
  };

  const requireUser = (fn) => {
    if (!currentUser) {
      setAuthForm({ user: "", pass: "", err: "Sila log masuk atau daftar akaun terlebih dahulu!" });
      setShowAuth(true);
      return;
    }
    fn();
  };

  // LOGIK FIRST TIME RECHARGE BONUS SISTEM
  const handleRedeem = (e) => {
    e.preventDefault();
    requireUser(() => {
      const code = inputPin.trim().toUpperCase();
      const target = pinDb.find((p) => p.code.toUpperCase() === code);
      if (!target) return showToast("❌ Kod PIN tidak sah!");
      if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

      const isFirstRecharge = !currentUser.hasClaimedFirstRechargeBonus;
      let bonusEarned = 0;

      if (isFirstRecharge) {
        if (target.value === 5) bonusEarned = 1;
        else if (target.value === 10) bonusEarned = 2;
        else if (target.value === 50) bonusEarned = 5;
      }

      const totalCredited = +(target.value + bonusEarned).toFixed(2);
      const newBalance = +(currentUser.balance + totalCredited).toFixed(2);

      const rechargeRecord = {
        txId: `TX-RCG-${Date.now()}`,
        pinCode: target.code,
        pinValue: target.value,
        bonusGiven: bonusEarned,
        totalCredited,
        date: new Date().toLocaleString("ms-MY")
      };

      // Kemas kini data pengguna secara transaction-safe
      updateUserBalance({
        balance: newBalance,
        hasClaimedFirstRechargeBonus: currentUser.hasClaimedFirstRechargeBonus || (isFirstRecharge && bonusEarned > 0),
        recharges: [rechargeRecord, ...(currentUser.recharges || [])]
      });

      // Tandakan PIN sebagai digunakan
      setPinDb(pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p));
      setInputPin("");
      setShowRedeem(false);

      if (bonusEarned > 0) {
        showToast(`🎉 RECHARGE PERTAMA: Duit RM ${target.value} + Bonus RM ${bonusEarned} dimasukkan! (Jumlah: RM ${totalCredited})`);
      } else {
        showToast(`✅ Top-up RM ${target.value}.00 berjaya dimasukkan ke baki dompet.`);
      }
    });
  };

  // Troli & Diskaun
  const addToCart = (product) => {
    if (cart.some((item) => item.id === product.id)) return showToast("Produk sudah ada di troli!");
    setCart([...cart, product]);
    showToast(`${product.title} ditambah ke troli!`);
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

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

  // Checkout Pesanan
  const executeCheckout = (itemsToBuy, totalCost) => {
    requireUser(() => {
      if (currentUser.balance < totalCost) {
        return showToast("Baki tidak cukup! Sila masukkan PIN baucar.");
      }

      updateUserBalance({ balance: +(currentUser.balance - totalCost).toFixed(2) });

      const newOrders = itemsToBuy.map((item) => ({
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        username: currentUser.username,
        productId: item.id,
        productTitle: item.title,
        category: item.category,
        price: item.price,
        status: "PENDING",
        adminMessage: null,
        createdAt: new Date().toLocaleString("ms-MY"),
        deliveredAt: null
      }));

      const updatedOrders = [...newOrders, ...orders];
      setOrders(updatedOrders);
      setCart(cart.filter((c) => !itemsToBuy.some((b) => b.id === c.id)));
      setShowCartDrawer(false);
      showToast(`⏳ Pesanan dihantar ke Admin! Semak status di Peti Masuk.`);
    });
  };

  // Admin Fulfillment
  const handleFulfillOrder = (orderId) => {
    const messageToSend = adminMsgInputs[orderId];
    if (!messageToSend || !messageToSend.trim()) {
      return showToast("Sila taipkan mesej atau pautan sebelum menghantar!");
    }

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "DELIVERED",
          adminMessage: messageToSend.trim(),
          deliveredAt: new Date().toLocaleString("ms-MY")
        };
      }
      return o;
    });

    setOrders(updated);
    setAdminMsgInputs({ ...adminMsgInputs, [orderId]: "" });
    showToast("🚀 Mesej & Butiran Berjaya Dihantar ke Peti Masuk Pengguna!");
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const myInboxOrders = orders.filter((o) => currentUser && o.username === currentUser.username);

  // Tiket Bantuan ke shhmrvl@gmail.com
  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.email || !ticketForm.message) return showToast("Sila lengkapkan emel & mesej!");
    setIsSendingTicket(true);
    const ticketId = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SUPPORT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          Ticket_ID: ticketId,
          Pengirim_Nama: ticketForm.name || (currentUser ? currentUser.username : "Tetamu"),
          Pengirim_Email: ticketForm.email,
          Kategori: ticketForm.category,
          Mesej: ticketForm.message,
          Tarikh: new Date().toLocaleString("ms-MY")
        })
      });
      if (res.ok) showToast(`✅ Tiket ${ticketId} berjaya dihantar ke ${SUPPORT_EMAIL}!`);
      else throw new Error();
    } catch {
      window.open(`mailto:${SUPPORT_EMAIL}?subject=[Tiket Bantuan ${ticketId}]&body=${encodeURIComponent(ticketForm.message)}`, "_blank");
      showToast(`✅ Tiket dibuka ke emel ${SUPPORT_EMAIL}!`);
    } finally {
      setIsSendingTicket(false);
      setShowTicketModal(false);
      setTicketForm({ name: "", email: "", category: "Masalah Pembelian / Topup", message: "" });
    }
  };

  // Admin Produk & PIN
  const handleAddProduct = (e) => {
    e.preventDefault();
    const pVal = parseFloat(newProd.price);
    if (!newProd.title.trim() || !pVal) return showToast("Sila isi tajuk dan harga!");

    const item = {
      id: `prod_${Date.now()}`,
      category: newProd.category,
      title: newProd.title.trim(),
      desc: newProd.desc.trim() || "Produk digital premium sedia dimuat turun.",
      price: pVal,
      rating: 5.0,
      sales: 0,
      previewImg: newProd.previewImg.trim() || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      fullWriteup: newProd.fullWriteup.trim() || "Penerangan lengkap produk digital berkualiti tinggi.",
      features: newProd.features.split(",").map(f => f.trim()).filter(Boolean)
    };

    setProducts([item, ...products]);
    setNewProd({ title: "", category: "template", desc: "", price: "15", previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma" });
    showToast("✅ Produk baharu berjaya diterbitkan!");
  };

  const handleDeleteProduct = (id, title) => {
    if (confirm(`Padam "${title}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      showToast(`Produk "${title}" telah dipadam.`);
    }
  };

  const handleGeneratePin = (val) => {
    const code = genPinWithVal(val);
    setPinDb([{ code, value: val, status: "AVAILABLE" }, ...pinDb]);
    showToast(`PIN RM ${val} Dijana: ${code}`);
  };

  const handleDeletePin = (code) => {
    setPinDb(pinDb.filter(p => p.code !== code));
    showToast(`PIN ${code} dipadam.`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      {/* =========================================================
          2. HEADER REDESIGN: LOGO (LEFT) & HAMBURGER (RIGHT) ONLY
          ========================================================= */}
      <header className="navbar-luxury" ref={menuRef}>
        <div className="brand-wrapper">
          <div className="brand-icon-lux"><ShoppingBag size={24} /></div>
          <div className="brand-meta">
            <h1>BakaHub Market</h1>
            <p className="mono">Digital Software & Templates</p>
          </div>
        </div>

        {/* Butang Hamburger Tunggal */}
        <button 
          className="hamburger-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Buka Menu Navigasi"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
          {(pendingOrdersCount > 0 || cart.length > 0) && (
            <span className="badge-alert-dot">
              {pendingOrdersCount + cart.length}
            </span>
          )}
        </button>

        {/* Dropdown Panel Navigasi Hamburger */}
        {menuOpen && (
          <div className="hamburger-dropdown">
            <button 
              className="menu-item-btn"
              onClick={() => { setMenuOpen(false); setShowTicketModal(true); }}
            >
              <div className="item-left"><LifeBuoy size={16} /> Tiket Bantuan</div>
            </button>

            {currentUser ? (
              <>
                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setShowInbox(true); }}
                >
                  <div className="item-left"><Inbox size={16} /> Peti Masuk</div>
                  {myInboxOrders.length > 0 && <span className="bonus-pill-tag">{myInboxOrders.length}</span>}
                </button>
                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setShowRedeem(true); }}
                >
                  <div className="item-left"><KeyRound size={16} /> Tebus PIN</div>
                </button>
                <button 
                  className="menu-item-btn"
                  onClick={handleLogout}
                  style={{ color: "#F43F5E" }}
                >
                  <div className="item-left"><LogOut size={16} /> Log Keluar ({currentUser.username})</div>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setAuthTab("login"); setShowAuth(true); }}
                >
                  <div className="item-left"><LogIn size={16} /> Log Masuk</div>
                </button>
                <button 
                  className="menu-item-btn accent-register"
                  onClick={() => { setMenuOpen(false); setAuthTab("register"); setShowAuth(true); }}
                >
                  <div className="item-left"><UserPlus size={16} /> Daftar Akaun</div>
                </button>
              </>
            )}

            <button 
              className="menu-item-btn accent-cart"
              onClick={() => { setMenuOpen(false); setShowCartDrawer(true); }}
            >
              <div className="item-left"><ShoppingCart size={16} /> Troli</div>
              {cart.length > 0 && <span className="bonus-pill-tag" style={{ color: "var(--neon-cyan)" }}>{cart.length}</span>}
            </button>

            <button 
              className="menu-item-btn accent-admin"
              onClick={() => { setMenuOpen(false); setShowAdmin(true); }}
            >
              <div className="item-left"><ShieldAlert size={16} /> Admin Portal</div>
              {pendingOrdersCount > 0 && <span className="badge-alert-dot" style={{ position: "static" }}>{pendingOrdersCount}</span>}
            </button>
          </div>
        )}
      </header>

      {/* =========================================================
          3 & 4. HERO SECTION – HEADLINE & 2-COLUMN RESPONSIVE LAYOUT
          ========================================================= */}
      <section className="hero-container">
        <div className="hero-text-col">
          <div className="hero-label-tag">
            <span>✦ YOUR DIGITAL MARKETPLACE</span>
          </div>
          <h2 className="hero-main-title">
            Segalanya Untuk <span className="gradient-teal">Projek Digital</span> Anda
          </h2>
          <p className="hero-subtext">
            Templat eksklusif, perisian digital dan akaun premium untuk membantu anda berkarya dengan lebih pantas, mudah dan profesional.
          </p>
        </div>

        {/* Visual Ilustrasi 2-Column Desktop */}
        <div className="hero-visual-board">
          <div className="floating-card-mock anim-1">
            <div className="mock-icon-box" style={{ background: "rgba(0, 217, 245, 0.15)", color: "var(--neon-cyan)" }}>
              <Globe size={22} />
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem" }}>Templat Kad Kahwin & Bisnes</strong>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Siap RSVP, muzik latar & Google Maps</p>
            </div>
          </div>

          <div className="floating-card-mock anim-2">
            <div className="mock-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--admin-accent)" }}>
              <Bot size={22} />
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem" }}>Akaun Premium & AI Berlesen</strong>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ChatGPT Plus, Netflix 4K, Spotify</p>
            </div>
          </div>

          <div className="floating-card-mock anim-3">
            <div className="mock-icon-box" style={{ background: "rgba(0, 212, 154, 0.15)", color: "var(--emerald)" }}>
              <Code size={22} />
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem" }}>Kod Sumber & UI Kit Moden</strong>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>React, Next.js & Tailwind sedia guna</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. BENEFIT SECTION (4 KAD KELEBIHAN)
          ========================================================= */}
      <section className="section-block">
        <div className="section-head-center">
          <h3 className="section-title">Kenapa Pilih BakaHub Market?</h3>
          <p className="section-subtitle">Segala keperluan digital anda dalam satu platform.</p>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Code size={20} /></div>
            <h3>Templat Premium</h3>
            <p>Reka bentuk digital berkualiti tinggi dan mudah diubah suai mengikut keperluan anda.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Crown size={20} /></div>
            <h3>Akaun Premium</h3>
            <p>Pilihan langganan digital popular dengan jaminan keselamatan dan sokongan berterusan.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Zap size={20} /></div>
            <h3>Akses Pantas</h3>
            <p>Proses pembelian mudah dengan penyerahan pantas terus ke Peti Masuk akaun anda.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><ShieldCheck size={20} /></div>
            <h3>Sokongan Dipercayai</h3>
            <p>Bantuan khidmat sokongan pantas melalui WhatsApp dan tiket bantuan bila-bila masa.</p>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. FIRST TIME RECHARGE BONUS SYSTEM (PROMOSI UTAMA)
          ========================================================= */}
      <section className="recharge-promo-block">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="promo-tag-badge">
              <Sparkles size={13} /> ONE-TIME BONUS – NEW USERS ONLY
            </div>
            <h3 style={{ fontSize: "1.65rem", fontWeight: 800 }}>FIRST TIME RECHARGE BONUS</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              Nikmati bonus istimewa untuk tambah nilai pertama anda!
            </p>
          </div>

          {currentUser && (
            <div className="mono" style={{ fontSize: "0.82rem", background: "rgba(0,0,0,0.4)", padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              Status Akaun: {currentUser.hasClaimedFirstRechargeBonus ? (
                <strong style={{ color: "var(--emerald)" }}>First Recharge Bonus Claimed ✓</strong>
              ) : (
                <strong style={{ color: "var(--neon-cyan)" }}>Layak Menerima Bonus Promosi</strong>
              )}
            </div>
          )}
        </div>

        <div className="recharge-grid">
          <div className="recharge-card-lux">
            <div>
              <span className="mono" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>TOPUP RM5</span>
              <div style={{ margin: "0.5rem 0" }}><span className="bonus-pill-tag">BONUS +RM1</span></div>
            </div>
            <div>
              <div className="mono total-credit-val">TOTAL RM6</div>
              <small className="mono" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Kredit Diterima</small>
            </div>
          </div>

          <div className="recharge-card-lux" style={{ borderColor: "rgba(0, 217, 245, 0.4)" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>TOPUP RM10</span>
              <div style={{ margin: "0.5rem 0" }}><span className="bonus-pill-tag" style={{ borderColor: "var(--neon-cyan)", color: "var(--neon-cyan)" }}>BONUS +RM2</span></div>
            </div>
            <div>
              <div className="mono total-credit-val" style={{ color: "var(--neon-cyan)" }}>TOTAL RM12</div>
              <small className="mono" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Pilihan Paling Popular</small>
            </div>
          </div>

          <div className="recharge-card-lux" style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>TOPUP RM50</span>
              <div style={{ margin: "0.5rem 0" }}><span className="bonus-pill-tag" style={{ borderColor: "var(--admin-accent)", color: "var(--admin-accent)" }}>BONUS +RM5</span></div>
            </div>
            <div>
              <div className="mono total-credit-val" style={{ color: "var(--admin-accent)" }}>TOTAL RM55</div>
              <small className="mono" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Nilai Maksimum</small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. WHATSAPP SUPPORT SECTION
          ========================================================= */}
      <section className="whatsapp-support-box">
        <div className="wa-left-meta">
          <span className="wa-label-tag">BELI PIN / BANTUAN ADMIN</span>
          <h3 style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0.3rem 0" }}>Perlukan Bantuan?</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Hubungi admin kami untuk pertanyaan, pembelian PIN dan bantuan berkaitan produk digital.
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="wa-btn-pill">
            <MessageCircle size={20} /> WhatsApp Admin – 018-3915460
          </a>
          <p style={{ fontSize: "0.75rem", color: "var(--emerald)", marginTop: "0.6rem", fontWeight: 600 }}>
            ● Khidmat Sokongan Pantas
          </p>
        </div>
      </section>

      {/* =========================================================
          STATUS DOMPET PENGGUNA
          ========================================================= */}
      <section className="wallet-card-grid">
        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Baki Dompet Anda
          </span>
          <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
            {currentUser ? `RM ${currentUser.balance.toFixed(2)}` : "Sila Log Masuk"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-buy-now mono" onClick={() => requireUser(() => setShowRedeem(true))}>
              <KeyRound size={14} /> Tebus Baucar PIN
            </button>
            <button className="btn-action-icon mono" style={{ width: "auto", padding: "0 0.8rem" }} onClick={() => setShowTicketModal(true)}>
              Tiket Bantuan
            </button>
          </div>
        </div>

        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700 }}>
            Pesanan Di Peti Masuk
          </span>
          <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--neon-cyan)", marginTop: "0.2rem" }}>
            {currentUser ? `${myInboxOrders.length} Item` : "--"}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem", display: "block" }}>
            Semak fail templat, kod sumber dan mesej penyerahan admin di Peti Masuk.
          </span>
        </div>
      </section>

      {/* =========================================================
          KATALOG PRODUK & PENAPIS (MOBILE OPTIMIZED)
          ========================================================= */}
      <div className="toolbar-row">
        <div className="filter-group mono">
          <button 
            className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            Semua ({products.length})
          </button>
          <button 
            className={`filter-btn ${activeCategory === "template" ? "active" : ""}`}
            onClick={() => setActiveCategory("template")}
          >
            <Globe size={14} /> Templat Laman Web
          </button>
          <button 
            className={`filter-btn ${activeCategory === "account" ? "active" : ""}`}
            onClick={() => setActiveCategory("account")}
          >
            <Bot size={14} /> Akaun & AI Premium
          </button>
          <button 
            className={`filter-btn ${activeCategory === "source" ? "active" : ""}`}
            onClick={() => setActiveCategory("source")}
          >
            <Code size={14} /> Kod Sumber / UI Kit
          </button>
        </div>

        <div className="search-input-box">
          <Search size={15} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Cari templat atau akaun..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Produk */}
      <section className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="prod-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`prod-tag tag-${p.category}`}>
                  {p.category === "template" ? "Website Template" : p.category === "account" ? "Akaun Premium" : "Source Code"}
                </span>
                <span className="mono" style={{ fontSize: "0.72rem", color: "var(--admin-accent)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Star size={11} fill="var(--admin-accent)" /> {p.rating || 5.0}
                </span>
              </div>

              <h3 className="prod-title">{p.title}</h3>
              <p className="prod-desc">{p.desc}</p>

              {p.features && p.features.length > 0 && (
                <div className="prod-features-list mono">
                  {p.features.map((f, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Check size={12} color="var(--emerald)" /> {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prod-footer">
              <span className="prod-price mono">RM {p.price.toFixed(2)}</span>

              <div className="prod-actions-row">
                <button 
                  className="btn-action-icon"
                  onClick={() => setPreviewProduct(p)}
                  title="Lihat Maklumat & Gambar"
                >
                  <Eye size={15} />
                </button>
                <button 
                  className="btn-action-icon"
                  onClick={() => addToCart(p)}
                  title="Tambah ke Troli"
                >
                  <ShoppingCart size={15} />
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

      {/* =========================================================
          MODALS & SYSTEM OVERLAYS (FUNGSI ASAL KEKAL SEPENUHNYA)
          ========================================================= */}

      {/* MODAL PETI MASUK PENGGUNA (INBOX & STATUS PESANAN) */}
      {showInbox && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--neon-cyan)" }}>
                <Inbox size={20} /> Peti Masuk Penghantaran
              </h3>
              <button onClick={() => setShowInbox(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {myInboxOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                <Package size={36} style={{ margin: "0 auto 0.5rem auto", opacity: 0.4 }} />
                <p>Tiada pesanan di peti masuk anda.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {myInboxOrders.map((ord) => (
                  <div key={ord.id} style={{ background: "#060A14", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "0.95rem", color: "#fff" }}>{ord.productTitle}</strong>
                        <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          No. Pesanan: {ord.id} • RM {ord.price.toFixed(2)}
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "6px", background: ord.status === "DELIVERED" ? "rgba(0, 212, 154, 0.15)" : "rgba(245, 158, 11, 0.15)", color: ord.status === "DELIVERED" ? "var(--emerald)" : "var(--admin-accent)" }}>
                        {ord.status === "DELIVERED" ? "✅ SELESAI" : "⏳ MENUNGGU PENGESAHAN"}
                      </span>
                    </div>

                    {ord.status === "PENDING" && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem", background: "rgba(245, 158, 11, 0.06)", padding: "0.6rem", borderRadius: "8px" }}>
                        Pesanan telah diterima. Admin sedang memproses kredensial atau pautan fail untuk anda sebentar lagi.
                      </p>
                    )}

                    {ord.status === "DELIVERED" && ord.adminMessage && (
                      <div style={{ background: "rgba(0, 217, 245, 0.06)", border: "1px solid var(--neon-cyan)", borderRadius: "8px", padding: "0.75rem", marginTop: "0.6rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--neon-cyan)", fontWeight: 700, marginBottom: "0.25rem" }}>
                          Mesej Butiran Dari Admin:
                        </div>
                        <div className="mono" style={{ fontSize: "0.82rem", color: "#F8FAFC", whiteSpace: "pre-wrap" }}>
                          {ord.adminMessage}
                        </div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(ord.adminMessage); showToast("Butiran disalin!"); }}
                          className="btn-buy-now mono"
                          style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem", marginTop: "0.5rem" }}
                        >
                          <Copy size={12} /> Salin Butiran
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PRATONTON GAMBAR & PENERANGAN PENUH */}
      {previewProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{previewProduct.title}</h3>
              <button onClick={() => setPreviewProduct(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ width: "100%", maxHeight: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)", marginBottom: "1rem" }}>
              <img 
                src={previewProduct.previewImg} 
                alt={previewProduct.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            <div style={{ background: "#020B16", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
              <h4 style={{ color: "var(--neon-cyan)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>Penerangan Penuh:</h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{previewProduct.fullWriteup || previewProduct.desc}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--emerald)" }}>
                RM {previewProduct.price.toFixed(2)}
              </span>
              <button 
                className="btn-buy-now mono"
                onClick={() => {
                  setPreviewProduct(null);
                  executeCheckout([previewProduct], previewProduct.price);
                }}
              >
                Beli Produk Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TROLI BELI-BELAH */}
      {showCartDrawer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <ShoppingCart size={18} color="var(--neon-cyan)" /> Troli Pembelian ({cart.length})
              </h3>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>Troli anda masih kosong.</p>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem", maxHeight: "200px", overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020B16", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                      <div>
                        <strong style={{ fontSize: "0.85rem" }}>{item.title}</strong>
                        <div className="mono" style={{ fontSize: "0.75rem", color: "var(--emerald)" }}>RM {item.price.toFixed(2)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#F43F5E", cursor: "pointer" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
                  <input 
                    type="text" 
                    className="input-styled mono" 
                    style={{ textTransform: "uppercase", margin: 0, padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
                    placeholder="Kupon (cth: BAKA50)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon} className="btn-action-icon mono" style={{ width: "auto", padding: "0 0.9rem" }}>Tebus</button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.7rem", marginBottom: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    <span>Jumlah Kasar:</span>
                    <span className="mono">RM {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--emerald)", fontSize: "0.8rem" }}>
                      <span>Diskaun ({discountPercent}%):</span>
                      <span className="mono">- RM {(cartSubtotal * discountPercent / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.3rem" }}>
                    <span>Total Pembayaran:</span>
                    <span className="mono" style={{ color: "var(--emerald)" }}>RM {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="btn-buy-now mono" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  onClick={() => executeCheckout(cart, cartTotal)}
                >
                  Bayar Guna Baki (RM {cartTotal.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TIKET BANTUAN */}
      {showTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--neon-cyan)" }}>
                <LifeBuoy size={18} /> Tiket Bantuan Pengguna
              </h3>
              <button onClick={() => setShowTicketModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
              Tiket ini akan dihantar terus ke peti mel: <strong style={{ color: "var(--emerald)" }}>{SUPPORT_EMAIL}</strong>
            </p>

            <form onSubmit={handleSendTicket}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>EMAIL ANDA (WAJIB)</label>
                <input type="email" className="input-styled mono" placeholder="nama@gmail.com" value={ticketForm.email} onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>KATEGORI ISU</label>
                <select className="input-styled mono" value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
                  <option value="Masalah Pembelian / Topup">Masalah Pembelian / Topup PIN</option>
                  <option value="Pertanyaan Pesanan Belum Diterima">Pertanyaan Pesanan Belum Diterima</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>MESEJ BANTUAN</label>
                <textarea className="input-styled mono" rows="4" placeholder="Tuliskan masalah anda..." value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} required style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem" }} disabled={isSendingTicket}>
                <Send size={15} /> {isSendingTicket ? "Menghantar..." : "Hantar Tiket ke Admin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUTH (LOGIN & REGISTER - TIADA BONUS PENDAFTARAN) */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1rem" }} className="mono">
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", borderBottom: authTab === "login" ? "2px solid var(--emerald)" : "none", color: authTab === "login" ? "var(--emerald)" : "var(--text-secondary)", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", borderBottom: authTab === "register" ? "2px solid var(--emerald)" : "none", color: authTab === "register" ? "var(--emerald)" : "var(--text-secondary)", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("register")}>Daftar Akaun</button>
            </div>
            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "#F43F5E", padding: "0.5rem", borderRadius: "6px", fontSize: "0.78rem", marginBottom: "0.8rem" }}>{authForm.err}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: "0.8rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Cth: FaridDigital" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TEBUS PIN */}
      {showRedeem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--emerald)" }}>
                <Ticket size={18} /> Tebus PIN Top-up Dompet
              </h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="menu-item-btn accent-register" style={{ justifyContent: "center", padding: "0.65rem", marginBottom: "1rem" }}>
              <MessageCircle size={16} /> Beli PIN di WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeem}>
              <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>MASUKKAN KOD PIN BAUCA</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.1rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-XXXX-XXXX" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.85rem" }}>
                Tebus Masuk Baki
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN DASHBOARD (PIN RAHSIA KEKAL DILINDUNGI) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--admin-accent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--admin-accent)" }}>
                <ShieldAlert size={18} /> Admin Management Portal
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("Akses Ditolak: PIN Salah!"); }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.6rem" }}>
                  Masukkan PIN Keselamatan Pentadbir:
                </p>
                <input 
                  type="password" 
                  maxLength={6} 
                  className="input-styled mono" 
                  style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "6px" }} 
                  placeholder="••••••" 
                  value={adminPin} 
                  onChange={(e) => setAdminPin(e.target.value)} 
                  autoFocus 
                />
                <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.85rem", background: "var(--admin-accent)", color: "#020B16" }}>
                  Sahkan Akses
                </button>
              </form>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }} className="mono">
                  <button className={`filter-btn ${adminTab === "orders" ? "active" : ""}`} onClick={() => setAdminTab("orders")} style={{ flex: 1, justifyContent: "center" }}>
                    Pesanan Masuk {pendingOrdersCount > 0 && `(${pendingOrdersCount})`}
                  </button>
                  <button className={`filter-btn ${adminTab === "products" ? "active" : ""}`} onClick={() => setAdminTab("products")} style={{ flex: 1, justifyContent: "center" }}>
                    Urus Produk
                  </button>
                  <button className={`filter-btn ${adminTab === "pins" ? "active" : ""}`} onClick={() => setAdminTab("pins")} style={{ flex: 1, justifyContent: "center" }}>
                    Jana PIN
                  </button>
                </div>

                {adminTab === "orders" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {orders.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1.5rem" }}>Tiada sebarang pesanan masuk.</p>
                    ) : (
                      orders.map((ord) => (
                        <div key={ord.id} style={{ background: "#020B16", border: "1px solid var(--border-subtle)", padding: "0.9rem", borderRadius: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong style={{ fontSize: "0.9rem", color: "#fff" }}>{ord.productTitle}</strong>
                              <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                Pembeli: <span style={{ color: "var(--emerald)" }}>{ord.username}</span> • RM {ord.price.toFixed(2)}
                              </div>
                            </div>
                            <span className="mono" style={{ fontSize: "0.7rem", color: ord.status === "DELIVERED" ? "var(--emerald)" : "var(--admin-accent)" }}>
                              {ord.status}
                            </span>
                          </div>

                          {ord.status === "PENDING" && (
                            <div style={{ marginTop: "0.6rem" }}>
                              <textarea
                                className="input-styled mono"
                                rows="2"
                                placeholder="Key-in pautan fail atau akaun di sini..."
                                value={adminMsgInputs[ord.id] || ""}
                                onChange={(e) => setAdminMsgInputs({ ...adminMsgInputs, [ord.id]: e.target.value })}
                              />
                              <button 
                                onClick={() => handleFulfillOrder(ord.id)}
                                className="btn-buy-now mono"
                                style={{ marginTop: "0.4rem", width: "100%", justifyContent: "center" }}
                              >
                                <Send size={14} /> Hantar ke Peti Pengguna
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminTab === "products" && (
                  <div>
                    <div style={{ background: "#020B16", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.88rem", color: "var(--neon-cyan)", marginBottom: "0.5rem" }}>+ Tambah Produk Baharu</h4>
                      <form onSubmit={handleAddProduct}>
                        <input type="text" className="input-styled mono" placeholder="Nama Produk" value={newProd.title} onChange={(e) => setNewProd({ ...newProd, title: e.target.value })} required />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: "0.4rem" }}>
                          <select className="input-styled mono" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}>
                            <option value="template">Website Template</option>
                            <option value="account">Akaun Premium</option>
                            <option value="source">Source Code</option>
                          </select>
                          <input type="number" step="0.5" className="input-styled mono" placeholder="Harga RM" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required />
                        </div>
                        <input type="text" className="input-styled mono" placeholder="Pautan URL Gambar" value={newProd.previewImg} onChange={(e) => setNewProd({ ...newProd, previewImg: e.target.value })} />
                        <textarea className="input-styled mono" rows="2" placeholder="Penerangan penuh produk..." value={newProd.fullWriteup} onChange={(e) => setNewProd({ ...newProd, fullWriteup: e.target.value })} />
                        <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}>
                          Terbitkan Produk
                        </button>
                      </form>
                    </div>

                    <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {products.map((p) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020B16", padding: "0.5rem 0.75rem", borderRadius: "6px" }}>
                          <div>
                            <strong style={{ fontSize: "0.82rem" }}>{p.title}</strong>
                            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--emerald)", marginLeft: "0.5rem" }}>RM {p.price}</span>
                          </div>
                          <button onClick={() => handleDeleteProduct(p.id, p.title)} style={{ background: "none", border: "none", color: "#F43F5E", cursor: "pointer" }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "pins" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.45rem", marginBottom: "0.8rem" }}>
                      <button onClick={() => handleGeneratePin(5)} className="btn-buy-now mono" style={{ justifyContent: "center" }}>+ RM 5</button>
                      <button onClick={() => handleGeneratePin(10)} className="btn-buy-now mono" style={{ justifyContent: "center", background: "var(--neon-cyan)" }}>+ RM 10</button>
                      <button onClick={() => handleGeneratePin(50)} className="btn-buy-now mono" style={{ justifyContent: "center", background: "var(--admin-accent)" }}>+ RM 50</button>
                    </div>
                    <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {pinDb.map((pin, i) => (
                        <div key={i} className="mono" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020B16", padding: "0.45rem 0.75rem", borderRadius: "6px", fontSize: "0.78rem" }}>
                          <div>
                            <strong>{pin.code}</strong> (RM {pin.value}) - <span style={{ color: pin.status === "AVAILABLE" ? "var(--emerald)" : "var(--text-secondary)" }}>{pin.status}</span>
                          </div>
                          <button onClick={() => handleDeletePin(pin.code)} style={{ background: "none", border: "none", color: "#F43F5E", cursor: "pointer" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

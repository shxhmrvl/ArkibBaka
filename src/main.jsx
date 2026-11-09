import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  ShoppingBag, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ShieldAlert, X, Copy, PlusCircle, Ticket, MessageCircle, 
  Package, Sparkles, Globe, Bot, ArrowRight, Eye, Search, 
  ShoppingCart, Download, Code, Star, Trash2, Check,
  Send, LifeBuoy, Inbox, Clock, CheckCircle2, AlertTriangle, FileText
} from "lucide-react";

// PIN RAHSIA ADMIN (TIDAK DITAMPILKAN PADA UI)
const ADMIN_PIN = "200200";
const SUPPORT_EMAIL = "shhmrvl@gmail.com";
const WHATSAPP_PHONE = "60183915460";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Salam Admin, saya nak beli PIN Topup BakaHub Market")}`;

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
    fullWriteup: "Templat jemputan kahwin digital moden dengan susunan fon elegan. Pengunjung boleh mengesahkan kehadiran melalui borang RSVP terus ke spreadsheet/WhatsApp, mendengar lagu pengantin, serta menekan pautan navigasi Waze dan Google Maps secara langsung.",
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
    fullWriteup: "Landing page berprestasi tinggi yang dioptimumkan untuk konversi jualan perisian SaaS. Dilengkapi dengan jadual harga (Pricing Table), testimoni pelanggan, bahagian FAQ akordion, dan reka bentuk gelap (Dark Mode).",
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
    id: "prm_youtube_prem",
    category: "account",
    title: "YouTube Premium + YouTube Music",
    desc: "Tonton video tanpa iklan, main di latar belakang skrin telefon & akses aplikasi YouTube Music.",
    price: 9.0,
    rating: 4.8,
    sales: 290,
    previewImg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Akses video bebas iklan di telefon, PC dan Smart TV. Menyokong Picture-in-Picture (PiP) dan mainan latar belakang semasa skrin telefon ditutup.",
    features: ["Tanpa Gangguan Iklan", "Main Belakang Skrin", "Termasuk YT Music App"]
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
  const [usersDb, setUsersDb] = useState(() => load("bakahub_users_v5", []));
  const [currentUsername, setCurrentUsername] = useState(() => load("bakahub_session_v5", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  // Produk & Kategori
  const [products, setProducts] = useState(() => load("bakahub_products_v5", INITIAL_PRODUCTS));
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // SISTEM PESANAN & PETI MASUK (INBOX & ORDER QUEUE)
  const [orders, setOrders] = useState(() => load("bakahub_orders_v5", []));

  // Troli & Kupon
  const [cart, setCart] = useState(() => load("bakahub_cart_v5", []));
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Baucar PIN
  const [pinDb, setPinDb] = useState(() => load("bakahub_pins_v5", [
    { code: "BK5-8888-9999", value: 5, status: "AVAILABLE" },
    { code: "BK10-1111-2222", value: 10, status: "AVAILABLE" },
    { code: "BK50-3333-4444", value: 50, status: "AVAILABLE" }
  ]));

  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);

  // Peti Masuk Pengguna Modal
  const [showInbox, setShowInbox] = useState(false);

  // Tiket Bantuan
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", category: "Masalah Pembelian / Topup", message: "" });
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Admin Portal & Fulfillment Queue
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("orders"); // 'orders' | 'products' | 'pins'
  
  // State untuk Admin Key-in Mesej bagi Pesanan Tertentu
  const [adminMsgInputs, setAdminMsgInputs] = useState({});

  // Borang Tambah Produk
  const [newProd, setNewProd] = useState({
    title: "", category: "template", desc: "", price: "15",
    previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma"
  });

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => save("bakahub_users_v5", usersDb), [usersDb]);
  useEffect(() => save("bakahub_session_v5", currentUsername), [currentUsername]);
  useEffect(() => save("bakahub_products_v5", products), [products]);
  useEffect(() => save("bakahub_orders_v5", orders), [orders]);
  useEffect(() => save("bakahub_cart_v5", cart), [cart]);
  useEffect(() => save("bakahub_pins_v5", pinDb), [pinDb]);

  // Auth: Daftar / Login
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila isi semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
      }
      const newUser = { username: u, password: p, balance: 10.0 }; // Bonus pendaftaran RM10
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      setCurrentUsername(u);
      setShowAuth(false);
      showToast(`🎉 Selamat datang! Kredit percuma RM 10.00 diberikan.`);
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

  // Tebus PIN
  const handleRedeem = (e) => {
    e.preventDefault();
    requireUser(() => {
      const code = inputPin.trim().toUpperCase();
      const target = pinDb.find((p) => p.code.toUpperCase() === code);
      if (!target) return showToast("❌ Kod PIN tidak sah!");
      if (target.status === "USED") return showToast(`❌ PIN telah ditebus oleh ${target.usedBy}!`);

      updateUserBalance({ balance: +(currentUser.balance + target.value).toFixed(2) });
      setPinDb(pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username } : p));
      setInputPin("");
      setShowRedeem(false);
      showToast(`🎉 +RM ${target.value}.00 dimasukkan ke baki dompet!`);
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

  // ALIRAN PEMBELIAN BARU: MASUK STATUS "PENDING" DAHULU
  const executeCheckout = (itemsToBuy, totalCost) => {
    requireUser(() => {
      if (currentUser.balance < totalCost) {
        return showToast("Baki tidak cukup! Sila top-up baucar PIN.");
      }

      // Tolak baki RM serta-merta
      updateUserBalance({ balance: +(currentUser.balance - totalCost).toFixed(2) });

      // Cipta Pesanan dengan Status: PENDING (Belum dihantar oleh Admin)
      const newOrders = itemsToBuy.map((item) => ({
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        username: currentUser.username,
        productId: item.id,
        productTitle: item.title,
        category: item.category,
        price: item.price,
        status: "PENDING", // PENDING PENGESAHAN ADMIN
        adminMessage: null, // Admin akan key-in mesej ini
        createdAt: new Date().toLocaleString("ms-MY"),
        deliveredAt: null
      }));

      const updatedOrders = [...newOrders, ...orders];
      setOrders(updatedOrders);
      save("bakahub_orders_v5", updatedOrders);

      setCart(cart.filter((c) => !itemsToBuy.some((b) => b.id === c.id)));
      setShowCartDrawer(false);
      showToast(`⏳ Pesanan berjaya dihantar ke Admin! Sila semak status di Peti Masuk.`);
    });
  };

  // FUNGSI ADMIN: HANTAR MESEJ / KREDENSIAL KE PETI MASUK PENGGUNA
  const handleFulfillOrder = (orderId) => {
    const messageToSend = adminMsgInputs[orderId];
    if (!messageToSend || !messageToSend.trim()) {
      return showToast("Sila taipkan mesej atau kredensial sebelum menghantar!");
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
    save("bakahub_orders_v5", updated);

    // Kosongkan input mesej pesanan berkenaan
    setAdminMsgInputs({ ...adminMsgInputs, [orderId]: "" });
    showToast("🚀 Mesej & Butiran Berjaya Dihantar ke Peti Masuk Pengguna!");
  };

  // Bilangan pesanan Pending untuk notifikasi Admin
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;

  // Bilangan mesej dalam Peti Masuk pengguna semasa
  const myInboxOrders = orders.filter((o) => currentUser && o.username === currentUser.username);
  const myDeliveredCount = myInboxOrders.filter((o) => o.status === "DELIVERED").length;

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

  // Admin Tambah & Padam Produk
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

    const updated = [item, ...products];
    setProducts(updated);
    save("bakahub_products_v5", updated);
    setNewProd({ title: "", category: "template", desc: "", price: "15", previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma" });
    showToast("✅ Produk baharu berjaya diterbitkan!");
  };

  const handleDeleteProduct = (id, title) => {
    if (confirm(`Padam "${title}"?`)) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      save("bakahub_products_v5", updated);
      showToast(`Produk "${title}" telah dipadam.`);
    }
  };

  // Admin PIN generator
  const handleGeneratePin = (val) => {
    const code = genPinWithVal(val);
    const updated = [{ code, value: val, status: "AVAILABLE" }, ...pinDb];
    setPinDb(updated);
    save("bakahub_pins_v5", updated);
    showToast(`PIN RM ${val} Dijana: ${code}`);
  };

  const handleDeletePin = (code) => {
    const updated = pinDb.filter(p => p.code !== code);
    setPinDb(updated);
    save("bakahub_pins_v5", updated);
    showToast(`PIN ${code} dipadam.`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-container">
      {toast && <div className="toast-msg">{toast}</div>}

      {/* Navbar Responsif */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon"><ShoppingBag size={22} /></div>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>BakaHub Market</h2>
            <p className="mono" style={{ fontSize: "0.7rem", color: "var(--cyan)" }}>
              {currentUser ? `Akaun: ${currentUser.username}` : "Digital Software & Templates"}
            </p>
          </div>
        </div>

        <div className="nav-actions">
          <button className="btn-pill btn-user mono" onClick={() => setShowTicketModal(true)}>
            <LifeBuoy size={14} /> Tiket Bantuan
          </button>

          {currentUser ? (
            <>
              <button className="btn-pill btn-user mono">
                <User size={14} /> {currentUser.username}
              </button>

              {/* BUTANG PETI MASUK / INBOX PENGGUNA */}
              <button className="btn-pill btn-inbox mono" onClick={() => setShowInbox(true)}>
                <Inbox size={14} /> Peti Masuk
                {myInboxOrders.length > 0 && (
                  <span className="badge-alert" style={{ background: myDeliveredCount > 0 ? "var(--green)" : "var(--gold)" }}>
                    {myInboxOrders.length}
                  </span>
                )}
              </button>

              <button className="btn-pill btn-green mono" onClick={() => setShowRedeem(true)}>
                <KeyRound size={14} /> Tebus PIN
              </button>
              <button className="btn-pill btn-user mono" onClick={handleLogout} title="Log Keluar">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>
                <LogIn size={14} /> Log Masuk
              </button>
              <button className="btn-pill btn-green mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>
                <UserPlus size={14} /> Daftar (+RM10)
              </button>
            </>
          )}

          <button className="btn-pill btn-cart-nav mono" onClick={() => setShowCartDrawer(true)}>
            <ShoppingCart size={15} />
            <span>Troli</span>
            {cart.length > 0 && <span className="cart-count-badge">{cart.length}</span>}
          </button>

          {/* Akses Admin Tanpa Memaparkan PIN */}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)} title="Admin Access">
            <ShieldAlert size={14} /> Admin
            {pendingOrdersCount > 0 && (
              <span className="badge-alert">{pendingOrdersCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Showcase Header */}
      <section className="hero-box">
        <div className="hero-left">
          <div className="badge-gradient">
            <Sparkles size={13} /> Gedung Templat & Perisian Digital #1
          </div>
          <h1 className="hero-title">
            Bina Projek Pantas dengan <span>Templat & Akaun Premium</span>
          </h1>
          <p className="hero-desc">
            Dapatkan templat kad kahwin interaktif, kod portfolio developer, serta langganan ChatGPT Plus, Netflix 4K dan Spotify pada harga komuniti paling berbaloi.
          </p>
        </div>

        <div style={{ background: "rgba(6, 10, 20, 0.8)", border: "1px solid var(--border-ui)", padding: "1rem", borderRadius: "12px", textAlign: "center", width: "100%", maxWidth: "260px" }}>
          <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Beli PIN / Bantuan Admin</span>
          <div style={{ margin: "0.5rem 0" }}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ width: "100%", justifyContent: "center" }}>
              <MessageCircle size={15} /> WhatsApp (018-3915460)
            </a>
          </div>
          <small className="mono" style={{ fontSize: "0.68rem", color: "var(--green)" }}>● Khidmat Sokongan Pantas</small>
        </div>
      </section>

      {/* Ringkasan Baki Dompet */}
      <section className="wallet-card-grid">
        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Baki Dompet Digital
          </span>
          <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginTop: "0.2rem" }}>
            {currentUser ? `RM ${currentUser.balance.toFixed(2)}` : "Sila Log Masuk"}
          </div>
          <div style={{ display: "flex", gap: "0.45rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn-pill btn-green mono" onClick={() => requireUser(() => setShowRedeem(true))}>
              <KeyRound size={13} /> Masukkan PIN
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono">
              Beli PIN
            </a>
          </div>
        </div>

        <div className="glass-card">
          <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Pesanan Di Peti Masuk
          </span>
          <div className="mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--cyan)", marginTop: "0.2rem" }}>
            {currentUser ? `${myInboxOrders.length} Pesanan` : "--"}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem", display: "block" }}>
            {currentUser && myInboxOrders.some(o => o.status === "PENDING") 
              ? "⏳ Terdapat pesanan sedang diproses Admin." 
              : "Semua pesanan selesai boleh disemak di Peti Masuk."}
          </span>
        </div>
      </section>

      {/* Kategori Tabs & Carian */}
      <div className="toolbar-row">
        <div className="filter-group mono">
          <button className={`filter-btn ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>
            Semua ({products.length})
          </button>
          <button className={`filter-btn ${activeCategory === "template" ? "active" : ""}`} onClick={() => setActiveCategory("template")}>
            <Globe size={14} /> Templat Laman Web
          </button>
          <button className={`filter-btn ${activeCategory === "account" ? "active" : ""}`} onClick={() => setActiveCategory("account")}>
            <Bot size={14} /> Akaun & AI Premium
          </button>
          <button className={`filter-btn ${activeCategory === "source" ? "active" : ""}`} onClick={() => setActiveCategory("source")}>
            <Code size={14} /> Kod Sumber / UI Kit
          </button>
        </div>

        <div className="search-input-box">
          <Search size={15} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Cari templat atau akaun..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Kad Produk */}
      <section className="product-grid">
        {filteredProducts.map((p) => (
          <div key={p.id} className="prod-card">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`prod-tag tag-${p.category}`}>
                  {p.category === "template" ? "Website Template" : p.category === "account" ? "Akaun Premium" : "Source Code"}
                </span>
                <span className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <Star size={11} fill="var(--gold)" /> {p.rating || 5.0}
                </span>
              </div>

              <h3 className="prod-title">{p.title}</h3>
              <p className="prod-desc">{p.desc}</p>

              {p.features && p.features.length > 0 && (
                <div className="prod-features-list mono">
                  {p.features.map((f, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Check size={12} color="var(--green)" /> {f}
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

      {/* MODAL PETI MASUK PENGGUNA (INBOX & STATUS PESANAN) */}
      {showInbox && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--cyan)" }}>
                <Inbox size={20} /> Peti Masuk & Penghantaran Produk
              </h3>
              <button onClick={() => setShowInbox(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {myInboxOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <Package size={36} style={{ margin: "0 auto 0.5rem auto", opacity: 0.4 }} />
                <p>Tiada pesanan di peti masuk anda.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {myInboxOrders.map((ord) => (
                  <div key={ord.id} className={`inbox-card ${ord.status === "DELIVERED" ? "delivered" : "pending"}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "0.95rem", color: "#fff" }}>{ord.productTitle}</strong>
                        <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          No. Pesanan: {ord.id} • RM {ord.price.toFixed(2)}
                        </div>
                      </div>
                      <span className={`badge-status ${ord.status === "DELIVERED" ? "badge-avail" : "badge-pending"}`}>
                        {ord.status === "DELIVERED" ? "✅ SELESAI" : "⏳ DALAM PENGESAHAN ADMIN"}
                      </span>
                    </div>

                    {/* JIKA STATUS: PENDING */}
                    {ord.status === "PENDING" && (
                      <div style={{ marginTop: "0.8rem", background: "rgba(245, 158, 11, 0.08)", border: "1px dashed rgba(245, 158, 11, 0.35)", padding: "0.75rem", borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gold)", fontSize: "0.78rem", fontWeight: 700 }}>
                          <Clock size={14} /> Pesanan Sedang Diproses
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          Admin telah menerima notifikasi pembelian anda. Kredensial log masuk, pautan muat turun, atau kunci lesen akan dihantar ke sini sebentar lagi.
                        </p>
                      </div>
                    )}

                    {/* JIKA STATUS: DELIVERED (ADMIN DAH HANTAR MESEJ) */}
                    {ord.status === "DELIVERED" && ord.adminMessage && (
                      <div className="admin-message-payload">
                        <div className="admin-msg-title">
                          <CheckCircle2 size={15} /> Mesej & Butiran Penghantaran Dari Admin:
                        </div>
                        <div className="admin-msg-body mono">
                          {ord.adminMessage}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                          <small className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            Dihantar pada: {ord.deliveredAt}
                          </small>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(ord.adminMessage); showToast("Butiran disalin!"); }}
                            className="btn-pill btn-cyan mono"
                            style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                          >
                            <Copy size={12} /> Salin Butiran
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PRATONTON (GAMBAR & TULISAN) */}
      {previewProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{previewProduct.title}</h3>
              <button onClick={() => setPreviewProduct(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ width: "100%", maxHeight: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-ui)", marginBottom: "1rem", background: "#060913" }}>
              <img 
                src={previewProduct.previewImg || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"} 
                alt={previewProduct.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            <div style={{ background: "#060913", border: "1px solid var(--border-ui)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
              <h4 style={{ color: "var(--cyan)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>Penerangan Penuh:</h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{previewProduct.fullWriteup || previewProduct.desc}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--green)" }}>
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

      {/* MODAL TROLI (SHOPPING CART) */}
      {showCartDrawer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <ShoppingCart size={18} color="var(--cyan)" /> Troli Pembelian ({cart.length})
              </h3>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {cart.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>Troli anda masih kosong.</p>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem", maxHeight: "200px", overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#060a14", padding: "0.65rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-ui)" }}>
                      <div>
                        <strong style={{ fontSize: "0.85rem" }}>{item.title}</strong>
                        <div className="mono" style={{ fontSize: "0.75rem", color: "var(--green)" }}>RM {item.price.toFixed(2)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}>
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
                  <button onClick={applyCoupon} className="btn-pill btn-cyan mono">Tebus</button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-ui)", paddingTop: "0.7rem", marginBottom: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    <span>Jumlah:</span>
                    <span className="mono">RM {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--green)", fontSize: "0.8rem" }}>
                      <span>Diskaun ({discountPercent}%):</span>
                      <span className="mono">- RM {(cartSubtotal * discountPercent / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 800, marginTop: "0.3rem" }}>
                    <span>Total:</span>
                    <span className="mono" style={{ color: "var(--green)" }}>RM {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="btn-buy-now mono" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  onClick={() => executeCheckout(cart, cartTotal)}
                >
                  Bayar & Hantar ke Pengesahan (RM {cartTotal.toFixed(2)})
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
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--cyan)" }}>
                <LifeBuoy size={18} /> Borang Tiket Bantuan Pengguna
              </h3>
              <button onClick={() => setShowTicketModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSendTicket}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>EMAIL ANDA (WAJIB)</label>
                <input type="email" className="input-styled mono" placeholder="nama@gmail.com" value={ticketForm.email} onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>KATEGORI ISU</label>
                <select className="input-styled mono" value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
                  <option value="Masalah Pembelian / Topup">Masalah Pembelian / Topup PIN</option>
                  <option value="Pertanyaan Pesanan Belum Diterima">Pertanyaan Pesanan Belum Diterima</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MESEJ BANTUAN</label>
                <textarea className="input-styled mono" rows="4" placeholder="Tuliskan masalah anda..." value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} required style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.8rem" }} disabled={isSendingTicket}>
                <Send size={15} /> {isSendingTicket ? "Menghantar..." : "Hantar Tiket ke Admin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Pusat Akses Akaun</h3>
              <button onClick={() => setShowAuth(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-ui)", marginBottom: "1rem" }} className="mono">
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", borderBottom: authTab === "login" ? "2px solid var(--green)" : "none", color: authTab === "login" ? "var(--green)" : "var(--text-muted)", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("login")}>Log Masuk</button>
              <button style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", borderBottom: authTab === "register" ? "2px solid var(--green)" : "none", color: authTab === "register" ? "var(--green)" : "var(--text-muted)", cursor: "pointer", fontWeight: 700 }} onClick={() => setAuthTab("register")}>Daftar (+RM10)</button>
            </div>
            {authForm.err && <div style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--red)", padding: "0.5rem", borderRadius: "6px", fontSize: "0.78rem", marginBottom: "0.8rem" }}>{authForm.err}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: "0.8rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>USERNAME</label>
                <input type="text" className="input-styled mono" placeholder="Cth: FaridDigital" value={authForm.user} onChange={(e) => setAuthForm({ ...authForm, user: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PASSWORD</label>
                <input type="password" className="input-styled mono" placeholder="••••••••" value={authForm.pass} onChange={(e) => setAuthForm({ ...authForm, pass: e.target.value })} required />
              </div>
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
                {authTab === "login" ? "Log Masuk Sekarang" : "Cipta Akaun & Tebus RM10"}
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
              <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--green)" }}>
                <Ticket size={18} /> Tebus PIN Top-up Dompet
              </h3>
              <button onClick={() => setShowRedeem(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-pill btn-whatsapp mono" style={{ width: "100%", justifyContent: "center", padding: "0.65rem", marginBottom: "1rem" }}>
              <MessageCircle size={15} /> Beli PIN di WhatsApp Admin (018-3915460)
            </a>
            <form onSubmit={handleRedeem}>
              <label className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>MASUKKAN KOD PIN BAUCA</label>
              <input type="text" className="input-styled mono" style={{ textAlign: "center", fontSize: "1.1rem", letterSpacing: "2px", textTransform: "uppercase" }} placeholder="BK5-XXXX-XXXX" value={inputPin} onChange={(e) => setInputPin(e.target.value)} required />
              <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.85rem" }}>
                Tebus Masuk Baki
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN DASHBOARD (PIN RAHSIA KEKAL DILINDUNGI & ORDER QUEUE) */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--gold)" }}>
                <ShieldAlert size={18} /> Admin Management Portal
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); } else showToast("Akses Ditolak: PIN Salah!"); }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
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
                <button type="submit" className="btn-pill btn-admin mono" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.85rem" }}>
                  Sahkan Akses
                </button>
              </form>
            ) : (
              <div>
                {/* Admin Navigation Tabs */}
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }} className="mono">
                  <button 
                    className={`filter-btn ${adminTab === "orders" ? "active" : ""}`}
                    onClick={() => setAdminTab("orders")}
                    style={{ flex: 1, justifyContent: "center", position: "relative" }}
                  >
                    Pesanan Masuk {pendingOrdersCount > 0 && `(${pendingOrdersCount})`}
                  </button>
                  <button 
                    className={`filter-btn ${adminTab === "products" ? "active" : ""}`}
                    onClick={() => setAdminTab("products")}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Urus Produk
                  </button>
                  <button 
                    className={`filter-btn ${adminTab === "pins" ? "active" : ""}`}
                    onClick={() => setAdminTab("pins")}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Jana PIN
                  </button>
                </div>

                {/* TAB 1: PENGESAHAN PESANAN & KEY-IN MESEJ PENGHANTARAN */}
                {adminTab === "orders" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>
                        PESANAN MENUNGGU PENGESAHAN: {pendingOrdersCount}
                      </span>
                    </div>

                    {orders.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>Tiada sebarang rekod pesanan.</p>
                    ) : (
                      orders.map((ord) => (
                        <div key={ord.id} style={{ background: "#060a14", border: "1px solid var(--border-ui)", padding: "0.9rem", borderRadius: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong style={{ fontSize: "0.9rem", color: "#fff" }}>{ord.productTitle}</strong>
                              <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                Pembeli: <span style={{ color: "var(--green)" }}>{ord.username}</span> • RM {ord.price.toFixed(2)} • {ord.createdAt}
                              </div>
                            </div>
                            <span className={`badge-status ${ord.status === "DELIVERED" ? "badge-avail" : "badge-pending"}`}>
                              {ord.status === "DELIVERED" ? "SELESAI" : "PENDING"}
                            </span>
                          </div>

                          {/* Jika Masih Pending: Borang Key-in Mesej untuk Admin */}
                          {ord.status === "PENDING" ? (
                            <div style={{ marginTop: "0.8rem", borderTop: "1px solid var(--border-ui)", paddingTop: "0.7rem" }}>
                              <label className="mono" style={{ fontSize: "0.72rem", color: "var(--gold)", display: "block", marginBottom: "0.25rem" }}>
                                ✍️ KEY-IN MESEJ / KREDENSIAL / PAUTAN FAIL:
                              </label>
                              <textarea
                                className="input-styled mono"
                                rows="3"
                                placeholder="Cth: Terima kasih! Berikut akaun anda: Email: xx@gmail.com | Pass: yy | Pautan: https://drive.google.com/..."
                                value={adminMsgInputs[ord.id] || ""}
                                onChange={(e) => setAdminMsgInputs({ ...adminMsgInputs, [ord.id]: e.target.value })}
                                style={{ resize: "vertical", fontSize: "0.8rem" }}
                              />
                              <button 
                                onClick={() => handleFulfillOrder(ord.id)}
                                className="btn-buy-now mono"
                                style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center" }}
                              >
                                <Send size={14} /> Hantar ke Peti Pengguna & Sahkan Selesai
                              </button>
                            </div>
                          ) : (
                            <div style={{ marginTop: "0.6rem", background: "rgba(0,192,135,0.06)", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem" }}>
                              <span style={{ color: "var(--green)", fontWeight: 700 }}>Mesej Dihantar: </span>
                              <span className="mono" style={{ color: "#cbd5e1" }}>{ord.adminMessage}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: TAMBAH & PADAM PRODUK */}
                {adminTab === "products" && (
                  <div>
                    <div style={{ background: "#060a14", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-ui)", marginBottom: "1rem" }}>
                      <h4 style={{ fontSize: "0.88rem", color: "var(--cyan)", marginBottom: "0.5rem" }}>+ Tambah Produk Baharu</h4>
                      <form onSubmit={handleAddProduct}>
                        <input type="text" className="input-styled mono" placeholder="Nama Produk / Template" value={newProd.title} onChange={(e) => setNewProd({ ...newProd, title: e.target.value })} required />
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: "0.4rem" }}>
                          <select className="input-styled mono" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}>
                            <option value="template">Website Template</option>
                            <option value="account">Akaun Premium</option>
                            <option value="source">Source Code</option>
                          </select>
                          <input type="number" step="0.5" className="input-styled mono" placeholder="Harga RM" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required />
                        </div>

                        <input type="text" className="input-styled mono" placeholder="Pautan URL Gambar Mockup (Image URL)" value={newProd.previewImg} onChange={(e) => setNewProd({ ...newProd, previewImg: e.target.value })} />
                        <textarea className="input-styled mono" rows="2" placeholder="Tulisan penerangan penuh produk..." value={newProd.fullWriteup} onChange={(e) => setNewProd({ ...newProd, fullWriteup: e.target.value })} />
                        <input type="text" className="input-styled mono" placeholder="Kelebihan (pisahkan dengan koma)" value={newProd.features} onChange={(e) => setNewProd({ ...newProd, features: e.target.value })} />

                        <button type="submit" className="btn-buy-now mono" style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}>
                          Terbitkan Produk
                        </button>
                      </form>
                    </div>

                    <div style={{ background: "#060a14", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                      <h4 style={{ fontSize: "0.88rem", color: "var(--red)", marginBottom: "0.5rem" }}>Senarai Padam Produk ({products.length})</h4>
                      <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {products.map((p) => (
                          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0c1322", padding: "0.5rem 0.75rem", borderRadius: "6px" }}>
                            <div>
                              <strong style={{ fontSize: "0.82rem" }}>{p.title}</strong>
                              <span className="mono" style={{ fontSize: "0.72rem", color: "var(--green)", marginLeft: "0.5rem" }}>RM {p.price}</span>
                            </div>
                            <button onClick={() => handleDeleteProduct(p.id, p.title)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: JANA PIN */}
                {adminTab === "pins" && (
                  <div>
                    <div style={{ background: "#060a14", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-ui)", marginBottom: "0.8rem" }}>
                      <span className="mono" style={{ fontSize: "0.75rem", color: "var(--green)", display: "block", marginBottom: "0.5rem" }}>
                        JANA PIN MENGIKUT NILAI:
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.45rem" }}>
                        <button onClick={() => handleGeneratePin(5)} className="btn-pill btn-green mono" style={{ justifyContent: "center" }}>+ RM 5</button>
                        <button onClick={() => handleGeneratePin(10)} className="btn-pill btn-cyan mono" style={{ justifyContent: "center" }}>+ RM 10</button>
                        <button onClick={() => handleGeneratePin(50)} className="btn-pill btn-admin mono" style={{ justifyContent: "center" }}>+ RM 50</button>
                      </div>
                    </div>

                    <div style={{ background: "#060a14", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-ui)" }}>
                      <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Senarai PIN ({pinDb.length})</h4>
                      <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {pinDb.map((pin, i) => (
                          <div key={i} className="mono" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0c1322", padding: "0.45rem 0.75rem", borderRadius: "6px", fontSize: "0.78rem" }}>
                            <div>
                              <strong>{pin.code}</strong> (RM {pin.value})
                              <span style={{ marginLeft: "0.4rem", color: pin.status === "AVAILABLE" ? "var(--green)" : "var(--red)" }}>
                                {pin.status === "AVAILABLE" ? "AKTIF" : `DIGUNAKAN`}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              {pin.status === "AVAILABLE" && (
                                <button onClick={() => { navigator.clipboard.writeText(pin.code); showToast("PIN disalin!"); }} style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer" }}>Salin</button>
                              )}
                              <button onClick={() => handleDeletePin(pin.code)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
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

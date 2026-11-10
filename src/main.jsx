import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  ShoppingBag, Lock, Unlock, KeyRound, User, LogIn, LogOut, UserPlus,
  ShieldAlert, X, Copy, PlusCircle, Ticket, MessageCircle, 
  Package, Sparkles, Globe, Bot, ArrowRight, Eye, Search, 
  ShoppingCart, Download, Code, Star, Trash2, Check,
  Send, LifeBuoy, Inbox, Clock, CheckCircle2, Crown, Zap, ShieldCheck, Menu,
  Receipt, HelpCircle, Image as ImageIcon, Bell, CheckCheck
} from "lucide-react";

// KONFIGURASI PENTADBIR & SOKONGAN
const ADMIN_PIN = "200200";
const SUPPORT_EMAIL = "shhmrvl@gmail.com";
const WHATSAPP_PHONE = "018-3915460";
const WHATSAPP_LINK = "https://wa.me/60183915460?text=Salam%20Admin,%20saya%20nak%20beli%20PIN%20Topup%20BakaHub%20Market";

// HELPER STORAN TEMPATAN ATOMIK
const loadStorage = (key, fallback) => {
  try { 
    const v = localStorage.getItem(key); 
    return v ? JSON.parse(v) : fallback; 
  } catch { 
    return fallback; 
  }
};

const saveStorage = (key, val) => {
  try { 
    localStorage.setItem(key, JSON.stringify(val)); 
  } catch {}
};

// FUNGSI SALIN SEJAGAT (BERFUNGSI PADA SEMUA PERANTI & HTTP/HTTPS)
const copyToClipboard = (text, onSuccess) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => onSuccess && onSuccess())
      .catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
};

const fallbackCopy = (text, onSuccess) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Copy failed", err);
  }
  document.body.removeChild(textArea);
};

const genPinWithVal = (value) => `BK${value}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
const genLicKey = () => `BK-LIC-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

// KATALOG PRODUK DIGITAL BAKAHUB 2.0
const INITIAL_PRODUCTS = [
  {
    id: "tpl_kahwin_vip",
    category: "wedding",
    categoryLabel: "Wedding Templates",
    title: "Template Kad Kahwin Digital VIP",
    desc: "Borang RSVP automatik, lagu latar auto-play, countdown timer & integrasi Google Maps / Waze.",
    price: 15.0,
    rating: 4.9,
    sales: 142,
    badge: "Best Seller",
    previewImg: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Templat jemputan kahwin digital moden dengan susunan fon elegan. Pengunjung boleh mengesahkan kehadiran melalui borang RSVP terus ke spreadsheet/WhatsApp, mendengar lagu pengantin, serta navigasi Waze/Maps.",
    features: ["Responsif Telefon / Desktop", "Audio Latar & RSVP Form", "Countdown & Lokasi Majlis"],
    specs: "HTML5, Tailwind CSS, Audio Engine",
    included: ["Fail ZIP penuh", "Panduan Dokumentasi", "Borang RSVP Template"],
    downloadUrl: "https://github.com/example/wedding-rsvp-template"
  },
  {
    id: "tpl_saas_landing",
    category: "templates",
    categoryLabel: "Templates",
    title: "Template SaaS & Startup Landing Page",
    desc: "Direka khas untuk jualan produk digital dengan kelajuan tinggi & borang leads siap.",
    price: 25.0,
    rating: 5.0,
    sales: 89,
    badge: "Popular",
    previewImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Landing page berprestasi tinggi yang dioptimumkan untuk konversi jualan perisian SaaS. Dilengkapi dengan jadual harga (Pricing Table), testimoni pelanggan, dan reka bentuk gelap (Dark Mode).",
    features: ["Next.js & Tailwind CSS", "Pricing Table & FAQ", "Formulir Jualan Siap"],
    specs: "React 18, Next.js, Framer Motion",
    included: ["Source Code Lengkap", "Figma Design Assets", "Komponen UI Sedia Guna"],
    downloadUrl: "https://github.com/example/saas-landing-template"
  },
  {
    id: "tpl_portfolio_dev",
    category: "developer",
    categoryLabel: "Developer Tools",
    title: "Template Developer Portfolio Cyberpunk",
    desc: "Portfolio dark-mode moden dengan kesan animasi neon, paparan projek & borang mesej.",
    price: 12.0,
    rating: 4.8,
    sales: 210,
    badge: "Hot",
    previewImg: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Pamerkan kepakaran pengaturcaraan anda dengan gaya futuristik. Mengandungi galeri projek dengan penapis kategori, garis masa pengalaman kerja, dan borang perhubungan yang kemas.",
    features: ["Animasi Framer Motion", "Showcase Projek Interaktif", "CV Download Button"],
    specs: "Vite, React, Tailwind CSS",
    included: ["Kod Penuh", "Komponen UI", "Aset Ikon"],
    downloadUrl: "https://github.com/example/dev-portfolio-cyber"
  },
  {
    id: "tpl_resume_ats",
    category: "templates",
    categoryLabel: "Templates",
    title: "Template Resume & CV ATS-Friendly Pro",
    desc: "Format template moden yang melepasi sistem tapisan ATS syarikat antarabangsa.",
    price: 8.0,
    rating: 4.7,
    sales: 320,
    badge: "Verified",
    previewImg: "https://i.ibb.co/fYYLZSG7/Screenshot-20261110-090336-com-android-chrome-Chrome-Tabbed-Activity.jpg",
    fullWriteup: "Dibina khas mengikut piawaian sistem tapisan Applicant Tracking System (ATS). Tipografi dan susunan maklumat disusun rapi untuk memaksimumkan peluang temuduga kerja.",
    features: ["Format Web & PDF", "Standard ATS Terbukti", "Mudah Edit dalam 5 Minit"],
    specs: "HTML / PDF / DOCX Template",
    included: ["Template Fail PDF & Web", "Panduan Penulisan Resume"],
    downloadUrl: "https://shxhmrvl.github.io/resume-cv/"
  },
  {
    id: "prm_chatgpt_plus",
    category: "accounts",
    categoryLabel: "Premium Accounts",
    title: "ChatGPT Plus (Shared 1 Bulan)",
    desc: "Akses ke model GPT-4o, analisis data mendalam & penjana imej DALL-E 3 berkualiti tinggi.",
    price: 18.0,
    rating: 4.9,
    sales: 412,
    badge: "Best Value",
    previewImg: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Langganan akaun ChatGPT Plus selama 30 hari. Akses penuh kepada model GPT-4o terpantas, penterjemahan, dan pemprosesan fail dokumen terus.",
    features: ["Akses Model GPT-4o", "Penjana Imej DALL-E 3", "Jaminan Waranti 30 Hari"],
    specs: "Akaun Berlesen 30 Hari",
    included: ["ID & Kata Laluan", "Panduan Keselamatan Akses"]
  },
  {
    id: "prm_netflix_uhd",
    category: "accounts",
    categoryLabel: "Premium Accounts",
    title: "Netflix 4K Ultra HD (1 Profil Peribadi)",
    desc: "Profil sendiri lengkap dengan kunci PIN 4-digit. Tontonan 4K HDR tanpa perkongsian skrin.",
    price: 14.0,
    rating: 5.0,
    sales: 650,
    badge: "Exclusive",
    previewImg: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Akaun rasmi Netflix pelan Premium 4K Ultra HD. Profil peribadi dilindungi PIN 4-digit tersendiri tanpa sebarang gangguan daripada pengguna lain.",
    features: ["Kualiti 4K Ultra HD", "Profil Khas dengan PIN", "Sokongan Semua Peranti"],
    specs: "Pelan 4K UHD 1 Bulan",
    included: ["Profil Peribadi Berkunci", "PIN Akses Khusus"]
  },
  {
    id: "prm_spotify_prem",
    category: "accounts",
    categoryLabel: "Premium Accounts",
    title: "Spotify Premium Individu (1 Bulan)",
    desc: "Mendengar muzik tanpa sebarang iklan, muat turun lagu luar talian & kualiti audio tertinggi.",
    price: 7.0,
    rating: 4.9,
    sales: 580,
    badge: "Top Rated",
    previewImg: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Penstriman muzik tanpa had tanpa iklan. Boleh memuat turun album untuk dimainkan secara luar talian dengan kualiti audio jernih 320kbps.",
    features: ["Tanpa Iklan Sepenuhnya", "Muat Turun Lagu Offline", "Langkau Tanpa Had"],
    specs: "Akaun Premium Individu 30 Hari",
    included: ["Kredensial Log Masuk", "Akses Penuh"]
  },
  {
    id: "src_react_boilerplate",
    category: "software",
    categoryLabel: "Software",
    title: "React SaaS Full Boilerplate + Auth",
    desc: "Kod sumber lengkap siap integrasi Supabase Auth, Tailwind UI & gerbang pembayaran sedia guna.",
    price: 35.0,
    rating: 5.0,
    sales: 78,
    badge: "Pro Kit",
    previewImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    fullWriteup: "Pakej asas permulaan projek perisian lengkap. Siap dibina dengan sistem pendaftaran akaun Supabase, pengesahan email, dan komponen UI moden.",
    features: ["TypeScript & React Vite", "Supabase Auth & Database", "Komponen UI Lengkap"],
    specs: "Vite, React 18, Supabase SDK",
    included: ["Full Repository Access", "Database Schema .sql", "Panduan Deployment"],
    downloadUrl: "https://github.com/example/react-saas-starter"
  }
];

function App() {
  const [usersDb, setUsersDb] = useState(() => loadStorage("bakahub_users_v10", []));
  const [currentUsername, setCurrentUsername] = useState(() => loadStorage("bakahub_session_v10", ""));
  const currentUser = usersDb.find((u) => u.username === currentUsername) || null;

  const [products, setProducts] = useState(() => loadStorage("bakahub_products_v10", INITIAL_PRODUCTS));
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState(() => loadStorage("bakahub_orders_v10", []));

  const [cart, setCart] = useState(() => loadStorage("bakahub_cart_v10", []));
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [pinDb, setPinDb] = useState(() => loadStorage("bakahub_pins_v10", [
    { code: "BK5-8888-9999", value: 5, status: "AVAILABLE" },
    { code: "BK10-1111-2222", value: 10, status: "AVAILABLE" },
    { code: "BK50-3333-4444", value: 50, status: "AVAILABLE" }
  ]));

  const [auditLogs, setAuditLogs] = useState(() => loadStorage("bakahub_audit_logs_v10", [
    { id: 1, action: "SYSTEM_INITIALIZED", actor: "SYSTEM", date: new Date().toLocaleString("ms-MY") }
  ]));

  const [notifications, setNotifications] = useState(() => loadStorage("bakahub_notifications_v10", [
    { id: 1, targetUser: "all", title: "Selamat Datang!", message: "Terokai templat digital dan akaun berlesen di BakaHub Market.", read: false, date: "Hari Ini" }
  ]));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ user: "", pass: "", err: "" });

  const [showRedeem, setShowRedeem] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [previewProduct, setPreviewProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(null);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("overview");
  const [showReceipt, setShowReceipt] = useState(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", category: "Masalah Pembelian / Topup", message: "" });
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("analytics");
  const [adminMsgInputs, setAdminMsgInputs] = useState({});
  const [newProd, setNewProd] = useState({
    title: "", category: "templates", categoryLabel: "Templates", desc: "", price: "15",
    previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma",
    specs: "Fail Lengkap", included: "Dokumentasi & Aset", downloadUrl: ""
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3200); };

  useEffect(() => saveStorage("bakahub_users_v10", usersDb), [usersDb]);
  useEffect(() => saveStorage("bakahub_session_v10", currentUsername), [currentUsername]);
  useEffect(() => saveStorage("bakahub_products_v10", products), [products]);
  useEffect(() => saveStorage("bakahub_orders_v10", orders), [orders]);
  useEffect(() => saveStorage("bakahub_cart_v10", cart), [cart]);
  useEffect(() => saveStorage("bakahub_pins_v10", pinDb), [pinDb]);
  useEffect(() => saveStorage("bakahub_audit_logs_v10", auditLogs), [auditLogs]);
  useEffect(() => saveStorage("bakahub_notifications_v10", notifications), [notifications]);

  // AUTOMATIK TANDA NOTIFIKASI TELAH DIBACA BILA BUKA TAB NOTIFIKASI
  const markNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (n.targetUser === "all" || (currentUser && n.targetUser === currentUser.username)) {
          return { ...n, read: true };
        }
        return n;
      });
      saveStorage("bakahub_notifications_v10", updated);
      return updated;
    });
  };

  useEffect(() => {
    if (showUserDashboard && dashboardTab === "notifications") {
      markNotificationsAsRead();
    }
  }, [showUserDashboard, dashboardTab]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowCartDrawer(false);
        setShowAuth(false);
        setShowRedeem(false);
        setPreviewProduct(null);
        setShowProductDetail(null);
        setShowUserDashboard(false);
        setShowTicketModal(false);
        setShowAdmin(false);
        setShowReceipt(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const logAuditAction = (action, details = "") => {
    const entry = {
      id: Date.now(),
      action,
      actor: currentUsername || "GUEST",
      details,
      date: new Date().toLocaleString("ms-MY")
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const pushNotification = (targetUser, title, message) => {
    const n = {
      id: Date.now(),
      targetUser,
      title,
      message,
      read: false,
      date: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })
    };
    setNotifications((prev) => [n, ...prev]);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const u = authForm.user.trim();
    const p = authForm.pass;
    if (!u || !p) return setAuthForm({ ...authForm, err: "Sila isi semua ruangan!" });

    if (authTab === "register") {
      if (usersDb.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        return setAuthForm({ ...authForm, err: "Username sudah wujud!" });
      }
      const newUser = { 
        id: `USR-${Date.now()}`,
        username: u, 
        password: p, 
        balance: 0.0, 
        hasClaimedFirstRechargeBonus: false,
        recharges: [],
        createdAt: new Date().toLocaleString("ms-MY")
      };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      setCurrentUsername(u);
      setShowAuth(false);
      logAuditAction("USER_REGISTER", `Pengguna baru: ${u}`);
      pushNotification(u, "Akaun Dicipta", "Selamat datang ke BakaHub Market. Anda layak menerima bonus top-up pertama!");
      showToast(`🎉 Akaun berjaya didaftarkan. Selamat datang, ${u}!`);
    } else {
      const found = usersDb.find((x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
      if (!found) return setAuthForm({ ...authForm, err: "Username atau Password salah!" });
      setCurrentUsername(found.username);
      setShowAuth(false);
      logAuditAction("USER_LOGIN", `Log masuk: ${found.username}`);
      showToast(`Log masuk berjaya! Selamat kembali, ${found.username}.`);
    }
    setAuthForm({ user: "", pass: "", err: "" });
  };

  const handleLogout = () => {
    logAuditAction("USER_LOGOUT", `Log keluar: ${currentUsername}`);
    setCurrentUsername("");
    setMenuOpen(false);
    setShowUserDashboard(false);
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

  // ENJIN FIRST TIME RECHARGE BONUS
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
        status: "SUCCESSFUL",
        date: new Date().toLocaleString("ms-MY")
      };

      updateUserBalance({
        balance: newBalance,
        hasClaimedFirstRechargeBonus: currentUser.hasClaimedFirstRechargeBonus || (isFirstRecharge && bonusEarned > 0),
        recharges: [rechargeRecord, ...(currentUser.recharges || [])]
      });

      setPinDb(pinDb.map((p) => p.code.toUpperCase() === code ? { ...p, status: "USED", usedBy: currentUser.username, usedDate: new Date().toLocaleString("ms-MY") } : p));
      setInputPin("");
      setShowRedeem(false);

      logAuditAction("WALLET_RECHARGE", `PIN ${code} (RM${target.value}) + Bonus: RM${bonusEarned}`);
      pushNotification(currentUser.username, "Top-up Berjaya", `Baki anda dikreditkan sebanyak RM ${totalCredited} (Termasuk Bonus: RM ${bonusEarned}).`);

      if (bonusEarned > 0) {
        showToast(`🎉 FIRST RECHARGE: Top-up RM ${target.value} + Bonus RM ${bonusEarned} (Jumlah: RM ${totalCredited})!`);
      } else {
        showToast(`✅ Top-up RM ${target.value}.00 berjaya dimasukkan ke dompet.`);
      }
    });
  };

  const addToCart = (product) => {
    if (cart.some((item) => item.id === product.id)) return showToast("Produk sudah ada di dalam troli!");
    setCart([...cart, product]);
    showToast(`${product.title} ditambah ke troli!`);
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const applyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (clean === "BAKA50") {
      setDiscountPercent(50);
      showToast("🎉 Kupon BAKA50 (Diskaun 50%) berjaya diaktifkan!");
    } else if (clean === "LAUNCH") {
      setDiscountPercent(20);
      showToast("🎉 Kupon LAUNCH (Diskaun 20%) berjaya diaktifkan!");
    } else {
      showToast("Kupon tidak sah.");
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const cartTotal = +(cartSubtotal * (1 - discountPercent / 100)).toFixed(2);

  // FUNGSI PENGESAHAN KETIKA TEKAN BUTANG "BELI" (TIDAK TERUS PROCEED, BUKA FORUM PENGESAHAN DAHULU)
  const handleBuyClick = (product) => {
    requireUser(() => {
      // Masukkan produk ke dalam senarai troli jika belum ada
      if (!cart.some((item) => item.id === product.id)) {
        const updatedCart = [...cart, product];
        setCart(updatedCart);
        saveStorage("bakahub_cart_v10", updatedCart);
      }
      // Tutup sebarang modal pratonton atau perincian yang sedang terbuka
      setShowProductDetail(null);
      setPreviewProduct(null);
      // Keluarkan borang troli / pengesahan untuk pengguna buat semakan dan double-confirm
      setShowCartDrawer(true);
    });
  };

  // CHECKOUT SELEPAS PENGGUNA SAHKAN PADA BORANG TROLI
  const executeCheckout = (itemsToBuy, totalCost) => {
    requireUser(() => {
      if (currentUser.balance < totalCost) {
        return showToast("Baki dompet tidak mencukupi! Sila tambah nilai.");
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
        licenseKey: genLicKey(),
        downloadUrl: item.downloadUrl || null,
        adminMessage: null,
        paymentMethod: "BakaHub Wallet",
        createdAt: new Date().toLocaleString("ms-MY"),
        deliveredAt: null
      }));

      const updatedOrders = [...newOrders, ...orders];
      setOrders(updatedOrders);
      setCart(cart.filter((c) => !itemsToBuy.some((b) => b.id === c.id)));
      setShowCartDrawer(false);

      logAuditAction("ORDER_PLACED", `Pesanan baru oleh ${currentUser.username} (Jumlah: RM ${totalCost})`);
      pushNotification(currentUser.username, "Pesanan Dihantar", `Pesanan anda (${itemsToBuy.length} item) sedang diproses oleh admin.`);
      showToast(`⏳ Pesanan berjaya disahkan! Admin sedang menyiapkan fail & kredensial anda.`);
    });
  };

  const handleFulfillOrder = (orderId) => {
    const messageToSend = adminMsgInputs[orderId];
    if (!messageToSend || !messageToSend.trim()) {
      return showToast("Sila masukkan butiran atau pautan sebelum menghantar!");
    }

    let customerUsername = "";
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        customerUsername = o.username;
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
    logAuditAction("ORDER_FULFILLED", `Pesanan ${orderId} disahkan & diserahkan kepada ${customerUsername}`);
    pushNotification(customerUsername, "Pesanan Sedia!", `Pesanan #${orderId} telah dihantar ke Peti Masuk / Download Center anda.`);
    showToast("🚀 Mesej & Butiran Berjaya Dihantar ke Peti Masuk Pelanggan!");
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const myOrders = orders.filter((o) => currentUser && o.username === currentUser.username);
  const myUnreadNotifications = notifications.filter((n) => 
    (n.targetUser === "all" || (currentUser && n.targetUser === currentUser.username)) && !n.read
  ).length;

  const totalAlertCount = myUnreadNotifications;

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
      if (res.ok) {
        logAuditAction("TICKET_CREATED", `Tiket ${ticketId} daripada ${ticketForm.email}`);
        showToast(`✅ Tiket ${ticketId} berjaya dihantar ke ${SUPPORT_EMAIL}!`);
      } else throw new Error();
    } catch {
      window.open(`mailto:${SUPPORT_EMAIL}?subject=[Tiket Bantuan ${ticketId}]&body=${encodeURIComponent(ticketForm.message)}`, "_blank");
      showToast(`✅ Tiket dibuka ke emel ${SUPPORT_EMAIL}!`);
    } finally {
      setIsSendingTicket(false);
      setShowTicketModal(false);
      setTicketForm({ name: "", email: "", category: "Masalah Pembelian / Topup", message: "" });
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const pVal = parseFloat(newProd.price);
    if (!newProd.title.trim() || !pVal) return showToast("Sila isi tajuk dan harga!");

    const item = {
      id: `prod_${Date.now()}`,
      category: newProd.category,
      categoryLabel: newProd.category === "wedding" ? "Wedding Templates" : newProd.category === "developer" ? "Developer Tools" : newProd.category === "accounts" ? "Premium Accounts" : "Templates",
      title: newProd.title.trim(),
      desc: newProd.desc.trim() || "Produk digital premium sedia dimuat turun.",
      price: pVal,
      rating: 5.0,
      sales: 0,
      badge: "New",
      previewImg: newProd.previewImg.trim() || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      fullWriteup: newProd.fullWriteup.trim() || "Penerangan lengkap produk digital berkualiti tinggi.",
      features: newProd.features.split(",").map(f => f.trim()).filter(Boolean),
      specs: newProd.specs || "Aset Digital Sedia Guna",
      included: [newProd.included || "Dokumentasi Lengkap"],
      downloadUrl: newProd.downloadUrl.trim() || null
    };

    setProducts([item, ...products]);
    logAuditAction("PRODUCT_CREATED", `Produk baru: ${item.title} (RM${item.price})`);
    setNewProd({ title: "", category: "templates", categoryLabel: "Templates", desc: "", price: "15", previewImg: "", fullWriteup: "", features: "Akses Seumur Hidup, Kemas Kini Percuma", specs: "Fail Lengkap", included: "Dokumentasi", downloadUrl: "" });
    showToast("✅ Produk baharu berjaya diterbitkan!");
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setNewProd({
      title: product.title || "",
      category: product.category || "templates",
      categoryLabel: product.categoryLabel || "Templates",
      desc: product.desc || "",
      price: String(product.price ?? 0),
      previewImg: product.previewImg || "",
      fullWriteup: product.fullWriteup || "",
      features: Array.isArray(product.features) ? product.features.join(", ") : "",
      specs: product.specs || "",
      included: Array.isArray(product.included)
        ? product.included.join(", ")
        : product.included || "",
      downloadUrl: product.downloadUrl || ""
    });
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();

    const pVal = parseFloat(newProd.price);
    if (
      !editingProductId ||
      !newProd.title.trim() ||
      !Number.isFinite(pVal) ||
      pVal < 0
    ) {
      return showToast("Sila masukkan nama produk dan harga yang sah!");
    }

    const existingProduct = products.find(p => p.id === editingProductId);
    if (!existingProduct) {
      setEditingProductId(null);
      return showToast("Produk tidak dijumpai. Sila cuba lagi.");
    }

    const categoryLabels = {
      wedding: "Wedding Templates",
      developer: "Developer Tools",
      accounts: "Premium Accounts",
      software: "Software",
      templates: "Templates"
    };

    const updatedProduct = {
      ...existingProduct,
      title: newProd.title.trim(),
      category: newProd.category,
      categoryLabel: categoryLabels[newProd.category] || "Templates",
      desc: newProd.desc.trim() || "Produk digital premium sedia dimuat turun.",
      price: pVal,
      previewImg: newProd.previewImg.trim() || existingProduct.previewImg || "",
      fullWriteup: newProd.fullWriteup.trim() || "Penerangan lengkap produk digital berkualiti tinggi.",
      features: newProd.features.split(",").map(f => f.trim()).filter(Boolean),
      specs: newProd.specs.trim() || "Aset Digital Sedia Guna",
      included: newProd.included.split(",").map(f => f.trim()).filter(Boolean),
      downloadUrl: newProd.downloadUrl.trim() || null
    };

    setProducts(prev =>
      prev.map(p => p.id === editingProductId ? updatedProduct : p)
    );

    logAuditAction("PRODUCT_UPDATED", `Produk dikemaskini: ${updatedProduct.title} (RM${updatedProduct.price})`);

    setEditingProductId(null);
    setNewProd({
      title: "",
      category: "templates",
      categoryLabel: "Templates",
      desc: "",
      price: "15",
      previewImg: "",
      fullWriteup: "",
      features: "Akses Seumur Hidup, Kemas Kini Percuma",
      specs: "Fail Lengkap",
      included: "Dokumentasi & Aset",
      downloadUrl: ""
    });

    showToast("✅ Produk berjaya dikemaskini!");
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setNewProd({
      title: "",
      category: "templates",
      categoryLabel: "Templates",
      desc: "",
      price: "15",
      previewImg: "",
      fullWriteup: "",
      features: "Akses Seumur Hidup, Kemas Kini Percuma",
      specs: "Fail Lengkap",
      included: "Dokumentasi & Aset",
      downloadUrl: ""
    });
  };

  const handleDeleteProduct = (id, title) => {
    if (confirm(`Padam "${title}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      logAuditAction("PRODUCT_DELETED", `Padam produk: ${title}`);
      showToast(`Produk "${title}" telah dipadam.`);
    }
  };

  const handleGeneratePin = (val) => {
    const code = genPinWithVal(val);
    setPinDb([{ code, value: val, status: "AVAILABLE" }, ...pinDb]);
    logAuditAction("PIN_GENERATED", `Jana PIN RM${val}: ${code}`);
    showToast(`PIN RM ${val} Dijana: ${code}`);
  };

  const handleDeletePin = (code) => {
    setPinDb(pinDb.filter(p => p.code !== code));
    logAuditAction("PIN_DELETED", `Padam PIN: ${code}`);
    showToast(`PIN ${code} dipadam.`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "popular") return b.sales - a.sales;
    return b.id.localeCompare(a.id);
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
  const totalCompletedOrders = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="app-wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      {/* HEADER: LOGO & HAMBURGER NAVIGATION */}
      <header className="navbar-luxury" ref={menuRef}>
        <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="brand-icon-lux"><ShoppingBag size={24} /></div>
          <div className="brand-meta">
            <h1>BakaHub Market</h1>
            <p className="mono">Digital Software & Templates</p>
          </div>
        </div>

        {/* Butang Hamburger Menu Tunggal */}
        <button 
          className="hamburger-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu Utama"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
          {totalAlertCount > 0 && (
            <span className="badge-alert-dot">
              {totalAlertCount}
            </span>
          )}
        </button>

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
                  onClick={() => { 
                    setMenuOpen(false); 
                    setShowUserDashboard(true); 
                    setDashboardTab("notifications"); 
                    markNotificationsAsRead();
                  }}
                >
                  <div className="item-left"><Bell size={16} /> Notifikasi</div>
                  {myUnreadNotifications > 0 && <span className="bonus-pill-tag">{myUnreadNotifications}</span>}
                </button>

                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setShowUserDashboard(true); setDashboardTab("overview"); }}
                >
                  <div className="item-left"><User size={16} /> Dashboard Pengguna</div>
                </button>
                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setShowUserDashboard(true); setDashboardTab("purchases"); }}
                >
                  <div className="item-left"><Package size={16} /> My Purchases</div>
                  {myOrders.length > 0 && <span className="bonus-pill-tag">{myOrders.length}</span>}
                </button>
                <button 
                  className="menu-item-btn"
                  onClick={() => { setMenuOpen(false); setShowRedeem(true); }}
                >
                  <div className="item-left"><KeyRound size={16} /> Tebus PIN Dompet</div>
                </button>
                <button 
                  className="menu-item-btn"
                  onClick={handleLogout}
                  style={{ color: "var(--danger)" }}
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
              {pendingOrdersCount > 0 && <span className="bonus-pill-tag" style={{ color: "var(--admin-accent)" }}>{pendingOrdersCount}</span>}
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION: CENTERED GLASSMORPHISM CARD */}
      <section className="hero-glass-card">
        <div className="hero-label-tag">
          <span>✦ YOUR DIGITAL MARKETPLACE</span>
        </div>
        <h2 className="hero-main-title">
          Segalanya Untuk <span className="gradient-teal">Projek Digital</span> Anda
        </h2>
        <p className="hero-subtext">
          Templat eksklusif, perisian digital dan akaun premium untuk membantu anda berkarya dengan lebih pantas, mudah dan profesional.
        </p>
        <button 
          className="hero-cta-btn mono"
          onClick={() => {
            const el = document.getElementById("marketplace-catalog");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Terokai Produk <ArrowRight size={18} />
        </button>
      </section>

      {/* BENEFIT SECTION */}
      <section className="section-block">
        <div className="section-head-center">
          <h3 className="section-title">Kenapa Pilih BakaHub Market?</h3>
          <p className="section-subtitle">Segala keperluan digital anda dalam satu platform.</p>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Code size={20} /></div>
            <h3>Templat Premium</h3>
            <p>Reka bentuk digital berkualiti tinggi.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Crown size={20} /></div>
            <h3>Akaun Premium</h3>
            <p>Pilihan langganan digital dengan jaminan keselamatan dan sokongan.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><Zap size={20} /></div>
            <h3>Akses Pantas</h3>
            <p>Proses pembelian mudah dengan penyerahan pantas.</p>
          </div>

          <div className="benefit-card-lux">
            <div className="benefit-icon-wrap"><ShieldCheck size={20} /></div>
            <h3>Sokongan Dipercayai</h3>
            <p>Bantuan melalui WhatsApp dan tiket bantuan.</p>
          </div>
        </div>
      </section>

      {/* FIRST TIME RECHARGE BONUS: COMPACT PROMOTION CARD */}
      <section className="recharge-promo-compact">
        <div className="recharge-compact-top">
          <div className="recharge-compact-top-left">
            <span className="promo-tag-badge-compact">
              <Sparkles size={11} /> ONE-TIME BONUS – NEW USERS ONLY
            </span>
            <h3 className="recharge-compact-title">FIRST RECHARGE BONUS</h3>
            <span className="recharge-compact-sub">Nikmati bonus istimewa untuk tambah nilai pertama anda!</span>
          </div>

          <div className="mono status-badge-compact">
            {!currentUser ? (
              <span style={{ color: "var(--text-secondary)" }}>Status: Sila Log Masuk</span>
            ) : currentUser.hasClaimedFirstRechargeBonus ? (
              <strong style={{ color: "var(--emerald)" }}>Status: Claimed ✓</strong>
            ) : (
              <strong style={{ color: "var(--neon-cyan)" }}>Status: Eligible (Layak)</strong>
            )}
          </div>
        </div>

        <div className="recharge-grid-compact">
          <div className="recharge-card-compact">
            <div>
              <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700 }}>RM5 RECHARGE</span>
              <div><span className="bonus-pill-tag">RM1 BONUS</span></div>
            </div>
            <div>
              <div className="mono total-credit-val">RM6 TOTAL</div>
            </div>
          </div>

          <div className="recharge-card-compact" style={{ borderColor: "rgba(0, 217, 245, 0.3)" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700 }}>RM10 RECHARGE</span>
              <div><span className="bonus-pill-tag" style={{ borderColor: "var(--neon-cyan)", color: "var(--neon-cyan)" }}>RM2 BONUS</span></div>
            </div>
            <div>
              <div className="mono total-credit-val" style={{ color: "var(--neon-cyan)" }}>RM12 TOTAL</div>
            </div>
          </div>

          <div className="recharge-card-compact" style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
            <div>
              <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700 }}>RM50 RECHARGE</span>
              <div><span className="bonus-pill-tag" style={{ borderColor: "var(--admin-accent)", color: "var(--admin-accent)" }}>RM5 BONUS</span></div>
            </div>
            <div>
              <div className="mono total-credit-val" style={{ color: "var(--admin-accent)" }}>RM55 TOTAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP SUPPORT SECTION */}
      <section className="whatsapp-support-box">
        <div className="wa-left-meta">
          <span className="wa-label-tag">BELI PIN / BANTUAN ADMIN</span>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0.3rem 0" }}>Perlukan Bantuan?</h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Hubungi admin kami untuk pertanyaan, pembelian PIN dan bantuan berkaitan produk digital.
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="wa-btn-pill">
            <MessageCircle size={19} /> WhatsApp Admin – 018-3915460
          </a>
          <p style={{ fontSize: "0.72rem", color: "var(--emerald)", marginTop: "0.5rem", fontWeight: 600 }}>
            ● Khidmat Sokongan Pantas
          </p>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href={WHATSAPP_LINK} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-wa-btn" 
        title="Hubungi Admin WhatsApp"
      >
        <MessageCircle size={26} />
      </a>

      {/* STATUS DOMPET PENGGUNA */}
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
            {currentUser ? `${myOrders.length} Item` : "--"}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem", display: "block" }}>
            Semak fail templat, kod sumber dan mesej penyerahan admin di Dashboard / Peti Masuk.
          </span>
        </div>
      </section>

      {/* KATALOG PRODUK & PENAPIS (MARKETPLACE) */}
      <div id="marketplace-catalog"></div>
      <div className="toolbar-row">
        <div className="filter-group mono">
          <button 
            className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All Products ({products.length})
          </button>
          <button 
            className={`filter-btn ${activeCategory === "templates" ? "active" : ""}`}
            onClick={() => setActiveCategory("templates")}
          >
            Templates
          </button>
          <button 
            className={`filter-btn ${activeCategory === "wedding" ? "active" : ""}`}
            onClick={() => setActiveCategory("wedding")}
          >
            Wedding Templates
          </button>
          <button 
            className={`filter-btn ${activeCategory === "developer" ? "active" : ""}`}
            onClick={() => setActiveCategory("developer")}
          >
            Developer Tools
          </button>
          <button 
            className={`filter-btn ${activeCategory === "accounts" ? "active" : ""}`}
            onClick={() => setActiveCategory("accounts")}
          >
            Premium Accounts
          </button>
          <button 
            className={`filter-btn ${activeCategory === "software" ? "active" : ""}`}
            onClick={() => setActiveCategory("software")}
          >
            Software
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", width: "100%", maxWidth: "460px" }}>
          <div className="search-input-box" style={{ flex: 1 }}>
            <Search size={15} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Cari nama atau kata kunci..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={14} />
              </button>
            )}
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="input-styled mono" 
            style={{ width: "auto", margin: 0, padding: "0.5rem", fontSize: "0.78rem" }}
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
          <HelpCircle size={42} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
          <h3>Tiada produk dijumpai bagi carian "{searchQuery}"</h3>
          <p style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>Cuba tukar kata kunci carian atau tetapkan semula penapis kategori.</p>
        </div>
      ) : (
        <section className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="prod-card">
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`prod-tag tag-${p.category === "accounts" ? "account" : p.category === "software" || p.category === "developer" ? "source" : "template"}`}>
                    {p.categoryLabel || p.category}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {p.badge && (
                      <span className="mono" style={{ fontSize: "0.68rem", background: "rgba(0, 212, 154, 0.15)", color: "var(--emerald)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 700 }}>
                        {p.badge}
                      </span>
                    )}
                    <span className="mono" style={{ fontSize: "0.72rem", color: "var(--admin-accent)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <Star size={11} fill="var(--admin-accent)" /> {p.rating || 5.0}
                    </span>
                  </div>
                </div>

                <h3 className="prod-title">{p.title}</h3>
                <p className="prod-desc">{p.desc}</p>

                {p.features && p.features.length > 0 && (
                  <div className="prod-features-list mono">
                    {p.features.slice(0, 3).map((f, i) => (
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
                    title="Lihat Gambar & Maklumat"
                  >
                    <ImageIcon size={15} />
                  </button>
                  <button 
                    className="btn-action-icon"
                    onClick={() => setShowProductDetail(p)}
                    title="Spesifikasi Penuh"
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
                  {/* BUTANG BELI: KELUARKAN BORANG PENGESAHAN DAHULU */}
                  <button 
                    className="btn-buy-now mono"
                    onClick={() => handleBuyClick(p)}
                  >
                    Beli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* MODAL: PRODUCT DETAILS PAGE */}
      {showProductDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="prod-tag tag-template">{showProductDetail.categoryLabel}</span>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: "0.2rem" }}>{showProductDetail.title}</h2>
              </div>
              <button onClick={() => setShowProductDetail(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ width: "100%", maxHeight: "250px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)", marginBottom: "1rem" }}>
              <img src={showProductDetail.previewImg} alt={showProductDetail.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <div>
                <h4 style={{ color: "#fff", marginBottom: "0.3rem" }}>Penerangan Penuh:</h4>
                <p>{showProductDetail.fullWriteup || showProductDetail.desc}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "#020B16", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <strong style={{ color: "var(--neon-cyan)", display: "block", fontSize: "0.75rem" }} className="mono">SPESIFIKASI:</strong>
                  <span>{showProductDetail.specs || "Aset Digital Piawai"}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--emerald)", display: "block", fontSize: "0.75rem" }} className="mono">APA TERMASUK:</strong>
                  <span>{Array.isArray(showProductDetail.included) ? showProductDetail.included.join(", ") : showProductDetail.included || "Fail & Kunci Lesen"}</span>
                </div>
              </div>

              <div>
                <h4 style={{ color: "#fff", marginBottom: "0.3rem" }}>Polisi & Jaminan:</h4>
                <p style={{ fontSize: "0.78rem" }}>Akses fail dijamin aktif seumur hidup melalui Download Center peribadi. Bantuan teknikal disediakan terus melalui tiket sokongan & WhatsApp Admin.</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block" }}>HARGA RASMI</span>
                <span className="mono" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--emerald)" }}>RM {showProductDetail.price.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-action-icon mono" onClick={() => { addToCart(showProductDetail); }} style={{ width: "auto", padding: "0 0.9rem" }}>
                  + Troli
                </button>
                {/* BUTANG BELI SEKARANG PADA DETAILS: KELUARKAN BORANG PENGESAHAN DAHULU */}
                <button className="btn-buy-now mono" onClick={() => handleBuyClick(showProductDetail)}>
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRATONTON GAMBAR & TULISAN */}
      {previewProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{previewProduct.title}</h3>
              <button onClick={() => setPreviewProduct(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ width: "100%", maxHeight: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)", marginBottom: "1rem", background: "#060913" }}>
              <img 
                src={previewProduct.previewImg || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"} 
                alt={previewProduct.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            <div style={{ background: "#020B16", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
              <h4 style={{ color: "var(--neon-cyan)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>Penerangan & Maklumat Produk:</h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{previewProduct.fullWriteup || previewProduct.desc}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--emerald)" }}>
                RM {previewProduct.price.toFixed(2)}
              </span>
              {/* BUTANG BELI PADA PRATONTON: KELUARKAN BORANG PENGESAHAN DAHULU */}
              <button 
                className="btn-buy-now mono"
                onClick={() => handleBuyClick(previewProduct)}
              >
                Beli Produk Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER DASHBOARD DENGAN TAB NOTIFIKASI */}
      {showUserDashboard && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User size={20} color="var(--neon-cyan)" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Dashboard Pengguna – {currentUser.username}</h3>
              </div>
              <button onClick={() => setShowUserDashboard(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1.2rem", borderBottom: "1px solid var(--border-subtle)" }} className="mono">
              <button className={`filter-btn ${dashboardTab === "overview" ? "active" : ""}`} onClick={() => setDashboardTab("overview")}>Overview</button>
              <button className={`filter-btn ${dashboardTab === "wallet" ? "active" : ""}`} onClick={() => setDashboardTab("wallet")}>My Wallet</button>
              <button className={`filter-btn ${dashboardTab === "purchases" ? "active" : ""}`} onClick={() => setDashboardTab("purchases")}>My Purchases ({myOrders.length})</button>
              <button 
                className={`filter-btn ${dashboardTab === "notifications" ? "active" : ""}`} 
                onClick={() => { 
                  setDashboardTab("notifications"); 
                  markNotificationsAsRead();
                }}
              >
                Notifikasi {myUnreadNotifications > 0 && `(${myUnreadNotifications})`}
              </button>
            </div>

            {dashboardTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "#020B16", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1.2rem" }}>
                  <h4>Selamat Kembali, {currentUser.username}! 👋</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                    Akaun berdaftar anda dilindungi dengan keselamatan enkripsi sesi peribadi.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <div style={{ background: "#020B16", padding: "0.9rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>BAKI DOMPET</span>
                    <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--emerald)", marginTop: "0.2rem" }}>RM {currentUser.balance.toFixed(2)}</div>
                  </div>
                  <div style={{ background: "#020B16", padding: "0.9rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PESANAN SELESAI</span>
                    <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--neon-cyan)", marginTop: "0.2rem" }}>{myOrders.filter(o => o.status === "DELIVERED").length} Item</div>
                  </div>
                  <div style={{ background: "#020B16", padding: "0.9rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>FIRST BONUS</span>
                    <div className="mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: currentUser.hasClaimedFirstRechargeBonus ? "var(--emerald)" : "var(--admin-accent)", marginTop: "0.3rem" }}>
                      {currentUser.hasClaimedFirstRechargeBonus ? "CLAIMED ✓" : "ELIGIBLE"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === "wallet" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020B16", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>AVAILABLE BALANCE</span>
                    <div className="mono" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>RM {currentUser.balance.toFixed(2)}</div>
                  </div>
                  <button className="btn-buy-now mono" onClick={() => { setShowUserDashboard(false); setShowRedeem(true); }}>
                    + Topup PIN
                  </button>
                </div>

                <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Rekod Tambah Nilai:</h4>
                <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(!currentUser.recharges || currentUser.recharges.length === 0) ? (
                    <p style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>Tiada rekod transaksi tambah nilai.</p>
                  ) : (
                    currentUser.recharges.map((r, i) => (
                      <div key={i} className="mono" style={{ display: "flex", justifyContent: "space-between", background: "#020B16", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.78rem" }}>
                        <div>
                          <strong>{r.txId}</strong> - PIN (RM {r.pinValue}) {r.bonusGiven > 0 && <span style={{ color: "var(--emerald)" }}>+RM{r.bonusGiven} BONUS</span>}
                          <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{r.date}</div>
                        </div>
                        <span style={{ color: "var(--emerald)", fontWeight: 800 }}>+RM {r.totalCredited.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {dashboardTab === "purchases" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "350px", overflowY: "auto" }}>
                {myOrders.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>Anda belum memiliki sebarang pesanan.</p>
                ) : (
                  myOrders.map((ord) => (
                    <div key={ord.id} style={{ background: "#020B16", border: "1px solid var(--border-subtle)", padding: "0.9rem", borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "0.95rem" }}>{ord.productTitle}</strong>
                          <div className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                            ID: {ord.id} • RM {ord.price.toFixed(2)} • {ord.createdAt}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <span className="mono" style={{ fontSize: "0.7rem", color: ord.status === "DELIVERED" ? "var(--emerald)" : "var(--admin-accent)" }}>
                            {ord.status === "DELIVERED" ? "SELESAI" : "PENDING"}
                          </span>
                          <button className="btn-action-icon" onClick={() => setShowReceipt(ord)} title="Lihat Resit Digital">
                            <Receipt size={14} />
                          </button>
                        </div>
                      </div>

                      {ord.status === "DELIVERED" && (
                        <div style={{ marginTop: "0.6rem", background: "rgba(0, 217, 245, 0.06)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.65rem" }}>
                          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--neon-cyan)", display: "flex", justifyContent: "space-between" }}>
                            <span>KUNCI LESEN: {ord.licenseKey}</span>
                            <button onClick={() => copyToClipboard(ord.licenseKey, () => showToast("Lesen disalin!"))} style={{ background: "none", border: "none", color: "var(--neon-cyan)", cursor: "pointer" }}>Salin</button>
                          </div>
                          {ord.adminMessage && (
                            <p className="mono" style={{ fontSize: "0.8rem", color: "#F8FAFC", marginTop: "0.3rem", whiteSpace: "pre-wrap" }}>
                              {ord.adminMessage}
                            </p>
                          )}
                          {ord.downloadUrl && (
                            <a href={ord.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-buy-now mono" style={{ fontSize: "0.72rem", display: "inline-flex", marginTop: "0.5rem" }}>
                              <Download size={13} /> Akses Fail Muat Turun
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB NOTIFIKASI DENGAN BUTANG KOSONGKAN/TANDA DIBACA */}
            {dashboardTab === "notifications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "320px", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Peti Notifikasi Akaun</span>
                  <button 
                    onClick={() => { markNotificationsAsRead(); showToast("Semua notifikasi ditandakan telah dibaca!"); }}
                    className="btn-action-icon mono" 
                    style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.72rem", height: "auto" }}
                  >
                    <CheckCheck size={14} /> Tanda Semua Dibaca
                  </button>
                </div>

                {notifications.filter(n => n.targetUser === "all" || n.targetUser === currentUser.username).map((n) => (
                  <div key={n.id} style={{ background: "#020B16", border: n.read ? "1px solid var(--border-subtle)" : "1px solid var(--emerald)", padding: "0.75rem", borderRadius: "8px", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.85rem", color: n.read ? "var(--text-secondary)" : "var(--neon-cyan)" }}>
                        {!n.read && <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "var(--emerald)", marginRight: "6px" }} />}
                        {n.title}
                      </strong>
                      <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{n.date}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: n.read ? "var(--text-muted)" : "var(--text-primary)", marginTop: "0.25rem" }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESIT DIGITAL PEMBELIAN */}
      {showReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "460px", background: "#020B16", border: "1px dashed var(--neon-cyan)" }}>
            <div style={{ textAlign: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div className="brand-icon-lux" style={{ margin: "0 auto 0.5rem auto", width: "38px", height: "38px" }}>
                <ShoppingBag size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem" }}>RESIT PEMBELIAN DIGITAL</h3>
              <p className="mono" style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>BakaHub Market Platform • {showReceipt.id}</p>
            </div>

            <div className="mono" style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Pelanggan:</span>
                <span>{showReceipt.username}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Produk:</span>
                <span>{showReceipt.productTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Kaedah Bayaran:</span>
                <span>{showReceipt.paymentMethod}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                <span style={{ color: "var(--emerald)" }}>{showReceipt.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem", fontSize: "1rem", fontWeight: 800 }}>
                <span>Jumlah Dibayar:</span>
                <span style={{ color: "var(--emerald)" }}>RM {showReceipt.price.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button className="btn-buy-now mono" style={{ flex: 1, justifyContent: "center" }} onClick={() => window.print()}>
                Cetak Resit
              </button>
              <button className="btn-action-icon mono" style={{ flex: 1 }} onClick={() => setShowReceipt(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BORANG TROLI & PENGESAHAN PEMBELIAN (DOUBLE-CONFIRM MODAL)
          ========================================================= */}
      {showCartDrawer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <ShoppingCart size={18} color="var(--neon-cyan)" /> Troli & Pengesahan Pembelian ({cart.length})
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
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    <span>Baki Dompet Anda:</span>
                    <span className="mono" style={{ color: currentUser && currentUser.balance >= cartTotal ? "var(--emerald)" : "var(--danger)" }}>
                      RM {currentUser ? currentUser.balance.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.4rem" }}>
                    <span>Total Pembayaran:</span>
                    <span className="mono" style={{ color: "var(--emerald)" }}>RM {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* BUTANG PENGESAHAN DUA KALI (DOUBLE-CONFIRM) */}
                <button 
                  className="btn-buy-now mono" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  onClick={() => executeCheckout(cart, cartTotal)}
                >
                  Sahkan & Bayar Guna Baki (RM {cartTotal.toFixed(2)})
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

      {/* MODAL AUTH */}
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

      {/* MODAL ADMIN DASHBOARD */}
      {showAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: "var(--admin-accent)", maxWidth: "760px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--admin-accent)" }}>
                <ShieldAlert size={18} /> Admin Management Portal 2.0
              </h3>
              <button onClick={() => setShowAdmin(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {!isAdmin ? (
              <form onSubmit={(e) => { e.preventDefault(); if (adminPin === ADMIN_PIN) { setIsAdmin(true); setAdminPin(""); logAuditAction("ADMIN_LOGIN", "Akses admin disahkan."); } else showToast("Akses Ditolak: PIN Salah!"); }}>
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
                <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1rem" }} className="mono">
                  <button className={`filter-btn ${adminTab === "analytics" ? "active" : ""}`} onClick={() => setAdminTab("analytics")}>Analytics</button>
                  <button className={`filter-btn ${adminTab === "orders" ? "active" : ""}`} onClick={() => setAdminTab("orders")}>
                    Pesanan Masuk {pendingOrdersCount > 0 && `(${pendingOrdersCount})`}
                  </button>
                  <button className={`filter-btn ${adminTab === "products" ? "active" : ""}`} onClick={() => setAdminTab("products")}>Urus Produk</button>
                  <button className={`filter-btn ${adminTab === "pins" ? "active" : ""}`} onClick={() => setAdminTab("pins")}>Jana PIN</button>
                  <button className={`filter-btn ${adminTab === "audit" ? "active" : ""}`} onClick={() => setAdminTab("audit")}>Audit Log</button>
                </div>

                {adminTab === "analytics" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                      <div style={{ background: "#020B16", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>TOTAL REVENUE</span>
                        <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--emerald)" }}>RM {totalRevenue.toFixed(2)}</div>
                      </div>
                      <div style={{ background: "#020B16", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ORDERS COMPLETED</span>
                        <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--neon-cyan)" }}>{totalCompletedOrders}</div>
                      </div>
                      <div style={{ background: "#020B16", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>CUSTOMERS</span>
                        <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--admin-accent)" }}>{usersDb.length}</div>
                      </div>
                      <div style={{ background: "#020B16", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>ACTIVE PRODUCTS</span>
                        <div className="mono" style={{ fontSize: "1.2rem", fontWeight: 800 }}>{products.length}</div>
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === "orders" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "360px", overflowY: "auto" }}>
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
                      <h4 style={{ fontSize: "0.88rem", color: "var(--neon-cyan)", marginBottom: "0.5rem" }}>
                        {editingProductId ? "✏️ Edit Produk" : "+ Tambah Produk Baharu"}
                      </h4>
                      <form onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}>
                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Nama Produk"
                          value={newProd.title}
                          onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                          required
                        />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: "0.4rem" }}>
                          <select
                            className="input-styled mono"
                            value={newProd.category}
                            onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                          >
                            <option value="templates">Templates</option>
                            <option value="wedding">Wedding Templates</option>
                            <option value="developer">Developer Tools</option>
                            <option value="accounts">Premium Accounts</option>
                            <option value="software">Software</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input-styled mono"
                            placeholder="Harga RM"
                            value={newProd.price}
                            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                            required
                          />
                        </div>

                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Pautan URL Gambar (Image URL)"
                          value={newProd.previewImg}
                          onChange={(e) => setNewProd({ ...newProd, previewImg: e.target.value })}
                        />

                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Penerangan ringkas produk"
                          value={newProd.desc}
                          onChange={(e) => setNewProd({ ...newProd, desc: e.target.value })}
                        />

                        <textarea
                          className="input-styled mono"
                          rows="3"
                          placeholder="Penerangan penuh produk..."
                          value={newProd.fullWriteup}
                          onChange={(e) => setNewProd({ ...newProd, fullWriteup: e.target.value })}
                        />

                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Ciri-ciri produk (pisahkan dengan koma)"
                          value={newProd.features}
                          onChange={(e) => setNewProd({ ...newProd, features: e.target.value })}
                        />

                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Spesifikasi produk"
                          value={newProd.specs}
                          onChange={(e) => setNewProd({ ...newProd, specs: e.target.value })}
                        />

                        <input
                          type="text"
                          className="input-styled mono"
                          placeholder="Apa yang termasuk (pisahkan dengan koma)"
                          value={newProd.included}
                          onChange={(e) => setNewProd({ ...newProd, included: e.target.value })}
                        />

                        <input
                          type="url"
                          className="input-styled mono"
                          placeholder="URL Muat Turun Produk"
                          value={newProd.downloadUrl}
                          onChange={(e) => setNewProd({ ...newProd, downloadUrl: e.target.value })}
                        />

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                          <button
                            type="submit"
                            className="btn-buy-now mono"
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            {editingProductId ? "✓ Simpan Perubahan" : "Terbitkan Produk"}
                          </button>

                          {editingProductId && (
                            <button
                              type="button"
                              className="btn-action-icon mono"
                              style={{ width: "auto", padding: "0 0.9rem" }}
                              onClick={cancelEditProduct}
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {products.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#020B16",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "6px",
                            border: editingProductId === p.id ? "1px solid var(--neon-cyan)" : "1px solid var(--border-subtle)",
                            gap: "0.5rem"
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ fontSize: "0.82rem" }}>{p.title}</strong>
                            <span className="mono" style={{ fontSize: "0.72rem", color: "var(--emerald)", marginLeft: "0.5rem" }}>
                              RM {p.price}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                            <button
                              className="btn-action-icon"
                              title="Edit Produk"
                              onClick={() => handleEditProduct(p)}
                            >
                              <Code size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                              title="Padam Produk"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            {pin.status === "AVAILABLE" && (
                              <button onClick={() => copyToClipboard(pin.code, () => showToast("PIN disalin!"))} style={{ background: "none", border: "none", color: "var(--neon-cyan)", cursor: "pointer" }}>Salin</button>
                            )}
                            <button onClick={() => handleDeletePin(pin.code)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "audit" && (
                  <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {auditLogs.map((log) => (
                      <div key={log.id} className="mono" style={{ background: "#020B16", padding: "0.55rem 0.75rem", borderRadius: "6px", fontSize: "0.74rem", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neon-cyan)" }}>
                          <strong>{log.action}</strong>
                          <span style={{ color: "var(--text-secondary)" }}>{log.date}</span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                          Actor: {log.actor} {log.details && `• ${log.details}`}
                        </div>
                      </div>
                    ))}
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
c

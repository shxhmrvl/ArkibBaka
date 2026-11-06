import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Shield, Zap, Gift, User, LogIn, LogOut, UserPlus, 
  Copy, PlusCircle, Ticket, MessageCircle, Lock, Unlock, 
  Clock, CheckCircle2, X, Coins, Crown, Package, Key, 
  ThumbsUp, CalendarCheck, Star, AlertCircle, Info, Layers, MapPin, 
  Check, ExternalLink, Sparkles
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

// Katalog Hadiah Mengikut Hierarki Asymmetric Bento Grid
const STORE_ITEMS = [
  {
    id: "rank_mvp",
    tier: "hero", // Span 2 pada grid (Item Utama / Paling Berprestij)
    name: "Rank MVP BakaLegend",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 35.0,
    icon: "Shield",
    desc: "Pangkat tertinggi pelayan dengan kelebihan eksklusif menyeluruh.",
    perks: ["Akses /fly, /feed & /heal pantas", "Awalan nama tag [MVP] bercahaya", "15x Land Claim tanpa had saiz", "Pek Kit MVP bulanan automatik"],
    command: (ign) => `/tag "${ign}" add MVP`
  },
  {
    id: "rank_vip",
    tier: "standard",
    name: "Rank VIP Bedrock",
    category: "Ranks",
    tagClass: "tag-rank",
    price: 15.0,
    icon: "Crown",
    desc: "Akses /fly di kawasan Plot, awalan [VIP], dan 5x Claim Tanah.",
    command: (ign) => `/tag "${ign}" add VIP`
  },
  {
    id: "kit_netherite",
    tier: "standard",
    name: "Kit Netherite Full God",
    category: "Kits",
    tagClass: "tag-kit",
    price: 10.0,
    icon: "Package",
    desc: "1 Set Lengkap Netherite Armor (Protection IV) & Pedang God.",
    command: (ign) => `/give "${ign}" netherite_sword 1 0 {"minecraft:item_lock":{"mode":"lock_in_inventory"}}`
  },
  {
    id: "money_250k",
    tier: "standard",
    name: "Scoreboard $250,000",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 20.0,
    icon: "Coins",
    desc: "$250,000 Scoreboard 'money' untuk sewa plot spawn & perniagaan.",
    command: (ign) => `/scoreboard players add "${ign}" money 250000`
  },
  {
    id: "kit_elytra",
    tier: "compact",
    name: "Pek Sayap Elytra",
    category: "Kits",
    tagClass: "tag-kit",
    price: 8.0,
    icon: "Zap",
    desc: "1x Sayap Elytra Mending & 64x Bunga Api Roket.",
    command: (ign) => `/give "${ign}" elytra 1`
  },
  {
    id: "money_50k",
    tier: "compact",
    name: "Scoreboard $50,000",
    category: "Scoreboard",
    tagClass: "tag-money",
    price: 5.0,
    icon: "Coins",
    desc: "$50,000 dimasukkan terus ke objektif 'money' akaun anda.",
    command: (ign) => `/scoreboard players add "${ign}" money 50000`
  },
  {
    id: "key_legend",
    tier: "compact",
    name: "3x Kunci Crate",
    category: "Crates",
    tagClass: "tag-crate",
    price: 6.0,
    icon: "Key",
    desc: "Kunci peti misteri Spawn untuk cabutan senjata kosmetik.",
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

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Ambil Live Ping Server Bedrock
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
        return setAuthForm({ ...authForm, err: "Nama pengguna ini sudah berdaftar!" });
      }
      const newUser = { username: u, password: p, gamerTag: ign || u, balanceRM: 0, lastDaily: null, streak: 0, lastVote: null };
      const updated = [...usersDb, newUser];
      setUsersDb(updated);
      save("bc_users_db", updated);
      setCurrentUsername(u);
      save("bc_active_user", u);
      setShowAuth(false);
      showToast(`Akaun didaftarkan: ${u}`);
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

  // Ganjaran Harian: Tepat RM 0.05
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
    showToast("Ganjaran RM 0.05 berjaya dikreditkan!");
  };

  // Undian Bedrock: RM 0.25 Sehari Sekali
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

  const handleConfirmBuy = (e) => {
    e.preventDefault();
    if (!currentUser) return setShowAuth(true);
    const ign = (claimIgn || currentUser.gamerTag || "").trim();
    if (!ign) return showToast("Sila masukkan GamerTag Minecraft!");

    if (currentUser.balanceRM < buyModalItem.price) {
      return showToast("Baki tidak cukup. Sila beli PIN di WhatsApp Admin.");
    }

    updateUser({ balanceRM: +(currentUser.balanceRM - buyModalItem.price).toFixed(2) });

    const newClaim = {
      id: Date.now(),
      username: currentUser.username,
      gamerTag: ign,
      itemName: buyModalItem.name,
      price: buyModalItem.price,
      command: buyModalItem.command(ign),
      status: "PENDING",
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    const updatedClaims = [newClaim, ...claimsList];
    setClaimsList(updatedClaims);
    save("bc_claims", updatedClaims);

    setBuyModalItem(null);
    setClaimIgn("");
    showToast(`Tebusan ${buyModalItem.name} berjaya dihantar.`);
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

      {/* Navigasi Minimalis */}
      <nav className="navbar glass">
        <div className="brand">
          <div className="brand-icon"><Server size={18} /></div>
          <div>
            <div className="brand-name">BakaCrew Hub</div>
            <div className="brand-tag mono">Bedrock Dedicated</div>
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
              <button className="btn-pill btn-logout mono" onClick={() => { setCurrentUsername(""); save("bc_active_user", ""); showToast("Log keluar selesai."); }}>
                <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-pill btn-user mono" onClick={() => { setAuthTab("login"); setShowAuth(true); }}>Log Masuk</button>
              <button className="btn-pill btn-redeem mono" onClick={() => { setAuthTab("register"); setShowAuth(true); }}>Daftar</button>
            </>
          )}
          <button className="btn-pill btn-admin mono" onClick={() => setShowAdmin(true)}>
            {isAdmin ? <Unlock size={12} /> : <Lock size={12} />} Admin
          </button>
        </div>
      </nav>

      {/* Bar Telemetri Pelayan Bedrock */}
      <div className="server-bar glass">
        <div style={{ display: "flex", justifyContent: "s

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Copy, Check, MessageSquare, Heart, Send, 
  MapPin, Image, Search, BookOpen, ChevronDown, ChevronUp,
  Flame, Sparkles, AlertCircle
} from "lucide-react";

const SERVER_INFO = {
  name: "BakaCrew SMP",
  ip: "baka.skyes.me",
  port: "19205",
  edition: "Bedrock Edition",
  location: "Malaysia 🇲🇾",
};

const INITIAL_POSTS = [
  {
    id: 1,
    username: "Lightinityy",
    category: "General",
    text: "Selamat datang ke BakaCrew Hub! Server Bedrock khas untuk mengeratkan pemain Minecraft Malaysia. Bersama kita terokai dunia SMP tanpa lag! 🔥",
    image: "",
    likes: 14,
    isLiked: false,
    timestamp: "Admin Post",
    comments: [
      { id: 101, username: "DanialMC", text: "Terbaik admin! Server stabil sangat ping rendah." }
    ]
  },
  {
    id: 2,
    username: "FaridBuilder",
    category: "Showcase",
    text: "Pangkalan bawah tanah baru saya di koordinat (X: 240, Z: -880) akhirnya siap! Jemput singgah tengok auto-sorter saya.",
    image: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=1000&q=80",
    likes: 21,
    isLiked: false,
    timestamp: "3 jam yang lalu",
    comments: []
  },
  {
    id: 3,
    username: "Aiman_Trader",
    category: "Trade",
    text: "Mencari 2 Netherite Ingot. Saya ada stok 3 Stack Diamond & Mending Book untuk ditukar di Spawn Market!",
    image: "",
    likes: 5,
    isLiked: false,
    timestamp: "5 jam yang lalu",
    comments: []
  }
];

function App() {
  const [serverStatus, setServerStatus] = useState({ online: false, players: 0, max: 30 });
  const [toast, setToast] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  
  // Filtering & Search
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Post Composer State
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  // Local Storage Data
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("bakacrew_v2_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  useEffect(() => {
    localStorage.setItem("bakacrew_v2_posts", JSON.stringify(posts));
  }, [posts]);

  // Semak status pelayan Minecraft Bedrock live
  useEffect(() => {
    fetch(`https://api.mcsrvstat.us/bedrock/3/${SERVER_INFO.ip}:${SERVER_INFO.port}`)
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          online: data.online,
          players: data.players?.online || 0,
          max: data.players?.max || 30
        });
      })
      .catch(() => setServerStatus({ online: false, players: 0, max: 30 }));
  }, []);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showNotification(`${label} (${text}) berjaya disalin!`);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now(),
      username: author.trim(),
      category: category,
      text: content.trim(),
      image: imageUrl.trim(),
      likes: 0,
      isLiked: false,
      timestamp: "Baru sahaja",
      comments: []
    };

    setPosts([newPost, ...posts]);
    setContent("");
    setImageUrl("");
    showNotification("Post anda berjaya diterbitkan!");
  };

  const toggleLike = (postId) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: Date.now(),
                username: author || "Pemain Bedrock",
                text: commentText.trim()
              }
            ]
          };
        }
        return p;
      })
    );
    setCommentInputs({ ...commentInputs, [postId]: "" });
    showNotification("Komen berjaya dihantar!");
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesTab = activeTab === "Semua" || post.category === activeTab;
    const matchesSearch = 
      post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="container">
      {/* Toast Alert */}
      {toast && (
        <div className="toast">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Server size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-name">
              BakaCrew <span>SMP</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="badge-flag" style={{ margin: 0 }}>
            {SERVER_INFO.edition}
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="badge-flag">
          <MapPin size={14} /> Pelayan Minecraft Komuniti {SERVER_INFO.location}
        </div>
        <h1>
          Satu Komuniti, Satu <span className="gradient-text">Bedrock SMP</span>
        </h1>
        <p>
          BakaCrew didedikasikan khas untuk menyatukan pemain telefon pintar (MCPE), Windows 10/11, dan konsol di Malaysia.
        </p>

        {/* Live Status Connection Panels */}
        <div className="connection-panel">
          <div className="glass conn-item">
            <div className="conn-meta">
              <span>Server Address (IP)</span>
              <div className="conn-val">{SERVER_INFO.ip}</div>
            </div>
            <button 
              className="btn-copy" 
              onClick={() => copyToClipboard(SERVER_INFO.ip, "Alamat IP")}
              title="Salin IP"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="glass conn-item">
            <div className="conn-meta">
              <span>Port</span>
              <div className="conn-val">{SERVER_INFO.port}</div>
            </div>
            <button 
              className="btn-copy" 
              onClick={() => copyToClipboard(SERVER_INFO.port, "Port")}
              title="Salin Port"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="glass conn-item">
            <div className="conn-meta">
              <span>Status Pelayan</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
                <span className={serverStatus.online ? "pulse-dot" : ""} style={!serverStatus.online ? { width: 10, height: 10, background: "var(--danger)", borderRadius: "50%" } : {}} />
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {serverStatus.online ? `${serverStatus.players} / ${serverStatus.max} Pemain` : "Standby / Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panduan Masuk Expandable */}
        <button className="guide-btn" onClick={() => setShowGuide(!showGuide)}>
          <BookOpen size={15} /> 
          {showGuide ? "Tutup Panduan Menyertai" : "Cara Masuk Server di Bedrock (Telefon / PC)"}
          {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showGuide && (
          <div className="glass guide-box">
            <h4 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Langkah Mudah Menyertai:</h4>
            <ol style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>Buka Minecraft Bedrock (MCPE / Windows / PS / Xbox).</li>
              <li>Tekan <strong>Play</strong> ➡️ pilih tab <strong>Servers</strong> ➡️ tatal ke bawah dan tekan <strong>Add Server</strong>.</li>
              <li>Masukkan Server Name: <code>BakaCrew</code></li>
              <li>Server Address: <code>{SERVER_INFO.ip}</code> | Port: <code>{SERVER_INFO.port}</code></li>
              <li>Tekan <strong>Save</strong> dan tekan <strong>Join Server</strong>!</li>
            </ol>
          </div>
        )}
      </section>

      {/* Modern Post Composer */}
      <section className="glass composer">
        <form onSubmit={handleCreatePost}>
          <div className="composer-header">
            {/* Live 3D Head Preview berdasarkan nama yang ditaip */}
            <img 
              src={`https://mc-heads.net/avatar/${author.trim() || "Steve"}/64`} 
              alt="Avatar"
              className="composer-avatar-preview"
            />
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="input-styled"
                placeholder="GamerTag / IGN Minecraft anda (cth: Hafiz_Craft)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <select 
              className="tag-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">💬 General</option>
              <option value="Showcase">🏰 Showcase Binaan</option>
              <option value="Trade">💎 Perdagangan</option>
            </select>
          </div>

          <textarea
            className="input-styled"
            placeholder="Ada cerita menarik hari ini? Kongsi koordinat, projek mega atau buka kedai jual beli..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div style={{ marginTop: "0.6rem" }}>
            <input
              type="url"
              className="input-styled"
              style={{ fontSize: "0.85rem" }}
              placeholder="Pautan URL Gambar / Screenshot (pilihan)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="composer-footer">
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Avatar anda dikemas kini mengikut skin rasmi Minecraft.
            </span>
            <button type="submit" className="btn-primary-action">
              <Send size={15} /> Terbitkan Ke Feed
            </button>
          </div>
        </form>
      </section>

      {/* Feed Filters & Search Bar */}
      <div className="feed-toolbar">
        <div className="tab-group">
          {["Semua", "General", "Showcase", "Trade"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Semua" ? "✨ Semua Post" : tab}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Cari post atau pemain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Feed Post List */}
      <section>
        {filteredPosts.length === 0 ? (
          <div className="glass" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <AlertCircle size={36} style={{ margin: "0 auto 0.5rem auto", display: "block" }} />
            Tiada perbualan dijumpai untuk carian ini.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.id} className="glass post-card">
              <div className="post-head">
                <div className="post-user">
                  <img
                    src={`https://mc-heads.net/avatar/${post.username}/48`}
                    alt={post.username}
                    className="post-avatar"
                    onError={(e) => {
                      e.currentTarget.src = "https://mc-heads.net/avatar/Steve/48";
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{post.username}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{post.timestamp}</span>
                  </div>
                </div>

                <span className={`post-badge-tag tag-${post.category}`}>
                  {post.category}
                </span>
              </div>

              <div className="post-body">{post.text}</div>

              {post.image && (
                <img src={post.image} alt="Screenshot Binaan" className="post-image-preview" />
              )}

              {/* Action Buttons */}
              <div className="post-bar">
                <button
                  className={`btn-interactive ${post.isLiked ? "liked" : ""}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} />
                  {post.likes} Suka
                </button>
                <div className="btn-interactive">
                  <MessageSquare size={16} />
                  {post.comments.length} Komen
                </div>
              </div>

              {/* Komuniti Komen Drawer */}
              <div className="comment-drawer">
                {post.comments.map((c) => (
                  <div key={c.id} className="comment-bubble">
                    <strong style={{ color: "var(--primary)", marginRight: "0.5rem" }}>{c.username}:</strong>
                    <span>{c.text}</span>
                  </div>
                ))}

                <form onSubmit={(e) => handleAddComment(post.id, e)} style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                  <input
                    type="text"
                    className="input-styled"
                    style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
                    placeholder="Tulis komen anda..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                  />
                  <button type="submit" className="btn-primary-action" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                    Komen
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

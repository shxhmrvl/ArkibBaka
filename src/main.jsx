import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { 
  Server, Copy, Check, MessageSquare, Heart, Send, 
  Gamepad2, Coins, ShieldCheck, MapPin 
} from "lucide-react";

// Maklumat rasmi pelayan BakaCrew Malaysia
const SERVER_INFO = {
  name: "BakaCrew @ BakaCraft",
  ip: "baka.skyes.me",
  port: "19205",
  platform: "Bedrock Edition",
  location: "Malaysia 🇲🇾",
};

// Data asas post berkaitan pengalaman dalam server BakaCrew
const INITIAL_POSTS = [
  {
    id: 1,
    username: "Lightinityy",
    text: "Selamat datang ke BakaCrew Malaysia! Server Bedrock SMP rasmi untuk satukan komuniti Minecraft tempatan. Sila patuhi peraturan dan selamat ber-survival! 🌲✨",
    likes: 8,
    isLiked: false,
    timestamp: "Pengumuman Admin",
    comments: [
      { id: 101, username: "Steve_MY", text: "Terbaik! Tak sabar nak bina base besar kat spawn." }
    ]
  },
  {
    id: 2,
    username: "AdibCraft",
    text: "Ada sesiapa nak trade Netherite Ingot dengan Emerald? Saya tunggu di Spawn Market sekarang! 💎",
    likes: 3,
    isLiked: false,
    timestamp: "2 jam lepas",
    comments: []
  }
];

function App() {
  const [copiedIP, setCopiedIP] = useState(false);
  const [copiedPort, setCopiedPort] = useState(false);
  
  // Status live server menggunakan API Bedrock
  const [serverStatus, setServerStatus] = useState({ online: false, players: 0, max: 30 });

  // Simpan data post di localStorage komputer
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("bakacrew_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [authorName, setAuthorName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    localStorage.setItem("bakacrew_posts", JSON.stringify(posts));
  }, [posts]);

  // Semak status pelayan Bedrock secara langsung
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

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "ip") {
      setCopiedIP(true);
      setTimeout(() => setCopiedIP(false), 2000);
    } else {
      setCopiedPort(true);
      setTimeout(() => setCopiedPort(false), 2000);
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!authorName.trim() || !postContent.trim()) return;

    const newPost = {
      id: Date.now(),
      username: authorName.trim(),
      text: postContent.trim(),
      likes: 0,
      isLiked: false,
      timestamp: "Baru sahaja",
      comments: []
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
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
                username: authorName || "Pemain",
                text: commentText.trim()
              }
            ]
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <Server size={28} color="var(--primary)" />
          <div>
            <div className="logo-title">{SERVER_INFO.name}</div>
          </div>
        </div>
        <span className="edition-tag">Bedrock Only</span>
      </nav>

      {/* Hero Header */}
      <div className="hero">
        <div className="hero-badge">
          <MapPin size={15} /> Komuniti Pelayan Minecraft {SERVER_INFO.location}
        </div>
        <h1>
          Pusat Komuniti <span>BakaCrew SMP</span>
        </h1>
        <p>
          Dedicated Server khas untuk menyatukan komuniti Bedrock Malaysia (MCPE, Windows, & Konsol). Bertemu rakan baharu dan bina legasi anda!
        </p>

        {/* Kotak IP & Port */}
        <div className="server-box">
          <div className="ip-card">
            <div>
              <div className="ip-label">Server IP (Address)</div>
              <div className="ip-value">{SERVER_INFO.ip}</div>
            </div>
            <button onClick={() => copyText(SERVER_INFO.ip, "ip")} className="btn-icon" title="Salin IP">
              {copiedIP ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="ip-card">
            <div>
              <div className="ip-label">Port</div>
              <div className="ip-value">{SERVER_INFO.port}</div>
            </div>
            <button onClick={() => copyText(SERVER_INFO.port, "port")} className="btn-icon" title="Salin Port">
              {copiedPort ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="ip-card">
            <div>
              <div className="ip-label">Status Server</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: serverStatus.online ? "var(--primary)" : "var(--danger)",
                    boxShadow: serverStatus.online ? "0 0 8px var(--primary)" : "none"
                  }}
                />
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  {serverStatus.online
                    ? `${serverStatus.players} / ${serverStatus.max} Pemain`
                    : "Offline / Standby"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keistimewaan Server */}
      <div className="features-grid">
        <div className="feature-item">
          <Gamepad2 size={26} color="var(--primary)" />
          <h4>SMP Survival</h4>
          <p>Pengembaraan kelangsungan hidup tulen yang menyeronokkan bersama komuniti.</p>
        </div>
        <div className="feature-item">
          <Coins size={26} color="var(--accent)" />
          <h4>Sistem Ekonomi</h4>
          <p>Beli, jual barang dan wujudkan kedai perniagaan pemain anda sendiri.</p>
        </div>
        <div className="feature-item">
          <ShieldCheck size={26} color="var(--primary)" />
          <h4>Komuniti Mesra</h4>
          <p>Kawalan peraturan yang selesa dan selamat untuk semua peringkat umur.</p>
        </div>
      </div>

      {/* Form Kongsi Post Komuniti */}
      <div className="post-form-card">
        <h3>
          <MessageSquare size={20} color="var(--primary)" /> Kongsi Sesuatu di Komuniti BakaCrew
        </h3>
        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            className="input-field"
            placeholder="Minecraft GamerTag / IGN anda (cth: SteveMY)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <textarea
            className="input-field"
            placeholder="Kongsi projek binaan, cari team untuk mining, atau jemput pemain singgah ke kedai anda..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            <Send size={16} /> Hantar Post
          </button>
        </form>
      </div>

      {/* Feed & Interaksi Post */}
      <div>
        <div className="feed-header">
          <h3 style={{ fontSize: "1.2rem" }}>Papan Komuniti Terkini ({posts.length})</h3>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-top">
              <img
                src={`https://mc-heads.net/avatar/${post.username}/42`}
                alt={post.username}
                className="avatar"
                onError={(e) => {
                  e.currentTarget.src = "https://mc-heads.net/avatar/Steve/42";
                }}
              />
              <div>
                <div className="author-name">{post.username}</div>
                <div className="post-time">{post.timestamp}</div>
              </div>
            </div>

            <div className="post-text">{post.text}</div>

            <div className="post-actions">
              <button
                className={`action-btn ${post.isLiked ? "liked" : ""}`}
                onClick={() => toggleLike(post.id)}
              >
                <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} />
                {post.likes} Suka
              </button>
              <div className="action-btn">
                <MessageSquare size={16} />
                {post.comments.length} Komen
              </div>
            </div>

            {/* Komen */}
            <div className="comments-box">
              {post.comments.map((c) => (
                <div key={c.id} className="comment-row">
                  <span className="comment-author">{c.username}:</span>
                  <span>{c.text}</span>
                </div>
              ))}

              <form onSubmit={(e) => handleAddComment(post.id, e)} className="comment-form">
                <input
                  type="text"
                  className="input-field"
                  style={{ marginBottom: 0, padding: "0.45rem 0.8rem", fontSize: "0.85rem" }}
                  placeholder="Balas komen..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                  }
                />
                <button type="submit" className="btn-primary" style={{ padding: "0.45rem 0.9rem" }}>
                  Komen
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

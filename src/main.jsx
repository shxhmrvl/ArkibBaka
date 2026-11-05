import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Play, Pause, Volume2, VolumeX, Bookmark, BookmarkCheck,
  Heart, ArrowRight, ArrowUpRight, Compass, Flame, Gamepad2,
  X, Check, Music2, Disc3
} from 'lucide-react'
import './style.css'

// Laluan fail audio (letakkan departure.mp3 di dalam folder public/)
const BGM_URL = '/departure.mp3'

const yearsData = [
  {
    year: '2018', title: 'The Spark & The Voice Call', tag: 'ORIGIN',
    desc: 'Bermula dari Steam lobby dan Discord kecil dengan 7 orang rakan. Tempat gelaran Baka mula tercipta.',
    highlights: ['Server Discord pertama dibuka', '7 ahli pengasas asal', 'Kemenangan 5-stack pertama dirai'],
    stats: { members: 7, voiceHours: '140h', mainGame: 'Dota 2 / CS:GO' }
  },
  {
    year: '2019', title: 'Anime Seasons & Late Matchups', tag: 'CONNECTION',
    desc: 'Tayangan anime setiap Jumaat malam dan perlawanan kompetitif hingga awal pagi.',
    highlights: ['Watch party anime rasmi pertama', 'Komuniti mencecah 50 ahli', 'Soundboard khas komuniti dilancar'],
    stats: { members: 54, voiceHours: '850h', mainGame: 'Apex Legends' }
  },
  {
    year: '2020', title: 'The Sanctuary in Isolation', tag: 'SANCTUARY',
    desc: 'Tatkala dunia berkurung, Discord Baka menjadi tempat selamat untuk bergelak tawa 24/7.',
    highlights: ['Lobi Among Us sampai jam 5 pagi', 'Server rasmi Minecraft dibuka', 'Mencecah 200 ahli aktif'],
    stats: { members: 210, voiceHours: '4,200h', mainGame: 'Among Us / Genshin' }
  },
  {
    year: '2021', title: 'Bot Experiments & Guild Tourneys', tag: 'EVOLUTION',
    desc: 'Kelahiran bot buatan sendiri BakaBot dan penganjuran turnamen dalaman.',
    highlights: ['Turnamen Valorant komuniti', 'BakaBot v1 beroperasi', 'Perjumpaan fizikal pertama ahli'],
    stats: { members: 340, voiceHours: '5,600h', mainGame: 'Valorant' }
  },
  {
    year: '2022', title: 'The Golden Multiverse', tag: 'EXPANSION',
    desc: 'Projek kolaborasi lukisan, perkongsian muzik dan aktiviti merentasi zon masa.',
    highlights: ['Kehadiran ke acara konvensyen anime', 'Buku seni komuniti (Zine)', 'Projek binaan mega Minecraft'],
    stats: { members: 520, voiceHours: '6,100h', mainGame: 'Minecraft / Elden Ring' }
  },
  {
    year: '2023', title: 'Quiet Echoes & Deeper Bonds', tag: 'INTIMACY',
    desc: 'Persahabatan semakin matang tatkala masing-masing mula melangkah ke alam kerjaya.',
    highlights: ['Kenduri perkahwinan ahli pertama', 'Saluran Arkib dibuka', 'Sesi lepak santai Lo-Fi'],
    stats: { members: 560, voiceHours: '3,800h', mainGame: 'Baldur’s Gate 3' }
  },
  {
    year: '2024', title: 'The Time Capsule Initiative', tag: 'REFLECTION',
    desc: 'Proses mengumpul semula tangkap layar lama, audio clip, dan memori silam bermula.',
    highlights: ['Projek Arkib diasaskan secara rasmi', 'Throwback LAN party', 'Buku memori digital disiapkan'],
    stats: { members: 580, voiceHours: '2,900h', mainGame: 'Helldivers 2' }
  },
  {
    year: '2025', title: 'Preserving the Narrative', tag: 'LEGACY',
    desc: 'Membina rumah digital kekal untuk mengabadikan setiap kenangan warga Baka.',
    highlights: ['Domain Arkib:Baka didaftarkan', 'Manifesto pemeliharaan digubal', 'Lebih 1,000 foto diarkibkan'],
    stats: { members: 600, voiceHours: '2,400h', mainGame: 'Monster Hunter' }
  },
  {
    year: '2026', title: 'The Living Digital Museum', tag: 'PERMANENCE',
    desc: 'Arkib dibuka secara rasmi. Segala tawa dan air mata kekal terpahat buat selamanya.',
    highlights: ['Laman memorial rasmi dilancarkan', 'Buku tamu awam beroperasi', 'Kapsul masa dikunci abadi'],
    stats: { members: '600+', voiceHours: '30,000h+', mainGame: 'Arkib:Baka' }
  }
]

const erasData = [
  {
    num: '01', years: '2018 — 2019', title: 'Permulaan & Sembang 3 Pagi',
    desc: 'Zaman permulaan 7 orang sahabat bermain CS:GO dan berbincang tentang episod anime kegemaran.',
    stats: ['7 Pengasas Asal', 'CS:GO & Dota 2', 'Lobi Penuh Pertama']
  },
  {
    num: '02', years: '2020 — 2021', title: 'Keluarga Tatkala Kuarantin',
    desc: 'Saluran suara sentiasa hidup sepanjang hari menemani ahli yang belajar dan bekerja dari rumah.',
    stats: ['Zaman Kegemilangan Among Us', 'Dunia Minecraft v1', '300+ Ahli']
  },
  {
    num: '03', years: '2022 — 2023', title: 'Turnamen & Komuniti Kreatif',
    desc: 'Pelbagai acara pertandingan e-sukan, perjumpaan luar, dan bot ciptaan sendiri diperkenalkan.',
    stats: ['Turnamen Valorant', 'BakaBot v2', 'Anime Expo Meetup']
  },
  {
    num: '04', years: '2024 — 2026', title: 'Arkib Abadi & Warisan',
    desc: 'Usaha memelihara segala memori agar tidak hilang ditelan arus peredaran masa.',
    stats: ['Muzium Digital Arkib', 'Buku Tamu Terbuka', 'Kenangan Abadi']
  }
]

const initialMemories = [
  {
    id: 'm1', title: 'Clutch 4:20 Pagi Yang Menyelamatkan Pasukan', year: '2019', category: 'Gaming', author: 'Kaelen',
    desc: 'Pusingan penentu 14-15, tinggal seorang diri dengan hanya 12 HP. Seluruh voice chat senyap membisu.',
    story: 'Tiada siapa berani bernafas selama 45 saat. Bila bomb berjaya di-defuse, suara jeritan gembira bergema sampai jiran bilik sebelah ketuk pintu!',
    symbol: '⚡', reactions: { heart: 42, fire: 18, gg: 35 }
  },
  {
    id: 'm2', title: 'Watch Party Demon Slayer Ep 19', year: '2019', category: 'Anime', author: 'Aura',
    desc: 'Lebih 20 orang menatap skrin serentak. Babak Hinokami Kagura membuatkan semua terpaku.',
    story: 'Kira 3, 2, 1 serentak sebelum tekan Play. Selepas episod tamat, semua terdiam sebelum sambung sembang sampai Subuh.',
    symbol: '🌸', reactions: { heart: 61, fire: 29, gg: 12 }
  },
  {
    id: 'm3', title: 'Binaan Kota Megah Minecraft', year: '2020', category: 'Creative', author: 'MochiBuilder',
    desc: 'Dua minggu kuarantin dihabiskan melombong batu untuk membina istana impian komuniti.',
    story: 'Bila bumbung kayu disambar kilat dan terbakar jam 2 pagi, semua ahli bergegas online bawa baldi air untuk padamkan api!',
    symbol: '🏰', reactions: { heart: 55, fire: 22, gg: 40 }
  }
]

const initialGuestbook = [
  { id: 1, name: 'Zane_99', tag: 'Gaming', msg: 'Tahun 2020 adalah tahun yang sukar, tapi lepak dengan korang dalam VC buat saya kuat. Terima kasih Baka.', date: '2026-03-14' },
  { id: 2, name: 'CherriBlossom', tag: 'Nostalgia', msg: 'Masih rindu malam-malam main Minecraft sambil dengar lagu Naruto sama-sama.', date: '2026-02-28' }
]

export default function App() {
  const [path, setPath] = useState(location.hash.slice(1) || '/')
  const [selectedYear, setSelectedYear] = useState('2018')
  const [memories, setMemories] = useState(initialMemories)
  const [activeModalMemory, setActiveModalMemory] = useState(null)
  
  // BGM Naruto Audio Player State
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const [guestEntries, setGuestEntries] = useState(initialGuestbook)
  const [guestForm, setGuestForm] = useState({ name: '', tag: 'Gaming', msg: '' })

  const navigate = p => { 
    location.hash = p
    setPath(p)
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  useEffect(() => {
    const handleHash = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Playback error or file missing:', err)
          alert('Sila letakkan fail lagu "departure.mp3" di dalam folder public/ projek anda!')
        })
    }
  }

  const reactToMemory = (memId, type) => {
    setMemories(prev => prev.map(m => {
      if (m.id === memId) {
        return { ...m, reactions: { ...m.reactions, [type]: (m.reactions?.[type] || 0) + 1 } }
      }
      return m
    }))
    if (activeModalMemory && activeModalMemory.id === memId) {
      setActiveModalMemory(prev => ({
        ...prev,
        reactions: { ...prev.reactions, [type]: (prev.reactions?.[type] || 0) + 1 }
      }))
    }
  }

  const handleGuestSubmit = e => {
    e.preventDefault()
    if (!guestForm.name.trim() || !guestForm.msg.trim()) return
    const next = [
      { id: Date.now(), name: guestForm.name.trim(), tag: guestForm.tag, msg: guestForm.msg.trim(), date: new Date().toISOString().split('T')[0] },
      ...guestEntries
    ]
    setGuestEntries(next)
    setGuestForm({ name: '', tag: 'Gaming', msg: '' })
  }

  const selectedYearObj = yearsData.find(y => y.year === selectedYear) || yearsData[0]

  return (
    <>
      {/* Naruto BGM Audio Element */}
      <audio 
        ref={audioRef} 
        src={BGM_URL} 
        loop 
        preload="auto"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <button className="brand" onClick={() => navigate('/')}>
            <div className="brand-mark">B.</div>
            <div className="brand-text">ARKIB<span>:BAKA</span><small>MEMORIAL • 2018–2026</small></div>
          </button>
          <nav className="nav-links">
            {[['Utama','/'],['Kronologi','/history'],['Era','/eras'],['Memori','/memories'],['Buku Tamu','/guestbook']].map(([t, p]) => (
              <button key={p} className={`nav-link ${path === p ? 'active' : ''}`} onClick={() => navigate(p)}>{t}</button>
            ))}
          </nav>
          
          {/* Header BGM Pill */}
          <button className={`bgm-chip ${isPlaying ? 'playing' : ''}`} onClick={toggleMusic} title="Naruto Shippuden OST">
            <Disc3 className={isPlaying ? 'spin' : ''} size={15} />
            <div className="bgm-chip-text">
              <span className="bgm-title">Departure to Front Line</span>
              <span className="bgm-sub">{isPlaying ? 'SEDANG DIMAINKAN' : 'TEKAN UNTUK DENGAR'}</span>
            </div>
            {isPlaying && (
              <span className="wave-bars">
                <span/><span/><span/>
              </span>
            )}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {path === '/' && (
            <>
              {/* Kemas & Minimalist Hero Section */}
              <section className="hero-clean">
                <div className="hero-radial-bg" />
                <div className="container hero-center">
                  
                  {/* Badges Bar */}
                  <div className="hero-badges-row">
                    <span className="clean-pill"><span className="pulse-dot" /> ARKIB DIGITAL 2018 — 2026</span>
                    <span className="clean-pill sub">8 TAHUN PERJALANAN</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="hero-main-title">
                    Satu Komuniti.<br />
                    <span>Sejuta Kenangan Abadi.</span>
                  </h1>

                  <p className="hero-lead">
                    Dari saat pertama lobi game dicipta, gelak tawa larut malam dalam Discord, 
                    hingga ke persahabatan yang kekal selamanya. Selamat datang ke arkib sejarah Baka.
                  </p>

                  {/* Action Buttons & Music Player Card */}
                  <div className="hero-button-group">
                    <button className="btn-glow" onClick={() => navigate('/history')}>
                      Terokai Garis Masa <ArrowUpRight size={16} />
                    </button>
                    <button className={`btn-music-dock ${isPlaying ? 'active' : ''}`} onClick={toggleMusic}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                      <span>{isPlaying ? 'Hentikan Lagu' : 'Mainkan BGM Naruto'}</span>
                    </button>
                  </div>

                  {/* Mini Now-Playing Card */}
                  <div className="ost-indicator">
                    <Music2 size={13} color="var(--accent)" />
                    <span>OST: <b>Departure to the Front Lines (出陣)</b> — Yasuharu Takanashi</span>
                  </div>

                  {/* Stats Counter Kemas */}
                  <div className="clean-stats-grid">
                    <div className="clean-stat-box">
                      <b>9</b>
                      <small>BABAK SEJARAH</small>
                    </div>
                    <div className="clean-stat-box">
                      <b>600+</b>
                      <small>SAHABAT BERSATU</small>
                    </div>
                    <div className="clean-stat-box">
                      <b>30,000h+</b>
                      <small>MASA DI VOICE CHAT</small>
                    </div>
                    <div className="clean-stat-box">
                      <b style={{ color: 'var(--emerald)' }}>KEKAL</b>
                      <small>DIABADIKAN</small>
                    </div>
                  </div>

                </div>
              </section>

              {/* Eras Overview */}
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <div>
                      <div className="eyebrow">4 EPOCH KEGEMILANGAN</div>
                      <h2 className="section-title">Perjalanan Rentas Zaman</h2>
                      <p className="section-subtitle">Bagaimana sekumpulan kecil pemain game berkembang menjadi komuniti erat.</p>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/eras')}>Lihat Semua Era <ArrowRight size={15} /></button>
                  </div>
                  <div className="eras-timeline-grid">
                    {erasData.map(era => (
                      <div className="era-card-detailed" key={era.num}>
                        <span className="era-num">{era.num}</span>
                        <div className="era-years">{era.years}</div>
                        <h3 className="era-title">{era.title}</h3>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>{era.desc}</p>
                        <div className="era-stats-pill">
                          {era.stats.map((s, idx) => <span className="stat-tag" key={idx}><b>•</b> {s}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {path === '/history' && (
            <div className="section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">KRONOLOGI 2018–2026</div>
                    <h1 className="section-title">Garis Masa Arkib</h1>
                    <p className="section-subtitle">Pilih tahun untuk membaca babak peristiwa yang pernah berlaku.</p>
                  </div>
                </div>
                <div className="timeline-strip-container">
                  <div className="timeline-strip">
                    {yearsData.map(y => (
                      <button key={y.year} className={`timeline-btn ${selectedYear === y.year ? 'active' : ''}`} onClick={() => setSelectedYear(y.year)}>
                        <span className="year">{y.year}</span>
                        <span className="tag">{y.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="year-spotlight">
                  <div>
                    <div className="eyebrow">{selectedYearObj.tag} • BABAK {yearsData.indexOf(selectedYearObj) + 1}</div>
                    <h3>{selectedYearObj.title}</h3>
                    <p className="year-spotlight-desc">{selectedYearObj.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
                      <div className="mini-stat-card"><small>AHLI</small><b>{selectedYearObj.stats.members}</b></div>
                      <div className="mini-stat-card"><small>MASA VC</small><b>{selectedYearObj.stats.voiceHours}</b></div>
                      <div className="mini-stat-card"><small>GAME UTAMA</small><b>{selectedYearObj.stats.mainGame}</b></div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '14px' }}>PERISTIWA UTAMA</h4>
                    <div className="year-highlights">
                      {selectedYearObj.highlights.map((h, i) => (
                        <div className="highlight-item" key={i}><Check size={15} /><span>{h}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {path === '/eras' && (
            <div className="section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">4 ERA KOMUNITI</div>
                    <h1 className="section-title">Era-Era Kegemilangan</h1>
                    <p className="section-subtitle">Fasa perubahan dari zaman permulaan sehingga terciptanya arkib digital ini.</p>
                  </div>
                </div>
                <div className="eras-timeline-grid">
                  {erasData.map(era => (
                    <div className="era-card-detailed" key={era.num}>
                      <span className="era-num">{era.num}</span>
                      <div className="era-years">{era.years}</div>
                      <h2 className="era-title">{era.title}</h2>
                      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '14px' }}>{era.desc}</p>
                      <div className="era-stats-pill">
                        {era.stats.map((s, idx) => <span className="stat-tag" key={idx}><b>•</b> {s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {path === '/memories' && (
            <div className="section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">KOLEKSI FRAGMEN</div>
                    <h1 className="section-title">Memori Terpilih</h1>
                    <p className="section-subtitle">Detik-detik bermakna yang disumbangkan oleh rakan-rakan komuniti.</p>
                  </div>
                </div>
                <div className="memory-grid">
                  {memories.map(item => (
                    <article className="memory-card" key={item.id} onClick={() => setActiveModalMemory(item)}>
                      <div className="card-header-art">
                        <span className="card-badge tag-pill">{item.category}</span>
                        <span className="card-year-badge">{item.year}</span>
                        <div className="card-art-symbol">{item.symbol}</div>
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{item.title}</h3>
                        <p className="card-desc">{item.desc}</p>
                        <div className="card-footer">
                          <span>❤️ {item.reactions?.heart || 0}</span>
                          <span>Oleh {item.author}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {path === '/guestbook' && (
            <div className="section">
              <div className="container">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">BUKU KENANGAN</div>
                    <h1 className="section-title">Tinggalkan Jejak</h1>
                    <p className="section-subtitle">Tulis ucapan atau kenangan anda untuk diabadikan di dalam arkib ini.</p>
                  </div>
                </div>
                <div className="guest-wrapper">
                  <div className="guest-form-card">
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Tulis Catatan</h3>
                    <form className="guest-form" onSubmit={handleGuestSubmit}>
                      <div className="form-group">
                        <label>NAMA / HANDLE DISCORD</label>
                        <input className="form-input" required placeholder="Contoh: Kae_Baka" value={guestForm.name} onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>MESEJ ANDA</label>
                        <textarea className="form-textarea" required rows={4} placeholder="Kongsi kenangan anda..." value={guestForm.msg} onChange={e => setGuestForm({ ...guestForm, msg: e.target.value })} />
                      </div>
                      <button className="btn-glow" type="submit">Hantar Catatan <ArrowUpRight size={15} /></button>
                    </form>
                  </div>
                  <div className="guest-list">
                    {guestEntries.map(entry => (
                      <div className="guest-note" key={entry.id}>
                        <div className="guest-note-top">
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{entry.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{entry.date}</span>
                        </div>
                        <p className="guest-msg">{entry.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </AnimatePresence>

      {/* Modal Popup Apabila Klik Kad Memori */}
      {activeModalMemory && (
        <div className="modal-overlay" onClick={() => setActiveModalMemory(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalMemory(null)}><X size={18} /></button>
            <div className="modal-hero"><span>{activeModalMemory.symbol}</span></div>
            <div className="modal-content">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="tag-pill">{activeModalMemory.category}</span>
                <span className="tag-pill">{activeModalMemory.year}</span>
                <span className="tag-pill">Oleh {activeModalMemory.author}</span>
              </div>
              <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>{activeModalMemory.title}</h2>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '16px' }}>
                {activeModalMemory.story || activeModalMemory.desc}
              </p>
              <div className="modal-reactions">
                <button className="reaction-btn" onClick={() => reactToMemory(activeModalMemory.id, 'heart')}>
                  <Heart size={14} /> {activeModalMemory.reactions?.heart || 0}
                </button>
                <button className="reaction-btn" onClick={() => reactToMemory(activeModalMemory.id, 'fire')}>
                  <Flame size={14} /> {activeModalMemory.reactions?.fire || 0}
                </button>
                <button className="reaction-btn" onClick={() => reactToMemory(activeModalMemory.id, 'gg')}>
                  <Gamepad2 size={14} /> GG {activeModalMemory.reactions?.gg || 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Mini Player bila lagu dimainkan */}
      {isPlaying && (
        <div className="floating-music-bar">
          <div className="floating-inner">
            <Disc3 className="spin" size={18} color="var(--accent)" />
            <div className="floating-text">
              <b>Departure to the Front Line (出陣)</b>
              <small>Naruto Shippuden OST • Yasuharu Takanashi</small>
            </div>
            <button className="btn-mini-pause" onClick={toggleMusic}><Pause size={14} /></button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-bottom">
          <span>© 2018–2026 ARKIB:BAKA. SETIAP DETIK BERMAKNA.</span>
          <span>DIMAJUKAN BERSAMA DENGAN KASIH SAYANG.</span>
        </div>
      </footer>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)

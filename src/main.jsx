import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles, Search, Volume2, VolumeX, Bookmark, BookmarkCheck,
  Heart, Share2, ArrowRight, ArrowUpRight, Compass, Users,
  Layers, MessageSquare, Terminal, Eye, Download, Plus, X,
  Gamepad2, Film, MessageCircle, Palette, Flame, Shield,
  Award, Clock, Check
} from 'lucide-react'
import './style.css'

// ==========================================
// 1. DATASETS (MEMORIES, ERAS, YEARS, PEOPLE)
// ==========================================
const yearsData = [
  {
    year: '2018',
    title: 'The Spark & The Voice Call',
    tag: 'ORIGIN',
    desc: 'Late-night Steam lobbies and a freshly minted Discord server with only 7 active members. Where the Baka moniker was born.',
    highlights: ['First Discord guild created', 'Original 7 members joined', 'First 5-stack victory celebrated'],
    stats: { members: 7, voiceHours: '140h', mainGame: 'Dota 2 / CS:GO' }
  },
  {
    year: '2019',
    title: 'Anime Seasons & Late Matchups',
    tag: 'CONNECTION',
    desc: 'Friday anime screenings, seasonal tier lists, and expanding past initial friend circles into multi-game squads.',
    highlights: ['First scheduled anime watch party (Demon Slayer S1)', 'Server reaches 50 members', 'Launch of custom soundboard'],
    stats: { members: 54, voiceHours: '850h', mainGame: 'Apex Legends' }
  },
  {
    year: '2020',
    title: 'The Sanctuary in Isolation',
    tag: 'SANCTUARY',
    desc: 'When lockdowns shifted the world indoors, the server became a lifeline. 24/7 active voice channels and emergency co-op nights.',
    highlights: ['Among Us lobbies running till 5 AM', 'Minecraft server Realm launch', 'Server reaches 200 members'],
    stats: { members: 210, voiceHours: '4,200h', mainGame: 'Among Us / Genshin' }
  },
  {
    year: '2021',
    title: 'Bot Experiments & Guild Traditions',
    tag: 'EVOLUTION',
    desc: 'Custom discord bot "BakaBot" coded by the community, automatic level-up roles, and internal tournaments.',
    highlights: ['First in-house Valorant tournament', 'BakaBot v1 release', 'First physical convention meetup'],
    stats: { members: 340, voiceHours: '5,600h', mainGame: 'Valorant' }
  },
  {
    year: '2022',
    title: 'The Golden Multiverse',
    tag: 'EXPANSION',
    desc: 'Art collabs, music streams, cross-server community skirmishes, and member milestones celebrated across timezones.',
    highlights: ['Anime Expo group attendance', 'Collaborative art zine published', 'Minecraft mega-monument built'],
    stats: { members: 520, voiceHours: '6,100h', mainGame: 'Minecraft / Elden Ring' }
  },
  {
    year: '2023',
    title: 'Quiet Echoes & Deeper Bonds',
    tag: 'INTIMACY',
    desc: 'Fewer chaotic 30-person calls, but deeper one-on-one friendships. Life took members into careers and relocations.',
    highlights: ['First community wedding celebrated', 'Archive voice channel dedicated', 'Chill lofi listening parties'],
    stats: { members: 560, voiceHours: '3,800h', mainGame: 'Baldur’s Gate 3' }
  },
  {
    year: '2024',
    title: 'The Time Capsule Initiative',
    tag: 'REFLECTION',
    desc: 'Members started gathering vintage screenshots, sound clips, and old memes into a collaborative Google Drive.',
    highlights: ['Archive project officially founded', 'Retro LAN party throwback', 'Digital yearbook launched'],
    stats: { members: 580, voiceHours: '2,900h', mainGame: 'Helldivers 2' }
  },
  {
    year: '2025',
    title: 'Preserving the Narrative',
    tag: 'LEGACY',
    desc: 'Designing the permanent digital home. Translating Discord history and inside jokes into curated digital exhibits.',
    highlights: ['Arkib:Baka domain registered', 'Preservation manifesto drafted', 'Over 1,000 photos indexed'],
    stats: { members: 600, voiceHours: '2,400h', mainGame: 'Monster Hunter' }
  },
  {
    year: '2026',
    title: 'The Living Digital Museum',
    tag: 'PERMANENCE',
    desc: 'Arkib:Baka opens its doors to the public. Every chapter, laugh, and memory preserved for everyone who was part of the journey.',
    highlights: ['Public interactive memorial archive deployed', 'Global guestbook launched', 'Indestructible time vault sealed'],
    stats: { members: '600+', voiceHours: '30,000h+', mainGame: 'The Archive' }
  }
]

const erasData = [
  {
    num: '01',
    years: '2018 — 2019',
    title: 'Genesis & The 3 AM Voice Calls',
    desc: 'The primordial era. Seven friends in a Discord server named as an inside joke, spending weekends in CS:GO matchmaking and debating anime seasonal finales.',
    stats: ['7 Original Founders', 'CS:GO & Dota 2', 'First Discord Nitro Boost'],
    symbol: '🎮'
  },
  {
    num: '02',
    years: '2020 — 2021',
    title: 'The Sanctuary in the Lockdown',
    desc: 'The server transformed from a casual hangout into a vital digital shelter. Voice channels stayed full 24/7 with members studying, gaming, and comforting each other.',
    stats: ['Among Us Era', 'Minecraft World v1', '300+ Members'],
    symbol: '🛡️'
  },
  {
    num: '03',
    years: '2022 — 2023',
    title: 'The Creative Multiverse & Tourneys',
    desc: 'Peak activity across gaming tournaments, convention meetups, custom Discord bot development, and communal Spotify listening rooms.',
    stats: ['In-house Tournaments', 'BakaBot v2', 'Anime Expo Meetup'],
    symbol: '✨'
  },
  {
    num: '04',
    years: '2024 — 2026',
    title: 'The Archive & Digital Horizon',
    desc: 'As careers and families flourished, the mission shifted to preservation: ensuring that eight years of camaraderie, art, and laughter remain immortalized.',
    stats: ['Arkib:Baka Memorial', 'Permanent Guestbook', 'Endless Legacy'],
    symbol: '🏛️'
  }
]

const initialMemories = [
  {
    id: 'm1',
    title: 'The 4:20 AM Clutch That Saved The Night',
    year: '2019',
    category: 'Gaming',
    author: 'Kaelen',
    desc: 'Down 14-15 in overtime, last man standing with 12 HP. The entire voice call muted in silent prayer until the bomb defusal sound went off.',
    story: 'Nobody in the voice chat dared breathe for 45 straight seconds. When the round ended, the noise overloaded our Discord channel microphones so badly that someone’s roommate knocked on their door. It was the moment we knew we would be gaming together for years.',
    symbol: '⚡',
    reactions: { heart: 42, fire: 18, gg: 35 }
  },
  {
    id: 'm2',
    title: 'Demon Slayer Ep 19 Watch Party',
    year: '2019',
    category: 'Anime',
    author: 'Aura',
    desc: 'Over twenty of us synchronized screens using rabbit and Discord screen-share. The collective gasp when the ending theme hit was legendary.',
    story: 'Before high-res Discord video was even standard, we counted down "3, 2, 1, PLAY" to sync VLC players. That episode broke everyone. We spent two hours afterward analyzing every frame and ordering bubble tea at midnight.',
    symbol: '🌸',
    reactions: { heart: 61, fire: 29, gg: 12 }
  },
  {
    id: 'm3',
    title: 'The Great Minecraft Castle Build',
    year: '2020',
    category: 'Creative',
    author: 'MochiBuilder',
    desc: 'Two weeks of quarantine spent quarrying cobblestone by hand to build a gothic citadel complete with a tavern and secret passages.',
    story: 'We had dedicated shifts: four people mining underground, three clearing trees, and two architects styling the roofs. When lightning struck and burned half the wooden roof, everyone logged on at 2 AM with water buckets to rescue the keep.',
    symbol: '🏰',
    reactions: { heart: 55, fire: 22, gg: 40 }
  },
  {
    id: 'm4',
    title: 'BakaBot Plays Rickroll on Stage',
    year: '2021',
    category: 'Bots & Tech',
    author: 'DevRen',
    desc: 'The creator promised a new music algorithm. When invoked in the general voice room, it locked the bot volume at 100% and Rickrolled 30 people.',
    story: 'A classic rite of passage in the server. Ren had secretly pushed the commit at 3 AM. Even server admins could not kick the bot for 5 whole minutes because Discord API permissions were intentionally tangled.',
    symbol: '🤖',
    reactions: { heart: 38, fire: 50, gg: 44 }
  },
  {
    id: 'm5',
    title: 'First In-Person Convention Dinner',
    year: '2022',
    category: 'Meetups',
    author: 'Hana',
    desc: 'Putting faces to Discord avatars for the very first time over a giant ramen table. It felt as if we had already known each other for a decade.',
    story: 'Walking up to the meeting spot and recognizing each other purely by voice timbre was surreal. We traded handmade keychains and spent the entire evening laughing about moments that started in a text channel years prior.',
    symbol: '🍜',
    reactions: { heart: 89, fire: 34, gg: 20 }
  },
  {
    id: 'm6',
    title: 'The Baldur’s Gate Chaos Campaign',
    year: '2023',
    category: 'Gaming',
    author: 'Rico',
    desc: 'Four bards playing lute simultaneously while accidentally triggering an explosive barrel cascade that wiped the entire goblin camp.',
    story: 'A campaign that was supposed to be serious turned into a circus of musical performances, failed stealth rolls, and legendary saves. One of the highlights of 2023.',
    symbol: '🎲',
    reactions: { heart: 46, fire: 25, gg: 38 }
  }
]

const peopleData = [
  {
    name: 'Kaelen "Kae"',
    role: 'Founder & Guildmaster',
    avatar: 'K',
    yearsActive: '2018 — Present',
    quote: 'We started this server just so we had a place to vent after matches. Look at us now.',
    badges: ['Original 7', 'Tourney Host', 'Shotcaller']
  },
  {
    name: 'Aura',
    role: 'Head of Screenings & Anime',
    avatar: 'A',
    yearsActive: '2019 — Present',
    quote: 'If you haven’t cried during a seasonal anime marathon in voice chat, have you even lived?',
    badges: ['Watch Party Lead', 'Trophy Collector']
  },
  {
    name: 'DevRen',
    role: 'Bot Architect & Systems',
    avatar: 'R',
    yearsActive: '2020 — Present',
    quote: 'It’s not a bug, it’s a community feature that adds character.',
    badges: ['BakaBot Dev', 'Sysadmin', 'Meme Master']
  },
  {
    name: 'MochiBuilder',
    role: 'Minecraft Sovereign & Artist',
    avatar: 'M',
    yearsActive: '2020 — Present',
    quote: 'Give me two stacks of wood and some torches, and I will build you a home.',
    badges: ['Server Architect', 'Zine Contributor']
  },
  {
    name: 'Hana',
    role: 'Community Historian',
    avatar: 'H',
    yearsActive: '2021 — Present',
    quote: 'Every screenshot saved today is a treasure for tomorrow.',
    badges: ['Photo Archivist', 'Event Coordinator']
  },
  {
    name: 'Vesper',
    role: 'Resident DJ & Sound Host',
    avatar: 'V',
    yearsActive: '2019 — Present',
    quote: 'Good music makes even the worst defeat feel cinematic.',
    badges: ['Lofi Curator', 'Radio Host']
  }
]

const initialGuestbook = [
  {
    id: 1,
    name: 'Zane_99',
    tag: 'Gaming',
    msg: 'Spent the hardest months of 2020 in voice channel #3. You guys quite literally kept me sane. Forever grateful to Baka.',
    date: '2026-03-14',
    hearts: 14
  },
  {
    id: 2,
    name: 'CherriBlossom',
    tag: 'Nostalgia',
    msg: 'Still remember the Minecraft server launch night. Building little wooden cottages while laughing until our stomachs hurt.',
    date: '2026-02-28',
    hearts: 19
  },
  {
    id: 3,
    name: 'Kenji',
    tag: 'Late Night',
    msg: 'The 3 AM debates on which anime opening was the greatest of all time will always be peak memories for me.',
    date: '2026-01-19',
    hearts: 9
  }
]

// ==========================================
// 2. SYNTHESIZED SOUNDSCAPE (WEB AUDIO API)
// ==========================================
class AmbientAudioEngine {
  constructor() {
    this.ctx = null
    this.isPlaying = false
    this.oscillators = []
    this.gainNode = null
  }

  init() {
    if (this.ctx) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    this.ctx = new AudioCtx()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime)
    this.gainNode.connect(this.ctx.destination)
  }

  toggle() {
    this.init()
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    if (this.isPlaying) {
      this.stop()
      this.isPlaying = false
    } else {
      this.start()
      this.isPlaying = true
    }
    return this.isPlaying
  }

  start() {
    // Generate gentle harmonic ambient pad (D minor chord: D3, F3, A3, C4)
    const freqs = [146.83, 174.61, 220.00, 261.63]
    this.oscillators = freqs.map((freq, i) => {
      const osc = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()
      const oscGain = this.ctx.createGain()

      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(450 + i * 50, this.ctx.currentTime)

      oscGain.gain.setValueAtTime(0.03, this.ctx.currentTime)

      osc.connect(filter)
      filter.connect(oscGain)
      oscGain.connect(this.gainNode)

      osc.start()
      return osc
    })
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch (e) {}
    })
    this.oscillators = []
  }
}

const audioEngine = new AmbientAudioEngine()

// ==========================================
// 3. MAIN REACT APP
// ==========================================
export default function App() {
  const [path, setPath] = useState(location.hash.slice(1) || '/')
  const [selectedYear, setSelectedYear] = useState('2018')
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('arkib_memories')
    return saved ? JSON.parse(saved) : initialMemories
  })
  const [bookmarks, setBookmarks] = useState(() => {
    return JSON.parse(localStorage.getItem('arkib_bookmarks') || '[]')
  })
  const [activeModalMemory, setActiveModalMemory] = useState(null)
  const [soundActive, setSoundActive] = useState(false)
  const [scanlines, setScanlines] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Guestbook State
  const [guestEntries, setGuestEntries] = useState(() => {
    const saved = localStorage.getItem('arkib_guestbook_v2')
    return saved ? JSON.parse(saved) : initialGuestbook
  })
  const [guestForm, setGuestForm] = useState({ name: '', tag: 'Gaming', msg: '' })

  // Search & Filters in Memories Page
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Routing Handler
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

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setCmdOpen(false)
        setActiveModalMemory(null)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Audio Toggle
  const toggleAudio = () => {
    const active = audioEngine.toggle()
    setSoundActive(active)
  }

  // Scanline Toggle
  const toggleScanlines = () => {
    document.body.classList.toggle('scanlines')
    setScanlines(!scanlines)
  }

  // Bookmark toggler
  const toggleBookmark = id => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('arkib_bookmarks', JSON.stringify(next))
      return next
    })
  }

  // Reaction incrementer
  const reactToMemory = (memId, type) => {
    setMemories(prev => {
      const updated = prev.map(m => {
        if (m.id === memId) {
          const count = (m.reactions?.[type] || 0) + 1
          return { ...m, reactions: { ...m.reactions, [type]: count } }
        }
        return m
      })
      localStorage.setItem('arkib_memories', JSON.stringify(updated))
      if (activeModalMemory && activeModalMemory.id === memId) {
        setActiveModalMemory(updated.find(x => x.id === memId))
      }
      return updated
    })
  }

  // Submit Guestbook entry
  const handleGuestSubmit = e => {
    e.preventDefault()
    if (!guestForm.name.trim() || !guestForm.msg.trim()) return
    const newEntry = {
      id: Date.now(),
      name: guestForm.name.trim(),
      tag: guestForm.tag,
      msg: guestForm.msg.trim(),
      date: new Date().toISOString().split('T')[0],
      hearts: 1
    }
    const updated = [newEntry, ...guestEntries]
    setGuestEntries(updated)
    localStorage.setItem('arkib_guestbook_v2', JSON.stringify(updated))
    setGuestForm({ name: '', tag: 'Gaming', msg: '' })
  }

  // Export Guestbook
  const exportGuestbook = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(guestEntries, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "arkib-baka-guestbook.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Filtered Memories
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const matchCat = categoryFilter === 'All' || m.category === categoryFilter
      const matchQuery = (m.title + ' ' + m.desc + ' ' + m.year + ' ' + m.author).toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchQuery
    })
  }, [memories, categoryFilter, searchQuery])

  // Command palette results
  const cmdResults = useMemo(() => {
    if (!cmdQuery.trim()) {
      return [
        { label: 'Explore 9-Year History Timeline', path: '/history', cat: 'Navigation' },
        { label: 'Browse Memory Archives', path: '/memories', cat: 'Navigation' },
        { label: 'View 4 Era Epochs', path: '/eras', cat: 'Navigation' },
        { label: 'Hall of Fame & People', path: '/people', cat: 'Navigation' },
        { label: 'Community Guestbook', path: '/guestbook', cat: 'Navigation' },
        { label: 'Toggle Ambient Soundscape', action: toggleAudio, cat: 'System' },
        { label: 'Toggle CRT Scanline Effect', action: toggleScanlines, cat: 'System' }
      ]
    }
    const q = cmdQuery.toLowerCase()
    const navMatches = [
      { label: 'Home Page', path: '/', cat: 'Navigation' },
      { label: 'History Timeline (2018–2026)', path: '/history', cat: 'Navigation' },
      { label: 'Eras & Epochs', path: '/eras', cat: 'Navigation' },
      { label: 'Memories Collection', path: '/memories', cat: 'Navigation' },
      { label: 'Hall of Fame & Community People', path: '/people', cat: 'Navigation' },
      { label: 'Guestbook Notes', path: '/guestbook', cat: 'Navigation' },
      { label: 'About Project Manifesto', path: '/about', cat: 'Navigation' }
    ].filter(i => i.label.toLowerCase().includes(q))

    const memoryMatches = memories
      .filter(m => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
      .map(m => ({ label: `Memory: ${m.title}`, action: () => { setActiveModalMemory(m); setCmdOpen(false) }, cat: 'Memory Card' }))

    return [...navMatches, ...memoryMatches]
  }, [cmdQuery, memories])

  const selectedYearObj = yearsData.find(y => y.year === selectedYear) || yearsData[0]

  // ==========================================
  // 4. SUBCOMPONENTS (HEADER, FOOTER, MODAL)
  // ==========================================
  const Header = () => (
    <header className="header">
      <div className="container header-inner">
        <button className="brand" onClick={() => navigate('/')}>
          <div className="brand-mark">B.</div>
          <div className="brand-text">
            ARKIB<span>:BAKA</span>
            <small>MEMORIAL • 2018–2026</small>
          </div>
        </button>

        <nav className="nav-links">
          {[
            ['Home', '/'],
            ['History', '/history'],
            ['Eras', '/eras'],
            ['Memories', '/memories'],
            ['People', '/people'],
            ['Guestbook', '/guestbook'],
            ['About', '/about']
          ].map(([title, p]) => (
            <button
              key={p}
              className={`nav-link ${path === p ? 'active' : ''}`}
              onClick={() => navigate(p)}
            >
              {title}
            </button>
          ))}
        </nav>

        <div className="header-tools">
          <button
            className={`audio-chip ${soundActive ? 'active' : ''}`}
            onClick={toggleAudio}
            title="Toggle synthesized ambient soundscape"
          >
            {soundActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="wave-bars">
              <span/><span/><span/>
            </span>
            <span>{soundActive ? 'LO-FI ON' : 'AUDIO OFF'}</span>
          </button>

          <button className="k-badge" onClick={() => setCmdOpen(true)}>
            <Search size={13} />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>

          <button
            className="btn-icon"
            onClick={() => setDrawerOpen(true)}
            title="Saved Bookmarks"
          >
            <Bookmark size={15} />
            {bookmarks.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)'
              }} />
            )}
          </button>
        </div>
      </div>
    </header>
  )

  const Footer = () => (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand-text" style={{ fontSize: '20px' }}>
              ARKIB<span>:BAKA</span>
            </div>
            <p className="footer-quote">
              “Some communities end. Their stories don’t have to.” An open digital memorial preserving eight years of gaming, friendship, and anime.
            </p>
          </div>

          <div className="footer-col">
            <h4>Archive Index</h4>
            <ul>
              <li><button onClick={() => navigate('/history')}>Timeline (2018–2026)</button></li>
              <li><button onClick={() => navigate('/eras')}>Community Epochs</button></li>
              <li><button onClick={() => navigate('/memories')}>Fragments & Highlights</button></li>
              <li><button onClick={() => navigate('/people')}>Hall of Fame</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Interact</h4>
            <ul>
              <li><button onClick={() => navigate('/guestbook')}>Sign the Guestbook</button></li>
              <li><button onClick={toggleAudio}>Ambient Soundscape</button></li>
              <li><button onClick={toggleScanlines}>Retro CRT Scanlines</button></li>
              <li><button onClick={exportGuestbook}>Export Memorial JSON</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2018–2026 ARKIB:BAKA. BUILT WITH CARE FOR EVERY MEMBER.</span>
          <span>CURATED & PRESERVED INDEFINITELY.</span>
        </div>
      </div>
    </footer>
  )

  // ==========================================
  // 5. VIEW PAGES
  // ==========================================
  
  // Home View
  const renderHome = () => (
    <>
      <section className="hero-wrapper">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              THE BAKA DIGITAL ARCHIVE • 2018 — 2026
            </div>
            <h1 className="hero-title">
              One community.<br />Many <em>worlds.</em>
            </h1>
            <p className="hero-desc">
              From late-night voice channel laughs to unforgettable tournament clutches and anime watch parties. Arkib:Baka preserves the shared history of our digital sanctuary.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/history')}>
                Explore 9-Year Timeline <ArrowUpRight size={15} />
              </button>
              <button className="btn-secondary" onClick={() => navigate('/memories')}>
                Browse Vault ({memories.length})
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <b>9</b>
                <small>YEARS PRESERVED</small>
              </div>
              <div className="hero-stat">
                <b>600+</b>
                <small>MEMBERS UNITED</small>
              </div>
              <div className="hero-stat">
                <b>30,000h+</b>
                <small>SHARED IN VOICE</small>
              </div>
            </div>
          </div>

          <div className="hero-visual-card">
            <div className="terminal-bar">
              <div className="dots">
                <span /><span /><span />
              </div>
              <span className="terminal-path">arkib://baka-vault/manifesto.md</span>
              <span className="tag-pill">ARCHIVED</span>
            </div>

            <div className="hero-stamp-zone">
              <div className="cyber-stamp">
                <span>BAKA</span>
                <small>EST. MMXVIII</small>
              </div>
            </div>

            <div className="stamp-meta">
              <div className="stamp-meta-row">
                <span>EPOCH:</span>
                <b>2018 — 2026 (PERMANENT)</b>
              </div>
              <div className="stamp-meta-row">
                <span>LOCATION:</span>
                <b>DISCORD / STEAM / MINECRAFT</b>
              </div>
              <div className="stamp-meta-row">
                <span>STATUS:</span>
                <b style={{ color: 'var(--emerald)' }}>● ONLINE & IMMORTAL</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Eras Spotlight */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="eyebrow">THE 4 EPOCHS</div>
              <h2 className="section-title">A Journey Through Eras</h2>
              <p className="section-subtitle">
                How a small group of gamers expanded into a vibrant multi-interest community.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/eras')}>
              View All Eras <ArrowRight size={15} />
            </button>
          </div>

          <div className="eras-timeline-grid">
            {erasData.map(era => (
              <div className="era-card-detailed" key={era.num}>
                <span className="era-num">{era.num}</span>
                <div className="era-years">{era.years}</div>
                <h3 className="era-title">{era.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>{era.desc}</p>
                <div className="era-stats-pill">
                  {era.stats.map((s, idx) => (
                    <span className="stat-tag" key={idx}><b>•</b> {s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Moments Preview */}
      <section className="section" style={{ background: '#090d18' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <div className="eyebrow">MEMORY VAULT HIGHLIGHTS</div>
              <h2 className="section-title">Saved Fragments</h2>
              <p className="section-subtitle">
                Stories, photos, and quotes submitted by members across the years.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/memories')}>
              Open Vault <ArrowRight size={15} />
            </button>
          </div>

          <div className="memory-grid">
            {memories.slice(0, 3).map(item => (
              <MemoryCard
                key={item.id}
                item={item}
                onOpen={() => setActiveModalMemory(item)}
                isBookmarked={bookmarks.includes(item.id)}
                onBookmark={() => toggleBookmark(item.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )

  // Timeline / History View
  const renderHistory = () => (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="eyebrow">NINE-YEAR CHRONICLE</div>
            <h1 className="section-title">The Master Timeline</h1>
            <p className="section-subtitle">
              Click through each chapter to see how the server grew, adapted, and built its legacy from 2018 to 2026.
            </p>
          </div>
        </div>

        {/* Horizontal Scroller */}
        <div className="timeline-strip-container">
          <div className="timeline-strip">
            {yearsData.map(y => (
              <button
                key={y.year}
                className={`timeline-btn ${selectedYear === y.year ? 'active' : ''}`}
                onClick={() => setSelectedYear(y.year)}
              >
                <span className="year">{y.year}</span>
                <span className="tag">{y.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Year Card */}
        <div className="year-spotlight" data-year={selectedYearObj.year}>
          <div>
            <div className="eyebrow">{selectedYearObj.tag} • CHAPTER {yearsData.indexOf(selectedYearObj) + 1}</div>
            <h3>{selectedYearObj.title}</h3>
            <p className="year-spotlight-desc">{selectedYearObj.desc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', fontSize: '9px' }}>MEMBERS</small>
                <b style={{ display: 'block', fontSize: '18px' }}>{selectedYearObj.stats.members}</b>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', fontSize: '9px' }}>VOICE TIME</small>
                <b style={{ display: 'block', fontSize: '18px' }}>{selectedYearObj.stats.voiceHours}</b>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', fontSize: '9px' }}>TOP TITLE</small>
                <b style={{ display: 'block', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedYearObj.stats.mainGame}</b>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '14px' }}>
              KEY MILESTONES & ARTIFACTS
            </h4>
            <div className="year-highlights">
              {selectedYearObj.highlights.map((h, i) => (
                <div className="highlight-item" key={i}>
                  <Check size={16} />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Eras View
  const renderEras = () => (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="eyebrow">COMMUNITY EPOCHS</div>
            <h1 className="section-title">The Four Golden Eras</h1>
            <p className="section-subtitle">
              Every stage brought new members, new games, and a distinct cultural mood.
            </p>
          </div>
        </div>

        <div className="eras-timeline-grid">
          {erasData.map(era => (
            <div className="era-card-detailed" key={era.num}>
              <span className="era-num">{era.num}</span>
              <div className="era-years">{era.years}</div>
              <h2 className="era-title">{era.title}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '14px' }}>
                {era.desc}
              </p>
              <div className="era-stats-pill">
                {era.stats.map((s, idx) => (
                  <span className="stat-tag" key={idx}>
                    <b>•</b> {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Memories View
  const renderMemories = () => (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="eyebrow">COMMUNITY VAULT</div>
            <h1 className="section-title">Archived Memories</h1>
            <p className="section-subtitle">
              Browse authentic fragments, funny quotes, and clutch moments saved from our history.
            </p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-pills">
            {['All', 'Gaming', 'Anime', 'Creative', 'Bots & Tech', 'Meetups'].map(cat => (
              <button
                key={cat}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={15} color="var(--text-sub)" />
            <input
              placeholder="Search by title, author, year..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredMemories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
            <p>No memories match your query. Try searching for something else!</p>
          </div>
        ) : (
          <div className="memory-grid">
            {filteredMemories.map(item => (
              <MemoryCard
                key={item.id}
                item={item}
                onOpen={() => setActiveModalMemory(item)}
                isBookmarked={bookmarks.includes(item.id)}
                onBookmark={() => toggleBookmark(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // People / Hall of Fame View
  const renderPeople = () => (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="eyebrow">HALL OF FAME</div>
            <h1 className="section-title">The People of Baka</h1>
            <p className="section-subtitle">
              A community is not its software or servers — it is the people who gave up sleep to be there.
            </p>
          </div>
        </div>

        <div className="people-grid">
          {peopleData.map((p, idx) => (
            <div className="person-card" key={idx}>
              <div className="person-avatar">{p.avatar}</div>
              <h3 className="person-name">{p.name}</h3>
              <div className="person-role">{p.role}</div>
              <p className="person-quote">"{p.quote}"</p>
              <div className="person-badges">
                {p.badges.map((b, i) => (
                  <span className="tag-pill" key={i}>{b}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Guestbook View
  const renderGuestbook = () => (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="eyebrow">PUBLIC TIME CAPSULE</div>
            <h1 className="section-title">Community Guestbook</h1>
            <p className="section-subtitle">
              Leave your signature, a memory, or a thank you message in the permanent archive.
            </p>
          </div>
          <button className="btn-secondary" onClick={exportGuestbook}>
            <Download size={14} /> Export JSON
          </button>
        </div>

        <div className="guest-wrapper">
          <div className="guest-form-card">
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Leave a Note</h3>
            <form className="guest-form" onSubmit={handleGuestSubmit}>
              <div className="form-group">
                <label>HANDLE / NICKNAME</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Kae_Dota"
                  value={guestForm.name}
                  onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>MEMORY THEME</label>
                <select
                  className="form-select"
                  value={guestForm.tag}
                  onChange={e => setGuestForm({ ...guestForm, tag: e.target.value })}
                >
                  <option value="Gaming">🎮 Gaming & Matches</option>
                  <option value="Anime">🌸 Anime & Screenings</option>
                  <option value="Late Night">🌙 3 AM Voice Calls</option>
                  <option value="Nostalgia">🥂 Gratitude & Nostalgia</option>
                  <option value="Creative">🎨 Art & Builds</option>
                </select>
              </div>

              <div className="form-group">
                <label>YOUR MESSAGE</label>
                <textarea
                  className="form-textarea"
                  required
                  rows={4}
                  placeholder="A memory, inside joke, or heartfelt thought..."
                  value={guestForm.msg}
                  onChange={e => setGuestForm({ ...guestForm, msg: e.target.value })}
                />
              </div>

              <button className="btn-primary" type="submit">
                Pin to Guestbook <ArrowUpRight size={15} />
              </button>
            </form>
          </div>

          <div className="guest-list">
            {guestEntries.map(entry => (
              <div className="guest-note" key={entry.id}>
                <div className="guest-note-top">
                  <div className="guest-author">
                    <span>{entry.name}</span>
                    <span className="tag-pill">{entry.tag}</span>
                  </div>
                  <span className="guest-date">{entry.date}</span>
                </div>
                <p className="guest-msg">{entry.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // About View
  const renderAbout = () => (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="eyebrow">ABOUT THE ARCHIVE</div>
        <h1 className="section-title" style={{ marginBottom: '24px' }}>
          Built to Remember.<br />Preserved with Care.
        </h1>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Online gaming clans, anime servers, and friend groups usually vanish into the void when platforms change or people grow older. Chat logs get purged, screenshots sit forgotten on dead hard drives, and inside jokes fade.
          </p>
          <p>
            <strong>Arkib:Baka</strong> was created to counter this digital impermanence. It serves as a unified digital museum for everyone who hung out in our voice rooms between 2018 and 2026.
          </p>
          <p>
            Every memory, milestone, and testimonial here is treated with editorial respect. All members retain the right to have their photos or names adjusted or anonymized at any point.
          </p>
          <div style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>The Archival Principles</h4>
            <ul style={{ listStyle: 'inside square', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Preservation over Hype:</strong> Authentic moments over sanitized PR.</li>
              <li><strong>Open Access:</strong> Freely downloadable and exportable by all members.</li>
              <li><strong>Respect & Consent:</strong> Personal privacy always respected upon request.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // Router Map
  const routes = {
    '/': renderHome,
    '/history': renderHistory,
    '/eras': renderEras,
    '/memories': renderMemories,
    '/people': renderPeople,
    '/guestbook': renderGuestbook,
    '/about': renderAbout
  }

  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {(routes[path] || renderHome)()}
        </motion.main>
      </AnimatePresence>
      <Footer />

      {/* Memory Lightbox Modal */}
      {activeModalMemory && (
        <div className="modal-overlay" onClick={() => setActiveModalMemory(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalMemory(null)}>
              <X size={18} />
            </button>
            <div className="modal-hero">
              <span>{activeModalMemory.symbol}</span>
            </div>
            <div className="modal-content">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="tag-pill">{activeModalMemory.category}</span>
                <span className="tag-pill">{activeModalMemory.year}</span>
                <span className="tag-pill">By {activeModalMemory.author}</span>
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{activeModalMemory.title}</h2>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '16px' }}>
                {activeModalMemory.story || activeModalMemory.desc}
              </p>

              <div className="modal-reactions">
                <button
                  className="reaction-btn"
                  onClick={() => reactToMemory(activeModalMemory.id, 'heart')}
                >
                  <Heart size={14} /> {activeModalMemory.reactions?.heart || 0}
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => reactToMemory(activeModalMemory.id, 'fire')}
                >
                  <Flame size={14} /> {activeModalMemory.reactions?.fire || 0}
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => reactToMemory(activeModalMemory.id, 'gg')}
                >
                  <Gamepad2 size={14} /> GG {activeModalMemory.reactions?.gg || 0}
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => toggleBookmark(activeModalMemory.id)}
                  style={{ marginLeft: 'auto' }}
                >
                  {bookmarks.includes(activeModalMemory.id) ? (
                    <><BookmarkCheck size={14} color="var(--accent)" /> Saved</>
                  ) : (
                    <><Bookmark size={14} /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette (Cmd + K) */}
      {cmdOpen && (
        <div className="cmd-backdrop" onClick={() => setCmdOpen(false)}>
          <div className="cmd-modal" onClick={e => e.stopPropagation()}>
            <div className="cmd-input-wrap">
              <Search size={18} color="var(--accent)" />
              <input
                autoFocus
                placeholder="Jump to a year, person, era or memory..."
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
              />
            </div>
            <div className="cmd-results">
              {cmdResults.map((item, idx) => (
                <div
                  className="cmd-item"
                  key={idx}
                  onClick={() => {
                    if (item.path) navigate(item.path)
                    if (item.action) item.action()
                    setCmdOpen(false)
                  }}
                >
                  <span>
                    <Compass size={14} />
                    {item.label}
                  </span>
                  <span className="cmd-category">{item.cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Drawer */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px' }}>Saved Fragments ({bookmarks.length})</h3>
              <button onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            {bookmarks.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                No saved memories yet. Click the bookmark icon on any card to save it here.
              </p>
            ) : (
              memories
                .filter(m => bookmarks.includes(m.id))
                .map(m => (
                  <div
                    key={m.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setActiveModalMemory(m)
                      setDrawerOpen(false)
                    }}
                  >
                    <b style={{ fontSize: '13px', display: 'block' }}>{m.title}</b>
                    <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                      {m.year} • {m.category}
                    </small>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Memory Card Component
function MemoryCard({ item, onOpen, isBookmarked, onBookmark }) {
  return (
    <article className="memory-card" onClick={onOpen}>
      <div className="card-header-art">
        <span className="card-badge tag-pill">{item.category}</span>
        <span className="card-year-badge">{item.year}</span>
        <div className="card-art-symbol">{item.symbol}</div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc">{item.desc}</p>
        <div className="card-footer">
          <div className="card-reaction-preview">
            <span>❤️ {item.reactions?.heart || 0}</span>
            <span>🔥 {item.reactions?.fire || 0}</span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation()
              onBookmark()
            }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this'}
          >
            {isBookmarked ? <BookmarkCheck size={14} color="var(--accent)" /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>
    </article>
  )
}

// Render root
createRoot(document.getElementById('root')).render(<App />)

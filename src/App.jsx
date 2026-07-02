import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'

// --- Copy written by Fable 5 ---
const EYEBROW = 'Santa Monica · our last LA sunset'
const CELEBRATION = 'To Dr. Wendy — you actually did it. I’m so proud of you. 🎓'
const LEAD_IN = 'Before we leave this city, there’s one more thing I need to ask you.'
const QUESTION = 'Wendy, will you be my girlfriend? 🌅'
const YES_SUBTITLE = '(you already know I’m hoping)'

const NO_LABELS = [
  'No 🙅‍♀️',
  'Are you sure?',
  'Think it over, Doctor',
  'The sunset’s watching 🌇',
  'I’ll wait right here',
  'Even the ocean says yes',
  'That button’s shy too 😌'
]

const SUCCESS_TITLE = 'She said yes 🥂'
const SUCCESS_SUBTITLE_1 = 'Flowers are already on their way to you 💐'
const SUCCESS_SUBTITLE_2 = 'Now let’s go catch our last LA sunset.'

const LETTER_TITLE = 'One more thing, Wendy'
const LETTER = `Wendy — before anything else: you did it. Years of work, and now it's official. Dr. Wendy. I've watched you carry this, and I couldn't be prouder of the woman standing next to me today.

It's our last day in LA, and I didn't want to leave this city without saying what I've been sure of for a while now. The flowers arriving today are for the doctorate. This question is for us.

I want to be yours — properly, officially. I want a hundred more sunsets like this one, with you.

So, Wendy: will you be my girlfriend?`
const LETTER_SIGNOFF = '— all yours, Jordan 💛'

const FOOTER = 'Regent Santa Monica Beach · July 6, 2026'

function App() {
  const [yesPressed, setYesPressed] = useState(false)
  const [noPos, setNoPos] = useState({ top: 'auto', left: 'auto', position: 'relative' })
  const [btnSize, setBtnSize] = useState(null)
  // Each dodge shrinks "No" and grows "Yes" so it's impossible to tap on a phone
  const [dodgeCount, setDodgeCount] = useState(0)
  // Whether the hidden note is open on the success page
  const [letterOpen, setLetterOpen] = useState(false)
  const confettiCanvasRef = useRef(null)

  const noBtnRef = useRef(null)
  const containerRef = useRef(null)

  // --- Background music: slchld – "you won't be there for me" (YouTube embed) ---
  // Music only starts when she taps the 🔈 button — no auto-start.
  const ytPlayerRef = useRef(null)
  const wantPlayRef = useRef(false) // she tapped 🔈 before the player was ready
  const [musicOn, setMusicOn] = useState(false)

  const startPlayback = useCallback(() => {
    const p = ytPlayerRef.current
    if (!p || typeof p.playVideo !== 'function') return
    p.unMute()
    p.setVolume(55)
    p.playVideo()
    setMusicOn(true)
  }, [])

  const createPlayer = useCallback(() => {
    // Guard: StrictMode runs effects twice in dev — never create two players.
    if (ytPlayerRef.current || !(window.YT && window.YT.Player)) return
    const VIDEO_ID = 'muLqukEiVm4'
    ytPlayerRef.current = new window.YT.Player('yt-audio', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: VIDEO_ID,
        playsinline: 1
      },
      events: {
        onReady: () => {
          if (wantPlayRef.current) startPlayback()
        },
        onError: (e) => console.error('[music] error', e.data)
      }
    })
  }, [startPlayback])

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer()
      return
    }
    // Load the YouTube iframe API once
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
    window.onYouTubeIframeAPIReady = createPlayer
  }, [createPlayer])

  const toggleMusic = () => {
    if (musicOn) {
      const p = ytPlayerRef.current
      if (p && typeof p.pauseVideo === 'function') p.pauseVideo()
      wantPlayRef.current = false
      setMusicOn(false)
      return
    }
    wantPlayRef.current = true
    if (!ytPlayerRef.current) {
      createPlayer() // onReady will start playback
      return
    }
    startPlayback()
  }

  // Floating hearts
  const [hearts, setHearts] = useState([])
  useEffect(() => {
    const symbols = ['❤', '💛', '💗', '🤍']
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 100 + 'vw',
      duration: Math.random() * 3 + 4 + 's',
      delay: Math.random() * 5 + 's'
    }))
    setHearts(newHearts)
  }, [])

  // Runaway "No" button
  const lastMoveTime = useRef(0)
  const moveButton = useCallback((e) => {
    if (e && e.cancelable) e.preventDefault()
    if (!noBtnRef.current || !containerRef.current) return
    lastMoveTime.current = Date.now()
    setDodgeCount((c) => c + 1)

    const btnRect = noBtnRef.current.getBoundingClientRect()
    if (!btnSize) setBtnSize({ width: btnRect.width, height: btnRect.height })

    const containerRect = containerRef.current.getBoundingClientRect()
    const padding = 20
    const maxLeft = containerRect.width - btnRect.width - padding
    const maxTop = containerRect.height - btnRect.height - padding
    const randomX = Math.max(padding, Math.random() * maxLeft)
    const randomY = Math.max(padding, Math.random() * maxTop)

    setNoPos({ position: 'absolute', left: `${randomX}px`, top: `${randomY}px` })
  }, [])

  // Proximity trigger (desktop)
  useEffect(() => {
    if (yesPressed) return
    const handleMouseMove = (e) => {
      if (!noBtnRef.current) return
      const r = noBtnRef.current.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
      if (dist < 200 && Date.now() - lastMoveTime.current > 100) moveButton()
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [yesPressed, moveButton])

  // Confetti on "Yes"
  useEffect(() => {
    if (yesPressed && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      let particles = []
      const colors = ['#ff8e6e', '#ffd28a', '#ff5a8e', '#c85a8e', '#fff6d8']

      function P() {
        this.x = Math.random() * canvas.width
        this.y = -20
        this.size = Math.random() * 8 + 4
        this.speedY = Math.random() * 3 + 2
        this.speedX = Math.random() * 2 - 1
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.rotation = Math.random() * 360
      }
      P.prototype.update = function () {
        this.y += this.speedY
        this.x += this.speedX
        this.rotation += 2
      }
      P.prototype.draw = function () {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.fillStyle = this.color
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        ctx.restore()
      }

      for (let i = 0; i < 150; i++) {
        setTimeout(() => particles.push(new P()), i * 5)
      }

      const animate = () => {
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((p, idx) => {
          p.update()
          p.draw()
          if (p.y > canvas.height) particles.splice(idx, 1)
        })
        if (particles.length > 0) requestAnimationFrame(animate)
      }
      animate()

      const onResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [yesPressed])

  // Reusable CSS sunset scene
  const SunsetHero = () => (
    <div className="sunset-hero">
      <div className="sun" />
      <div className="ocean">
        <div className="shimmer" />
      </div>
    </div>
  )

  return (
    <>
      {/* Hidden YouTube audio player + music toggle */}
      <div id="yt-audio" className="yt-audio-hidden"></div>
      <button
        className="music-toggle"
        onClick={toggleMusic}
        aria-label={musicOn ? 'Mute music' : 'Play music'}
      >
        {musicOn ? '🔊' : '🔈'}
      </button>

      {/* Floating hearts */}
      <div className="bg-hearts">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="heart"
            style={{ left: h.left, animationDuration: h.duration, animationDelay: h.delay }}
          >
            {h.symbol}
          </div>
        ))}
      </div>

      {!yesPressed ? (
        <div className="container" ref={containerRef}>
          <SunsetHero />
          <p className="eyebrow">{EYEBROW}</p>
          <h2 className="celebration">{CELEBRATION}</h2>
          <p className="lead-in">{LEAD_IN}</p>
          <h1>{QUESTION}</h1>
          <div className="buttons">
            <button
              className="btn-yes"
              style={{ transform: `scale(${1 + dodgeCount * 0.15})` }}
              onClick={() => setYesPressed(true)}
            >
              Yes 💛
            </button>
            {noPos.position === 'absolute' && btnSize && (
              <div style={{ width: btnSize.width, height: btnSize.height }} />
            )}
            <button
              ref={noBtnRef}
              className="btn-no"
              style={{ ...noPos, transform: `scale(${Math.max(0.4, 1 - dodgeCount * 0.12)})` }}
              onMouseOver={moveButton}
              onMouseEnter={moveButton}
              onTouchStart={moveButton}
              onClick={moveButton}
            >
              {NO_LABELS[Math.min(dodgeCount, NO_LABELS.length - 1)]}
            </button>
          </div>
          <p className="yes-subtitle">{YES_SUBTITLE}</p>
          <p className="footer-line">{FOOTER}</p>
        </div>
      ) : (
        <>
          <div className="container success-message" style={{ display: 'block' }}>
            <SunsetHero />
            <h1 className="success-text">{SUCCESS_TITLE}</h1>
            <p className="sub-text">
              {SUCCESS_SUBTITLE_1}
              <br />
              {SUCCESS_SUBTITLE_2}
            </p>

            {!letterOpen ? (
              <button className="letter-open" onClick={() => setLetterOpen(true)}>
                💌 {LETTER_TITLE}
              </button>
            ) : (
              <div className="letter-card">
                <p className="letter-body">{LETTER}</p>
                <p className="letter-signoff">{LETTER_SIGNOFF}</p>
              </div>
            )}
            <p className="footer-line">{FOOTER}</p>
          </div>
          <canvas ref={confettiCanvasRef} id="confetti"></canvas>
        </>
      )}
    </>
  )
}

export default App

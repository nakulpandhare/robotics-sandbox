import { useState, useEffect, useRef } from "react";
import { useTheme } from "./theme/ThemeContext";
import {
  MapPin, Mail, Phone, Check, ArrowRight, Trophy, Globe, PartyPopper, Bot, ChevronRight,
} from "lucide-react";
import "./karoo-landing.css";

/* ────────────────────────────────────────────────────────────
   THE CLIMB — Karoo's emblem (mountain, switchback path, rising
   sun) staged as a real cinematic scene rather than a small
   badge: a sunrise-over-mountains hero with parallax, and a
   horizontal drag-scroll filmstrip for the Day 1 → Day 10
   journey later in the page. Every illustration is hand-authored
   inline SVG; no external image assets.
   ──────────────────────────────────────────────────────────── */

const STARS = [
  { x: 120, y: 90, r: 1.6, d: 0.2 }, { x: 260, y: 150, r: 1.2, d: 1.1 },
  { x: 420, y: 70, r: 1.8, d: 0.6 }, { x: 560, y: 160, r: 1.3, d: 1.8 },
  { x: 200, y: 220, r: 1.1, d: 2.4 }, { x: 980, y: 100, r: 1.6, d: 0.9 },
  { x: 1120, y: 60, r: 1.2, d: 1.6 }, { x: 1260, y: 150, r: 1.8, d: 0.3 },
  { x: 1400, y: 90, r: 1.3, d: 2.1 }, { x: 340, y: 40, r: 1.1, d: 1.3 },
  { x: 860, y: 190, r: 1.4, d: 0.7 }, { x: 1480, y: 170, r: 1.2, d: 1.9 },
];

/* Brand emblem — mountain range, switchback path, rising sun. */
function MountainMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <circle cx="21" cy="10" r="2.1" fill="var(--gold)" />
      <path d="M7 22 L12 14 L15 17 L19 9 L23 18 L26 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <path d="M10 22 L13 17.5 L11.5 15 L14.5 11.5 L14 9.5" stroke="var(--ember)" strokeWidth="1.3" strokeDasharray="2.2 2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* Cinematic hero backdrop — layered mountain silhouettes drifting
   at different parallax speeds behind a rising, glowing sun, with
   a switchback trail climbing the tallest peak and a compact
   silhouette scene (kid, RC car, waving robot) at the tree line. */
function HeroSky({ backRef, midRef, frontRef }) {
  return (
    <div className="kc-sky" aria-hidden="true">
      <svg viewBox="0 0 1600 620" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A sun rising behind layered mountain silhouettes, with a dashed switchback trail climbing the tallest peak">
        <defs>
          <radialGradient id="kcSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3D6" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--ember)" />
          </radialGradient>
        </defs>

        <g className="kc-stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F7F1E6" style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>

        <circle className="kc-sun" cx="800" cy="255" r="72" fill="url(#kcSun)" />

        <g ref={backRef} className="kc-mtn-back">
          <path d="M0 620 L0 440 L130 400 L270 450 L410 380 L570 430 L730 370 L890 420 L1050 360 L1210 410 L1370 370 L1600 420 L1600 620 Z" fill="#2A2140" />
        </g>
        <g ref={midRef} className="kc-mtn-mid">
          <path d="M0 620 L0 480 L150 340 L290 420 L430 280 L580 400 L700 320 L840 270 L970 360 L1120 280 L1270 370 L1420 300 L1600 400 L1600 620 Z" fill="#211A32" />
        </g>
        <g ref={frontRef} className="kc-mtn-front">
          <path d="M0 620 L0 520 L190 460 L330 500 L470 400 L630 480 L790 280 L950 440 L1110 360 L1270 460 L1430 400 L1600 480 L1600 620 Z" fill="#171225" />
          <path d="M660 500 L700 450 L678 420 L714 380 L790 282" fill="none" stroke="var(--ember)" strokeWidth="2.5" strokeDasharray="3 7" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

          {/* compact silhouette scene at the tree line */}
          <g transform="translate(240,545)" fill="#0E0A17">
            <circle cx="16" cy="-24" r="10" />
            <rect x="9" y="-14" width="14" height="20" rx="4" />
            <rect x="-2" y="0" width="90" height="24" rx="10" />
            <circle cx="14" cy="26" r="9" />
            <circle cx="76" cy="26" r="9" />
            <circle cx="14" cy="26" r="2.4" fill="var(--ember)" />
            <circle cx="76" cy="26" r="2.4" fill="var(--ember)" />
          </g>
          <g transform="translate(400,530)" fill="#0E0A17">
            <rect x="0" y="0" width="30" height="26" rx="8" />
            <rect x="4" y="26" width="34" height="32" rx="9" />
            <circle cx="19" cy="-6" r="2.2" fill="var(--teal)" />
            <circle cx="21" cy="42" r="2.4" fill="var(--gold)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ── Curriculum card icons ── */
function SensorIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
        <circle cx="14" cy="21" r="1.8" fill="currentColor" stroke="none" />
        <path d="M9.5 16.5a6.5 6.5 0 0 1 9 0" />
        <path d="M6 12.8a11 11 0 0 1 16 0" />
      </g>
    </svg>
  );
}
function ChipIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="12" height="12" rx="2.5" />
        <line x1="11" y1="8" x2="11" y2="4" /><line x1="17" y1="8" x2="17" y2="4" />
        <line x1="11" y1="20" x2="11" y2="24" /><line x1="17" y1="20" x2="17" y2="24" />
        <line x1="8" y1="11" x2="4" y2="11" /><line x1="8" y1="17" x2="4" y2="17" />
        <line x1="20" y1="11" x2="24" y2="11" /><line x1="20" y1="17" x2="24" y2="17" />
      </g>
    </svg>
  );
}
function CircuitIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20 L4 13 L13 13 L13 6" /><path d="M13 13 L22 13 L22 20" />
      </g>
      <circle cx="4" cy="20" r="1.8" fill="currentColor" />
      <circle cx="13" cy="6" r="1.8" fill="currentColor" />
      <circle cx="22" cy="20" r="1.8" fill="currentColor" />
    </svg>
  );
}
function CodeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 8 L4.5 14 L10.5 20" /><path d="M17.5 8 L23.5 14 L17.5 20" />
        <line x1="15.5" y1="6" x2="12.5" y2="22" />
      </g>
    </svg>
  );
}
function GearIcon({ size = 24 }) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" className="kc-doodle-stroke">
        <circle cx="14" cy="14" r="7.5" /><circle cx="14" cy="14" r="2.6" />
        {teeth.map(angle => <line key={angle} x1="14" y1="3.5" x2="14" y2="6.4" transform={`rotate(${angle} 14 14)`} />)}
      </g>
    </svg>
  );
}
function RocketIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 40" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.8" className="kc-doodle-stroke">
        <path d="M16 2 C22 8 23 18 20 27 L12 27 C9 18 10 8 16 2 Z" />
        <circle cx="16" cy="14" r="3" />
        <path d="M12 24 L5 32 L12 30" /><path d="M20 24 L27 32 L20 30" />
        <path d="M13 28 L13 34 M16 28 L16 36 M19 28 L19 34" stroke="var(--ember)" />
      </g>
    </svg>
  );
}

/* ── Hooks ────────────────────────────────────────────────────── */
function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.unobserve(el); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, visible]);
  return [ref, visible];
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useScrolled(threshold = 56) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > threshold); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useMountainParallax() {
  const backRef = useRef(null);
  const midRef = useRef(null);
  const frontRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function onScroll() {
      const y = window.scrollY;
      if (backRef.current) backRef.current.style.transform = `translateY(${y * 0.06}px)`;
      if (midRef.current) midRef.current.style.transform = `translateY(${y * 0.12}px)`;
      if (frontRef.current) frontRef.current.style.transform = `translateY(${y * 0.2}px)`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { backRef, midRef, frontRef };
}

function useDragScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dragging = false, startX = 0, startScroll = 0;
    function down(e) { dragging = true; startX = e.pageX; startScroll = el.scrollLeft; }
    function up() { dragging = false; }
    function move(e) {
      if (!dragging) return;
      e.preventDefault();
      el.scrollLeft = startScroll - (e.pageX - startX);
    }
    el.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
  }, []);
  return ref;
}

/* Magnetic button — nudges toward the cursor within its own
   bounds; a no-op under prefers-reduced-motion. */
function MagneticButton({ className, onClick, children, type = "button" }) {
  const ref = useRef(null);
  function handleMove(e) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${(x / rect.width) * 14}px, ${(y / rect.height) * 14}px)`;
  }
  function handleLeave() { if (ref.current) ref.current.style.transform = ""; }
  return (
    <button ref={ref} type={type} className={className} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </button>
  );
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      dx: (Math.random() - 0.5) * 260,
      dy: (Math.random() * -0.85 - 0.15) * 220,
      rot: Math.random() * 360,
      color: ["var(--ember)", "var(--gold)", "var(--teal)", "var(--violet)"][i % 4],
      delay: Math.random() * 0.15,
    }))
  );
  return (
    <div className="kc-confetti" aria-hidden="true">
      {pieces.map(p => (
        <span key={p.id} style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, background: p.color, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

function KineticHeadline({ text, delayStart = 0 }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span className="kc-word-mask" key={i}>
          <span className="kc-word-inner" style={{ animationDelay: `${delayStart + i * 0.07}s` }}>
            {w}{i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </>
  );
}

function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button className="kc-switch" onClick={toggleTheme} aria-pressed={isDark} aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}>
      <span className="kc-switch__track"><span className="kc-switch__thumb" /></span>
      {isDark ? "NIGHT" : "DAY"}
    </button>
  );
}

function Eyebrow({ children, onNight = false }) {
  return <div className={`kc-eyebrow ${onNight ? "kc-eyebrow--onNight" : ""}`}>{children}</div>;
}

/* ── content ──────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Philosophy", id: "philosophy" },
  { label: "Workshops", id: "curriculum" },
  { label: "Programs", id: "programs" },
  { label: "Contact", id: "contact" },
];

const SKILLS = [
  { Icon: SensorIcon, color: "var(--teal-deep)", title: "Sensors", desc: "Ultrasonic and IR sensors that let a robot sense the world around it." },
  { Icon: GearIcon, color: "var(--ember-deep)", title: "Actuators", desc: "Motors and servos that turn a decision into motion." },
  { Icon: ChipIcon, color: "var(--violet-deep)", title: "Microcontrollers", desc: "Arduino boards — the bridge between code and hardware." },
  { Icon: CircuitIcon, color: "var(--gold-deep)", title: "Circuits", desc: "Breadboards, resistors, wiring — built and debugged by hand." },
  { Icon: CodeIcon, color: "var(--teal-deep)", title: "Programming", desc: "C/C++ fundamentals, picked up because the robot needed them." },
];

const DAYS = [
  { title: "Meet the robot", desc: "A finished RC car, working, right in front of you." },
  { title: "Take it apart", desc: "See exactly what's inside — chassis, board, battery." },
  { title: "Circuits & power", desc: "Breadboards, resistors, LEDs. How current moves." },
  { title: "Sensors", desc: "Ultrasonic and IR sensors — how a robot senses its world." },
  { title: "Motors", desc: "DC motors and drivers. The physics of motion on command." },
  { title: "Code it", desc: "Arduino programming — code that controls hardware." },
  { title: "Build your own", desc: "Start wiring your own version from scratch." },
  { title: "Debug", desc: "Nothing works the first time. Finding out why is the lesson." },
  { title: "Assemble", desc: "Final build, first test runs, last-minute fixes." },
  { title: "Demo day", desc: "Present the robot you built. Take it home.", summit: true },
];

const PROGRAMS = [
  { icon: "rocket", title: "Robotics club", desc: "Weekly after-school sessions for students who want to keep building." },
  { icon: Trophy, title: "Student hackathons", desc: "City-level build competitions for student teams to test what they've learned." },
  { icon: Globe, title: "Maker community", desc: "Student builders across Nagpur, sharing projects and helping each other." },
];

const SCHOOL_POINTS = [
  "Private schools, run entirely at your campus",
  "Batches of up to 40 students",
  "A 7–10 day hands-on format that fits your timetable",
  "Your school decides the dates and logistics — we bring the rest",
];

const CONTACT = [
  { icon: MapPin, value: "Nagpur, Maharashtra" },
  { icon: Mail, value: "hello@karoo.in" },
  { icon: Phone, value: "+91 98765 43210" },
];

export default function KarooLandingPage({ onExploreCourses }) {
  const [formData, setFormData] = useState({ name: "", school: "", city: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [morphRef, morphed] = useReveal(0.5);
  const [skillsRef, skillsVisible] = useReveal();
  const [filmRef, filmVisible] = useReveal(0.1);
  const [programsRef, programsVisible] = useReveal();

  const progress = useScrollProgress();
  const scrolled = useScrolled();
  const layerRefs = useMountainParallax();
  const filmstripRef = useDragScroll();

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }
  function handleInput(key) {
    return e => setFormData(d => ({ ...d, [key]: e.target.value }));
  }
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="kc">
      <div className="kc-progress" style={{ width: `${progress}%` }} />

      {/* ── NAV ── */}
      <nav className={`kc-nav ${scrolled ? "kc-nav--scrolled" : ""}`}>
        <div className="kc-brand"><MountainMark size={26} />KAROO</div>
        <ul className="kc-navlinks">
          {NAV_LINKS.map(l => <li key={l.id} onClick={() => scrollTo(l.id)}>{l.label}</li>)}
        </ul>
        <div className="kc-nav__right">
          <ThemeSwitch />
          <button className="kc-btn kc-btn--ember kc-btn--sm" onClick={() => scrollTo("contact")}>Book a Workshop</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="kc-hero">
        <HeroSky backRef={layerRefs.backRef} midRef={layerRefs.midRef} frontRef={layerRefs.frontRef} />
        <span className="kc-badge"><MapPin size={13} /> Nagpur &middot; founded by robotics engineers</span>
        <h1 className="kc-h1">
          <KineticHeadline text="Karo aur Seekho —" delayStart={0.1} /><br />
          <KineticHeadline text="Do and Learn." delayStart={0.45} />
        </h1>
        <p className="kc-sub">
          Hands-on robotics and prototyping workshops where school students
          build real, working projects — sensors, circuits, microcontrollers
          and code, all learned by doing.
        </p>
        <div className="kc-hero__buttons">
          <MagneticButton className="kc-btn kc-btn--ember kc-btn--lg" onClick={() => scrollTo("contact")}>
            Book a Workshop for Your School <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton className="kc-btn kc-btn--outline-onNight kc-btn--lg" onClick={() => scrollTo("philosophy")}>
            See How It Works
          </MagneticButton>
        </div>
        <button className="kc-hero__sandbox-link" onClick={onExploreCourses}>
          <Bot size={14} /> Or try our free browser coding sandbox
        </button>
        <div className="kc-scroll-cue"><span>Scroll</span><span className="kc-scroll-cue__line" /></div>
        <div className="kc-hero-divider" />
      </section>

      {/* ── PHILOSOPHY — Day 1 reveal ── */}
      <section id="philosophy" className="kc-section">
        <div className="kc-container">
          <div className="kc-split">
            <div>
              <Eyebrow>Our philosophy</Eyebrow>
              <h2 className="kc-h2">Show the end goal first.<br /><em>Then teach the journey.</em></h2>
              <p className="kc-p">
                On Day 1, every student meets a finished, working robot — not a
                diagram, not a video. A real remote-control car they can pick up
                and drive across the floor.
              </p>
              <p className="kc-p">
                That single moment of wanting to build <em>that</em> does more
                than any lecture could. The rest of the workshop is students
                walking backward from that want, one sensor and one line of
                code at a time — until, by Day 10, they've rebuilt it themselves.
              </p>
              <p className="kc-p" style={{ marginTop: "1.5rem" }}>
                Karoo was founded by two embedded systems and robotics engineers
                from Nagpur who believe the same thing: students shouldn't
                memorize technology. They should build it.
              </p>
            </div>
            <div ref={morphRef} className={`kc-morph ${morphed ? "is-morphed" : ""}`}>
              <span className="kc-morph__tag kc-morph__tag--before">BEFORE DAY 1</span>
              <span className="kc-morph__tag kc-morph__tag--after">DAY 1</span>
              <div className="kc-morph__layer kc-morph__layer--blueprint">
                <svg width="140" height="100" viewBox="0 0 140 100" aria-hidden="true">
                  <g stroke="var(--ink-muted)" strokeWidth="2" strokeDasharray="4 6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="15" y="35" width="90" height="30" rx="12" />
                    <path d="M40 35 L52 18 L82 18 L94 35" />
                    <circle cx="38" cy="72" r="12" /><circle cx="88" cy="72" r="12" />
                  </g>
                </svg>
              </div>
              <div className="kc-morph__layer kc-morph__layer--reveal">
                <svg width="150" height="106" viewBox="0 0 150 106" aria-hidden="true">
                  <rect x="18" y="38" width="96" height="32" rx="13" fill="var(--ember)" />
                  <path d="M44 38 L57 20 L89 20 L102 38 Z" fill="var(--ember)" opacity="0.85" />
                  <circle cx="40" cy="76" r="14" fill="var(--ink)" /><circle cx="40" cy="76" r="5" fill="var(--gold)" />
                  <circle cx="94" cy="76" r="14" fill="var(--ink)" /><circle cx="94" cy="76" r="5" fill="var(--gold)" />
                  <circle cx="106" cy="48" r="3.5" fill="var(--teal)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT THEY LEARN ── */}
      <section id="curriculum" className="kc-section kc-section--alt" ref={skillsRef}>
        <div className="kc-container">
          <Eyebrow>What they learn</Eyebrow>
          <h2 className="kc-h2">Real skills, picked up by building —<br />not memorizing.</h2>
          <div className={`kc-grid ${skillsVisible ? "is-visible" : ""}`}>
            {SKILLS.map((s, i) => (
              <div className="kc-card kc-reveal" key={s.title} style={{ "--i": i }}>
                <div className="kc-card__icon" style={{ "--icon-color": s.color }}><s.Icon size={20} /></div>
                <div className="kc-card__title">{s.title}</div>
                <div className="kc-card__desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SANDBOX CTA (real product) ── */}
      <section className="kc-section" style={{ textAlign: "center", padding: "4.5rem 0" }}>
        <div className="kc-container">
          <Eyebrow><span style={{ marginLeft: "-0.1rem" }}>Online sandbox</span></Eyebrow>
          <h2 className="kc-h2">Can't wait for the workshop?</h2>
          <p className="kc-p kc-p--center" style={{ margin: "0 auto 2rem" }}>
            Start learning right now in our interactive robotics coding sandbox.
            Write real Python, control a virtual robot, and solve challenges in
            your browser — no installs, no waiting.
          </p>
          <button className="kc-btn kc-btn--teal kc-btn--lg" onClick={onExploreCourses}>
            <Bot size={17} /> Explore the sandbox <ArrowRight size={16} />
          </button>
          <p className="kc-p" style={{ marginTop: "0.9375rem", fontSize: "0.8125rem" }}>
            Free to try &middot; No account needed &middot; Runs in your browser
          </p>
        </div>
      </section>

      {/* ── THE CLIMB — Day 1 to Day 10, drag to explore ── */}
      <section id="how-it-works" className="kc-section kc-section--alt" ref={filmRef}>
        <div className="kc-container" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="kc-container">
            <Eyebrow>The climb</Eyebrow>
            <h2 className="kc-h2">Ten days. One mountain.</h2>
            <p className="kc-p kc-p--lead">
              Every day is a step up from the last — until, on Day 10, every
              student builds and takes home their own working project.
            </p>
            <div className="kc-drag-hint"><ChevronRight size={16} /> Drag to explore all ten days</div>
          </div>
          <div className={`kc-filmstrip-wrap ${filmVisible ? "is-visible" : ""}`}>
            <div className="kc-filmstrip" ref={filmstripRef}>
              {DAYS.map((d, i) => (
                <div className={`kc-day-card kc-reveal ${d.summit ? "kc-day-card--summit" : ""}`} key={d.title} style={{ "--i": i }}>
                  <div className="kc-day-card__num">DAY {i + 1}{d.summit ? " · SUMMIT" : ""}</div>
                  <div className="kc-day-card__title">{d.title}</div>
                  <div className="kc-day-card__desc">{d.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BEYOND THE WORKSHOP ── */}
      <section id="programs" className="kc-section" ref={programsRef}>
        <div className="kc-container">
          <Eyebrow>Beyond the workshop</Eyebrow>
          <h2 className="kc-h2">We don't disappear after Day 10.</h2>
          <div className={`kc-grid ${programsVisible ? "is-visible" : ""}`} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {PROGRAMS.map((p, i) => (
              <div className="kc-card kc-reveal" key={p.title} style={{ "--i": i }}>
                {p.icon === "rocket" ? (
                  <span style={{ color: "var(--ember-deep)", display: "inline-block" }}><RocketIcon size={32} /></span>
                ) : (
                  <p.icon size={28} strokeWidth={1.5} color="var(--teal-deep)" />
                )}
                <div className="kc-card__title">{p.title}</div>
                <div className="kc-card__desc">{p.desc}</div>
                <span className="kc-pill" style={{ marginTop: "0.75rem", width: "fit-content" }}>Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS + CONTACT ── */}
      <section id="contact" className="kc-section kc-section--alt">
        <div className="kc-container">
          <Eyebrow>For schools</Eyebrow>
          <h2 className="kc-h2">We run the workshop.<br /><em>You just open the doors.</em></h2>
          <div className="kc-split" style={{ marginTop: "2.5rem", alignItems: "start" }}>
            <div>
              <p className="kc-p">
                Karoo partners with private schools to bring a full robotics
                and prototyping workshop on-site. Your school decides the
                dates and batch size — we bring the engineers and equipment.
              </p>
              <ul className="kc-schools-info">
                {SCHOOL_POINTS.map(point => <li key={point}><Check size={16} strokeWidth={2.5} /> {point}</li>)}
              </ul>
              <div style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {CONTACT.map(c => (
                  <div key={c.value} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.8125rem", color: "var(--ink-muted)" }}>
                    <c.icon size={15} color="var(--ember-deep)" /> {c.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="kc-form-card">
              {submitted && <Confetti />}
              {submitted ? (
                <div className="kc-form__success">
                  <PartyPopper size={44} strokeWidth={1.5} />
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Unbounded', sans-serif" }}>We'll be in touch!</div>
                  <div className="kc-p" style={{ maxWidth: 280 }}>Thank you for your interest. We'll contact you within 24 hours.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="kc-form-card__title" style={{ marginBottom: "1.125rem" }}>Get in touch</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                    {[
                      { key: "name", label: "YOUR NAME", placeholder: "Rajesh Kumar", type: "text" },
                      { key: "school", label: "SCHOOL NAME", placeholder: "Delhi Public School, Nagpur", type: "text" },
                      { key: "city", label: "CITY", placeholder: "Nagpur", type: "text" },
                      { key: "phone", label: "PHONE NUMBER", placeholder: "+91 98765 43210", type: "tel" },
                      { key: "email", label: "EMAIL ADDRESS", placeholder: "principal@school.edu.in", type: "email" },
                    ].map(f => (
                      <div className="kc-field" key={f.key}>
                        <label htmlFor={f.key}>{f.label}</label>
                        <input id={f.key} type={f.type} placeholder={f.placeholder} value={formData[f.key]} onChange={handleInput(f.key)} required />
                      </div>
                    ))}
                    <div className="kc-field">
                      <label htmlFor="message">ANYTHING ELSE?</label>
                      <textarea id="message" placeholder="Number of students, preferred dates, questions..." value={formData.message} onChange={handleInput("message")} rows={3} />
                    </div>
                    <button type="submit" className="kc-btn kc-btn--ember" style={{ justifyContent: "center" }}>
                      Send enquiry <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — sunrise callback ── */}
      <section className="kc-final">
        <div className="kc-container">
          <h2 className="kc-final__h2">Ready to bring hands-on robotics to your school?</h2>
          <p className="kc-final__sub">
            Tell us about your school and batch size, and we'll get back to
            you within 24 hours to plan your workshop.
          </p>
          <MagneticButton className="kc-btn kc-btn--ember kc-btn--lg" onClick={() => scrollTo("contact")}>
            Get in Touch <ArrowRight size={16} />
          </MagneticButton>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="kc-footer">
        <div className="kc-container">
          <div className="kc-footer__top">
            <div>
              <div className="kc-brand"><MountainMark size={24} />KAROO</div>
              <div className="kc-footer__tagline">Karo aur Seekho — do it, then understand it.</div>
              <div className="kc-footer__meta">Nagpur, Maharashtra</div>
            </div>
            <div className="kc-footer__cols">
              <div className="kc-footer__col">
                <div className="kc-footer__col-title">Program</div>
                <ul>
                  <li onClick={() => scrollTo("philosophy")}>Philosophy</li>
                  <li onClick={() => scrollTo("curriculum")}>Workshops</li>
                  <li onClick={() => scrollTo("programs")}>Programs</li>
                </ul>
              </div>
              <div className="kc-footer__col">
                <div className="kc-footer__col-title">Contact</div>
                <ul>
                  <li onClick={() => scrollTo("contact")}>Book a workshop</li>
                  <li>hello@karoo.in</li>
                  <li>+91 98765 43210</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="kc-footer__bottom">
            <span>&copy; 2026 Karoo &middot; Nagpur, Maharashtra</span>
            <span>Do and learn.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

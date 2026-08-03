import { useState, useEffect, useRef } from "react";
import { useTheme } from "./theme/ThemeContext";
import {
  MapPin, Mail, Phone, Check, ArrowRight, PartyPopper, Bot, ChevronRight, Sun, Moon,
} from "lucide-react";
import MountainMark from "./BrandMark";
import "./karoo-landing.css";

/* ────────────────────────────────────────────────────────────
   THE CLIMB — Karoo's emblem (mountain, switchback path, rising
   sun) staged as a real cinematic scene rather than a small
   badge: a sunrise-over-mountains hero with parallax, and a
   two-row climb roadmap for the Day 1 → Day 10 journey later in
   the page. Every illustration is hand-authored inline SVG; no
   external image assets.
   ──────────────────────────────────────────────────────────── */

const STARS = [
  { x: 120, y: 90, r: 1.6, d: 0.2 }, { x: 260, y: 150, r: 1.2, d: 1.1 },
  { x: 420, y: 70, r: 1.8, d: 0.6 }, { x: 560, y: 160, r: 1.3, d: 1.8 },
  { x: 200, y: 220, r: 1.1, d: 2.4 }, { x: 980, y: 100, r: 1.6, d: 0.9 },
  { x: 1120, y: 60, r: 1.2, d: 1.6 }, { x: 1260, y: 150, r: 1.8, d: 0.3 },
  { x: 1400, y: 90, r: 1.3, d: 2.1 }, { x: 340, y: 40, r: 1.1, d: 1.3 },
  { x: 860, y: 190, r: 1.4, d: 0.7 }, { x: 1480, y: 170, r: 1.2, d: 1.9 },
];

/* Cinematic hero backdrop — layered mountain silhouettes drifting
   at different parallax speeds behind a rising, glowing sun, with
   a switchback trail that draws itself climbing the tallest peak,
   drifting clouds and slow-turning sun rays. Every color pulls from
   --hero-* CSS variables, so the whole scene recolors between a
   bright morning sky (light mode) and the night sunrise (dark mode).

   Each mountain layer is three nested <g>s so the mount reveal,
   the ambient drift and the JS scroll-parallax each own a single
   transform and never fight over the same property:
     .kc-mtn-parallax  ← ref target, JS sets style.transform only
       .kc-mtn-reveal    CSS: slide + fade in once, on mount
         .kc-mtn-drift    CSS: infinite slow horizontal sway */
function HeroSky({ backRef, midRef, frontRef, isDark }) {
  return (
    <div className="kc-sky" aria-hidden="true">
      <svg viewBox="0 0 1600 620" preserveAspectRatio="xMidYMax slice" role="img" aria-label={isDark ? "A moon rising behind layered mountain silhouettes, with a dashed switchback trail drawing itself up the tallest peak" : "A sun rising behind layered mountain silhouettes, with a dashed switchback trail drawing itself up the tallest peak"}>
        <defs>
          <radialGradient id="kcSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF3D6" />
            <stop offset="55%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--ember)" />
          </radialGradient>
          <radialGradient id="kcMoon" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#E3E7F0" />
            <stop offset="100%" stopColor="#AEB6C7" />
          </radialGradient>
        </defs>

        <g className="kc-stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F7F1E6" style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>

        <g transform="translate(300,150)"><g className="kc-cloud kc-cloud--a">
          <ellipse cx="0" cy="0" rx="50" ry="17" fill="var(--hero-cloud)" opacity="0.55" />
          <ellipse cx="34" cy="-7" rx="32" ry="15" fill="var(--hero-cloud)" opacity="0.55" />
        </g></g>
        <g transform="translate(1220,95)"><g className="kc-cloud kc-cloud--b">
          <ellipse cx="0" cy="0" rx="40" ry="14" fill="var(--hero-cloud)" opacity="0.45" />
          <ellipse cx="26" cy="-6" rx="26" ry="12" fill="var(--hero-cloud)" opacity="0.45" />
        </g></g>

        {isDark ? (
          <g className="kc-moon">
            <circle cx="800" cy="255" r="58" fill="url(#kcMoon)" />
            <circle cx="822" cy="232" r="8" fill="#9AA3B8" opacity="0.4" />
            <circle cx="782" cy="270" r="5" fill="#9AA3B8" opacity="0.35" />
            <circle cx="812" cy="280" r="6" fill="#9AA3B8" opacity="0.3" />
            <circle cx="770" cy="238" r="3.5" fill="#9AA3B8" opacity="0.3" />
          </g>
        ) : (
          <>
            <g transform="translate(800,255)">
              <g className="kc-sun-rays">
                {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                  <line key={a} x1="0" y1="-84" x2="0" y2="-100" transform={`rotate(${a})`} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                ))}
              </g>
            </g>
            <circle className="kc-sun" cx="800" cy="255" r="72" fill="url(#kcSun)" />
          </>
        )}

        <g ref={backRef}>
          <g className="kc-mtn-reveal kc-mtn-reveal--back">
            <g className="kc-mtn-drift kc-mtn-drift--back">
              <path d="M0 620 L0 440 L130 400 L270 450 L410 380 L570 430 L730 370 L890 420 L1050 360 L1210 410 L1370 370 L1600 420 L1600 620 Z" fill="var(--hero-mtn-back)" />
            </g>
          </g>
        </g>
        <g ref={midRef}>
          <g className="kc-mtn-reveal kc-mtn-reveal--mid">
            <g className="kc-mtn-drift kc-mtn-drift--mid">
              <path d="M0 620 L0 480 L150 340 L290 420 L430 280 L580 400 L700 320 L840 270 L970 360 L1120 280 L1270 370 L1420 300 L1600 400 L1600 620 Z" fill="var(--hero-mtn-mid)" />
            </g>
          </g>
        </g>
        <g ref={frontRef}>
          <g className="kc-mtn-reveal kc-mtn-reveal--front">
            <g className="kc-mtn-drift kc-mtn-drift--front">
              <path d="M0 620 L0 520 L190 460 L330 500 L470 400 L630 480 L790 280 L950 440 L1110 360 L1270 460 L1430 400 L1600 480 L1600 620 Z" fill="var(--hero-mtn-front)" />
              <path
                className="kc-switchback-path"
                pathLength="100"
                d="M660 500 L700 450 L678 420 L714 380 L790 282"
                fill="none" stroke="var(--ember)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
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
function FlagIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="4" x2="7" y2="24" fill="none" />
        <path d="M7 5 L21 8 L15 12 L21 16 L7 18 Z" fill="currentColor" fillOpacity="0.16" />
      </g>
    </svg>
  );
}
function TrophyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5 h10 v6 a5 5 0 0 1 -10 0 Z" />
        <path d="M9 7 h-4 a3 3 0 0 0 3.5 5" />
        <path d="M19 7 h4 a3 3 0 0 1 -3.5 5" />
        <line x1="14" y1="16" x2="14" y2="20" />
        <path d="M9 24 h10 l-1.5 -4 h-7 Z" />
      </g>
    </svg>
  );
}
function GlobeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="kc-doodle" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="10" />
        <ellipse cx="14" cy="14" rx="4.2" ry="10" />
        <line x1="4" y1="14" x2="24" y2="14" />
        <path d="M6 8.5 h16" /><path d="M6 19.5 h16" />
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
      <span className="kc-switch__thumb">
        {isDark ? <Moon /> : <Sun />}
      </span>
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
  { Icon: SensorIcon, color: "var(--teal-icon)", title: "Sensors", desc: "Ultrasonic and IR sensors that let a robot sense the world around it." },
  { Icon: GearIcon, color: "var(--ember-icon)", title: "Actuators", desc: "Motors and servos that turn a decision into motion." },
  { Icon: ChipIcon, color: "var(--violet-icon)", title: "Microcontrollers", desc: "Arduino boards — the bridge between code and hardware." },
  { Icon: CircuitIcon, color: "var(--gold-icon)", title: "Circuits", desc: "Breadboards, resistors, wiring — built and debugged by hand." },
  { Icon: CodeIcon, color: "var(--teal-icon)", title: "Programming", desc: "C/C++ fundamentals, picked up because the robot needed them." },
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

const ROADMAP = [
  {
    Icon: FlagIcon, color: "var(--ember)", live: true,
    title: "Foundation Workshop", desc: "7–10 days, on-site at your school. Every student builds and takes home a working robot.",
  },
  {
    Icon: RocketIcon, color: "var(--teal-icon)", live: false,
    title: "Robotics Club", desc: "Weekly after-school sessions for students who want to keep building.",
  },
  {
    Icon: TrophyIcon, color: "var(--gold-icon)", live: false,
    title: "Student Hackathons", desc: "City-level build competitions for student teams to test what they've learned.",
  },
  {
    Icon: GlobeIcon, color: "var(--violet-icon)", live: false,
    title: "Innovation Labs", desc: "Deeper robotics tracks and in-school labs for students who want to go further.",
  },
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
  const { theme } = useTheme();
  const [formData, setFormData] = useState({ name: "", school: "", city: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [skillsRef, skillsVisible] = useReveal();
  const [filmRef, filmVisible] = useReveal(0.1);
  const [roadmapRef, roadmapVisible] = useReveal(0.15);

  const progress = useScrollProgress();
  const scrolled = useScrolled();
  const layerRefs = useMountainParallax();

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
        <HeroSky backRef={layerRefs.backRef} midRef={layerRefs.midRef} frontRef={layerRefs.frontRef} isDark={theme === "dark"} />
        <span className="kc-badge"><MapPin size={13} /> Nagpur &middot; founded by robotics engineers</span>
        <h1 className="kc-h1">
          <KineticHeadline text="Karo aur Seekho" delayStart={0.1} /><br />
          <KineticHeadline text="Do and Learn." delayStart={0.45} />
        </h1>
        <p className="kc-sub">
          Hands-on robotics and prototyping workshops where school students
          build real, working projects — sensors, circuits, microcontrollers
          and code, all learned by doing.
        </p>
        <div className="kc-hero__buttons">
          <MagneticButton className="kc-btn kc-btn--ember kc-btn--lg" onClick={() => scrollTo("contact")}>
            Book a Workshop <ArrowRight size={16} />
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
          <div className="kc-philosophy-text">
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

      {/* ── THE CLIMB — Day 1 to Day 10 roadmap ── */}
      <section id="how-it-works" className="kc-section kc-section--alt" ref={filmRef}>
        <div className="kc-container">
          <Eyebrow>The climb</Eyebrow>
          <h2 className="kc-h2">Ten days. One Mountain.</h2>
          <p className="kc-p kc-p--lead">
            Every day is a step up from the last — until, on Day 10, every
            student builds and takes home their own working project.
          </p>
          <div className={`kc-climb ${filmVisible ? "is-visible" : ""}`}>
            {[DAYS.slice(0, 5), DAYS.slice(5, 10)].map((row, r) => (
              <div className="kc-climb-row" key={r}>
                <div className="kc-climb-nodes">
                  {row.map((d, i) => {
                    const dayNum = r * 5 + i + 1;
                    return (
                      <div className={`kc-day-card kc-reveal ${d.summit ? "kc-day-card--summit" : ""}`} key={d.title} style={{ "--i": i }}>
                        <div className="kc-day-card__num">DAY {dayNum}{d.summit ? " · SUMMIT" : ""}</div>
                        <div className="kc-day-card__title">{d.title}</div>
                        <div className="kc-day-card__desc">{d.desc}</div>
                      </div>
                    );
                  })}
                </div>
                {r === 0 && (
                  <div className="kc-climb-connector" aria-hidden="true"><ChevronRight size={18} /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP — the road beyond the workshop ── */}
      <section id="programs" className="kc-section">
        <div className="kc-container">
          <Eyebrow>Your learning roadmap</Eyebrow>
          <h2 className="kc-h2">We don't disappear after Day 10.</h2>
          <p className="kc-p kc-p--lead">
            The workshop is stage one, not the whole story. Here's where a
            student can go next.
          </p>
          <div ref={roadmapRef} className={`kc-roadmap-stages ${roadmapVisible ? "is-visible" : ""}`}>
            {ROADMAP.map((s, i) => (
              <div className={`kc-roadmap-stage kc-reveal ${s.live ? "kc-roadmap-stage--live" : ""}`} key={s.title} style={{ "--i": i }}>
                <div className="kc-roadmap-stage__badge" style={{ "--icon-color": s.color }}><s.Icon size={22} /></div>
                <div className="kc-card__title">{s.title}</div>
                <div className="kc-card__desc">{s.desc}</div>
                <span className={`kc-pill ${s.live ? "kc-pill--live" : ""}`} style={{ marginTop: "0.75rem", width: "fit-content" }}>
                  {s.live ? "Live now" : "Coming soon"}
                </span>
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
                    <c.icon size={15} color="var(--ember-icon)" /> {c.value}
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

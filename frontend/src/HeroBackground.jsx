export default function HeroBackground() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="1200" height="620" className="hero-bg-fill" />
      <g className="hero-bg-lines" strokeWidth="1" fill="none" opacity="0.9">
        <path d="M0 80 H260 V160 H520" />
        <path d="M0 220 H140 V300 H80 V400" />
        <path d="M1200 100 H940 V40" />
        <path d="M1200 260 H1000 V340 H1080 V460" />
        <path d="M1200 540 H980 V480" />
        <path d="M0 540 H200 V480 H320" />
        <path d="M60 0 V60" />
        <path d="M1140 0 V70" />
        <path d="M620 0 V40" />
        <path d="M340 600 V560" />
        <path d="M880 600 V550 H960" />
      </g>
      <g className="hero-bg-dots">
        <circle cx="260" cy="80" r="4" /><circle cx="520" cy="160" r="4" />
        <circle cx="140" cy="220" r="4" /><circle cx="80" cy="400" r="4" />
        <circle cx="940" cy="100" r="4" /><circle cx="940" cy="40" r="4" />
        <circle cx="1000" cy="260" r="4" /><circle cx="1080" cy="460" r="4" />
        <circle cx="980" cy="540" r="4" /><circle cx="200" cy="540" r="4" />
        <circle cx="320" cy="480" r="4" /><circle cx="60" cy="60" r="4" />
        <circle cx="1140" cy="70" r="4" /><circle cx="620" cy="40" r="4" />
        <circle cx="340" cy="560" r="4" /><circle cx="960" cy="550" r="4" />
      </g>
      <g className="hero-bg-chips" opacity="0.85">
        <rect x="86" y="120" width="48" height="48" rx="6" className="chip-body" />
        <circle cx="110" cy="144" r="13" className="chip-ring" />
        <rect x="990" y="380" width="44" height="44" rx="6" className="chip-body" />
        <circle cx="1012" cy="402" r="11" className="chip-ring" />
        <rect x="1060" y="140" width="40" height="40" rx="6" className="chip-body" />
        <circle cx="1080" cy="160" r="10" className="chip-ring" />
      </g>
      <g className="hero-bg-bots" transform="translate(150,440)" opacity="0.5">
        <rect x="0" y="20" width="56" height="44" rx="8" className="bot-line" />
        <circle cx="16" cy="38" r="5" className="bot-line" />
        <circle cx="40" cy="38" r="5" className="bot-line" />
        <rect x="10" y="0" width="36" height="18" rx="4" className="bot-line" />
        <line x1="28" y1="-10" x2="28" y2="0" className="bot-line" />
        <circle cx="28" cy="-13" r="3" className="bot-line" />
      </g>
      <g className="hero-bg-bots" transform="translate(995,60)" opacity="0.45">
        <rect x="0" y="20" width="44" height="34" rx="6" className="bot-line" />
        <circle cx="12" cy="34" r="4" className="bot-line" />
        <circle cx="32" cy="34" r="4" className="bot-line" />
        <rect x="8" y="4" width="28" height="14" rx="3" className="bot-line" />
      </g>
      <rect width="1200" height="620" fill="url(#heroFade)" />
      <defs>
        <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="fade-top" />
          <stop offset="35%" className="fade-mid" />
          <stop offset="100%" className="fade-bottom" />
        </linearGradient>
      </defs>
    </svg>
  );
}
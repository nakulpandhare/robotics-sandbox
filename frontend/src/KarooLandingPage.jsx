import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("karoo-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    localStorage.setItem("karoo-theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}

function tokens(dark) {
  return dark ? {
    bg:        "#0a0a0a",
    bgCard:    "#111111",
    bgCard2:   "#161616",
    border:    "#222222",
    borderStr: "#333333",
    text:      "#ffffff",
    textSec:   "#a3a3a3",
    textDim:   "#525252",
    amber:     "#f59e0b",
    amberDark: "#d97706",
    amberBg:   "rgba(245,158,11,0.08)",
    emerald:   "#10b981",
    navBg:     "rgba(10,10,10,0.92)",
  } : {
    bg:        "#fafafa",
    bgCard:    "#ffffff",
    bgCard2:   "#f4f4f5",
    border:    "#e4e4e7",
    borderStr: "#d4d4d8",
    text:      "#09090b",
    textSec:   "#52525b",
    textDim:   "#a1a1aa",
    amber:     "#d97706",
    amberDark: "#b45309",
    amberBg:   "rgba(217,119,6,0.06)",
    emerald:   "#059669",
    navBg:     "rgba(250,250,250,0.92)",
  };
}

function Marquee({ t }) {
  const text = "KARO AUR SEEKHO · DO AND LEARN · BUILD IT · KEEP IT · ";
  return (
    <div style={{
      overflow: "hidden", borderTop: `1px solid ${t.border}`,
      borderBottom: `1px solid ${t.border}`, padding: "14px 0",
      background: t.amberBg, userSelect: "none"
    }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 22s linear infinite" }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.15em", color: t.amber }}>
            {text.repeat(4)}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }`}</style>
    </div>
  );
}

function Emblem({ size = 40, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke={t.amber} strokeWidth="1.5" fill={t.bgCard}/>
      <polyline points="4,28 12,16 18,22 24,12 32,18 36,14" stroke={t.emerald} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="20" cy="10" r="3" fill={t.amber} opacity="0.9"/>
      <line x1="20" y1="7" x2="20" y2="4" stroke={t.amber} strokeWidth="1.2"/>
    </svg>
  );
}

function Label({ children, t }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", color: t.amber, textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

export default function KarooLandingPage({ onExploreCourses }) {
  const [dark, toggleTheme] = useTheme();
  const t = tokens(dark);
  const [formData, setFormData] = useState({ name: "", school: "", city: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { document.body.style.overflow = "auto"; }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputStyle = (t) => ({
    width: "100%", background: t.bg, border: `1px solid ${t.border}`,
    borderRadius: 8, padding: "10px 14px", fontSize: 14, color: t.text,
    outline: "none", fontFamily: "inherit", transition: "border-color .15s"
  });

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: t.navBg, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Emblem size={32} t={t} />
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "0.04em", color: t.text }}>
            KA<span style={{ color: t.amber }}>ROO</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: t.textSec }}>
          {["Workshops", "Schools", "Hackathons", "Community", "About"].map(l => (
            <span key={l} style={{ cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = t.text}
              onMouseLeave={e => e.target.style.color = t.textSec}
            >{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{
            background: t.bgCard2, border: `1px solid ${t.border}`, borderRadius: 8,
            width: 36, height: 36, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: "https://nakulpandhare.github.io/robotics-sandbox/" }
            })}
            style={{
              background: t.amber, color: "#000", border: "none", borderRadius: 8,
              padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 32px 72px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 900, lineHeight: 1.0, margin: "0 0 20px", maxWidth: 800 }}>
          <span style={{ color: t.text }}>Build a robot.</span><br />
          <span style={{ color: t.amber }}>Keep it forever.</span><br />
          <span style={{ color: t.emerald }}>Learn by doing.</span>
        </h1>
        <p style={{ fontStyle: "italic", fontSize: 22, fontWeight: 600, color: t.textSec, margin: "0 0 16px" }}>
          Karo aur Seekho.
        </p>
        <p style={{ fontSize: 17, color: t.textSec, lineHeight: 1.7, maxWidth: 560, margin: "0 0 36px" }}>
          7–10 day hands-on robotics workshops brought directly to your school.
          Students see a finished working robot on Day 1 — then spend the rest of the
          workshop building their own version from scratch.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}
            style={{
              background: t.amber, color: "#000", border: "none", borderRadius: 10,
              padding: "14px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer",
              boxShadow: `0 4px 24px ${t.amber}33`
            }}
          >
            Book for your school →
          </button>
          <button
            onClick={onExploreCourses}
            style={{
              background: "transparent", color: t.text, border: `1.5px solid ${t.borderStr}`,
              borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer"
            }}
          >
            Explore courses
          </button>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 40, flexWrap: "wrap" }}>
          {[["40", "students per batch"], ["7–10", "day workshop"], ["₹50K", "per batch"], ["100%", "hands-on"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 26, fontWeight: 900, color: t.amber }}>{n}</div>
              <div style={{ fontSize: 12, color: t.textDim, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>


      {/* PHILOSOPHY */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <Label t={t}>Our Philosophy</Label>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 20px" }}>
              Show the end goal first.<br />
              <span style={{ color: t.amber }}>Then teach the journey.</span>
            </h2>
            <p style={{ fontSize: 15, color: t.textSec, lineHeight: 1.75, marginBottom: 16 }}>
              On Day 1, every student sees a fully working remote-control car. Not a diagram. Not a video. A real, moving robot they can hold.
            </p>
            <p style={{ fontSize: 15, color: t.textSec, lineHeight: 1.75 }}>
              That single moment of "I want to build <em>that</em>" is more powerful than any lecture. The rest of the workshop is students working backward from that dream — learning sensors, actuators, circuits, and code because they need to, not because they have to.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { day: "Day 1", title: "See the finished robot 🤖", desc: "Students see a working RC car. Curiosity and motivation unlock immediately.", color: t.amber },
              { day: "Days 2–3", title: "Circuits & sensors ⚡", desc: "Learn the components that make the robot sense and move.", color: t.emerald },
              { day: "Days 4–5", title: "Code & microcontrollers 💻", desc: "Program the brain of the robot step by step.", color: t.emerald },
              { day: "Days 6–7", title: "Assemble & demo 🏆", desc: "Build your own version. Present it. Take it home forever.", color: t.amber },
            ].map((s, i) => (
              <div key={i} style={{
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12,
                padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start",
                borderLeft: `3px solid ${s.color}`
              }}>
                <div style={{ minWidth: 64 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.08em" }}>{s.day}</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT STUDENTS LEARN */}
      <section style={{ padding: "80px 32px", background: t.bgCard2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label t={t}>What students learn</Label>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, margin: "0 0 12px" }}>
            Real skills. Real components.
          </h2>
          <p style={{ fontSize: 15, color: t.textSec, margin: "0 0 40px", maxWidth: 500 }}>
            No theory-only sessions. Every concept is taught through building something that actually works.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "⚡", title: "Electronics & Circuits", desc: "Breadboards, resistors, LEDs, motors — students wire everything themselves." },
              { icon: "📡", title: "Sensors & Actuators", desc: "Ultrasonic, IR, servo motors — understanding inputs and outputs." },
              { icon: "🧠", title: "Microcontrollers", desc: "Arduino programming — the bridge between code and the physical world." },
              { icon: "💻", title: "Programming", desc: "C/C++ fundamentals learned in context, not in isolation." },
              { icon: "🔧", title: "Prototyping", desc: "How to design, test, fail fast, and iterate — the maker mindset." },
              { icon: "🤝", title: "Teamwork", desc: "Every project is collaborative. Students divide tasks and debug together." },
            ].map((c, i) => (
              <div key={i} style={{
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12,
                padding: 22, cursor: "default", transition: "border-color .15s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.amber}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: t.textSec, lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEYOND WORKSHOPS */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <Label t={t}>Beyond the workshop</Label>
        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, margin: "0 0 12px" }}>
          We don't disappear after Day 7.
        </h2>
        <p style={{ fontSize: 15, color: t.textSec, margin: "0 0 40px", maxWidth: 500 }}>
          Karoo is building a long-term maker ecosystem for students who want to keep building.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "🏫", label: "After-school Club", title: "Robotics club", desc: "Weekly sessions for students who want to keep building after the workshop ends." },
            { icon: "⚔️", label: "Student Hackathons", title: "Build. Compete. Win.", desc: "City-level hackathons where student teams compete to solve real engineering challenges." },
            { icon: "🌐", label: "Maker Community", title: "Stay connected", desc: "A community of student builders across Nagpur — sharing projects, getting feedback, finding collaborators." },
          ].map((c, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24,
              display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{ fontSize: 32 }}>{c.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.amber, letterSpacing: "0.1em" }}>{c.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{c.title}</div>
              <div style={{ fontSize: 13, color: t.textSec, lineHeight: 1.6, flex: 1 }}>{c.desc}</div>
              <div style={{
                display: "inline-block", fontSize: 10, fontWeight: 700,
                background: t.amberBg, color: t.amber, border: `1px solid ${t.amber}33`,
                borderRadius: 4, padding: "3px 8px", letterSpacing: "0.06em", alignSelf: "flex-start"
              }}>Coming soon</div>
            </div>
          ))}
        </div>
      </section>


      {/* FOR SCHOOLS */}
      <section style={{ padding: "80px 32px", background: t.bgCard2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <Label t={t}>For schools</Label>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 20px" }}>
                We handle everything.<br />
                <span style={{ color: t.amber }}>You just open the doors.</span>
              </h2>
              <p style={{ fontSize: 15, color: t.textSec, lineHeight: 1.75, marginBottom: 20 }}>
                Karoo brings all equipment, components, and instructors directly to your school. No lab setup required. No logistics for your staff.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "All equipment and components provided",
                  "Experienced robotics engineers as instructors",
                  "Curriculum designed for school timetables",
                  "₹50,000 per batch · up to 40 students",
                  "School decides whether to absorb cost or charge parents",
                  "Certificate of completion for every student",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: t.emerald, fontWeight: 700, fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: t.textSec, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.amber, marginBottom: 20, letterSpacing: "0.06em" }}>
                PRICING OVERVIEW
              </div>
              {[
                ["Workshop duration", "7–10 days"],
                ["Students per batch", "Up to 40"],
                ["Price per batch", "₹50,000"],
                ["Price per student", "~₹1,250"],
                ["Equipment", "Fully provided"],
                ["Location", "Your school"],
              ].map(([label, value], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: i < 5 ? `1px solid ${t.border}` : "none"
                }}>
                  <span style={{ fontSize: 13, color: t.textSec }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{value}</span>
                </div>
              ))}
              <button
                onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}
                style={{
                  marginTop: 24, width: "100%", background: t.amber, color: "#000",
                  border: "none", borderRadius: 8, padding: "13px", fontSize: 14,
                  fontWeight: 800, cursor: "pointer"
                }}
              >
                Enquire for your school →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE COURSES CTA */}
      <section style={{ padding: "80px 32px", background: t.bg, borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <Label t={t}>Online learning</Label>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 16px" }}>
            Can't wait for the workshop?
          </h2>
          <p style={{ fontSize: 16, color: t.textSec, lineHeight: 1.7, margin: "0 0 32px" }}>
            Start learning right now with our interactive robotics coding sandbox. Write real Python, control a virtual robot, and solve challenges in your browser — no installs, no waiting.
          </p>
          <button
            onClick={onExploreCourses}
            style={{
              background: t.amber, color: "#000", border: "none", borderRadius: 12,
              padding: "16px 36px", fontSize: 17, fontWeight: 800, cursor: "pointer",
              boxShadow: `0 6px 32px ${t.amber}40`, display: "inline-flex",
              alignItems: "center", gap: 10
            }}
          >
            🤖 Explore courses →
          </button>
          <div style={{ marginTop: 14, fontSize: 13, color: t.textDim }}>
            Free to try · No account needed · Runs in your browser
          </div>
        </div>
      </section>


      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 32px", background: t.bgCard2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
            <div>
              <Label t={t}>Get in touch</Label>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 16px" }}>
                Bring Karoo to<br />
                <span style={{ color: t.amber }}>your school.</span>
              </h2>
              <p style={{ fontSize: 15, color: t.textSec, lineHeight: 1.75, marginBottom: 32 }}>
                We're based in Nagpur and currently running workshops across private schools in the city. Fill in the form and we'll get back to you within 24 hours.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: "📍", label: "Location", value: "Nagpur, Maharashtra" },
                  { icon: "📧", label: "Email", value: "hello@karoo.in" },
                  { icon: "📞", label: "Phone", value: "+91 98765 43210" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, background: t.amberBg,
                      border: `1px solid ${t.amber}22`, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
                    }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.amber, letterSpacing: "0.08em", marginBottom: 2 }}>
                        {c.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 14, color: t.text }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {submitted ? (
                <div style={{
                  background: t.bgCard, border: `1px solid ${t.emerald}44`, borderRadius: 16,
                  padding: 40, textAlign: "center", minHeight: 400,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16
                }}>
                  <div style={{ fontSize: 48 }}>🎉</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>We'll be in touch!</div>
                  <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.6, maxWidth: 280 }}>
                    Thank you for your interest in Karoo. We'll contact you within 24 hours to discuss bringing the workshop to your school.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{
                  background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32,
                  display: "flex", flexDirection: "column", gap: 16
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 4 }}>
                    Enquire about a workshop
                  </div>
                  {[
                    { key: "name",   label: "Your name",       placeholder: "Rajesh Kumar",                    type: "text"  },
                    { key: "school", label: "School name",     placeholder: "Delhi Public School, Nagpur",     type: "text"  },
                    { key: "city",   label: "City",            placeholder: "Nagpur",                          type: "text"  },
                    { key: "phone",  label: "Phone number",    placeholder: "+91 98765 43210",                 type: "tel"   },
                    { key: "email",  label: "Email address",   placeholder: "principal@school.edu.in",         type: "email" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textSec, marginBottom: 6, letterSpacing: "0.04em" }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} placeholder={f.placeholder} required
                        value={formData[f.key]}
                        onChange={e => setFormData(d => ({ ...d, [f.key]: e.target.value }))}
                        style={inputStyle(t)}
                        onFocus={e => e.target.style.borderColor = t.amber}
                        onBlur={e => e.target.style.borderColor = t.border}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.textSec, marginBottom: 6, letterSpacing: "0.04em" }}>
                      Anything else you'd like us to know?
                    </label>
                    <textarea
                      placeholder="Number of students, preferred dates, questions..."
                      value={formData.message} rows={3}
                      onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                      style={{ ...inputStyle(t), resize: "vertical" }}
                      onFocus={e => e.target.style.borderColor = t.amber}
                      onBlur={e => e.target.style.borderColor = t.border}
                    />
                  </div>
                  <button type="submit" style={{
                    background: t.amber, color: "#000", border: "none", borderRadius: 8,
                    padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer",
                    marginTop: 4, boxShadow: `0 4px 16px ${t.amber}33`
                  }}>
                    Send enquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px", borderTop: `1px solid ${t.border}`, background: t.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Emblem size={28} t={t} />
            <span style={{ fontWeight: 900, fontSize: 16, color: t.text, letterSpacing: "0.04em" }}>
              KA<span style={{ color: t.amber }}>ROO</span>
            </span>
            <span style={{ fontSize: 12, color: t.textDim, marginLeft: 8, fontStyle: "italic" }}>Karo aur Seekho</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: t.textDim }}>
            {["Workshops", "Schools", "Community", "About", "Contact"].map(l => (
              <span key={l} style={{ cursor: "pointer" }}
                onMouseEnter={e => e.target.style.color = t.text}
                onMouseLeave={e => e.target.style.color = t.textDim}
              >{l}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: t.textDim }}>© 2025 Karoo · Nagpur, Maharashtra</div>
        </div>
      </footer>

    </div>
  );
}

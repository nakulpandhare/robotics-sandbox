import { useState } from "react";
import { supabase } from "./supabaseClient";
import ThemeToggle from "./theme/ThemeToggle";

// ── Emblem SVG ────────────────────────────────────────────────
function Emblem({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" stroke="var(--amber)" strokeWidth="1.5" fill="var(--bg-card)" />
      <polyline
        points="4,28 12,16 18,22 24,12 32,18 36,14"
        stroke="var(--green)" strokeWidth="1.5"
        strokeLinejoin="round" fill="none"
      />
      <circle cx="20" cy="10" r="3" fill="var(--amber)" opacity="0.9" />
      <line x1="20" y1="7" x2="20" y2="4" stroke="var(--amber)" strokeWidth="1.2" />
    </svg>
  );
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ children }) {
  return <div className="section__label">{children}</div>;
}

// ── Main component ────────────────────────────────────────────
export default function KarooLandingPage({ onExploreCourses }) {
  const [formData, setFormData] = useState({
    name: "", school: "", city: "", phone: "", email: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleInput(key) {
    return e => setFormData(d => ({ ...d, [key]: e.target.value }));
  }

  function scrollToContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav__logo">
          <Emblem size={28} />
          KA<span>ROO</span>
        </div>

        <ul className="nav__links">
          <li><span>Workshops</span></li>
          <li><span>Schools</span></li>
          <li><span>Hackathons</span></li>
          <li><span>Community</span></li>
          <li><span>About</span></li>
        </ul>

        <div className="nav__right">
          <ThemeToggle size="md" />
          <button className="btn btn--primary btn--sm" onClick={scrollToContact}>
            Book a Workshop
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <span className="hero__eyebrow">Free for classrooms</span>
        <h1 className="hero__h1">
          Build a robot.<br />
          <span className="hero__h1--amber">Keep it forever.</span><br />
          <span className="hero__h1--green">Learn by doing.</span>
        </h1>
        <p className="hero__tagline">Karo aur Seekho.</p>
        <p className="hero__sub">
          7–10 day hands-on robotics workshops brought directly to your school.
          Students see a finished working robot on Day 1 — then spend the rest
          of the workshop building their own version from scratch.
        </p>
        <div className="hero__buttons">
          <button className="btn btn--primary btn--lg" onClick={scrollToContact}>
            Book for your school →
          </button>
          <button className="btn btn--outline btn--lg" onClick={onExploreCourses}>
            Explore courses
          </button>
        </div>
        <p className="hero__meta">📍 Nagpur, Maharashtra · ₹50,000 per batch · Up to 40 students</p>
      </section>

      {/* ── STATS ── */}
      <div className="stats">
        {[
          ["40",   "students per batch"],
          ["7–10", "day workshop"],
          ["₹50K", "per batch"],
          ["100%", "hands-on"],
        ].map(([n, l]) => (
          <div className="stats__item" key={l}>
            <div className="stats__num">{n}</div>
            <div className="stats__label">{l}</div>
          </div>
        ))}
      </div>

      {/* ── PHILOSOPHY ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div>
              <SectionLabel>Our Philosophy</SectionLabel>
              <h2 className="section__h2">
                Show the end goal first.<br />
                <span style={{ color: "var(--amber)" }}>Then teach the journey.</span>
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1rem" }}>
                On Day 1, every student sees a fully working remote-control car.
                Not a diagram. Not a video. A real, moving robot they can hold.
              </p>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                That single moment of "I want to build <em>that</em>" is more
                powerful than any lecture. The rest of the workshop is students
                working backward from that dream.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { day: "Day 1",     title: "See the finished robot 🤖", desc: "Students see a working RC car. Curiosity and motivation unlock immediately.", cls: "journey-card--amber" },
                { day: "Days 2–3", title: "Circuits & sensors ⚡",      desc: "Learn the components that make the robot sense and move.",                 cls: "journey-card--green" },
                { day: "Days 4–5", title: "Code & microcontrollers 💻", desc: "Program the brain of the robot step by step.",                            cls: "journey-card--green" },
                { day: "Days 6–7", title: "Assemble & demo 🏆",         desc: "Build your own version. Present it. Take it home forever.",                cls: "journey-card--amber" },
              ].map(s => (
                <div key={s.day} className={`journey-card ${s.cls}`}>
                  <div style={{ minWidth: 60 }}>
                    <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--amber)", letterSpacing: "0.06em" }}>
                      {s.day}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.1875rem" }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT STUDENTS LEARN ── */}
      <section className="section" style={{ background: "var(--bg-dark)" }}>
        <div className="container">
          <SectionLabel>What students learn</SectionLabel>
          <h2 className="section__h2">Real skills. Real components.</h2>
          <div className="feature-grid">
            {[
              { icon: "⚡", title: "Electronics & Circuits",  desc: "Breadboards, resistors, LEDs, motors — students wire everything themselves." },
              { icon: "📡", title: "Sensors & Actuators",     desc: "Ultrasonic, IR, servo motors — understanding inputs and outputs." },
              { icon: "🧠", title: "Microcontrollers",        desc: "Arduino programming — the bridge between code and the physical world." },
              { icon: "💻", title: "Programming",             desc: "C/C++ fundamentals learned in context, not in isolation." },
              { icon: "🔧", title: "Prototyping",             desc: "Design, test, fail fast, and iterate — the maker mindset." },
              { icon: "🤝", title: "Teamwork",                desc: "Every project is collaborative. Students divide tasks and debug together." },
            ].map(c => (
              <div key={c.title} className="feature-card">
                <div className="feature-card__icon">{c.icon}</div>
                <p className="feature-card__title">{c.title}</p>
                <p className="feature-card__desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEYOND WORKSHOPS ── */}
      <section className="section">
        <div className="container">
          <SectionLabel>Beyond the workshop</SectionLabel>
          <h2 className="section__h2">We don't disappear after Day 7.</h2>
          <div className="feature-grid">
            {[
              { icon: "🏫", tag: "After-school Club",   title: "Robotics club",       desc: "Weekly sessions for students who want to keep building." },
              { icon: "⚔️", tag: "Student Hackathons",  title: "Build. Compete. Win.", desc: "City-level hackathons for student teams." },
              { icon: "🌐", tag: "Maker Community",     title: "Stay connected",       desc: "A community of student builders sharing projects across Nagpur." },
            ].map(c => (
              <div key={c.title} className="feature-card">
                <div className="feature-card__icon">{c.icon}</div>
                <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--amber)", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  {c.tag}
                </div>
                <p className="feature-card__title">{c.title}</p>
                <p className="feature-card__desc">{c.desc}</p>
                <span className="badge badge--amber" style={{ marginTop: "0.75rem" }}>Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS ── */}
      <section className="section" style={{ background: "var(--bg-dark)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div>
              <SectionLabel>For schools</SectionLabel>
              <h2 className="section__h2">
                We handle everything.<br />
                <span style={{ color: "var(--amber)" }}>You just open the doors.</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  "All equipment and components provided",
                  "Experienced robotics engineers as instructors",
                  "Curriculum designed for school timetables",
                  "₹50,000 per batch · up to 40 students",
                  "School decides whether to absorb cost or charge parents",
                  "Certificate of completion for every student",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing card */}
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--amber)", marginBottom: "1.25rem", letterSpacing: "0.06em" }}>
                PRICING OVERVIEW
              </div>
              {[
                ["Workshop duration", "7–10 days"],
                ["Students per batch", "Up to 40"],
                ["Price per batch",    "₹50,000"],
                ["Price per student",  "~₹1,250"],
                ["Equipment",         "Fully provided"],
                ["Location",          "Your school"],
              ].map(([label, value], i) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: i < 5 ? "1px solid var(--border)" : "none"
                }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
              <button className="btn btn--primary" style={{ marginTop: "1.5rem", width: "100%" }} onClick={scrollToContact}>
                Enquire for your school →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE COURSES CTA ── */}
      <section className="section" style={{ textAlign: "center" }}>
        <div className="container">
          <SectionLabel>Online learning</SectionLabel>
          <h2 className="section__h2">Can't wait for the workshop?</h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 2rem" }}>
            Start learning right now with our interactive robotics coding sandbox.
            Write real Python, control a virtual robot, and solve challenges in
            your browser — no installs, no waiting.
          </p>
          <button className="btn btn--primary btn--lg" onClick={onExploreCourses}>
            🤖 Explore courses →
          </button>
          <p className="hero__meta" style={{ marginTop: "0.875rem" }}>
            Free to try · No account needed · Runs in your browser
          </p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section" style={{ background: "var(--bg-dark)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>

            {/* Info */}
            <div>
              <SectionLabel>Get in touch</SectionLabel>
              <h2 className="section__h2">
                Bring Karoo to<br />
                <span style={{ color: "var(--amber)" }}>your school.</span>
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "2rem" }}>
                We're based in Nagpur and currently running workshops across
                private schools in the city. Fill in the form and we'll get
                back to you within 24 hours.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { icon: "📍", label: "Location",      value: "Nagpur, Maharashtra" },
                  { icon: "📧", label: "Email",         value: "hello@karoo.in" },
                  { icon: "📞", label: "Phone",         value: "+91 98765 43210" },
                  { icon: "🕐", label: "Response time", value: "Within 24 hours" },
                ].map(c => (
                  <div key={c.label} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: "var(--amber-bg)", border: "1px solid var(--border-amber)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.125rem", flexShrink: 0
                    }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--amber)", letterSpacing: "0.06em", marginBottom: 2 }}>
                        {c.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="card" style={{ padding: "2.5rem", textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "3rem" }}>🎉</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>We'll be in touch!</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
                    Thank you for your interest. We'll contact you within 24 hours.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                    Enquire about a workshop
                  </div>
                  {[
                    { key: "name",   label: "Your name",     placeholder: "Rajesh Kumar",                 type: "text"  },
                    { key: "school", label: "School name",   placeholder: "Delhi Public School, Nagpur",  type: "text"  },
                    { key: "city",   label: "City",          placeholder: "Nagpur",                       type: "text"  },
                    { key: "phone",  label: "Phone number",  placeholder: "+91 98765 43210",              type: "tel"   },
                    { key: "email",  label: "Email address", placeholder: "principal@school.edu.in",      type: "email" },
                  ].map(f => (
                    <div key={f.key} className="form-group">
                      <label className="form-label">{f.label}</label>
                      <input
                        className="form-input"
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formData[f.key]}
                        onChange={handleInput(f.key)}
                        required
                      />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Anything else you'd like us to know?</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Number of students, preferred dates, questions..."
                      value={formData.message}
                      onChange={handleInput("message")}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ marginTop: "0.25rem" }}>
                    Send enquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="nav" style={{
        position: "static", justifyContent: "space-between",
        borderTop: "1px solid var(--border)", borderBottom: "none"
      }}>
        <div className="nav__logo">
          <Emblem size={24} />
          KA<span>ROO</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 400, fontStyle: "italic", marginLeft: "0.5rem" }}>
            Karo aur Seekho
          </span>
        </div>
        <ul className="nav__links">
          {["Workshops", "Schools", "Community", "About", "Contact"].map(l => (
            <li key={l}><span>{l}</span></li>
          ))}
        </ul>
        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
          © 2025 Karoo · Nagpur, Maharashtra
        </span>
      </footer>

    </div>
  );
}

export default function TerminalHero({ onStart }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
      borderBottom: "0.5px solid var(--term-border)"
    }}>
      {/* Left: headline */}
      <div style={{
        padding: "56px 40px 56px 36px",
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>
        <div style={{
          fontFamily: "monospace", fontSize: 11, color: "var(--term-text-faint)",
          marginBottom: 14, letterSpacing: "0.05em"
        }}>
          // 01 — learn by building
        </div>
        <h1 style={{
          fontFamily: "monospace", fontSize: 34, lineHeight: 1.3,
          color: "var(--term-text)", margin: "0 0 18px", fontWeight: 500
        }}>
          Program a robot.<br />
          Watch it <span style={{ color: "var(--term-accent)" }}>think</span>.<br />
          Learn to <span style={{ color: "var(--term-amber)" }}>code</span>.
        </h1>
        <p style={{
          fontSize: 15, color: "var(--term-text-secondary)",
          lineHeight: 1.7, margin: "0 0 28px", maxWidth: 420
        }}>
          Real Python, real physics, zero installs. Open a browser, write a few
          lines, and watch a robot navigate the world you described.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button
            onClick={onStart}
            style={{
              fontFamily: "monospace", background: "var(--term-accent)",
              color: "var(--term-accent-dark)", border: "none", borderRadius: 6,
              padding: "11px 20px", fontSize: 13, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8
            }}
          >
            run_first_challenge() →
          </button>
          <button style={{
            fontFamily: "monospace", background: "transparent",
            color: "var(--term-text)", border: "0.5px solid var(--term-border-strong)",
            borderRadius: 6, padding: "11px 20px", fontSize: 13, cursor: "pointer"
          }}>
            for_teachers()
          </button>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--term-text-faint)" }}>
          $ no account required · free &amp; open source
        </div>
      </div>

      {/* Right: live terminal + canvas preview */}
      <div style={{
        background: "var(--term-bg-deep)", borderLeft: "0.5px solid var(--term-border)",
        display: "flex", flexDirection: "column"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 18px", borderBottom: "0.5px solid var(--term-border)"
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--term-coral)" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--term-amber)" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--term-accent)" }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--term-text-faint)", marginLeft: 6 }}>
            patrol.py
          </span>
        </div>
        <div style={{
          padding: "20px 22px", fontFamily: "monospace", fontSize: 12.5,
          lineHeight: 2, color: "var(--term-text-secondary)", flex: 1
        }}>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "var(--term-line-num)", width: 14, textAlign: "right", flexShrink: 0 }}>1</span>
            <span style={{ color: "var(--term-text-faint)" }}># reach the goal zone</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "var(--term-line-num)", width: 14, textAlign: "right", flexShrink: 0 }}>2</span>
            <span><span style={{ color: "var(--term-accent)" }}>for</span> i <span style={{ color: "var(--term-accent)" }}>in</span> <span style={{ color: "var(--term-blue)" }}>range</span>(<span style={{ color: "var(--term-amber)" }}>3</span>):</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "var(--term-line-num)", width: 14, textAlign: "right", flexShrink: 0 }}>3</span>
            <span>&nbsp;&nbsp;robot.<span style={{ color: "var(--term-blue)" }}>move</span>(<span style={{ color: "var(--term-amber)" }}>1.0</span>, <span style={{ color: "var(--term-amber)" }}>1.5</span>)</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "var(--term-line-num)", width: 14, textAlign: "right", flexShrink: 0 }}>4</span>
            <span>&nbsp;&nbsp;robot.<span style={{ color: "var(--term-blue)" }}>turn</span>(<span style={{ color: "var(--term-amber)" }}>90</span>)</span>
          </div>
        </div>
        <div style={{
          margin: "0 22px 20px", aspectRatio: "16/9",
          background: "var(--term-bg)", border: "0.5px solid var(--term-border)",
          borderRadius: 6, position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: "40%", left: "18%",
            width: 16, height: 16, borderRadius: "50%", background: "var(--term-blue)"
          }} />
          <div style={{
            position: "absolute", bottom: 14, right: 14,
            width: 30, height: 30, border: "1.5px dashed var(--term-accent)", borderRadius: 4
          }} />
        </div>
      </div>
    </div>
  );
}
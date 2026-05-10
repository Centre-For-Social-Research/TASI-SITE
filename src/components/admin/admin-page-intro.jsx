'use client';

export default function AdminPageIntro({
  eyebrow,
  title,
  description,
  chips = [],
  actions = null,
}) {
  return (
    <section
      style={{
        borderRadius: 10,
        border: '1px solid var(--adm-line)',
        background:
          'linear-gradient(135deg, var(--adm-panel) 0%, var(--adm-panel-2) 60%, var(--adm-canvas-2) 100%)',
        padding: '20px 24px',
        marginBottom: 22,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          bottom: 0,
          background:
            'radial-gradient(circle at 100% 0%, var(--adm-accent-soft), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          {eyebrow && (
            <p
              style={{
                fontFamily: 'var(--adm-mono)',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--adm-accent)',
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--adm-sans)',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--adm-ink)',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: 'var(--adm-ink-3)',
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          )}
          {chips.length > 0 && (
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--adm-line)',
                    background: 'var(--adm-panel-2)',
                    fontFamily: 'var(--adm-mono)',
                    fontSize: 10.5,
                    color: 'var(--adm-ink-3)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </div>
    </section>
  );
}

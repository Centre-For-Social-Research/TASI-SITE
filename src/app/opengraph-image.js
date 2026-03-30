import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px',
        background:
          'radial-gradient(circle at 15% 0%, #f59e0b 0%, rgba(245, 158, 11, 0.15) 32%, transparent 58%), linear-gradient(135deg, #0b1220 0%, #111827 45%, #1f2937 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          letterSpacing: 2,
          opacity: 0.9,
        }}
      >
        TRUST AND SAFETY INDIA FESTIVAL
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 90,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          TASI 2026
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            color: '#fde68a',
            lineHeight: 1.2,
          }}
        >
          People First. Safety Always.
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 24, opacity: 0.92 }}>
        13-14 October 2026 • New Delhi, India
      </div>
    </div>,
    {
      ...size,
    }
  );
}

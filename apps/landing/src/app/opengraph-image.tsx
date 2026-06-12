import { ImageResponse } from 'next/og';

import { site } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${site.name} — ${site.tagline}`;

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background:
          'radial-gradient(900px 600px at 85% -10%, rgba(59,130,246,0.35), transparent), radial-gradient(700px 500px at 0% 110%, rgba(34,211,238,0.25), transparent), #080e1c',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          {site.name.charAt(0)}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#f1f5fb' }}>{site.name}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.02,
            color: '#f1f5fb',
            maxWidth: 920,
            letterSpacing: '-0.03em',
          }}
        >
          Speak English with confidence.
        </div>
        <div style={{ fontSize: 34, color: '#c5d1e3', maxWidth: 880 }}>
          Listen · Shadow · Speak — the speaking-first way to fluency.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {[60, 90, 40, 100, 55, 80, 35, 95, 50].map((h, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: h,
              borderRadius: 8,
              background: i % 2 ? '#22d3ee' : '#3b82f6',
            }}
          />
        ))}
      </div>
    </div>,
    size
  );
}

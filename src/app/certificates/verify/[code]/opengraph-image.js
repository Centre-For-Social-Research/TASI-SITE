import fs from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

import { getCertificateForVerification } from '@/lib/certificates-db';
import certificateUtils from '@/lib/certificate-utils.cjs';

const {
  getCertificateEdition,
  isValidCertificateCode,
  normalizeCertificateCode,
} = certificateUtils;

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TASI 2026 certificate of participation';

const ASSET_DIR = path.join(process.cwd(), 'src', 'assets', 'certificates');
const GRADIENT =
  'linear-gradient(135deg, #022d5d 0%, #43358a 55%, #b34b5c 100%)';

let assets;
async function loadAssets() {
  if (!assets) {
    const read = (file) => fs.readFile(path.join(ASSET_DIR, file));
    const [inter, interBold, playfair, background, logo] = await Promise.all([
      read('fonts/Inter-Regular.ttf'),
      read('fonts/Inter-Bold.ttf'),
      read('fonts/PlayfairDisplay-Bold.ttf'),
      read('og-certificate-bg.jpg'),
      read('og-logo.png'),
    ]);
    assets = {
      fonts: [
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Playfair', data: playfair, weight: 700, style: 'normal' },
      ],
      background: `data:image/jpeg;base64,${background.toString('base64')}`,
      logo: `data:image/png;base64,${logo.toString('base64')}`,
    };
  }
  return assets;
}

// Big enough to read in a feed, small enough that long names stay on two lines.
function nameSize(name) {
  if (name.length <= 16) return 72;
  if (name.length <= 24) return 60;
  if (name.length <= 34) return 50;
  return 42;
}

function Logo({ src }) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        left: 64,
        top: 56,
        padding: '10px 16px',
        borderRadius: 10,
        background: '#ffffff',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG */}
      <img src={src} width={200} height={55} alt="" />
    </div>
  );
}

// A generic card for unknown or revoked IDs: it never shows a name.
function FallbackCard({ logo, revoked }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: GRADIENT,
        color: '#ffffff',
        fontFamily: 'Inter',
        position: 'relative',
      }}
    >
      <Logo src={logo} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 64,
          top: 250,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 5,
            color: '#ffd919',
            fontWeight: 700,
          }}
        >
          CERTIFICATE VERIFICATION
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 16 }}>
          {revoked ? 'Certificate revoked' : 'TASI 2026'}
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 20,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          Trust &amp; Safety India Festival · 14–15 October 2026 · New Delhi
        </div>
      </div>
    </div>
  );
}

export default async function Image({ params }) {
  const { fonts, background, logo } = await loadAssets();
  const code = normalizeCertificateCode(
    decodeURIComponent((await params).code)
  );
  let record = null;
  try {
    record = isValidCertificateCode(code)
      ? await getCertificateForVerification(code)
      : null;
  } catch (error) {
    console.error('Certificate share image lookup failed.', error);
  }
  const options = {
    ...size,
    fonts,
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  };

  if (!record || record.status !== 'active') {
    return new ImageResponse(
      <FallbackCard logo={logo} revoked={Boolean(record)} />,
      options
    );
  }

  const edition = getCertificateEdition(record.edition);
  const fontSize = nameSize(record.name);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: GRADIENT,
        color: '#ffffff',
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Logo src={logo} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 64,
          top: 186,
          width: 580,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            padding: '8px 20px',
            borderRadius: 999,
            border: '2px solid #34d399',
            background: 'rgba(16,185,129,0.18)',
            color: '#a7f3d0',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{ marginRight: 10 }}
          >
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="#a7f3d0"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          VERIFIED
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 25,
            letterSpacing: 5,
            color: '#ffd919',
            fontWeight: 700,
          }}
        >
          CERTIFICATE OF PARTICIPATION
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: 'Playfair',
            fontSize,
            lineHeight: 1.08,
          }}
        >
          {record.name}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 30,
            fontSize: 24,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          <div>{edition.eventName.replace(/ \(.*\)$/, '')}</div>
          <div>{`${edition.dates} · New Delhi`}</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: -30,
          top: 78,
          width: 560,
          height: 396,
          transform: 'rotate(-4deg)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          background: '#ffffff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG */}
        <img
          src={background}
          width={560}
          height={396}
          alt=""
          style={{ position: 'absolute', left: 0, top: 0 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            top: 96,
            width: 560,
            color: '#3c4043',
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: 4,
              color: '#43358a',
              fontWeight: 700,
            }}
          >
            CERTIFICATE OF PARTICIPATION
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: 'Playfair',
              fontSize: record.name.length > 24 ? 24 : 32,
              color: '#022d5d',
            }}
          >
            {record.name}
          </div>
          <div
            style={{
              marginTop: 10,
              width: 320,
              height: 1,
              background: '#dadce0',
            }}
          />
          <div
            style={{
              marginTop: 12,
              width: 460,
              fontSize: 10,
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            participated in the Trust &amp; Safety India Festival 2026 (TASI
            2026), held on 14–15 October 2026 at the India International Centre,
            New Delhi, organised by the Centre for Social Research and the Trust
            &amp; Safety Festival.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 56,
            top: 286,
            fontSize: 9,
            fontWeight: 700,
            color: '#202124',
          }}
        >
          {`Certificate ID: ${record.code}`}
        </div>
      </div>
    </div>,
    options
  );
}

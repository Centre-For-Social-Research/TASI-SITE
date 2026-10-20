import { Inter, Playfair_Display } from 'next/font/google';

const display = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['700'],
  display: 'swap',
});
const body = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  display: 'swap',
});

// A screen preview of the certificate, laid out in millimetres of the A4
// page via container units. It uses a public background without the
// signature and is always marked as a preview, so it can't stand in for
// the signed PDF.
const mm = (value) => `calc(${value} / 297 * 100cqw)`;

export default function CertificatePreview({
  name,
  code,
  issuedOn,
  label = 'Preview',
}) {
  return (
    <figure
      aria-label={`Certificate of participation for ${name}`}
      className={`${body.className} relative w-full overflow-hidden rounded-[6px] shadow-xl ring-1 ring-black/5`}
      style={{ containerType: 'inline-size', aspectRatio: '297 / 210' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed decorative background */}
      <img
        src="/img/certificates/tasi-2026-preview-bg.webp"
        alt=""
        className="absolute inset-0 h-full w-full"
      />
      <div
        className="absolute inset-0 text-center"
        style={{ color: '#3c4043' }}
      >
        <p
          className="absolute inset-x-0 font-semibold uppercase"
          style={{
            top: mm(46),
            fontSize: mm(4.2),
            letterSpacing: '0.3em',
            color: '#43358a',
          }}
        >
          Certificate of Participation
        </p>
        <p
          className="absolute inset-x-0"
          style={{ top: mm(57.5), fontSize: mm(4.4), color: '#5f6368' }}
        >
          This is to certify that
        </p>
        <p
          className={`${display.className} absolute inset-x-0 truncate px-[8%]`}
          style={{
            top: mm(67),
            fontSize: mm(12),
            lineHeight: 1.1,
            color: '#022d5d',
          }}
        >
          {name}
        </p>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: mm(87),
            width: mm(120),
            height: 1,
            background: '#dadce0',
          }}
        />
        <p
          className="absolute inset-x-0 px-[10%]"
          style={{ top: mm(93), fontSize: mm(4.4), lineHeight: 1.6 }}
        >
          participated in the{' '}
          <b style={{ color: '#202124', fontWeight: 600 }}>
            Trust &amp; Safety India Festival 2026 (TASI 2026)
          </b>
          , held on{' '}
          <b style={{ color: '#202124', fontWeight: 600 }}>
            14–15 October 2026
          </b>{' '}
          at the India International Centre, New Delhi, organised by the Centre
          for Social Research and the Trust &amp; Safety Festival.
        </p>
        <div
          className="absolute text-left"
          style={{
            left: mm(29),
            top: mm(136),
            fontSize: mm(3.8),
            color: '#202124',
          }}
        >
          <div
            style={{
              width: mm(62),
              height: 1,
              background: '#3c4043',
              marginBottom: mm(2),
            }}
          />
          <b>Dr. Ranjana Kumari</b>
          <div style={{ color: '#5f6368', fontSize: mm(3.3) }}>
            Director, Centre for Social Research
          </div>
        </div>
        <div
          className="absolute text-right"
          style={{
            right: mm(30),
            top: mm(138),
            fontSize: mm(3.2),
            color: '#5f6368',
          }}
        >
          <b style={{ color: '#202124' }}>Certificate ID: {code}</b>
          {issuedOn ? <div>Issued {issuedOn}</div> : null}
        </div>
        <span
          className="absolute rounded-full font-semibold uppercase"
          style={{
            right: mm(12),
            top: mm(12),
            padding: `${mm(1)} ${mm(3)}`,
            fontSize: mm(2.8),
            letterSpacing: '0.12em',
            background: '#43358a',
            color: '#fff',
          }}
        >
          {label}
        </span>
      </div>
    </figure>
  );
}

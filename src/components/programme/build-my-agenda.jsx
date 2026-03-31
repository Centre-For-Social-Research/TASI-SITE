'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, CheckCircle2, Circle } from 'lucide-react';

const DAY_LABELS_FALLBACK = {
  oct6: 'Oct 13 – Opening Reception',
  oct7: 'Oct 14 – Conference Day 1',
  oct8: 'Oct 15 – Conference Day 2',
};

export default function BuildMyAgenda({ sessions, isOpen, onClose, dayLabels }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState('');

  const effectiveDayLabels = dayLabels || DAY_LABELS_FALLBACK;

  if (!isOpen) return null;

  const handleToggle = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
    if (error && newSet.size > 0) setError('');
  };

  const handleGenerate = () => {
    if (!name.trim()) return setError('Name is required.');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return setError('Valid email is required.');
    if (selectedIds.size === 0)
      return setError('Please select at least one session.');

    setError('');

    const selectedSessions = sessions.filter((s) => selectedIds.has(s.id));
    generatePDF(name.trim(), email.trim(), selectedSessions);
  };

  const generatePDF = async (userName, userEmail, selectedSessions) => {
    // Load TASI logo
    let logoDataUrl = null;
    try {
      const resp = await fetch('/img/tasi-csr-logo.png');
      const blob = await resp.blob();
      logoDataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth(); // 210
    const ph = doc.internal.pageSize.getHeight(); // 297
    const ml = 15;     // left/right margin
    const W = pw - 2 * ml; // 180 usable width

    // ── Design System ─────────────────────────────────────
    // Palette
    const navy   = [22, 36, 71];        // deep navy – table header, authority
    const orange = [194, 65, 12];       // TASI brand orange – accents
    const stone  = [238, 235, 229];     // header / info card bg
    const rowBg  = [251, 249, 246];     // table row card bg
    const white  = [255, 255, 255];
    const dark   = [22, 20, 18];        // body text near-black
    const mid    = [95, 89, 82];        // secondary text warm gray
    const light  = [165, 160, 153];     // light text / meta
    const rule   = [215, 211, 205];     // divider lines

    // Typography helpers
    const T = {
      bold:   (sz) => { doc.setFont('helvetica', 'bold');   doc.setFontSize(sz); },
      normal: (sz) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(sz); },
      italic: (sz) => { doc.setFont('helvetica', 'italic'); doc.setFontSize(sz); },
    };
    const C = (c) => doc.setTextColor(c[0], c[1], c[2]);

    // Layout consts
    const STRIPE_H    = 9;    // top accent stripe height
    const HEADER_H    = 50;   // logo + event meta card
    const INFO_H      = 38;   // attendee info card
    const GAP         = 4;    // vertical gap between sections
    const TBL_HDR_H   = 11;   // table column header row height
    const ROW_GAP     = 2.5;  // gap between row cards
    const CP          = 5;    // cell padding
    const LINE_H      = 5.0;  // line height per text line (mm) at 9pt
    const FOOT_H      = 14;   // footer reserved height from bottom

    // Table column widths (total = 180)
    const COL = [44, 80, 32, 24]; // Agenda, Topic, Presenter, Time

    // ════════════════════════════════════════════════════
    // SECTION 1 — Top accent stripe
    // ════════════════════════════════════════════════════
    doc.setFillColor(...orange);
    doc.rect(0, 0, pw, STRIPE_H, 'F');

    T.bold(8.5); doc.setTextColor(...white);
    doc.text('TRUST & SAFETY INDIA FESTIVAL 2026  ·  PERSONALIZED AGENDA', pw / 2, STRIPE_H - 3, { align: 'center' });

    // ════════════════════════════════════════════════════
    // SECTION 2 — Event header card (stone bg)
    // ════════════════════════════════════════════════════
    const hdrY = STRIPE_H + 4;
    doc.setFillColor(...stone);
    doc.roundedRect(ml, hdrY, W, HEADER_H, 3, 3, 'F');

    // Logo (left panel, vertically centred)
    if (logoDataUrl) {
      // Logo ~2.8:1 ratio; render at 58×21mm
      doc.addImage(logoDataUrl, 'PNG', ml + 6, hdrY + (HEADER_H - 21) / 2, 58, 21);
    } else {
      T.bold(13); C(orange);
      doc.text('TASI 2026', ml + 8, hdrY + 20);
    }

    // Vertical separator between logo and meta
    const sepX = ml + 70;
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.35);
    doc.line(sepX, hdrY + 6, sepX, hdrY + HEADER_H - 6);

    // Meta row: 3-item horizontal (Date | Time | Website) — Location intentionally omitted
    const metaX1 = sepX + 8;
    const metaItemW = (ml + W - 6 - metaX1) / 3;
    const metaX2 = metaX1 + metaItemW;
    const metaX3 = metaX2 + metaItemW;
    const metaRow = hdrY + 18;

    const drawMeta = (x, y, label, value, valueBold) => {
      T.bold(7.5); C(light);
      doc.text(label.toUpperCase(), x, y);
      if (valueBold) { T.bold(9); } else { T.normal(9); }
      C(dark);
      doc.text(value, x, y + 5.5);
    };

    drawMeta(metaX1, metaRow, 'Date', '13 \u2013 14 October 2026', true);

    // Thin vertical rules between meta items
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.25);
    doc.line(metaX2 - 4, hdrY + 10, metaX2 - 4, hdrY + HEADER_H - 10);

    drawMeta(metaX2, metaRow, 'Time', '9:00 am \u2013 5:30 pm', false);

    doc.line(metaX3 - 4, hdrY + 10, metaX3 - 4, hdrY + HEADER_H - 10);

    drawMeta(metaX3, metaRow, 'Website', 'jamsaq.in', false);

    // ════════════════════════════════════════════════════
    // SECTION 3 — Attendee info card
    // ════════════════════════════════════════════════════
    const infoY = hdrY + HEADER_H + GAP;
    doc.setFillColor(...stone);
    doc.roundedRect(ml, infoY, W, INFO_H, 3, 3, 'F');

    // Orange left accent bar on info card
    doc.setFillColor(...orange);
    doc.roundedRect(ml, infoY, 3, INFO_H, 1.5, 1.5, 'F');

    const halfW = (W - 6) / 2;
    const lx = ml + 10;   // left col x
    const rx2 = ml + 10 + halfW + 4; // right col x

    // Left: Name + Email
    T.bold(7.5); C(light);
    doc.text('ATTENDEE', lx, infoY + 8);
    doc.text('NAME', lx, infoY + 19.5);
    T.normal(9.5); C(dark);
    doc.text(doc.splitTextToSize(userName, halfW - 6)[0] || '', lx, infoY + 25.5);
    doc.setDrawColor(...rule); doc.setLineWidth(0.25);
    doc.line(lx, infoY + 27.5, ml + halfW + 6, infoY + 27.5);

    T.bold(7.5); C(light);
    doc.text('EMAIL', lx + 46, infoY + 19.5);
    T.normal(9); C(mid);
    doc.text(doc.splitTextToSize(userEmail, halfW - 6)[0] || '', lx + 46, infoY + 25.5);
    doc.setDrawColor(...rule);
    doc.line(lx + 46, infoY + 27.5, ml + halfW + 6 + halfW - 6, infoY + 27.5);

    // Vertical divider in info card
    doc.setDrawColor(...rule);
    doc.line(ml + halfW + 6, infoY + 6, ml + halfW + 6, infoY + INFO_H - 6);

    // Right: Title + Days
    const daysSelected = [...new Set(selectedSessions.map((s) => s.day))];
    const topicLabel = daysSelected.map((d) => effectiveDayLabels[d] || d).join(' / ');

    T.bold(7.5); C(light);
    doc.text('EVENT', rx2, infoY + 8);
    T.bold(9.5); C(dark);
    doc.text('Trust And Safety India Festival 2026', rx2, infoY + 15);
    doc.setDrawColor(...rule); doc.setLineWidth(0.25);
    doc.line(rx2, infoY + 17.5, ml + W - 6, infoY + 17.5);

    T.bold(7.5); C(light);
    doc.text('YOUR SELECTED DAYS', rx2, infoY + 22);
    T.bold(9.5); C(orange);
    const topicLines = doc.splitTextToSize(topicLabel, halfW - 6);
    doc.text(topicLines.slice(0, 2), rx2, infoY + 28);

    // ════════════════════════════════════════════════════
    // SECTION 4 — Session table
    // ════════════════════════════════════════════════════
    let curY = infoY + INFO_H + GAP;

    // Column header labels
    const COL_LABELS = ['Agenda', 'Topic', 'Speaker', 'Time'];

    const drawTableHeader = (y) => {
      doc.setFillColor(...navy);
      doc.roundedRect(ml, y, W, TBL_HDR_H, 2, 2, 'F');
      T.bold(9.5); doc.setTextColor(...white);
      let cx2 = ml + CP;
      COL_LABELS.forEach((lbl, i) => {
        doc.text(lbl, cx2, y + 7.5);
        cx2 += COL[i];
      });
      return y + TBL_HDR_H + ROW_GAP;
    };

    curY = drawTableHeader(curY);

    // Footer renderer (called for each page)
    const drawFooter = (pageNum, totalPages) => {
      const fy = ph - FOOT_H + 2;
      doc.setDrawColor(...orange);
      doc.setLineWidth(0.5);
      doc.line(ml, fy, pw - ml, fy);

      // Left: email
      T.normal(7.5); C(light);
      doc.text('info@csrindia.org', ml, fy + 5);

      // Centre: phone
      doc.text('+91 11 2468 2556', pw / 2, fy + 5, { align: 'center' });

      // Right: website
      doc.text('jamsaq.in', pw - ml, fy + 5, { align: 'right' });

      // Page number
      T.bold(7.5); C(light);
      doc.text(`Page ${pageNum} of ${totalPages}`, pw / 2, fy + 10, { align: 'center' });
    };

    // ─── Draw session rows ────────────────────────────────
    selectedSessions.forEach((s) => {
      const title = s.title || '';
      const speakersArr = Array.isArray(s.speakers)
        ? s.speakers
        : s.speakers ? [s.speakers] : [];
      const desc = s.description || '';
      const venue = s.venue || s.track || '';
      const time = s.time || 'TBD';

      // Build topic cell content: description only (speakers go in Speaker column)
      T.normal(8.5);
      let topicCellLines = [];
      if (desc) {
        const descWrapped = doc.splitTextToSize(desc, COL[1] - 2 * CP);
        topicCellLines.push(...descWrapped.slice(0, 4));
      }
      if (topicCellLines.length === 0) topicCellLines = ['\u2013'];

      // Compute other column line counts
      T.bold(9.5);
      const titleLines2 = doc.splitTextToSize(title, COL[0] - 2 * CP);
      // Speaker column: all speakers stacked
      T.bold(8.5);
      const speakerColLines = speakersArr.length > 0
        ? speakersArr.slice(0, 4).flatMap((sp) => doc.splitTextToSize(sp, COL[2] - 2 * CP).slice(0, 2))
        : [venue || '\u2013'];

      // Row height: derive from max lines × LINE_H + padding
      const maxL = Math.max(titleLines2.length, topicCellLines.length, speakerColLines.length, 1);
      const rowH = Math.max(maxL * LINE_H + 2 * CP, 18);

      // Page break check (reserve footer space)
      if (curY + rowH > ph - FOOT_H - 4) {
        doc.addPage();
        // Repeat accent stripe on new page
        doc.setFillColor(...orange);
        doc.rect(0, 0, pw, STRIPE_H, 'F');
        T.bold(8.5); doc.setTextColor(...white);
        doc.text('TRUST & SAFETY INDIA FESTIVAL 2026  ·  PERSONALIZED AGENDA', pw / 2, STRIPE_H - 3, { align: 'center' });
        curY = STRIPE_H + 4;
        curY = drawTableHeader(curY);
      }

      // Row card background
      doc.setFillColor(...rowBg);
      doc.roundedRect(ml, curY, W, rowH, 2, 2, 'F');

      // Left orange accent strip on each row
      doc.setFillColor(...orange);
      doc.roundedRect(ml, curY, 2.5, rowH, 1, 1, 'F');

      // Subtle vertical column dividers inside the row
      doc.setDrawColor(...rule);
      doc.setLineWidth(0.2);
      let dvx = ml + COL[0];
      [0, 1, 2].forEach((i) => {
        doc.line(dvx, curY + 3, dvx, curY + rowH - 3);
        dvx += COL[i + 1];
      });

      const textY = curY + CP + 3.5;

      // Col 0: Agenda title (bold, dark)
      T.bold(9.5); C(dark);
      doc.text(titleLines2, ml + CP + 2, textY);

      // Col 1: Topic (description only, no speakers)
      if (topicCellLines.length > 0 && topicCellLines[0] !== '\u2013') {
        T.normal(8.5); C(mid);
        doc.text(topicCellLines, ml + COL[0] + CP, textY);
      } else {
        T.normal(8.5); C(light);
        doc.text('\u2013', ml + COL[0] + CP, textY);
      }

      // Col 2: Speaker (all speakers stacked)
      const spX = ml + COL[0] + COL[1] + CP;
      if (speakersArr.length > 0) {
        let spY = textY;
        speakersArr.slice(0, 4).forEach((sp, idx) => {
          if (idx === 0) { T.bold(8.5); C(dark); }
          else { T.normal(7.8); C(mid); }
          const spL = doc.splitTextToSize(sp, COL[2] - 2 * CP).slice(0, 2);
          doc.text(spL, spX, spY);
          spY += spL.length * LINE_H;
        });
      } else {
        T.normal(8.5); C(light);
        doc.text(venue || '\u2013', spX, textY);
      }

      // Col 3: Time (bold, brand color)
      T.bold(9); C(orange);
      doc.text(time, ml + COL[0] + COL[1] + COL[2] + CP, textY);

      curY += rowH + ROW_GAP;
    });

    // Apply footer to all pages now that we know total count
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter(p, totalPages);
    }

    doc.save('TASI-2026-My-Agenda.pdf');
  };

  const groupedSessions = sessions.reduce((acc, sess) => {
    if (!acc[sess.day]) acc[sess.day] = [];
    acc[sess.day].push(sess);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-stone-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <h2 className="text-xl font-bold tracking-tight">Build My Agenda</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Select the sessions you plan to attend and generate a personalized
            printable PDF agenda.
          </p>

          {/* User Info Form */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Sessions List */}
          <div className="mt-2 space-y-8">
            {['oct6', 'oct7', 'oct8'].map((dayKey) => {
              const daySessions = groupedSessions[dayKey];
              if (!daySessions || daySessions.length === 0) return null;

              return (
                <div key={dayKey}>
                  <h3 className="text-sm font-black text-orange-700 dark:text-orange-500 uppercase tracking-widest mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                    {effectiveDayLabels[dayKey] || dayKey}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {daySessions.map((session) => {
                      const isSelected = selectedIds.has(session.id);
                      return (
                        <div
                          key={session.id}
                          onClick={() => handleToggle(session.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50' : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-stone-700'}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-stone-300 dark:text-stone-700" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-300 shrink-0">
                                {session.time}
                              </span>
                              <span className="text-xs font-medium text-stone-500 px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 shrink-0">
                                {session.venue || session.track}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-snug mb-1">
                              {session.title}
                            </h4>
                            {session.speakers && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                                {Array.isArray(session.speakers)
                                  ? session.speakers.join(', ')
                                  : session.speakers}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 sm:py-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-between items-center">
          <div className="text-sm text-stone-500 font-medium">
            {selectedIds.size} session{selectedIds.size !== 1 && 's'} selected
          </div>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

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
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 14;
    const W = pw - 2 * m;

    // Colour palette – matching reference neutral modern style
    const beige = [242, 240, 235];
    const charcoal = [55, 50, 45];
    const cardBg = [250, 248, 244];
    const brown = [120, 80, 50];
    const dark = [40, 36, 32];
    const mid = [100, 95, 88];
    const lineCl = [215, 210, 205];

    // Helpers
    const setF = (size, bold) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
    };
    const setC = (c) => doc.setTextColor(c[0], c[1], c[2]);
    const drawIcon = (x, y, type) => {
      doc.setFillColor(brown[0], brown[1], brown[2]);
      if (type === 'sq') doc.roundedRect(x, y, 5, 5, 1, 1, 'F');
      else doc.circle(x + 2.5, y + 2.5, 2.5, 'F');
    };

    // ════════════════════════════════════════════════════
    // HEADER (single beige block with logo + meta + info)
    // ════════════════════════════════════════════════════
    const headerH = 82;
    doc.setFillColor(...beige);
    doc.roundedRect(m, 10, W, headerH, 4, 4, 'F');

    // Logo (directly on beige, no white box)
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', m + 6, 14, 50, 18);
    } else {
      setF(14, true);
      doc.setTextColor(194, 65, 12);
      doc.text('TRUST & SAFETY', m + 6, 24);
      doc.text('FESTIVAL', m + 6, 32);
    }

    // Date (calendar icon)
    const ix = m + 64;
    drawIcon(ix, 16, 'sq');
    setF(8.5, true); setC(dark);
    doc.text('Date:', ix + 7, 19.5);
    setF(8.5, false); setC(mid);
    doc.text('13 – 14 October 2026', ix + 7, 24.5);

    // Time (clock icon)
    const tx = ix + 56;
    drawIcon(tx, 16, 'circle');
    setF(8.5, true); setC(dark);
    doc.text('Time:', tx + 7, 19.5);
    setF(8.5, false); setC(mid);
    doc.text('9:00 am – 6:00 pm', tx + 7, 24.5);

    // Thin line under date/time
    doc.setDrawColor(...lineCl);
    doc.setLineWidth(0.3);
    doc.line(ix, 28, pw - m - 6, 28);

    // Location (pin icon)
    drawIcon(ix, 31, 'circle');
    setF(8.5, true); setC(dark);
    doc.text('Location:', ix + 7, 34.5);
    setF(8.5, false); setC(mid);
    doc.text('India Habitat Centre, Lodhi Road, New Delhi', ix + 7, 39.5);

    // ─── Divider across full header width ───
    const divY = 44;
    doc.setDrawColor(...lineCl);
    doc.setLineWidth(0.3);
    doc.line(m + 6, divY, m + W - 6, divY);

    // ─── Name / Email (left half) ───
    const by = 49;
    drawIcon(m + 6, by, 'circle');
    setF(9, true); setC(dark);
    doc.text('Name:', m + 14, by + 4);
    setF(9, false); setC(mid);
    const nameStr = doc.splitTextToSize(userName, W / 2 - 30);
    doc.text(nameStr[0] || '', m + 14, by + 10);

    // Underline under name
    doc.setDrawColor(...lineCl);
    doc.line(m + 14, by + 12, m + W / 2 - 4, by + 12);

    setF(9, true); setC(dark);
    doc.text('Email:', m + 14, by + 18);
    setF(9, false); setC(mid);
    const emailStr = doc.splitTextToSize(userEmail, W / 2 - 30);
    doc.text(emailStr[0] || '', m + 14, by + 24);

    // ─── Vertical divider ───
    const midX = m + W / 2;
    doc.setDrawColor(...lineCl);
    doc.line(midX, by - 2, midX, by + 38);

    // ─── Title / Topic (right half) ───
    const rx = midX + 6;
    setF(9, true); setC(dark);
    doc.text('Title:', rx, by + 4);
    setF(9, false); setC(mid);
    doc.text('Trust And Safety India Festival', rx, by + 10);

    // Underline under title
    doc.setDrawColor(...lineCl);
    doc.line(rx, by + 12, m + W - 6, by + 12);

    const daysSelected = [...new Set(selectedSessions.map((s) => s.day))];
    const topicLabel = daysSelected
      .map((d) => effectiveDayLabels[d] || d)
      .join(' / ');

    setF(9, true); setC(dark);
    doc.text('Topic:', rx, by + 18);
    setF(9, true); setC(dark);
    const topicFit = doc.splitTextToSize(topicLabel, W / 2 - 16);
    doc.text(topicFit, rx, by + 24);

    // ════════════════════════════════════════════════════
    // TABLE – manually drawn card-style rows
    // ════════════════════════════════════════════════════
    const colW = [38, 78, 38, 28]; // Agenda, Topic, Presenter, Time
    const cellPad = 5;
    const rowGap = 3;
    const lineH = 4.5;
    let curY = 10 + headerH + 8;

    // ─── Table header (dark charcoal with white text) ───
    doc.setFillColor(...charcoal);
    doc.roundedRect(m, curY, W, 12, 2, 2, 'F');
    setF(11, true);
    doc.setTextColor(255, 255, 255);
    const headers = ['Agenda', 'Topic', 'Presenter', 'Time'];
    let cx = m + cellPad;
    headers.forEach((h, i) => {
      doc.text(h, cx + 1, curY + 8);
      cx += colW[i];
    });
    curY += 12 + rowGap;

    // ─── Table body (card rows with gaps) ───
    const drawFooter = () => {
      const footY = ph - 12;
      doc.setDrawColor(...lineCl);
      doc.setLineWidth(0.3);
      doc.line(m, footY - 4, pw - m, footY - 4);

      doc.setFillColor(...brown);
      doc.roundedRect(m, footY - 1.5, 4, 3, 0.5, 0.5, 'F');
      setF(8, false); setC(mid);
      doc.text('info@csrindia.org', m + 6, footY + 1);

      doc.setFillColor(...brown);
      doc.circle(pw / 2 - 10, footY, 2, 'F');
      doc.text('+91 11 2468 2556', pw / 2 - 6, footY + 1);

      doc.setFillColor(...brown);
      doc.circle(pw - m - 26, footY, 2, 'F');
      doc.text('jamsaq.in', pw - m - 22, footY + 1);
    };

    selectedSessions.forEach((s) => {
      const title = s.title || '';
      const speakersArr = Array.isArray(s.speakers)
        ? s.speakers
        : s.speakers
          ? [s.speakers]
          : [];
      const desc = s.description || '';

      // Build bullet-point topic text
      const bullets = [];
      if (desc) {
        const sentences = desc
          .split(/[.!?]+/)
          .map((t) => t.trim())
          .filter(Boolean);
        sentences.slice(0, 3).forEach((sent) => bullets.push('\u2022 ' + sent));
      }
      if (bullets.length === 0) {
        speakersArr.forEach((sp) => bullets.push('\u2022 ' + sp));
      }

      const presenter = speakersArr.join(', ') || s.venue || s.track || '\u2013';
      const time = s.time || 'TBD';

      // Compute wrapped text for each column
      setF(9.5, true);
      const titleLines = doc.splitTextToSize(title, colW[0] - 2 * cellPad);
      setF(8.5, false);
      const topicLines = doc.splitTextToSize(
        bullets.join('\n'),
        colW[1] - 2 * cellPad
      );
      setF(9, false);
      const presLines = doc.splitTextToSize(
        presenter,
        colW[2] - 2 * cellPad
      );

      // Row height based on tallest column
      const maxLines = Math.max(
        titleLines.length,
        topicLines.length,
        presLines.length,
        1
      );
      const rowH = Math.max(maxLines * lineH + 2 * cellPad, 16);

      // Page break if needed (leave space for footer)
      if (curY + rowH > ph - 22) {
        doc.addPage();
        curY = 14;
      }

      // Draw card background
      doc.setFillColor(...cardBg);
      doc.roundedRect(m, curY, W, rowH, 2, 2, 'F');

      // Agenda column (bold)
      cx = m + cellPad;
      setF(9.5, true); setC(dark);
      doc.text(titleLines, cx + 1, curY + cellPad + 3.5);
      cx += colW[0];

      // Topic column (bullet points)
      setF(8.5, false); setC(mid);
      doc.text(topicLines, cx + 1, curY + cellPad + 3.5);
      cx += colW[1];

      // Presenter column
      setF(9, false); setC(dark);
      doc.text(presLines, cx + 1, curY + cellPad + 3.5);
      cx += colW[2];

      // Time column
      setF(9, false); setC(dark);
      doc.text(time, cx + 1, curY + cellPad + 3.5);

      curY += rowH + rowGap;
    });

    // Draw footer on every page
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter();
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

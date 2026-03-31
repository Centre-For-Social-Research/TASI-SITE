'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const usableW = pageW - margin * 2;

    // Colour palette – neutral/warm matching the reference design
    const clrLightGray = [242, 241, 238];
    const clrTan = [210, 196, 170];
    const clrRowAlt = [250, 248, 244];
    const clrOrange = [194, 65, 12];
    const clrDark = [40, 36, 32];
    const clrMid = [110, 105, 98];
    const clrBorder = [210, 205, 198];

    // ─── HEADER SECTION ──────────────────────────────────
    doc.setFillColor(...clrLightGray);
    doc.roundedRect(margin, 10, usableW, 45, 3, 3, 'F');

    // Logo inner box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 3, 13, 52, 39, 2, 2, 'F');

    if (logoDataUrl) {
      // Logo is ~2.8:1 wide; fit into 48x17mm centred in the white box
      doc.addImage(logoDataUrl, 'PNG', margin + 5, 22, 48, 17);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...clrOrange);
      doc.text('TRUST &', margin + 8, 26);
      doc.text('SAFETY', margin + 8, 33);
      doc.text('FESTIVAL', margin + 8, 40);
    }

    // Date (top-left of info area)
    const infoX = margin + 62;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Date:', infoX, 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    doc.text('13 – 14 October 2026', infoX, 27);

    // Time (top-right of info area)
    const col2X = infoX + 67;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Time:', col2X, 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    doc.text('9:00 am – 6:00 pm', col2X, 27);

    // Location (spanning full info area width)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Location:', infoX, 40);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    doc.text('India Habitat Centre, Lodhi Road, New Delhi', infoX, 46);

    // ─── ATTENDEE INFO SECTION ────────────────────────────
    const infoY = 60;
    const infoH = 32;
    const halfW = (usableW - 4) / 2;

    doc.setFillColor(...clrLightGray);
    doc.roundedRect(margin, infoY, halfW, infoH, 2, 2, 'F');
    doc.roundedRect(margin + halfW + 4, infoY, halfW, infoH, 2, 2, 'F');

    // Left panel: Name & Email
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Name:', margin + 6, infoY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    const nameFit = doc.splitTextToSize(userName, halfW - 28);
    doc.text(nameFit[0], margin + 24, infoY + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...clrDark);
    doc.text('Email:', margin + 6, infoY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    const emailFit = doc.splitTextToSize(userEmail, halfW - 28);
    doc.text(emailFit[0], margin + 24, infoY + 22);

    // Right panel: Title & Topic
    const rx = margin + halfW + 10;
    const daysSelected = [...new Set(selectedSessions.map((s) => s.day))];
    const topicLabel = daysSelected
      .map((d) => effectiveDayLabels[d] || d)
      .join(' / ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Title:', rx, infoY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...clrMid);
    doc.text('Trust and Safety India Festival 2026', rx + 13, infoY + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...clrDark);
    doc.text('Topic:', rx, infoY + 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...clrOrange);
    const topicFit = doc.splitTextToSize(topicLabel, halfW - 22);
    doc.text(topicFit, rx + 13, infoY + 22);

    // ─── SESSION TABLE ────────────────────────────────────
    const tableData = selectedSessions.map((s) => {
      const title = s.title || '';
      const desc = s.description
        ? doc.splitTextToSize(s.description, 72).slice(0, 3).join('\n')
        : '';
      const speakersArr = Array.isArray(s.speakers)
        ? s.speakers
        : s.speakers
          ? [s.speakers]
          : [];
      const speakerBullets = speakersArr
        .map((sp) => `\u2022 ${sp}`)
        .join('\n');
      const topic = desc
        ? desc + (speakerBullets ? '\n' + speakerBullets : '')
        : speakerBullets;
      const venue = s.venue || s.track || '–';
      const time = s.time || 'TBD';
      return [title, topic, venue, time];
    });

    autoTable(doc, {
      startY: infoY + infoH + 6,
      head: [['Agenda', 'Topic', 'Presenter / Hall', 'Time']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: clrTan,
        textColor: clrDark,
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
      },
      styles: {
        cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
        fontSize: 9,
        valign: 'top',
        font: 'helvetica',
        lineColor: clrBorder,
        lineWidth: 0.3,
      },
      bodyStyles: { textColor: clrDark },
      alternateRowStyles: { fillColor: clrRowAlt },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 82 },
        2: { cellWidth: 32 },
        3: { cellWidth: 23 },
      },
      didDrawPage: () => {
        // Footer
        const footerY = pageH - 10;
        doc.setDrawColor(...clrBorder);
        doc.setLineWidth(0.4);
        doc.line(margin, footerY - 4, pageW - margin, footerY - 4);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...clrMid);
        doc.text('info@csrindia.org', margin, footerY);
        doc.text('+91 11 2468 2556', pageW / 2, footerY, { align: 'center' });
        doc.text('jamsaq.in', pageW - margin, footerY, { align: 'right' });
      },
    });

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

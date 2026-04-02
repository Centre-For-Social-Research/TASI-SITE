'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, CheckCircle2, Circle } from 'lucide-react';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

const { sortProgrammeSessionsForAgenda } = programmeAgendaUtils;

const DAY_LABELS_FALLBACK = {
  oct6: 'Oct 13 - Opening Reception',
  oct7: 'Oct 14 - Conference Day 1',
  oct8: 'Oct 15 - Conference Day 2',
};

export default function BuildMyAgenda({
  sessions,
  isOpen,
  onClose,
  dayLabels,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState('');

  const effectiveDayLabels = dayLabels || DAY_LABELS_FALLBACK;
  const sortedSessions = sortProgrammeSessionsForAgenda(sessions);

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

    const selectedSessions = sortedSessions.filter((s) =>
      selectedIds.has(s.id)
    );
    generatePDF(name.trim(), email.trim(), selectedSessions);
  };

  const generatePDF = async (userName, userEmail, selectedSessions) => {
    let logoDataUrl = null;
    try {
      const resp = await fetch('/img/tasi-csr-logo.png');
      const blob = await resp.blob();
      logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    const navy = [22, 36, 71];
    const orange = [194, 65, 12];
    const stone = [238, 235, 229];
    const rowBg = [251, 249, 246];
    const white = [255, 255, 255];
    const dark = [22, 20, 18];
    const mid = [95, 89, 82];
    const light = [165, 160, 153];
    const rule = [215, 211, 205];

    const fonts = {
      bold: (size) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
      },
      normal: (size) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
      },
    };
    const setColor = (color) => doc.setTextColor(color[0], color[1], color[2]);

    const stripeHeight = 9;
    const headerHeight = 50;
    const infoHeight = 38;
    const gap = 4;
    const tableHeaderHeight = 11;
    const rowGap = 2.5;
    const cellPadding = 5;
    const lineHeight = 5;
    const footerHeight = 14;

    const columns = [44, 80, 32, 24];

    doc.setFillColor(...orange);
    doc.rect(0, 0, pageWidth, stripeHeight, 'F');
    fonts.bold(8.5);
    doc.setTextColor(...white);
    doc.text(
      'TRUST & SAFETY INDIA FESTIVAL 2026  ·  PERSONALIZED AGENDA',
      pageWidth / 2,
      stripeHeight - 3,
      { align: 'center' }
    );

    const headerY = stripeHeight + 4;
    doc.setFillColor(...stone);
    doc.roundedRect(margin, headerY, contentWidth, headerHeight, 3, 3, 'F');

    if (logoDataUrl) {
      doc.addImage(
        logoDataUrl,
        'PNG',
        margin + 6,
        headerY + (headerHeight - 21) / 2,
        58,
        21
      );
    } else {
      fonts.bold(13);
      setColor(orange);
      doc.text('TASI 2026', margin + 8, headerY + 20);
    }

    const separatorX = margin + 70;
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.35);
    doc.line(separatorX, headerY + 6, separatorX, headerY + headerHeight - 6);

    const metaX1 = separatorX + 8;
    const metaItemWidth = (margin + contentWidth - 6 - metaX1) / 3;
    const metaX2 = metaX1 + metaItemWidth;
    const metaX3 = metaX2 + metaItemWidth;
    const metaRowY = headerY + 18;

    const drawMeta = (x, y, label, value, valueBold) => {
      fonts.bold(7.5);
      setColor(light);
      doc.text(label.toUpperCase(), x, y);
      if (valueBold) fonts.bold(9);
      else fonts.normal(9);
      setColor(dark);
      doc.text(value, x, y + 5.5);
    };

    drawMeta(metaX1, metaRowY, 'Date', '13 - 14 October 2026', true);
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.25);
    doc.line(metaX2 - 4, headerY + 10, metaX2 - 4, headerY + headerHeight - 10);
    drawMeta(metaX2, metaRowY, 'Time', '9:00 am - 5:30 pm', false);
    doc.line(metaX3 - 4, headerY + 10, metaX3 - 4, headerY + headerHeight - 10);
    drawMeta(metaX3, metaRowY, 'Website', 'jamsaq.in', false);

    const infoY = headerY + headerHeight + gap;
    doc.setFillColor(...stone);
    doc.roundedRect(margin, infoY, contentWidth, infoHeight, 3, 3, 'F');
    doc.setFillColor(...orange);
    doc.roundedRect(margin, infoY, 3, infoHeight, 1.5, 1.5, 'F');

    const halfWidth = (contentWidth - 6) / 2;
    const leftX = margin + 10;
    const rightX = margin + 10 + halfWidth + 4;

    fonts.bold(7.5);
    setColor(light);
    doc.text('ATTENDEE', leftX, infoY + 8);
    doc.text('NAME', leftX, infoY + 19.5);
    fonts.normal(9.5);
    setColor(dark);
    doc.text(
      doc.splitTextToSize(userName, halfWidth - 6)[0] || '',
      leftX,
      infoY + 25.5
    );
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.25);
    doc.line(leftX, infoY + 27.5, margin + halfWidth + 6, infoY + 27.5);

    fonts.bold(7.5);
    setColor(light);
    doc.text('EMAIL', leftX + 46, infoY + 19.5);
    fonts.normal(9);
    setColor(mid);
    doc.text(
      doc.splitTextToSize(userEmail, halfWidth - 6)[0] || '',
      leftX + 46,
      infoY + 25.5
    );
    doc.line(
      leftX + 46,
      infoY + 27.5,
      margin + halfWidth + 6 + halfWidth - 6,
      infoY + 27.5
    );

    doc.line(
      margin + halfWidth + 6,
      infoY + 6,
      margin + halfWidth + 6,
      infoY + infoHeight - 6
    );

    const daysSelected = [
      ...new Set(selectedSessions.map((session) => session.day)),
    ];
    const topicLabel = daysSelected
      .map((day) => effectiveDayLabels[day] || day)
      .join(' / ');

    fonts.bold(7.5);
    setColor(light);
    doc.text('EVENT', rightX, infoY + 8);
    fonts.bold(9.5);
    setColor(dark);
    doc.text('Trust And Safety India Festival 2026', rightX, infoY + 15);
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.25);
    doc.line(rightX, infoY + 17.5, margin + contentWidth - 6, infoY + 17.5);

    fonts.bold(7.5);
    setColor(light);
    doc.text('YOUR SELECTED DAYS', rightX, infoY + 22);
    fonts.bold(9.5);
    setColor(orange);
    const topicLines = doc.splitTextToSize(topicLabel, halfWidth - 6);
    doc.text(topicLines.slice(0, 2), rightX, infoY + 28);

    let currentY = infoY + infoHeight + gap;

    const drawTableHeader = (y) => {
      doc.setFillColor(...navy);
      doc.roundedRect(margin, y, contentWidth, tableHeaderHeight, 2, 2, 'F');
      fonts.bold(9.5);
      doc.setTextColor(...white);
      const labels = ['Agenda', 'Topic', 'Speaker', 'Time'];
      let x = margin + cellPadding;
      labels.forEach((label, index) => {
        doc.text(label, x, y + 7.5);
        x += columns[index];
      });
      return y + tableHeaderHeight + rowGap;
    };

    currentY = drawTableHeader(currentY);

    const drawFooter = (pageNum, totalPages) => {
      const footerY = pageHeight - footerHeight + 2;
      doc.setDrawColor(...orange);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY, pageWidth - margin, footerY);

      fonts.normal(7.5);
      setColor(light);
      doc.text('info@csrindia.org', margin, footerY + 5);
      doc.text('+91 11 2468 2556', pageWidth / 2, footerY + 5, {
        align: 'center',
      });
      doc.text('jamsaq.in', pageWidth - margin, footerY + 5, {
        align: 'right',
      });

      fonts.bold(7.5);
      setColor(light);
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        footerY + 10,
        {
          align: 'center',
        }
      );
    };

    selectedSessions.forEach((session) => {
      const title = session.title || '';
      const speakersArr = Array.isArray(session.speakers)
        ? session.speakers
        : session.speakers
          ? [session.speakers]
          : [];
      const description = session.description || '';
      const venue = session.venue || session.track || '';
      const time = session.time || 'TBD';

      fonts.normal(8.5);
      let topicCellLines = [];
      if (description) {
        const wrappedDescription = doc.splitTextToSize(
          description,
          columns[1] - 2 * cellPadding
        );
        topicCellLines.push(...wrappedDescription.slice(0, 4));
      }
      if (topicCellLines.length === 0) topicCellLines = ['-'];

      fonts.bold(9.5);
      const titleLines = doc.splitTextToSize(
        title,
        columns[0] - 2 * cellPadding
      );

      fonts.bold(8.5);
      const speakerColumnLines =
        speakersArr.length > 0
          ? speakersArr
              .slice(0, 4)
              .flatMap((speaker) =>
                doc
                  .splitTextToSize(speaker, columns[2] - 2 * cellPadding)
                  .slice(0, 2)
              )
          : [venue || '-'];

      const maxLines = Math.max(
        titleLines.length,
        topicCellLines.length,
        speakerColumnLines.length,
        1
      );
      const rowHeight = Math.max(maxLines * lineHeight + 2 * cellPadding, 18);

      if (currentY + rowHeight > pageHeight - footerHeight - 4) {
        doc.addPage();
        doc.setFillColor(...orange);
        doc.rect(0, 0, pageWidth, stripeHeight, 'F');
        fonts.bold(8.5);
        doc.setTextColor(...white);
        doc.text(
          'TRUST & SAFETY INDIA FESTIVAL 2026  ·  PERSONALIZED AGENDA',
          pageWidth / 2,
          stripeHeight - 3,
          { align: 'center' }
        );
        currentY = stripeHeight + 4;
        currentY = drawTableHeader(currentY);
      }

      doc.setFillColor(...rowBg);
      doc.roundedRect(margin, currentY, contentWidth, rowHeight, 2, 2, 'F');

      doc.setFillColor(...orange);
      doc.roundedRect(margin, currentY, 2.5, rowHeight, 1, 1, 'F');

      doc.setDrawColor(...rule);
      doc.setLineWidth(0.2);
      let dividerX = margin + columns[0];
      [0, 1, 2].forEach((index) => {
        doc.line(dividerX, currentY + 3, dividerX, currentY + rowHeight - 3);
        dividerX += columns[index + 1];
      });

      const textY = currentY + cellPadding + 3.5;

      fonts.bold(9.5);
      setColor(dark);
      doc.text(titleLines, margin + cellPadding + 2, textY);

      if (topicCellLines.length > 0 && topicCellLines[0] !== '-') {
        fonts.normal(8.5);
        setColor(mid);
        doc.text(topicCellLines, margin + columns[0] + cellPadding, textY);
      } else {
        fonts.normal(8.5);
        setColor(light);
        doc.text('-', margin + columns[0] + cellPadding, textY);
      }

      const speakerX = margin + columns[0] + columns[1] + cellPadding;
      if (speakersArr.length > 0) {
        let speakerY = textY;
        speakersArr.slice(0, 4).forEach((speaker, index) => {
          if (index === 0) {
            fonts.bold(8.5);
            setColor(dark);
          } else {
            fonts.normal(7.8);
            setColor(mid);
          }
          const speakerLines = doc
            .splitTextToSize(speaker, columns[2] - 2 * cellPadding)
            .slice(0, 2);
          doc.text(speakerLines, speakerX, speakerY);
          speakerY += speakerLines.length * lineHeight;
        });
      } else {
        fonts.normal(8.5);
        setColor(light);
        doc.text(venue || '-', speakerX, textY);
      }

      fonts.bold(9);
      setColor(orange);
      doc.text(
        time,
        margin + columns[0] + columns[1] + columns[2] + cellPadding,
        textY
      );

      currentY += rowHeight + rowGap;
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      drawFooter(page, totalPages);
    }

    doc.save('TASI-2026-My-Agenda.pdf');
  };

  const groupedSessions = sortedSessions.reduce((acc, session) => {
    if (!acc[session.day]) acc[session.day] = [];
    acc[session.day].push(session);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100">
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-bold tracking-tight">Build My Agenda</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Select the sessions you plan to attend and generate a personalized
            printable PDF agenda.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 dark:border-stone-800 dark:bg-stone-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                Email Address
              </label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 dark:border-stone-800 dark:bg-stone-900"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mt-2 space-y-8">
            {['oct6', 'oct7', 'oct8'].map((dayKey) => {
              const daySessions = groupedSessions[dayKey];
              if (!daySessions || daySessions.length === 0) return null;

              return (
                <div key={dayKey}>
                  <h3 className="mb-3 border-b border-stone-100 pb-2 text-sm font-black uppercase tracking-widest text-orange-700 dark:border-stone-800 dark:text-orange-500">
                    {effectiveDayLabels[dayKey] || dayKey}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {daySessions.map((session) => {
                      const isSelected = selectedIds.has(session.id);
                      return (
                        <div
                          key={session.id}
                          onClick={() => handleToggle(session.id)}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                            isSelected
                              ? 'border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20'
                              : 'border-stone-200 bg-white hover:border-orange-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-orange-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-stone-300 dark:text-stone-700" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="shrink-0 text-xs font-bold text-stone-900 dark:text-stone-300">
                                {session.time}
                              </span>
                              <span className="shrink-0 rounded-md bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800">
                                {session.venue || session.track}
                              </span>
                            </div>
                            <h4 className="mb-1 text-sm font-semibold leading-snug text-stone-800 dark:text-stone-200">
                              {session.title}
                            </h4>
                            {session.speakers && (
                              <p className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
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

        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 p-4 sm:px-6 sm:py-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="text-sm font-medium text-stone-500">
            {selectedIds.size} session{selectedIds.size !== 1 && 's'} selected
          </div>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

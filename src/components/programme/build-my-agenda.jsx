'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Download, CheckCircle2, Circle } from 'lucide-react';

const DAY_LABELS = {
  oct6: 'October 6, 2025',
  oct7: 'October 7, 2025',
  oct8: 'October 8, 2025',
};

export default function BuildMyAgenda({ sessions, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState('');

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

    // Maintain chronological order as defined in the source
    const selectedSessions = sessions.filter((s) => selectedIds.has(s.id));
    generatePDF(name.trim(), email.trim(), selectedSessions);
  };

  const generatePDF = (userName, userEmail, selectedSessions) => {
    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(194, 65, 12); // Coral color
    doc.text('TASI 2026', 14, 22);

    doc.setTextColor(28, 25, 23); // Dark brown/gray
    doc.setFontSize(16);
    doc.text('Personalized Agenda', 14, 32);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${userName}`, 14, 42);
    doc.text(`Email: ${userEmail}`, 14, 48);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 54);

    const tableData = selectedSessions.map((s) => {
      const dayStr = DAY_LABELS[s.day] || s.day;
      const timeStr = s.time || 'TBD';
      const titleStr = s.title || '';
      const speakersStr = Array.isArray(s.speakers)
        ? s.speakers.join(', ')
        : s.speakers || '';
      const venueStr = s.venue || s.track || '';

      return [`${dayStr}\n${timeStr}`, titleStr, speakersStr, venueStr];
    });

    autoTable(doc, {
      startY: 62,
      head: [['Date & Time', 'Session Title', 'Speaker(s)', 'Venue/Hall']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [194, 65, 12], textColor: 255 },
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle',
        font: 'helvetica',
      },
      bodyStyles: { textColor: 50 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35 },
      },
      didDrawPage: (data) => {
        // Footer: Page number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(
          `Page ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      },
    });

    doc.save('TASI-2026-Agenda.pdf');
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
                    {DAY_LABELS[dayKey] || dayKey}
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

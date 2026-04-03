'use client';

import { useState } from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { X, Download, CheckCircle2, Circle } from 'lucide-react';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

const { sortProgrammeSessionsForAgenda } = programmeAgendaUtils;

const DAY_LABELS_FALLBACK = {
  oct6: 'Oct 13 - Opening Reception',
  oct7: 'Oct 14 - Conference Day 1',
  oct8: 'Oct 15 - Conference Day 2',
};

// ── REACT PDF AGENDA DOCUMENT ─────────────────────────────────────────────
// Colors (pt-based layout for A4)
const AGENDA_ORANGE = '#c2410c';
const AGENDA_NAVY   = '#162447';
const AGENDA_STONE  = '#eeebe5';
const AGENDA_ROWBG  = '#fbf9f6';
const AGENDA_DARK   = '#161412';
const AGENDA_MID    = '#5f5952';
const AGENDA_LIGHT  = '#a5a099';
const AGENDA_RULE   = '#d7d3cd';

// Dimensions in pt (1mm = 2.835pt)
const AG_MARGIN    = 42.5;  // 15mm
const AG_STRIPE_H  = 25.5;  // 9mm
const AG_TABLE_H   = 31.2;  // 11mm
const AG_FOOTER_H  = 39.7;  // 14mm
const AG_COL_W     = [124.7, 226.8, 90.7, 68]; // column widths in pt
const AG_CELL_PAD  = 14.2;  // 5mm

function AgendaDocument({ userName, userEmail, selectedSessions, effectiveDayLabels, logoDataUrl }) {
  const daysSelected = [...new Set(selectedSessions.map((s) => s.day))];
  const topicLabel = daysSelected.map((d) => effectiveDayLabels[d] || d).join(' / ');

  return (
    <Document>
      <Page
        size="A4"
        style={{ fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingTop: AG_STRIPE_H + 11.3, paddingBottom: AG_FOOTER_H, paddingHorizontal: AG_MARGIN }}
      >
        {/* Fixed orange stripe */}
        <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, height: AG_STRIPE_H, backgroundColor: AGENDA_ORANGE, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-BoldOblique', color: '#ffffff' }}>
            TRUST &amp; SAFETY INDIA FESTIVAL 2026  ·  PERSONALIZED AGENDA
          </Text>
        </View>

        {/* Fixed footer */}
        <View fixed style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: AG_FOOTER_H, borderTopWidth: 1.5, borderTopColor: AGENDA_ORANGE, paddingTop: 5, paddingHorizontal: AG_MARGIN }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 7.5, color: AGENDA_LIGHT }}>info@csrindia.org</Text>
            <Text style={{ fontSize: 7.5, color: AGENDA_LIGHT }}>+91 11 2468 2556</Text>
            <Text style={{ fontSize: 7.5, color: AGENDA_LIGHT }}>jamsaq.in</Text>
          </View>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, textAlign: 'center', marginTop: 5 }}
            fixed
          />
        </View>

        {/* Header card (first page only) */}
        <View style={{ backgroundColor: AGENDA_STONE, borderRadius: 8.5, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 11.3 }}>
          {logoDataUrl ? (
            <Image src={logoDataUrl} style={{ width: 130, height: 44, marginRight: 17 }} />
          ) : (
            <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: AGENDA_ORANGE, marginRight: 17 }}>TASI 2026</Text>
          )}
          <View style={{ width: 1, height: 84, backgroundColor: AGENDA_RULE, marginRight: 17 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 4 }}>DATE</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: AGENDA_DARK }}>13 – 14 October 2026</Text>
          </View>
          <View style={{ width: 1, height: 80, backgroundColor: AGENDA_RULE, marginHorizontal: 11 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 4 }}>TIME</Text>
            <Text style={{ fontSize: 9, color: AGENDA_DARK }}>9:00 am – 5:30 pm</Text>
          </View>
          <View style={{ width: 1, height: 80, backgroundColor: AGENDA_RULE, marginHorizontal: 11 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 4 }}>WEBSITE</Text>
            <Text style={{ fontSize: 9, color: AGENDA_DARK }}>jamsaq.in</Text>
          </View>
        </View>

        {/* Info card (first page only) */}
        <View style={{ backgroundColor: AGENDA_STONE, borderRadius: 8.5, flexDirection: 'row', alignItems: 'stretch', marginBottom: 11.3, overflow: 'hidden' }}>
          <View style={{ width: 8.5, backgroundColor: AGENDA_ORANGE }} />
          <View style={{ flex: 1, padding: AG_CELL_PAD }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 14 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 3 }}>ATTENDEE</Text>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 3 }}>NAME</Text>
                <Text style={{ fontSize: 9.5, color: AGENDA_DARK }}>{userName}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: AGENDA_RULE, marginRight: 14 }} />
              <View style={{ flex: 1, marginRight: 14 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 3 }}>EMAIL</Text>
                <Text style={{ fontSize: 9, color: AGENDA_MID }}>{userEmail}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: AGENDA_RULE, marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 3 }}>EVENT</Text>
                <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: AGENDA_DARK, marginBottom: 4 }}>Trust And Safety India Festival 2026</Text>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: AGENDA_LIGHT, marginBottom: 3 }}>YOUR SELECTED DAYS</Text>
                <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: AGENDA_ORANGE }}>{topicLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Table header */}
        <View style={{ backgroundColor: AGENDA_NAVY, borderRadius: 5.7, height: AG_TABLE_H, flexDirection: 'row', alignItems: 'center', marginBottom: 7, paddingLeft: AG_CELL_PAD }}>
          {['Agenda', 'Topic', 'Speaker', 'Time'].map((label, i) => (
            <Text key={i} style={{ width: AG_COL_W[i], fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>{label}</Text>
          ))}
        </View>

        {/* Session rows */}
        {selectedSessions.map((session, idx) => {
          const title       = session.title || '';
          const description = session.description || '';
          const speakersArr = Array.isArray(session.speakers)
            ? session.speakers
            : session.speakers ? [session.speakers] : [];
          const venue = session.venue || session.track || '';
          const time  = session.time || 'TBD';

          return (
            <View key={idx} wrap={false} style={{ flexDirection: 'row', backgroundColor: AGENDA_ROWBG, borderRadius: 5.7, marginBottom: 7 }}>
              <View style={{ width: 7.1, backgroundColor: AGENDA_ORANGE, borderRadius: 2.8 }} />
              {/* Col 1: Title */}
              <View style={{ width: AG_COL_W[0], padding: AG_CELL_PAD }}>
                <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: AGENDA_DARK }}>{title}</Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: AGENDA_RULE, marginVertical: 8.5 }} />
              {/* Col 2: Description */}
              <View style={{ width: AG_COL_W[1], padding: AG_CELL_PAD }}>
                {description
                  ? <Text style={{ fontSize: 8.5, color: AGENDA_MID }}>{description}</Text>
                  : <Text style={{ fontSize: 8.5, color: AGENDA_LIGHT }}>-</Text>}
              </View>
              <View style={{ width: 0.5, backgroundColor: AGENDA_RULE, marginVertical: 8.5 }} />
              {/* Col 3: Speakers */}
              <View style={{ width: AG_COL_W[2], padding: AG_CELL_PAD }}>
                {speakersArr.length > 0
                  ? speakersArr.slice(0, 4).map((speaker, si) => (
                      <Text key={si} style={{ fontSize: si === 0 ? 8.5 : 7.8, fontFamily: si === 0 ? 'Helvetica-Bold' : 'Helvetica', color: si === 0 ? AGENDA_DARK : AGENDA_MID, marginBottom: si < speakersArr.length - 1 ? 2 : 0 }}>
                        {speaker}
                      </Text>
                    ))
                  : <Text style={{ fontSize: 8.5, color: AGENDA_LIGHT }}>{venue || '-'}</Text>}
              </View>
              <View style={{ width: 0.5, backgroundColor: AGENDA_RULE, marginVertical: 8.5 }} />
              {/* Col 4: Time */}
              <View style={{ width: AG_COL_W[3], padding: AG_CELL_PAD }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: AGENDA_ORANGE }}>{time}</Text>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
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

    const { pdf } = await import('@react-pdf/renderer');

    const blob = await pdf(
      <AgendaDocument
        userName={userName}
        userEmail={userEmail}
        selectedSessions={selectedSessions}
        effectiveDayLabels={effectiveDayLabels}
        logoDataUrl={logoDataUrl}
      />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TASI-2026-My-Agenda.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
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

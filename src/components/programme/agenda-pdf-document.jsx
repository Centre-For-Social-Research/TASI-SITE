import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import agendaBuilderUtils from '@/lib/agenda-builder-utils.cjs';

const {
  findAgendaClashes,
  formatDayHeading,
  formatSelectedDateRange,
  getDaySubtitle,
  getSessionDescription,
  getSessionSpeakerNames,
  parseTimeRange,
  formatClock,
} = agendaBuilderUtils;

// A4 in pt. Colours follow the programme page palette.
const ACCENT = '#1d4ed8';
const INK = '#1c1917';
const BODY = '#57534e';
const MUTED = '#a8a29e';
const RULE = '#e7e5e4';
const TINT = '#fafaf9';
const AMBER = '#b45309';

const MARGIN = 40;
const TIME_COL = 74;
const LOGO_W = 84;
const LOGO_H = (LOGO_W * 153) / 281; // keep the logo's native aspect ratio

function truncate(text, max) {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function Label({ children }) {
  return (
    <Text
      style={{
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: MUTED,
        letterSpacing: 1,
        marginBottom: 3,
      }}
    >
      {children}
    </Text>
  );
}

function SessionRow({ session, clashesWith, formatLabels }) {
  const range = parseTimeRange(session.time);
  const speakers = getSessionSpeakerNames(session);
  const description = getSessionDescription(session);
  const meta = [session.venue || session.track, formatLabels[session.format]]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View
      wrap={false}
      style={{
        flexDirection: 'row',
        paddingVertical: 9,
        borderBottomWidth: 0.75,
        borderBottomColor: RULE,
      }}
    >
      <View style={{ width: TIME_COL }}>
        <Text
          style={{
            fontSize: 10.5,
            fontFamily: 'Helvetica-Bold',
            color: ACCENT,
          }}
        >
          {range ? formatClock(range.start) : session.time || 'TBD'}
        </Text>
        {range?.hasExplicitEnd && (
          <Text style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>
            to {formatClock(range.end)}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10.5,
            fontFamily: 'Helvetica-Bold',
            color: INK,
            lineHeight: 1.3,
          }}
        >
          {session.title}
        </Text>
        {meta ? (
          <Text style={{ fontSize: 8, color: MUTED, marginTop: 3 }}>
            {meta}
          </Text>
        ) : null}
        {description ? (
          <Text
            style={{
              fontSize: 8.5,
              color: BODY,
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            {truncate(description, 240)}
          </Text>
        ) : null}
        {speakers.length > 0 && (
          <Text style={{ fontSize: 8.5, color: INK, marginTop: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Speakers: </Text>
            {speakers.join(', ')}
          </Text>
        )}
        {clashesWith.length > 0 && (
          <Text style={{ fontSize: 8, color: AMBER, marginTop: 4 }}>
            Overlaps with {clashesWith.map((s) => s.title).join('; ')}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function AgendaPdfDocument({
  attendeeName,
  sessions,
  dayLabels,
  dayDateMap,
  editionYear,
  formatLabels = {},
  logoDataUrl,
}) {
  const clashes = findAgendaClashes(sessions);
  const dayKeys = Object.keys(dayLabels).filter((key) =>
    sessions.some((session) => session.day === key)
  );
  const eventTitle = `Trust & Safety India Festival ${editionYear}`.trim();
  const dateRange = formatSelectedDateRange(dayKeys, dayDateMap);

  return (
    <Document title={`${eventTitle} - My Agenda`} author="TASI">
      <Page
        size="A4"
        style={{
          fontFamily: 'Helvetica',
          backgroundColor: '#ffffff',
          paddingTop: MARGIN,
          paddingBottom: 60,
          paddingHorizontal: MARGIN,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 14,
            borderBottomWidth: 2,
            borderBottomColor: ACCENT,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 8,
                fontFamily: 'Helvetica-Bold',
                color: ACCENT,
                letterSpacing: 1.5,
              }}
            >
              MY AGENDA
            </Text>
            <Text
              style={{
                fontSize: 17,
                fontFamily: 'Helvetica-Bold',
                color: INK,
                marginTop: 4,
              }}
            >
              {eventTitle}
            </Text>
            <Text style={{ fontSize: 9, color: BODY, marginTop: 3 }}>
              New Delhi, India
            </Text>
          </View>
          {logoDataUrl ? (
            <Image
              alt=""
              src={logoDataUrl}
              style={{ width: LOGO_W, height: LOGO_H }}
            />
          ) : null}
        </View>

        {/* Summary */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: TINT,
            borderRadius: 6,
            marginTop: 14,
            marginBottom: 6,
            paddingVertical: 10,
            paddingHorizontal: 14,
          }}
        >
          {attendeeName ? (
            <View style={{ flex: 1.3 }}>
              <Label>PREPARED FOR</Label>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Helvetica-Bold',
                  color: INK,
                }}
              >
                {attendeeName}
              </Text>
            </View>
          ) : null}
          <View style={{ flex: 1.3 }}>
            <Label>DATES</Label>
            <Text
              style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK }}
            >
              {dateRange || '-'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Label>SESSIONS</Label>
            <Text
              style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK }}
            >
              {sessions.length}
            </Text>
          </View>
        </View>

        {/* Days */}
        {dayKeys.map((dayKey) => {
          const daySessions = sessions.filter((s) => s.day === dayKey);
          const heading = formatDayHeading(dayKey, dayDateMap);
          return (
            <View key={dayKey} style={{ marginTop: 16 }}>
              <View
                wrap={false}
                minPresenceAhead={60}
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  paddingBottom: 6,
                  borderBottomWidth: 0.75,
                  borderBottomColor: INK,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Helvetica-Bold',
                    color: INK,
                  }}
                >
                  {heading || dayLabels[dayKey]}
                </Text>
                <Text style={{ fontSize: 9.5, color: BODY, marginLeft: 8 }}>
                  {getDaySubtitle(dayLabels[dayKey])}
                </Text>
              </View>
              {daySessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  clashesWith={clashes.get(session.id) || []}
                  formatLabels={formatLabels}
                />
              ))}
            </View>
          );
        })}

        {/* Footer */}
        <View
          fixed
          style={{
            position: 'absolute',
            bottom: 24,
            left: MARGIN,
            right: MARGIN,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTopWidth: 0.75,
            borderTopColor: RULE,
          }}
        >
          <Text style={{ fontSize: 7.5, color: MUTED }}>
            trustandsafetyindia.org
          </Text>
          <Text style={{ fontSize: 7.5, color: MUTED }}>
            Timings and rooms may change. Check the website for updates.
          </Text>
          <Text
            style={{ fontSize: 7.5, color: MUTED }}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

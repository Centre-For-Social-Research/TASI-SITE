'use client';

import { useState } from 'react';
import { BadgeCheck, Images } from 'lucide-react';
import SpeakerCommunicationsPanel from '@/components/admin/speaker-communications-panel';
import SpeakerPhotosPanel from '@/components/admin/speaker-photos-panel';

const TABS = [
  { key: 'badges', label: 'Badges', icon: BadgeCheck },
  { key: 'photos', label: 'Photos', icon: Images },
];

// Each tab keeps its own data and send history; switching only changes
// which panel is shown.
export default function SpeakerCommunicationsTabs({
  canManage,
  operatorEmail,
}) {
  const [tab, setTab] = useState('badges');

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div
        role="tablist"
        aria-label="Speaker communications"
        style={{
          display: 'inline-flex',
          justifySelf: 'start',
          gap: 4,
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--adm-line)',
          background: 'var(--adm-panel)',
        }}
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: 9,
                border: 0,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: active ? 'var(--adm-accent)' : 'transparent',
                color: active ? 'var(--adm-accent-ink)' : 'var(--adm-ink-2)',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {tab === 'badges' ? (
        <SpeakerCommunicationsPanel
          canManage={canManage}
          operatorEmail={operatorEmail}
        />
      ) : (
        <SpeakerPhotosPanel
          canManage={canManage}
          operatorEmail={operatorEmail}
        />
      )}
    </div>
  );
}

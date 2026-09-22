'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, FileSpreadsheet, Inbox, Search, X } from 'lucide-react';
import {
  AdminAlert,
  AdminStatusBadge,
  SlideOverDrawer,
} from '@/components/admin/admin-ui';
import cacheUtils from '@/lib/admin-registration-cache.cjs';

const { createMemoryCache, DEFAULT_LIST_TTL_MS } = cacheUtils;
const listCache = createMemoryCache({ ttlMs: DEFAULT_LIST_TTL_MS });

const TYPES = [
  { key: 'speaker', label: 'Speakers' },
  { key: 'volunteer', label: 'Volunteers' },
  { key: 'media', label: 'Media' },
  { key: 'exhibition', label: 'Exhibition' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'confirmation', label: 'Confirmation requests' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function buttonStyle(primary = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    padding: '9px 13px',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--adm-mono)',
    letterSpacing: '.04em',
    border: `1px solid ${primary ? 'var(--adm-accent)' : 'var(--adm-line-strong)'}`,
    background: primary ? 'var(--adm-accent)' : 'var(--adm-panel)',
    color: primary ? 'var(--adm-accent-ink)' : 'var(--adm-ink)',
  };
}

function inputStyle() {
  return {
    border: '1px solid var(--adm-line-strong)',
    borderRadius: 10,
    background: 'var(--adm-panel)',
    color: 'var(--adm-ink)',
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    minHeight: 40,
  };
}

export default function SubmissionsPanel() {
  const [type, setType] = useState('speaker');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({
    data: [],
    meta: { total: 0, totalPages: 1 },
  });
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      type,
      page: String(page),
      pageSize: '50',
    });
    if (search) params.set('search', search);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    return params.toString();
  }, [type, page, search, dateFrom, dateTo]);

  const load = useCallback(
    async (force = false) => {
      const cached = !force && listCache.get(queryString);
      if (cached) {
        setResult(cached);
        setCounts((previous) => ({
          ...previous,
          [cached.meta.type]: cached.meta.total,
        }));
        setLoading(false);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/submissions?${queryString}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const json = await response.json();
        if (!response.ok || !json.ok)
          throw new Error(json.error || 'Unable to load submissions.');
        const next = { data: json.data || [], meta: json.meta || {} };
        listCache.set(queryString, next);
        setResult(next);
        setCounts((previous) => ({
          ...previous,
          [next.meta.type]: next.meta.total,
        }));
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state updates resolve after await or from the short-lived memory cache
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  function switchType(nextType) {
    setType(nextType);
    setPage(1);
    setSelected(null);
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  function exportRows(format) {
    const params = new URLSearchParams({ type, format });
    if (search) params.set('search', search);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    window.location.assign(
      `/api/admin/submissions/export?${params.toString()}`
    );
  }

  const activeLabel =
    TYPES.find((item) => item.key === type)?.label || 'Submissions';
  const firstRow = (result.meta.page - 1) * (result.meta.pageSize || 50) + 1;
  const lastRow = Math.min(
    result.meta.total || 0,
    firstRow + result.data.length - 1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section
        style={{
          border: '1px solid var(--adm-line)',
          borderRadius: 10,
          background: 'var(--adm-panel)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 20px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="adm-eyebrow">Website inbox</div>
              <h2
                style={{
                  margin: '5px 0 0',
                  fontSize: 22,
                  color: 'var(--adm-ink)',
                }}
              >
                Submissions
              </h2>
              <p
                style={{
                  margin: '6px 0 0',
                  color: 'var(--adm-ink-3)',
                  fontSize: 13,
                }}
              >
                Read-only view of enquiries and applications received through
                the website.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                style={buttonStyle()}
                onClick={() => exportRows('csv')}
              >
                <Download size={14} /> CSV
              </button>
              <button
                type="button"
                style={buttonStyle(true)}
                onClick={() => exportRows('xlsx')}
              >
                <FileSpreadsheet size={14} /> Excel
              </button>
            </div>
          </div>
          <div
            role="tablist"
            aria-label="Submission type"
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              marginTop: 20,
              borderBottom: '1px solid var(--adm-line)',
            }}
          >
            {TYPES.map((item) => {
              const active = item.key === type;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchType(item.key)}
                  style={{
                    border: 0,
                    borderBottom: active
                      ? '2px solid var(--adm-accent)'
                      : '2px solid transparent',
                    background: 'transparent',
                    color: active ? 'var(--adm-ink)' : 'var(--adm-ink-3)',
                    padding: '11px 12px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item.label}
                  {counts[item.key] !== undefined
                    ? ` · ${counts[item.key]}`
                    : ''}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            padding: 18,
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) 160px 160px auto',
            gap: 10,
          }}
          className="adm-submission-filters"
        >
          <label style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: 13,
                color: 'var(--adm-ink-3)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <input
              className="adm-submission-search-input"
              aria-label="Search submissions"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email, organisation…"
              style={{ ...inputStyle(), width: '100%' }}
            />
          </label>
          <input
            aria-label="From date"
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
            style={inputStyle()}
          />
          <input
            aria-label="To date"
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
            style={inputStyle()}
          />
          <button type="button" onClick={clearFilters} style={buttonStyle()}>
            <X size={14} /> Clear
          </button>
        </div>
      </section>

      {error ? (
        <AdminAlert
          tone="danger"
          title="Could not load submissions"
          description={error}
          actions={
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => load(true)}
            >
              Try again
            </button>
          }
        />
      ) : null}

      <section
        style={{
          border: '1px solid var(--adm-line)',
          borderRadius: 10,
          background: 'var(--adm-panel)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--adm-line)',
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--adm-ink)' }}
          >
            {activeLabel}
          </div>
          <AdminStatusBadge tone="info">
            {result.meta.total || 0} matched
          </AdminStatusBadge>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}
          >
            <thead>
              <tr>
                {['Applicant', 'Email', 'Context', 'Submitted', ''].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '11px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--adm-line)',
                        color: 'var(--adm-ink-3)',
                        fontFamily: 'var(--adm-mono)',
                        fontSize: 10,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td
                        colSpan={5}
                        style={{
                          padding: 14,
                          borderBottom: '1px solid var(--adm-line)',
                        }}
                      >
                        <div
                          style={{
                            height: 15,
                            width: `${74 - index * 4}%`,
                            borderRadius: 10,
                            background: 'var(--adm-panel-2)',
                            animation:
                              'adm-skeleton-pulse 1.4s ease-in-out infinite',
                          }}
                        />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && !result.data.length ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '54px 20px',
                      textAlign: 'center',
                      color: 'var(--adm-ink-3)',
                    }}
                  >
                    <Inbox size={28} style={{ margin: '0 auto 10px' }} />
                    <div>No matching submissions found.</div>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                result.data.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    style={{ borderBottom: '1px solid var(--adm-line)' }}
                  >
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink)',
                        fontWeight: 500,
                      }}
                    >
                      {item.name}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <a
                        href={`mailto:${item.email}`}
                        style={{
                          color: 'var(--adm-info)',
                          textDecoration: 'none',
                        }}
                      >
                        {item.email}
                      </a>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-2)',
                        maxWidth: 280,
                      }}
                    >
                      {item.context || '—'}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-3)',
                        whiteSpace: 'nowrap',
                        fontSize: 12,
                      }}
                    >
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        style={buttonStyle()}
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: '13px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            color: 'var(--adm-ink-3)',
            fontSize: 12,
          }}
        >
          <span>
            {result.meta.total
              ? `${firstRow}–${lastRow} of ${result.meta.total}`
              : '0 results'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              style={buttonStyle()}
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              style={buttonStyle()}
              disabled={page >= (result.meta.totalPages || 1) || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <SlideOverDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name || 'Submission details'}
      >
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <AdminStatusBadge tone="accent">{activeLabel}</AdminStatusBadge>
              <div
                style={{
                  marginTop: 10,
                  color: 'var(--adm-ink-3)',
                  fontSize: 12,
                }}
              >
                {formatDate(selected.createdAt)}
              </div>
            </div>
            <div
              style={{
                border: '1px solid var(--adm-line)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {selected.fields.map((field) => (
                <div
                  key={field.label}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--adm-line)',
                  }}
                >
                  <div className="adm-eyebrow">{field.label}</div>
                  <div
                    style={{
                      marginTop: 5,
                      color: 'var(--adm-ink)',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.55,
                    }}
                  >
                    {field.value || '—'}
                  </div>
                </div>
              ))}
            </div>
            {selected.rawMessage ? (
              <details>
                <summary
                  style={{
                    cursor: 'pointer',
                    color: 'var(--adm-ink-2)',
                    fontSize: 12,
                  }}
                >
                  View original stored message
                </summary>
                <pre
                  style={{
                    marginTop: 10,
                    padding: 14,
                    borderRadius: 10,
                    background: 'var(--adm-panel-2)',
                    color: 'var(--adm-ink-2)',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    fontSize: 11,
                  }}
                >
                  {selected.rawMessage}
                </pre>
              </details>
            ) : null}
          </div>
        ) : null}
      </SlideOverDrawer>
      <style jsx>{`
        @media (max-width: 900px) {
          .adm-submission-filters {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .adm-submission-filters {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  bpm?: number | null;
  keyText?: string | null;
  release: {
    artist: {
      name: string;
    };
  };
}

type SortField = 'title' | 'artist' | 'bpm' | 'key';
type SortDirection = 'asc' | 'desc';

export default function Admin() {
  const { token, setToken } = useAuth();
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [savingTrackId, setSavingTrackId] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) {
      window.location.href = '/login';
      return;
    }

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    fetch(`${apiBase}/api/v1/admin/ping`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => {
        if (r.ok) {
          setToken(t);
          setVerifying(false);
        } else {
          window.location.href = '/login';
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, [setToken]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      push({ title: 'Search failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    switch (sortField) {
      case 'title':
        aVal = a.title;
        bVal = b.title;
        break;
      case 'artist':
        aVal = a.release.artist.name;
        bVal = b.release.artist.name;
        break;
      case 'bpm':
        aVal = a.bpm ?? 0;
        bVal = b.bpm ?? 0;
        break;
      case 'key':
        aVal = a.keyText ?? '';
        bVal = b.keyText ?? '';
        break;
    }

    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    const comparison =
      typeof aVal === 'string' && typeof bVal === 'string'
        ? aVal.localeCompare(bVal)
        : aVal < bVal
          ? -1
          : aVal > bVal
            ? 1
            : 0;

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSaveBpm = async (
    track: Track,
    newBpm: number | null,
    inputElement: HTMLInputElement,
  ) => {
    const prevBpm = track.bpm;
    track.bpm = newBpm;
    setTracks([...tracks]);
    setSavingTrackId(track.id);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/v1/admin/tracks/${track.id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bpm: newBpm }),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }
    } catch (err) {
      track.bpm = prevBpm;
      setTracks([...tracks]);
      inputElement.value = prevBpm?.toString() ?? '';
      push({
        title: 'Save failed',
        description: 'Could not update BPM',
        status: 'error',
      });
    } finally {
      setSavingTrackId(null);
    }
  };

  const handleSaveKey = async (
    track: Track,
    newKey: string | null,
    inputElement: HTMLInputElement,
  ) => {
    const prevKey = track.keyText;
    track.keyText = newKey;
    setTracks([...tracks]);
    setSavingTrackId(track.id);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/v1/admin/tracks/${track.id}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyText: newKey }),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }
    } catch (err) {
      track.keyText = prevKey;
      setTracks([...tracks]);
      inputElement.value = prevKey ?? '';
      push({
        title: 'Save failed',
        description: 'Could not update Key',
        status: 'error',
      });
    } finally {
      setSavingTrackId(null);
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded"
        aria-label={`Sort by ${field} ${isActive ? sortDirection : 'asc'}`}
      >
        {children}
        {isActive &&
          (sortDirection === 'asc' ? (
            <ArrowUp size={14} aria-hidden="true" />
          ) : (
            <ArrowDown size={14} aria-hidden="true" />
          ))}
      </button>
    );
  };

  if (verifying) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="admin-heading">
      <h1 id="admin-heading" className="text-3xl font-bold">
        Admin
      </h1>

      <form
        onSubmit={handleSearch}
        className="flex gap-2"
        aria-label="Search tracks to edit"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
          placeholder="Find tracks to edit"
          aria-required="true"
          aria-describedby={error ? 'admin-error' : undefined}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div
          id="admin-error"
          role="alert"
          className="p-4 bg-error/10 border border-error rounded-xl text-error"
        >
          {error}
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        <table
          role="grid"
          className="w-full"
          aria-label="Tracks table"
        >
          <thead className="bg-surface2 text-sm">
            <tr>
              <th className="text-left p-3 font-semibold">
                <SortButton field="title">Track</SortButton>
              </th>
              <th className="text-left p-3 font-semibold">
                <SortButton field="artist">Artist</SortButton>
              </th>
              <th className="text-left p-3 font-semibold">
                <SortButton field="bpm">BPM</SortButton>
              </th>
              <th className="text-left p-3 font-semibold">
                <SortButton field="key">Key</SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTracks.length > 0 ? (
              sortedTracks.map((track) => (
                <tr
                  key={track.id}
                  className="border-t border-border hover:bg-surface2"
                >
                  <td className="p-3">{track.title}</td>
                  <td className="p-3">{track.release.artist.name}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="w-20 rounded bg-surface border border-border px-2 py-1 text-text"
                      defaultValue={track.bpm ?? ''}
                      aria-label={`BPM for ${track.title}`}
                      disabled={savingTrackId === track.id}
                      onBlur={(e) => {
                        const bpm = e.currentTarget.value
                          ? Number(e.currentTarget.value)
                          : null;
                        handleSaveBpm(track, bpm, e.currentTarget);
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-20 rounded bg-surface border border-border px-2 py-1 text-text"
                      defaultValue={track.keyText ?? ''}
                      aria-label={`Key for ${track.title}`}
                      disabled={savingTrackId === track.id}
                      onBlur={(e) => {
                        const key = e.currentTarget.value || null;
                        handleSaveKey(track, key, e.currentTarget);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-3 text-center text-muted"
                >
                  No tracks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

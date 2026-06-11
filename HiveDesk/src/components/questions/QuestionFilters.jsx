import React from 'react';
import { Filter, X } from 'lucide-react';

export default function QuestionFilters({ filters, onChange, domains }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });
  const clear = () => onChange({ status: '', domain: '', difficulty: '', search: '' });

  const hasFilters = filters.status || filters.domain || filters.difficulty || filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-hd-muted text-sm">
        <Filter className="w-4 h-4" /> Filters:
      </div>

      <select value={filters.status || ''} onChange={e => update('status', e.target.value)}
        className="bg-hd-raised border border-hd-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="in-review">In Review</option>
        <option value="needs-revision">Needs Revision</option>
        <option value="approved">Approved</option>
        <option value="published">Published</option>
        <option value="rejected">Rejected</option>
      </select>

      <select value={filters.domain || ''} onChange={e => update('domain', e.target.value)}
        className="bg-hd-raised border border-hd-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
        <option value="">All Domains</option>
        {(domains || []).map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select value={filters.difficulty || ''} onChange={e => update('difficulty', e.target.value)}
        className="bg-hd-raised border border-hd-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
        <option value="">All Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <input
        type="text"
        value={filters.search || ''}
        onChange={e => update('search', e.target.value)}
        placeholder="Search questions..."
        className="bg-hd-raised border border-hd-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors w-48"
      />

      {hasFilters && (
        <button onClick={clear} className="p-2 rounded-lg hover:bg-hd-hover text-hd-muted hover:text-hd-secondary transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

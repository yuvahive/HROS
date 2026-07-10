import { useState, useRef } from 'react';
import { Upload, FileText, FileJson, Sheet, CheckCircle2, AlertTriangle, X, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { useAuth } from '../../auth/AuthContext';

const CSV_TEMPLATE = `title,domain,topic,difficulty,tags,notes
"Two Sum","arrays","hash-map","Easy","hash-table,two-pointer","Classic problem"
"Binary Search Tree","searching","bst","Medium","tree,recursion","Insert and search"`;

const JSON_TEMPLATE = [
  {
    title: "Two Sum",
    domain: "arrays",
    topic: "hash-map",
    difficulty: "Easy",
    tags: ["hash-table", "two-pointer"],
    notes: "Classic problem",
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]", isHidden: false }
    ],
    hints: ["Try using a hash map to store complements"],
    solution: {
      language: "python",
      code: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
      approach: "Hash map one-pass solution"
    }
  }
];

const FORMAT_OPTIONS = [
  { id: 'csv', label: 'CSV', icon: FileText, accept: '.csv', desc: 'Comma-separated values' },
  { id: 'json', label: 'JSON', icon: FileJson, accept: '.json', desc: 'Full metadata + solutions' },
  { id: 'xlsx', label: 'Excel', icon: Sheet, accept: '.xlsx,.xls', desc: 'Microsoft Excel spreadsheet' },
];

export default function BatchImport({ onClose, onSaved }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [format, setFormat] = useState('csv');
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(null);

  const acceptMap = { csv: '.csv', json: '.json', xlsx: '.xlsx,.xls' };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setErrors([]);
    setParsed([]);

    if (format === 'csv') parseCSV(f);
    else if (format === 'json') parseJSON(f);
    else if (format === 'xlsx') parseExcel(f);
  };

  const parseCSV = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { setErrors(['CSV must have a header row + at least 1 data row']); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const rows = [];
      const errs = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (vals.length < 2) { errs.push(`Row ${i + 1}: insufficient columns`); continue; }

        const row = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

        if (!row.title) { errs.push(`Row ${i + 1}: missing title`); continue; }
        if (!row.domain) { errs.push(`Row ${i + 1}: missing domain`); continue; }

        rows.push({
          title: row.title,
          domain: row.domain,
          topic: row.topic || '',
          difficulty: row.difficulty || 'Easy',
          tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          notes: row.notes || '',
          testCases: [],
          hints: [],
          solution: null,
        });
      }

      setParsed(rows);
      setErrors(errs);
    };
    reader.readAsText(f);
  };

  const parseJSON = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) data = [data];
        const rows = [];
        const errs = [];

        data.forEach((item, i) => {
          if (!item.title) { errs.push(`Item ${i + 1}: missing title`); return; }
          if (!item.domain) { errs.push(`Item ${i + 1}: missing domain`); return; }

          rows.push({
            title: item.title,
            domain: item.domain,
            topic: item.topic || '',
            difficulty: item.difficulty || 'Easy',
            tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : []),
            notes: item.notes || '',
            testCases: Array.isArray(item.testCases) ? item.testCases.map(tc => ({
              input: tc.input || tc.input_data || '',
              expectedOutput: tc.expectedOutput || tc.expected_output || tc.output || '',
              isHidden: tc.isHidden || tc.hidden || false,
            })) : [],
            hints: Array.isArray(item.hints) ? item.hints : [],
            solution: item.solution ? {
              language: item.solution.language || item.solution.lang || 'javascript',
              code: item.solution.code || item.solution.solution || '',
              approach: item.solution.approach || item.solution.description || '',
            } : null,
          });
        });

        setParsed(rows);
        setErrors(errs);
      } catch (err) {
        setErrors([`Invalid JSON: ${err.message}`]);
      }
    };
    reader.readAsText(f);
  };

  const parseExcel = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const rows = [];
        const errs = [];

        data.forEach((item, i) => {
          const row = {};
          Object.keys(item).forEach(k => { row[k.toLowerCase().trim()] = item[k]; });

          if (!row.title) { errs.push(`Row ${i + 2}: missing title`); return; }
          if (!row.domain) { errs.push(`Row ${i + 2}: missing domain`); return; }

          rows.push({
            title: row.title,
            domain: row.domain,
            topic: row.topic || '',
            difficulty: row.difficulty || 'Easy',
            tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : [],
            notes: row.notes || '',
            testCases: [],
            hints: row.hints ? String(row.hints).split('|').map(h => h.trim()) : [],
            solution: row.solution_code ? {
              language: row.solution_language || 'javascript',
              code: row.solution_code,
              approach: row.solution_approach || '',
            } : null,
          });
        });

        setParsed(rows);
        setErrors(errs);
      } catch (err) {
        setErrors([`Excel parse error: ${err.message}`]);
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);

    try {
      const results = [];
      for (const row of parsed) {
        const qId = await HiveDeskStorage.getNextQuestionId();
        await HiveDeskStorage.insert('HiveDeskQuestions', {
          id: qId,
          prefix: qId,
          title: row.title,
          domain: row.domain,
          topic: row.topic,
          difficulty: row.difficulty,
          tags: row.tags,
          notes: row.notes,
          testCases: row.testCases,
          hints: row.hints,
          solution: row.solution,
          creatorId: user.id,
          creatorName: user.name,
          status: 'draft',
          qualityScore: 0,
          completionRate: 0,
          rating: 0,
          submissions: 0,
          createdAt: new Date().toISOString(),
        });
        results.push(qId);
      }

      setResult({ success: true, count: results.length });
      onSaved?.();
    } catch (e) {
      setResult({ success: false, error: e.message });
    }
    setImporting(false);
  };

  const downloadTemplate = (fmt) => {
    let content, type, ext;
    if (fmt === 'csv') {
      content = CSV_TEMPLATE;
      type = 'text/csv';
      ext = 'csv';
    } else if (fmt === 'json') {
      content = JSON.stringify(JSON_TEMPLATE, null, 2);
      type = 'application/json';
      ext = 'json';
    } else {
      const ws = XLSX.utils.json_to_sheet([
        { title: 'Two Sum', domain: 'arrays', topic: 'hash-map', difficulty: 'Easy', tags: 'hash-table,two-pointer', notes: 'Classic problem', solution_language: 'python', solution_code: 'def twoSum(nums, target): ...', solution_approach: 'Hash map one-pass' },
        { title: 'Binary Search Tree', domain: 'searching', topic: 'bst', difficulty: 'Medium', tags: 'tree,recursion', notes: 'Insert and search', solution_language: 'javascript', solution_code: 'function search(root, val) { ... }', solution_approach: 'Recursive BST search' },
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions');
      content = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      ext = 'xlsx';
    }

    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hivedesk-import-template.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-hd-text flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" /> Import Questions
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-hd-hover text-hd-muted"><X className="w-5 h-5" /></button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-2 mb-4">
          {FORMAT_OPTIONS.map(f => (
            <button key={f.id} onClick={() => { setFormat(f.id); setFile(null); setParsed([]); setErrors([]); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${format === f.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-hd-border text-hd-muted hover:border-indigo-500/30'}`}>
              <f.icon className="w-4 h-4" />
              <div className="text-left">
                <p>{f.label}</p>
                <p className="text-[10px] text-hd-muted">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-hd-border hover:border-indigo-500/30'}`}
        >
          <input ref={fileRef} type="file" accept={acceptMap[format]} className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <FileText className="w-8 h-8 mx-auto text-hd-muted/40 mb-2" />
          {file ? (
            <p className="text-sm text-hd-text">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-hd-secondary">Drop {format.toUpperCase()} file or click to browse</p>
              <p className="text-[11px] text-hd-muted mt-1">{acceptMap[format]} files only</p>
            </>
          )}
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[11px] text-hd-muted">Templates:</span>
          {FORMAT_OPTIONS.map(f => (
            <button key={f.id} onClick={() => downloadTemplate(f.id)} className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <Download className="w-3 h-3" /> {f.label}
            </button>
          ))}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {errors.length} errors:</p>
            <div className="max-h-24 overflow-y-auto text-[11px] text-red-300 space-y-0.5">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          </div>
        )}

        {/* Preview */}
        {parsed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-hd-muted mb-2">{parsed.length} questions ready to import:</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {parsed.map((q, i) => (
                <div key={i} className="rounded-lg border border-hd-border overflow-hidden">
                  <button onClick={() => setPreviewExpanded(previewExpanded === i ? null : i)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hd-hover transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-[12px] text-hd-text truncate flex-1">{q.title}</span>
                    <span className="text-[10px] text-hd-muted px-1.5 py-0.5 rounded bg-hd-surface/5">{q.domain}</span>
                    <span className="text-[10px] text-hd-muted px-1.5 py-0.5 rounded bg-hd-surface/5">{q.difficulty}</span>
                    {q.testCases.length > 0 && <span className="text-[10px] text-hd-muted">{q.testCases.length} tests</span>}
                    {q.solution && <span className="text-[10px] text-indigo-400">solution</span>}
                  </button>
                  {previewExpanded === i && (
                    <div className="px-3 pb-2 pt-1 border-t border-hd-border text-[11px] space-y-1">
                      {q.topic && <p className="text-hd-secondary">Topic: {q.topic}</p>}
                      {q.tags.length > 0 && <p className="text-hd-muted">Tags: {q.tags.join(', ')}</p>}
                      {q.hints.length > 0 && <p className="text-hd-muted">Hints: {q.hints.length}</p>}
                      {q.testCases.length > 0 && <p className="text-hd-muted">Test Cases: {q.testCases.length}</p>}
                      {q.solution && <p className="text-indigo-400">Solution: {q.solution.language} ({q.solution.approach || 'no approach'})</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 p-3 rounded-lg ${result.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className={`text-xs font-medium flex items-center gap-1 ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.success ? <><CheckCircle2 className="w-3.5 h-3.5" /> {result.count} questions imported successfully!</> : <><AlertTriangle className="w-3.5 h-3.5" /> {result.error}</>}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-hd-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-hd-border text-xs text-hd-muted hover:bg-hd-hover">Cancel</button>
          <button onClick={handleImport} disabled={importing || parsed.length === 0 || result?.success}
            className="accent-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2">
            {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : `Import ${parsed.length} Questions`}
          </button>
        </div>
      </div>
    </div>
  );
}

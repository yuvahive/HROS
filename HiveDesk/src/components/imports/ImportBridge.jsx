import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, XCircle, AlertTriangle, Loader2, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useRBAC } from '../../auth/RBAC';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';
import { parseZipFile, getLiveSchema } from '../../utils/questionParser';

export default function ImportBridge({ onClose, onSaved }) {
  const { currentUser } = useAuth();
  const { hasPermission } = useRBAC();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [reviewerId, setReviewerId] = useState('');
  const [priority, setPriority] = useState('normal');
  const [users, setUsers] = useState([]);

  const canImport = hasPermission('questions_import');

  const loadUsers = async () => {
    try {
      const data = await HiveDeskStorage.getAll('HiveDeskUsers');
      setUsers(data.filter(u => u.isActive === 'true' || u.isActive === true));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.zip')) {
      alert('Please upload a .zip file');
      return;
    }
    setParsing(true);
    setParsed(null);
    setImportResult(null);
    try {
      const liveSchema = await getLiveSchema();
      const result = await parseZipFile(file, liveSchema);
      setParsed(result);
      if (result.valid && result.questions.length > 0) {
        await loadUsers();
        const reviewer = await HiveDeskStorage.getReviewer(currentUser?.id);
        if (reviewer) setReviewerId(reviewer);
      }
    } catch (err) {
      setParsed({
        valid: false,
        errors: [`Failed to parse zip: ${err.message}`],
        questions: [],
        warnings: [],
      });
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!parsed || !parsed.valid) return;
    setImporting(true);
    setImportResult(null);
    try {
      const reviewer = users.find(u => u.id === reviewerId);
      const records = parsed.questions.filter(q => q.valid).map(q => ({
        id: `HDQ-${Date.now().toString(36).slice(-3).toUpperCase()}-${Math.random().toString(36).slice(2, 5)}`,
        title: q.title,
        language: guessLanguage(q.folderPath),
        folderPath: q.folderPath,
        status: 'draft',
        curatorTestResult: q.testCount > 0 ? 'PASS' : 'PENDING',
        reviewerTestResult: 'PENDING',
        leadTestResult: 'PENDING',
        testScore: q.testCount > 0 ? 100 : 0,
        reviewerId: reviewerId || '',
        reviewerName: reviewer?.name || '',
        creatorId: currentUser?.id || '',
        creatorName: currentUser?.name || '',
        priority,
        createdAt: new Date().toISOString(),
        questionMd: q.questionMd?.substring(0, 2000) || '',
        solutionCode: q.solutionPy?.substring(0, 2000) || '',
        testCasesCount: q.testCount,
        hintsCount: q.hintCount,
      }));

      for (const record of records) {
        await HiveDeskStorage.insert('HiveDeskQuestions', record);
      }

      if (reviewerId && records.length > 0) {
        await HiveDeskStorage.createNotification({
          userId: reviewerId,
          type: 'review',
          title: `${records.length} questions to review`,
          message: `${currentUser?.name} imported ${records.length} questions for review`,
          resourceType: 'questions',
          fromUserId: currentUser?.id,
          fromUserName: currentUser?.name,
        });
      }

      setImportResult({
        success: true,
        count: records.length,
        reviewer: reviewer?.name || 'None assigned',
      });
      onSaved?.();
    } catch (err) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  };

  const guessLanguage = (path) => {
    const p = path.toLowerCase();
    if (p.includes('py-') || p.includes('python')) return 'python';
    if (p.includes('c-') && !p.includes('cpp') && !p.includes('cp-')) return 'c';
    if (p.includes('cp-') || p.includes('cpp')) return 'c++';
    if (p.includes('js-') || p.includes('javascript')) return 'javascript';
    if (p.includes('jv-') || p.includes('java')) return 'java';
    return 'python';
  };

  if (!canImport) {
    return (
      <div className="p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">You don't have permission to import questions.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Import Questions</h2>
          <p className="text-sm text-gray-500 mt-1">Upload a zip of your HiveLab folder</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      {!parsed && !parsing && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700">
            {dragActive ? 'Drop your zip file here' : 'Drag & drop your zip file'}
          </p>
          <p className="text-sm text-gray-500 mt-2">or click to browse</p>
          <p className="text-xs text-gray-400 mt-4">Accepts .zip files containing question folders</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {parsing && (
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Parsing zip file...</p>
        </div>
      )}

      {parsed && !importResult && (
        <div className="space-y-4">
          {parsed.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {parsed.errors.map((err, i) => <li key={i}>• {err}</li>)}
              </ul>
            </div>
          )}

          {parsed.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">Warnings</span>
              </div>
              <ul className="text-sm text-yellow-600 space-y-1">
                {parsed.warnings.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          {parsed.questions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">
                  {parsed.validFolders} / {parsed.totalFolders} questions valid
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {parsed.questions.map((q, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    {q.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{q.folderName}</p>
                      <p className="text-xs text-gray-500 truncate">{q.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{q.testCount} tests</span>
                      <span>•</span>
                      <span>{q.hintCount} hints</span>
                    </div>
                    {q.errors.length > 0 && (
                      <span className="text-xs text-red-500">{q.errors.length} issues</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.valid && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Assign Reviewer
                </label>
                <select
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No reviewer</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setParsed(null); setImportResult(null); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!parsed.valid || importing}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${parsed.validFolders} Questions`}
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className={`p-6 rounded-lg text-center ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {importResult.success ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-800">Import Successful!</h3>
              <p className="text-green-700 mt-1">{importResult.count} questions imported</p>
              <p className="text-sm text-green-600 mt-1">Reviewer: {importResult.reviewer}</p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-800">Import Failed</h3>
              <p className="text-red-700 mt-1">{importResult.error}</p>
            </>
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useRBAC } from '../../auth/RBAC';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

const DEFAULT_SCHEMA = [
  { id: 'field-question-md', field: 'question.md', type: 'file', required: true, constraints: 'min_length:100', defaultValue: '', description: 'Main question file with story, prompt, and constraints' },
  { id: 'field-solution-py', field: 'Solution.py', type: 'file', required: true, constraints: 'min_length:50', defaultValue: '', description: 'Reference solution in Python' },
  { id: 'field-tests-json', field: 'tests.json', type: 'file', required: true, constraints: 'min_cases:3', defaultValue: '', description: 'Test cases with input/expected pairs' },
  { id: 'field-hints', field: 'hints', type: 'folder', required: true, constraints: 'count:3', defaultValue: '', description: 'Three hint files (hint_1.md, hint_2.md, hint_3.md)' },
  { id: 'field-folder-pattern', field: 'folder.name', type: 'pattern', required: true, constraints: 'regex:Q[1-5]', defaultValue: 'Q', description: 'Folder naming pattern for questions' },
  { id: 'field-folder-count', field: 'folder.count', type: 'number', required: true, constraints: 'min:3,max:5', defaultValue: '5', description: 'Number of questions per topic' },
];

export default function SchemaEditor() {
  const { currentUser } = useAuth();
  const { hasPermission } = useRBAC();
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const canEdit = hasPermission('schema_edit');

  const loadSchema = async () => {
    setLoading(true);
    try {
      const data = await HiveDeskStorage.getAll('HiveDeskSchema');
      if (data && data.length > 0) {
        setSchema(data);
      } else {
        setSchema(DEFAULT_SCHEMA);
      }
    } catch (err) {
      console.error('Failed to load schema:', err);
      setSchema(DEFAULT_SCHEMA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    setMessage(null);
    try {
      const records = schema.map(s => ({
        ...s,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'unknown'
      }));
      await HiveDeskStorage.upsert('HiveDeskSchema', records);
      setMessage({ type: 'success', text: 'Schema saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save schema' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!canEdit) return;
    setSchema(DEFAULT_SCHEMA);
    setMessage({ type: 'info', text: 'Schema reset to defaults (save to apply)' });
  };

  const updateField = (id, key, value) => {
    if (!canEdit) return;
    setSchema(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const addField = () => {
    if (!canEdit) return;
    const newId = `field-new-${Date.now()}`;
    setSchema(prev => [...prev, {
      id: newId,
      field: 'new_field',
      type: 'file',
      required: true,
      constraints: '',
      defaultValue: '',
      description: ''
    }]);
    setEditingId(newId);
  };

  const removeField = (id) => {
    if (!canEdit) return;
    setSchema(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Schema</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define the structure for uploaded questions. Changes take effect immediately for all importers.
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Schema'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {!canEdit && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm">
          You need Lead or Admin role to edit the schema.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Field</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Required</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Constraints</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schema.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.field}
                      onChange={(e) => updateField(item.id, 'field', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 font-mono">{item.field}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <select
                      value={item.type}
                      onChange={(e) => updateField(item.id, 'type', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="file">file</option>
                      <option value="folder">folder</option>
                      <option value="pattern">pattern</option>
                      <option value="number">number</option>
                      <option value="string">string</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {item.type}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => updateField(item.id, 'required', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                    />
                  ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.required ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.required ? 'Required' : 'Optional'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.constraints}
                      onChange={(e) => updateField(item.id, 'constraints', e.target.value)}
                      placeholder="e.g. min:3,max:5"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-600 font-mono">{item.constraints || '—'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateField(item.id, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{item.description}</span>
                  )}
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === item.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Done
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => removeField(item.id)}
                        className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <button
          onClick={addField}
          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
        >
          + Add Field
        </button>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How this works</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>The schema defines what files are required when a curator uploads a question zip.</li>
          <li>Import Bridge validates uploads against this schema client-side.</li>
          <li>HiveLab scripts fetch this schema via GAS endpoint for local validation.</li>
          <li>Changes take effect immediately for all importers.</li>
        </ul>
      </div>
    </div>
  );
}

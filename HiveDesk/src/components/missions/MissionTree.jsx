import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { HiveDeskStorage } from '../../services/HiveDeskStorage';

const LANGUAGES = [
  { code: 'python', label: 'Python', missions: ['YH-PY-BASC', 'YH-PY-EASY', 'YH-PY-MEDI', 'YH-PY-HARD'] },
  { code: 'c', label: 'C', missions: ['YH-C-BASC', 'YH-C-EASY', 'YH-C-MEDI'] },
  { code: 'cpp', label: 'C++', missions: ['YH-CP-BASC', 'YH-CP-EASY'] },
  { code: 'javascript', label: 'JavaScript', missions: ['YH-JS-BASC'] },
  { code: 'java', label: 'Java', missions: ['YH-JV-BASC'] },
];

const MISSION_NAMES = {
  'YH-PY-BASC': 'Python Beginner',
  'YH-PY-EASY': 'Python Easy',
  'YH-PY-MEDI': 'Python Medium',
  'YH-PY-HARD': 'Python Hard',
  'YH-C-BASC': 'C Beginner',
  'YH-C-EASY': 'C Easy',
  'YH-C-MEDI': 'C Medium',
  'YH-CP-BASC': 'C++ Beginner',
  'YH-CP-EASY': 'C++ Easy',
  'YH-JS-BASC': 'JS Beginner',
  'YH-JV-BASC': 'Java Beginner',
};

const TOPICS = ['C1', 'C2', 'C3', 'C4'];

function ProgressBar({ percent, size = 'sm' }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={`w-full bg-gray-200 rounded-full ${h}`}>
      <div
        className={`bg-indigo-500 rounded-full ${h} transition-all duration-500`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function MissionNode({ mission, questions, expanded, onToggle }) {
  const totalTopics = TOPICS.length;
  const publishedTopics = TOPICS.filter(t => {
    const qs = questions.filter(q => q.missionCode === mission && q.topicId === t);
    return qs.some(q => q.status === 'published');
  }).length;

  const percent = totalTopics > 0 ? Math.round((publishedTopics / totalTopics) * 100) : 0;
  const topicStatuses = TOPICS.map(t => {
    const qs = questions.filter(q => q.missionCode === mission && q.topicId === t);
    if (qs.length === 0) return 'empty';
    if (qs.some(q => q.status === 'published')) return 'published';
    if (qs.some(q => q.status === 'in-review' || q.status === 'review')) return 'review';
    if (qs.some(q => q.status === 'draft' || q.status === 'in-progress')) return 'progress';
    return 'empty';
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{mission}</span>
            <span className="text-xs text-gray-500">{MISSION_NAMES[mission] || ''}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ProgressBar percent={percent} />
            <span className="text-xs text-gray-500 w-12 text-right">{percent}%</span>
          </div>
        </div>
        <div className="flex gap-1">
          {topicStatuses.map((s, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                s === 'published' ? 'bg-green-500' :
                s === 'review' ? 'bg-yellow-500' :
                s === 'progress' ? 'bg-indigo-500' :
                'bg-gray-200'
              }`}
              title={`Topic ${TOPICS[i]}`}
            />
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-2 space-y-1">
          {TOPICS.map((topic, i) => {
            const qs = questions.filter(q => q.missionCode === mission && q.topicId === topic);
            const status = topicStatuses[i];
            return (
              <div key={topic} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  status === 'published' ? 'bg-green-500' :
                  status === 'review' ? 'bg-yellow-500' :
                  status === 'progress' ? 'bg-indigo-500' :
                  'bg-gray-300'
                }`} />
                <span className="text-sm font-medium text-gray-700 w-16">{topic}</span>
                <div className="flex-1">
                  {qs.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{qs.length} questions</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {qs.filter(q => q.status === 'published').length} published
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Not started</span>
                  )}
                </div>
                {status === 'published' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {status === 'review' && <Clock className="w-4 h-4 text-yellow-500" />}
                {status === 'progress' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MissionTree() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMissions, setExpandedMissions] = useState({});
  const [selectedLang, setSelectedLang] = useState('python');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await HiveDeskStorage.getAll('HiveDeskQuestions');
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleMission = (mission) => {
    setExpandedMissions(prev => ({ ...prev, [mission]: !prev[mission] }));
  };

  const lang = LANGUAGES.find(l => l.code === selectedLang);
  const totalPublished = questions.filter(q => q.status === 'published').length;
  const totalQuestions = questions.length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mission Tree</h1>
        <p className="text-sm text-gray-500 mt-1">Visual curriculum progress across all missions</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => setSelectedLang(l.code)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedLang === l.code
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Questions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalQuestions}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalPublished}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">In Progress</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {questions.filter(q => q.status === 'in-progress' || q.status === 'draft').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lang?.missions.map(mission => (
          <MissionNode
            key={mission}
            mission={mission}
            questions={questions}
            expanded={expandedMissions[mission]}
            onToggle={() => toggleMission(mission)}
          />
        ))}
      </div>
    </div>
  );
}

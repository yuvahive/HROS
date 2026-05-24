import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Plus, Activity, Sun, Moon, Edit3, Trash2,
  LayoutGrid, List as ListIcon, Save, X, Clock, MoreVertical,
  CheckCircle2, AlertCircle, TrendingUp, Target, Briefcase,
  Calendar, User, Mail, Linkedin, Phone, Search, Filter,
  ChevronDown, Download, Upload, Settings, Bell, Hash
} from 'lucide-react';
import { HiveLabStorage } from './HiveLabStorage';

const STAGES = [
  {
    id: 'Not started',
    label: 'Not Started',
    color: 'slate',
    gradient: 'from-slate-500/10 to-slate-500/5',
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'In progress',
    label: 'In Progress',
    color: 'blue',
    gradient: 'from-blue-500/10 to-blue-500/5',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'Blocked',
    label: 'Blocked',
    color: 'amber',
    gradient: 'from-amber-500/10 to-amber-500/5',
    icon: <AlertCircle className="w-4 h-4" />
  },
  {
    id: 'Completed',
    label: 'Completed',
    color: 'emerald',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    icon: <CheckCircle2 className="w-4 h-4" />
  }
];

const PRIORITY_CONFIG = {
  'P0': { label: 'Critical', color: 'rose', ring: 'ring-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
  'P1': { label: 'High', color: 'orange', ring: 'ring-orange-500/20', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  'P2': { label: 'Medium', color: 'blue', ring: 'ring-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  'P3': { label: 'Low', color: 'emerald', ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
};

export default function HiveLabDashboard({ onBackToCalendar, currentUser, isDark, onToggleDarkMode }) {
  const [data, setData] = useState({ team: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [viewMode, setViewMode] = useState('board');
  const [editingItem, setEditingItem] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const userRole = currentUser?.role?.toLowerCase();
  const canManage = userRole === 'admin' || userRole === 'superadmin' || userRole === 'hivemanager';

  const teamMemberNames = data.team.map(m => m.Name).filter(Boolean);

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    setLoading(true);
    const result = await HiveLabStorage.fetchData();
    setData(result);
    setLoading(false);
  };

  const handleUpdate = async (updatedRow) => {
    setLoading(true);
    const success = await HiveLabStorage.submitData(editingItem ? editingItem.type : 'tasks', updatedRow);
    if (success) {
      await fetchLatestData();
      setEditingItem(null);
    }
    setLoading(false);
  };

  const handleDropToStatus = async (task, newStatus) => {
    if (task.Status === newStatus) return;
    setLoading(true);
    const updatedTask = { ...task, Status: newStatus };
    const success = await HiveLabStorage.submitData('tasks', updatedTask);
    if (success) {
      await fetchLatestData();
    }
    setLoading(false);
  };

  const handleDelete = async (type, rowData) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    setLoading(true);
    const success = await HiveLabStorage.deleteData(type, rowData);
    if (success) {
      await fetchLatestData();
      setEditingItem(null);
    }
    setLoading(false);
  };

  const filteredTasks = data.tasks.filter(task => {
    const matchesSearch = !searchQuery ||
      task.MissionCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.Deliverable?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.Owner?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = filterPriority === 'all' || task.Priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  // Calculate workload for team
  const getWorkload = (name) => {
    return data.tasks.filter(t => t.Owner === name && t.Status !== 'Completed').length;
  };

  const stats = {
    total: data.tasks.length,
    completed: data.tasks.filter(t => t.Status === 'Completed').length,
    inProgress: data.tasks.filter(t => t.Status === 'In progress').length,
    blocked: data.tasks.filter(t => t.Status === 'Blocked').length,
    team: data.team.length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const fmtDate = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      if (isNaN(date)) return d;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0a0a0f] dark:via-[#0f0f15] dark:to-[#0a0a0f] text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToCalendar}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  HiveLab
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
                    Hub
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </div>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Connected to Cloud</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter missions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all"
                  title={isDark ? 'Light mode' : 'Dark mode'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={fetchLatestData}
                  disabled={loading}
                  className={`p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all ${loading ? 'animate-spin text-indigo-500' : ''}`}
                  title="Force Refresh"
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>

              {canManage && (
                <button
                  onClick={() => setEditingItem({ type: activeTab, data: {} })}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  <span className="hidden sm:inline">Add New</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Missions"
            value={stats.total}
            icon={<LayoutGrid className="w-5 h-5" />}
            color="indigo"
          />
          <StatCard
            label="Active Units"
            value={stats.inProgress}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Cycle Completion"
            value={stats.completed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="emerald"
            trend={`${completionRate}% Rate`}
          />
          <StatCard
            label="Blocked Issues"
            value={stats.blocked}
            icon={<AlertCircle className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Squad Count"
            value={stats.team}
            icon={<Users className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Navigation & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
            <TabButton
              active={activeTab === 'tasks'}
              onClick={() => setActiveTab('tasks')}
              icon={<Target className="w-4 h-4" />}
              label="Task Pipeline"
            />
            <TabButton
              active={activeTab === 'team'}
              onClick={() => setActiveTab('team')}
              icon={<Users className="w-4 h-4" />}
              label="Team Squad"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {activeTab === 'tasks' && (
              <>
                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    <option value="all">ALL PRIORITIES</option>
                    <option value="P0">CRITICAL (P0)</option>
                    <option value="P1">HIGH (P1)</option>
                    <option value="P2">MEDIUM (P2)</option>
                    <option value="P3">LOW (P3)</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="inline-flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                  <ViewButton
                    active={viewMode === 'board'}
                    onClick={() => setViewMode('board')}
                    icon={<LayoutGrid className="w-4 h-4" />}
                  />
                  <ViewButton
                    active={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    icon={<ListIcon className="w-4 h-4" />}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-[600px]">
          {activeTab === 'tasks' ? (
            filteredTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-96 bg-white/40 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                  <Search className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching tasks found</p>
               </div>
            ) : (
                viewMode === 'board' ? (
                  <BoardView
                    stages={STAGES}
                    tasks={filteredTasks}
                    onEdit={(t) => setEditingItem({ type: 'tasks', data: t })}
                    canManage={canManage}
                    onDropTask={handleDropToStatus}
                    onDragTask={setDraggingTask}
                    draggingTask={draggingTask}
                    fmtDate={fmtDate}
                  />
                ) : (
                  <ListView
                    tasks={filteredTasks}
                    onEdit={(t) => setEditingItem({ type: 'tasks', data: t })}
                    onDelete={(t) => handleDelete('tasks', t)}
                    canManage={canManage}
                    fmtDate={fmtDate}
                  />
                )
            )
          ) : (
            <TeamView
              team={data.team}
              getWorkload={getWorkload}
              onEdit={(m) => setEditingItem({ type: 'team', data: m })}
              onDelete={(m) => handleDelete('team', m)}
              canManage={canManage}
            />
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
          loading={loading}
          teamMemberNames={teamMemberNames}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color, trend }) {
  const colorClasses = {
    indigo: 'from-indigo-600/10 to-transparent text-indigo-600',
    blue: 'from-blue-600/10 to-transparent text-blue-600',
    emerald: 'from-emerald-600/10 to-transparent text-emerald-600',
    amber: 'from-amber-600/10 to-transparent text-amber-600',
    purple: 'from-purple-600/10 to-transparent text-purple-600',
    rose: 'from-rose-600/10 to-transparent text-rose-600',
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-100 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:${colorClasses[color].split(' ')[2]} transition-colors`}>
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
              {trend}
            </span>
          )}
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">
          {value}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors">
          {label}
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${active
          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-lg'
          : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// View Button Component
function ViewButton({ active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-300 ${active
          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
        }`}
    >
      {icon}
    </button>
  );
}

// Board View Component
function BoardView({ stages, tasks, onEdit, canManage, onDropTask, onDragTask, draggingTask, fmtDate }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x">
      {stages.map(stage => {
        const stageTasks = tasks.filter(t => t.Status === stage.id || (!t.Status && stage.id === 'Not started'));

        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            tasks={stageTasks}
            onEdit={onEdit}
            canManage={canManage}
            onDropTask={onDropTask}
            onDragTask={onDragTask}
            draggingTask={draggingTask}
            fmtDate={fmtDate}
          />
        );
      })}
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({ stage, tasks, onEdit, canManage, onDropTask, onDragTask, draggingTask, fmtDate }) {
  const [isOver, setIsOver] = useState(false);

  const colors = {
    slate: 'text-slate-500 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-800',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-900/30',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-900/30',
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-900/30',
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        if (draggingTask) onDropTask(draggingTask, stage.id);
      }}
      className={`flex-shrink-0 w-80 min-h-[500px] transition-all duration-300 ${isOver ? 'scale-[1.02] bg-slate-100/50 dark:bg-white/[0.02] rounded-3xl' : ''}`}
    >
      <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center justify-between ${colors[stage.color]}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm">
            {stage.icon}
          </div>
          <div>
            <h3 className="font-black text-[10px] uppercase tracking-widest italic">{stage.label}</h3>
            <p className="text-[9px] font-bold opacity-60 italic">{tasks.length} MISSION{tasks.length !== 1 ? 'S' : ''}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <TaskCard
            key={idx}
            task={task}
            onEdit={onEdit}
            canManage={canManage}
            onDragStart={() => onDragTask(task)}
            fmtDate={fmtDate}
          />
        ))}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onEdit, canManage, onDragStart, fmtDate }) {
  const p = PRIORITY_CONFIG[task.Priority] || PRIORITY_CONFIG.P3;

  return (
    <div
      draggable={canManage}
      onDragStart={onDragStart}
      onClick={() => canManage && onEdit(task)}
      className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter italic">
          <Hash size={10} className="inline mr-1" />{task.MissionCode || 'ID-OPEN'}
        </span>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic border ${p.bg} ${p.text} ${p.ring}`}>
          {p.label}
        </span>
      </div>

      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 line-clamp-2 leading-snug">
        {task.Deliverable || 'Primary objective pending.'}
      </h4>

      {/* Progress HUD */}
      {task.Score && (
         <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Progress</span>
               <span className="text-[9px] font-black text-emerald-500">{task.Score}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${task.Score}%` }}></div>
            </div>
         </div>
      )}

      {(task['Start date'] || task['End date']) && (
        <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span>
            {fmtDate(task['Start date'])} <span className="opacity-20 italic mx-0.5">→</span> {fmtDate(task['End date'])}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[8px] font-black text-slate-400 italic">
            {task.Owner?.charAt(0) || '?'}
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[100px]">
            {task.Owner || 'Unassigned'}
          </span>
        </div>
        <MoreVertical className="w-3.5 h-3.5 text-slate-200 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
}

// List View Component
function ListView({ tasks, onEdit, onDelete, canManage, fmtDate }) {
  return (
    <div className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mission Node</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Level</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Resource</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Pipeline</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Target</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {tasks.map((task, idx) => {
              const p = PRIORITY_CONFIG[task.Priority] || PRIORITY_CONFIG.P3;
              const stage = STAGES.find(s => s.id === task.Status) || STAGES[0];

              return (
                <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-500 italic mb-0.5">
                        {task.MissionCode || 'ID-OPEN'}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.Deliverable || 'No task brief'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic border ${p.bg} ${p.text} ${p.ring}`}>
                      {p.label}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[9px] font-black text-slate-400 italic">
                        {task.Owner?.charAt(0) || '?'}
                       </div>
                       <span className="text-sm font-bold truncate max-w-[150px]">{task.Owner || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stage.label}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 whitespace-nowrap">
                      {task['End date'] ? fmtDate(task['End date']) : '-'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {canManage && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => onEdit(task)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(task)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Team View Component
function TeamView({ team, getWorkload, onEdit, onDelete, canManage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1 animate-in slide-in-from-bottom-8 duration-700">
      {team.map((member, idx) => (
        <TeamMemberCard
          key={idx}
          member={member}
          workload={getWorkload(member.Name)}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}

// Team Member Card Component
function TeamMemberCard({ member, workload, onEdit, onDelete, canManage }) {
  return (
    <div className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      <div className="flex items-center justify-between mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl font-black italic shadow-xl">
          {member.Name?.charAt(0) || '?'}
        </div>
        
        {/* Workload Indicator HUD */}
        <div className={`px-3 py-1.5 rounded-xl border-2 flex flex-col items-center ${workload > 3 ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-500'}`}>
           <span className="text-[12px] font-black italic leading-none">{workload}</span>
           <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">Tasks</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight truncate leading-none mb-1">
          {member.Name || 'Anonymous'}
        </h3>
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] italic">
          {member.Role || 'Squad Member'}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <Briefcase className="w-4 h-4 text-slate-300" />
          <span className="truncate">{member.AllocatedProject || 'Deployment Pending'}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <Phone className="w-4 h-4 text-slate-300" />
          <span className="font-mono tracking-widest">{member.PhoneNumber}</span>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {member['LinkedIn Handle'] && (
            <a href={member['LinkedIn Handle']} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-blue-50 dark:hover:bg-white/5 rounded-lg text-slate-300 hover:text-blue-500 transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(member)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
            <button onClick={() => onDelete(member)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Modal Component (using current implementation logic)
function EditModal({ item, onClose, onSave, loading, teamMemberNames }) {
  const [formData, setFormData] = useState(item.data);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-white/10">
        <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              {item.type === 'tasks' ? 'Task Objective' : 'Resource Profile'}
            </h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 italic">
              Synchronizing Organizational State
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto max-h-[calc(90vh-200px)] space-y-8 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {item.type === 'team' ? (
              <>
                <FormField label="Personnel Name" name="Name" value={formData.Name || ''} onChange={handleChange} required />
                <FormField label="Primary Contact" name="PhoneNumber" value={formData.PhoneNumber || ''} onChange={handleChange} />
                <FormField label="LinkedIn Network" name="LinkedIn Handle" value={formData['LinkedIn Handle'] || ''} onChange={handleChange} className="md:col-span-2" />
                <FormField label="Squad Role" name="Role" value={formData.Role || ''} onChange={handleChange} />
                <FormField label="Project Assignment" name="AllocatedProject" value={formData.AllocatedProject || ''} onChange={handleChange} />
                <FormField label="Meta Remarks" name="Remarks" value={formData.Remarks || ''} onChange={handleChange} type="textarea" className="md:col-span-2" />
              </>
            ) : (
              <>
                <FormField label="Mission ID" name="MissionCode" value={formData.MissionCode || ''} onChange={handleChange} required />
                <FormField label="Strategic Priority" name="Priority" value={formData.Priority || 'P3'} onChange={handleChange} type="select" options={['P0', 'P1', 'P2', 'P3']} />
                <FormField label="Assigned Resource" name="Owner" value={formData.Owner || ''} onChange={handleChange} type="select" options={['Unassigned', ...teamMemberNames]} />
                <FormField label="Lifecycle Stage" name="Status" value={formData.Status || 'Not started'} onChange={handleChange} type="select" options={['Not started', 'In progress', 'Blocked', 'Completed']} />
                <FormField label="Initiation Date" name="Start date" value={formData['Start date'] || ''} onChange={handleChange} type="date" />
                <FormField label="Target Deadline" name="End date" value={formData['End date'] || ''} onChange={handleChange} type="date" />
                <FormField label="Objective Brief" name="Deliverable" value={formData.Deliverable || ''} onChange={handleChange} className="md:col-span-2" required />
                <FormField label="Performance Score" name="Score" value={formData.Score || ''} onChange={handleChange} type="number" />
                <FormField label="Mission Metadata" name="Notes" value={formData.Notes || ''} onChange={handleChange} type="textarea" className="md:col-span-2" />
              </>
            )}
          </div>
        </form>

        <div className="px-10 py-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-white dark:bg-transparent">Abort</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'WRITING...' : 'DEPLOY TO CLOUD'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text', options, placeholder, required, className = '' }) {
  const baseClasses = "w-full px-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all italic";

  return (
    <div className={className}>
      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {type === 'select' ? (
        <select value={value} onChange={(e) => onChange(name, e.target.value)} className={baseClasses}>
          {options.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(name, e.target.value)} className={`${baseClasses} min-h-[120px] resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} className={baseClasses} />
      )}
    </div>
  );
}

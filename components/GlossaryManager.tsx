/**
 * Glossary Manager Component
 *
 * UI for creating and managing translation glossaries.
 * Allows users to add, edit, and delete glossary entries.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Download,
  Upload,
  Info
} from 'lucide-react';
import {
  TranslationGlossary,
  GlossaryEntry,
  getAllGlossaries,
  createGlossary,
  getGlossary,
  updateGlossary,
  deleteGlossary,
  addGlossaryEntry,
  updateGlossaryEntry,
  deleteGlossaryEntry,
  exportGlossaryToCSV,
  importGlossaryFromCSV,
  getGlossaryStats
} from '../services/translationGlossary';
import Button from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from '../contexts/ToastContext';

interface GlossaryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  sourceLang?: string;
  targetLang?: string;
  onSelectGlossary?: (glossary: TranslationGlossary) => void;
}

export const GlossaryManager: React.FC<GlossaryManagerProps> = ({
  isOpen,
  onClose,
  sourceLang,
  targetLang,
  onSelectGlossary
}) => {
  const { showToast } = useToast();
  const [glossaries, setGlossaries] = useState<TranslationGlossary[]>([]);
  const [selectedGlossary, setSelectedGlossary] = useState<TranslationGlossary | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GlossaryEntry | null>(null);

  // Form states
  const [newGlossaryName, setNewGlossaryName] = useState('');
  const [newGlossaryDesc, setNewGlossaryDesc] = useState('');
  const [newGlossarySourceLang, setNewGlossarySourceLang] = useState(sourceLang || 'en');
  const [newGlossaryTargetLang, setNewGlossaryTargetLang] = useState(targetLang || 'de');

  const [newEntrySource, setNewEntrySource] = useState('');
  const [newEntryTarget, setNewEntryTarget] = useState('');
  const [newEntryContext, setNewEntryContext] = useState('');
  const [newEntryCaseSensitive, setNewEntryCaseSensitive] = useState(false);

  useEffect(() => {
    loadGlossaries();
  }, []);

  const loadGlossaries = () => {
    const all = getAllGlossaries();
    setGlossaries(all);
  };

  const handleCreateGlossary = () => {
    if (!newGlossaryName.trim()) {
      showToast('Please enter a glossary name', 'error');
      return;
    }

    const glossary = createGlossary(
      newGlossaryName,
      newGlossarySourceLang,
      newGlossaryTargetLang,
      newGlossaryDesc
    );

    loadGlossaries();
    setSelectedGlossary(glossary);
    setIsCreating(false);
    setNewGlossaryName('');
    setNewGlossaryDesc('');
    showToast('Glossary created successfully', 'success');
  };

  const handleDeleteGlossary = (id: string) => {
    if (!confirm('Are you sure you want to delete this glossary?')) return;

    deleteGlossary(id);
    loadGlossaries();
    if (selectedGlossary?.id === id) {
      setSelectedGlossary(null);
    }
    showToast('Glossary deleted', 'success');
  };

  const handleAddEntry = () => {
    if (!selectedGlossary) return;
    if (!newEntrySource.trim() || !newEntryTarget.trim()) {
      showToast('Source and target are required', 'error');
      return;
    }

    addGlossaryEntry(
      selectedGlossary.id,
      newEntrySource,
      newEntryTarget,
      newEntryContext,
      newEntryCaseSensitive
    );

    // Reload glossary
    const updated = getGlossary(selectedGlossary.id);
    if (updated) setSelectedGlossary(updated);

    setNewEntrySource('');
    setNewEntryTarget('');
    setNewEntryContext('');
    setNewEntryCaseSensitive(false);
    showToast('Entry added', 'success');
  };

  const handleUpdateEntry = () => {
    if (!selectedGlossary || !editingEntry) return;

    updateGlossaryEntry(selectedGlossary.id, editingEntry.id, {
      source: newEntrySource,
      target: newEntryTarget,
      context: newEntryContext,
      caseSensitive: newEntryCaseSensitive
    });

    const updated = getGlossary(selectedGlossary.id);
    if (updated) setSelectedGlossary(updated);

    setEditingEntry(null);
    setNewEntrySource('');
    setNewEntryTarget('');
    setNewEntryContext('');
    showToast('Entry updated', 'success');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedGlossary) return;

    deleteGlossaryEntry(selectedGlossary.id, entryId);

    const updated = getGlossary(selectedGlossary.id);
    if (updated) setSelectedGlossary(updated);
    showToast('Entry deleted', 'success');
  };

  const handleExport = () => {
    if (!selectedGlossary) return;

    const csv = exportGlossaryToCSV(selectedGlossary);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGlossary.name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Glossary exported', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedGlossary) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const result = importGlossaryFromCSV(selectedGlossary.id, csv);

      if (result.errors.length > 0) {
        showToast(
          `Imported ${result.success} entries with ${result.errors.length} errors`,
          'warning'
        );
      } else {
        showToast(`Imported ${result.success} entries successfully`, 'success');
      }

      const updated = getGlossary(selectedGlossary.id);
      if (updated) setSelectedGlossary(updated);
    };
    reader.readAsText(file);
  };

  const startEditEntry = (entry: GlossaryEntry) => {
    setEditingEntry(entry);
    setNewEntrySource(entry.source);
    setNewEntryTarget(entry.target);
    setNewEntryContext(entry.context || '');
    setNewEntryCaseSensitive(entry.caseSensitive || false);
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setNewEntrySource('');
    setNewEntryTarget('');
    setNewEntryContext('');
    setNewEntryCaseSensitive(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Translation Glossaries" size="large">
      <div className="flex h-[600px]">
        {/* Left Sidebar - Glossary List */}
        <div className="w-64 border-r border-slate-200 pr-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-600 uppercase">Glossaries</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 hover:bg-indigo-50 rounded transition-colors"
              title="Create Glossary"
            >
              <Plus size={16} className="text-indigo-600" />
            </button>
          </div>

          {/* Create Form */}
          {isCreating && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
              <input
                type="text"
                value={newGlossaryName}
                onChange={(e) => setNewGlossaryName(e.target.value)}
                placeholder="Glossary name"
                className="w-full text-sm border rounded px-2 py-1.5"
              />
              <textarea
                value={newGlossaryDesc}
                onChange={(e) => setNewGlossaryDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full text-xs border rounded px-2 py-1.5 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <select
                  value={newGlossarySourceLang}
                  onChange={(e) => setNewGlossarySourceLang(e.target.value)}
                  className="flex-1 text-xs border rounded px-2 py-1.5"
                >
                  <option value="en">English</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
                <span className="text-slate-400">→</span>
                <select
                  value={newGlossaryTargetLang}
                  onChange={(e) => setNewGlossaryTargetLang(e.target.value)}
                  className="flex-1 text-xs border rounded px-2 py-1.5"
                >
                  <option value="de">German</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={handleCreateGlossary} className="flex-1">
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Glossary List */}
          <div className="space-y-1 overflow-y-auto max-h-[500px]">
            {glossaries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No glossaries yet
              </p>
            ) : (
              glossaries.map(glossary => (
                <div
                  key={glossary.id}
                  onClick={() => setSelectedGlossary(glossary)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedGlossary?.id === glossary.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {glossary.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {glossary.sourceLang} → {glossary.targetLang}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {glossary.entries.length} entries
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGlossary(glossary.id);
                      }}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Glossary Details */}
        <div className="flex-1 pl-4 flex flex-col">
          {selectedGlossary ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedGlossary.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedGlossary.sourceLang} → {selectedGlossary.targetLang}
                  </p>
                  {selectedGlossary.description && (
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedGlossary.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleExport}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Export CSV"
                  >
                    <Download size={16} />
                  </button>
                  <label className="p-2 hover:bg-slate-100 rounded transition-colors cursor-pointer">
                    <Upload size={16} />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Add/Edit Entry Form */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-2">
                <h4 className="text-sm font-bold text-slate-700">
                  {editingEntry ? 'Edit Entry' : 'Add New Entry'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newEntrySource}
                    onChange={(e) => setNewEntrySource(e.target.value)}
                    placeholder="Source term"
                    className="text-sm border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    value={newEntryTarget}
                    onChange={(e) => setNewEntryTarget(e.target.value)}
                    placeholder="Target translation"
                    className="text-sm border rounded px-3 py-2"
                  />
                </div>
                <input
                  type="text"
                  value={newEntryContext}
                  onChange={(e) => setNewEntryContext(e.target.value)}
                  placeholder="Context or notes (optional)"
                  className="w-full text-xs border rounded px-3 py-2"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={newEntryCaseSensitive}
                      onChange={(e) => setNewEntryCaseSensitive(e.target.checked)}
                      className="rounded"
                    />
                    Case sensitive
                  </label>
                  <div className="flex gap-1">
                    {editingEntry && (
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                    >
                      {editingEntry ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Entries List */}
              <div className="flex-1 overflow-y-auto">
                <h4 className="text-sm font-bold text-slate-700 mb-2">
                  Entries ({selectedGlossary.entries.length})
                </h4>
                {selectedGlossary.entries.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    No entries yet. Add your first translation pair above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedGlossary.entries.map(entry => (
                      <div
                        key={entry.id}
                        className="p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">
                                {entry.source}
                              </span>
                              <span className="text-slate-400">→</span>
                              <span className="font-semibold text-indigo-600">
                                {entry.target}
                              </span>
                            </div>
                            {entry.context && (
                              <p className="text-xs text-slate-500 mb-1">
                                {entry.context}
                              </p>
                            )}
                            {entry.caseSensitive && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Case Sensitive
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditEntry(entry)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a glossary</p>
                <p className="text-xs mt-1">Or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GlossaryManager;

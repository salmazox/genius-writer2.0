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
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

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
  const { t } = useThemeLanguage();
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
      showToast(t('glossary.enterName'), 'error');
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
    showToast(t('glossary.created'), 'success');
  };

  const handleDeleteGlossary = (id: string) => {
    if (!confirm(t('glossary.confirmDelete'))) return;

    deleteGlossary(id);
    loadGlossaries();
    if (selectedGlossary?.id === id) {
      setSelectedGlossary(null);
    }
    showToast(t('glossary.deleted'), 'success');
  };

  const handleAddEntry = () => {
    if (!selectedGlossary) return;
    if (!newEntrySource.trim() || !newEntryTarget.trim()) {
      showToast(t('glossary.sourceTargetRequired'), 'error');
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
    showToast(t('glossary.entryAdded'), 'success');
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
    showToast(t('glossary.entryUpdated'), 'success');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedGlossary) return;

    deleteGlossaryEntry(selectedGlossary.id, entryId);

    const updated = getGlossary(selectedGlossary.id);
    if (updated) setSelectedGlossary(updated);
    showToast(t('glossary.entryDeleted'), 'success');
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
    showToast(t('glossary.exported'), 'success');
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
          t('glossary.importedWithErrors').replace('{success}', result.success.toString()).replace('{errors}', result.errors.length.toString()),
          'info'
        );
      } else {
        showToast(t('glossary.imported').replace('{count}', result.success.toString()), 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('glossary.title')} size="lg">
      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Left Sidebar - Glossary List */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 max-h-64 md:max-h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-600 uppercase">{t('glossary.glossaries')}</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 hover:bg-indigo-50 rounded transition-colors"
              title={t('glossary.create')}
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
                placeholder={t('glossary.name')}
                className="w-full text-sm border rounded px-2 py-1.5"
              />
              <textarea
                value={newGlossaryDesc}
                onChange={(e) => setNewGlossaryDesc(e.target.value)}
                placeholder={t('glossary.description')}
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
                  {t('glossary.create')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  {t('glossary.cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Glossary List */}
          <div className="space-y-1 overflow-y-auto max-h-[500px]">
            {glossaries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {t('glossary.noGlossaries')}
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
                        {t('glossary.entries').replace('{count}', glossary.entries.length.toString())}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGlossary(glossary.id);
                      }}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title={t('glossary.delete')}
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
        <div className="flex-1 pl-0 md:pl-4 pt-4 md:pt-0 flex flex-col overflow-hidden">
          {selectedGlossary ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                    {selectedGlossary.name}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
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
              <div className="mb-4 p-3 md:p-4 bg-slate-50 rounded-lg space-y-2">
                <h4 className="text-xs md:text-sm font-bold text-slate-700">
                  {editingEntry ? t('glossary.editEntry') : t('glossary.addEntry')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newEntrySource}
                    onChange={(e) => setNewEntrySource(e.target.value)}
                    placeholder={t('glossary.sourceTerm')}
                    className="text-sm border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    value={newEntryTarget}
                    onChange={(e) => setNewEntryTarget(e.target.value)}
                    placeholder={t('glossary.targetTranslation')}
                    className="text-sm border rounded px-3 py-2"
                  />
                </div>
                <input
                  type="text"
                  value={newEntryContext}
                  onChange={(e) => setNewEntryContext(e.target.value)}
                  placeholder={t('glossary.context')}
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
                    {t('glossary.caseSensitive')}
                  </label>
                  <div className="flex gap-1">
                    {editingEntry && (
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        {t('glossary.cancel')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                    >
                      {editingEntry ? t('glossary.update') : t('glossary.add')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Entries List */}
              <div className="flex-1 overflow-y-auto">
                <h4 className="text-sm font-bold text-slate-700 mb-2">
                  {t('glossary.entriesList').replace('{count}', selectedGlossary.entries.length.toString())}
                </h4>
                {selectedGlossary.entries.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    {t('glossary.noEntries')}
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
                                {t('glossary.caseSensitive')}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditEntry(entry)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title={t('glossary.edit')}
                            >
                              <Edit2 size={14} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title={t('glossary.delete')}
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
                <p className="text-sm font-medium">{t('glossary.selectGlossary')}</p>
                <p className="text-xs mt-1">{t('glossary.createToStart')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GlossaryManager;

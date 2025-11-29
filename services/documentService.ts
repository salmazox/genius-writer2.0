
import { SavedDocument, ToolType, Folder } from '../types';

const DOCS_STORAGE_KEY = 'genius_writer_documents';
const FOLDERS_STORAGE_KEY = 'genius_writer_folders';

export const documentService = {
  // --- Documents ---
  getAll: (): SavedDocument[] => {
    try {
      const data = localStorage.getItem(DOCS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load documents', e);
      return [];
    }
  },

  getById: (id: string): SavedDocument | undefined => {
    const docs = documentService.getAll();
    return docs.find(d => d.id === id);
  },

  save: (doc: SavedDocument): void => {
    const docs = documentService.getAll();
    const index = docs.findIndex(d => d.id === doc.id);
    
    if (index >= 0) {
      const existingDoc = docs[index];
      
      // Create version if content changed
      let newVersions = existingDoc.versions || [];
      if (existingDoc.content !== doc.content) {
          newVersions.unshift({
              id: Date.now().toString(),
              timestamp: existingDoc.lastModified,
              content: existingDoc.content,
              changeDescription: 'Auto-save',
              type: 'text'
          });
          // Limit to 10 versions to save space
          if (newVersions.length > 10) newVersions = newVersions.slice(0, 10);
      }
      
      docs[index] = { 
          ...doc, 
          versions: newVersions,
          lastModified: Date.now() 
      };
    } else {
      docs.push({ ...doc, lastModified: Date.now(), versions: [] });
    }
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  },

  // Soft Delete
  delete: (id: string): void => {
    const docs = documentService.getAll();
    const index = docs.findIndex(d => d.id === id);
    if (index >= 0) {
        docs[index].deletedAt = Date.now();
        localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
    }
  },

  // Restore from Trash
  restore: (id: string): void => {
      const docs = documentService.getAll();
      const index = docs.findIndex(d => d.id === id);
      if (index >= 0) {
          docs[index].deletedAt = undefined;
          localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
      }
  },

  // Permanent Delete
  hardDelete: (id: string): void => {
      const docs = documentService.getAll().filter(d => d.id !== id);
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  },

  duplicate: (id: string): SavedDocument | null => {
      const doc = documentService.getById(id);
      if (!doc) return null;

      const newDoc: SavedDocument = {
          ...doc,
          id: Date.now().toString(),
          title: `${doc.title} (Copy)`,
          lastModified: Date.now(),
          versions: [], // Don't copy history
          deletedAt: undefined
      };
      documentService.save(newDoc);
      return newDoc;
  },
  
  create: (title: string, content: string, templateId: ToolType, folderId?: string, tags?: string[]): SavedDocument => {
      const newDoc: SavedDocument = {
          id: Date.now().toString(),
          title: title || 'Untitled Document',
          content, 
          templateId,
          lastModified: Date.now(),
          versions: [],
          folderId,
          tags: tags || []
      };
      documentService.save(newDoc);
      return newDoc;
  },

  moveToFolder: (docId: string, folderId: string | undefined): void => {
      const doc = documentService.getById(docId);
      if (doc) {
          doc.folderId = folderId;
          documentService.save(doc);
      }
  },

  // --- Folders ---
  getFolders: (): Folder[] => {
      try {
          const data = localStorage.getItem(FOLDERS_STORAGE_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },

  createFolder: (name: string): Folder => {
      const folders = documentService.getFolders();
      const newFolder: Folder = {
          id: Date.now().toString(),
          name,
          createdAt: Date.now()
      };
      folders.push(newFolder);
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      return newFolder;
  },

  deleteFolder: (id: string): void => {
      // Remove folder
      const folders = documentService.getFolders().filter(f => f.id !== id);
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      
      // Move documents in this folder to root (undefined)
      const docs = documentService.getAll();
      const updatedDocs = docs.map(d => d.folderId === id ? { ...d, folderId: undefined } : d);
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updatedDocs));
  },

  // --- Backup & Restore ---
  exportData: (): string => {
      const data = {
          documents: documentService.getAll(),
          folders: documentService.getFolders(),
          user: localStorage.getItem('ai_writer_user') ? JSON.parse(localStorage.getItem('ai_writer_user')!) : null,
          exportedAt: Date.now()
      };
      return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string): boolean => {
      try {
          const data = JSON.parse(jsonString);
          if (data.documents) localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(data.documents));
          if (data.folders) localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(data.folders));
          if (data.user) localStorage.setItem('ai_writer_user', JSON.stringify(data.user));
          return true;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  }
};

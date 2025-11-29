import { SavedDocument, ToolType } from '../types';

const STORAGE_KEY = 'genius_writer_documents';

export const documentService = {
  getAll: (): SavedDocument[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
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
      docs[index] = { ...doc, lastModified: Date.now() };
    } else {
      docs.push({ ...doc, lastModified: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  },

  delete: (id: string): void => {
    const docs = documentService.getAll().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  },
  
  create: (title: string, content: string, templateId: ToolType): SavedDocument => {
      const newDoc: SavedDocument = {
          id: Date.now().toString(),
          title: title || 'Untitled Document',
          content, 
          templateId,
          lastModified: Date.now(),
          versions: []
      };
      documentService.save(newDoc);
      return newDoc;
  }
};
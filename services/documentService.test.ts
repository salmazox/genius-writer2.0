import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentService } from './documentService';
import { ToolType, SavedDocument } from '../types';

describe('documentService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('creates a new document correctly', () => {
        const doc = documentService.create('Test Title', 'Test Content', ToolType.SMART_EDITOR);
        
        expect(doc.title).toBe('Test Title');
        expect(doc.content).toBe('Test Content');
        expect(doc.templateId).toBe(ToolType.SMART_EDITOR);
        expect(doc.id).toBeDefined();
        
        // Verify storage
        const allDocs = documentService.getAll();
        expect(allDocs).toHaveLength(1);
        expect(allDocs[0].id).toBe(doc.id);
    });

    it('updates an existing document and creates a version', () => {
        const doc = documentService.create('V1', 'Content V1', ToolType.SMART_EDITOR);
        
        // Wait a tick to ensure timestamps might differ if we were using real time, 
        // but here we just check logic.
        
        const updatedDoc: SavedDocument = {
            ...doc,
            title: 'V2',
            content: 'Content V2'
        };
        
        documentService.save(updatedDoc);
        
        const storedDoc = documentService.getById(doc.id);
        expect(storedDoc).toBeDefined();
        expect(storedDoc?.title).toBe('V2');
        expect(storedDoc?.content).toBe('Content V2');
        
        // Check versions
        expect(storedDoc?.versions).toHaveLength(1);
        expect(storedDoc?.versions[0].content).toBe('Content V1');
    });

    it('does not create a version if content is unchanged', () => {
        const doc = documentService.create('V1', 'Same Content', ToolType.SMART_EDITOR);
        
        const updatedDoc: SavedDocument = {
            ...doc,
            title: 'New Title Only'
        };
        
        documentService.save(updatedDoc);
        
        const storedDoc = documentService.getById(doc.id);
        expect(storedDoc?.title).toBe('New Title Only');
        expect(storedDoc?.versions).toHaveLength(0);
    });

    it('deletes a document', () => {
        const doc = documentService.create('To Delete', 'Content', ToolType.SMART_EDITOR);
        expect(documentService.getAll()).toHaveLength(1);
        
        documentService.delete(doc.id);
        // Soft delete keeps it but marks deletedAt
        const stored = documentService.getAll();
        expect(stored[0].deletedAt).toBeDefined();
        
        documentService.hardDelete(doc.id);
        expect(documentService.getAll()).toHaveLength(0);
    });

    it('creates and manages folders', () => {
        const folder = documentService.createFolder('My Folder');
        expect(folder.name).toBe('My Folder');
        
        const folders = documentService.getFolders();
        expect(folders).toHaveLength(1);
        expect(folders[0].id).toBe(folder.id);
        
        documentService.deleteFolder(folder.id);
        expect(documentService.getFolders()).toHaveLength(0);
    });
});
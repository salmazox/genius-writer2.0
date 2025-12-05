// Document Service - Backend API Integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://genius-writer.up.railway.app';

export interface Document {
  id: string;
  title: string;
  content: string;
  templateId: string;
  folderId?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  description?: string;
  createdAt: string;
}

export interface DocumentResponse {
  message: string;
  document: Document;
  usage?: {
    documents?: {
      current: number;
      limit: number;
      remaining: number;
    };
    storage?: {
      current: number;
      currentGB: string;
      limit: number;
      limitGB: number;
      percentage: number;
    };
  };
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class DocumentServiceAPI {
  private getAuthHeader() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all documents with pagination
   */
  async getAll(options?: {
    page?: number;
    limit?: number;
    templateId?: string;
    folderId?: string;
    tags?: string;
    search?: string;
    includeDeleted?: boolean;
  }): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.templateId) params.set('templateId', options.templateId);
    if (options?.folderId) params.set('folderId', options.folderId);
    if (options?.tags) params.set('tags', options.tags);
    if (options?.search) params.set('search', options.search);
    if (options?.includeDeleted) params.set('includeDeleted', 'true');

    const response = await fetch(`${API_BASE_URL}/api/documents?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Get a single document by ID
   */
  async getById(id: string): Promise<{ document: Document }> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Create a new document
   * May throw limit error if user has reached their document limit
   */
  async create(data: {
    title: string;
    content: string;
    templateId: string;
    folderId?: string;
    tags?: string[];
  }): Promise<DocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Throw error with status for upgrade prompt handling
      throw { status: response.status, data: result };
    }

    return result;
  }

  /**
   * Update an existing document
   */
  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      folderId?: string;
      tags?: string[];
      createVersion?: boolean;
      versionDescription?: string;
    }
  ): Promise<DocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw { status: response.status, data: result };
    }

    return result;
  }

  /**
   * Delete a document (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Permanently delete a document
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}?permanent=true`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Restore a deleted document
   */
  async restore(id: string): Promise<DocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}/restore`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw { status: response.status, data: result };
    }

    return result;
  }

  /**
   * Get document versions
   */
  async getVersions(id: string): Promise<{ versions: DocumentVersion[] }> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}/versions`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Restore document to a specific version
   */
  async restoreVersion(documentId: string, versionId: string): Promise<DocumentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${documentId}/versions/${versionId}/restore`,
      {
        method: 'POST',
        headers: this.getAuthHeader(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw { status: response.status, data: result };
    }

    return result;
  }

  /**
   * Get document statistics
   */
  async getStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/documents/stats/summary`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }

    return response.json();
  }

  /**
   * Duplicate a document
   */
  async duplicate(id: string): Promise<DocumentResponse> {
    // Get the original document
    const { document: original } = await this.getById(id);

    // Create a copy
    return this.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      templateId: original.templateId,
      folderId: original.folderId || undefined,
      tags: original.tags || [],
    });
  }
}

// Export singleton instance
export const documentServiceAPI = new DocumentServiceAPI();

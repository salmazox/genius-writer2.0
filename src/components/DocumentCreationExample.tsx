/**
 * Example: Document Creation with Limit Handling
 *
 * This file demonstrates how to use the new subscription system
 * in your document creation flows.
 */

import React, { useState } from 'react';
import { documentServiceAPI } from '../services/documentServiceAPI';
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { UpgradeModal } from './UpgradeModal';

export const DocumentCreationExample: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { promptState, handleApiError, closeUpgradePrompt } = useUpgradePrompt();

  const handleCreateDocument = async () => {
    try {
      setLoading(true);

      const result = await documentServiceAPI.create({
        title,
        content,
        templateId: 'blog-post',
      });

      console.log('Document created successfully:', result);

      // Show usage info if available
      if (result.usage) {
        console.log('Usage stats:', result.usage);
        // You could show a toast notification here
        alert(`Document created! ${result.usage.documents?.remaining || 0} documents remaining this month.`);
      }

      // Reset form
      setTitle('');
      setContent('');
    } catch (error: any) {
      console.error('Failed to create document:', error);

      // Try to handle as limit error
      const wasLimitError = handleApiError(error);

      if (!wasLimitError) {
        // Handle other errors
        alert(`Error: ${error.data?.message || 'Failed to create document'}`);
      }
      // If it was a limit error, the upgrade modal will be shown automatically
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Create New Document</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter document title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={6}
            placeholder="Enter document content"
          />
        </div>

        <button
          onClick={handleCreateDocument}
          disabled={loading || !title || !content}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Document'}
        </button>
      </div>

      {/* Upgrade Modal - automatically shown when limit is reached */}
      <UpgradeModal
        isOpen={promptState.isOpen}
        onClose={closeUpgradePrompt}
        limitType={promptState.limitType}
        feature={promptState.feature}
        currentPlan={promptState.currentPlan}
        message={promptState.message}
      />
    </div>
  );
};

/**
 * Table of Contents Component
 *
 * Auto-generates a clickable table of contents from document headings.
 * Updates in real-time as the document changes.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { List, X, ChevronRight, Hash } from 'lucide-react';
import { extractHeadings, Heading } from '../services/documentOutliner';

interface TableOfContentsProps {
  content: string;
  onHeadingClick?: (heading: Heading) => void;
  onClose?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  onHeadingClick,
  onClose
}) => {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [collapsedLevels, setCollapsedLevels] = useState<Set<string>>(new Set());

  // Extract headings from content
  const headings = useMemo(() => {
    return extractHeadings(content);
  }, [content]);

  // Group headings by hierarchy
  const headingTree = useMemo(() => {
    interface HeadingNode extends Heading {
      children: HeadingNode[];
      parent?: HeadingNode;
    }

    const root: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    headings.forEach((heading) => {
      const node: HeadingNode = {
        ...heading,
        children: []
      };

      // Pop stack until we find a parent with lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      // Add to parent or root
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        parent.children.push(node);
        node.parent = parent;
      } else {
        root.push(node);
      }

      stack.push(node);
    });

    return root;
  }, [headings]);

  const toggleLevel = (headingId: string) => {
    setCollapsedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(headingId)) {
        newSet.delete(headingId);
      } else {
        newSet.add(headingId);
      }
      return newSet;
    });
  };

  const handleHeadingClick = (heading: Heading) => {
    setActiveHeading(heading.id);
    onHeadingClick?.(heading);
  };

  const getIndentClass = (level: number): string => {
    // Map heading levels (1-6) to indentation
    const indents = [
      'pl-0',    // h1
      'pl-4',    // h2
      'pl-8',    // h3
      'pl-12',   // h4
      'pl-16',   // h5
      'pl-20'    // h6
    ];
    return indents[Math.min(level - 1, 5)];
  };

  const getHeadingColor = (level: number): string => {
    const colors = [
      'text-slate-900 dark:text-white font-bold',        // h1
      'text-slate-800 dark:text-slate-100 font-semibold', // h2
      'text-slate-700 dark:text-slate-200',              // h3
      'text-slate-600 dark:text-slate-300',              // h4
      'text-slate-500 dark:text-slate-400',              // h5
      'text-slate-500 dark:text-slate-400'               // h6
    ];
    return colors[Math.min(level - 1, 5)];
  };

  interface HeadingNode extends Heading {
    children: HeadingNode[];
    parent?: HeadingNode;
  }

  const renderHeading = (node: HeadingNode) => {
    const isCollapsed = collapsedLevels.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = activeHeading === node.id;

    return (
      <div key={node.id} className="mb-1">
        <div
          className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors group ${
            getIndentClass(node.level)
          } ${
            isActive
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => handleHeadingClick(node)}
        >
          {/* Collapse/Expand Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLevel(node.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              <ChevronRight
                size={14}
                className={`transition-transform ${
                  !isCollapsed ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}

          {/* Heading Level Indicator */}
          <span className="flex-shrink-0 w-5 text-xs text-slate-400 dark:text-slate-500">
            H{node.level}
          </span>

          {/* Heading Text */}
          <span className={`flex-1 text-sm truncate ${getHeadingColor(node.level)}`}>
            {node.text}
          </span>
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div className="mt-1">
            {node.children.map((child) => renderHeading(child))}
          </div>
        )}
      </div>
    );
  };

  const expandAll = () => {
    setCollapsedLevels(new Set());
  };

  const collapseAll = () => {
    const allIds = new Set(headings.map(h => h.id));
    setCollapsedLevels(allIds);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <List size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Table of Contents
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* Stats */}
        {headings.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>{headings.length} headings</span>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs"
              >
                Collapse All
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <div className="flex items-center gap-1">
            <Hash size={12} />
            <span>Click to navigate</span>
          </div>
        </div>
      </div>

      {/* TOC Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        {headings.length === 0 ? (
          <div className="text-center py-12">
            <List size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-2">
              No headings found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Add headings (H1-H6) to your document to generate a table of contents
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {headingTree.map((node) => renderHeading(node))}
          </div>
        )}
      </div>

      {/* Footer with Export Option */}
      {headings.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <button
            onClick={() => {
              // Copy TOC as markdown
              const markdown = headings
                .map(h => {
                  const indent = '  '.repeat(h.level - 1);
                  return `${indent}- ${h.text}`;
                })
                .join('\n');

              navigator.clipboard.writeText(markdown);
            }}
            className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <List size={16} />
              Copy TOC as Markdown
          </button>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;

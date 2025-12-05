const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/documents
 * List all user documents (with pagination and filtering)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      templateId,
      folderId,
      tags,
      search,
      includeDeleted = false
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId: req.userId,
      ...(includeDeleted === 'true' ? {} : { deletedAt: null }),
      ...(templateId && { templateId }),
      ...(folderId && { folderId }),
      ...(tags && { tags: { hasSome: tags.split(',') } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          templateId: true,
          folderId: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          // Don't return full content in list view for performance
          content: false
        }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[DOCUMENTS] List error:', error);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: 'An error occurred while retrieving documents'
    });
  }
});

/**
 * GET /api/documents/:id
 * Get a single document by ID (with full content)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 versions
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have access'
      });
    }

    res.json({ document });
  } catch (error) {
    console.error('[DOCUMENTS] Get error:', error);
    res.status(500).json({
      error: 'Failed to fetch document',
      message: 'An error occurred while retrieving the document'
    });
  }
});

/**
 * POST /api/documents
 * Create a new document
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      content,
      templateId,
      folderId,
      tags
    } = req.body;

    // Validation
    if (!title || !content || !templateId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, content, and templateId are required'
      });
    }

    // TODO: Check user plan limits (documents per month)
    // This should be implemented with usage tracking

    const document = await prisma.document.create({
      data: {
        userId: req.userId,
        title,
        content,
        templateId,
        folderId: folderId || null,
        tags: tags || []
      }
    });

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        content,
        description: 'Initial version'
      }
    });

    res.status(201).json({
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    console.error('[DOCUMENTS] Create error:', error);
    res.status(500).json({
      error: 'Failed to create document',
      message: 'An error occurred while creating the document'
    });
  }
});

/**
 * PUT /api/documents/:id
 * Update an existing document
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      folderId,
      tags,
      createVersion = false,
      versionDescription
    } = req.body;

    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!existingDocument) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have access'
      });
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(folderId !== undefined && { folderId }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date()
      }
    });

    // Create version if requested and content changed
    if (createVersion && content && content !== existingDocument.content) {
      await prisma.documentVersion.create({
        data: {
          documentId: id,
          content,
          description: versionDescription || 'Updated version'
        }
      });
    }

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('[DOCUMENTS] Update error:', error);
    res.status(500).json({
      error: 'Failed to update document',
      message: 'An error occurred while updating the document'
    });
  }
});

/**
 * DELETE /api/documents/:id
 * Soft delete a document
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!existingDocument) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have access'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion (cascading deletes will handle versions)
      await prisma.document.delete({
        where: { id }
      });

      res.json({
        message: 'Document permanently deleted'
      });
    } else {
      // Soft delete
      const document = await prisma.document.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      res.json({
        message: 'Document moved to trash',
        document
      });
    }
  } catch (error) {
    console.error('[DOCUMENTS] Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: 'An error occurred while deleting the document'
    });
  }
});

/**
 * POST /api/documents/:id/restore
 * Restore a soft-deleted document
 */
router.post('/:id/restore', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId,
        deletedAt: { not: null }
      }
    });

    if (!existingDocument) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist in trash or you do not have access'
      });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        deletedAt: null
      }
    });

    res.json({
      message: 'Document restored successfully',
      document
    });
  } catch (error) {
    console.error('[DOCUMENTS] Restore error:', error);
    res.status(500).json({
      error: 'Failed to restore document',
      message: 'An error occurred while restoring the document'
    });
  }
});

/**
 * GET /api/documents/:id/versions
 * Get all versions of a document
 */
router.get('/:id/versions', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists and belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have access'
      });
    }

    const versions = await prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ versions });
  } catch (error) {
    console.error('[DOCUMENTS] Get versions error:', error);
    res.status(500).json({
      error: 'Failed to fetch versions',
      message: 'An error occurred while retrieving document versions'
    });
  }
});

/**
 * POST /api/documents/:id/versions/:versionId/restore
 * Restore document to a specific version
 */
router.post('/:id/versions/:versionId/restore', authenticate, async (req, res) => {
  try {
    const { id, versionId } = req.params;

    // Check if document exists and belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'Document does not exist or you do not have access'
      });
    }

    // Get the version
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id
      }
    });

    if (!version) {
      return res.status(404).json({
        error: 'Version not found',
        message: 'Document version does not exist'
      });
    }

    // Update document with version content
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        content: version.content,
        updatedAt: new Date()
      }
    });

    // Create a new version to track this restoration
    await prisma.documentVersion.create({
      data: {
        documentId: id,
        content: version.content,
        description: `Restored to version from ${version.createdAt.toISOString()}`
      }
    });

    res.json({
      message: 'Document restored to previous version',
      document: updatedDocument
    });
  } catch (error) {
    console.error('[DOCUMENTS] Restore version error:', error);
    res.status(500).json({
      error: 'Failed to restore version',
      message: 'An error occurred while restoring the document version'
    });
  }
});

/**
 * GET /api/documents/stats
 * Get user document statistics
 */
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const [total, deleted, byTemplate] = await Promise.all([
      prisma.document.count({
        where: {
          userId: req.userId,
          deletedAt: null
        }
      }),
      prisma.document.count({
        where: {
          userId: req.userId,
          deletedAt: { not: null }
        }
      }),
      prisma.document.groupBy({
        by: ['templateId'],
        where: {
          userId: req.userId,
          deletedAt: null
        },
        _count: true
      })
    ]);

    res.json({
      stats: {
        total,
        deleted,
        active: total,
        byTemplate: byTemplate.map(item => ({
          templateId: item.templateId,
          count: item._count
        }))
      }
    });
  } catch (error) {
    console.error('[DOCUMENTS] Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'An error occurred while retrieving document statistics'
    });
  }
});

module.exports = router;

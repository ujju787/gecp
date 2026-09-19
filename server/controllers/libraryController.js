import { db } from '../db.js';

// Get Library Resources with filtering
export const getResources = async (req, res) => {
  try {
    const { branch, semester, category, search } = req.query;
    const resources = await db.getLibraryResources({ branch, semester, category, search });
    return res.json(resources);
  } catch (error) {
    console.error('Error fetching library resources:', error);
    return res.status(500).json({ error: 'Failed to retrieve library resources.' });
  }
};

// Upload new study material / PYQ
export const uploadResource = async (req, res) => {
  try {
    const { title, category, branch, semester, tags, fileType, size } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Resource title is required.' });
    }

    const uploaderName = req.user ? `${req.user.name || 'Student'} (${req.user.role})` : 'Registered Student';

    const newResource = {
      id: `res-db-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      category: category || 'Student Shared Notes',
      branch: branch || 'CSE',
      semester: semester || '5th Semester',
      year: new Date().getFullYear().toString(),
      fileType: fileType || 'PDF',
      size: size || '3.2 MB',
      downloads: 0,
      rating: 5.0,
      uploadedBy: uploaderName,
      uploaderId: req.user?.id || 'anonymous',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      verifiedByAdmin: req.user?.role === 'admin' || req.user?.role === 'faculty',
      createdAt: new Date().toISOString().split('T')[0]
    };

    await db.createLibraryResource(newResource);

    return res.status(201).json({
      message: 'Study resource uploaded & permanently stored in GEC Palamu Digital Library (MySQL)!',
      resource: newResource
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload resource.' });
  }
};

// Download / Increment count
export const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.incrementResourceDownload(id);
    if (!item) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    return res.json({
      message: 'Download verified.',
      downloads: item.downloads,
      resource: item
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process download.' });
  }
};

// Admin: Delete resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteLibraryResource(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    return res.json({
      message: 'Resource removed from digital library.',
      deleted
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete resource.' });
  }
};

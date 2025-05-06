import Staff from '../model/staffModel.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/email.js';
import fs from 'fs';
import path from 'path';

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password -confirmPassword');
    res.status(200).json(staff);
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
};

const addStaff = async (req, res) => {
  const { firstName, lastName, fullName, username, email, phoneNumber, role, password, confirmPassword } = req.body;
  const profilePic = req.files?.profilePic ? req.files.profilePic[0].filename : '';
  const uploadedDocs = req.files?.documents || [];
  const documents = Array.isArray(uploadedDocs)
    ? uploadedDocs.map((file) => ({
        name: file.originalname,
        path: file.filename,
        type: file.mimetype.startsWith('image') ? 'image' : 'pdf',
      }))
    : [];

  // Validate documents
  for (const doc of documents) {
    if (
      typeof doc !== 'object' ||
      !doc.name ||
      typeof doc.name !== 'string' ||
      !doc.path ||
      typeof doc.path !== 'string' ||
      !doc.type ||
      typeof doc.type !== 'string'
    ) {
      console.error('Invalid document format in addStaff:', doc);
      return res.status(400).json({ message: 'Invalid document format' });
    }
  }

  if (!firstName && !fullName) {
    return res.status(400).json({ message: 'Either firstName or fullName is required' });
  }
  if (fullName && !role) {
    return res.status(400).json({ message: 'Role is required when fullName is provided' });
  }
  if (!username || !email || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = new Staff({
      firstName,
      lastName,
      fullName,
      username,
      email,
      phoneNumber,
      role,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      profilePic,
      documents,
    });
    await staff.save();
    const { password: _, confirmPassword: __, ...staffDetails } = staff._doc;
    return res.status(201).json({ staff: staffDetails, message: 'Staff added successfully' });
  } catch (err) {
    console.error('Add staff error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    return res.status(500).json({ message: 'Unable to add staff' });
  }
};

const updateStaff = async (req, res) => {
  const { firstName, lastName, fullName, username, email, phoneNumber, role } = req.body;
  const profilePic = req.files?.profilePic ? req.files.profilePic[0].filename : undefined;
  const uploadedDocs = req.files?.documents || [];
  const newDocuments = Array.isArray(uploadedDocs)
    ? uploadedDocs.map((file) => ({
        name: file.originalname,
        path: file.filename,
        type: file.mimetype.startsWith('image') ? 'image' : 'pdf',
      }))
    : [];

  // Validate new documents
  for (const doc of newDocuments) {
    if (
      typeof doc !== 'object' ||
      !doc.name ||
      typeof doc.name !== 'string' ||
      !doc.path ||
      typeof doc.path !== 'string' ||
      !doc.type ||
      typeof doc.type !== 'string'
    ) {
      console.error('Invalid document format in updateStaff:', doc);
      return res.status(400).json({ message: 'Invalid document format' });
    }
  }

  if (!firstName && !fullName) {
    return res.status(400).json({ message: 'Either firstName or fullName is required' });
  }
  if (fullName && !role) {
    return res.status(400).json({ message: 'Role is required when fullName is provided' });
  }
  if (!username || !email || !phoneNumber) {
    return res.status(400).json({ message: 'Username, email, and phoneNumber are required' });
  }

  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.firstName = firstName || staff.firstName;
    staff.lastName = lastName || staff.lastName;
    staff.fullName = fullName || staff.fullName;
    staff.username = username;
    staff.email = email;
    staff.phoneNumber = phoneNumber;
    staff.role = role || staff.role;
    if (profilePic) staff.profilePic = profilePic;

    if (newDocuments.length > 0) {
      // Ensure documents is an array and clean invalid entries
      staff.documents = Array.isArray(staff.documents)
        ? staff.documents.filter(
            (doc) =>
              doc &&
              typeof doc === 'object' &&
              typeof doc.name === 'string' &&
              typeof doc.path === 'string' &&
              typeof doc.type === 'string'
          )
        : [];
      staff.documents.push(...newDocuments);
    }

    await staff.save();
    const { password, confirmPassword, ...staffDetails } = staff._doc;
    res.status(200).json({ staff: staffDetails, message: 'Staff updated successfully' });
  } catch (err) {
    console.error('Update staff error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Failed to update staff' });
  }
};

const addDocuments = async (req, res) => {
  try {
    console.log('req.files:', req.files);

    if (!req.files || !req.files.documents) {
      return res.status(400).json({ message: 'No documents uploaded' });
    }

    // Ensure documents is an array, even if a single file is uploaded
    const uploadedFiles = Array.isArray(req.files.documents)
      ? req.files.documents
      : [req.files.documents];

    // Map uploaded files to document objects
    const newDocuments = uploadedFiles.map((file) => {
      const filePath = path.join(process.cwd(), 'documents', file.filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found after upload: ${file.filename}`);
      }
      return {
        name: file.originalname,
        path: file.filename,
        type: file.mimetype.startsWith('image') ? 'image' : 'pdf',
      };
    });

    // Validate each document object
    for (const doc of newDocuments) {
      if (
        typeof doc !== 'object' ||
        !doc.name ||
        typeof doc.name !== 'string' ||
        !doc.path ||
        typeof doc.path !== 'string' ||
        !doc.type ||
        typeof doc.type !== 'string'
      ) {
        console.error('Invalid document format:', doc);
        return res.status(400).json({ message: 'Invalid document format' });
      }
    }

    console.log('newDocuments:', newDocuments);

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Ensure documents is an array and clean invalid entries
    staff.documents = Array.isArray(staff.documents)
      ? staff.documents.filter(
          (doc) =>
            doc &&
            typeof doc === 'object' &&
            typeof doc.name === 'string' &&
            typeof doc.path === 'string' &&
            typeof doc.type === 'string'
        )
      : [];

    // Append new documents
    staff.documents.push(...newDocuments);

    console.log('staff.documents before save:', staff.documents);

    await staff.save();
    console.log('Saved staff.documents:', staff.documents);

    const { password, confirmPassword, ...staffDetails } = staff._doc;
    res.status(200).json({ staff: staffDetails, message: 'Documents added successfully' });
  } catch (err) {
    console.error('Add documents error:', err);
    res.status(500).json({ message: err.message || 'Failed to add documents' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Failed to delete staff' });
  }
};

const notifyUpdate = async (req, res) => {
  const { adminEmail, staffId, staffName, updatedFields } = req.body;

  if (!adminEmail || !staffId || !staffName) {
    return res.status(400).json({ message: 'Admin email, staff ID, and staff name are required' });
  }

  try {
    const subject = `Staff Update Notification: ${staffName}`;
    const text = `
      Dear Admin,
      
      The details for staff member ${staffName} (ID: ${staffId}) have been updated.
      
      Updated Fields:
      - First Name: ${updatedFields.firstName || 'N/A'}
      - Last Name: ${updatedFields.lastName || 'N/A'}
      - Full Name: ${updatedFields.fullName || 'N/A'}
      - Username: ${updatedFields.username || 'N/A'}
      - Email: ${updatedFields.email || 'N/A'}
      - Phone Number: ${updatedFields.phoneNumber || 'N/A'}
      - Role: ${updatedFields.role || 'N/A'}
      
      Regards,
      Staff Management System
    `;

    await sendEmail(adminEmail, subject, text);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (err) {
    console.error('Notify update error:', err);
    res.status(500).json({ message: 'Failed to send notification' });
  }
};

export default { getStaff, addStaff, updateStaff, addDocuments, deleteStaff, notifyUpdate };
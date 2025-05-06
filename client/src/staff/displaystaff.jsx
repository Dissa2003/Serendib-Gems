
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import logo from '../assets/serendib-gems-logo.jpeg';
import './css/displaystaff.css';

const DisplayStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateStaff, setUpdateStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  if (!process.env.REACT_APP_API_URL) {
    console.warn('REACT_APP_API_URL is not set. Using default: ', API_URL);
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to view staff');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(response.data);
      setFilteredStaff(response.data);
    } catch (err) {
      console.error('Fetch staff error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch staff');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = staffList;

    if (searchQuery) {
      filtered = filtered.filter(
        (staff) =>
          (staff.fullName || `${staff.firstName || ''} ${staff.lastName || ''}`)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          staff.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((staff) => staff.role === roleFilter);
    }

    setFilteredStaff(filtered);
  }, [searchQuery, roleFilter, staffList]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(staffList.filter((staff) => staff._id !== id));
      setFilteredStaff(filteredStaff.filter((staff) => staff._id !== id));
    } catch (err) {
      console.error('Delete staff error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to delete staff');
      }
    }
  };

  const handleUpdateClick = (staff) => {
    setUpdateStaff(staff);
    setFormData({
      firstName: staff.firstName || '',
      lastName: staff.lastName || '',
      fullName: staff.fullName || '',
      username: staff.username || '',
      email: staff.email || '',
      phoneNumber: staff.phoneNumber || '',
      role: staff.role || '',
    });
    setProfilePic(null);
    setDocuments([]);
    setIsModalOpen(true);
    setError('');
  };

  const handleAddDocumentClick = (staffId) => {
    setSelectedStaffId(staffId);
    setDocuments([]);
    setIsDocumentModalOpen(true);
    setError('');
  };

  const handleDetailsClick = (staff) => {
    setSelectedStaff(staff);
    setIsDetailsModalOpen(true);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const files = Array.from(e.target.files).filter((file) => {
      if (!file.name || !file.type) {
        console.error('Invalid file detected:', file);
        setError('One or more selected files are invalid.');
        return false;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        console.error('Unsupported file type:', file.type);
        setError(`Unsupported file type for ${file.name}. Please upload PDFs or images.`);
        return false;
      }
      if (file.size > maxSize) {
        console.error('File too large:', file.name);
        setError(`File ${file.name} exceeds 5MB limit.`);
        return false;
      }
      if (documents.some((doc) => doc.name === file.name)) {
        console.error('Duplicate file detected:', file.name);
        setError(`File ${file.name} is already selected.`);
        return false;
      }
      return true;
    });
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.firstName && !formData.fullName) {
      return 'Please provide either First Name or Full Name';
    }
    if (formData.fullName && !formData.role) {
      return 'Please select a Role when Full Name is provided';
    }
    if (!formData.username.trim()) {
      return 'Please provide a Username';
    }
    if (!formData.email.trim()) {
      return 'Please provide an Email';
    }
    if (!formData.phoneNumber.trim()) {
      return 'Please provide a Phone Number';
    }
    return '';
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUpdating(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsUpdating(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setIsUpdating(false);
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('role', formData.role);
    if (profilePic) {
      data.append('profilePic', profilePic);
    }
    documents.forEach((doc) => {
      data.append('documents', doc);
    });

    try {
      const response = await axios.put(
        `${API_URL}/api/staff/${updateStaff._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.staff) {
        throw new Error('Invalid response: staff data missing');
      }

      const updatedStaff = response.data.staff;
      setStaffList(
        staffList.map((staff) =>
          staff._id === updateStaff._id ? updatedStaff : staff
        )
      );
      setFilteredStaff(
        filteredStaff.map((staff) =>
          staff._id === updateStaff._id ? updatedStaff : staff
        )
      );

      const adminEmail = localStorage.getItem('adminEmail') || 'admin@example.com';
      try {
        await axios.post(
          `${API_URL}/api/staff/notify-update`,
          {
            adminEmail,
            staffId: updateStaff._id,
            staffName: updatedStaff.fullName || `${updatedStaff.firstName || ''} ${updatedStaff.lastName || ''}`,
            updatedFields: formData,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Email notification sent to admin');
      } catch (emailErr) {
        console.error('Email notification error:', emailErr.response?.data || emailErr.message);
        setError('Staff updated, but failed to send email notification');
      }

      setIsModalOpen(false);
      setUpdateStaff(null);
      setFormData({
        firstName: '',
        lastName: '',
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        role: '',
      });
      setProfilePic(null);
      setDocuments([]);
    } catch (err) {
      console.error('Update staff error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid data provided. Please check your inputs.');
      } else if (err.response?.status === 404) {
        setError('Staff member not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to update staff. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUpdating(true);

    if (documents.length === 0) {
      setError('Please select at least one document to upload');
      setIsUpdating(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setIsUpdating(false);
      navigate('/login');
      return;
    }

    const data = new FormData();
    documents.forEach((doc) => {
      data.append('documents', doc);
    });

    try {
      const response = await axios.post(
        `${API_URL}/api/staff/${selectedStaffId}/add-documents`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.staff) {
        throw new Error('Invalid response: staff data missing');
      }

      const updatedStaff = response.data.staff;
      setStaffList(
        staffList.map((staff) =>
          staff._id === selectedStaffId ? updatedStaff : staff
        )
      );
      setFilteredStaff(
        filteredStaff.map((staff) =>
          staff._id === selectedStaffId ? updatedStaff : staff
        )
      );

      setIsDocumentModalOpen(false);
      setDocuments([]);
      setSelectedStaffId(null);
    } catch (err) {
      console.error('Add document error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Staff member not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to add documents. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUpdateStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      role: '',
    });
    setProfilePic(null);
    setDocuments([]);
  };

  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setDocuments([]);
    setSelectedStaffId(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedStaff(null);
  };

  const generateStaffPDF = (staffData, filename) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const logoWidth = 30;
    const logoHeight = 30;

    // Validate logo
    let logoAvailable = true;
    try {
      new Image().src = logo;
    } catch (err) {
      console.error('Logo validation failed:', err);
      logoAvailable = false;
    }

    // Function to add header
    const addHeader = () => {
      if (logoAvailable) {
        try {
          doc.addImage(logo, 'JPEG', margin, margin, logoWidth, logoHeight);
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
          doc.setFontSize(10);
          doc.text('Logo not available', margin, margin + 10);
        }
      } else {
        doc.setFontSize(10);
        doc.text('Logo not available', margin, margin + 10);
      }

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Serendib Gems - Staff Details', margin + logoWidth + 10, margin + logoHeight / 2);
    };

    // Function to add footer
    const addFooter = (pageNumber) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Serendib Gems | Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - margin,
        { align: 'center' }
      );
    };

    // Function to add border
    const addBorder = () => {
      doc.setDrawColor(79, 70, 229); // --primary-color (#4f46e5)
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin, 'S');
    };

    let yPos = margin + logoHeight + 10;
    let pageNumber = 1;

    // Add initial header, border, and footer
    addHeader();
    addBorder();
    addFooter(pageNumber);

    staffData.forEach((staff, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        pageNumber++;
        yPos = margin + 10;
        addHeader();
        addBorder();
        addFooter(pageNumber);
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Staff ${index + 1}`, margin + 5, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const details = [
        `Full Name: ${staff.fullName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'N/A'}`,
        `Username: ${staff.username || 'N/A'}`,
        `Email: ${staff.email || 'N/A'}`,
        `Phone: ${staff.phoneNumber || 'N/A'}`,
        `Role: ${staff.role || 'N/A'}`,
        `Profile Picture: ${staff.profilePic ? 'Yes' : 'No'}`,
        `Documents: ${staff.documents?.length > 0 ? staff.documents.map(doc => doc.name).join('; ') : 'None'}`
      ];

      details.forEach((line) => {
        const lines = doc.splitTextToSize(line, contentWidth - 10);
        lines.forEach((splitLine) => {
          if (yPos > pageHeight - 40) {
            doc.addPage();
            pageNumber++;
            yPos = margin + 10;
            addHeader();
            addBorder();
            addFooter(pageNumber);
          }
          doc.text(splitLine, margin + 5, yPos);
          yPos += 7;
        });
      });

      yPos += 10;

    });

    doc.save(filename);
  };

  const downloadAllStaffPDF = () => {
    generateStaffPDF(staffList, 'all_staff_details.pdf');
  };

  const downloadFilteredStaffPDF = () => {
    generateStaffPDF(filteredStaff, 'filtered_staff_details.pdf');
  };

  const downloadIndividualStaffPDF = (staff) => {
    generateStaffPDF([staff], `${staff.username}_details.pdf`);
  };

  const downloadDocument = async (docPath, docName) => {
    try {
      const response = await fetch(`${API_URL}/documents/${docPath}`);
      if (!response.ok) {
        throw new Error('File not found');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download document error:', err);
      setError(`Failed to download ${docName}: ${err.message}`);
    }
  };

  return (
    <div className="ds-container">
      <div className="ds-content">
        <nav className="ds-sidebar">
          <div className="ds-sidebar-header">
            <div className="ds-logo">
              <img src={logo} alt="Serendib Gems" className="ds-logo-image" />
              <div className="ds-logo-text">Serendib Gems</div>
            </div>
          </div>
          <ul className="ds-nav-items">
            <li className="ds-nav-item">
              <Link to="/dashboard" className="ds-nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="ds-nav-item">
              <Link to="/users" className="ds-nav-link active">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </Link>
            </li>
            <li className="ds-nav-item">
              <Link to="/gemdashboard" className="ds-nav-link">
                <i className="fas fa-boxes"></i>
                <span>Inventory Management</span>
              </Link>
            </li>
            <li className="ds-nav-item">
              <Link to="/financereport" className="ds-nav-link">
                <i className="fas fa-dollar-sign"></i>
                <span>Financial Management</span>
              </Link>
            </li>
            <li className="ds-nav-item">
              <Link to="/cuttingview" className="ds-nav-link">
                <i className="fas fa-cut"></i>
                <span>Gem Cutting</span>
              </Link>
            </li>
            <li className="ds-nav-item">
              <Link to="/shippingdisplay" className="ds-nav-link">
                <i className="fas fa-truck"></i>
                <span>Delivery Management</span>
              </Link>
            </li>
          </ul>
        </nav>
        <main className="ds-main-content">
          <div className="ds-staff-management">
            <div className="ds-header-section">
              <h1 className="ds-page-title">Staff List</h1>
              <Link to="/addstaff">
                <button className="ds-btn ds-btn-primary">Add Staff Member</button>
              </Link>
            </div>
            {error && (
              <div className="ds-error-message">
                {error}
                <button
                  onClick={() => setError('')}
                  className="ml-2 text-red-700 underline"
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="ds-controls">
              <div className="ds-search-container">
                <input
                  type="text"
                  placeholder="Search by name, username, or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ds-form-control"
                />
              </div>
              <div className="ds-filter-container">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="ds-form-control ds-form-select"
                >
                  <option value="">All Roles</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Gem Cutter">Gem Cutter</option>
                  <option value="Financial Manager">Financial Manager</option>
                  <option value="Delivery Manager">Delivery Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <button
                onClick={downloadAllStaffPDF}
                className="ds-btn ds-btn-primary"
                aria-label="Download all staff details as PDF"
              >
                Download All as PDF
              </button>
              <button
                onClick={downloadFilteredStaffPDF}
                className="ds-btn ds-btn-primary"
                disabled={filteredStaff.length === 0}
                aria-label="Download filtered staff details as PDF"
              >
                Download Filtered as PDF
              </button>
            </div>
            {isLoading ? (
              <div className="ds-loading-container">Loading...</div>
            ) : (
              <div className="ds-staff-table-container">
                <table className="ds-staff-table">
                  <thead>
                    <tr>
                      <th>Profile Picture</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff) => (
                      <tr key={staff._id}>
                        <td>
                          {staff.profilePic ? (
                            <img
                              src={`${API_URL}/images/${staff.profilePic}`}
                              alt={`${staff.fullName || 'Staff'} Profile`}
                              className="ds-profile-image"
                              onError={(e) => {
                                console.log(`Failed to load image: ${API_URL}/images/${staff.profilePic}`);
                                e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABE5ErkJggg==';
                              }}
                            />
                          ) : (
                            <span className="ds-no-image">No Image</span>
                          )}
                        </td>
                        <td>
                          {staff.fullName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim()}
                        </td>
                        <td>{staff.username}</td>
                        <td>{staff.email}</td>
                        <td>{staff.phoneNumber}</td>
                        <td>
                          <span className={`ds-role-badge ${staff.role ? staff.role.toLowerCase().replace(' ', '-') : 'na'}`}>
                            {staff.role || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {staff.documents?.length > 0 ? (
                            <ul>
                              {staff.documents.map((doc, index) => (
                                <li key={index}>
                                  <button
                                    onClick={() => downloadDocument(doc.path, doc.name)}
                                    className="text-blue-500 hover:underline"
                                  >
                                    {doc.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>No Documents</span>
                          )}
                        </td>
                        <td>
                          <div className="ds-action-buttons">
                            <button
                              onClick={() => handleDetailsClick(staff)}
                              className="ds-btn ds-btn-info"
                              aria-label={`View details for ${staff.fullName || staff.username}`}
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleUpdateClick(staff)}
                              className="ds-btn ds-btn-primary"
                              aria-label={`Update ${staff.fullName || staff.username}`}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleAddDocumentClick(staff._id)}
                              className="ds-btn ds-btn-success"
                              aria-label={`Add documents for ${staff.fullName || staff.username}`}
                            >
                              Add Doc
                            </button>
                            <button
                              onClick={() => downloadIndividualStaffPDF(staff)}
                              className="ds-btn ds-btn-secondary"
                              aria-label={`Download PDF for ${staff.fullName || staff.username}`}
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => handleDelete(staff._id)}
                              className="ds-btn ds-btn-danger"
                              aria-label={`Delete ${staff.fullName || staff.username}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {isModalOpen && (
              <div className="ds-modal-overlay">
                <div className="ds-modal-content">
                  <div className="ds-modal-header">
                    <h2 className="ds-modal-title">Update Staff</h2>
                    <button onClick={closeModal} className="ds-close-button">×</button>
                  </div>
                  {error && (
                    <div className="ds-error-message">
                      {error}
                      <button
                        onClick={() => setError('')}
                        className="ml-2 text-red-700 underline"
                        aria-label="Dismiss error"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleUpdateSubmit}>
                    <div className="ds-form-group">
                      <label htmlFor="firstName" className="ds-form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="lastName" className="ds-form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="fullName" className="ds-form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="username" className="ds-form-label required">
                        Username *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="email" className="ds-form-label required">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="phoneNumber" className="ds-form-label required">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="ds-form-control"
                      />
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="role" className="ds-form-label">
                        Role {formData.fullName && <span className="required">*</span>}
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="ds-form-control ds-form-select"
                        required={!!formData.fullName}
                      >
                        <option value="">Select Role</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Gem Cutter">Gem Cutter</option>
                        <option value="Financial Manager">Financial Manager</option>
                        <option value="Delivery Manager">Delivery Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="profilePic" className="ds-form-label">
                        Profile Picture
                      </label>
                      <input
                        type="file"
                        id="profilePic"
                        name="profilePic"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="ds-form-file"
                      />
                      {updateStaff?.profilePic && (
                        <div className="ds-current-image-container">
                          <p className="ds-current-image-title">Current Picture:</p>
                          <img
                            src={`${API_URL}/images/${updateStaff.profilePic}`}
                            alt="Current Profile"
                            className="ds-current-image"
                            onError={(e) => {
                              console.log(`Failed to load modal image: ${API_URL}/images/${updateStaff.profilePic}`);
                              e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="ds-form-group">
                      <label htmlFor="documents" className="ds-form-label">
                        Documents (PDFs, Photos)
                      </label>
                      <input
                        type="file"
                        id="documents"
                        name="documents"
                        accept=".pdf,image/*"
                        multiple
                        onChange={handleDocumentChange}
                        className="ds-form-file"
                      />
                      {documents.length > 0 && (
                        <div className="ds-document-list">
                          <p className="ds-document-title">Selected Documents:</p>
                          <ul>
                            {documents.map((doc, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{doc.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {updateStaff?.documents?.length > 0 && (
                        <div className="ds-current-document-list">
                          <p className="ds-current-document-title">Current Documents:</p>
                          <ul>
                            {updateStaff.documents.map((doc, index) => (
                              <li key={index}>
                                <button
                                  onClick={() => downloadDocument(doc.path, doc.name)}
                                  className="text-blue-500 hover:underline"
                                >
                                  {doc.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="ds-modal-footer flex justify-end">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="ds-btn ds-btn-secondary mr-2"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ds-btn ds-btn-primary disabled:bg-blue-300"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {isDocumentModalOpen && (
              <div className="ds-modal-overlay">
                <div className="ds-modal-content">
                  <div className="ds-modal-header">
                    <h2 className="ds-modal-title">Add Documents</h2>
                    <button onClick={closeDocumentModal} className="ds-close-button">×</button>
                  </div>
                  {error && (
                    <div className="ds-error-message">
                      {error}
                      <button
                        onClick={() => setError('')}
                        className="ml-2 text-red-700 underline"
                        aria-label="Dismiss error"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleDocumentSubmit}>
                    <div className="ds-form-group">
                      <label htmlFor="documents" className="ds-form-label">
                        Documents (PDFs, Photos)
                      </label>
                      <input
                        type="file"
                        id="documents"
                        name="documents"
                        accept=".pdf,image/*"
                        multiple
                        onChange={handleDocumentChange}
                        className="ds-form-file"
                      />
                      {documents.length > 0 && (
                        <div className="ds-document-list">
                          <p className="ds-document-title">Selected Documents:</p>
                          <ul>
                            {documents.map((doc, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{doc.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="ds-modal-footer flex justify-end">
                      <button
                        type="button"
                        onClick={closeDocumentModal}
                        className="ds-btn ds-btn-secondary mr-2"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ds-btn ds-btn-primary disabled:bg-blue-300"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {isDetailsModalOpen && selectedStaff && (
              <div className="ds-modal-overlay">
                <div className="ds-modal-content">
                  <div className="ds-modal-header">
                    <h2 className="ds-modal-title">Staff Details</h2>
                    <button onClick={closeDetailsModal} className="ds-close-button">×</button>
                  </div>
                  {error && (
                    <div className="ds-error-message">
                      {error}
                      <button
                        onClick={() => setError('')}
                        className="ml-2 text-red-700 underline"
                        aria-label="Dismiss error"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  <div className="ds-form-group">
                    <label className="ds-form-label">Profile Picture</label>
                    {selectedStaff.profilePic ? (
                      <img
                        src={`${API_URL}/images/${selectedStaff.profilePic}`}
                        alt={`${selectedStaff.fullName || 'Staff'} Profile`}
                        className="ds-current-image mt-2"
                        onError={(e) => {
                          console.log(`Failed to load modal image: ${API_URL}/images/${selectedStaff.profilePic}`);
                          e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
                        }}
                      />
                    ) : (
                      <span className="ds-no-image mt-2">No Image</span>
                    )}
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Full Name</label>
                    <p className="ds-form-control read-only">
                      {selectedStaff.fullName || `${selectedStaff.firstName || ''} ${selectedStaff.lastName || ''}`.trim() || 'N/A'}
                    </p>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Username</label>
                    <p className="ds-form-control read-only">
                      {selectedStaff.username || 'N/A'}
                    </p>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Email</label>
                    <p className="ds-form-control read-only">
                      {selectedStaff.email || 'N/A'}
                    </p>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Phone Number</label>
                    <p className="ds-form-control read-only">
                      {selectedStaff.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Role</label>
                    <p className="ds-form-control read-only">
                      <span className={`ds-role-badge ${selectedStaff.role ? selectedStaff.role.toLowerCase().replace(' ', '-') : 'na'}`}>
                        {selectedStaff.role || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-form-label">Documents</label>
                    {selectedStaff.documents?.length > 0 ? (
                      <ul className="ds-current-document-list">
                        {selectedStaff.documents.map((doc, index) => (
                          <li key={index}>
                            <button
                              onClick={() => downloadDocument(doc.path, doc.name)}
                              className="text-blue-500 hover:underline"
                            >
                              {doc.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ds-form-control read-only">No Documents</p>
                    )}
                  </div>
                  <div className="ds-modal-footer flex justify-end">
                    <button
                      type="button"
                      onClick={closeDetailsModal}
                      className="ds-btn ds-btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DisplayStaff;

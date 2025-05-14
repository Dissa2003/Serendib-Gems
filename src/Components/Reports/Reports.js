import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import PdfComp from './PdfComp';
import './Reports.css';
import Nav from '../Nav/Nav';
import { pdfjs } from 'react-pdf';
import { ThemeContext } from '../../ThemeContext';
import { Link } from 'react-router-dom';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function Reports() {
    const { theme } = useContext(ThemeContext);
    const [title, setTitle] = useState("");
    const [file, saveFile] = useState("");
    const [allpdf, setAllPdf] = useState([]);
    const [pdfFile, setPDFFile] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("No file chosen");
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
        getpdf();
    }, []);

    const getpdf = async () => {
        setLoading(true);
        try {
            const result = await axios.get("http://localhost:8000/getFile");
            setAllPdf(result.data.data);
        } catch (error) {
            console.error("Error fetching PDFs:", error);
        } finally {
            setLoading(false);
        }
    };

    const submitPDF = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        
        try {
            const result = await axios.post("http://localhost:8000/uploadfile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (result.data.status === 200) {
                showNotification("PDF uploaded successfully", "success");
                setTitle("");
                setFileName("No file chosen");
                saveFile("");
                getpdf();
            } else {
                showNotification("Upload failed", "error");
            }
        } catch (error) {
            console.error("Error Uploading:", error.message);
            showNotification("Error uploading file", "error");
        } finally {
            setLoading(false);
        }
    };

    const showPdf = (pdf) => {
        setPDFFile(`http://localhost:8000/files/${encodeURIComponent(pdf)}`);
        
        setTimeout(() => {
            const pdfViewer = document.getElementById('pdf-viewer');
            if (pdfViewer) {
                pdfViewer.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const deletePDF = async (pdfId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            setLoading(true);
            try {
                const result = await axios.delete(`http://localhost:8000/deleteFile/${pdfId}`);
                if (result.data.status === 200) {
                    showNotification("PDF deleted successfully", "success");
                    if (pdfFile.includes(pdfId)) {
                        setPDFFile("");
                    }
                    getpdf();
                }
            } catch (error) {
                console.error("Error deleting PDF:", error);
                showNotification("Error deleting file", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            saveFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type} ${theme}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 100);
    };

    const filteredPdfs = allpdf.filter(pdf => 
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`reports-page ${theme}`}>
            <Nav />
            <div className="main-content">
                <div className="reports-container">
                    {/* Secondary Navigation */}
                    <div className="secondary-nav-container">
                        <div className="secondary-nav">
                            <Link to="/mainhome" className="secondary-nav-link active">Employee Activity</Link>
                            <Link to="/userdetails" className="secondary-nav-link">Employee Details</Link>
                            <Link to="/registeredusers" className="secondary-nav-link">User Details</Link>
                            <Link to="/reports" className="secondary-nav-link">Employee Reports</Link>
                        </div>
                        
                    </div>

                    <div className="reports-header">
                        <h1>Document Repository</h1>
                        <p>Upload, manage and view your important reports and documents</p>
                    </div>

                    <div className="reports-layout">
                        <div className="upload-section">
                            <div className="card">
                                <div className="card-header">
                                    <div className="icon-container">
                                        <i className="pdf-icon-upload"></i>
                                    </div>
                                    <h2>Upload New Document</h2>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={submitPDF} className="pdf-form">
                                        <div className="form-group">
                                            <label htmlFor="pdf-title">Document Title</label>
                                            <input
                                                id="pdf-title"
                                                required
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Enter document title"
                                                className="form-input"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="pdf-file">Select PDF File</label>
                                            <div className="file-input-container">
                                                <input
                                                    id="pdf-file"
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={handleFileChange}
                                                    required
                                                    className="file-input"
                                                />
                                                <div className="file-input-custom">
                                                    <span className="file-name">{fileName}</span>
                                                    <button type="button" className="browse-btn">Browse</button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            className={`pdf-upload-btn ${theme}`}
                                            disabled={loading}
                                        >
                                            {loading ? 'Uploading...' : 'Upload Document'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="documents-section">
                            <div className="card">
                                <div className="card-header">
                                    <div className="icon-container">
                                        <i className="pdf-icon-library"></i>
                                    </div>
                                    <h2>Document Library</h2>
                                    <div className="search-container">
                                        <input
                                            type="text"
                                            placeholder="Search documents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="loading-spinner">
                                            <div className="spinner"></div>
                                            <p>Loading documents...</p>
                                        </div>
                                    ) : filteredPdfs.length === 0 ? (
                                        <div className="no-documents">
                                            <div className="empty-icon"></div>
                                            <p>{searchTerm ? "No matching documents found" : "No documents available"}</p>
                                            {searchTerm && (
                                                <button 
                                                    className={`clear-search ${theme}`} 
                                                    onClick={() => setSearchTerm("")}
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="pdf-grid">
                                            {filteredPdfs.map((data) => (
                                                <div key={data._id} className={`pdf-card ${theme}`}>
                                                    <div className="pdf-icon-container">
                                                        <i className="pdf-doc-icon"></i>
                                                    </div>
                                                    <div className="pdf-info">
                                                        <h3 className="pdf-title">{data.title}</h3>
                                                        <p className="pdf-date">
                                                            {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown date'}
                                                        </p>
                                                    </div>
                                                    <div className="pdf-actions">
                                                        <button 
                                                            className={`show-pdf-btn ${theme}`} 
                                                            onClick={() => showPdf(data.pdf)}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            className={`delete-pdf-btn ${theme}`}
                                                            onClick={() => deletePDF(data._id)}
                                                            disabled={loading}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {pdfFile && (
                        <div id="pdf-viewer" className={`pdf-viewer-container ${theme}`}>
                            <div className="pdf-viewer-header">
                                <h2>Document Viewer</h2>
                                <button 
                                    className={`close-pdf-btn ${theme}`}
                                    onClick={() => setPDFFile("")}
                                >
                                    Close
                                </button>
                            </div>
                            <PdfComp pdfFile={pdfFile} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Reports;
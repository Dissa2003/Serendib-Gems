import React from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Navbar from '../pages/Navbar';
import Footer from './footer';
import logo from '../assets/serendib-gems-logo.jpeg'; // Adjust path to your logo
import './css/CuttingSuccess.css';

const CuttingSuccess = () => {
  const { state } = useLocation();
  const { formData, emailStatus } = state || {};

  // Calculate agent visit date (within 3 days from today)
  const calculateVisitDate = () => {
    const today = new Date();
    const visitDate = new Date(today);
    visitDate.setDate(today.getDate() + 3);
    return visitDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page dimensions (A4: 210mm x 297mm)
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // Add border
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 204); // Serendib Gems blue color
    doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));

    // Add logo (adjust size and position as needed)
    try {
      doc.addImage(logo, 'PNG', margin, margin, 40, 20); // Logo: 40mm wide, 20mm tall
    } catch (error) {
      console.error('Error adding logo:', error);
      doc.setFontSize(16);
      doc.text('Serendib Gems', margin, margin + 15); // Fallback if logo fails
    }

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Blue color for header
    doc.text('Gem Cutting Request Confirmation', margin, margin + 30);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 35, margin + contentWidth, margin + 35); // Underline

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black for content
    doc.text(`Dear ${formData.userName},`, margin, margin + 45);
    doc.text('Your gem cutting request has been successfully received.', margin, margin + 55);
    doc.text('Below are the details of your request:', margin, margin + 65);

    let y = margin + 75;
    const details = [
      { label: 'Gemstone Type', value: formData.gemstoneType || 'Not specified' },
      { label: 'Rough Stone Weight', value: `${formData.roughStoneWeight} carats` || 'Not specified' },
      { label: 'Shape of Rough Stone', value: formData.shapeOfRoughStone || 'Not specified' },
      { label: 'Inclusion Location', value: formData.inclusionLocation || 'Not specified' },
      { label: 'Desired Shape', value: formData.desiredShape || 'Not specified' },
      { label: 'Expected Weight After Cutting', value: formData.expectedWeightAfterCutting ? `${formData.expectedWeightAfterCutting} carats` : 'Not specified' },
      { label: 'Cutting Method', value: formData.cuttingMethod || 'Not specified' },
      { label: 'Brilliance Priority', value: formData.brilliancePriority || 'Not specified' },
      { label: 'Finish Level', value: formData.finishLevel || 'Not specified' },
      { label: 'Gemstone Color Quality', value: formData.gemstoneColorQuality || 'Not specified' },
      { label: 'Additional Notes', value: formData.additionalNotes || 'None' },
      { label: 'Preferred Cutter', value: formData.cutter || 'Not specified' },
      { label: 'Your Name', value: formData.userName || 'Not specified' },
      { label: 'Email', value: formData.email || 'Not specified' },
      { label: 'Contact Number', value: formData.contactNumber || 'Not provided' },
      { label: 'Agent Visit Location', value: formData.inclusionLocation || 'Not specified' },
      { label: 'Agent Visit Date', value: `On or before ${calculateVisitDate()}` },
    ];

    doc.setFont('helvetica', 'bold');
    details.forEach(({ label, value }) => {
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, margin + 60, y); // Align values to the right
      y += 8;
      if (y > pageHeight - margin - 30) { // Leave space for footer
        doc.addPage();
        doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));
        y = margin;
      }
    });

    // Closing text
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Serendib Gems for your gem cutting needs!', margin, y + 10);
    doc.text('Best regards,', margin, y + 20);
    doc.setFont('helvetica', 'bold');
    doc.text('The Serendib Gems Team', margin, y + 30);

    // Footer
    const footerY = pageHeight - margin - 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray for footer
    doc.text('Serendib Gems', margin, footerY);
    doc.text('123 Gemstone Lane, Colombo, Sri Lanka', margin, footerY + 5);
    doc.text('Email: contact@serendibgems.com | Phone: +94 11 234 5678 | Website: www.serendibgems.com', margin, footerY + 10);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5); // Footer separator

    // Save PDF
    doc.save(`SerendibGems_GemCuttingRequest_${formData.userName}.pdf`);
  };

  if (!formData) {
    return (
      <div className="cutting-success-page">
        <Navbar />
        <div className="cutting-success-container">
          <h1>Error</h1>
          <p>No gem cutting details found. Please submit a new request.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cutting-success-page">
      <Navbar />
      <div className="cutting-success-container">
        <div className="success-header">
          <h1>Gem Cutting Request Submitted Successfully!</h1>
          <p>{emailStatus}</p>
        </div>

        <div className="agent-visit-info">
          <h2>Agent Visit Details</h2>
          <p>
            Our agent will visit you at <strong>{formData.inclusionLocation}</strong> on or before{' '}
            <strong>{calculateVisitDate()}</strong>.
          </p>
        </div>

        <div className="gem-cutting-details">
          <h2>Your Gem Cutting Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Gemstone Type:</span>
              <span className="detail-value">{formData.gemstoneType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Rough Stone Weight:</span>
              <span className="detail-value">{formData.roughStoneWeight} carats</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Shape of Rough Stone:</span>
              <span className="detail-value">{formData.shapeOfRoughStone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Inclusion Location:</span>
              <span className="detail-value">{formData.inclusionLocation}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Desired Shape:</span>
              <span className="detail-value">{formData.desiredShape}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expected Weight After Cutting:</span>
              <span className="detail-value">
                {formData.expectedWeightAfterCutting ? `${formData.expectedWeightAfterCutting} carats` : 'Not specified'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cutting Method:</span>
              <span className="detail-value">{formData.cuttingMethod}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Brilliance Priority:</span>
              <span className="detail-value">{formData.brilliancePriority}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Finish Level:</span>
              <span className="detail-value">{formData.finishLevel}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gemstone Color Quality:</span>
              <span className="detail-value">{formData.gemstoneColorQuality || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Additional Notes:</span>
              <span className="detail-value">{formData.additionalNotes || 'None'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Preferred Cutter:</span>
              <span className="detail-value">{formData.cutter}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Your Name:</span>
              <span className="detail-value">{formData.userName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{formData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Number:</span>
              <span className="detail-value">{formData.contactNumber || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="download-section">
          <button className="download-button" onClick={downloadPDF}>
            Download Request Details as PDF
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CuttingSuccess;
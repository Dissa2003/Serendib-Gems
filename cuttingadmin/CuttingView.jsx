import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './css/cuttingView.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { jsPDF } from 'jspdf';
import logo from '../assets/serendib-gems-logo.jpeg';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CuttingView = () => {
  const [cuttingRequests, setCuttingRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];
  const statusDisplay = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  const statusColors = {
    'pending': '#f0ad4e',
    'in_progress': '#5bc0de',
    'completed': '#5cb85c',
    'cancelled': '#d9534f'
  };

  useEffect(() => {
    const fetchCuttingRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/gem-cutting', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
          },
        });
        setCuttingRequests(response.data.data);
        setFilteredRequests(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cutting requests. Please try again.');
        setLoading(false);
        console.error('Fetch error:', err.response?.data || err.message);
      }
    };

    fetchCuttingRequests();
  }, []);

  useEffect(() => {
    let filtered = cuttingRequests;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.gemstoneType.toLowerCase().includes(lowerSearch) ||
        request.userName.toLowerCase().includes(lowerSearch) ||
        request.email.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, cuttingRequests]);

  const generatePDF = async (requests, filename) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Calculate status counts first
      const counts = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      };
      
      requests.forEach(request => {
        counts[request.status]++;
      });

      const logoImg = new Image();
      logoImg.src = logo;

      // Wait for logo to load
      await new Promise((resolve) => {
        logoImg.onload = resolve;
      });

      const addFooter = (pageNum, totalPages) => {
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('© 2024 Serendib Gems. All rights reserved.', margin, pageHeight - margin - 5);
        doc.text(
          `Page ${pageNum} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - margin - 5,
          { align: 'right' }
        );
      };

      const addSectionHeader = (text, y) => {
        // Add section decoration with colored background
        doc.setFillColor(77, 171, 245);
        doc.roundedRect(margin - 5, y - 5, maxWidth + 10, 12, 1, 1, 'F');
        
        // Add white text
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(text, margin, y);
        
        return y + 15;
      };

      const addHeader = (title = 'Request Details') => {
        // Add decorative border
        doc.setLineWidth(0.5);
        doc.setDrawColor(77, 171, 245);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Add small logo in top-right corner
        const headerLogoSize = 15;
        doc.addImage(logoImg, 'JPEG', pageWidth - margin - headerLogoSize, margin, headerLogoSize, headerLogoSize);

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(56, 68, 86);
        doc.text(title, pageWidth / 2, margin + 10, { align: 'center' });

        // Add date and time
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        const now = new Date();
        doc.text(
          `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
          pageWidth - margin - headerLogoSize - 5,
          margin + headerLogoSize + 5,
          { align: 'right' }
        );
      };

      // First page with title and logo
      const addCoverPage = (isSingleRequest = false) => {
        // Add decorative border
        doc.setLineWidth(0.5);
        doc.setDrawColor(77, 171, 245);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Add logo at the center bottom
        const logoWidth = 40;
        const logoHeight = 40;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = pageHeight - margin - logoHeight - 20;
        doc.addImage(logoImg, 'JPEG', logoX, logoY, logoWidth, logoHeight);

        // Add main title
        doc.setFontSize(36);
        doc.setTextColor(82, 86, 233);
        doc.text('SerendibGems', pageWidth / 2, 80, { align: 'center' });

        // Add subtitle
        doc.setFontSize(28);
        doc.setTextColor(90, 106, 130);
        doc.text(isSingleRequest ? 'Gem Cutting Request Details' : 'Gem Cutting Request Report', pageWidth / 2, 120, { align: 'center' });

        // Add prepared by text
        doc.setFontSize(14);
        doc.setTextColor(120, 120, 120);
        doc.text('Prepared by: SerendibGems Administration', pageWidth / 2, 160, { align: 'center' });

        // Add date
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        doc.text(`Date: ${formattedDate}`, pageWidth / 2, 180, { align: 'center' });

        // Add confidential text
        doc.setFontSize(12);
        doc.text('Confidential: For Internal Use Only', pageWidth / 2, 200, { align: 'center' });
      };

      const isSingleRequest = requests.length === 1;
      
      // Add cover page
      addCoverPage(isSingleRequest);
      addFooter(1, isSingleRequest ? 2 : requests.length + 1);

      // Only add summary pages for multiple requests
      if (!isSingleRequest) {
        // Convert charts to images with error handling
        let pieChartImage, barChartImage;
        try {
          const pieChartCanvas = document.querySelector('.cv-pie-chart canvas');
          const barChartCanvas = document.querySelector('.cv-bar-chart canvas');
          
          if (pieChartCanvas) {
            pieChartImage = await html2canvas(pieChartCanvas, {
              scale: 2,
              logging: false,
              useCORS: true
            });
          }
          
          if (barChartCanvas) {
            barChartImage = await html2canvas(barChartCanvas, {
              scale: 2,
              logging: false,
              useCORS: true
            });
          }
        } catch (error) {
          console.error('Error capturing charts:', error);
        }

        // Add new page for summary
        doc.addPage();
        addHeader('Request Summary');
        let y = margin + 35;
        
        y = addSectionHeader('Executive Summary', y);
        doc.setFontSize(11);
        doc.setTextColor(56, 68, 86);
        
        const totalRequests = requests.length;
        const activeRequests = counts.pending + counts.in_progress;
        const completionRate = Math.round((counts.completed / totalRequests) * 100) || 0;
        
        const summaryText = [
          `Total Requests: ${totalRequests}`,
          `Active Requests: ${activeRequests} (${Math.round((activeRequests / totalRequests) * 100)}%)`,
          `Completion Rate: ${completionRate}%`,
          `Average Processing Time: ${Math.round(totalRequests / activeRequests * 7)} days`
        ];
        
        summaryText.forEach((text, index) => {
          doc.text(text, margin + 5, y + (index * 7));
        });
        y += 35;

        // Add status distribution with colored boxes
        y = addSectionHeader('Status Distribution', y);
        
        Object.entries(statusDisplay).forEach(([status, label]) => {
          const count = counts[status];
          const percentage = Math.round((count / totalRequests) * 100) || 0;
          
          // Add colored status box
          doc.setFillColor(...hexToRgb(statusColors[status]));
          doc.rect(margin, y - 4, 4, 4, 'F');
          
          // Add status text
          doc.setFontSize(10);
          doc.setTextColor(56, 68, 86);
          doc.text(
            `${label}: ${count} requests (${percentage}%)`,
            margin + 8,
            y
          );
          y += 7;
        });
        y += 10;

        // Add charts side by side
        if (pieChartImage && barChartImage) {
          y = addSectionHeader('Visual Analytics', y);
          
          // Smaller chart dimensions
          const chartWidth = (maxWidth - margin) / 2.5;
          const chartHeight = 50;
          
          // Center the charts
          const totalChartsWidth = (chartWidth * 2) + margin;
          const startX = (pageWidth - totalChartsWidth) / 2;
          
          // Add chart titles
          doc.setFontSize(9);
          doc.setTextColor(90, 106, 130);
          doc.text('Status Distribution', startX + (chartWidth / 2), y, { align: 'center' });
          doc.text('Status Count', startX + chartWidth + margin + (chartWidth / 2), y, { align: 'center' });
          y += 5;
          
          // Add charts with white background
          doc.setFillColor(255, 255, 255);
          doc.rect(startX - 2, y - 2, chartWidth + 4, chartHeight + 4, 'F');
          doc.rect(startX + chartWidth + margin - 2, y - 2, chartWidth + 4, chartHeight + 4, 'F');
          
          doc.addImage(pieChartImage, 'PNG', startX, y, chartWidth, chartHeight);
          doc.addImage(barChartImage, 'PNG', startX + chartWidth + margin, y, chartWidth, chartHeight);
          
          y += chartHeight + 10;
        }

        // Add key insights
        y = addSectionHeader('Key Insights', y);
        
        const insights = [
          `• ${Math.round((activeRequests / totalRequests) * 100)}% of requests are currently active`,
          `• Average completion rate is ${completionRate}%`,
          `• Most common status is ${Object.entries(counts)
            .reduce((a, b) => (b[1] > a[1] ? b : a))[0]
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}`,
          `• ${counts.cancelled} requests have been cancelled (${Math.round((counts.cancelled / totalRequests) * 100)}%)`
        ];
        
        doc.setFontSize(10);
        doc.setTextColor(56, 68, 86);
        insights.forEach((insight, index) => {
          doc.text(insight, margin + 5, y + (index * 7));
        });
        y += insights.length * 7 + 10;
      }

      // Add individual request details
      requests.forEach((request, index) => {
        if (!isSingleRequest || index === 0) {
          doc.addPage();
        }
        
        const pageTitle = isSingleRequest ? 'Request Details' : `Request Details - ${request.gemstoneType}`;
        addHeader(pageTitle);
        let y = margin + 35;

        // Add request header with status
        doc.setFontSize(16);
        doc.setTextColor(56, 68, 86);
        doc.text(`Request #${index + 1}: ${request.gemstoneType}`, margin, y);
        
        // Add status badge
        doc.setFillColor(...hexToRgb(statusColors[request.status]));
        doc.roundedRect(margin, y + 5, 60, 12, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(statusDisplay[request.status], margin + 5, y + 13);
        y += 25;

        // Add request details in sections
        const sections = [
          {
            title: 'Gemstone Details',
            items: [
              ['Type', request.gemstoneType],
              ['Rough Weight', `${request.roughStoneWeight} ct`],
              ['Rough Shape', request.shapeOfRoughStone],
              ['Inclusion Location', request.inclusionLocation]
            ]
          },
          {
            title: 'Cutting Specifications',
            items: [
              ['Desired Shape', request.desiredShape],
              ['Expected Weight', `${request.expectedWeightAfterCutting || 'N/A'} ct`],
              ['Cutting Method', request.cuttingMethod],
              ['Brilliance Priority', request.brilliancePriority],
              ['Finish Level', request.finishLevel],
              ['Color Quality', request.gemstoneColorQuality || 'N/A']
            ]
          },
          {
            title: 'Contact Information',
            items: [
              ['Preferred Cutter', request.cutter],
              ['Client Name', request.userName],
              ['Email', request.email],
              ['Contact Number', request.contactNumber || 'N/A']
            ]
          }
        ];

        sections.forEach(section => {
          y = addSectionHeader(section.title, y);
          
          section.items.forEach(([label, value]) => {
            doc.setFontSize(10);
            doc.setTextColor(90, 106, 130);
            doc.text(`${label}:`, margin + 5, y);
            doc.setTextColor(56, 68, 86);
            doc.text(value, margin + 45, y);
            y += 7;
          });
          y += 5;
        });

        // Add additional notes if present
        if (request.additionalNotes) {
          y = addSectionHeader('Additional Notes', y);
          doc.setFontSize(10);
          doc.setTextColor(90, 106, 130);
          const splitNotes = doc.splitTextToSize(request.additionalNotes, maxWidth - 10);
          doc.text(splitNotes, margin + 5, y);
          y += splitNotes.length * 5 + 5;
        }

        // Update footer with correct page numbers
        const currentPage = isSingleRequest ? 2 : index + 2;
        const totalPages = isSingleRequest ? 2 : requests.length + 1;
        addFooter(currentPage, totalPages);
      });

      // Update total pages in footers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const handleDownloadSinglePDF = (request) => {
    generatePDF([request], `GemCuttingRequest_${request.gemstoneType}_${request._id}.pdf`);
  };

  const handleDownloadFilteredPDF = () => {
    if (filteredRequests.length === 0) {
      setError('No filtered requests to download.');
      return;
    }
    generatePDF(filteredRequests, 'GemCuttingRequests_Filtered.pdf');
  };

  const handleDownloadAllPDF = () => {
    if (cuttingRequests.length === 0) {
      setError('No requests to download.');
      return;
    }
    generatePDF(cuttingRequests, 'GemCuttingRequests_All.pdf');
  };

  const handleStatusUpdate = async (id) => {
    try {
      const newStatus = statusUpdates[id];
      if (!newStatus) return;

      const response = await axios.put(
        `http://localhost:8000/api/gem-cutting/${id}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
          },
        }
      );

      setCuttingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === id ? { ...request, status: newStatus } : request
        )
      );
      setUpdatingId(null);
      setStatusUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[id];
        return newUpdates;
      });

      const notification = document.createElement('div');
      notification.className = 'cv-success-notification';
      notification.textContent = 'Status updated successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('cv-hide');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    } catch (err) {
      setError('Failed to update status. Please try again.');
      console.error('Update error:', err.response?.data || err.message);
    }
  };

  const handleStatusChange = (id, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cutting request?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/gem-cutting/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        },
      });

      setCuttingRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));

      const notification = document.createElement('div');
      notification.className = 'cv-success-notification cv-delete';
      notification.textContent = 'Cutting request deleted successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('cv-hide');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    } catch (err) {
      setError('Failed to delete request. Please try again.');
      console.error('Delete error:', err.response?.data || err.message);
    }
  };

  const getGemIcon = (gemType) => {
    const gemTypes = {
      'Diamond': 'fa-diamond',
      'Ruby': 'fa-gem',
      'Sapphire': 'fa-gem',
      'Emerald': 'fa-gem',
      'Amethyst': 'fa-gem',
      'Topaz': 'fa-gem',
      'Opal': 'fa-gem',
      'Pearl': 'fa-circle',
      'Jade': 'fa-square',
      'default': 'fa-gem'
    };
    return gemTypes[gemType] || gemTypes.default;
  };

  const getGemColor = (gemType) => {
    const gemColors = {
      'Diamond': '#e6f2ff',
      'Ruby': '#ffcccc',
      'Sapphire': '#cce0ff',
      'Emerald': '#ccffcc',
      'Amethyst': '#e6ccff',
      'Topaz': '#fff2cc',
      'Opal': '#fff',
      'Pearl': '#f2f2f2',
      'Jade': '#ccffcc',
      'default': '#e6e6e6'
    };
    return gemColors[gemType] || gemColors.default;
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };

    cuttingRequests.forEach(request => {
      counts[request.status]++;
    });

    return counts;
  };

  const getChartData = () => {
    const counts = getStatusCounts();
    return {
      labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      datasets: [
        {
          data: [
            counts.pending,
            counts.in_progress,
            counts.completed,
            counts.cancelled
          ],
          backgroundColor: [
            '#f0ad4e', // pending
            '#5bc0de', // in_progress
            '#5cb85c', // completed
            '#d9534f'  // cancelled
          ],
          borderColor: [
            '#f0ad4e',
            '#5bc0de',
            '#5cb85c',
            '#d9534f'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const getBarChartData = () => {
    const counts = getStatusCounts();
    return {
      labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      datasets: [
        {
          label: 'Number of Requests',
          data: [
            counts.pending,
            counts.in_progress,
            counts.completed,
            counts.cancelled
          ],
          backgroundColor: [
            '#f0ad4e', // pending
            '#5bc0de', // in_progress
            '#5cb85c', // completed
            '#d9534f'  // cancelled
          ],
          borderColor: [
            '#f0ad4e',
            '#5bc0de',
            '#5cb85c',
            '#d9534f'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="fin-dash-container">
      <div className="fin-dash-content">
        <nav className="fin-dash-sidebar">
          <div className="fin-dash-sidebar-header">
            <div className="fin-dash-logo">
              <img src={logo} alt="Serendib Gems" className="fin-dash-logo-image" />
              <div className="fin-dash-logo-text">Serendib Gems</div>
            </div>
          </div>
          <ul className="fin-dash-nav-items">
            <li className="fin-dash-nav-item">
              <Link to="/dashboard" className="fin-dash-nav-link">
                <i className="fas fa-chart-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/users" className="fin-dash-nav-link">
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/gemdashboard" className="fin-dash-nav-link">
                <i className="fas fa-boxes"></i>
                <span>Inventory Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/financereport" className="fin-dash-nav-link">
                <i className="fas fa-dollar-sign"></i>
                <span>Financial Management</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/cuttingview" className="fin-dash-nav-link active">
                <i className="fas fa-cut"></i>
                <span>Gem Cutting</span>
              </Link>
            </li>
            <li className="fin-dash-nav-item">
              <Link to="/shippingdisplay" className="fin-dash-nav-link">
                <i className="fas fa-truck"></i>
                <span>Delivery Management</span>
              </Link>
            </li>
          </ul>
        </nav>

        <main className="fin-dash-main-content">
          <div className="cv-cutting-view-container">
            <div className="cv-page-header">
              <div className="cv-header-title">
                <h1><i className="fas fa-cut"></i> Gem Cutting Requests</h1>
                <p className="cv-requests-count">
                  {searchTerm || statusFilter
                    ? `Showing ${filteredRequests.length} of ${cuttingRequests.length} requests`
                    : `Total Requests: ${cuttingRequests.length}`}
                </p>
              </div>
              <div className="cv-header-actions">
                <Link to="/adminreq">
                  <button className="cv-add-request-btn">
                    <i className="fas fa-plus"></i> New Request
                  </button>
                </Link>
                <button className="cv-download-all-btn" onClick={handleDownloadAllPDF}>
                  <i className="fas fa-download"></i> Download All
                </button>
                <button className="cv-download-filtered-btn" onClick={handleDownloadFilteredPDF}>
                  <i className="fas fa-download"></i> Download Filtered
                </button>
              </div>
            </div>

            <div className="cv-filter-search-container">
              <div className="cv-search-bar">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by gemstone, client name, or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="cv-filter-select">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="cv-status-select"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusDisplay[status]}
                    </option>
                  ))}
                </select>
              </div>
              {(searchTerm || statusFilter) && (
                <button className="cv-clear-filters-btn" onClick={clearFilters}>
                  <i className="fas fa-times"></i> Clear Filters
                </button>
              )}
            </div>

            <div className="cv-charts-container">
              <div className="cv-chart-card">
                <h3>Gem Cutting Request Status Distribution</h3>
                <div className="cv-pie-chart">
                  <Pie data={getChartData()} options={chartOptions} />
                </div>
              </div>
              <div className="cv-chart-card">
                <h3>Gem Cutting Request Status Count</h3>
                <div className="cv-bar-chart">
                  <Bar data={getBarChartData()} options={barChartOptions} />
                </div>
              </div>
            </div>

            {error && <div className="cv-error-message">{error}</div>}

            {loading ? (
              <div className="cv-loading-container">
                <div className="cv-loading-spinner"></div>
                <p>Loading gem cutting requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="cv-no-data-container">
                <i className="fas fa-search"></i>
                <p>No cutting requests found.</p>
                <Link to="/adminreq">
                  <button className="cv-add-request-btn">
                    <i className="fas fa-plus"></i> Create New Request
                  </button>
                </Link>
              </div>
            ) : (
              <div className="cv-gem-cards-container">
                {filteredRequests.map((request) => (
                  <div 
                    key={request._id} 
                    className={`cv-gem-card ${expandedCard === request._id ? 'cv-expanded' : ''}`}
                    style={{
                      '--gem-color': getGemColor(request.gemstoneType)
                    }}
                  >
                    <div className="cv-gem-card-header">
                      <div className="cv-gem-icon">
                        <i className={`fas ${getGemIcon(request.gemstoneType)}`}></i>
                      </div>
                      <div className="cv-gem-name">
                        <h3>{request.gemstoneType}</h3>
                        <div 
                          className="cv-status-badge"
                          style={{ backgroundColor: statusColors[request.status] }}
                        >
                          {statusDisplay[request.status]}
                        </div>
                      </div>
                      <div className="cv-card-actions">
                        <button 
                          className="cv-expand-btn" 
                          onClick={() => toggleExpand(request._id)}
                        >
                          <i className={`fas fa-chevron-${expandedCard === request._id ? 'up' : 'down'}`}></i>
                        </button>
                        <button 
                          className="cv-download-btn"
                          onClick={() => handleDownloadSinglePDF(request)}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>

                    <div className="cv-gem-card-content">
                      <div className="cv-gem-info-section">
                        <h4>Gemstone Details</h4>
                        <div className="cv-gem-info-grid">
                          <div className="cv-info-item">
                            <label>Rough Stone Weight:</label>
                            <span>{request.roughStoneWeight} ct</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Shape of Rough Stone:</label>
                            <span>{request.shapeOfRoughStone}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Inclusion Location:</label>
                            <span>{request.inclusionLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cv-gem-info-section">
                        <h4>Cutting Specifications</h4>
                        <div className="cv-gem-info-grid cv-three-col">
                          <div className="cv-info-item">
                            <label>Desired Shape:</label>
                            <span>{request.desiredShape}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Expected Weight:</label>
                            <span>{request.expectedWeightAfterCutting || 'N/A'} ct</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Cutting Method:</label>
                            <span>{request.cuttingMethod}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Brilliance Priority:</label>
                            <span>{request.brilliancePriority}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Finish Level:</label>
                            <span>{request.finishLevel}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Color Quality:</label>
                            <span>{request.gemstoneColorQuality || 'N/A'}</span>
                          </div>
                        </div>
                        {request.additionalNotes && (
                          <div className="cv-notes-section">
                            <label>Additional Notes:</label>
                            <p>{request.additionalNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="cv-gem-info-section">
                        <h4>Contact Information</h4>
                        <div className="cv-gem-info-grid cv-three-col">
                          <div className="cv-info-item">
                            <label>Preferred Cutter:</label>
                            <span>{request.cutter}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Client Name:</label>
                            <span>{request.userName}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Email:</label>
                            <span>{request.email}</span>
                          </div>
                          <div className="cv-info-item">
                            <label>Contact Number:</label>
                            <span>{request.contactNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cv-gem-card-footer">
                        {updatingId === request._id ? (
                          <div className="cv-status-update-controls">
                            <select
                              value={statusUpdates[request._id] || request.status}
                              onChange={(e) => handleStatusChange(request._id, e.target.value)}
                              className="cv-status-select"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {statusDisplay[status]}
                                </option>
                              ))}
                            </select>
                            <div className="cv-action-buttons">
                              <button
                                className="cv-action-button cv-save"
                                onClick={() => handleStatusUpdate(request._id)}
                              >
                                <i className="fas fa-check"></i> Save
                              </button>
                              <button
                                className="cv-action-button cv-cancel"
                                onClick={() => {
                                  setUpdatingId(null);
                                  setStatusUpdates((prev) => {
                                    const newUpdates = { ...prev };
                                    delete newUpdates[request._id];
                                    return newUpdates;
                                  });
                                }}
                              >
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="cv-card-buttons">
                            <button
                              className="cv-card-button cv-update"
                              onClick={() => setUpdatingId(request._id)}
                            >
                              <i className="fas fa-edit"></i> Update Status
                            </button>
                            <button
                              className="cv-card-button cv-delete"
                              onClick={() => handleDelete(request._id)}
                            >
                              <i className="fas fa-trash-alt"></i> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CuttingView;
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Nav from "../Nav/Nav";
import { ThemeContext } from "../../ThemeContext";
import "./Users.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const URL = "http://localhost:8000/users";

const fetchHandler = async () => {
  try {
    const response = await axios.get(URL);
    return response.data.Users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

function Users() {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    fetchHandler().then((data) => {
      const adminUsers = data.filter((user) => user.fullName || user.role);
      setUsers(adminUsers);
      setIsLoading(false);
    });
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (user.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (user.role?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (user.phoneNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setProperties({
      title: "SerendibGems Employee Management Report",
      author: "SerendibGems",
      creator: "SerendibGems System",
    });

    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("SerendibGems", (pageWidth - doc.getTextWidth("SerendibGems")) / 2, 80);

    doc.setFontSize(24);
    doc.text("Employee Management Report", (pageWidth - doc.getTextWidth("Employee Management Report")) / 2, 100);

    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    const coverDetails = [
      "Prepared by: SerendibGems Administration",
      `Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      "Confidential: For Internal Use Only",
    ];
    coverDetails.forEach((line, i) => {
      doc.text(line, (pageWidth - doc.getTextWidth(line)) / 2, 120 + i * 10);
    });

    try {
      doc.addImage("/gem6.png", "PNG", (pageWidth - 60) / 2, 140, 60, 60);
    } catch (err) {
      console.error("Image error:", err);
    }

    doc.addPage();

    const addHeaderFooter = () => {
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 12, "F");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SerendibGems Employee Management Report", 15, 8);
      try {
        doc.addImage("/gem6.png", "PNG", pageWidth - 25, 2, 10, 10);
      } catch (err) {
        console.error("Header logo error:", err);
      }

      doc.setFillColor(243, 244, 246);
      doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.setFont("helvetica", "normal");
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber - 1;
      const pageCount = doc.internal.getNumberOfPages() - 1;
      doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 15, pageHeight - 4, { align: "right" });
      doc.text("© 2025 SerendibGems. Confidential and for internal use only.", 15, pageHeight - 4);

      doc.setFontSize(40);
      doc.setTextColor(229, 231, 235);
      doc.setFont("helvetica", "bold");
      doc.text("CONFIDENTIAL", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
    };

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("SerendibGems", (pageWidth - doc.getTextWidth("SerendibGems")) / 2, 30);

    try {
      doc.addImage("/gem6.png", "PNG", (pageWidth - 40) / 2, 40, 40, 40);
    } catch (err) {
      console.error("Logo error:", err);
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text("SerendibGems Logo", (pageWidth - doc.getTextWidth("SerendibGems Logo")) / 2, 70);
    }

    doc.setFontSize(20);
    doc.text("Detailed Employee Information", (pageWidth - doc.getTextWidth("Detailed Employee Information")) / 2, 100);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    const dateText = `Report Generated: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    doc.text(dateText, (pageWidth - doc.getTextWidth(dateText)) / 2, 110);
    const summaryText = `Total Employees: ${filteredUsers.length}`;
    doc.text(summaryText, (pageWidth - doc.getTextWidth(summaryText)) / 2, 118);

    const columns = ["Username", "Full Name", "Email", "Role", "Phone Number"];
    const rows = filteredUsers.map((user) => [
      user.username || "-",
      user.fullName || "-",
      user.email || "-",
      user.role || "-",
      user.phoneNumber || "-",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 130,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [31, 41, 55],
        font: "helvetica",
        lineColor: [209, 213, 219],
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
      },
      margin: { left: 15, right: 15 },
      didDrawPage: addHeaderFooter,
      didParseCell: (data) => {
        if (data.row.section === "body") {
          data.cell.styles.lineWidth = 0.1;
        }
      },
    });

    doc.setLineWidth(0.3);
    doc.setDrawColor(79, 70, 229);
    doc.rect(10, 15, pageWidth - 20, pageHeight - 30, "S");

    doc.save("SerendibGems_Employee_Management_Report.pdf");
  };

  return (
    <div className={`users-container ${theme}`}>
      <Nav />
      <div className="users-content">
        <div className="secondary-nav-container">
          <div className="secondary-nav">
            <Link to="/mainhome" className={`secondary-nav-link ${location.pathname === '/mainhome' ? 'active' : ''}`}>Employee Activity</Link>
            <Link to="/userdetails" className={`secondary-nav-link ${location.pathname === '/userdetails' ? 'active' : ''}`}>Employee Details</Link>
            <Link to="/registeredusers" className={`secondary-nav-link ${location.pathname === '/registeredusers' ? 'active' : ''}`}>User Details</Link>
            <Link to="/reports" className={`secondary-nav-link ${location.pathname === '/reports' ? 'active' : ''}`}>Employee Reports</Link>
          </div>
        </div>

        <div className="page-header-container">
          <h1 className="users-title">Employee Details</h1>
          <button onClick={downloadPDF} className={`download-report-btn ${theme}`}>
            Download Report
          </button>
        </div>

        <div className="details-description-container">
          <p className="details-description">
            View and manage comprehensive employee information including contact details, roles, and employment records.
          </p>
          <hr className="divider" />
        </div>

        <div className="search-container-left">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="printable-content">
          {isLoading ? (
            <p className="loading-message">Loading employee data...</p>
          ) : filteredUsers.length > 0 ? (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <h3 className="user-name">{user.username || '-'}</h3>
                  <div className="user-details">
                    <p className="user-info"><span className="info-label">Full Name:</span> {user.fullName || '-'}</p>
                    <p className="user-info"><span className="info-label">Email:</span> {user.email || '-'}</p>
                    <p className="user-info"><span className="info-label">Role:</span> {user.role || '-'}</p>
                    <p className="user-info"><span className="info-label">Phone:</span> {user.phoneNumber || '-'}</p>
                  </div>
                  <Link to={`/userdetails/${user._id}`} className="view-details-link">
                    <button className="view-details-btn">View Details</button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-users-message">No employees found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;

import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './PdfComp.css';

function PdfComp({ pdfFile }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const nextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const prevPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    return (
        <div className="pdf-comp-container">
            <h2 className="pdf-title">PDF Viewer</h2>
            {pdfFile && (
                <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} className="pdf-page" />
                </Document>
            )}
            {numPages && (
                <div className="pagination-container">
                    <p className="page-info">Page {pageNumber} of {numPages}</p>
                    <div className="pagination-buttons">
                        <button
                            className="nav-btn prev-btn"
                            onClick={prevPage}
                            disabled={pageNumber === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="nav-btn next-btn"
                            onClick={nextPage}
                            disabled={pageNumber === numPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PdfComp;
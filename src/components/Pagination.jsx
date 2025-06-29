// File: src/components/Pagination.js
import { useState } from "react";
import PropTypes from "prop-types";

// Pagination component for navigating through pages of answers
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // State for go-to-page input
  const [gotoPage, setGotoPage] = useState("1");

  // Handle go-to-page form submission
  const handleGotoPage = (e) => {
    e.preventDefault();
    // Parse input as integer
    const page = parseInt(gotoPage, 10);
    // Validate page number
    if (page >= 1 && page <= totalPages && !isNaN(page)) {
      // Call page change handler
      onPageChange(page);
      // Clear input
      setGotoPage("");
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-1">
      {/* Previous page button */}
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {/* Display current page and total pages */}
      <span>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next page button */}
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      {/* Go to page form */}
      <form onSubmit={handleGotoPage} className="d-flex align-items-center">
        {/* Page number input */}
        <input
          type="number"
          className="form-control"
          style={{ width: "100px", marginRight: "10px" }}
          value={gotoPage}
          onChange={(e) => setGotoPage(e.target.value)}
          placeholder="Go to page"
          min="1"
          max={totalPages}
        />
        {/* Submit button */}
        <button type="submit" className="btn btn-primary">
          Go
        </button>
      </form>
    </div>
  );
};

// Define prop types for type checking
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;

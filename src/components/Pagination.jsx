/**
 * Pagination component for navigating through pages of questions
 * Features forward/backward buttons and a go-to-page input
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
// import './../../index.css';

/**
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback for page change
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [gotoPage, setGotoPage] = useState('1');

  // Handle go-to-page form submission
  const handleGotoPage = (e) => {
    e.preventDefault();
    const page = parseInt(gotoPage, 10);
    if (page >= 1 && page <= totalPages && !isNaN(page)) {
      onPageChange(page);
      setGotoPage('');
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {/* Previous Button */}
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {/* Page Info */}
      <span>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      {/* Go to Page Input */}
      <form onSubmit={handleGotoPage} className="d-flex align-items-center">
        <input
          type="number"
          className="form-control"
          style={{ width: '100px', marginRight: '10px' }}
          value={gotoPage}
          onChange={(e) => setGotoPage(e.target.value)}
          placeholder="Go to page"
          min="1"
          max={totalPages}
        />
        <button type="submit" className="btn btn-primary">
          Go
        </button>
      </form>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
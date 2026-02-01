// frontend/src/components/Pagination.jsx
import React from 'react';
import './Pagination.css';

const MAX_VISIBLE_PAGES = 7;

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set([1, totalPages]);
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  for (let i = start; i <= end; i++) pages.add(i);
  return Array.from(pages).sort((a, b) => a - b);
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      {visiblePages.map((page, idx) => {
        const prev = visiblePages[idx - 1];
        const showEllipsis = prev != null && page - prev > 1;
        return (
          <React.Fragment key={page}>
            {showEllipsis && <span className="pagination__ellipsis">…</span>}
            <button
              className={`pagination__btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </React.Fragment>
        );
      })}

      <button
        className="pagination__btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

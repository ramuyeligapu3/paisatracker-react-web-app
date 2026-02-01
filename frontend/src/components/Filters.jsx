// frontend/src/components/Filters.jsx
import React from 'react';
import './Filters.css';

function Filters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  accountFilter,
  setAccountFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categoryOptions,
  accountOptions,
  onAddClick,
}) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filters__search"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="filters__date"
        title="From date"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="filters__date"
        title="To date"
      />
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="filters__dropdown"
      >
        <option>All Categories</option>
        {categoryOptions.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>
      <select
        value={accountFilter}
        onChange={(e) => setAccountFilter(e.target.value)}
        className="filters__dropdown"
      >
        <option>All Accounts</option>
        {accountOptions.map((acc) => (
          <option key={acc}>{acc}</option>
        ))}
      </select>
      <button className="filters__add-btn" onClick={onAddClick}>
        + Add Transaction
      </button>
    </div>
  );
}

export default Filters;

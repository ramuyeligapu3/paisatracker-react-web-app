import React from 'react';
import './Filters.css';

function Filters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  accountFilter,
  setAccountFilter,
  categoryOptions,
  accountOptions,
  onAddClick
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

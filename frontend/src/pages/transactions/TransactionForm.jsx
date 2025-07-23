import React from 'react';
import './TransactionForm.css';

function TransactionForm({ show, onClose, formData, onChange, onSave, type, categories, accounts }) {
  if (!show) return null;

  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <h3>{type === 'add' ? 'Add New Transaction' : 'Edit Transaction'}</h3>

        <div className="modal__form">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className="modal__input"
          />

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Description"
            className="modal__input"
          />

          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            className="modal__input"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            name="account"
            value={formData.account}
            onChange={onChange}
            className="modal__input"
          >
            {accounts.map((acc) => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={onChange}
            placeholder="Amount"
            className="modal__input"
          />

          <div className="modal__actions">
            <button className="modal__btn modal__btn--primary" onClick={onSave}>
              Save
            </button>
            <button className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionForm;

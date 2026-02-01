// frontend/src/components/dashboard/Transactions.jsx
import React from "react";

const Transactions = ({ transactions }) => (
  <div className="transactions">
    <div className="section-title">Recent Transactions</div>
    {transactions.length > 0 ? (
      transactions.map((t, index) => (
        <div key={t.id || index} className="transaction">
          <div className="transaction-details">
            <div className="transaction-name">{t.description}</div>
            <div className="transaction-date">{new Date(t.date).toLocaleDateString()}</div>
          </div>
          <div className="transaction-amount">
            {t.amount < 0 ? `-₹${Math.abs(t.amount).toLocaleString()}` : `+₹${t.amount.toLocaleString()}`}
          </div>
        </div>
      ))
    ) : (
      <div className="no-transactions">No recent transactions</div>
    )}
  </div>
);

export default Transactions;

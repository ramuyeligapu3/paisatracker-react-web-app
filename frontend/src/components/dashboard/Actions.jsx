import React from "react";

const Actions = ({ onAddTransaction, onExport }) => (
  <div className="actions">
    <div className="section-title">Quick Actions</div>
    <div className="quick-actions">
      <button className="action-btn" onClick={onAddTransaction}>➕ Add Transaction</button>
      <button className="action-btn" onClick={onExport}>📊 Export Data</button>
      <button className="action-btn">📈 View Reports</button>
    </div>
  </div>
);

export default Actions;

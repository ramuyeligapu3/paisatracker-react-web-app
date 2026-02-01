// frontend/src/components/dashboard/Actions.jsx
import React, { useState } from "react";
import { sendMonthlySummaryEmail } from "../../apis/dashboardApi";

const Actions = ({ onAddTransaction, onExport, currentMonth, currentYear }) => {
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState(null);

  const handleSendSummary = async () => {
    setSending(true);
    setSentMessage(null);
    try {
      const res = await sendMonthlySummaryEmail(currentMonth, currentYear);
      setSentMessage(res.message || "Summary sent to your email.");
    } catch (err) {
      setSentMessage(err.response?.data?.message || "Could not send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="actions">
      <div className="section-title">Quick Actions</div>
      <div className="quick-actions">
        <button className="action-btn" onClick={onAddTransaction}>➕ Add Transaction</button>
        <button className="action-btn" onClick={onExport}>📊 Export Data</button>
        <button
          className="action-btn"
          onClick={handleSendSummary}
          disabled={sending}
        >
          {sending ? "Sending…" : "📧 Send monthly summary to email"}
        </button>
        {sentMessage && (
          <p className="action-feedback" style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>
            {sentMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Actions;

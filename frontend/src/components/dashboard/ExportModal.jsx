import "../../pages/transactions/TransactionForm.css";


const ExportModal = ({
  show,
  onClose,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onGenerate
}) => {
  if (!show) return null;

  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <h3>Export Transactions</h3>

        <div className="modal__form">
          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="modal__input"
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="modal__input"
            />
          </label>

          <div className="modal__actions">
            <button
              className="modal__btn modal__btn--primary"
              onClick={onGenerate}
            >
              Generate Report
            </button>

            <button
              className="modal__btn modal__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

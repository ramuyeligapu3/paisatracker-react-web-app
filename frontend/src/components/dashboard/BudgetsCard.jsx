import React, { useState, useEffect } from "react";
import { getBudgets, setBudget } from "../../apis/budgetApi";

const CATEGORY_OPTIONS = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
  "Shopping",
  "Income",
];

const BudgetsCard = ({ selectedMonth, selectedYear, onRefresh }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" });

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const res = await getBudgets(selectedMonth, selectedYear);
        if (res.success && res.data) setBudgets(res.data);
        else setBudgets([]);
      } catch (err) {
        console.error(err);
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleSetBudget = async () => {
    if (!newBudget.category || !newBudget.amount || Number(newBudget.amount) <= 0) return;
    try {
      await setBudget(
        newBudget.category,
        selectedMonth,
        selectedYear,
        Number(newBudget.amount)
      );
      setNewBudget({ category: "", amount: "" });
      setEditing(false);
      const res = await getBudgets(selectedMonth, selectedYear);
      if (res.success && res.data) setBudgets(res.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="budgets-card card">Loading budgets...</div>;

  return (
    <div className="budgets-card card">
      <div className="card-header">
        <span className="card-title">Budgets</span>
        <span aria-hidden="true">🎯</span>
      </div>
      <p className="budgets-subtitle">Spending vs budget for selected month</p>
      <div className="budgets-list">
        {budgets.length === 0 && !editing && (
          <p className="budgets-empty">No budgets set. Add one below.</p>
        )}
        {budgets.map((b) => {
          const pct = b.budget_amount > 0 ? (b.spent_amount / b.budget_amount) * 100 : 0;
          const over = pct > 100;
          return (
            <div key={b.category} className="budget-row">
              <div className="budget-row-header">
                <span className="budget-category">{b.category}</span>
                <span className="budget-amounts">
                  ₹{Math.round(b.spent_amount).toLocaleString()} / ₹
                  {Math.round(b.budget_amount).toLocaleString()}
                </span>
              </div>
              <div className="budget-progress-wrap">
                <div
                  className={`budget-progress ${over ? "over" : ""}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {!editing ? (
        <button
          type="button"
          className="budget-add-btn"
          onClick={() => setEditing(true)}
        >
          + Set budget
        </button>
      ) : (
        <div className="budget-form">
          <select
            value={newBudget.category}
            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Amount (₹)"
            value={newBudget.amount}
            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
          />
          <div className="budget-form-actions">
            <button type="button" onClick={handleSetBudget}>
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setNewBudget({ category: "", amount: "" });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsCard;

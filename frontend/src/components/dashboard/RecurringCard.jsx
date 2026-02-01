import React, { useState, useEffect } from "react";
import { getRecurring, deleteRecurring, createRecurring } from "../../apis/recurringApi";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€" };
const FREQUENCIES = ["weekly", "monthly"];
const DEFAULT_CATEGORIES = ["Bills & Utilities", "Entertainment", "Income", "Shopping", "Other"];

const RecurringCard = ({ currency = "INR", categories = DEFAULT_CATEGORIES }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: DEFAULT_CATEGORIES[0],
    frequency: "monthly",
    next_date: new Date().toISOString().slice(0, 10),
  });
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";

  useEffect(() => {
    const fetchRecurring = async () => {
      try {
        const res = await getRecurring();
        if (res.success && res.data) setItems(res.data.filter((r) => r.is_active));
        else setItems([]);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecurring();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.description || form.amount === "" || Number(form.amount) === 0) return;
    try {
      await createRecurring({
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        frequency: form.frequency,
        next_date: new Date(form.next_date).toISOString(),
      });
      setForm({ description: "", amount: "", category: DEFAULT_CATEGORIES[0], frequency: "monthly", next_date: new Date().toISOString().slice(0, 10) });
      setAdding(false);
      const res = await getRecurring();
      if (res.success && res.data) setItems(res.data.filter((r) => r.is_active));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurring(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) return <div className="recurring-card card">Loading...</div>;

  return (
    <div className="recurring-card card">
      <div className="card-header">
        <span className="card-title">Recurring</span>
        <span aria-hidden="true">🔄</span>
      </div>
      <p className="recurring-subtitle">Subscriptions & repeating transactions</p>
      <div className="recurring-list">
        {items.length === 0 && (
          <p className="recurring-empty">No recurring transactions. Add them from Transactions.</p>
        )}
        {items.map((r) => (
          <div key={r.id} className="recurring-row" data-active={r.is_active}>
            <div className="recurring-row-main">
              <span className="recurring-desc">{r.description}</span>
              <span className="recurring-amount">
                {r.amount < 0 ? "-" : "+"}
                {symbol}
                {Math.abs(r.amount).toLocaleString()}
              </span>
            </div>
            <div className="recurring-row-meta">
              <span>{r.category}</span>
              <span>{r.frequency}</span>
              <span>Next: {formatDate(r.next_date)}</span>
            </div>
            <button type="button" className="recurring-btn-delete" onClick={() => handleDelete(r.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      {!adding ? (
        <button type="button" className="recurring-btn-add" onClick={() => setAdding(true)}>
          + Add recurring
        </button>
      ) : (
        <form onSubmit={handleAdd} className="recurring-form">
          <input
            type="text"
            placeholder="Description (e.g. Netflix)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.next_date}
            onChange={(e) => setForm({ ...form, next_date: e.target.value })}
          />
          <div className="recurring-form-btns">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecurringCard;

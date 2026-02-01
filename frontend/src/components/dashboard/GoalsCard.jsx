import React, { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../../apis/goalsApi";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€" };

const GoalsCard = ({ currency = "INR", onRefresh }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "0", deadline: "" });
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await getGoals();
        if (res.success && res.data) setGoals(res.data);
        else setGoals([]);
      } catch (err) {
        console.error(err);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target_amount || Number(form.target_amount) <= 0) return;
    try {
      setAdding(true);
      await createGoal({
        name: form.name,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount) || 0,
        deadline: form.deadline || null,
      });
      setForm({ name: "", target_amount: "", current_amount: "0", deadline: "" });
      const res = await getGoals();
      if (res.success && res.data) setGoals(res.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateCurrent = async (goal, value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    try {
      await updateGoal(goal.id, { current_amount: num });
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, current_amount: num, progress_pct: goal.target_amount ? Math.min(100, (num / goal.target_amount) * 100) : 0 } : g))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="goals-card card">Loading goals...</div>;

  return (
    <div className="goals-card card">
      <div className="card-header">
        <span className="card-title">Savings goals</span>
        <span aria-hidden="true">🎯</span>
      </div>
      <div className="goals-list">
        {goals.length === 0 && !adding && (
          <p className="goals-empty">No goals yet. Add one below.</p>
        )}
        {goals.map((g) => (
          <div key={g.id} className="goal-row">
            <div className="goal-row-top">
              <span className="goal-name">{g.name}</span>
              <span className="goal-amounts">
                {symbol}
                {Number(g.current_amount).toLocaleString()} / {symbol}
                {Number(g.target_amount).toLocaleString()}
              </span>
            </div>
            <div className="goal-progress-wrap">
              <div
                className="goal-progress"
                style={{ width: `${Math.min(100, g.progress_pct || 0)}%` }}
              />
            </div>
            <div className="goal-actions">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Update current"
                className="goal-input-add"
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v !== "") handleUpdateCurrent(g, v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
              />
              <button type="button" className="goal-btn-delete" onClick={() => handleDelete(g.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {!adding ? (
        <button type="button" className="goal-btn-add" onClick={() => setAdding(true)}>
          + Add goal
        </button>
      ) : (
        <form onSubmit={handleAdd} className="goal-form">
          <input
            type="text"
            placeholder="Goal name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Target amount"
            value={form.target_amount}
            onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Current (optional)"
            value={form.current_amount}
            onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
          />
          <input
            type="date"
            placeholder="Deadline"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <div className="goal-form-btns">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GoalsCard;

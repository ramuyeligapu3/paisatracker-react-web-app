import React, { useState, useEffect } from "react";

const TIPS = [
  "Set a monthly budget for your top categories to stay on track.",
  "Export your transactions anytime for taxes or personal records.",
  "Get your monthly summary by email—use the Actions menu.",
  "Add transactions regularly for accurate spending insights.",
  "Use categories to see where your money goes at a glance.",
];

const TipsCard = ({ summary }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const netBalance = summary?.netBalance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = Math.abs(summary?.totalExpenses ?? 0);
  const savings = totalIncome - totalExpenses;
  const isOnTrack = savings >= 0 && totalIncome > 0;

  return (
    <div className="tips-card card">
      <div className="card-header">
        <span className="card-title">Quick tip</span>
        <span aria-hidden="true">💡</span>
      </div>
      <p className="tips-text">{TIPS[tipIndex]}</p>
      {isOnTrack && (
        <p className="tips-on-track" aria-hidden="true">
          You're on track — keep tracking to see trends over time.
        </p>
      )}
    </div>
  );
};

export default TipsCard;

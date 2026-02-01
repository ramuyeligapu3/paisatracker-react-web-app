// frontend/src/components/dashboard/Stats.jsx
import React from "react";

const Stats = ({ summary }) => {
  if (!summary) return <div className="stats">Loading stats...</div>;

  const {
    netBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    savings = totalIncome - Math.abs(totalExpenses), // fallback if not in API
  } = summary;

  const statsData = [
    { title: "Total Balance", value: `₹${netBalance.toLocaleString()}`, icon: "💰" },
    { title: "Monthly Income", value: `₹${totalIncome.toLocaleString()}`, icon: "⬆️" },
    { title: "Monthly Expenses", value: `₹${Math.abs(totalExpenses).toLocaleString()}`, icon: "⬇️" },
    { title: "Savings", value: `₹${savings.toLocaleString()}`, icon: "🐷" },
  ];

  return (
    <div className="stats">
      {statsData.map((stat, index) => (
        <div key={index} className="card">
          <div className="card-header">
            <div className="card-title">{stat.title}</div>
            <div>{stat.icon}</div>
          </div>
          <div className="card-value">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default Stats;

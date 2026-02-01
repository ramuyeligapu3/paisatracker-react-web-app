// frontend/src/components/dashboard/Stats.jsx
import React from "react";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€" };

const Stats = ({ summary, currency = "INR" }) => {
  if (!summary) return <div className="stats">Loading stats...</div>;

  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  const {
    netBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    savings = totalIncome - Math.abs(totalExpenses),
  } = summary;

  const statsData = [
    { title: "Total Balance", value: `${symbol}${netBalance.toLocaleString()}`, icon: "💰" },
    { title: "Monthly Income", value: `${symbol}${totalIncome.toLocaleString()}`, icon: "⬆️" },
    { title: "Monthly Expenses", value: `${symbol}${Math.abs(totalExpenses).toLocaleString()}`, icon: "⬇️" },
    { title: "Savings", value: `${symbol}${savings.toLocaleString()}`, icon: "🐷" },
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

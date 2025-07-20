import React from "react";

const statsData = [
  { title: "Total Balance", value: "₹45,230", icon: "💰" },
  { title: "Monthly Income", value: "₹25,000", icon: "⬆️" },
  { title: "Monthly Expenses", value: "₹18,750", icon: "⬇️" },
  { title: "Savings", value: "₹6,250", icon: "🐷" },
];

const Stats = () => (
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

export default Stats;

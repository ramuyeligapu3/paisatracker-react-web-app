import React from "react";

const transactions = [
  { name: "Grocery Shopping", date: "Jan 15, 2025", amount: "-₹2,450" },
  { name: "Salary Credit", date: "Jan 14, 2025", amount: "+₹25,000" },
  { name: "Fuel", date: "Jan 13, 2025", amount: "-₹1,200" },
];

const Transactions = () => (
  <div className="transactions">
    <div className="section-title">Recent Transactions</div>
    {transactions.map((t, index) => (
      <div key={index} className="transaction">
        <div className="transaction-details">
          <div className="transaction-name">{t.name}</div>
          <div className="transaction-date">{t.date}</div>
        </div>
        <div className="transaction-amount">{t.amount}</div>
      </div>
    ))}
  </div>
);

export default Transactions;

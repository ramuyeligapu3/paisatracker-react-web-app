// frontend/src/components/dashboard/Charts.jsx
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"
];

const Charts = ({ data = [], loading }) => {
  if (loading) return <div>Loading charts...</div>;
  if (!data.length) return <div>No data available for charts</div>;

  // Prepare pie data
  const pieData = data.map(item => ({
    name: item.category,
    value: Math.abs(item.totalAmount)
  }));

  const income = data.find(d => d.category.toLowerCase() === "income");
  const expenses = data
    .filter(d => d.category.toLowerCase() !== "income")
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const lineData = [
    { name: "Income", amount: income ? income.totalAmount : 0 },
    { name: "Expenses", amount: Math.abs(expenses) }
  ];

  return (
    <div className="charts">
      {/* Pie Chart */}
      <div className="chart">
        <h3>Pie Chart - Expense Categories</h3>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={value => `₹${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="chart">
        <h3>Line Chart - Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={value => `₹${value}`} />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;

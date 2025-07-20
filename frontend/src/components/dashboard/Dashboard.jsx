import React from "react";
import Stats from "./Stats";
import Charts from "./Charts";
import Transactions from "./Transactions";
import Actions from "./Actions";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Dashboard</div>
      <Stats />
      <Charts />
      <div className="bottom-section">
        <Transactions />
        <Actions />
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import Stats from "./Stats";
import Charts from "./Charts";
import Transactions from "./Transactions";
import Actions from "./Actions";
import { getMonthlySummary, getCategoryDistribution } from "../../apis/dashboardApi";
import "./Dashboard.css";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    // Fetch summary data
    async function fetchSummary() {
      try {
        const res = await getMonthlySummary(userId);
        if (res.success) {
          setSummary(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      }
    }

    // Fetch category distribution data
    async function fetchCategoryDistribution() {
      try {
        const res = await getCategoryDistribution(userId);
        if (res.success) {
          setCategoryData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch category distribution:", error);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchSummary();
    fetchCategoryDistribution();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Dashboard</div>
      <Stats summary={summary} />
      <Charts data={categoryData} loading={loadingCategories} />
      <div className="bottom-section">
        <Transactions />
        <Actions />
      </div>
    </div>
  );
};

export default Dashboard;

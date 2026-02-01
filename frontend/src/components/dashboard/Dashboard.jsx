// frontend/src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stats from "./Stats";
import Charts from "./Charts";
import Transactions from "./Transactions";
import Actions from "./Actions";
import ExportModal from "./ExportModal";
import TipsCard from "./TipsCard";
import BudgetsCard from "./BudgetsCard";
import GoalsCard from "./GoalsCard";
import RecurringCard from "./RecurringCard";
import Toast from "../../components/Toast";
import { getMonthlySummary, getCategoryDistribution } from "../../apis/dashboardApi";
import { getTransactions } from "../../apis/transactionApi";
import { getProfile } from "../../apis/profileApi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("INR");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // ✅ Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 3000);
  };

  // Fetch summary & category distribution
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchSummary = async () => {
      try {
        const res = await getMonthlySummary(userId, selectedMonth, selectedYear);
        if (res.success) setSummary(res.data);
      } catch (err) {
        console.error(err);
        showToast("Failed to load summary", "error");
      }
    };

    const fetchCategoryDistribution = async () => {
      try {
        const res = await getCategoryDistribution(userId, selectedMonth, selectedYear);
        if (res.success) setCategoryData(res.data);
      } catch (err) {
        console.error(err);
        showToast("Failed to load categories", "error");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchSummary();
    fetchCategoryDistribution();
  }, [selectedMonth, selectedYear]);

  // Fetch profile for currency
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data?.currency) setCurrency(res.data.currency);
      } catch {
        // keep default INR
      }
    };
    fetchProfile();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await getTransactions({ userId, page: 1, limit: 3 });
        const data = response.data || response;
        setRecentTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      } catch (err) {
        console.error(err);
        showToast("Failed to load transactions", "error");
      }
    };

    fetchRecentTransactions();
  }, []);

  const handleAddTransaction = () => {
    navigate("/transactions", { state: { openAddModal: true } });
  };

  const handleExport = () => setShowExportModal(true);

  const handleGenerateReport = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      showToast("User not logged in", "error");
      return;
    }

    try {
      const response = await getTransactions({ userId, page: 1, limit: 10000 });
      const transactions = (response.data || response).transactions || [];

      const filtered = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        if (exportStartDate && txDate < new Date(exportStartDate)) return false;
        if (exportEndDate && txDate > new Date(exportEndDate + "T23:59:59")) return false;
        return true;
      });

      if (filtered.length === 0) {
        showToast("No transactions found for selected date range", "error");
        return;
      }

      const csvHeader = "user_id,date,description,amount,account,category\n";
      const csvRows = filtered
        .map(
          (tx) =>
            `${userId},${tx.date || ""},"${(tx.description || "").replace(/"/g, '""')}",${tx.amount || ""},"${(tx.account || "").replace(/"/g, '""')}","${tx.category || ""}"`
        )
        .join("\n");

      const blob = new Blob([csvHeader + csvRows], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast("Transactions exported successfully ✅", "success");
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      showToast("Export failed", "error");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span>Dashboard</span>
        <div className="dashboard-filters">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(+e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select value={selectedYear} onChange={(e) => setSelectedYear(+e.target.value)}>
            {Array.from({ length: 6 }, (_, i) => {
              const year = new Date().getFullYear() + 1 - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {!summary && !loadingCategories ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty-title">Welcome to Paisatracker</p>
          <p className="dashboard-empty-text">Add your first transaction to see your dashboard come to life.</p>
          <button type="button" className="dashboard-empty-btn" onClick={handleAddTransaction}>
            Add transaction
          </button>
        </div>
      ) : (
        <>
      <Stats summary={summary} currency={currency} />
      <div className="dashboard-tips-budgets">
        <TipsCard summary={summary} />
        <BudgetsCard selectedMonth={selectedMonth} selectedYear={selectedYear} />
        <GoalsCard currency={currency} />
      </div>
      <RecurringCard currency={currency} categories={["Bills & Utilities", "Entertainment", "Income", "Shopping", "Other"]} />
      <Charts data={categoryData} loading={loadingCategories} />
        </>
      )}

      <div className="bottom-section">
        <Transactions transactions={recentTransactions} />
        <Actions
          onAddTransaction={handleAddTransaction}
          onExport={handleExport}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
        />
      </div>

      {showExportModal && (
        <ExportModal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          startDate={exportStartDate}
          endDate={exportEndDate}
          setStartDate={setExportStartDate}
          setEndDate={setExportEndDate}
          onGenerate={handleGenerateReport}
        />
      )}

      {/* ✅ Toast */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
};

export default Dashboard;

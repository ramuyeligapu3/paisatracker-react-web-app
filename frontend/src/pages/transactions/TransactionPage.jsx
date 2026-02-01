// frontend/src/pages/transactions/TransactionPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import Card from "../../components/Card";
import TransactionForm from "./TransactionForm";
import Table from "../../components/Table";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import Toast from "../../components/Toast";
import "./TransactionPage.css";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
} from "../../apis/transactionApi";

const categoryOptions = [
  "Food & Dining",
  "Income",
  "Transportation",
  "Entertainment",
  "Bills & Utilities",
];

const accountOptions = [
  "Checking Account",
  "Savings Account",
  "Credit Card",
];

const dynamicColumns = [
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  { key: "account", label: "Account" },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    render: (value) =>
      value < 0
        ? `-₹${Math.abs(value).toLocaleString()}`
        : `+₹${value.toLocaleString()}`,
  },
];

function TransactionsPage() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState(null);

  const transactionsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    date: "",
    description: "",
    category: categoryOptions[0],
    account: accountOptions[0],
    amount: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /** Show toast helper */
  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  /** Fetch Transactions */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        showToastMsg("User not logged in", "error");
        return;
      }

      const params = {
        userId,
        search: searchTerm,
        category: categoryFilter !== "All Categories" ? categoryFilter : "",
        account: accountFilter !== "All Accounts" ? accountFilter : "",
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: transactionsPerPage,
      };

      const response = await getTransactions(params);
      const data = response.data || response;

      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      showToastMsg("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, accountFilter, startDate, endDate, currentPage]);

  /** Fetch Monthly Summary */
  const fetchSummary = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await getMonthlySummary(userId);
      if (res.success) {
        setSummary(res.data);
      } else {
        console.error("API error", res.message);
      }
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  }, []);

  /** Reset to page 1 when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, accountFilter, startDate, endDate]);

  /** Initial fetch calls */
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      openAddModal();
    }
  }, [location.state]);

  const {
    totalIncome = 0,
    totalExpenses = 0,
    netBalance = 0,
    incomeChange = 0,
    expensesChange = 0,
    balanceChange = 0,
  } = summary || {};

  /** Modal handlers */
  const openAddModal = () => {
    setModalType("add");
    setTransactionForm({
      date: "",
      description: "",
      category: categoryOptions[0],
      account: accountOptions[0],
      amount: "",
    });
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setModalType("edit");
    setSelectedTransaction(transaction);
    setTransactionForm({
      date: transaction.date?.substring(0, 10) || "",
      description: transaction.description || "",
      category: transaction.category || categoryOptions[0],
      account: transaction.account || accountOptions[0],
      amount: transaction.amount?.toString() || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  /** Form change handler */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm({ ...transactionForm, [name]: value });
  };

  /** Save transaction (add or update) */
  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const formatted = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        user_id: userId,
      };

      if (modalType === "add") {
        await createTransaction(formatted);
        showToastMsg("Transaction added successfully");
      } else {
        await updateTransaction(selectedTransaction.id, formatted);
        showToastMsg("Transaction updated successfully");
      }

      closeModal();
      await fetchTransactions();

      // Refresh summary after saving
      await fetchSummary();
    } catch (err) {
      console.error("Error saving transaction:", err);
      showToastMsg("Error saving transaction", "error");
    }
  };

  /** Delete transaction */
  const handleDelete = async (transaction) => {
    try {
      await deleteTransaction(transaction.id);
      showToastMsg("Transaction deleted");
      await fetchTransactions();

      // Refresh summary after deleting
      await fetchSummary();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      showToastMsg("Error deleting transaction", "error");
    }
  };

  /** Pagination */
  const totalPages = Math.ceil(totalCount / transactionsPerPage);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="transactions-page">
      <h2>Transactions</h2>
      <p>Track and manage all your financial transactions</p>

      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        categoryOptions={categoryOptions}
        accountOptions={accountOptions}
        onAddClick={openAddModal}
      />

      <div className="summary-cards">
        <Card title="Total Income" amount={totalIncome} change={incomeChange} color="green" />
        <Card title="Total Expenses" amount={totalExpenses} change={expensesChange} color="red" />
        <Card title="Net Balance" amount={netBalance} change={balanceChange} color={netBalance >= 0 ? "green" : "red"} />
      </div>

      <TransactionForm
        show={showModal}
        onClose={closeModal}
        formData={transactionForm}
        onChange={handleFormChange}
        onSave={handleSave}
        type={modalType}
        categories={categoryOptions}
        accounts={accountOptions}
      />

      <Table
        data={transactions}
        onEdit={openEditModal}
        onDelete={handleDelete}
        columns={dynamicColumns}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
}

export default TransactionsPage;

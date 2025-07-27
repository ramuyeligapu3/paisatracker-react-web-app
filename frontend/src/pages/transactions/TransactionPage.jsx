import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/Card";
import TransactionForm from "./TransactionForm";
import Table from "../../components/Table";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import Toast from "../../components/Toast";
import "./TransactionPage.css";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../apis/transactionApi';

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
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  /** ✅ Show toast helper */
  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  /** ✅ Fetch Transactions */
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
  }, [searchTerm, categoryFilter, accountFilter, currentPage]);

  /** ✅ Initial + dependency-based fetch */
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /** ✅ Summary Calculations */
  const totalIncome = transactions.reduce(
    (sum, tx) => (tx.amount > 0 ? sum + tx.amount : sum),
    0
  );
  const totalExpenses = transactions.reduce(
    (sum, tx) => (tx.amount < 0 ? sum + tx.amount : sum),
    0
  );
  const netBalance = totalIncome + totalExpenses;

  /** ✅ Modal Handlers */
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

  /** ✅ Form Change */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm({ ...transactionForm, [name]: value });
  };

  /** ✅ Save Transaction */
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
    } catch (err) {
      console.error("Error saving transaction:", err);
      showToastMsg("Error saving transaction", "error");
    }
  };

  /** ✅ Delete Transaction */
  const handleDelete = async (transaction) => {
    try {
      await deleteTransaction(transaction.id);
      showToastMsg("Transaction deleted");
      await fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      showToastMsg("Error deleting transaction", "error");
    }
  };

  /** ✅ Pagination */
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
        categoryOptions={categoryOptions}
        accountOptions={accountOptions}
        onAddClick={openAddModal}
      />

      <div className="summary-cards">
        <Card title="Total Income" amount={totalIncome} color="green" />
        <Card title="Total Expenses" amount={totalExpenses} color="red" />
        <Card title="Net Balance" amount={netBalance} color="blue" />
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

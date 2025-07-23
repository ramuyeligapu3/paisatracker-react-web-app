import React, { useState, useEffect } from 'react';
import Card from "../../components/Card";
import TransactionForm from "./TransactionForm";
import Table from "../../components/Table";
import Filters from '../../components/Filters';
import Pagination from '../../components/Pagination';
import Toast from '../../components/Toast';
import './TransactionPage.css';

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../../services/api';

const categoryOptions = [
  'Food & Dining', 'Income', 'Transportation', 'Entertainment', 'Bills & Utilities'
];

const accountOptions = [
  'Checking Account', 'Savings Account', 'Credit Card'
];

const dynamicColumns = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'account', label: 'Account' },
  {
    key: 'amount',
    label: 'Amount',
    align: 'right',
    render: (value) =>
      value < 0
        ? `-₹${Math.abs(value).toLocaleString()}`
        : `+₹${value.toLocaleString()}`
  }
];

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [accountFilter, setAccountFilter] = useState('All Accounts');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const transactionsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    date: '', description: '', category: categoryOptions[0],
    account: accountOptions[0], amount: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, categoryFilter, accountFilter, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setToastType("error");
        setToastMessage("User not logged in");
        setShowToast(true);
        return;
      }

      const params = {
        userId,
        search: searchTerm,
        category: categoryFilter !== 'All Categories' ? categoryFilter : '',
        account: accountFilter !== 'All Accounts' ? accountFilter : '',
        page: currentPage,
        limit: transactionsPerPage
      };
      const response = await getTransactions(params);
      const { transactions, total } = response.data || response;
      setTransactions(transactions);
      setTotalCount(total);
    } catch (err) {
      setToastType("error");
      setToastMessage("Failed to load transactions");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.reduce(
    (sum, tx) => (tx.amount > 0 ? sum + tx.amount : sum), 0);
  const totalExpenses = transactions.reduce(
    (sum, tx) => (tx.amount < 0 ? sum + tx.amount : sum), 0);
  const netBalance = totalIncome + totalExpenses;

  const openAddModal = () => {
    setModalType('add');
    setTransactionForm({
      date: '', description: '', category: categoryOptions[0],
      account: accountOptions[0], amount: ''
    });
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setModalType('edit');
    setSelectedTransaction(transaction);
    console.log("((((((((((((((((((update data ",transaction);

    setTransactionForm({
      date: transaction.date?.substring(0, 10) || '',
      description: transaction.description || '',
      category: transaction.category || categoryOptions[0],
      account: transaction.account || accountOptions[0],
      amount: transaction.amount?.toString() || '',
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm({ ...transactionForm, [name]: value });
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const formatted = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        user_id: userId
      };

      if (modalType === 'add') {
        await createTransaction(formatted);
        setToastType("success");
        setToastMessage("Transaction added successfully");
      } else {
        await updateTransaction(selectedTransaction.id, formatted);
        setToastType("success");
        setToastMessage("Transaction updated successfully");
      }

      closeModal();
      await fetchTransactions();
    } catch (err) {
      setToastType("error");
      setToastMessage("Error saving transaction");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDelete = async (transaction) => {
    try {
      await deleteTransaction(transaction.id);
      setToastType("success");
      setToastMessage("Transaction deleted");
      await fetchTransactions();
    } catch (err) {
      setToastType("error");
      setToastMessage("Error deleting transaction");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const totalPages = Math.ceil(totalCount / transactionsPerPage);
  const currentTransactions = transactions;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
        data={currentTransactions}
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

      <Toast show={showToast} message={toastMessage} type={toastType} />
    </div>
  );
}

export default TransactionsPage;

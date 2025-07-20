import React, { useState } from 'react';
import Card from "../../components/Card";
import TransactionForm from "./TransactionForm";
import Table from "../../components/Table";

import Filters from '../../components/Filters';
import Pagination from '../../components/Pagination';
import Toast from '../../components/Toast';
import './TransactionPage.css';

const categoryOptions = [
  'Food & Dining',
  'Income',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
];

const dynamicColumns=[
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
  ]

const accountOptions = [
  'Checking Account',
  'Savings Account',
  'Credit Card',
];

const initialTransactions = [
  {
    date: '2025-01-15',
    description: 'Grocery Shopping - Walmart',
    category: 'Food & Dining',
    account: 'Checking Account',
    amount: -2450,
  },
  {
    date: '2025-01-14',
    description: 'Salary Deposit',
    category: 'Income',
    account: 'Savings Account',
    amount: 45000,
  },
];

function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [accountFilter, setAccountFilter] = useState('All Accounts');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTransactionIndex, setSelectedTransactionIndex] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    date: '',
    description: '',
    category: categoryOptions[0],
    account: accountOptions[0],
    amount: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const totalIncome = transactions.reduce(
    (sum, tx) => (tx.amount > 0 ? sum + tx.amount : sum),
    0
  );
  const totalExpenses = transactions.reduce(
    (sum, tx) => (tx.amount < 0 ? sum + tx.amount : sum),
    0
  );
  const netBalance = totalIncome + totalExpenses;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All Categories' || tx.category === categoryFilter;
    const matchesAccount =
      accountFilter === 'All Accounts' || tx.account === accountFilter;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  const totalTransactions = filteredTransactions.length;
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openAddModal = () => {
    setModalType('add');
    setTransactionForm({
      date: '',
      description: '',
      category: categoryOptions[0],
      account: accountOptions[0],
      amount: ''
    });
    setShowModal(true);
  };

  const openEditModal = (index) => {
    setModalType('edit');
    setSelectedTransactionIndex(index);
    const tx = transactions[index];
    setTransactionForm({
      date: tx.date,
      description: tx.description,
      category: tx.category,
      account: tx.account,
      amount: tx.amount
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm({ ...transactionForm, [name]: value });
  };

  const handleSave = () => {
    if (!transactionForm.date || !transactionForm.description || !transactionForm.category || !transactionForm.account || !transactionForm.amount) {
      alert('Please fill all fields');
      return;
    }

    const updatedTx = { ...transactionForm, amount: parseFloat(transactionForm.amount) };

    if (modalType === 'add') {
      setTransactions([updatedTx, ...transactions]);
      setToastMessage('Transaction added successfully!');
    } else if (modalType === 'edit' && selectedTransactionIndex !== null) {
      const newTransactions = [...transactions];
      newTransactions[selectedTransactionIndex] = updatedTx;
      setTransactions(newTransactions);
      setToastMessage('Transaction updated successfully!');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowModal(false);
  };

  const handleDelete = (index) => {
    const newTxs = [...transactions];
    newTxs.splice(index, 1);
    setTransactions(newTxs);
    setToastMessage('Transaction deleted');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="transactions-page">
        <h2>Transactions</h2>
        <br></br>
        <p>Track and manage all your financial transactions</p>
        <br></br>
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
        />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Toast show={showToast} message={toastMessage} />
    </div>
  );
}

export default TransactionsPage;

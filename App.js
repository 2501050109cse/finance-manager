import { useEffect, useState } from "react";
import "./App.css";

/* Chart.js imports */
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const STORAGE_KEY = "pfm_transactions_v1";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "Salary",
    description: "",
    amount: ""
  });
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  /* Load from localStorage */
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setTransactions(JSON.parse(data));
  }, []);

  /* Save to localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;

    setTransactions([
      ...transactions,
      { ...form, id: Date.now(), amount: Number(form.amount) }
    ]);

    setForm({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "Salary",
      description: "",
      amount: ""
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions.filter(t =>
    (filterType === "all" || t.type === filterType) &&
    (filterCategory === "all" || t.category === filterCategory)
  );

  /* ===== CHART DATA ===== */

  const expenseByCategory = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseByCategory[t.category] =
        (expenseByCategory[t.category] || 0) + t.amount;
    });

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          "#f44336",
          "#ff9800",
          "#4caf50",
          "#2196f3",
          "#9c27b0",
          "#795548",
          "#607d8b"
        ]
      }
    ]
  };

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [totalIncome, totalExpense],
        backgroundColor: ["#4caf50", "#f44336"]
      }
    ]
  };

  return (
    <div className="container">
      <h1>Personal Finance Manager</h1>

      {/* Summary */}
      <div className="summary">
        <div className="card income">Income ₹{totalIncome.toFixed(2)}</div>
        <div className="card expense">Expense ₹{totalExpense.toFixed(2)}</div>
        <div className="card balance">Balance ₹{balance.toFixed(2)}</div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />

        <select
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        >
          <option>Salary</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
        />

        <button>Add</button>
      </form>

      {/* Filters */}
      <div className="filters">
        <select onChange={e => setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All</option>
          <option>Salary</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.type}</td>
              <td>{t.category}</td>
              <td>{t.description}</td>
              <td>₹{t.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => deleteTransaction(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== CHARTS BELOW TABLE ===== */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
          Expense Analysis
        </h2>

        {Object.keys(expenseByCategory).length > 0 ? (
          <Pie data={pieData} />
        ) : (
          <p style={{ textAlign: "center" }}>No expense data available</p>
        )}

        <h2 style={{ textAlign: "center", margin: "30px 0 15px" }}>
          Income vs Expense
        </h2>

        <Bar data={barData} />
      </div>
    </div>
  );
}

export default App;

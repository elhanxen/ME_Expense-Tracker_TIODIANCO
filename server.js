const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get('/api/expenses', (req, res) => {
  res.status(200).json(readData());
});

app.get('/api/expenses/:id', (req, res) => {
  const expense = readData().find(e => e.id === Number(req.params.id));
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.status(200).json(expense);
});

app.post('/api/expenses', (req, res) => {
  const { description, category, amount, date } = req.body;
  const value = Number(amount);

  if (!description || !category || !date || isNaN(value)) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (value <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  const expenses = readData();
  const id = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
  const newExpense = { id, description, category, amount: value, date };

  expenses.push(newExpense);
  writeData(expenses);
  res.status(201).json(newExpense);
});

app.delete('/api/expenses/:id', (req, res) => {
  const expenses = readData();
  const index = expenses.findIndex(e => e.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  const deleted = expenses.splice(index, 1)[0];
  writeData(expenses);
  res.status(200).json({ message: 'Expense deleted', expense: deleted });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

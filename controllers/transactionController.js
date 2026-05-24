const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const htmlPdf = require("html-pdf-node");

const addTransaction = async (req, res) => {
  try {
    const { amount, category, type, date, description } = req.body;

    const transaction = await Transaction.create({
      userId: req.user,
      user: req.user, 
      amount: Number(amount),
      category,
      type,
      date: date || new Date(),
      description,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("❌ MongoDB Insertion Error:", error.message);
    res.status(500).json({ message: "Failed to add transaction", error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { amount, category, type, date, description } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount: Number(amount), category, type, date: date || new Date(), description },
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction", error: error.message });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const { month, year, type, category } = req.query;
    let matchFilters = {};

    if (type) matchFilters.type = type;
    if (category) matchFilters.category = category;

    if (year || month) {
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      let startMonth = 0;
      let endMonth = 12;

      if (month) {
        startMonth = parseInt(month);
        endMonth = startMonth + 1;
      }

      matchFilters.date = {
        $gte: new Date(currentYear, startMonth, 1),
        $lt: new Date(currentYear, endMonth, 1)
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary data", error: error.message });
  }
};

// 🚀 NEW: Server-Side HTML to PDF Compiler Controller
const exportTransactionsToPDF = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 });

    let tableRows = transactions.map(tx => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 12px; color: #334155;">${tx.description}</td>
        <td style="padding: 12px; font-size: 12px; color: #475569;">${tx.category}</td>
        <td style="padding: 12px; font-size: 12px; font-weight: bold; color: ${tx.type === 'income' ? '#10b981' : '#f43f5e'};">${tx.type.toUpperCase()}</td>
        <td style="padding: 12px; font-size: 12px; font-family: monospace; font-weight: bold;">INR ${tx.amount.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; font-size: 12px; color: #64748b;">${new Date(tx.date).toLocaleDateString('en-IN')}</td>
      </tr>
    `).join("");

    let htmlContent = `
      <html>
        <head>
          <style>body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }</style>
        </head>
        <body>
          <h1 style="color: #06b6d4; margin-bottom: 4px;">ExpenseTracker</h1>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">Official Financial Statement Ledger — Generated May 2026</p>
          <table style="w-full; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Description</th>
                <th style="padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Category</th>
                <th style="padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Type</th>
                <th style="padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Amount</th>
                <th style="padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748b;">Date</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    let options = { format: 'A4' };
    let file = { content: htmlContent };

    htmlPdf.generatePdf(file, options).then(pdfBuffer => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Financial_Statement.pdf');
      res.status(200).send(pdfBuffer);
    });
  } catch (error) {
    res.status(500).json({ message: "Failed generating document statement stream", error: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getTransactionSummary,
  updateTransaction,
  exportTransactionsToPDF
};
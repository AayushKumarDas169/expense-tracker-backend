const User = require("../models/user");
const Transaction = require("../models/transaction");

// 💰 1. DEPOSIT OR WITHDRAW MANUALLY FROM SAVINGS WITH LEDGER ENTRIES
exports.handleManualSavingsTransaction = async (req, res) => {
  try {
    const { amount, type } = req.body; 
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Please enter a valid amount." });
    }

    const user = await User.findOne(); 
    if (!user) return res.status(404).json({ error: "User profile context not found." });

    if (type === "deposit") {
      user.savingsBalance += Number(amount);
      
      const depositTx = new Transaction({
        user: user._id,
        description: "Deposit to Savings Vault",
        amount: Number(amount),
        type: "expense",
        category: "Utilities", 
        date: new Date()
      });
      await depositTx.save();

    } else if (type === "withdraw") {
      if (user.savingsBalance < amount) {
        return res.status(400).json({ error: "Insufficient vault savings balance!" });
      }
      user.savingsBalance -= Number(amount);

      const withdrawTx = new Transaction({
        user: user._id,
        description: "Withdrawal from Savings",
        amount: Number(amount),
        type: "income",
        category: "Salary", 
        date: new Date()
      });
      await withdrawTx.save();
    } else {
      return res.status(400).json({ error: "Invalid execution parameter." });
    }

    await user.save();
    return res.status(200).json({ 
      message: `Successfully completed savings ${type}!`, 
      savingsBalance: user.savingsBalance 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 🔄 2. AUTOMATED LIQUID CASH SWEEP INTO SAVINGS WITH RELATION LINKS
exports.sweepMonthlySurplus = async (req, res) => {
  try {
    const { sweepAmount } = req.body;

    if (!sweepAmount || sweepAmount <= 0) {
      return res.status(400).json({ error: "No valid sweep amount provided to the server core." });
    }

    const user = await User.findOne(); 
    if (!user) return res.status(404).json({ error: "User context not found." });

    user.savingsBalance += Number(sweepAmount);
    await user.save();

    const balancingTx = new Transaction({
      user: user._id,
      description: "Sweep to Savings Vault",
      amount: Number(sweepAmount),
      type: "expense",
      category: "Utilities", 
      date: new Date()
    });
    await balancingTx.save();

    return res.status(200).json({ 
      message: `Success! Swept ₹${sweepAmount} into your savings vault. Liquid cash reset.`,
      savingsBalance: user.savingsBalance
    });
  } catch (err) {
    return res.status(500).json({ error: "Sweep routing error: " + err.message });
  }
};
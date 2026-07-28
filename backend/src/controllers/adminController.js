const prisma = require('../config/prisma');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat pengguna.' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { created_at: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat transaksi.' });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeEvents = await prisma.event.count({ where: { status: 'published' } });
    const totalTransactionsAmount = await prisma.transaction.aggregate({
      _sum: { total_amount: true },
      where: { payment_status: 'paid' }
    });
    const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: 'pending' } });

    res.json({
      totalUsers,
      activeEvents,
      totalIncome: totalTransactionsAmount._sum.total_amount || 0,
      pendingWithdrawals
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat statistik.' });
  }
};

module.exports = { getAllUsers, getAllTransactions, getPlatformStats };

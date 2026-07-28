const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBanksByOrganizer = async (req, res) => {
  try {
    const { organizer_id } = req.params;
    const banks = await prisma.organizerBankAccount.findMany({
      where: { organizer_id: parseInt(organizer_id) }
    });
    res.json(banks);
  } catch (error) {
    console.error('Error fetching banks by organizer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyBanks = async (req, res) => {
  try {
    const banks = await prisma.organizerBankAccount.findMany({
      where: { organizer_id: req.user.id }
    });
    res.json(banks);
  } catch (error) {
    console.error('Error fetching my banks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createBank = async (req, res) => {
  try {
    const { bank_name, account_number, account_name, is_active } = req.body;
    const newBank = await prisma.organizerBankAccount.create({
      data: { bank_name, account_number, account_name, is_active, organizer_id: req.user.id }
    });
    res.status(201).json(newBank);
  } catch (error) {
    console.error('Error creating bank:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateBank = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { bank_name, account_number, account_name, is_active } = req.body;
    
    const bank = await prisma.organizerBankAccount.findUnique({ where: { id }});
    if(!bank || bank.organizer_id !== req.user.id) return res.status(403).json({message: 'Forbidden'});

    const updatedBank = await prisma.organizerBankAccount.update({
      where: { id },
      data: { bank_name, account_number, account_name, is_active }
    });
    res.json(updatedBank);
  } catch (error) {
    console.error('Error updating bank:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bank = await prisma.organizerBankAccount.findUnique({ where: { id }});
    if(!bank || bank.organizer_id !== req.user.id) return res.status(403).json({message: 'Forbidden'});

    await prisma.organizerBankAccount.delete({ where: { id } });
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

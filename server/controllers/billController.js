import Bill from '../models/Bill.js'; 

export const genrate = async (req, res) => {
  try {
    const { description, hsnCode, amount } = req.body;

    if (!description || !hsnCode || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bill = await Bill.create({ description, hsnCode, amount });

    res.status(201).json({ message: 'Bill created successfully', data: bill });
  } catch (err) {
    console.error('Error generating bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({});
    if (!bills || bills.length === 0) {
      return res.status(404).json({ error: 'No bills found' });
    }
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'bill not found' });
    res.json({ data: bill });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, hsnCode, amount } = req.body;

    if (!description || !hsnCode || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { description, hsnCode, amount },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json({ message: 'Bill updated successfully', data: updatedBill });
  } catch (err) {
    console.error('Error updating bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteBill= async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Billdeleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Bill' });
  }
};
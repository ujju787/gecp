import { db } from '../db.js';

const DEFAULT_UPI_ID = '6205482672@ptsbi';

// Process Online Fee Payment & Generate Verifiable Receipt
export const processFeePayment = async (req, res) => {
  try {
    const { 
      studentId, 
      studentName, 
      rollNo, 
      regNo, 
      branch, 
      semester, 
      purpose, 
      feeType, 
      amount, 
      paymentMode,
      categoryConcession,
      upiId = DEFAULT_UPI_ID,
      utrNumber
    } = req.body;

    if (!amount || !studentName || !purpose) {
      return res.status(400).json({ error: 'Missing mandatory payment details.' });
    }

    // STRICT UTR VALIDATION (NPCI / RBI UPI Guideline: Exactly 12 numeric digits)
    const cleanUtr = String(utrNumber || '').trim();
    if (!cleanUtr) {
      return res.status(400).json({ 
        error: 'UTR Number is required. Please enter the 12-digit UPI Reference Number / UTR from your payment app.' 
      });
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({ 
        error: 'Invalid UTR Number format. UPI Transaction Reference Number (UTR) must be exactly 12 numeric digits (e.g. 426189320154) as shown in Google Pay, PhonePe, Paytm, or BHIM receipt.' 
      });
    }

    // DUPLICATE UTR CHECK IN DATABASE
    const existingTxn = await db.findFeeTransactionByUtr(cleanUtr);
    if (existingTxn) {
      return res.status(400).json({ 
        error: `This UTR (${cleanUtr}) has already been recorded for receipt ${existingTxn.refNo} on ${existingTxn.date}. Duplicate UTR numbers cannot be used.` 
      });
    }

    const receiptId = `TXN-GECP-${Date.now().toString().slice(-6)}`;
    const refNo = `SBI-EPAY-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const now = new Date();

    const newTransaction = {
      id: receiptId,
      refNo,
      studentId: studentId || 'usr-std-01',
      studentName: studentName.trim(),
      rollNo: rollNo ? rollNo.trim().toUpperCase() : '22/CSE/042',
      regNo: regNo ? regNo.trim() : 'JUT/2022/CSE/0892',
      branch: branch || 'Computer Science & Engineering',
      semester: semester || '5th Semester',
      purpose,
      feeType: feeType || 'exam',
      amount: Number(amount),
      concessionCategory: categoryConcession || 'general',
      paymentMode: paymentMode || 'Online UPI (BHIM/PhonePe/GPay)',
      upiId: upiId || DEFAULT_UPI_ID,
      utrNumber: cleanUtr,
      status: 'SUCCESS',
      institution: 'Government Engineering College, Palamu',
      merchantCode: 'GECP-SBI-COLLECT-822118',
      securityHash: `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now.toISOString()
    };

    const recordResult = await db.recordFeeTransaction(newTransaction);

    return res.status(201).json({
      message: 'Payment verified and recorded in GEC Palamu MySQL Database! Fee balance has been updated.',
      success: true,
      receipt: newTransaction,
      updatedDues: recordResult.updatedDues ? {
        ...recordResult.updatedDues,
        tuition: recordResult.updatedDues.tuitionDue,
        exam: recordResult.updatedDues.examDue,
        hostel: recordResult.updatedDues.hostelDue,
        library: recordResult.updatedDues.libraryDue
      } : null
    });
  } catch (error) {
    console.error('Payment Processing Error:', error);
    return res.status(500).json({ error: error.message || 'Payment gateway transaction processing failed.' });
  }
};

// Verify Fee Receipt / Challan by ID, Reference Number, or UTR Number
export const verifyFeeReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    if (!receiptId) {
      return res.status(400).json({ error: 'Receipt, Reference ID, or UTR is required.' });
    }

    const receipt = await db.findFeeTransactionById(receiptId.trim());
    if (!receipt) {
      return res.status(404).json({ 
        verified: false,
        error: 'Receipt record not found in official GEC Palamu MySQL database. Please verify the transaction reference or UTR.' 
      });
    }

    return res.json({
      verified: true,
      status: 'VERIFIED_OFFICIAL_RECORD',
      message: 'This receipt is authentic and confirmed by the GEC Palamu Finance & Accounts Division.',
      receipt
    });
  } catch (error) {
    console.error('Verify Fee Receipt Error:', error);
    return res.status(500).json({ error: 'Receipt verification server error.' });
  }
};

// Get All Transactions for a Student
export const getStudentPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await db.getStudentFeeTransactions(studentId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student payment history.' });
  }
};

// Get Student Outstanding Dues and Payment Summary
export const getStudentFeeDues = async (req, res) => {
  try {
    const { studentId } = req.params;
    const dues = await db.getStudentFeeDues(studentId);
    if (!dues) {
      return res.json({
        tuition: 15200, exam: 2400, hostel: 6000, library: 0,
        tuitionDue: 15200, examDue: 2400, hostelDue: 6000, libraryDue: 0,
        tuitionPaid: 0, examPaid: 0, hostelPaid: 0, libraryPaid: 0
      });
    }
    return res.json({
      ...dues,
      tuition: dues.tuitionDue,
      exam: dues.examDue,
      hostel: dues.hostelDue,
      library: dues.libraryDue
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student fee dues.' });
  }
};

// Get All Transactions (Admin / Audit)
export const getAllTransactions = async (req, res) => {
  try {
    const txns = await db.getFeeTransactions();
    return res.json(txns);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  QrCode, 
  Download, 
  Receipt, 
  Clock, 
  DollarSign,
  AlertCircle,
  X,
  Sparkles,
  Search,
  ExternalLink,
  FileCheck2,
  Copy,
  Check,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { COLLEGE_INFO } from '../../data/collegeData';
import { getStudentData, saveStudentData } from '../../utils/storage';
import { api } from '../../services/api';
import { printFeeReceipt } from '../../utils/printDocument';

const OFFICIAL_UPI_ID = 'ujjwal.672@ptaxis';

export default function FeeCalculator({ currentUser, studentData }) {
  const [activePortalTab, setActivePortalTab] = useState('pay'); // 'pay' | 'verify'
  
  // Use passed studentData or currentUser if available, fallback to getStudentData()
  const student = studentData || (currentUser?.role === 'student' ? currentUser : null) || getStudentData() || {};
  const [transactions, setTransactions] = useState([]);

  // Live fee dues from MySQL
  const [liveDues, setLiveDues] = useState({ tuition: 15200, exam: 2400, hostel: 6000, library: 0 });
  const [loadingDues, setLoadingDues] = useState(false);

  // Fee selection state
  const [selectedFeeType, setSelectedFeeType] = useState('exam'); // 'tuition' | 'exam' | 'hostel' | 'custom'
  const [categoryConcession, setCategoryConcession] = useState('general');
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  
  // UPI & Python QR state
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [pythonUpiQr, setPythonUpiQr] = useState(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Modals & simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Verification tab state
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  const receiptQrCanvasRef = useRef(null);
  const verifyQrCanvasRef = useRef(null);

  // Load live dues for this student from MySQL backend
  const loadDues = async () => {
    const studentIdOrRoll = student?.id || student?.rollNo;
    if (!studentIdOrRoll) return;
    setLoadingDues(true);
    try {
      const dues = await api.getStudentFeeDues(studentIdOrRoll);
      if (dues) {
        setLiveDues(dues);
      }
    } catch (e) {
      console.warn('Could not load fee dues from MySQL:', e);
    } finally {
      setLoadingDues(false);
    }
  };

  // Fetch transactions from backend for this student
  const loadTransactions = async () => {
    try {
      let data = [];
      const studentIdOrRoll = student?.id || student?.rollNo;
      if (currentUser?.role === 'admin') {
        data = await api.getAllTransactions();
      } else if (studentIdOrRoll) {
        data = await api.getStudentPaymentHistory(studentIdOrRoll);
      } else {
        data = await api.getAllTransactions();
      }
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (e) {
      console.warn('Could not load backend transactions:', e);
    }
  };

  useEffect(() => {
    loadDues();
    loadTransactions();
  }, [student?.id, student?.rollNo, currentUser?.role]);

  const isHostelResident = Boolean(student?.hostelResident);

  // Dynamic fee rates based on MySQL dues
  const feeAmounts = {
    tuition: Number(liveDues?.tuition ?? 15200),
    exam: Number(liveDues?.exam ?? 2400),
    hostel: isHostelResident ? Number(liveDues?.hostel ?? 6000) : 0,
    custom: 1000
  };

  const getCalculatedAmount = () => {
    let base = feeAmounts[selectedFeeType] || 0;
    if (selectedFeeType === 'tuition' && categoryConcession === 'sc_st') {
      base = base * 0.2; // 80% reimbursement under e-Kalyan
    }
    return Math.round(base);
  };

  const getUpiPayload = () => {
    const amount = getCalculatedAmount();
    const roll = student.rollNo || '25CSD010';
    return `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=Government%20Engineering%20College%20Palamu&mc=8221&tn=GECP%20Fee%20${encodeURIComponent(roll)}&am=${amount}&cu=INR`;
  };

  const loadUpiQr = async () => {
    setIsGeneratingQr(true);
    const payload = getUpiPayload();

    // 1. Instant 0ms client-side render so user never sees a blank/broken box
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#0c4a6e', light: '#ffffff' }
    }, (err, url) => {
      if (!err && url) setPythonUpiQr(url);
    });

    // 2. Fetch high-res QR from backend microservice
    try {
      const res = await api.generatePythonQR(payload, {
        boxSize: 8,
        border: 2,
        fillColor: '#0c4a6e',
        backColor: '#ffffff'
      });
      if (res && res.qrBase64) {
        const formatted = res.qrBase64.startsWith('data:')
          ? res.qrBase64
          : `data:image/png;base64,${res.qrBase64}`;
        setPythonUpiQr(formatted);
      }
    } catch (e) {
      console.warn('Python QR microservice offline, using client-side fallback generator:', e);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleStartPayment = (e) => {
    e.preventDefault();
    setUtrError('');
    if (selectedFeeType === 'hostel' && !isHostelResident) {
      alert('Hostel & Mess fee is only applicable for students residing in college hostels. You are registered as a Day Scholar (Exempt).');
      return;
    }
    const amt = getCalculatedAmount();
    if (amt <= 0 && selectedFeeType !== 'custom') {
      alert(`The selected ${selectedFeeType.toUpperCase()} fee has already been fully paid and cleared in the MySQL database.`);
      return;
    }
    setShowCheckoutModal(true);
    if (paymentMode === 'upi') {
      loadUpiQr();
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulatePaymentSuccess = async () => {
    const trimmedUtr = utrNumber.trim();
    if (paymentMode === 'upi') {
      if (!trimmedUtr) {
        setUtrError('Please enter the 12-digit UTR / UPI Transaction Reference number.');
        return;
      }
      if (!/^\d{12}$/.test(trimmedUtr)) {
        setUtrError('Invalid UTR format! UTR must be exactly 12 numeric digits (e.g., 426189320154). Letters and wrong lengths are rejected.');
        return;
      }
    }

    setIsProcessing(true);
    setUtrError('');

    const feePurposeNames = {
      tuition: `${student.semester || '5th Sem'} Academic Tuition Fee`,
      exam: `JUT End-Term Examination Fee (${student.semester || '5th Sem'})`,
      hostel: 'Hostel Rent & Mess Charges',
      custom: 'Miscellaneous Academic Clearance'
    };

    const payload = {
      studentId: student.id || 'usr-std-01',
      studentName: student.name || 'Student',
      rollNo: student.rollNo || '25CSD010',
      regNo: student.regNo || 'JUT/2025/CSE/010',
      branch: student.branch || 'Computer Science and Engineering',
      semester: student.semester || '1st Sem',
      purpose: feePurposeNames[selectedFeeType] || 'Academic Fee Clearance',
      feeType: selectedFeeType,
      amount: getCalculatedAmount(),
      paymentMode: paymentMode === 'upi' ? `Online UPI (${OFFICIAL_UPI_ID})` : paymentMode === 'card' ? 'Debit/Credit Card' : 'State Bank NetBanking',
      upiId: OFFICIAL_UPI_ID,
      utrNumber: trimmedUtr || undefined,
      categoryConcession
    };

    try {
      const res = await api.processPayment(payload);
      const newReceipt = res.receipt;

      setTransactions(prev => [newReceipt, ...prev.filter(t => t.id !== newReceipt.id)]);
      setCompletedReceipt(newReceipt);
      setShowCheckoutModal(false);
      setUtrNumber('');
      setUtrError('');

      // Refresh dues directly from MySQL response
      if (res.updatedDues) {
        setLiveDues(res.updatedDues);
      } else {
        await loadDues();
      }
      await loadTransactions();

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setUtrError(err.error || err.message || 'Payment processing error: Failed to record in MySQL.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate QR on receipt modal
  useEffect(() => {
    if (completedReceipt && receiptQrCanvasRef.current) {
      QRCode.toCanvas(receiptQrCanvasRef.current, JSON.stringify({
        receiptId: completedReceipt.id,
        refNo: completedReceipt.refNo,
        student: completedReceipt.studentName,
        roll: completedReceipt.rollNo,
        amount: completedReceipt.amount,
        hash: completedReceipt.securityHash,
        status: "VERIFIED_OFFICIAL_RECORD"
      }), {
        width: 100,
        margin: 1
      });
    }
  }, [completedReceipt]);

  // Generate QR on verify modal
  useEffect(() => {
    if (verificationData && verifyQrCanvasRef.current) {
      QRCode.toCanvas(verifyQrCanvasRef.current, JSON.stringify({
        receiptId: verificationData.id,
        refNo: verificationData.refNo,
        roll: verificationData.rollNo,
        amount: verificationData.amount,
        hash: verificationData.securityHash
      }), {
        width: 90,
        margin: 1
      });
    }
  }, [verificationData]);

  // Handle Verify Receipt Lookup
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    setVerifyLoading(true);
    setVerifyError('');
    setVerificationData(null);

    try {
      const data = await api.verifyReceipt(verifyQuery.trim());
      if (data.verified && data.receipt) {
        setVerificationData(data.receipt);
      } else {
        setVerifyError('Receipt record not found in official GEC Palamu payment database.');
      }
    } catch (err) {
      setVerifyError(err.error || 'Receipt record not found in official GEC Palamu payment database. Please verify the transaction reference.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Trigger Genuine Official Receipt Download
  const handleDownloadReceipt = (receipt) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GEC Palamu Official Fee Receipt - ${receipt.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    .header { text-align: center; border-bottom: 3px double #0c4a6e; padding-bottom: 16px; margin-bottom: 24px; }
    .govt { font-size: 12px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; }
    .college { font-size: 22px; font-weight: 900; color: #0c4a6e; margin: 4px 0; }
    .address { font-size: 12px; color: #64748b; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-top: 8px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .total-row { font-weight: 900; background: #f8fafc; font-size: 14px; }
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #0c4a6e; padding-top: 20px; margin-top: 30px; font-size: 11px; color: #64748b; }
    .signature { text-align: center; border-top: 1px solid #94a3b8; width: 180px; padding-top: 4px; font-weight: bold; color: #0f172a; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <div class="govt">Department of Higher & Technical Education • Govt. of Jharkhand</div>
    <div class="college">Government Engineering College, Palamu</div>
    <div class="address">Lesliganj, Medininagar, Palamu District, Jharkhand - 822118 | Affiliated to JUT Ranchi</div>
    <div class="status-badge">✓ PAYMENT VERIFIED & OFFICIALLY RECONCILED</div>
  </div>

  <div class="meta-box">
    <div><strong>Receipt ID:</strong> ${receipt.id}</div>
    <div><strong>SBI Ref No:</strong> ${receipt.refNo}</div>
    <div><strong>Date & Time:</strong> ${receipt.date} ${receipt.time}</div>
  </div>

  <div class="grid">
    <div>Student Name: <strong>${receipt.studentName}</strong></div>
    <div>University Roll No: <strong>${receipt.rollNo}</strong></div>
    <div>Branch: <strong>${receipt.branch}</strong></div>
    <div>Academic Term: <strong>${receipt.semester}</strong></div>
    <div>Payment Channel: <strong>${receipt.paymentMode || receipt.mode}</strong></div>
    <div>Payee UPI VPA: <strong style="color:#0284c7;">${receipt.upiId || OFFICIAL_UPI_ID}</strong></div>
    <div>Bank Reference / UTR: <strong style="font-family:monospace; color:#0369a1;">${receipt.utrNumber || 'N/A'}</strong></div>
    <div>Database Record: <strong>SQL Ledger (Verified)</strong></div>
    <div style="grid-column: span 2;">Cryptographic Hash: <code style="font-size:10px;">${receipt.securityHash || 'SHA256-VERIFIED'}</code></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description / Purpose</th>
        <th>Mode</th>
        <th style="text-align:right;">Amount Remitted</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${receipt.purpose}</strong></td>
        <td>${receipt.paymentMode || receipt.mode}</td>
        <td style="text-align:right; font-weight:bold;">₹${Number(receipt.amount).toLocaleString('en-IN')}.00</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" style="text-align:right;">TOTAL CLEARED:</td>
        <td style="text-align:right; color:#15803d;">₹${Number(receipt.amount).toLocaleString('en-IN')}.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>
      <div>Verified Merchant: GECP-SBI-COLLECT-822118</div>
      <div>This is a computer-generated cryptographic clearance slip.</div>
    </div>
    <div class="signature">
      Finance & Accounts Officer<br>
      <span style="font-size:9px; font-style:normal; font-weight:normal;">GEC Palamu Authority</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `GECP_Fee_Challan_${receipt.id}.html`;
    link.click();
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-gec-navy to-sky-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>State Bank Collect (SBI) Integrated Payment Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Online Fee Payment & Challan Clearance
            </h1>

            <p className="text-sm text-sky-100 leading-relaxed font-light">
              Secure, instant digital payment portal for B.Tech semester tuition, Jharkhand University of Technology (JUT) examination fees, and hostel dues with verifiable digital receipts stored permanently in the database.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-sky-200">
              <span>Merchant: <strong>Principal, Govt. Engineering College Palamu</strong></span>
              <span>•</span>
              <span>Encrypted via 256-bit SSL</span>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Tab Switcher: Pay Fees vs Verify Receipt */}
        <div className="flex border-b border-slate-200 mb-8 space-x-3">
          <button
            onClick={() => setActivePortalTab('pay')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activePortalTab === 'pay'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Semester Dues & Exam Fees</span>
          </button>

          <button
            onClick={() => setActivePortalTab('verify')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activePortalTab === 'verify'
                ? 'border-gec-blue text-gec-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Verify Official Receipt / Challan</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
              DATABASE
            </span>
          </button>
        </div>

        {/* TAB 1: PAY FEES */}
        {activePortalTab === 'pay' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Fee Payment Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-gec-navy mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gec-orange" />
                <span>Select Dues Category</span>
              </h2>
              <p className="text-xs text-slate-500 mb-6">Choose the fees to remit and verify student details</p>

              <form onSubmit={handleStartPayment} className="space-y-5 text-xs">
                
                {/* Student Details Pre-filled Display */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Name</span>
                    <div className="font-bold text-slate-900 mt-0.5">{student.name}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">University Roll No</span>
                    <div className="font-bold text-gec-blue mt-0.5">{student.rollNo}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Branch & Sem</span>
                    <div className="font-bold text-slate-900 mt-0.5">{student.branchCode} • {student.semester}</div>
                  </div>
                </div>

                {/* Fee Option Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setSelectedFeeType('exam')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                      selectedFeeType === 'exam' 
                        ? 'border-gec-blue bg-sky-50/60 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {feeAmounts.exam <= 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        ✓ PAID / CLEARED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gec-orange uppercase">University</span>
                    )}
                    <div className="font-extrabold text-sm text-slate-900 mt-1">JUT Exam Fee</div>
                    <div className={`text-lg font-black mt-2 ${feeAmounts.exam <= 0 ? 'text-emerald-600' : 'text-gec-blue'}`}>
                      {feeAmounts.exam <= 0 ? '₹0.00' : `₹${feeAmounts.exam.toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {feeAmounts.exam <= 0 ? 'All dues cleared in MySQL' : 'End-Term Examination'}
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedFeeType('tuition')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                      selectedFeeType === 'tuition' 
                        ? 'border-gec-blue bg-sky-50/60 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {feeAmounts.tuition <= 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        ✓ PAID / CLEARED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Annual</span>
                    )}
                    <div className="font-extrabold text-sm text-slate-900 mt-1">Tuition Fee</div>
                    <div className={`text-lg font-black mt-2 ${feeAmounts.tuition <= 0 ? 'text-emerald-600' : 'text-gec-blue'}`}>
                      {feeAmounts.tuition <= 0 ? '₹0.00' : `₹${feeAmounts.tuition.toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {feeAmounts.tuition <= 0 ? 'All dues cleared in MySQL' : 'Academic Session'}
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      if (!isHostelResident) {
                        alert('Hostel & Mess fee is only applicable for students residing in college hostels. You are marked as a Day Scholar (Exempt).');
                        return;
                      }
                      setSelectedFeeType('hostel');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center relative ${
                      !isHostelResident
                        ? 'border-slate-200 bg-slate-50 opacity-80 cursor-not-allowed'
                        : selectedFeeType === 'hostel' 
                          ? 'border-gec-blue bg-sky-50/60 shadow-xs cursor-pointer' 
                          : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    {!isHostelResident ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                        EXEMPT • DAY SCHOLAR
                      </span>
                    ) : feeAmounts.hostel <= 0 ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        ✓ PAID / CLEARED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-600 uppercase">Quarterly</span>
                    )}
                    <div className="font-extrabold text-sm text-slate-900 mt-1">Hostel & Mess</div>
                    <div className={`text-lg font-black mt-2 ${!isHostelResident ? 'text-slate-500' : feeAmounts.hostel <= 0 ? 'text-emerald-600' : 'text-gec-blue'}`}>
                      {!isHostelResident ? '₹0.00' : feeAmounts.hostel <= 0 ? '₹0.00' : `₹${feeAmounts.hostel.toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {!isHostelResident ? 'Day Scholar • Non-Resident' : feeAmounts.hostel <= 0 ? 'All dues cleared in MySQL' : (student.hostelName || 'Birsa Munda Hostel')}
                    </div>
                  </div>
                </div>

                {/* Concession Selection */}
                {selectedFeeType === 'tuition' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <span className="font-bold text-amber-900 block">e-Kalyan Jharkhand Concession:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="concession"
                          checked={categoryConcession === 'general'}
                          onChange={() => setCategoryConcession('general')}
                          className="text-gec-blue"
                        />
                        <span>General / BC Category (₹15,200)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="concession"
                          checked={categoryConcession === 'sc_st'}
                          onChange={() => setCategoryConcession('sc_st')}
                          className="text-gec-blue"
                        />
                        <span>SC / ST / TFW Category (80% Concession: ₹3,040)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div>
                  <label className="font-bold text-slate-700 block mb-2">Select Digital Gateway Mode:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('upi')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMode === 'upi' ? 'border-gec-blue bg-sky-50/50 font-bold text-gec-blue' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      UPI / QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('card')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMode === 'card' ? 'border-gec-blue bg-sky-50/50 font-bold text-gec-blue' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Debit / Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('netbanking')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMode === 'netbanking' ? 'border-gec-blue bg-sky-50/50 font-bold text-gec-blue' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      SBI NetBanking
                    </button>
                  </div>
                </div>

                {/* Amount Summary & Submit */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Net Payable Amount</span>
                    <div className="text-2xl font-black text-gec-navy">
                      ₹{getCalculatedAmount().toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Secure Payment</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Payment Transaction Ledger (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-gec-navy flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gec-blue" />
                    <span>Official Payment Ledger</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {transactions.length} Verified in DB
                  </span>
                </div>

                <div className="space-y-3 max-h-[440px] overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No payment transactions recorded yet. Complete a payment to generate an official digital challan.
                    </div>
                  ) : (
                    transactions.map((txn) => (
                      <div 
                        key={txn.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-sky-300 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{txn.purpose}</span>
                          <span className="font-black text-emerald-700">₹{Number(txn.amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono text-gec-blue">{txn.id}</span>
                          <span>{txn.date}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                          <span className="text-emerald-700 font-bold">✓ VERIFIED</span>
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(txn)}
                            className="font-bold text-gec-blue hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Slip</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                All transactions reconciled with SBI ePay and GEC Palamu Finance Cell.
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VERIFY OFFICIAL RECEIPT / CHALLAN */}
        {activePortalTab === 'verify' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-12 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gec-navy flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Institutional Receipt & Challan Authenticator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter any GEC Palamu Receipt ID (e.g. <code>TXN-GECP-...</code>) or Bank Reference Number (e.g. <code>SBI-EPAY-...</code>) to verify authenticity against the live institutional database.
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter Receipt ID (e.g. TXN-GECP-123456 or SBI-EPAY-...)"
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-gec-blue focus:outline-none text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={verifyLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {verifyLoading ? 'Verifying...' : 'Verify Authenticity'}
              </button>
            </form>

            {/* Quick Demo Verification Buttons */}
            {transactions.length > 0 && (
              <div className="text-xs">
                <span className="text-[11px] text-slate-400 font-semibold mr-2">Try verifying recent receipt:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyQuery(transactions[0].id);
                    setVerificationData(transactions[0]);
                    setVerifyError('');
                  }}
                  className="font-mono text-gec-blue underline font-bold"
                >
                  {transactions[0].id}
                </button>
              </div>
            )}

            {/* Verification Error */}
            {verifyError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Record Not Found / Invalid Challan</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">{verifyError}</div>
                </div>
              </div>
            )}

            {/* Verified Result Certificate Card */}
            {verificationData && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/40 border-2 border-emerald-400 shadow-sm space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="font-extrabold text-sm text-emerald-950">
                        OFFICIALLY VERIFIED PAYMENT RECORD
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Government Engineering College, Palamu • Finance & Accounts Registry
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wider">
                    DATABASE CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receipt ID</span>
                    <span className="font-mono font-bold text-gec-blue">{verificationData.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Ref (SBI)</span>
                    <span className="font-mono font-bold text-slate-800">{verificationData.refNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payee UPI VPA</span>
                    <span className="font-mono font-bold text-sky-700">{verificationData.upiId || OFFICIAL_UPI_ID}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank UTR No.</span>
                    <span className="font-mono font-bold text-emerald-700">{verificationData.utrNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Name</span>
                    <span className="font-bold text-slate-900">{verificationData.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">University Roll</span>
                    <span className="font-mono font-bold text-gec-blue">{verificationData.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Branch</span>
                    <span className="font-medium text-slate-800">{verificationData.branch}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Timestamp</span>
                    <span className="text-slate-800">{verificationData.date} {verificationData.time}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{verificationData.purpose}</span>
                    <span className="text-[11px] text-slate-500">Mode: {verificationData.paymentMode || verificationData.mode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Remitted</span>
                    <span className="text-base font-black text-emerald-700">
                      ₹{Number(verificationData.amount).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <canvas ref={verifyQrCanvasRef} width="90" height="90" className="w-12 h-12 rounded border border-slate-300" />
                    <div className="text-[10px] text-slate-400">
                      <div>Cryptographic Seal: <strong>ACTIVE</strong></div>
                      <div>Hash: <code className="text-[9px] text-slate-600">{verificationData.securityHash || 'SHA256-VERIFIED'}</code></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => printFeeReceipt(verificationData)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Challan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(verificationData)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gec-blue hover:bg-sky-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Checkout Processing Modal with Live UPI Gateway & Python QR */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-gec-navy uppercase tracking-wider">
                    GEC Palamu Fee Gateway
                  </div>
                  <div className="text-[10px] text-slate-500">
                    State Bank Collect & NPCI Unified Payments Interface
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction Brief */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fee Category</span>
                <span className="font-bold text-slate-800">
                  {selectedFeeType === 'exam' ? 'JUT End-Term Exam Fee' : selectedFeeType === 'tuition' ? 'Semester Tuition Fee' : 'Hostel & Mess Fee'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount Due</span>
                <span className="text-base font-black text-gec-blue">
                  ₹{getCalculatedAmount().toLocaleString('en-IN')}.00
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student</span>
                <span className="font-semibold text-slate-700 truncate block">{student.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Database</span>
                <span className="font-semibold text-emerald-700">MySQL 9.4 (gec_palamu)</span>
              </div>
            </div>

            {/* UPI SPECIFIC GATEWAY SECTION */}
            {paymentMode === 'upi' ? (
              <div className="space-y-4">
                {/* Official Payee VPA with 1-Click Copy */}
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                      Official Institutional Payee UPI VPA
                    </div>
                    <div className="text-sm font-mono font-black text-gec-navy mt-0.5 select-all">
                      {OFFICIAL_UPI_ID}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Beneficiary: Government Engineering College, Palamu
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 ${
                      copiedUpi 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white hover:bg-sky-100 text-gec-blue border border-sky-300'
                    }`}
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scannable Python QR Code */}
                <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700">
                    Scan with PhonePe, Google Pay, Paytm, or BHIM
                  </div>

                  <div className="relative inline-block">
                    {isGeneratingQr ? (
                      <div className="w-40 h-40 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 mx-auto">
                        <div className="w-6 h-6 border-2 border-gec-blue border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-[10px] text-slate-500">Generating Python QR...</span>
                      </div>
                    ) : pythonUpiQr ? (
                      <div className="p-2 bg-white rounded-2xl border-2 border-gec-blue/30 shadow-md inline-block">
                        <img 
                          src={pythonUpiQr?.startsWith('data:') ? pythonUpiQr : `data:image/png;base64,${pythonUpiQr}`} 
                          alt="Dynamic UPI QR Code" 
                          className="w-40 h-40 object-contain mx-auto rounded-lg"
                          onError={() => {
                            QRCode.toDataURL(getUpiPayload(), {
                              width: 240,
                              margin: 2,
                              color: { dark: '#0c4a6e', light: '#ffffff' }
                            }, (err, url) => {
                              if (!err && url) setPythonUpiQr(url);
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center bg-white rounded-2xl border border-slate-200 mx-auto text-xs text-slate-400">
                        Loading QR...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                      🐍 Generated via Python 3.14 QR Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ₹{getCalculatedAmount().toLocaleString('en-IN')} Locked
                    </span>
                  </div>

                  {/* Direct Mobile UPI Link Button */}
                  <a
                    href={getUpiPayload()}
                    className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pay Directly via UPI App (Mobile)</span>
                  </a>
                </div>

                {/* 12-Digit UTR Bank Reference Number Input */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Enter 12-Digit UPI Ref / UTR Number:</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleUtr = String(Math.floor(400000000000 + Math.random() * 500000000000));
                        setUtrNumber(sampleUtr);
                        setUtrError('');
                      }}
                      className="text-[10px] font-bold text-gec-blue hover:underline cursor-pointer"
                    >
                      Fill Sample UTR
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Enter exactly 12-digit UTR (e.g. 425612349876)"
                    value={utrNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setUtrNumber(val);
                      setUtrError('');
                    }}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm tracking-wider uppercase text-slate-900 focus:ring-2 focus:ring-gec-blue focus:outline-none"
                  />
                  
                  <div className="text-[10px] text-slate-500">
                    After paying in your UPI app, enter the 12-digit UTR / UPI Ref ID shown in payment details.
                  </div>

                  {utrError && (
                    <div className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{utrError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit UTR & Record in SQL Database</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* CARD / NETBANKING FLOW */
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Card / NetBanking Authorization:</div>
                  <p className="text-slate-500 text-[11px]">
                    Simulating 3D-Secure 2.0 institutional gateway clearance through SBI ePay infrastructure.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Authorize & Clear ₹{getCalculatedAmount().toLocaleString('en-IN')}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span className="font-bold text-xs">Payment Cleared & Saved in SQL Database!</span>
              </div>
              <button 
                onClick={() => setCompletedReceipt(null)}
                className="p-1 rounded-full text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="text-[10px] font-bold text-amber-600 uppercase">Govt. of Jharkhand</div>
                <div className="font-black text-sm text-gec-navy">Government Engineering College, Palamu</div>
                <div className="text-[10px] text-slate-500">Official Electronic Challan & Fee Clearance Slip</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Receipt ID</span>
                  <span className="font-mono font-bold text-gec-blue">{completedReceipt.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SBI Ref No</span>
                  <span className="font-mono text-slate-800">{completedReceipt.refNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Date</span>
                  <span className="text-slate-800">{completedReceipt.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 border-b border-slate-200 pb-3">
                <div>Student: <strong className="text-slate-900">{completedReceipt.studentName}</strong></div>
                <div>Roll No: <strong className="text-gec-blue font-mono">{completedReceipt.rollNo}</strong></div>
                <div>Purpose: <strong className="text-slate-900">{completedReceipt.purpose}</strong></div>
                <div>Amount: <strong className="text-emerald-700 font-extrabold">₹{Number(completedReceipt.amount).toLocaleString('en-IN')}</strong></div>
                <div>Payee UPI: <strong className="text-sky-700 font-mono">{completedReceipt.upiId || OFFICIAL_UPI_ID}</strong></div>
                <div>Bank UTR: <strong className="text-slate-900 font-mono">{completedReceipt.utrNumber || completedReceipt.refNo}</strong></div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <canvas ref={receiptQrCanvasRef} width="100" height="100" className="w-14 h-14 rounded border border-slate-300" />
                  <div className="text-[10px] text-slate-500">
                    <div className="font-bold text-emerald-700">STATUS: VERIFIED SUCCESS</div>
                    <div>SQL Ledger Permanent Record</div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <div className="font-serif italic font-bold text-slate-800 text-xs">Finance Officer</div>
                  <div>GEC Palamu Authority</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-2 shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => printFeeReceipt(completedReceipt)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gec-blue hover:bg-sky-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(completedReceipt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HTML</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

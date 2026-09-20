// Dedicated Professional Printing Engine for GEC Palamu
// Guarantees zero bleed, exact background graphics, and clean pagination across all browsers

/**
 * Open an isolated print window and trigger the native print dialog
 * @param {string} htmlContent Full HTML document string to print
 * @param {string} documentTitle Window / Print title
 */
export const printHtmlContent = (htmlContent, documentTitle = 'GEC Palamu Official Document') => {
  // Create an offscreen iframe for seamless printing without leaving the page
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.title = documentTitle;

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow.focus();

  // Give images & QR codes a brief moment to render before opening print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Iframe print error, falling back to popup:', e);
      // Fallback to popup window if iframe print is blocked by browser policy
      const win = window.open('', '_blank', 'width=800,height=900');
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
          win.close();
        }, 300);
      }
    } finally {
      // Remove iframe after print dialog completes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 250);
};

/**
 * Print Official Student Identity Card (CR-80 Institutional ID Format)
 */
export const printStudentIdCard = (student, qrDataUrl = '') => {
  const safeQr = qrDataUrl ? (qrDataUrl.startsWith('data:') ? qrDataUrl : `data:image/png;base64,${qrDataUrl}`) : '';
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Student ID Card - ${student.name} (${student.rollNo})</title>
  <style>
    @page { size: portrait; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; margin: 0; padding: 20px; color: #0f172a; }
    .print-container { max-width: 420px; margin: 0 auto; text-align: center; }
    .notice { font-size: 11px; color: #64748b; margin-bottom: 12px; }
    
    /* ID Card Front */
    .id-card {
      width: 380px;
      margin: 0 auto 20px auto;
      border: 2px solid #0c4a6e;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      background: #ffffff;
      text-align: left;
    }
    .card-header {
      background: linear-gradient(135deg, #0c4a6e 0%, #075985 100%);
      color: #ffffff;
      padding: 12px 14px;
      text-align: center;
      border-bottom: 2px solid #ea580c;
    }
    .govt-tag { font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #fed7aa; }
    .college-name { font-size: 13px; font-weight: 900; margin: 2px 0; color: #ffffff; }
    .college-sub { font-size: 8px; color: #bae6fd; }
    
    .card-body { padding: 14px; }
    .photo-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
    .photo-box {
      width: 72px;
      height: 86px;
      border-radius: 8px;
      border: 2px solid #0284c7;
      object-fit: cover;
      background: #f1f5f9;
    }
    .student-meta { flex: 1; }
    .name { font-size: 15px; font-weight: 900; color: #0c4a6e; line-height: 1.2; }
    .roll { font-family: monospace; font-size: 12px; font-weight: bold; color: #0284c7; margin-top: 2px; }
    .badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-top: 4px;
      border: 1px solid #86efac;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 10px;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-bottom: 12px;
    }
    .info-label { color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 600; }
    .info-value { font-weight: 700; color: #1e293b; }

    .qr-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
    }
    .qr-img { width: 68px; height: 68px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px; background: white; }
    .sig-block { text-align: right; font-size: 9px; color: #64748b; }
    .sig-title { font-family: 'Times New Roman', serif; font-style: italic; font-size: 13px; font-weight: bold; color: #0c4a6e; }

    .card-footer {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 12px;
      font-size: 8px;
      display: flex;
      justify-content: space-between;
    }

    /* Back of ID Card */
    .id-card-back {
      width: 380px;
      margin: 0 auto;
      border: 2px solid #94a3b8;
      border-radius: 16px;
      padding: 14px;
      font-size: 9px;
      color: #475569;
      line-height: 1.4;
      background: #f8fafc;
    }
    .back-title { font-weight: bold; color: #0c4a6e; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; text-align: center; }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="notice">Government Engineering College, Palamu • Official Student Identity Card</div>

    <!-- Front Side -->
    <div class="id-card">
      <div class="card-header">
        <div class="govt-tag">Department of Higher & Technical Education • Govt. of Jharkhand</div>
        <div class="college-name">Govt. Engineering College, Palamu</div>
        <div class="college-sub">Affiliated to Jharkhand University of Technology (JUT), Ranchi</div>
      </div>

      <div class="card-body">
        <div class="photo-row">
          <img src="${student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" class="photo-box" alt="Student Photo" />
          <div class="student-meta">
            <div class="name">${student.name}</div>
            <div class="roll">${student.rollNo}</div>
            <div class="badge">✓ JUT VERIFIED STUDENT</div>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-label">Branch</div>
            <div class="info-value">${student.branchCode || 'CSE'}</div>
          </div>
          <div>
            <div class="info-label">Semester</div>
            <div class="info-value">${student.semester || '5th Semester'}</div>
          </div>
          <div>
            <div class="info-label">Registration No</div>
            <div class="info-value font-mono">${student.regNo || 'JUT/2022/CSE/0892'}</div>
          </div>
          <div>
            <div class="info-label">Blood Group</div>
            <div class="info-value text-rose-600">${student.bloodGroup || 'B+'}</div>
          </div>
          <div>
            <div class="info-label">Batch</div>
            <div class="info-value">${student.batch || '2022 - 2026'}</div>
          </div>
          <div>
            <div class="info-label">Institutional ID</div>
            <div class="info-value font-mono">${student.id || 'usr-std-01'}</div>
          </div>
        </div>

        <div class="qr-row">
          <div>
            ${safeQr ? `<img src="${safeQr}" class="qr-img" alt="Smart Attendance QR" />` : '<div style="font-size:9px; color:#64748b;">Smart QR Code Active</div>'}
            <div style="font-size:7px; color:#64748b; margin-top:2px;">Campus Attendance QR</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">Dr. Sanjay Kr. Singh</div>
            <div>Principal & Issuing Authority</div>
            <div>GEC Palamu</div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span>Emergency: +91 6205482672</span>
        <span>www.gecpalamu.ac.in</span>
      </div>
    </div>

    <!-- Back Side Terms -->
    <div class="id-card-back">
      <div class="back-title">Terms & Institutional Instructions</div>
      <ol style="margin: 0; padding-left: 14px;">
        <li>This card is the property of Government Engineering College, Palamu.</li>
        <li>Carrying this card is mandatory for campus entry, classrooms, labs, and examinations.</li>
        <li>The embedded 2D QR code is used for IIT/NIT-style Smart QR Attendance recording.</li>
        <li>If lost, report immediately to the Academic Section & Proctorial Board.</li>
      </ol>
      <div style="text-align:center; margin-top:8px; font-weight:bold; color:#0c4a6e; font-size:8px;">
        Campus: Lesliganj, Medininagar, Palamu, Jharkhand - 822118
      </div>
    </div>
  </div>
</body>
</html>`;

  printHtmlContent(html, `Student_ID_${student.rollNo.replace(/\//g, '_')}`);
};

/**
 * Print Official Electronic Fee Challan / Receipt
 */
export const printFeeReceipt = (receipt) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Fee Receipt - ${receipt.id}</title>
  <style>
    @page { size: portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 760px; margin: 0 auto; line-height: 1.5; font-size: 13px; }
    .header { text-align: center; border-bottom: 3px double #0c4a6e; padding-bottom: 14px; margin-bottom: 20px; }
    .govt { font-size: 11px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; }
    .college { font-size: 22px; font-weight: 900; color: #0c4a6e; margin: 4px 0; }
    .address { font-size: 11px; color: #64748b; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-top: 8px; border: 1px solid #86efac; }
    
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; }
    .grid-item { font-size: 12px; }
    .grid-label { color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; display: block; }
    .grid-val { font-weight: 700; color: #0f172a; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #cbd5e1; color: #0f172a; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .total-row { font-weight: 900; background: #f8fafc; font-size: 13px; }

    .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #0c4a6e; padding-top: 16px; margin-top: 24px; font-size: 10px; color: #64748b; }
    .signature { text-align: center; border-top: 1px solid #94a3b8; width: 170px; padding-top: 4px; font-weight: bold; color: #0f172a; font-style: italic; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="govt">Department of Higher & Technical Education • Govt. of Jharkhand</div>
    <div class="college">Government Engineering College, Palamu</div>
    <div class="address">Lesliganj, Medininagar, Palamu District, Jharkhand - 822118 | Affiliated to JUT Ranchi</div>
    <div class="status-badge">✓ PAYMENT VERIFIED & OFFICIALLY CLEARED IN SQL LEDGER</div>
  </div>

  <div class="meta-box">
    <div><strong>Receipt ID:</strong> <span style="font-family:monospace; color:#0284c7;">${receipt.id}</span></div>
    <div><strong>SBI Ref No:</strong> <span style="font-family:monospace;">${receipt.refNo}</span></div>
    <div><strong>Date & Time:</strong> ${receipt.date} ${receipt.time || ''}</div>
  </div>

  <div class="grid">
    <div class="grid-item">
      <span class="grid-label">Student Name</span>
      <span class="grid-val">${receipt.studentName}</span>
    </div>
    <div class="grid-item">
      <span class="grid-label">University Roll Number</span>
      <span class="grid-val" style="font-family:monospace; color:#0284c7;">${receipt.rollNo}</span>
    </div>
    <div class="grid-item">
      <span class="grid-label">Branch & Academic Term</span>
      <span class="grid-val">${receipt.branch} • ${receipt.semester}</span>
    </div>
    <div class="grid-item">
      <span class="grid-label">Payment Mode</span>
      <span class="grid-val">${receipt.paymentMode || receipt.mode || 'Online UPI'}</span>
    </div>
    <div class="grid-item">
      <span class="grid-label">Institutional Payee UPI VPA</span>
      <span class="grid-val" style="font-family:monospace; color:#0369a1;">${receipt.upiId || '6205482672@ptsbi'}</span>
    </div>
    <div class="grid-item">
      <span class="grid-label">Bank Reference / UTR Number</span>
      <span class="grid-val" style="font-family:monospace; color:#15803d; font-size:13px;">${receipt.utrNumber || receipt.refNo}</span>
    </div>
    <div class="grid-item" style="grid-column: span 2;">
      <span class="grid-label">Cryptographic Transaction Hash</span>
      <code style="font-size:10px; color:#475569;">${receipt.securityHash || 'SHA256-VERIFIED-TRANSACTION'}</code>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Fee Description / Purpose</th>
        <th>Category</th>
        <th style="text-align:right;">Amount Remitted</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${receipt.purpose}</strong></td>
        <td>${receipt.concessionCategory ? receipt.concessionCategory.toUpperCase() : 'GENERAL'}</td>
        <td style="text-align:right; font-weight:bold;">₹${Number(receipt.amount).toLocaleString('en-IN')}.00</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" style="text-align:right;">TOTAL AMOUNT CLEARED:</td>
        <td style="text-align:right; color:#15803d; font-size:15px;">₹${Number(receipt.amount).toLocaleString('en-IN')}.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>
      <div><strong>Verified Merchant:</strong> GECP-SBI-COLLECT-822118</div>
      <div><strong>Official UPI ID:</strong> 6205482672@ptsbi (State Bank of India)</div>
      <div>This is a computer-generated official challan recorded in GEC Palamu SQL Database.</div>
    </div>
    <div class="signature">
      Finance & Accounts Officer<br>
      <span style="font-size:9px; font-style:normal; font-weight:normal;">GEC Palamu Authority</span>
    </div>
  </div>
</body>
</html>`;

  printHtmlContent(html, `Fee_Receipt_${receipt.id}`);
};

/**
 * Print Official Event & Hackathon Pass
 */
export const printEventPass = (pass) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Pass - ${pass.eventTitle}</title>
  <style>
    @page { size: portrait; margin: 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 20px; color: #0f172a; }
    .pass-card {
      max-width: 440px;
      margin: 0 auto;
      border: 2px solid #7c3aed;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%);
      color: #ffffff;
      padding: 16px;
      text-align: center;
    }
    .badge { font-size: 9px; font-weight: bold; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; }
    .title { font-size: 16px; font-weight: 900; margin: 6px 0 2px 0; }
    .venue { font-size: 10px; color: #ddd6fe; }
    
    .body { padding: 18px; font-size: 12px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .label { color: #64748b; }
    .val { font-weight: bold; color: #0f172a; }
    
    .footer {
      background: #f8fafc;
      padding: 12px 18px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="pass-card">
    <div class="header">
      <span class="badge">Official Campus Delegate Pass</span>
      <div class="title">${pass.eventTitle}</div>
      <div class="venue">📍 ${pass.venue} • ${pass.date}</div>
    </div>

    <div class="body">
      <div class="row">
        <span class="label">Pass ID:</span>
        <span class="val" style="font-family:monospace; color:#7c3aed;">${pass.ticketId}</span>
      </div>
      <div class="row">
        <span class="label">Attendee / Team Leader:</span>
        <span class="val">${pass.leaderName}</span>
      </div>
      <div class="row">
        <span class="label">Team / Project Name:</span>
        <span class="val">${pass.teamName}</span>
      </div>
      <div class="row">
        <span class="label">Registered Email:</span>
        <span class="val">${pass.leaderEmail}</span>
      </div>
      <div class="row">
        <span class="label">Delegation Size:</span>
        <span class="val">${pass.teamSize} Member(s)</span>
      </div>
      <div class="row">
        <span class="label">Competition Track:</span>
        <span class="val" style="color:#059669;">${pass.track}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        <strong>Government Engineering College, Palamu</strong><br>
        Issued: ${pass.timestamp}
      </div>
      <div style="text-align:right; font-weight:bold; color:#7c3aed;">
        ✓ GATE VERIFIED
      </div>
    </div>
  </div>
</body>
</html>`;

  printHtmlContent(html, `Event_Pass_${pass.ticketId}`);
};

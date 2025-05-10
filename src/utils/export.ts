// import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
// import { format } from 'date-fns';
import { Bill, Product } from '../types';
import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Assuming Bill and Product types are already defined
export const exportToPDF = (selectedBills: Bill[], BuyerAddress: string[]) => {
  const doc = new jsPDF();

  selectedBills.forEach((bill, billIndex) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Outer border
    doc.setDrawColor(0);
    doc.rect(margin, margin, pageWidth - 2 * margin, 270);

    doc.setFontSize(12);
    doc.text('Tax Invoice', 100, 7);

    // Seller Details box
    doc.setFontSize(12);
    doc.text('M.A.S. TRADERS', 14, 20);
    doc.setFontSize(10);
    doc.text('NO.1C2 NEAR RAJMAHAL KALAYANA MANDAPAM,', 14, 26);
    doc.text('PARK EAST STREET, KOVILPATTI 628502.', 14, 31);
    doc.text('Ph: 9385811577, 9789523734', 14, 36);
    doc.text('GSTIN/UIN: 33AVMPM1750G1ZO', 14, 41);
    doc.text('State: Tamil Nadu, Code: 33', 14, 46);
    doc.rect(12, 15, 90, 35); // Seller info border

    // Invoice Info box
    doc.setFontSize(10);
    doc.text(`Invoice No: ${bill.id.slice(0, 8)}`, 107, 20);
    doc.text(`Date: ${format(new Date(bill.timestamp), 'dd-MMM-yyyy')}`, 107, 25);
    doc.text('Mode/Terms: 10 Days Credit', 107, 30);
    doc.rect(105, 15, 92, 67); // Invoice info border

    // Buyer Info box
    doc.setFontSize(11);
    doc.text('Buyer:', 14, 55);
    doc.setFontSize(10);
    BuyerAddress.slice(0, 5).forEach((line, i) => {
      doc.text(line || ' ', 14, 60 + i * 5); // 5pt spacing between lines
    });
    doc.rect(12, 50, 90, 32); // Buyer info border

   // Combined Product + Totals Table
  const combinedRows: any[] = [];

  // Add product rows
  bill.items.forEach((item, index) => {
    combinedRows.push([
      index + 1,
      item.name,
      item.code || '',
      `${item.gstPercentage || 18}%`,
      `${item.billQuantity} ${item.unit || 'Units'}`,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.billQuantity * item.price).toFixed(2)}`
    ]);
  });

  // Add summary total rows (bold)
  const summaryRows = [
    ['Subtotal', bill.subtotal],
    // ['GST', bill.totalGst],
    ['CGST', bill.totalCGst],
    ['SGST', bill.totalSGst],
    ['Discount', bill.totalDiscount]
  ];

  summaryRows.forEach(([label, value]) => {
    const isDiscount = String(label).toLowerCase() === 'discount';
    const formattedValue = `${isDiscount ? '-' : ''} Rs.${(+value).toFixed(2)}`;
  
    combinedRows.push([
      '',
      { content: label, styles: { fontStyle: 'bold' } },
      '', '', '', '',
      { content: formattedValue, styles: { fontStyle: 'bold' } }
    ]);
  });

  // Add Grand Total row with top and bottom border
  combinedRows.push([
    { content: '', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: 'Grand Total', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: '', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: '', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: '', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: '', styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } },
    { content: `Rs.${bill.grandTotal.toFixed(2)}`, styles: { fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], lineTop: 0.2, lineBottom: 0.2 } }
  ]);

  (doc as any).autoTable({
    head: [['Sl', 'Product Name', 'HSN/SAC', 'GST Rate', 'Quantity', 'Rate', 'Amount']],
    body: combinedRows,
    startY: 88,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [150, 150, 150] },
    columnStyles: {
      6: { halign: 'right' } // Align the "Amount" column (index 6) to the right
    }
  });

    const afterTotalsY = (doc as any).lastAutoTable.finalY;

    // Amount in Words box
    doc.rect(12, afterTotalsY + 5, pageWidth - 24, 10);
    doc.setFontSize(10);
    doc.text(`Amount in Words: INR ${convertToWords(bill.grandTotal)} Only`, 14, afterTotalsY + 12);

    // Bank Details
    const bankY = afterTotalsY + 25;
    doc.setFontSize(10);
    doc.text('Bank Details:', 14, bankY);
    doc.setFontSize(9);
    doc.text('HDFC Bank', 14, bankY + 6);
    doc.text('A/c No: 50200055286191', 14, bankY + 12);
    doc.text('Branch & IFSC: Kovilpatti & HDFC0002021', 14, bankY + 18);

    // Declaration box
    doc.rect(12, bankY + 25, 182, 15);
    doc.text('Declaration:', 14, bankY + 30);
    doc.setFontSize(10);
    doc.text('We declare that this invoice shows the actual price of the goods and all particulars are true and correct.', 14, bankY + 35);

    // Signature Box
    doc.rect(12, bankY + 40, 92, 20);
    doc.setFontSize(9);
    doc.text('Customer Seal or Signatory', 14, bankY + 45);

    doc.rect(105, bankY + 40, 90, 20);
    doc.setFontSize(9);
    doc.text('Authorised Signatory', 107, bankY + 45);

    if (billIndex !== selectedBills.length - 1) doc.addPage();
  });

  const now = format(new Date(), 'dd-MM-yyyy');
  const mergedDoc = selectedBills.length === 1 ? selectedBills[0].id.slice(0, 8) : `Multiple-Bills`;
  doc.save(`${mergedDoc}-${now}.pdf`);
};

// Helper to convert numbers to words (simple version)
export const convertToWords = (amount: number): string => {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '');
    if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
    if (num < 10000000) return numToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numToWords(num % 100000) : '');
    return numToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numToWords(num % 10000000) : '');
  };

  const rounded = Math.round(amount);
  return numToWords(rounded) + ' Rupees';
};


export const printBills = (selectedBills: Bill[], BuyerAddress: string[]) => {
  const newWindow = window.open('', '_blank');
  if (!newWindow) return;

  const styles = `
    <style>
      @media print {
        body {
          margin: 0;
          font-family: Arial, sans-serif;
        }
        .invoice {
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
          page-break-after: always;
          border: 1px solid #000;
        }
        .section-box {
          border: 1px solid #000;
          padding: 8px;
          margin-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px 6px;
          font-size: 12px;
        }
        th {
          background: #eee;
        }
        .bold {
          font-weight: bold;
        }
        .flex {
          display:flex;
          gap: 5px;
        }
        .grand-total td {
          border-top: 2px solid #000 !important;
          border-bottom: 2px solid #000 !important;
          font-weight: bold;
        }
      }
    </style>
  `;

  const content = selectedBills.map((bill) => {
    const itemRows = bill.items.map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.code || ''}</td>
          <td>${item.gstPercentage || 18}%</td>
          <td>${item.billQuantity} ${item.unit || 'Units'}</td>
          <td>Rs.${item.price.toFixed(2)}</td>
          <td>Rs.${(item.billQuantity * item.price).toFixed(2)}</td>
        </tr>`
    ).join('');

    const summaryRows = [
      ['Subtotal', bill.subtotal],
      // ['GST', bill.totalGst],
      ['CGST', bill.totalCGst],
      ['SGST', bill.totalSGst],
      ['Discount', bill.totalDiscount],
    ].map(([label, value]) => `
        <tr class="bold">
          <td colspan="6">${label}</td>
          <td>Rs.${(+value).toFixed(2)}</td>
        </tr>`
    ).join('');

    const grandTotalRow = `
      <tr class="grand-total">
        <td colspan="6">Grand Total</td>
        <td>Rs.${bill.grandTotal.toFixed(2)}</td>
      </tr>`;
    const buyerHTML = BuyerAddress.slice(0, 5).map(line => `${line || '&nbsp;'}`).join('<br/>');

    return `
      <div class="invoice">
        <h2 style="text-align:center;">TAX INVOICE</h2>
        <div class="flex">
          <div style="width: 60%;">
            <div class="section-box">
              <strong>M.A.S. TRADERS</strong><br/>
              NO.1C2 NEAR RAJMAHAL KALAYANA MANDAPAM,<br/>
              PARK EAST STREET, KOVILPATTI 628502.<br/>
              Ph: 9385811577, 9789523734<br/>
              GSTIN/UIN: 33AVMPM1750G1ZO<br/>
              State: Tamil Nadu, Code: 33
            </div>

            <div class="section-box">
              <strong>Buyer:</strong><br/>
             <div class="buyer-info">${ buyerHTML }</div>
            </div>
          </div>

          <div class="section-box" style="width: 40%;">
            <strong>Invoice No:</strong> ${bill.id.slice(0, 8)}<br/>
            <strong>Date:</strong> ${format(new Date(bill.timestamp), 'dd-MMM-yyyy')}<br/>
            <strong>Mode/Terms:</strong> 10 Days Credit
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sl</th>
              <th>Product Name</th>
              <th>HSN/SAC</th>
              <th>GST Rate</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${summaryRows}
            ${grandTotalRow}
          </tbody>
        </table>

        <div class="section-box">
          <strong>Amount in Words:</strong> INR ${convertToWords(bill.grandTotal)} Only
        </div>

        <div class="section-box">
          <strong>Bank Details:</strong><br/>
          HDFC Bank<br/>
          A/c No: 50200055286191<br/>
          Branch & IFSC: Kovilpatti & HDFC0002021
        </div>

        <div class="section-box">
          <strong>Declaration:</strong><br/>
          We declare that this invoice shows the actual price of the goods and all particulars are true and correct.
        </div>

        <table style="margin-top: 10px;">
          <tr>
            <td style="height: 70px;"><strong>Customer Sign/Seal</strong></td>
            <td style="text-align: right;"><strong>Authorised Signatory</strong></td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  newWindow.document.write(`<html><head><title>Print Bills</title>${styles}</head><body>${content}</body></html>`);
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
};

// PDF Exports
// Exporting bills are obselete. Only use it for products export
export const exportProductsToPDF = (data: any[], type: 'bills' | 'products') => {
  const doc = new jsPDF();
  
  if (type === 'bills') {
    doc.text('Bill History', 14, 15);
    const billRows = data.map((bill: Bill) => {
    const itemDetails = bill.items.map(item =>
      `${item.name} (x${item.billQuantity}) - Rs.${item.price}`
    ).join('\n');

    return [
      bill.id.slice(0, 8),
      format(new Date(bill.timestamp), 'dd/MM/yyyy HH:mm'),
      itemDetails,
      `Rs.${bill.subtotal.toFixed(2)}`,
      // `Rs.${bill.totalGst.toFixed(2)}`,
      `- Rs.${bill.totalDiscount.toFixed(2)}`,
      `Rs.${bill.grandTotal.toFixed(2)}`
    ];
  });


    (doc as any).autoTable({
      head: [['Bill ID', 'Date', 'Items (Name xQty - Price)', 'Subtotal', 'Discount', 'Total']],
      body: billRows,
      startY: 20,
    });
  } else {
    doc.text('Products List', 14, 15);
    const productRows = data.map((product: Product) => [
      product.code,
      product.name,
      `Rs.${product.price}`,
      product.unit?.toString() || 'Units',
      product.quantity?.toString() || '0',
      `${product.gstPercentage}%`
    ]);

    (doc as any).autoTable({
      head: [['Product Code', 'Name', 'Price', 'Quantity', 'Unit', 'GST %']],
      body: productRows,
      startY: 20,
    });
  }

  doc.save(`${type}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};

// Word Exports
export const exportToWord = async (data: any[], type: 'bills' | 'products') => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: type === 'bills' ? 'Bill History' : 'Products List',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          rows: [
            new TableRow({
              children: type === 'bills' 
                ? ['Bill ID', 'Date', 'Items', 'Subtotal', 'GST', 'Discount', 'Total'].map(
                    header => new TableCell({ children: [new Paragraph({ text: header })] })
                  )
                : ['Code', 'Name', 'Price', 'Quantity', 'Unit', 'GST %'].map(
                    header => new TableCell({ children: [new Paragraph({ text: header })] })
                  ),
            }),
            ...data.map(item => 
              new TableRow({
                children: type === 'bills'
                  ? [
                      item.id.slice(0, 8),
                      format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm'),
                      item.items.map((i:any) => `${i.name} (x${i.billQuantity}) - Rs.${i.price}`).join(', '),
                      `Rs.${item.subtotal.toFixed(2)}`,
                      `Rs.${item.totalGst.toFixed(2)}`,
                      `- Rs.${item.totalDiscount.toFixed(2)}`,
                      `Rs.${item.grandTotal.toFixed(2)}`
                    ].map(cell => new TableCell({ children: [new Paragraph({ text: cell })] }))
                  : [
                      item.code,
                      item.name,
                      `Rs.${item.price}`,
                      item.quantity?.toString() || '0',
                      item.unit?.toString() || 'Units',
                      `${item.gstPercentage}%`
                    ].map(cell => new TableCell({ children: [new Paragraph({ text: cell })] }))
              })
            )
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${type}-${format(new Date(), 'dd-MM-yyyy')}.docx`);
};
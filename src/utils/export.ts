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
export const exportToPDF = (selectedBills: Bill[]) => {
  const doc = new jsPDF();

  selectedBills.forEach((bill, billIndex) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Outer border
    doc.setDrawColor(0);
    doc.rect(margin, margin, pageWidth - 2 * margin, 270);

    // Seller Details box
    doc.setFontSize(12);
    doc.text('SIVARAM TRADERS', 14, 20);
    doc.setFontSize(10);
    doc.text('629/A Bypass Road, Sattur-626203', 14, 26);
    doc.text('Ph: 9600662773', 14, 31);
    doc.text('GSTIN/UIN: 33CEPS9062G1ZL', 14, 36);
    doc.text('State: Tamil Nadu, Code: 33', 14, 41);
    doc.rect(12, 15, 90, 30); // Seller info border

    // Invoice Info box
    doc.setFontSize(12);
    doc.text('Tax Invoice', 150, 20);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${bill.id.slice(0, 8)}`, 150, 26);
    doc.text(`Date: ${format(new Date(bill.timestamp), 'dd-MMM-yyyy')}`, 150, 31);
    doc.text('Mode/Terms: 10 Days Credit', 150, 36);
    doc.rect(140, 15, 60, 30); // Invoice info border

    // Buyer Info box
    doc.setFontSize(11);
    doc.text('From:', 14, 52);
    doc.setFontSize(10);
    doc.text('M.A.S TRADERS - KOVILPATTI', 14, 57);
    doc.text('6/278-5, Main Road, Nellai Main Road,', 14, 62);
    doc.text('Kovilpatti - 628502', 14, 67);
    doc.text('GSTIN/UIN: 33AVMPM1750G1ZO', 14, 72);
    doc.text('State: Tamil Nadu, Code: 33', 14, 77);
    doc.rect(12, 48, 188, 35); // Buyer info border

    // Products Table
    const itemRows = bill.items.map((item, index) => ([
      index + 1,
      item.name,
      item.code || '',
      `${item.gstPercentage || 18}%`,
      `${item.billQuantity} ${item.unit || 'Units'}`,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.billQuantity * item.price).toFixed(2)}`
    ]));

    (doc as any).autoTable({
      head: [['Sl', 'Product Name', 'HSN/SAC', 'GST Rate', 'Quantity', 'Rate', 'Amount']],
      body: itemRows,
      startY: 88,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [200, 200, 200] }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Totals Table
    const totals = [
      ['Subtotal', `Rs.${bill.subtotal.toFixed(2)}`],
      ['GST', `Rs.${bill.totalGst.toFixed(2)}`],
      ['CGST', `Rs.${bill.totalCGst.toFixed(2)}`],
      ['SGST', `Rs.${bill.totalSGst.toFixed(2)}`],
      ['Discount', `Rs.${bill.totalDiscount.toFixed(2)}`],
      ['Grand Total', `Rs.${bill.grandTotal.toFixed(2)}`]
    ];

    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Description', 'Amount']],
      body: totals,
      theme: 'grid',
      styles: { fontSize: 10 },
      tableWidth: 90,
      startX: pageWidth - 100,
    });

    const afterTotalsY = (doc as any).lastAutoTable.finalY;

    // Amount in Words box
    doc.rect(12, afterTotalsY + 5, pageWidth - 24, 10);
    doc.setFontSize(10);
    doc.text(`Amount in Words: INR ${convertToWords(bill.grandTotal)} Only`, 14, afterTotalsY + 12);

    // Bank Details
    const bankY = afterTotalsY + 25;
    doc.setFontSize(9);
    doc.text('Bank Details:', 14, bankY);
    doc.text('TAMILNADU MERCANTILE BANK LTD', 14, bankY + 6);
    doc.text('A/c No: 13215050801030', 14, bankY + 12);
    doc.text('Branch & IFS: Sattur & TMBL0000132', 14, bankY + 18);

    // Declaration box
    doc.rect(12, bankY + 25, 150, 15);
    doc.text('Declaration:', 14, bankY + 30);
    doc.setFontSize(8);
    doc.text('We declare that this invoice shows the actual price of the goods and all particulars are true and correct.', 14, bankY + 35);

    // Signature Box
    doc.rect(pageWidth - 50, bankY + 25, 40, 20);
    doc.setFontSize(9);
    doc.text('Authorised Signatory', pageWidth - 48, bankY + 40);

    if (billIndex !== selectedBills.length - 1) doc.addPage();
  });

  const now = format(new Date(), 'dd-MM-yyyy');
  const mergedDoc = selectedBills.length === 1 ? selectedBills[0].id.slice(0, 8) : `Multiple-Bills`;
  doc.save(`${mergedDoc}-${now}.pdf`);
};

// Helper to convert numbers to words (simple version)
const convertToWords = (amount: number) => {
  // You can plug in a full converter here for large amounts.
  const rounded = Math.round(amount);
  return rounded.toString(); // replace this with a real number-to-words library if needed
};

// // PDF Exports
// export const exportToPDF = (data: any[], type: 'bills' | 'products') => {
//   const doc = new jsPDF();
  
//   if (type === 'bills') {
//     doc.text('Bill History', 14, 15);
//     const billRows = data.map((bill: Bill) => {
//     const itemDetails = bill.items.map(item =>
//       `${item.name} (x${item.billQuantity}) - Rs.${item.price}`
//     ).join('\n');

//     return [
//       bill.id.slice(0, 8),
//       format(new Date(bill.timestamp), 'dd/MM/yyyy HH:mm'),
//       itemDetails,
//       `Rs.${bill.subtotal.toFixed(2)}`,
//       `Rs.${bill.totalGst.toFixed(2)}`,
//       `Rs.${bill.totalDiscount.toFixed(2)}`,
//       `Rs.${bill.grandTotal.toFixed(2)}`
//     ];
//   });


//     (doc as any).autoTable({
//       head: [['Bill ID', 'Date', 'Items (Name xQty - Price)', 'Subtotal', 'GST', 'Discount', 'Total']],
//       body: billRows,
//       startY: 20,
//     });
//   } else {
//     doc.text('Products List', 14, 15);
//     const productRows = data.map((product: Product) => [
//       product.id,
//       product.name,
//       `Rs.${product.price}`,
//       product.quantity?.toString() || '0',
//       `${product.gstPercentage}%`
//     ]);

//     (doc as any).autoTable({
//       head: [['Product ID', 'Name', 'Price', 'Quantity', 'GST %']],
//       body: productRows,
//       startY: 20,
//     });
//   }

//   doc.save(`${type}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
// };

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
                : ['Product ID', 'Name', 'Price', 'Quantity', 'GST %'].map(
                    header => new TableCell({ children: [new Paragraph({ text: header })] })
                  ),
            }),
            ...data.map(item => 
              new TableRow({
                children: type === 'bills'
                  ? [
                      item.id.slice(0, 8),
                      format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm'),
                      item.items.map(i => `${i.name} (x${i.billQuantity}) - Rs.${i.price}`).join(', '),
                      `Rs.${item.subtotal.toFixed(2)}`,
                      `Rs.${item.totalGst.toFixed(2)}`,
                      `Rs.${item.totalDiscount.toFixed(2)}`,
                      `Rs.${item.grandTotal.toFixed(2)}`
                    ].map(cell => new TableCell({ children: [new Paragraph({ text: cell })] }))
                  : [
                      item.product_id,
                      item.name,
                      `Rs.${item.price}`,
                      item.quantity?.toString() || '0',
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
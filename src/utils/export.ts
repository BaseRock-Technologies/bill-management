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
  selectedBills.forEach((bill) => {

    // --- Header: Seller Details
    doc.setFontSize(12);
    doc.text('SIVARAM TRADERS', 14, 15);
    doc.setFontSize(10);
    doc.text('629/A Bypass Road, Sattur-626203', 14, 22);
    doc.text('Ph: 9600662773', 14, 27);
    doc.text('GSTIN/UIN: 33CEPS9062G1ZL', 14, 32);
    doc.text('State: Tamil Nadu, Code: 33', 14, 37);

    // --- Invoice Info
    doc.setFontSize(12);
    doc.text('Tax Invoice', 150, 15);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${bill.id.slice(0, 8)}`, 150, 22);
    doc.text(`Date: ${format(new Date(bill.timestamp), 'dd-MMM-yyyy')}`, 150, 27);
    doc.text(`Mode/Terms: 10 Days Credit`, 150, 32);

    // --- Buyer Info
    doc.setFontSize(11);
    doc.text('Buyer:', 14, 45);
    doc.setFontSize(10);
    doc.text('M.A.S TRADERS - KOVILPATTI', 14, 50);
    doc.text('6/278-5, Main Road, Nellai Main Road,', 14, 55);
    doc.text('Kovilpatti - 628502', 14, 60);
    doc.text('GSTIN/UIN: 33AVMPM1750G1ZO', 14, 65);
    doc.text('State: Tamil Nadu, Code: 33', 14, 70);

    // --- Products Table
    const itemRows = bill.items.map((item, index) => ([
      index + 1,
      item.name,
      // item.hsnSac || '', // If you have it
      `${item.gstPercentage || 18}%`,
      `${item.billQuantity} nos`,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.billQuantity * item.price).toFixed(2)}`
    ]));

    (doc as any).autoTable({
      head: [['Sl', 'Description', 'HSN/SAC', 'GST Rate', 'Quantity', 'Rate', 'Amount']],
      body: itemRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // --- Totals and GST
    doc.text(`Subtotal: Rs.${bill.subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`GST: Rs.${bill.totalGst.toFixed(2)}`, 140, finalY + 16);
    doc.text(`CGST: Rs.${bill.totalCGst.toFixed(2)}`, 140, finalY + 22);
    doc.text(`SGST: Rs.${bill.totalSGst.toFixed(2)}`, 140, finalY + 28);
    doc.text(`Discount: Rs.${bill.totalDiscount.toFixed(2)}`, 140, finalY + 34);
    doc.text(`Grand Total: Rs.${bill.grandTotal.toFixed(2)}`, 140, finalY + 40);

    // --- Amount in Words
    doc.setFontSize(10);
    doc.text(`Amount in Words: INR ${convertToWords(bill.grandTotal)} Only`, 14, finalY + 45);

    // --- Footer: Bank Details and Declaration
    doc.setFontSize(9);
    doc.text('Bank Details:', 14, finalY + 60);
    doc.text('TAMILNADU MERCANTILE BANK LTD', 14, finalY + 65);
    doc.text('A/c No: 13215050801030', 14, finalY + 70);
    doc.text('Branch & IFS: Sattur & TMBL0000132', 14, finalY + 75);

    doc.text('Declaration:', 14, finalY + 85);
    doc.text('We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', 14, finalY + 90);

    doc.text('Authorised Signatory', 150, finalY + 95);

    // Save
    doc.addPage();
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
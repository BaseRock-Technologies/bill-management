import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Bill, Product } from '../types';

// PDF Exports
export const exportToPDF = (data: any[], type: 'bills' | 'products') => {
  const doc = new jsPDF();
  
  if (type === 'bills') {
    doc.text('Bill History', 14, 15);
    const billRows = data.map((bill: Bill) => [
      bill.id.slice(0, 8),
      format(new Date(bill.timestamp), 'dd/MM/yyyy HH:mm'),
      bill.items.length.toString(),
      `₹${bill.subtotal.toFixed(2)}`,
      `₹${bill.totalGst.toFixed(2)}`,
      `₹${bill.totalDiscount.toFixed(2)}`,
      `₹${bill.grandTotal.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      head: [['Bill ID', 'Date', 'Items', 'Subtotal', 'GST', 'Discount', 'Total']],
      body: billRows,
      startY: 20,
    });
  } else {
    doc.text('Products List', 14, 15);
    const productRows = data.map((product: Product) => [
      product.product_id,
      product.name,
      `₹${product.price}`,
      product.quantity?.toString() || '0',
      `${product.gstPercentage}%`
    ]);

    (doc as any).autoTable({
      head: [['Product ID', 'Name', 'Price', 'Quantity', 'GST %']],
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
                      item.items.length.toString(),
                      `₹${item.subtotal.toFixed(2)}`,
                      `₹${item.totalGst.toFixed(2)}`,
                      `₹${item.totalDiscount.toFixed(2)}`,
                      `₹${item.grandTotal.toFixed(2)}`
                    ].map(cell => new TableCell({ children: [new Paragraph({ text: cell })] }))
                  : [
                      item.product_id,
                      item.name,
                      `₹${item.price}`,
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
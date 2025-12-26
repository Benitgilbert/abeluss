import { useRef } from 'react';
import './Receipt.css';

export default function Receipt({ order, seller, onClose, onPrint }) {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        const printContent = receiptRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=300,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        width: 80mm;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    .receipt-header { text-align: center; margin-bottom: 10px; }
                    .store-name { font-size: 16px; font-weight: bold; }
                    .store-info { font-size: 10px; color: #666; }
                    .divider { border-top: 1px dashed #333; margin: 8px 0; }
                    .receipt-meta { font-size: 10px; }
                    .items-table { width: 100%; }
                    .items-table td { padding: 2px 0; }
                    .item-name { max-width: 150px; }
                    .item-qty { text-align: center; width: 30px; }
                    .item-price { text-align: right; }
                    .totals { margin-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; }
                    .grand-total { font-size: 14px; font-weight: bold; }
                    .payment-info { margin-top: 10px; font-size: 10px; }
                    .thank-you { text-align: center; margin-top: 15px; font-style: italic; }
                    @media print {
                        body { width: 80mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        if (onPrint) onPrint();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-RW', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="receipt-modal-overlay">
            <div className="receipt-modal">
                <div className="receipt-preview" ref={receiptRef}>
                    {/* Header */}
                    <div className="receipt-header">
                        <div className="store-name">{seller?.storeName || seller?.name || 'IMPRESSA STORE'}</div>
                        <div className="store-info">
                            {seller?.storeAddress || 'Kigali, Rwanda'}
                        </div>
                        {seller?.phone && <div className="store-info">Tel: {seller.phone}</div>}
                    </div>

                    <div className="divider"></div>

                    {/* Meta */}
                    <div className="receipt-meta">
                        <div>Date: {formatDate(order.createdAt || new Date())}</div>
                        <div>Receipt: {order.publicId}</div>
                        <div>Cashier: {order.cashierName || 'Staff'}</div>
                    </div>

                    <div className="divider"></div>

                    {/* Items */}
                    <table className="items-table">
                        <tbody>
                            {order.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="item-name">{item.productName || item.name}</td>
                                    <td className="item-qty">x{item.quantity}</td>
                                    <td className="item-price">{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="divider"></div>

                    {/* Totals */}
                    <div className="totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>RWF {order.totals?.subtotal?.toLocaleString() || '0'}</span>
                        </div>
                        {order.totals?.tax > 0 && (
                            <div className="total-row">
                                <span>Tax:</span>
                                <span>RWF {order.totals.tax.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="total-row grand-total">
                            <span>TOTAL:</span>
                            <span>RWF {order.totals?.grandTotal?.toLocaleString() || '0'}</span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Payment */}
                    <div className="payment-info">
                        <div>Payment: {order.payment?.method?.toUpperCase() || 'CASH'}</div>
                        {order.payment?.method === 'cash' && order.cashReceived && (
                            <>
                                <div>Cash Received: RWF {order.cashReceived.toLocaleString()}</div>
                                <div>Change: RWF {(order.cashReceived - order.totals?.grandTotal).toLocaleString()}</div>
                            </>
                        )}
                    </div>

                    <div className="thank-you">
                        Thank you for shopping!
                    </div>
                </div>

                {/* Actions */}
                <div className="receipt-actions">
                    <button className="btn-print" onClick={handlePrint}>
                        🖨️ Print Receipt
                    </button>
                    <button className="btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

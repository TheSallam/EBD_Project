import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Need React Router for linking

const TransactionList = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Automatically fetch history on component load
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/api/transactions'); 
                setHistory(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div>Loading Transactions...</div>;
    if (history.length === 0) return <div>No transactions found.</div>;

    return (
        <div className="transaction-master">
            <h2>Transaction Summary (Click to view items)</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {history.map((transaction) => (
                    <li 
                        key={transaction.transactionId} 
                        style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}
                    >
                        {/* The key step: Use Link to navigate to the detailed view.
                          We pass the MongoDB _id (or transactionId) in the URL.
                        */}
                        <Link to={`/history/${transaction.transactionId}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                            **ID:** {transaction.transactionId} | 
                            **Date:** {new Date(transaction.createdAt).toLocaleDateString()} | 
                            **Total:** **${transaction.totalAmount.toFixed(2)}**
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;

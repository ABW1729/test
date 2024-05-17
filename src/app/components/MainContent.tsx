import React, { useState } from 'react';
import { Button } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StocksTable from './StocksTable';

function MainContent() {
  const [showStocks, setShowStocks] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);


  const handleSelectStocks = (selected: string[]) => {
    setSelectedStocks(selected);
  };

  const stockList = [
    { id: 1, name: 'Apple Inc.', symbol: 'AAPL' },
    { id: 2, name: 'Alphabet Inc.', symbol: 'GOOGL' },
    { id: 3, name: 'Microsoft Corporation', symbol: 'MSFT' },
    { id: 4, name: 'Amazon.com Inc.', symbol: 'AMZN' },
    { id: 5, name: 'Facebook Inc.', symbol: 'FB' },
    { id: 6, name: 'Tesla Inc.', symbol: 'TSLA' },
    { id: 7, name: 'NVIDIA Corporation', symbol: 'NVDA' },
    { id: 8, name: 'JPMorgan Chase & Co.', symbol: 'JPM' },
    { id: 9, name: 'Visa Inc.', symbol: 'V' },
    { id: 10, name: 'The Walt Disney Company', symbol: 'DIS' },
    { id: 11, name: 'Netflix Inc.', symbol: 'NFLX' },
    { id: 12, name: 'Intel Corporation', symbol: 'INTC' },
    { id: 13, name: 'PayPal Holdings Inc.', symbol: 'PYPL' },
    { id: 14, name: 'Salesforce.com Inc.', symbol: 'CRM' },
    { id: 15, name: 'Alibaba Group Holding Limited', symbol: 'BABA' },
    { id: 16, name: 'The Boeing Company', symbol: 'BA' },
    { id: 17, name: 'The Home Depot Inc.', symbol: 'HD' },
    { id: 18, name: 'Adobe Inc.', symbol: 'ADBE' },
    { id: 19, name: 'The Goldman Sachs Group Inc.', symbol: 'GS' },
    { id: 20, name: 'Starbucks Corporation', symbol: 'SBUX' },
    { id: 21, name: 'NIKE Inc.', symbol: 'NKE' },
    { id: 22, name: 'Airbnb Inc.', symbol: 'ABNB' },
    { id: 23, name: 'ServiceNow Inc.', symbol: 'NOW' },
    { id: 24, name: 'Costco Wholesale Corporation', symbol: 'COST' },
    { id: 25, name: 'AT&T Inc.', symbol: 'T' },
    { id: 26, name: 'The Coca-Cola Company', symbol: 'KO' },
    { id: 27, name: 'Walmart Inc.', symbol: 'WMT' },
    { id: 28, name: 'McDonald\'s Corporation', symbol: 'MCD' },
    { id: 29, name: 'Chevron Corporation', symbol: 'CVX' },
    { id: 30, name: 'PepsiCo Inc.', symbol: 'PEP' },
  ];
  const handleAddStocks = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const requestBody = {
        token: token,
        selectedStocks: selectedStocks,
      };

      const response = await fetch('http://localhost:8000/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success('Stocks added successfully');
      } else {
        const errorResponse = await response.json();
        toast.error(errorResponse.message);
      }
    } catch (error) {
      toast.error('Error');
    }
  };

  return (
    <div>
      {showStocks ? (
        <div>
          <StocksTable stocks={stockList} />
          <Button variant="contained" onClick={handleAddStocks}>Add Selected Stocks</Button>
        </div>
      ) : (
        <Button variant="contained" onClick={() => setShowStocks(true)}>Show Stocks</Button>
      )}
      <ToastContainer />
    </div>
  );
}

export default MainContent;

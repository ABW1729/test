"use client"
import React, { useState, useEffect } from 'react';
import { Button, Checkbox,Table,Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Navbar from '../components/Navbar';
import { getCookie } from 'cookies-next';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeStyles } from '@mui/material/styles';
import { redirect } from '@/lib/auth';
interface Stock {
  id: number;
  name: string;
  symbol: string;
  price:string
}

function Watchlist() {
  const [stocks, setStocks] = useState<Stock[]>([]);


  useEffect(() => {
    redirect();
    fetchStocksData();
  }, []);

  const fetchStocksData = async () => {
    try {
      const res = await fetch("http://54.91.71.97:8000/api/stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: getCookie('token') }),
      });

      if (res.status === 200) {
        const data = await res.json();
        setStocks(data.stocks);
      } else {
        toast.error('Cannot fetch stocks');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefresh = () => {
    fetchStocksData();
  };


  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const handleSelectAll = (event:React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allSelectedStocks = Object.keys(stocks);
      setSelectedStocks(allSelectedStocks);
    } else {
      setSelectedStocks([]);
    }
  };
  
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, symbol:string) => {
    if (event.target.checked) {
      setSelectedStocks(prevSelectedStocks => [...prevSelectedStocks, symbol]);
    } else {
      setSelectedStocks(prevSelectedStocks => prevSelectedStocks.filter(item => item !== symbol));
    }
  };

  const handleDeleteStock = async (stocks:Object) => {
    console.log(selectedStocks);
    try {
      
      const res = await fetch("http://localhost:8000/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: getCookie('token'), stocks: stocks }),
      });

      if (res.status === 200) {
        // Update stocks after successful deletion
        fetchStocksData();
        toast.success('Stock deleted successfully');
      } else {
        toast.error('Unable to delete stock');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    

    
   
    
  };

  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', margin: '10px auto', maxWidth: 'calc(80% + 20px)' }}>
      <div style={{ textAlign: 'center' }}>
      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" onClick={handleRefresh}>Refresh</Button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" onClick={() => handleDeleteStock(selectedStocks)}>Delete Selected Stocks</Button>
      </div>
    </div>
      <TableContainer component={Paper} style={{ margin: '10px auto', borderRadius: '10px', width: 'calc(100% - 20px)' }}>
        <Table style={{ minWidth: '80%' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedStocks.length > 0 && selectedStocks.length < Object.entries(stocks).length}
                  checked={selectedStocks.length === Object.entries(stocks).length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>Name</TableCell>
              <TableCell style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>Symbol</TableCell>
              <TableCell style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(stocks).map(([symbol, stock]) => (
              <TableRow key={symbol}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedStocks.includes(symbol)}
                    onChange={(event) => handleSelect(event, symbol)}
                  />
                </TableCell>
                <TableCell style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{stock.name}</TableCell>
                <TableCell style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{symbol}</TableCell>
                <TableCell style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{stock.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
    </>
  );
}

export default Watchlist;

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';

interface Stock {
  name: string;
  symbol: string;
}

interface Props {
  stocks: Stock[];
}

const StocksTable: React.FC<Props> = ({ stocks }) => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStocks(stocks.map((stock) => stock.symbol));
    } else {
      setSelectedStocks([]);
    }
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, symbol: string) => {
    const selectedIndex = selectedStocks.indexOf(symbol);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStocks, symbol);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStocks.slice(1));
    } else if (selectedIndex === selectedStocks.length - 1) {
      newSelected = newSelected.concat(selectedStocks.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStocks.slice(0, selectedIndex),
        selectedStocks.slice(selectedIndex + 1)
      );
    }

    setSelectedStocks(newSelected);
  };

  return  (
    <TableContainer component={Paper} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedStocks.length > 0 && selectedStocks.length < stocks.length}
                checked={selectedStocks.length === stocks.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>Name</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>Symbol</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.symbol} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedStocks.indexOf(stock.symbol) !== -1}
                  onChange={(event) => handleSelect(event, stock.symbol)}
                />
              </TableCell>
              <TableCell>
                <Typography sx={{ padding: '8px', fontSize: '14px' }}>{stock.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ padding: '8px', fontSize: '14px' }}>{stock.symbol}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StocksTable;

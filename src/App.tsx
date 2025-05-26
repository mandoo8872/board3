import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AdminPage } from './pages/AdminPage';
import { ViewPage } from './pages/ViewPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

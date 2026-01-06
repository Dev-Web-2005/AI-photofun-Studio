import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/common/Toast.jsx';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </ToastProvider>
  );
}

export default App;
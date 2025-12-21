import React from 'react';
import { SubscriptionProvider } from './context/SubscriptionContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <SubscriptionProvider>
      <Dashboard />
    </SubscriptionProvider>
  );
}

export default App;

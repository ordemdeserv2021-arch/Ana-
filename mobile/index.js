import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import App from './App';

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { TopNav } from './components/TopNav';
import { Home } from './pages/Home';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerMarketplace } from './pages/BuyerMarketplace';
import { AdminDispatch } from './pages/AdminDispatch';
import { BuyerOrders } from './pages/BuyerOrders';
import { LanguageProvider } from './contexts/LanguageContext';
import { OrderProvider } from './contexts/OrderContext';

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  const handleLogin = () => {
    setShowKYCModal(true);
  };

  const completeKYC = () => {
    setIsVerified(true);
    setShowKYCModal(false);
  };

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isVerified) {
      // Show warning and redirect to home if not verified
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-68px)] bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center max-w-md w-full">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-extrabold text-2xl text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6 font-medium">Please complete your KYC verification to access this portal.</p>
            <button 
              onClick={() => setShowKYCModal(true)}
              className="w-full py-3 bg-green-800 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              Verify KYC Now
            </button>
            <div className="mt-4">
              <a href="/" className="text-green-700 font-semibold text-sm hover:underline">← Back to Home</a>
            </div>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <OrderProvider>
      <LanguageProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <TopNav isVerified={isVerified} onLogin={handleLogin} />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/farmer" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/buyer" element={<ProtectedRoute><BuyerMarketplace /></ProtectedRoute>} />
            <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDispatch /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Mock KYC Modal */}
          {showKYCModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => setShowKYCModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#1E6B3C" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mb-1">Verify Identity</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">Government KYC Gateway</p>
                  
                  <div className="space-y-4 mb-8 text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Aadhaar / Farmer ID</label>
                      <input type="text" placeholder="XXXX XXXX XXXX" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 outline-none transition-colors" defaultValue="9821 4092 1109" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">OTP Sent to Mobile</label>
                      <input type="text" placeholder="------" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-600 outline-none transition-colors tracking-widest text-center text-lg font-mono" defaultValue="428901" />
                    </div>
                  </div>

                  <button 
                    onClick={completeKYC}
                    className="w-full py-3.5 bg-green-800 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-md transition-all active:scale-[0.98]"
                  >
                    Confirm & Verify
                  </button>
                  <div className="text-xs text-gray-400 mt-4 font-medium">
                    Secured by AgriLogix eKYC
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </BrowserRouter>
      </LanguageProvider>
    </OrderProvider>
  );
}

export default App;

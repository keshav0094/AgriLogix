import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Dashboard from './pages/Dashboard';
import FleetStatus from './pages/FleetStatus';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/dispatch" element={<Dashboard />} />
            <Route path="/fleet" element={<FleetStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

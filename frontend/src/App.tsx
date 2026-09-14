import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function FarmerOrder() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700">New Order (Farmer)</h1>
      <p>Form to submit a new pickup request.</p>
    </div>
  );
}

function FleetStatus() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700">Fleet Status</h1>
      <p>Overview of available and active vehicles.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farmer" element={<FarmerOrder />} />
            <Route path="/fleet" element={<FleetStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

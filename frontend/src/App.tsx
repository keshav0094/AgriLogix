import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import FleetStatus from './pages/FleetStatus';
import NewOrder from './pages/NewOrder';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/fleet" element={<FleetStatus />} />
            <Route path="/farmer" element={<NewOrder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

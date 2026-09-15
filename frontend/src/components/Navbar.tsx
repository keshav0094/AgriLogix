import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-emerald-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-bold tracking-tight hover:text-emerald-200 transition">
              🌱 AgriLogix
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition">Home</Link>
              <Link to="/farmer" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition">Farmer Portal</Link>
              <Link to="/buyer" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition">Buyer Portal</Link>
              <Link to="/dispatch" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition">Admin Dispatch</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

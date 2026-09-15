import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 to-emerald-100">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-900 mb-6 drop-shadow-sm">
          AgriLogix
        </h1>
        <p className="text-xl md:text-2xl text-emerald-700 font-medium mb-12 max-w-2xl mx-auto">
          Rural Supply Chain Optimization. Connect directly, forecast demand, and optimize logistics with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/farmer" 
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 text-lg"
          >
            Enter as Farmer
          </Link>
          <Link 
            to="/buyer" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 text-lg"
          >
            Enter as Buyer
          </Link>
        </div>
      </div>
    </div>
  );
}

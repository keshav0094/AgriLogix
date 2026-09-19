import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';
import { useLanguage } from '../contexts/LanguageContext';

export function BuyerOrders() {
  const { orders } = useOrders();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-68px)] p-6 md:p-8 flex-1">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/buyer')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-bold text-2xl text-gray-900 m-0">My Orders</h1>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No orders placed yet.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900">{t(order.crop) || order.crop}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-bold font-mono">{order.id}</span>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Farmer: <span className="text-gray-900">{order.farmer}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-semibold">
                      Placed on {order.date}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[250px]">
                    <div className="text-right">
                      <div className="font-extrabold text-lg text-green-800">₹{order.price.toLocaleString()}<span className="text-xs font-semibold text-gray-500">/q</span></div>
                      <div className="text-sm text-gray-600 font-medium">{order.weight}</div>
                    </div>
                    
                    <div>
                      {order.status === 'Delivered' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Order {
  id: string;
  crop: string;
  weight: string;
  price: number;
  status: string;
  date: string;
  farmer: string;
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (listing: any) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-2026-891', crop: 'Bajra (Pearl Millet)', weight: '40 Quintals', price: 819, status: 'Delivered', date: '17 Sep 2026', farmer: 'KSN-787 (Jaipur, Rajasthan)' },
    { id: 'ORD-2026-904', crop: 'Wheat', weight: '80 Quintals', price: 2510, status: 'Pending', date: '19 Sep 2026', farmer: 'KSN-812 (Ludhiana, Punjab)' },
    { id: 'ORD-2026-915', crop: 'Rice (Basmati)', weight: '25 Quintals', price: 4200, status: 'Pending', date: '19 Sep 2026', farmer: 'KSN-104 (Karnal, Haryana)' }
  ]);

  const placeOrder = (listing: any) => {
    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      crop: listing.crop,
      weight: listing.weight,
      price: listing.price,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      farmer: `${listing.farmer} (${listing.region})`
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

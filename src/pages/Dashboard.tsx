import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BarChart3, Users, Package, CreditCard, ArrowUpRight, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useBillStore } from '../store/billStore';

export default function Dashboard() {
  const { products } = useProductStore();
  const { bills } = useBillStore();

  const totalRevenue = bills.reduce((acc, bill) => acc + bill.grandTotal, 0);
  const totalProducts = products.length;
  const totalTransactions = bills.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      change: "+20.1%",
      icon: BarChart3
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "+15.3%",
      icon: Package
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toString(),
      change: "+12.4%",
      icon: ShoppingCart
    },
    {
      title: "Avg. Order Value",
      value: `₹${averageOrderValue.toFixed(2)}`,
      change: "+8.2%",
      icon: TrendingUp
    }
  ];

  const recentActivity = [
    {
      title: "Low Stock Alert",
      description: "5 products are running low on inventory",
      icon: Package,
      time: "2 hours ago",
      color: "text-orange-600 bg-orange-100"
    },
    {
      title: "New Sales Record",
      description: "Highest daily sales this month",
      icon: TrendingUp,
      time: "5 hours ago",
      color: "text-green-600 bg-green-100"
    },
    {
      title: "System Update",
      description: "Successfully completed system maintenance",
      icon: Clock,
      time: "1 day ago",
      color: "text-blue-600 bg-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="p-4 lg:p-8 transition-all duration-300 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 mt-16 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your business.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    {stat.change}
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
                <p className="mt-4 text-xl md:text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/products"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Package className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Add Product</h3>
                    <p className="text-sm text-gray-600">Create new product</p>
                  </div>
                </Link>
                <Link
                  to="/billing"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CreditCard className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium">New Bill</h3>
                    <p className="text-sm text-gray-600">Generate invoice</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
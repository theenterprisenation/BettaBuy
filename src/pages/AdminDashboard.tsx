import React, { useState } from 'react';
import { UsersList } from '../components/admin/UsersList';
import { VendorManagement } from '../components/admin/VendorManagement';
import { SupportManagement } from '../components/admin/SupportManagement';
import { DeliveryMonitoring } from '../components/admin/DeliveryMonitoring';
import { ContentManager } from '../components/admin/ContentManager';
import { Users, Store, BarChart, Settings, Truck, Headset, LayoutDashboard } from 'lucide-react';

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'vendors', name: 'Vendors', icon: Store },
  { id: 'support', name: 'Support Staff', icon: Headset },
  { id: 'deliveries', name: 'Deliveries', icon: Truck },
  { id: 'content', name: 'Content', icon: Settings },
  { id: 'analytics', name: 'Analytics', icon: BarChart },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your platform</p>
        </div>
        <nav className="p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                }`} />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary-500" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                      <p className="text-2xl font-bold text-primary-600">2,547</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Store className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Active Vendors</h3>
                      <p className="text-2xl font-bold text-blue-600">156</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Truck className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Deliveries Today</h3>
                      <p className="text-2xl font-bold text-green-600">48</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {/* Add activity feed here */}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  {/* Add system status here */}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'vendors' && <VendorManagement />}
          {activeTab === 'support' && <SupportManagement />}
          {activeTab === 'deliveries' && <DeliveryMonitoring />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'analytics' && (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
              <p className="mt-1 text-gray-500">
                Platform analytics and reporting features will be available here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
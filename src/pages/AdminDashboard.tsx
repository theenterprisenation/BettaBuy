import React, { useState } from 'react';
import { UsersList } from '../components/admin/UsersList';
import { VendorManagement } from '../components/admin/VendorManagement';
import { DeliveryMonitoring } from '../components/admin/DeliveryMonitoring';
import { ContentManager } from '../components/admin/ContentManager';
import { Users, Store, BarChart, Settings, Truck } from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: 'Users', icon: Users },
    { id: 'vendors', name: 'Vendors', icon: Store },
    { id: 'deliveries', name: 'Deliveries', icon: Truck },
    { id: 'content', name: 'Content', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage users, vendors, and monitor platform activity</p>
      </div>

      <div className="mb-8">
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    `}
                  >
                    <Icon className={`
                      ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                      -ml-0.5 mr-2 h-5 w-5
                    `} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div>
        {activeTab === 'users' && <UsersList />}
        {activeTab === 'vendors' && <VendorManagement />}
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
  );
}
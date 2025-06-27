import * as React from 'react';
import { StatusIndicator } from '../components/StatusBadge';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Status</h1>
          <p className="text-gray-600">Real-time status of our services and systems</p>
        </header>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Current Status</h2>
            <StatusIndicator />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">System Components</h3>
              <div className="space-y-3">
                {/* These would be populated from the API in a real implementation */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>API Service</span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Database</span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Authentication</span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Operational
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Incident History</h3>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">No incidents reported</span>
                    <span className="text-gray-500">Today</span>
                  </div>
                  <div className="text-gray-500">
                    All systems operational
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Scheduled Maintenance</span>
                    <span className="text-gray-500">June 24, 2025</span>
                  </div>
                  <div className="text-gray-500">
                    System maintenance completed successfully
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscribe to Updates</h3>
          <p className="text-gray-600 mb-4">Get notified when our status changes</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

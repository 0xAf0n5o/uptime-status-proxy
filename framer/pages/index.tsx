import { StatusIndicator } from '../components/StatusBadge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Status</h1>
          <p className="text-gray-600">Real-time status of our services and systems</p>
        </header>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Current Status</h2>
              <p className="text-sm text-gray-500">Last updated: Just now</p>
            </div>
            <StatusIndicator />
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">API Service</h4>
                  <p className="text-sm text-gray-500">Core application programming interface</p>
                </div>
                <StatusIndicator />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Database</h4>
                  <p className="text-sm text-gray-500">Primary data storage</p>
                </div>
                <StatusIndicator />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Authentication</h4>
                  <p className="text-sm text-gray-500">User login and security</p>
                </div>
                <StatusIndicator />
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Last checked: {new Date().toLocaleString()}</p>
          <p className="mt-1">
            <a href="/api/status" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              View raw status data
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

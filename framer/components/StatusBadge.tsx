import * as React from 'react';
import { motion } from 'framer-motion';

type Status = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown';

interface StatusBadgeProps {
  status: Status;
  statusText: string;
  lastUpdated?: string;
  className?: string;
}

export function StatusBadge({ 
  status, 
  statusText, 
  lastUpdated, 
  className = '' 
}: StatusBadgeProps) {
  const statusColors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    outage: 'bg-red-500',
    maintenance: 'bg-blue-500',
    unknown: 'bg-gray-500',
  };

  const statusIcons = {
    operational: '✓',
    degraded: '!',
    outage: '×',
    maintenance: '⚙',
    unknown: '?',
  };

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
      <motion.span
        className={`w-2.5 h-2.5 rounded-full mr-2 ${statusColors[status]}`}
        animate={{ 
          opacity: [0.6, 1, 0.6],
          scale: [0.9, 1.1, 0.9]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut' 
        }}
      />
      <span className="font-medium">{statusText}</span>
      {lastUpdated && (
        <span className="ml-2 text-xs opacity-70">
          Updated: {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// Main component that fetches and displays the status
export function StatusIndicator() {
  const [status, setStatus] = React.useState<{
    status: Status;
    statusText: string;
    timestamp: string;
    isLoading: boolean;
    error: string | null;
  }>({
    status: 'unknown',
    statusText: 'Loading...',
    timestamp: new Date().toISOString(),
    isLoading: true,
    error: null,
  });

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        
        setStatus({
          status: data.status || 'unknown',
          statusText: data.statusText || 'Status unknown',
          timestamp: data.timestamp || new Date().toISOString(),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching status:', error);
        setStatus(prev => ({
          ...prev,
          status: 'unknown',
          statusText: 'Unable to load status',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    // Initial fetch
    fetchStatus();
    
    // Poll every 30 seconds
    const intervalId = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (status.isLoading) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2 animate-pulse" />
        Loading status...
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />
        Error: {status.error}
      </div>
    );
  }

  return (
    <StatusBadge 
      status={status.status} 
      statusText={status.statusText} 
      lastUpdated={status.timestamp}
    />
  );
}

// Default export for Framer
export default StatusIndicator;

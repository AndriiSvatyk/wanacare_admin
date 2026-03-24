'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';

interface LogFile {
  id: number;
  filename: string;
  date: string;
  last_modified: string;
  file_size: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock data - in production, this would call an API endpoint
      const mockLogs: LogFile[] = [
        {
          id: 1,
          filename: 'laravel.log',
          date: '1 Dec 2025',
          last_modified: '01:39',
          file_size: '0 MB',
        },
        {
          id: 2,
          filename: 'pushes.log',
          date: '1 Dec 2025',
          last_modified: '00:59',
          file_size: '0 MB',
        },
        {
          id: 3,
          filename: 'endpoint_calls.log',
          date: '1 Dec 2025',
          last_modified: '00:59',
          file_size: '0 MB',
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'filename', label: 'File name', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'last_modified', label: 'Last modified', sortable: true },
    { key: 'file_size', label: 'File size', sortable: true },
  ];

  const handleAction = async (action: string, log: LogFile) => {
    console.log(`${action} for log ${log.filename}`);
    // Implement Preview, Download, Delete actions
    if (action === 'preview') {
      // Open log preview modal
    } else if (action === 'download') {
      // Download log file
    } else if (action === 'delete') {
      // Delete log file with confirmation
      if (confirm(`Are you sure you want to delete ${log.filename}?`)) {
        // Delete logic
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Log Manager</h1>
          <p className="text-gray-600">Preview, download and delete logs.</p>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          actions={(row) => (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('preview', row);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Preview
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('download', row);
                }}
                className="text-green-600 hover:text-green-800"
              >
                Download
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('delete', row);
                }}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </MainLayout>
  );
}


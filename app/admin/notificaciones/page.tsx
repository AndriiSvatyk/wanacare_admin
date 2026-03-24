'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';

interface Notification {
  id: number;
  status: string;
  type: string;
  date: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1878);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  });

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getNotifications({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      });
      
      // Transform data to match table format
      const transformed = Array.isArray(response?.data || response) 
        ? (response?.data || response).map((notif: any) => ({
            id: notif.id,
            status: notif.read ? 'Leída' : 'Nueva',
            type: notif.type || notif.notification_type || 'N/A',
            date: notif.created_at || notif.date || 'N/A',
          }))
        : [];
      
      setNotifications(transformed);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'professional_validated': 'Profesional validado por agencia',
      'new_client': 'Nuevo cliente registrado',
      'new_professional': 'Nuevo profesional registrado',
    };
    return typeMap[type] || type;
  };

  const columns = [
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'type', label: 'Tipo de notificación', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
  ];

  const formatRowData = (notif: Notification) => ({
    ...notif,
    type: getNotificationTypeLabel(notif.type),
  });

  const handleAction = (action: string, notification: Notification) => {
    console.log(`${action} for notification ${notification.id}`);
    // Implement Preview action
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Panel Notifications</h1>
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries.{' '}
            <a href="#" className="text-purple-600 hover:underline">Reset</a>
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Estado</option>
            <option value="new">Nueva</option>
            <option value="read">Leída</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tipo</option>
            <option value="professional_validated">Profesional validado</option>
            <option value="new_client">Nuevo cliente</option>
            <option value="new_professional">Nuevo profesional</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={notifications.map(formatRowData)}
          loading={loading}
          actions={(row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('preview', row);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Preview
            </button>
          )}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </MainLayout>
  );
}


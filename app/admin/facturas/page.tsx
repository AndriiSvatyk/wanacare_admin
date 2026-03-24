'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';

interface Invoice {
  id: number;
  client: string;
  professional: string;
  service_type: string;
  date: string;
  total: string;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(3);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    professional: '',
    type: '',
    dates: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getInvoices({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      });
      
      // Transform data to match table format
      const transformed = Array.isArray(response?.data || response) 
        ? (response?.data || response).map((inv: any) => ({
            id: inv.id,
            client: inv.client_name || inv.client?.user?.name || 'N/A',
            professional: inv.professional_name || inv.professional?.name || 'N/A',
            service_type: inv.service_type || inv.serviceEvent?.service?.serviceType?.name || 'N/A',
            date: inv.created_at || inv.date || 'N/A',
            total: inv.total_amount ? `${inv.total_amount}€` : 'N/A',
            status: inv.state === 'paid' ? 'Pagado' : inv.state === 'pending' ? 'Pendiente' : 'N/A',
          }))
        : [];
      
      setInvoices(transformed);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'client', label: 'Cliente', sortable: true },
    { key: 'professional', label: 'Profesional', sortable: true },
    { key: 'service_type', label: 'Tipo de servicio', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
  ];

  const handleAction = (action: string, invoice: Invoice) => {
    console.log(`${action} for invoice ${invoice.id}`);
    // Implement Preview action
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Facturas</h1>
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries.{' '}
            <a href="#" className="text-purple-600 hover:underline">Reset</a>
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <select
            value={filters.professional}
            onChange={(e) => setFilters({ ...filters, professional: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Profesional</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tipo</option>
          </select>
          <select
            value={filters.dates}
            onChange={(e) => setFilters({ ...filters, dates: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Fechas</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
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


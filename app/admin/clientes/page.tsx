'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';

interface Client {
  id: number;
  active_account: string;
  name: string;
  lastname?: string;
  fullName: string;
  email: string;
  phone: string;
  emergency_phone: string;
  birth_date: string;
  registration_date: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    active_account: '',
  });

  useEffect(() => {
    fetchClients();
  }, [currentPage, filters, itemsPerPage]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getClients({
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      });
      
      // Handle new response format: { success, data, pagination }
      const clientsData = response?.data || response || [];
      const pagination = response?.pagination;
      
      // Transform data to match table format
      const transformed = Array.isArray(clientsData) 
        ? clientsData.map((c: any) => ({
            id: c.id,
            active_account: c.active_account || 'Sí',
            name: c.name || '',
            lastname: c.lastname || '',
            fullName: c.fullName || `${c.name || ''} ${c.lastname || ''}`.trim() || 'N/A',
            email: c.email || 'N/A',
            phone: c.phone || 'N/A',
            emergency_phone: c.emergency_phone || 'N/A',
            birth_date: c.birth_date || 'N/A',
            registration_date: c.registration_date || 'N/A',
          }))
        : [];
      
      setClients(transformed);
      // Use pagination total if available
      setTotalItems(pagination?.total || transformed.length * 10);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'active_account', label: 'Cuenta activa', sortable: true },
    { key: 'name', label: 'Nombre y apellidos', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Teléfono', sortable: false },
    { key: 'emergency_phone', label: 'Tlf de emergencia', sortable: false },
    { key: 'birth_date', label: 'Fecha de nacimiento', sortable: true },
    { key: 'registration_date', label: 'Fecha de registro', sortable: true },
  ];

  const formatRowData = (client: Client) => {
    return {
      ...client,
      name: client.fullName || `${client.name} ${client.lastname || ''}`.trim(),
    };
  };

  const router = useRouter();

  const handleAction = (action: string, client: Client) => {
    if (action === 'preview') {
      router.push(`/admin/clientes/${client.id}`);
    } else {
    console.log(`${action} for client ${client.id}`);
      // TODO: Implement other actions: Delete
    }
  };

  const removeFilters = () => {
    setFilters({ active_account: '' });
  };

  const hasActiveFilters = filters.active_account;

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries.{' '}
            <button onClick={() => { setCurrentPage(1); removeFilters(); }} className="text-purple-600 hover:underline">Reset</button>
          </div>
        </div>

        <div className="flex space-x-4 mb-4 items-center">
          <select
            value={filters.active_account}
            onChange={(e) => setFilters({ ...filters, active_account: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Cuenta activa</option>
            <option value="yes">Sí</option>
            <option value="no">No</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={removeFilters}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove filters</span>
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={clients.map(formatRowData)}
          loading={loading}
          actions={(row) => (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('preview', row);
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                title="Preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('delete', row);
                }}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          )}
        />

        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries per page</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
                  <span>Export</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
                  <span>Column visibility</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </MainLayout>
  );
}


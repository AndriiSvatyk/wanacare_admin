'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';

interface Service {
  id: number;
  type: string;
  client: string;
  date: string;
  end_date: string;
  status: string;
  frequency: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(66);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchServices();
  }, [currentPage]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getServices({
        page: currentPage,
        limit: itemsPerPage,
      });
      
      // Transform data to match table format
      const transformed = Array.isArray(response?.data || response) 
        ? (response?.data || response).map((s: any) => ({
            id: s.id,
            type: s.service?.serviceType?.name || s.service_type || s.type || 'N/A',
            client: s.client?.user?.name || s.client_name || 'N/A',
            date: s.date || s.start_date || s.created_at || 'N/A',
            end_date: s.end_date || s.finish_date || 'N/A',
            status: s.state === 2 ? 'Turno en curso' : s.status || '',
            frequency: s.frequency || s.recurring ? 'Continuo' : 'Puntual',
          }))
        : [];
      
      setServices(transformed);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'type', label: 'Tipo', sortable: true },
    { key: 'client', label: 'Cliente', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'end_date', label: 'Fecha fin', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'frequency', label: 'Frecuencia', sortable: true },
  ];

  const handleAction = (action: string, service: Service) => {
    console.log(`${action} for service ${service.id}`);
    // Implement Preview action
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries.{' '}
            <a href="#" className="text-purple-600 hover:underline">Reset</a>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={services}
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


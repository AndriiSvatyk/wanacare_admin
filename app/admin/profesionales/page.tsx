'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';

interface Professional {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  phone?: string;
  active_account: string;
  status: string;
  documents_count?: number;
  registration_date: string;
  panel_warning?: boolean;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10000); // Default to "All"
  const [filters, setFilters] = useState({
    active_account: '',
    status: '',
  });

  useEffect(() => {
    fetchProfessionals();
  }, [currentPage, filters, itemsPerPage]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      // If itemsPerPage is 10000 (All), set limit to a very high number
      const limit = itemsPerPage >= 10000 ? 10000 : itemsPerPage;
      const response = await adminAPI.getProfessionals({
        page: currentPage,
        limit: limit,
        ...filters,
      });
      
      // Handle new response format: { success, data, pagination }
      const professionalsData = response?.data || response || [];
      const pagination = response?.pagination;
      
      // Transform data to match table format
      const transformed = Array.isArray(professionalsData) 
        ? professionalsData.map((p: any) => {
            const fullName = p.fullName || `${p.name || ''} ${p.lastname || ''}`.trim() || 'N/A';
            
            // Format registration date
            let formattedDate = 'N/A';
            const dateValue = p.registration_date || p.created_at;
            if (dateValue) {
              try {
                // Handle Date objects, ISO strings, or other date formats
                let date: Date;
                if (dateValue instanceof Date) {
                  date = dateValue;
                } else if (typeof dateValue === 'string') {
                  date = new Date(dateValue);
                } else if (typeof dateValue === 'object' && dateValue !== null) {
                  // If it's an object, try to convert to string first
                  date = new Date(String(dateValue));
                } else {
                  date = new Date(dateValue);
                }
                
                if (!isNaN(date.getTime())) {
                formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);
                }
              } catch (e) {
                // If all else fails, try to stringify
                formattedDate = typeof dateValue === 'string' ? dateValue : String(dateValue);
              }
            }
            
            return {
              id: p.id,
              name: p.name || '',
              lastname: p.lastname || '',
              fullName: fullName,
              email: p.email || 'N/A',
              phone: p.phone || 'N/A',
              active_account: p.active_account || 'Sí',
              status: p.status || 'Candidato',
              documents_count: p.documents_count || 0,
              registration_date: formattedDate,
              panel_warning: p.panel_warning || false,
            };
          })
        : [];
      
      setProfessionals(transformed);
      // Use pagination total if available
      setTotalItems(pagination?.total || transformed.length * 10);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return dateString;
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre y apellidos', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Teléfono', sortable: false },
    { key: 'active_account', label: 'Cuenta activa', sortable: true },
    { key: 'status', label: 'Estado', sortable: true },
    { key: 'documents', label: 'Documentos', sortable: false },
    { key: 'registration_date', label: 'Fecha de registro', sortable: true },
  ];

  const formatRowData = (professional: Professional) => {
    return {
      ...professional,
      name: professional.fullName || `${professional.name} ${professional.lastname || ''}`.trim(),
      documents: professional.documents_count ? `Ver (${professional.documents_count})` : 'Ver (0)',
      registration_date: formatDate(professional.registration_date),
    };
  };

  const router = useRouter();

  const handleAction = (action: string, professional: Professional) => {
    if (action === 'preview') {
      router.push(`/admin/profesionales/${professional.id}`);
    } else if (action === 'toggle-services') {
      // Navigate to the same edit page as the detail page
      router.push(`/admin/profesionales/${professional.id}/edit`);
    } else {
    console.log(`${action} for professional ${professional.id}`);
      // TODO: Implement other actions: Delete
    }
  };

  const removeFilters = () => {
    setFilters({ active_account: '', status: '' });
  };

  const hasActiveFilters = filters.active_account || filters.status;

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Profesionales</h1>
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
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Estado</option>
            <option value="validado">Validado</option>
            <option value="candidato">Candidato</option>
            <option value="rechazado">Rechazado</option>
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
          data={professionals.map(formatRowData)}
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
                  handleAction('toggle-services', row);
                }}
                className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                title="Activar/Desactivar Servicios"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Activar/Desactivar Servicios</span>
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
                value={itemsPerPage >= 10000 ? 'all' : itemsPerPage}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemsPerPage(value === 'all' ? 10000 : Number(value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
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


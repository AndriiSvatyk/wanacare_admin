'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { adminAPI } from '@/lib/api';

interface ClientDetail {
  id: number;
  name: string;
  lastname: string;
  fullName: string;
  email: string;
  phone: string;
  emergency_phone: string;
  birth_date: string;
  registration_date: string;
  active_account: string;
  services?: Array<{
    id: number;
    description: string;
    created_at: string | null;
  }>;
  address?: any;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchClientDetail();
    }
  }, [params.id]);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClientById(Number(params.id));
      const data = response.data || {};
      setClient({
        ...data,
        services: Array.isArray(data.services) ? data.services : [],
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      if (dateString instanceof Date) {
        return dateString.toISOString().replace('T', ' ').substring(0, 19);
      }
      if (typeof dateString === 'string') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toISOString().replace('T', ' ').substring(0, 19);
      }
      if (typeof dateString === 'object') {
        return String(dateString);
      }
      return String(dateString);
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Client not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
            <span className="text-gray-600">Preview cliente.</span>
          </div>
          <button
            onClick={() => router.push('/admin/clientes')}
            className="text-blue-600 hover:text-blue-800"
          >
            &lt;&lt; Back to all clientes
          </button>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Cuenta activa</div>
              <div className="w-2/3 text-gray-900">{String(client.active_account || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Nombre y apellidos</div>
              <div className="w-2/3 text-gray-900">{String(client.fullName || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Email</div>
              <div className="w-2/3 text-gray-900">{String(client.email || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Teléfono</div>
              <div className="w-2/3 text-gray-900">{String(client.phone || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Tlf de emergencia</div>
              <div className="w-2/3 text-gray-900">{String(client.emergency_phone || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Fecha de nacimiento</div>
              <div className="w-2/3 text-gray-900">{String(client.birth_date || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Fecha de registro</div>
              <div className="w-2/3 text-gray-900">{String(client.registration_date || 'N/A')}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Usuarios asociados</div>
              <div className="w-2/3 text-gray-900">{/* TODO: Add associated users */}</div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Servicios</div>
              <div className="w-2/3 text-gray-900">
                {client.services && client.services.length > 0 ? (
                  <div className="space-y-1">
                    {client.services.map((service) => (
                      <div key={service.id} className="text-sm">
                        {String(service.description || 'N/A')}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">No hay servicios</span>
                )}
              </div>
            </div>
            <div className="flex border-b pb-3">
              <div className="w-1/3 font-medium text-gray-700">Actions</div>
              <div className="w-2/3 text-gray-900">
              <button className="px-4 py-2 text-purple-600 hover:text-purple-800 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


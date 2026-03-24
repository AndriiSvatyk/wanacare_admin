'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { adminAPI } from '@/lib/api';

interface ServiceType {
  id: number;
  name: string;
  enabled: boolean;
}

// Optional: Spanish translations for service types (if needed)
// If service types are stored in Spanish in the database, this mapping is not needed
// The page will display whatever name is stored in the database
const serviceTypeTranslations: { [key: string]: string } = {
  // Add translations here if needed, otherwise database names will be used
};

export default function EditProfessionalServicesPage() {
  const params = useParams();
  const router = useRouter();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professionalName, setProfessionalName] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchServiceTypes();
    }
  }, [params.id]);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProfessionalServiceTypes(Number(params.id));
      
      // Ensure we have service types from the database
      if (response && response.data && response.data.serviceTypes) {
        setServiceTypes(response.data.serviceTypes);
      } else {
        console.error('No service types found in response:', response);
        setServiceTypes([]);
      }
      
      // Get professional name for display
      try {
        const profResponse = await adminAPI.getProfessionalById(Number(params.id));
        setProfessionalName(profResponse.data.fullName || '');
      } catch (profError) {
        console.error('Error fetching professional name:', profError);
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
      setServiceTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (serviceTypeId: number) => {
    setServiceTypes(prev =>
      prev.map(st =>
        st.id === serviceTypeId ? { ...st, enabled: !st.enabled } : st
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateProfessionalServiceTypes(
        Number(params.id),
        serviceTypes.map(st => ({ id: st.id, enabled: st.enabled }))
      );
      router.push(`/admin/profesionales/${params.id}`);
    } catch (error) {
      console.error('Error saving service types:', error);
      alert('Error al guardar los tipos de servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/profesionales/${params.id}`);
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

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/admin/profesionales/${params.id}`)}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to all profesionales</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profesionales</h1>
              <p className="text-gray-600">Edit profesional.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {serviceTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No service types available</p>
          ) : (
            <div className="space-y-4">
              {serviceTypes.map((serviceType) => {
                // Display the name directly from the database
                // If translations are needed, they can be added to the serviceTypeTranslations object above
                const displayName = serviceTypeTranslations[serviceType.name] || serviceType.name;
                return (
                <div key={serviceType.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                  <label className="flex-1 text-gray-900 cursor-pointer" htmlFor={`service-${serviceType.id}`}>
                    {displayName}
                  </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      id={`service-${serviceType.id}-no`}
                      name={`service-${serviceType.id}`}
                      checked={!serviceType.enabled}
                      onChange={() => handleToggle(serviceType.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">No</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      id={`service-${serviceType.id}-si`}
                      name={`service-${serviceType.id}`}
                      checked={serviceType.enabled}
                      onChange={() => handleToggle(serviceType.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Sí</span>
                  </label>
                </div>
              </div>
              );
            })}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{saving ? 'Saving...' : 'Save and back'}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


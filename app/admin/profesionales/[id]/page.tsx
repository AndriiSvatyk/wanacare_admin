'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { adminAPI } from '@/lib/api';

interface ProfessionalDetail {
  id: number;
  name: string;
  lastname: string;
  middlename?: string;
  fullName: string;
  email: string;
  phone: string;
  active_account: string;
  status: string;
  registration_date: string | null;
  questions?: Array<{ question: string; answer: string }>;
  experience?: string | null;
  documents?: Array<{
    id: number;
    name: string;
    type: string;
    url: string;
    path: string;
    filetype: string;
    created_at: string | null;
  }>;
  rating?: number;
  total_reviews?: number;
  services?: Array<{
    id: number;
    description: string;
    created_at: string | null;
  }>;
  service_types?: Array<{
    id: number;
    name: string;
  }>;
  more_info?: string;
  reference?: string;
  agency_email?: string;
  emergency_number?: string;
}

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [professional, setProfessional] = useState<ProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProfessionalDetail();
    }
  }, [params.id]);

  const fetchProfessionalDetail = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProfessionalById(Number(params.id));
      // Ensure all arrays are properly initialized
      const data = response.data || {};
      setProfessional({
        ...data,
        questions: Array.isArray(data.questions) ? data.questions : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
        services: Array.isArray(data.services) ? data.services : [],
        service_types: Array.isArray(data.service_types) ? data.service_types : [],
        rating: typeof data.rating === 'number' ? data.rating : 0,
        total_reviews: typeof data.total_reviews === 'number' ? data.total_reviews : 0,
      });
    } catch (error) {
      console.error('Error fetching professional details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      // Handle Date objects
      if (dateString instanceof Date) {
        return dateString.toISOString().replace('T', ' ').substring(0, 19);
      }
      // Handle string dates
      if (typeof dateString === 'string') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toISOString().replace('T', ' ').substring(0, 19);
      }
      // Handle objects (convert to string)
      if (typeof dateString === 'object') {
        return String(dateString);
      }
      return String(dateString);
    } catch {
      return 'N/A';
    }
  };

  const downloadDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      await adminAPI.validateProfessional(professional!.id, []);
      // Refresh the professional data
      await fetchProfessionalDetail();
      setShowValidateModal(false);
      // Show success message (you can replace with a toast notification)
      alert('Profesional validado exitosamente');
    } catch (error) {
      console.error('Error validating professional:', error);
      alert('Error al validar el profesional');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await adminAPI.rejectProfessional(professional!.id, rejectReason || undefined);
      // Refresh the professional data
      await fetchProfessionalDetail();
      setShowRejectModal(false);
      setRejectReason('');
      // Show success message (you can replace with a toast notification)
      alert('Profesional rechazado exitosamente');
    } catch (error) {
      console.error('Error rejecting professional:', error);
      alert('Error al rechazar el profesional');
    } finally {
      setIsProcessing(false);
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

  if (!professional) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Professional not found</div>
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
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to all profesionales</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Profesionales Preview profesional</h1>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre y apellidos</label>
              <p className={`${
                professional.status === 'Candidato' 
                  ? 'text-red-600 font-semibold' 
                  : 'text-gray-900'
              }`}>
                {professional.status === 'Candidato' 
                  ? `⚠️ ${String(professional.fullName || 'N/A')} ⚠️`
                  : String(professional.fullName || 'N/A')
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{String(professional.email || 'N/A')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Teléfono</label>
              <p className="text-gray-900">{String(professional.phone || 'N/A')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cuenta activa</label>
              <p className="text-gray-900">{String(professional.active_account || 'N/A')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <p className={`font-semibold ${
                professional.status === 'Validado' ? 'text-green-600' :
                professional.status === 'Rechazado' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {String(professional.status || 'N/A')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de registro</label>
              <p className="text-gray-900">{formatDate(professional.registration_date || null)}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preguntas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pregunta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuesta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professional.questions && Array.isArray(professional.questions) && professional.questions.length > 0 ? (
                  professional.questions.map((q, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q?.question || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q?.answer || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No hay preguntas disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Documentos</h2>
          {professional.documents && Array.isArray(professional.documents) && professional.documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Editar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professional.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(doc.name || 'N/A')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => downloadDocument(String(doc.url || ''))}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Descarga
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        
                        <button className="text-green-600 hover:text-green-900">
                          Ir a edición
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No hay documentos disponibles</p>
          )}
        </div>

        {/* Rating */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Facturas</h2>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-2xl font-bold text-gray-900">Rating: {professional.rating ? professional.rating.toFixed(1) : '0.0'}</span>
            </div>
            <div>
              <span className="text-gray-600">Posición: {professional.total_reviews || 0}</span>
            </div>
          </div>
        </div>

        {/* Service Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tipos de servicio</h2>
          {Array.isArray(professional.service_types) && professional.service_types.length > 0 ? (
            <p className="text-gray-900">
              {professional.service_types.map((st, index, arr) => (
                <span key={st.id}>
                  {st.name}
                  {index < arr.length - 1 && ', '}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-gray-500">No hay tipos de servicio activados</p>
          )}
        </div>

        {/* Services */}
        {professional.services && Array.isArray(professional.services) && professional.services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Servicios</h2>
            <div className="space-y-2">
              {professional.services.map((service) => (
                <div key={service.id} className="border-b pb-2">
                  <p className="text-gray-900">{String(service.description || 'N/A')}</p>
                  <p className="text-sm text-gray-500">{formatDate(service.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {professional.experience && String(professional.experience).trim() !== '' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Experiencia</h2>
            <p className="text-gray-900">{String(professional.experience)} años</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="flex space-x-4 flex-wrap gap-2">
            {professional.status === 'Candidato' && (
              <>
                <button
                  onClick={() => setShowValidateModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Validar</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Rechazar</span>
                </button>
              </>
            )}
            <button
              onClick={() => router.push(`/admin/profesionales/${professional.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Activar/Desactivar Servicios</span>
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validate Modal */}
      {showValidateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                ¿Quieres validar el profesional?
              </h3>
              <div className="flex space-x-4 w-full">
                <button
                  onClick={() => setShowValidateModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidate}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Validar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                ¿Quieres rechazar el profesional?
              </h3>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo (opcional):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Ingrese el motivo del rechazo..."
                />
              </div>
              <div className="flex space-x-4 w-full">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}


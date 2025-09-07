import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../../services/adminApi';
import { Service } from '../../../types';

interface ServicesManagementProps {
  onUpdate: () => void;
}

export default function ServicesManagement({ onUpdate }: ServicesManagementProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getEntityData('services');
      setServices(data);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError(err.message);
      
      // Mock data for demo
      const mockServices: Service[] = [
        {
          id: 1,
          name: 'Residential Deep Cleaning',
          description: 'Comprehensive deep cleaning service for homes including all rooms, kitchen, bathrooms, and common areas.',
          image: '/images/professional-household-cleaning-kit-arrangement.jpg',
          price_range: '$150 - $300',
          created_at: '2025-01-20T10:00:00Z'
        },
        {
          id: 2,
          name: 'Commercial Office Cleaning',
          description: 'Professional office cleaning services for businesses, including workspace sanitization and maintenance.',
          image: '/images/professional_office_cleaning_service_modern_space.jpg',
          price_range: '$200 - $500',
          created_at: '2025-01-18T14:30:00Z'
        },
        {
          id: 3,
          name: 'Carpet & Upholstery Cleaning',
          description: 'Specialized deep cleaning service for carpets, rugs, and upholstered furniture using advanced equipment.',
          image: '/images/professional_carpet_deep_cleaning_in_action.jpg',
          price_range: '$80 - $200',
          created_at: '2025-01-15T09:15:00Z'
        },
        {
          id: 4,
          name: 'Window Cleaning Service',
          description: 'Professional window cleaning for residential and commercial properties, interior and exterior.',
          image: '/images/professional_commercial_window_cleaning.jpg',
          price_range: '$50 - $150',
          created_at: '2025-01-12T11:45:00Z'
        }
      ];
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: Partial<Service>) => {
    try {
      const newService = await adminApiService.createService(serviceData);
      setServices(prev => [newService, ...prev]);
      setShowModal(false);
      setSelectedService(null);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to create service:', err);
      alert('Failed to create service: ' + err.message);
    }
  };

  const handleUpdateService = async (id: number, updateData: Partial<Service>) => {
    try {
      const updated = await adminApiService.updateEntity('services', id, updateData);
      setServices(prev => prev.map(service => 
        service.id === id ? { ...service, ...updated } : service
      ));
      setShowModal(false);
      setSelectedService(null);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to update service:', err);
      alert('Failed to update service: ' + err.message);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await adminApiService.deleteEntity('services', id);
        setServices(prev => prev.filter(service => service.id !== id));
        onUpdate();
      } catch (err: any) {
        console.error('Failed to delete service:', err);
        alert('Failed to delete service: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Manage your cleaning services and pricing</p>
        </div>
        <button
          onClick={() => {
            setSelectedService(null);
            setIsEditing(false);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <span>Using demo data: {error}</span>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            {/* Service Image */}
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                }}
              />
            </div>

            {/* Service Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">{service.price_range}</p>
              </div>

              <p className="text-gray-600 line-clamp-3">{service.description}</p>

              <div className="text-sm text-gray-500">
                Created: {new Date(service.created_at || '').toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setIsEditing(true);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Service
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ServiceModal
          service={selectedService}
          isEditing={isEditing}
          onSave={isEditing ? (data) => handleUpdateService(selectedService!.id, data) : handleCreateService}
          onCancel={() => {
            setShowModal(false);
            setSelectedService(null);
            setIsEditing(false);
          }}
        />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-tools text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-home text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Residential</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.name.toLowerCase().includes('residential')).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-building text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Commercial</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.name.toLowerCase().includes('commercial') || s.name.toLowerCase().includes('office')).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Modal Component
interface ServiceModalProps {
  service: Service | null;
  isEditing: boolean;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
}

function ServiceModal({ service, isEditing, onSave, onCancel }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price_range: service?.price_range || '',
    image: service?.image || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price_range) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Residential Deep Cleaning"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price Range *</label>
              <input
                type="text"
                value={formData.price_range}
                onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., $150 - $300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="Describe the service in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="https://example.com/service-image.jpg"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {isEditing ? 'Update Service' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
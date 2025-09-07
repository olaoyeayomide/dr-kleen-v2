import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../../services/adminApi';

interface WebsiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  is_public: boolean;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export default function ContentManagement() {
  const [settings, setSettings] = useState<WebsiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<WebsiteSetting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: '',
    setting_value: '',
    description: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getWebsiteSettings();
      setSettings(data || []);
    } catch (err: any) {
      console.error('Failed to fetch website settings:', err);
      setError(err.message);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string, description?: string) => {
    try {
      await adminApiService.updateWebsiteSetting(key, value, description);
      await fetchSettings();
      setShowModal(false);
      setSelectedSetting(null);
      setFormData({ setting_key: '', setting_value: '', description: '' });
    } catch (err: any) {
      console.error('Failed to update setting:', err);
      alert('Failed to update setting: ' + err.message);
    }
  };

  const handleEdit = (setting: WebsiteSetting) => {
    setSelectedSetting(setting);
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      description: setting.description
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.setting_key || !formData.setting_value) {
      alert('Setting key and value are required');
      return;
    }
    handleUpdateSetting(formData.setting_key, formData.setting_value, formData.description);
  };

  // Predefined setting templates for common website settings
  const settingTemplates = [
    { key: 'site_title', description: 'Website title displayed in browser tab' },
    { key: 'site_description', description: 'Meta description for SEO' },
    { key: 'contact_email', description: 'Main contact email address' },
    { key: 'contact_phone', description: 'Main contact phone number' },
    { key: 'business_address', description: 'Business physical address' },
    { key: 'business_hours', description: 'Operating hours' },
    { key: 'hero_title', description: 'Main hero section title' },
    { key: 'hero_subtitle', description: 'Hero section subtitle' },
    { key: 'about_text', description: 'About us section content' },
    { key: 'facebook_url', description: 'Facebook page URL' },
    { key: 'instagram_url', description: 'Instagram profile URL' },
    { key: 'twitter_url', description: 'Twitter profile URL' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage website content and settings</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mr-3"></i>
            <h3 className="text-lg font-semibold text-red-800">Unable to Load Content Settings</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchSettings()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage website content and settings</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchSettings()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>
            Refresh
          </button>
          <button
            onClick={() => {
              setSelectedSetting(null);
              setFormData({ setting_key: '', setting_value: '', description: '' });
              setShowModal(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Setting
          </button>
        </div>
      </div>

      {/* Quick Setting Templates */}
      {settings.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Get Started with Common Settings</h3>
          <p className="text-blue-700 mb-4">Add these common website settings to get started:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {settingTemplates.map((template) => (
              <button
                key={template.key}
                onClick={() => {
                  setSelectedSetting(null);
                  setFormData({
                    setting_key: template.key,
                    setting_value: '',
                    description: template.description
                  });
                  setShowModal(true);
                }}
                className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-blue-900">{template.key}</p>
                <p className="text-sm text-blue-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings List */}
      {settings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">
              <i className="fas fa-edit"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Settings Found</h3>
            <p className="text-gray-500 mb-6">Start managing your website content by adding settings.</p>
            <button
              onClick={() => {
                setSelectedSetting(null);
                setFormData({ setting_key: '', setting_value: '', description: '' });
                setShowModal(true);
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add First Setting
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {settings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{setting.setting_key}</h3>
                      <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        setting.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {setting.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{setting.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 font-mono break-words">
                        {setting.setting_value.length > 200 
                          ? `${setting.setting_value.substring(0, 200)}...` 
                          : setting.setting_value
                        }
                      </p>
                    </div>
                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <i className="fas fa-clock mr-1"></i>
                      <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="text-primary hover:text-primary/80 p-2"
                      title="Edit setting"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-cog text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Settings</p>
                  <p className="text-2xl font-bold text-gray-900">{settings.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-globe text-green-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Public Settings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {settings.filter(s => s.is_public).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-lock text-purple-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Private Settings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {settings.filter(s => !s.is_public).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Setting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedSetting ? 'Edit Setting' : 'Add New Setting'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Setting Key *</label>
                  <input
                    type="text"
                    value={formData.setting_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, setting_key: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g., site_title, contact_email"
                    disabled={!!selectedSetting}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Setting Value *</label>
                  <textarea
                    value={formData.setting_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, setting_value: e.target.value }))}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter the setting value..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    placeholder="Brief description of this setting"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {selectedSetting ? 'Update Setting' : 'Create Setting'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedSetting(null);
                      setFormData({ setting_key: '', setting_value: '', description: '' });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
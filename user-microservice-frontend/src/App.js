import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Users, Edit, Trash2, Plus, Search, MessageSquare } from 'lucide-react';

// Configuration for different environments
const CONFIG = {
  development: {
    USER_SERVICE_URL: 'http://54.157.248.106:8080',
    CLAUDE_SERVICE_URL: 'http://54.157.248.106:8081' // Assuming the Claude service runs on a different port
  },
  production: {
    USER_SERVICE_URL: 'https://api.yourdomain.com',
    CLAUDE_SERVICE_URL: 'https://api.yourdomain.com'
  }
};

// Set global config
window.APP_CONFIG = CONFIG.development;

/**
 * API Service for User Microservice
 */
class UserService {
  constructor() {
    this.baseUrl = window.APP_CONFIG?.USER_SERVICE_URL || 'http://54.157.248.106:8080';
  }

  async request(endpoint, options = {}) {
    // Increase timeout to 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const url = `${this.baseUrl}/api/users${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal, // Pass the signal to the fetch call
        ...options
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId); // Clear the timeout in case of an error
      if (error.name === 'AbortError') {
        console.error('API Error: Request timed out');
        throw new Error('Request timed out. Please check your network connection or the server status.');
      }
      console.error('API Error:', error);
      throw error;
    }
  }

  async getAllUsers() {
    return this.request('');
  }

  async getUserById(id) {
    return this.request(`/${id}`);
  }

  async createUser(user) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async updateUser(user) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async deleteUser(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }
}

/**
 * API Service for Claude AI Microservice
 */
class ClaudeService {
  constructor() {
    this.baseUrl = window.APP_CONFIG?.CLAUDE_SERVICE_URL || 'http://54.157.248.106:8081';
  }

  /**
   * Asks the Claude service to translate or process a given query.
   * @param {string} query The text to be processed.
   * @returns {Promise<string>} The translated text from the service.
   */
  async askClaude(query) {
    // Increase timeout to 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const url = `${this.baseUrl}/claude/ask?q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        },
        signal: controller.signal // Pass the signal to the fetch call
      });
      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId); // Clear the timeout in case of an error
      if (error.name === 'AbortError') {
        console.error('API Error: Request timed out');
        throw new Error('Request timed out. Please check your network connection or the server status.');
      }
      console.error('API Error:', error);
      throw error;
    }
  }
}

/**
 * Custom Confirmation Dialog Component
 */
const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// User Form Component
const UserForm = ({ user, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    id: user?.id || null,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {user ? 'Edit User' : 'Create New User'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter user name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Claude Translator Component
 */
const ClaudeTranslator = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const claudeService = new ClaudeService();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const translation = await claudeService.askClaude(inputText);
      setTranslatedText(translation);
    } catch (err) {
      setError(`Translation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">AI Language Translator</h2>
      </div>
      <p className="text-gray-600 mb-4">Translate text using the Claude microservice API.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Clear error when user starts typing
              if (error) setError('');
            }}
            placeholder="Enter text here to translate..."
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Output area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Translated Text
          </label>
          <div className="relative w-full h-full min-h-[148px] p-3 bg-gray-100 rounded-md border border-gray-300 text-gray-700">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin h-6 w-6 text-blue-600" />
                <span className="ml-2">Translating...</span>
              </div>
            ) : translatedText ? (
              <p className="whitespace-pre-wrap">{translatedText}</p>
            ) : (
              <p className="text-gray-400">Translation will appear here.</p>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Translating...
            </>
          ) : (
            'Translate'
          )}
        </button>
      </div>
    </div>
  );
};

// Main User Management Component
const UserManagementApp = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const userService = new UserService();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError('Failed to load users. Please check if the backend service is running or if the request timed out.');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSaveUser = async (userData) => {
    try {
      setActionLoading('save');
      setError('');

      if (userData.id) {
        await userService.updateUser(userData);
        setSuccess('User updated successfully!');
      } else {
        await userService.createUser(userData);
        setSuccess('User created successfully!');
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to ${userData.id ? 'update' : 'create'} user: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(`delete-${userToDelete}`);
      setError('');
      await userService.deleteUser(userToDelete);
      setSuccess('User deleted successfully!');
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setActionLoading(null);
      setShowConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage users through microservice API</p>
              </div>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin h-4 w-4" /> : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search.' : 'No users found. Create your first user!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={actionLoading === `delete-${user.id}`}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            {actionLoading === `delete-${user.id}` ? (
                              <Loader className="animate-spin h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Claude Translator Component */}
        <ClaudeTranslator />

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={handleCloseForm}
            loading={actionLoading === 'save'}
          />
        )}
        
        {/* Confirmation Modal */}
        {showConfirm && (
          <ConfirmDialog
            message="Are you sure you want to delete this user?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            loading={actionLoading?.startsWith('delete-')}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Connected to services at {window.APP_CONFIG?.USER_SERVICE_URL} and {window.APP_CONFIG?.CLAUDE_SERVICE_URL}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagementApp;

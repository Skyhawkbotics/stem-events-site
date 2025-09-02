"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from 'react';

interface Scrimmage {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  created_at?: string;
}

export default function AddScrimmage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setScrimmageName] = useState('');
  const [scrimmage_description, setDescription] = useState('');
  const [scrimmage_date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  const openModal = () => {
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form fields
    setScrimmageName('');
    setDescription('');
    setDate('');
    setLocation('');
    setError(null);
    setSuccess(null);
  };

  const handleAddScrimmage = async () => {
    if (!title.trim() || !scrimmage_description.trim() || !scrimmage_date.trim() || !location.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .from('scrimmages')
        .insert([{ 
          name: title.trim(), 
          description: scrimmage_description.trim(),
          date: scrimmage_date.trim(),
          location: location.trim()
        }])
        .select();

      if (error) {
        console.error('Error adding scrimmage:', error.message);
        setError('Failed to add scrimmage: ' + error.message);
      } else {
        setSuccess('Scrimmage added successfully!');
        
        // Clear success message after 2 seconds and close modal
        setTimeout(() => {
          setSuccess(null);
          closeModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while adding the scrimmage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddScrimmage();
    }
  };

  return (
    <>
      {/* Add Scrimmage Button */}
      <button
        onClick={openModal}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Add Scrimmage
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Scrimmage</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  {success}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="scrimmageName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scrimmage Name *
                  </label>
                  <input
                    id="scrimmageName"
                    type="text"
                    placeholder="Enter scrimmage name"
                    value={title}
                    onChange={(e) => setScrimmageName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter scrimmage description"
                    value={scrimmage_description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={scrimmage_date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Enter scrimmage location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={closeModal}
                    disabled={isLoading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddScrimmage}
                    disabled={isLoading || !title.trim() || !scrimmage_description.trim() || !scrimmage_date.trim() || !location.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add Scrimmage'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
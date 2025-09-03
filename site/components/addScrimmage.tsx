"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface Scrimmage {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  created_at?: string;
  scrimmage_owner?: string;
  number_teams:string;
}

interface AddScrimmageProps {
  isOpen?: boolean;
  onClose?: () => void;
  onScrimmageAdded?: () => void;
}

export default function AddScrimmage({ isOpen, onClose, onScrimmageAdded }: AddScrimmageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setScrimmageName] = useState('');
  const [scrimmage_description, setDescription] = useState('');
  const [scrimmage_date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [number_teams, setNumberTeams] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  // Get current user ID when component mounts
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    
    getUser();
  }, [supabase.auth]);

  // Reset form when modal opens (for dashboard modal)
  useEffect(() => {
    if (isOpen) {
      setScrimmageName('');
      setDescription('');
      setDate('');
      setLocation('');
      setNumberTeams('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const openModal = () => {
    // Check if user is authenticated before opening modal
    if (!currentUserId) {
      setError('You must be logged in to create a scrimmage');
      return;
    }
    
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    if (onClose) {
      // Dashboard modal mode
      onClose();
    } else {
      // Standalone mode
      setIsModalOpen(false);
      // Reset form fields
      setScrimmageName('');
      setDescription('');
      setDate('');
      setLocation('');
      setNumberTeams('');
      setError(null);
      setSuccess(null);
    }
  };

  const handleAddScrimmage = async () => {
    if (!title.trim() || !scrimmage_description.trim() || !scrimmage_date.trim() || !location.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to create a scrimmage');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .from('scrimmages')
        .insert([{ 
          title: title.trim(), 
          scrimmage_description: scrimmage_description.trim(),
          scrimmage_date: scrimmage_date.trim(),
          location: location.trim(),
          scrimmage_owner: currentUserId,
          number_teams: number_teams.trim()
        }])
        .select();

      if (error) {
        console.error('Error adding scrimmage:', error.message);
        setError('Failed to add scrimmage: ' + error.message);
      } else {
        setSuccess('Scrimmage added successfully!');
        
        // Clear success message after 2 seconds, close modal, and refresh
        setTimeout(() => {
          setSuccess(null);
          closeModal();
          if (onScrimmageAdded) {
            onScrimmageAdded(); // Callback to refresh the dashboard
          } else {
            window.location.reload(); // Reload the page to update the main page
          }
        }, 1000);
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

  // If this is a dashboard modal and not open, don't render anything
  if (isOpen !== undefined && !isOpen) return null;

  // If this is a dashboard modal, render only the modal
  if (isOpen !== undefined) {
    return (
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
                <label htmlFor="scrimmageDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="scrimmageDescription"
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
                <label htmlFor="scrimmageDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  id="scrimmageDate"
                  type="date"
                  value={scrimmage_date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="scrimmageLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  id="scrimmageLocation"
                  type="text"
                  placeholder="Enter scrimmage location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="scrimmageNumberTeams" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Teams
                </label>
                <input
                  id="scrimmageNumberTeams"
                  type="number"
                  min="0"
                  placeholder="Enter number of teams"
                  value={number_teams}
                  onChange={(e) => setNumberTeams(e.target.value)}
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
    );
  }

  // Standalone mode - render button and modal
  return (
    <>
      {/* Authentication Status */}
      {!currentUserId && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Please log in to create scrimmages
        </div>
      )}
      
      {/* Add Scrimmage Button */}
      <button
        onClick={openModal}
        disabled={!currentUserId}
        className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
          currentUserId 
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
      >
        {currentUserId ? 'Add Scrimmage' : 'Login to Add Scrimmage'}
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
                  <label htmlFor="scrimmageDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="scrimmageDescription"
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
                  <label htmlFor="scrimmageDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    id="scrimmageDate"
                    type="date"
                    value={scrimmage_date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="scrimmageLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    id="scrimmageLocation"
                    type="text"
                    placeholder="Enter scrimmage location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="scrimmageNumberTeams" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Teams
                  </label>
                  <input
                    id="scrimmageNumberTeams"
                    type="number"
                    min="0"
                    placeholder="Enter number of teams"
                    value={number_teams}
                    onChange={(e) => setNumberTeams(e.target.value)}
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
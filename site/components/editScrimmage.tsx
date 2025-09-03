"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface Scrimmage {
  id: string;
  title: string;
  scrimmage_description: string;
  scrimmage_date: string;
  location: string;
  number_teams?: number;
  created_at?: string;
  scrimmage_owner?: string;
}

interface EditScrimmageProps {
  scrimmage: Scrimmage;
  isOpen: boolean;
  onClose: () => void;
  onScrimmageUpdated: () => void;
}

export default function EditScrimmage({ scrimmage, isOpen, onClose, onScrimmageUpdated }: EditScrimmageProps) {
  const [title, setTitle] = useState(scrimmage.title);
  const [description, setDescription] = useState(scrimmage.scrimmage_description);
  const [scrimmageDate, setScrimmageDate] = useState(scrimmage.scrimmage_date);
  const [location, setLocation] = useState(scrimmage.location || '');
  const [numberTeams, setNumberTeams] = useState(scrimmage.number_teams || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  // Check if scrimmage is in the past
  const isScrimmagePast = () => {
    const scrimmageDate = new Date(scrimmage.scrimmage_date);
    const now = new Date();
    return scrimmageDate < now;
  };

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

  // Update form fields when scrimmage prop changes
  useEffect(() => {
    if (scrimmage) {
      setTitle(scrimmage.title);
      setDescription(scrimmage.scrimmage_description);
      setScrimmageDate(scrimmage.scrimmage_date);
      setLocation(scrimmage.location || '');
      setNumberTeams(scrimmage.number_teams || 0);
    }
  }, [scrimmage]);

  const handleUpdateScrimmage = async () => {
    if (!title.trim() || !description.trim() || !scrimmageDate.trim() || !location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to edit a scrimmage');
      return;
    }

    if (isScrimmagePast()) {
      setError('Cannot edit past scrimmages');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .from('scrimmages')
        .update({ 
          title: title.trim(), 
          scrimmage_description: description.trim(),
          scrimmage_date: scrimmageDate.trim(),
          location: location.trim(),
          number_teams: numberTeams,
        })
        .eq('id', scrimmage.id)
        .eq('scrimmage_owner', currentUserId) // Ensure user owns the scrimmage
        .select();

      if (error) {
        console.error('Error updating scrimmage:', error.message);
        setError('Failed to update scrimmage: ' + error.message);
      } else {
        setSuccess('Scrimmage updated successfully!');
        
        // Clear success message after 2 seconds, close modal, and refresh
        setTimeout(() => {
          setSuccess(null);
          onClose();
          onScrimmageUpdated(); // Callback to refresh the dashboard
        }, 1000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while updating the scrimmage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateScrimmage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Scrimmage</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Past Scrimmage Warning */}
          {isScrimmagePast() && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
              This scrimmage has already passed and cannot be edited.
            </div>
          )}
          
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
              <label htmlFor="editScrimmageName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scrimmage Name *
              </label>
              <input
                id="editScrimmageName"
                type="text"
                placeholder="Enter scrimmage name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isScrimmagePast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="editDescription"
                placeholder="Enter scrimmage description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isScrimmagePast()}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="editDate"
                type="date"
                value={scrimmageDate}
                onChange={(e) => setScrimmageDate(e.target.value)}
                disabled={isLoading || isScrimmagePast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                id="editLocation"
                type="text"
                placeholder="Enter scrimmage location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isScrimmagePast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="editNumberTeams" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Teams
              </label>
              <input
                id="editNumberTeams"
                type="number"
                min="0"
                placeholder="Enter number of teams"
                value={numberTeams}
                onChange={(e) => setNumberTeams(parseInt(e.target.value) || 0)}
                disabled={isLoading || isScrimmagePast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateScrimmage}
                disabled={isLoading || !title.trim() || !description.trim() || !scrimmageDate.trim() || !location.trim() || isScrimmagePast()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Scrimmage'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

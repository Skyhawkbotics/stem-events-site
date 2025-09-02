"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface Scrimmage {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export default function AddScrimmage() {
  const [title, setScrimmageName] = useState('');
  const [scrimmage_description, setDescription] = useState('');
  const [scrimmages, setScrimmages] = useState<Scrimmage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  // Fetch existing events on load
  useEffect(() => {
    fetchScrimmages();
  }, []);

  const fetchScrimmages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase.from('scrimmages').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching scrimmages:', error.message);
        setError('Failed to fetch scrimmages: ' + error.message);
      } else {
        setScrimmages(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching scrimmages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScrimmage = async () => {
    if (!title.trim() || !scrimmage_description.trim()) {
      setError('Please fill in both scrimmage name and description');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .from('scrimmages')
        .insert([{ name: title.trim(), description: scrimmage_description.trim() }])
        .select();

      if (error) {
        console.error('Error adding scrimmage:', error.message);
        setError('Failed to add scrimmage: ' + error.message);
      } else {
        // Update UI with the new event
        if (data && data.length > 0) {
          setScrimmages((prev) => [data[0], ...prev]);
        }
        setScrimmageName('');
        setDescription('');
        setSuccess('Scrimmage added successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Scrimmage</h2>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="scrimmageName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scrimmage Name
          </label>
          <input
            id="scrimmageName"
            type="text"
            placeholder="Enter scrimmage name"
            value={title}
            onChange={(e) => setScrimmageName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scrimmage Description
          </label>
          <textarea
            id="description"
            placeholder="Enter scrimmage description"
            value={scrimmage_description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>
        
        <button 
          onClick={handleAddScrimmage}
          disabled={isLoading || !title.trim() || !scrimmage_description.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Scrimmage...' : 'Add Scrimmage'}
        </button>
      </div>

      {/* Events List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Scrimmages List</h3>
        
        {isLoading && scrimmages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading scrimmages...</div>
        ) : scrimmages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No scrimmages found. Add your first scrimmage above!</div>
        ) : (
          <ul className="space-y-3">
            {scrimmages.map((scrimmage) => (
              <li key={scrimmage.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 dark:text-white">{scrimmage.name}</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{scrimmage.description}</p>
                  </div>
                  {scrimmage.created_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(scrimmage.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  created_at?: string;
  event_owner?: string;
}

//get rid of useless stuff here
export default function AddEvent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setDate] = useState('');
  const [eventType, setEventType] = useState('workshop'); // Default event type
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

  const openModal = () => {
    // Check if user is authenticated before opening modal
    if (!currentUserId) {
      setError('You must be logged in to create an event');
      return;
    }
    
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  //Adjust all of these
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form fields
    setEventName('');
    setDescription('');
    setDate('');
    setEventType('workshop'); // Reset to default
    setError(null);
    setSuccess(null);
  };

  //Adjust all of these
  const handleAddEvent = async () => {
    if (!title.trim() || !description.trim() || !eventTime.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to create an event');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
//adjust all of these too
      const { data, error } = await supabase
        .from('events')
        .insert([{ 
          title: title.trim(), 
          description: description.trim(),
          eventTime: eventTime.trim(),
          event_type: eventType, // Add the missing event_type field
          event_owner: currentUserId,
        }])
        .select();

      if (error) {
        console.error('Error adding event:', error.message);
        setError('Failed to add event: ' + error.message);
      } else {
        setSuccess('Event successfully!');
        
        // Clear success message after 2 seconds, close modal, and reload page
        setTimeout(() => {
          setSuccess(null);
          closeModal();
          window.location.reload(); // Reload the page to update the main page
        }, 1000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while adding the event');
    } finally {
      setIsLoading(false);
    }
  };

  //adjust this too
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEvent();
    }
  };

  return (
    <>
      {/* Authentication Status */}
      {!currentUserId && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Please log in to create events
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
        {currentUserId ? 'Add Event' : 'Login to Add Event'}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Event</h2>
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
              {/*this is going to have to be all adjused*/}
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Name *
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    placeholder="Enter event name"
                    value={title}
                    onChange={(e) => setEventName(e.target.value)}
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
                    placeholder="Enter event description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type *
                  </label>
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="competition">Competition</option>
                    <option value="lecture">Lecture</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={eventTime}
                    onChange={(e) => setDate(e.target.value)}
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
                    onClick={handleAddEvent} //change
                    disabled={isLoading || !title.trim() || !description.trim() || !eventTime.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add Event'}
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
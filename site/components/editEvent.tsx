"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  eventTime: string;
  location?: string;
  event_type?: string;
  created_at?: string;
  event_owner?: string;
}

interface EditEventProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
}

export default function EditEvent({ event, isOpen, onClose, onEventUpdated }: EditEventProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [eventTime, setEventTime] = useState(event.eventTime);
  const [location, setLocation] = useState(event.location || '');
  const [eventType, setEventType] = useState(event.event_type || 'workshop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = createClient();

  // Check if event is in the past
  const isEventPast = () => {
    const eventDate = new Date(event.eventTime);
    const now = new Date();
    return eventDate < now;
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

  // Update form fields when event prop changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setEventTime(event.eventTime);
      setLocation(event.location || '');
      setEventType(event.event_type || 'workshop');
    }
  }, [event]);

  const handleUpdateEvent = async () => {
    if (!title.trim() || !description.trim() || !eventTime.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to edit an event');
      return;
    }

    if (isEventPast()) {
      setError('Cannot edit past events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .from('events')
        .update({ 
          title: title.trim(), 
          description: description.trim(),
          eventTime: eventTime.trim(),
          location: location.trim() || null,
          event_type: eventType,
        })
        .eq('id', event.id)
        .eq('event_owner', currentUserId) // Ensure user owns the event
        .select();

      if (error) {
        console.error('Error updating event:', error.message);
        setError('Failed to update event: ' + error.message);
      } else {
        setSuccess('Event updated successfully!');
        
        // Clear success message after 2 seconds, close modal, and refresh
        setTimeout(() => {
          setSuccess(null);
          onClose();
          onEventUpdated(); // Callback to refresh the dashboard
        }, 1000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while updating the event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateEvent();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Past Event Warning */}
          {isEventPast() && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
              This event has already passed and cannot be edited.
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
              <label htmlFor="editEventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Name *
              </label>
              <input
                id="editEventName"
                type="text"
                placeholder="Enter event name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isEventPast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="editDescription"
                placeholder="Enter event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isEventPast()}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="editEventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type *
              </label>
              <select
                id="editEventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                disabled={isLoading || isEventPast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                id="editDate"
                type="date"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                disabled={isLoading || isEventPast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                id="editLocation"
                type="text"
                placeholder="Enter event location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isEventPast()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                onClick={handleUpdateEvent}
                disabled={isLoading || !title.trim() || !description.trim() || !eventTime.trim() || isEventPast()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

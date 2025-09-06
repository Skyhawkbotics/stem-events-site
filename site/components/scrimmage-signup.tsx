"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

interface ScrimmageRegistration {
  id: string;
  scrimmage_id: string;
  team_name: string;
  team_contact: string;
  team_size: number;
  team_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
}

interface ScrimmageSignupProps {
  scrimmageId: string;
  maxTeams: number;
  onRegistrationUpdate?: () => void;
}

export default function ScrimmageSignup({ scrimmageId, maxTeams, onRegistrationUpdate }: ScrimmageSignupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamContact, setTeamContact] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [teamDescription, setTeamDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingRegistration, setExistingRegistration] = useState<ScrimmageRegistration | null>(null);
  const [currentRegistrations, setCurrentRegistrations] = useState<ScrimmageRegistration[]>([]);
  const [availableSpots, setAvailableSpots] = useState(maxTeams);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        checkExistingRegistration(user.id);
        fetchCurrentRegistrations();
      }
    };
    
    getUser();
  }, [scrimmageId]);

  const checkExistingRegistration = async (userId: string) => {
    const { data, error } = await supabase
      .from('scrimmage_registrations')
      .select('*')
      .eq('scrimmage_id', scrimmageId)
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      setExistingRegistration(data);
    }
  };

  const fetchCurrentRegistrations = async () => {
    const { data, error } = await supabase
      .from('scrimmage_registrations')
      .select('*')
      .eq('scrimmage_id', scrimmageId)
      .eq('status', 'approved');

    if (data && !error) {
      setCurrentRegistrations(data);
      setAvailableSpots(maxTeams - data.length);
    }
  };

  const openModal = () => {
    if (!currentUserId) {
      setError('You must be logged in to sign up for a scrimmage');
      return;
    }

    if (existingRegistration) {
      setError('You have already registered for this scrimmage');
      return;
    }

    if (availableSpots <= 0) {
      setError('This scrimmage is full');
      return;
    }

    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTeamName('');
    setTeamContact('');
    setTeamSize(1);
    setTeamDescription('');
    setError(null);
    setSuccess(null);
  };

  const handleSignup = async () => {
    if (!teamName.trim() || !teamContact.trim() || teamSize < 1) {
      setError('Please fill in all required fields');
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to sign up for a scrimmage');
      return;
    }

    // Validate scrimmageId format
    if (!scrimmageId || scrimmageId.length < 10) {
      setError('Invalid scrimmage ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Debug: Log the data being sent
      const registrationData = {
        scrimmage_id: scrimmageId,
        team_name: teamName.trim(),
        team_contact: teamContact.trim(),
        team_size: teamSize,
        team_description: teamDescription.trim(),
        status: 'pending',
        user_id: currentUserId
      };
      console.log('Attempting to insert registration:', registrationData);

      const { data, error } = await supabase
        .from('scrimmage_registrations')
        .insert([registrationData])
        .select()
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error signing up:', error);
        // Better error message handling
        let errorMessage = 'Failed to sign up';
        if (error.message) {
          errorMessage += ': ' + error.message;
        } else if (error.details) {
          errorMessage += ': ' + error.details;
        } else if (error.hint) {
          errorMessage += ': ' + error.hint;
        } else if (error.code) {
          errorMessage += ' (Error code: ' + error.code + ')';
        }
        setError(errorMessage);
      } else {
        setSuccess('Successfully signed up for the scrimmage! Your registration is pending approval.');
        setExistingRegistration(data);
        
        setTimeout(() => {
          setSuccess(null);
          closeModal();
          if (onRegistrationUpdate) {
            onRegistrationUpdate();
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while signing up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!existingRegistration) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('scrimmage_registrations')
        .delete()
        .eq('id', existingRegistration.id);

      if (error) {
        setError('Failed to cancel registration: ' + error.message);
      } else {
        setExistingRegistration(null);
        setSuccess('Registration cancelled successfully');
        if (onRegistrationUpdate) {
          onRegistrationUpdate();
        }
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-2">Please log in to sign up for this scrimmage</p>
      </div>
    );
  }

  if (existingRegistration) {
    return (
      <div className="border rounded-lg p-4 bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-2">Your Registration</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Team:</strong> {existingRegistration.team_name}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              existingRegistration.status === 'approved' ? 'bg-green-200 text-green-800' :
              existingRegistration.status === 'rejected' ? 'bg-red-200 text-red-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>
              {existingRegistration.status.charAt(0).toUpperCase() + existingRegistration.status.slice(1)}
            </span>
          </p>
          {existingRegistration.status === 'pending' && (
            <button
              onClick={handleCancelRegistration}
              disabled={isLoading}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (availableSpots <= 0) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 font-medium">This scrimmage is full</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Sign Up for Scrimmage
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign Up for Scrimmage</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="teamContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Information *
                  </label>
                  <input
                    id="teamContact"
                    type="text"
                    placeholder="Email or phone number"
                    value={teamContact}
                    onChange={(e) => setTeamContact(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Size *
                  </label>
                  <input
                    id="teamSize"
                    type="number"
                    min="1"
                    max="20"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Description
                  </label>
                  <textarea
                    id="teamDescription"
                    placeholder="Tell us about your team (optional)"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Available spots: <span className="font-semibold">{availableSpots}</span></p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    disabled={isLoading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignup}
                    disabled={isLoading || !teamName.trim() || !teamContact.trim() || teamSize < 1}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
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

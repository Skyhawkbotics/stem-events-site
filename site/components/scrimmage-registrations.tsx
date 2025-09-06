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

interface ScrimmageRegistrationsProps {
  scrimmageId: string;
  maxTeams: number;
  onRegistrationUpdate?: () => void;
}

export default function ScrimmageRegistrations({ scrimmageId, maxTeams, onRegistrationUpdate }: ScrimmageRegistrationsProps) {
  const [registrations, setRegistrations] = useState<ScrimmageRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchRegistrations();
      }
    };
    
    getUser();
  }, [scrimmageId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scrimmage_registrations')
        .select('*')
        .eq('scrimmage_id', scrimmageId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching registrations:', error.message);
        setError('Failed to fetch registrations: ' + error.message);
      } else {
        setRegistrations(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('scrimmage_registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) {
        console.error('Error updating registration:', error.message);
        setError('Failed to update registration: ' + error.message);
      } else {
        setSuccess(`Registration ${newStatus} successfully`);
        fetchRegistrations(); // Refresh the list
        if (onRegistrationUpdate) {
          onRegistrationUpdate();
        }
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('scrimmage_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) {
        console.error('Error deleting registration:', error.message);
        setError('Failed to delete registration: ' + error.message);
      } else {
        setSuccess('Registration deleted successfully');
        fetchRegistrations(); // Refresh the list
        if (onRegistrationUpdate) {
          onRegistrationUpdate();
        }
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const availableSpots = maxTeams - approvedCount;

  if (isLoading && registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Registration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{maxTeams}</div>
            <div className="text-gray-600">Total Spots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${availableSpots > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {availableSpots}
            </div>
            <div className="text-gray-600">Available</div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No registrations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Team Registrations</h3>
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{registration.team_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contact: {registration.team_contact}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Team Size: {registration.team_size} members
                  </p>
                  {registration.team_description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {registration.team_description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Registered: {new Date(registration.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                    {getStatusText(registration.status)}
                  </span>
                  
                  {registration.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(registration.id, 'approved')}
                        disabled={isLoading || availableSpots <= 0}
                        className={`px-3 py-1 text-xs rounded ${
                          availableSpots > 0 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                        title={availableSpots <= 0 ? 'No available spots' : 'Approve registration'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(registration.id, 'rejected')}
                        disabled={isLoading}
                        className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {registration.status === 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(registration.id, 'rejected')}
                      disabled={isLoading}
                      className="px-3 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      Revoke
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteRegistration(registration.id)}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700"
                    title="Delete registration"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

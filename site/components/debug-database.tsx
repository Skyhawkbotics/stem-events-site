"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from 'react';

export default function DebugDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addResult(`❌ Auth error: ${authError.message}`);
        return;
      }
      addResult(`✅ User authenticated: ${user?.email || 'Unknown'}`);

      // Test 2: Check if scrimmage_registrations table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('scrimmage_registrations')
        .select('count')
        .limit(1);

      if (tableError) {
        addResult(`❌ Table check error: ${tableError.message}`);
        if (tableError.code === '42P01') {
          addResult('❌ Table "scrimmage_registrations" does not exist');
          addResult('💡 You need to run the SQL migration first');
        }
        return;
      }
      addResult('✅ Table "scrimmage_registrations" exists');

      // Test 3: Check table structure
      const { data: structure, error: structureError } = await supabase
        .from('scrimmage_registrations')
        .select('*')
        .limit(0);

      if (structureError) {
        addResult(`❌ Structure check error: ${structureError.message}`);
      } else {
        addResult('✅ Table structure is accessible');
      }

      // Test 4: Check if there are any scrimmages
      const { data: scrimmages, error: scrimmageError } = await supabase
        .from('scrimmages')
        .select('id, title, number_teams')
        .limit(5);

      if (scrimmageError) {
        addResult(`❌ Scrimmages check error: ${scrimmageError.message}`);
      } else {
        addResult(`✅ Found ${scrimmages?.length || 0} scrimmages`);
        if (scrimmages && scrimmages.length > 0) {
          scrimmages.forEach((s, i) => {
            addResult(`   ${i + 1}. ${s.title} (ID: ${s.id}, Teams: ${s.number_teams})`);
          });
        }
      }

      // Test 5: Check RLS policies
      addResult('ℹ️ RLS policies should be active (check in Supabase dashboard)');

    } catch (err) {
      console.error('Debug error:', err);
      setError('An unexpected error occurred during testing');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
        🔍 Database Debug Tool
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={testDatabaseConnection}
          disabled={isLoading}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </button>

        <button
          onClick={clearResults}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
        >
          Clear Results
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 max-h-64 overflow-y-auto">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm">
              {results.map((result, index) => (
                <div key={index} className="font-mono text-xs">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <p><strong>Note:</strong> This tool helps diagnose database connection issues.</p>
          <p>If the table doesn't exist, run the SQL migration in your Supabase dashboard.</p>
        </div>
      </div>
    </div>
  );
}

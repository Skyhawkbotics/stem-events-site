import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Scrimmage {
  id: string;
  title: string;
  scrimmage_description: string;
  scrimmage_date: string;
  location: string;
  number_teams?: number;
  created_at: string;
  scrimmage_owner: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get user authentication status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch scrimmages where the user is the owner
  const { data: ownedScrimmages, error: scrimmageError } = await supabase
    .from("scrimmages")
    .select("*")
    .eq("scrimmage_owner", user.id)
    .order("scrimmage_date", { ascending: true });

  if (scrimmageError) {
    console.error('Error fetching scrimmages:', scrimmageError);
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date < now) {
      return <Badge variant="secondary">Past</Badge>;
    } else if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="destructive">Today</Badge>;
    } else if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return <Badge variant="default">This Week</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome back, {user.email}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Scrimmages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {ownedScrimmages?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upcoming Scrimmages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ownedScrimmages?.filter(s => new Date(s.scrimmage_date) > new Date()).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Past Scrimmages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {ownedScrimmages?.filter(s => new Date(s.scrimmage_date) <= new Date()).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Scrimmages Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Scrimmages
            </h2>
            <Link
              href="/scrimmage"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create New Scrimmage
            </Link>
          </div>

          {!ownedScrimmages || ownedScrimmages.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No scrimmages yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating your first scrimmage.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/scrimmage"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Create Scrimmage
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ownedScrimmages.map((scrimmage) => (
                <Card key={scrimmage.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {scrimmage.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(scrimmage.scrimmage_date)}
                          {scrimmage.number_teams && (
                            <Badge variant="outline">
                              {scrimmage.number_teams} teams
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      {scrimmage.scrimmage_description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(scrimmage.scrimmage_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{scrimmage.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/scrimmage/${scrimmage.id}`}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        View Details
                      </Link>
                      <button className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">
                        Edit
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/scrimmage"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create Scrimmage</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule a new scrimmage</p>
                </div>
              </Link>
              
              <Link
                href="/events"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Events</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Find STEM events near you</p>
                </div>
              </Link>
              
              <Link
                href="/scrimmage"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Join Scrimmages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Find scrimmages to join</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}

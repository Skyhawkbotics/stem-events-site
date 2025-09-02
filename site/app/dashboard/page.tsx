import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import DashboardContent from "@/components/dashboard-content";

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

interface Event {
  id: string;
  title: string;
  description: string;
  eventTime: string;
  location?: string;
  event_type?: string;
  created_at: string;
  event_owner?: string;
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

  // Fetch events where the user is the owner
  const { data: ownedEvents, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("event_owner", user.id)
    .order("eventTime", { ascending: true });

  if (eventError) {
    console.error('Error fetching events:', eventError);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <DashboardContent 
        ownedScrimmages={ownedScrimmages || []}
        ownedEvents={ownedEvents || []}
        userEmail={user.email || ''}
      />
      <Footer />
    </main>
  );
}

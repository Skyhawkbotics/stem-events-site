import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import AddScrimmage from "@/components/addScrimmage";

export default async function Page() {
    const supabase = await createClient();
    
    // Get user authentication status
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: scrimmages, error } = await supabase
        .from("scrimmages")
        .select("*")
        .order("scrimmage_date", { ascending: true });

    if (error) {
        return <p className="text-red-500">Error fetching scrimmages: {error.message}</p>;
    }

    if (!scrimmages || scrimmages.length === 0) {
        return <p>No scrimmages found.</p>;
    }

    // Get registration counts for all scrimmages
    const { data: allRegistrations } = await supabase
        .from("scrimmage_registrations")
        .select("scrimmage_id, status");

    // Calculate available spots for each scrimmage
    const scrimmagesWithSpots = scrimmages.map(scrimmage => {
        const approvedRegistrations = allRegistrations?.filter(
            reg => reg.scrimmage_id === scrimmage.id && reg.status === 'approved'
        ).length || 0;
        const availableSpots = parseInt(scrimmage.number_teams) - approvedRegistrations;
        return {
            ...scrimmage,
            availableSpots,
            isFull: availableSpots <= 0
        };
    });

    return (
        <main>
            <div>
                <Navbar />
                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upcoming Scrimmages</h1>
                    {user && (
                        <div className="mb-4">
                            <AddScrimmage />
                        </div>
                    )}
                    <div className="space-y-4">
                        {scrimmagesWithSpots.map((scrimmage) => (
                            <div
                                key={scrimmage.id}
                                className={`border rounded-lg p-4 shadow hover:shadow-md transition ${
                                    scrimmage.isFull ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <Link href={`/scrimmage/${scrimmage.id}`}>
                                            <h2 className="text-xl font-semibold hover:underline">{scrimmage.title}</h2>
                                        </Link>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <p>
                                                📅 {new Date(scrimmage.scrimmage_date).toLocaleString()}
                                            </p>
                                            <p>
                                                📍 {scrimmage.location}
                                            </p>
                                            <div className="flex items-center space-x-4">
                                                <span>
                                                    👥 Teams: {scrimmage.number_teams}
                                                </span>
                                                <span className={`font-medium ${
                                                    scrimmage.availableSpots > 0 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {scrimmage.availableSpots > 0 
                                                        ? `✅ ${scrimmage.availableSpots} spots available`
                                                        : '❌ Full'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-gray-700 dark:text-gray-300">
                                            {scrimmage.scrimmage_description}
                                        </p>
                                    </div>
                                    {scrimmage.isFull && (
                                        <div className="ml-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                Full
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </main>
    );
}

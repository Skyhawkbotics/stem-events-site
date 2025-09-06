import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import ScrimmageSignup from "@/components/scrimmage-signup";
import ScrimmageRegistrations from "@/components/scrimmage-registrations";
import DebugDatabase from "@/components/debug-database";

export default async function EventPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // Get user authentication status
    const { data: { user } } = await supabase.auth.getUser();

    const { data: scrimmage, error } = await supabase
    .from("scrimmages")
    .select("*")
    .eq("id", params.id)
    .single();

    if (error || !scrimmage) {
        notFound(); // built-in Next.js 404
    }

    // Get approved registrations count to calculate available spots
    const { data: approvedRegistrations } = await supabase
        .from("scrimmage_registrations")
        .select("id")
        .eq("scrimmage_id", params.id)
        .eq("status", "approved");

    const approvedCount = approvedRegistrations?.length || 0;
    const availableSpots = parseInt(scrimmage.number_teams) - approvedCount;
    const isOwner = user && scrimmage.scrimmage_owner === user.id;

    return (
        <div>
            <Navbar />
            <div className="p-6 max-w-4xl mx-auto">
                {/* Scrimmage Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{scrimmage.title}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                            <p className="font-semibold">{new Date(scrimmage.scrimmage_date).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                            <p className="font-semibold">{scrimmage.location}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Team Capacity</p>
                            <p className="font-semibold">
                                {approvedCount} / {scrimmage.number_teams} teams
                            </p>
                            <p className={`text-sm ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {availableSpots > 0 ? `${availableSpots} spots available` : 'Full'}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{scrimmage.scrimmage_description}</p>
                </div>

                {/* Debug Database Tool - Temporary */}
                <div className="mb-8">
                    <DebugDatabase />
                </div>

                {/* Action Section */}
                <div className="mb-8">
                    {!isOwner && (
                        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Join This Scrimmage</h2>
                            <ScrimmageSignup 
                                scrimmageId={params.id} 
                                maxTeams={parseInt(scrimmage.number_teams)}
                            />
                        </div>
                    )}
                </div>

                {/* Registration Management for Owners */}
                {isOwner && (
                    <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Manage Team Registrations</h2>
                        <ScrimmageRegistrations 
                            scrimmageId={params.id} 
                            maxTeams={parseInt(scrimmage.number_teams)}
                        />
                    </div>
                )}

                {/* Public Registration List (Read-only for non-owners) */}
                {!isOwner && (
                    <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Registered Teams</h2>
                        <div className="text-center py-8 text-gray-500">
                            <p>Registration information is only visible to scrimmage organizers</p>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export const metadata = {
    title: "Scrimmage Details",
    description: "Details of the selected scrimmage",
};
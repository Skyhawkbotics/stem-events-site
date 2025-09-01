import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function Page() {
    const supabase = await createClient();
    
    console.log("Fetching scrimmages...");
    
    // Test the connection first
    try {
        const { data: testData, error: testError } = await supabase
            .from("scrimmages")
            .select("count")
            .limit(1);
        
        console.log("Connection test:", { testData, testError });
    } catch (testErr) {
        console.error("Connection test failed:", testErr);
    }
    
    // First try without ordering to see if that's the issue
    let { data: scrimmages, error } = await supabase
        .from("scrimmages")
        .select("*");

    console.log("Initial fetch response:", { scrimmages, error });

    if (error) {
        console.error("Supabase error:", error);
        return <p className="text-red-500">Error fetching scrimmages: {error.message}</p>;
    }

    if (!scrimmages || scrimmages.length === 0) {
        console.log("No scrimmages found in data");
        return (
            <div>
                <Navbar />
                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upcoming Scrimmages</h1>
                    <p>No scrimmages found.</p>
                    <p className="text-sm text-gray-500 mt-2">Debug info: scrimmages = {JSON.stringify(scrimmages)}</p>
                    <p className="text-sm text-gray-500">Error: {JSON.stringify(error)}</p>
                </div>
                <Footer />
            </div>
        );
    }

    // If we have data, try to order it
    if (scrimmages.length > 0) {
        try {
            const { data: orderedScrimmages, error: orderError } = await supabase
                .from("scrimmages")
                .select("*")
                .order("scrimmage_date", { ascending: true });
            
            if (!orderError && orderedScrimmages) {
                scrimmages = orderedScrimmages;
            }
        } catch (orderErr) {
            console.log("Ordering failed, using unordered data:", orderErr);
        }
    }

    return (
        <main>
            <div>
                <Navbar />
                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upcoming Scrimmages</h1>

                    <div className="space-y-4">
                        {scrimmages.map((scrimmage) => (
                            <div
                                key={scrimmage.id}
                                className="border rounded-lg p-4 shadow hover:shadow-md transition"
                            >
                                <Link href={`/scrimmage/${scrimmage.id}`}>
                                    <h2 className="text-xl font-semibold hover:underline">{scrimmage.title}</h2>
                                </Link>
                                <p className="text-gray-600 text-sm">
                                    {new Date(scrimmage.scrimmage_date).toLocaleString()}
                                </p>
                                <p className="mt-2">{scrimmage.scrimmage_description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </main>
    );
}

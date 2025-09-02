import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import AddScrimmage from "@/components/addScrimmage";

export default async function Page() {
    const supabase = await createClient();
    const { data: scrimmages, error } = await supabase
        .from("scrimmages")
        .select()
        .order("scrimmage_date", { ascending: true });

    if (error) {
        return <p className="text-red-500">Error fetching scrimmages: {error.message}</p>;
    }

    if (!scrimmages || scrimmages.length === 0) {
        return <p>No scrimmages found.</p>;
    }

    return (
        <main>
            <div>
                <Navbar />
                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Upcoming Scrimmages</h1><AddScrimmage />
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
                                    {new Date(scrimmage.scrimmage_date).toLocaleString()}&emsp;&emsp;
                                    {new String(scrimmage.location).toLocaleString()}&emsp;&emsp;
                                    Teams: {new Number(scrimmage.number_teams).toLocaleString()}
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

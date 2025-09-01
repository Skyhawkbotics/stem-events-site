import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function EventPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: scrimmage, error } = await supabase
    .from("scrimmages")
    .select("*")
    .eq("id", params.id)
    .single();

    if (error || !scrimmage) {
        notFound(); // built-in Next.js 404
    }

    return (
        <div>
            <Navbar />
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">{scrimmage.title}</h1>
                <p className="text-gray-600 text-sm mb-4">
                    {new Date(scrimmage.scrimmage_date).toLocaleString()}
                    {scrimmage.scrimmage_location}
                    {new Number(scrimmage.number_teams).toLocaleString()}
                </p>
                <p>{scrimmage.scrimmage_description}</p>
            </div>
            <Footer />
        </div>
    );
}

export const metadata = {
    title: "Scrimmage Details",
    description: "Details of the selected scrimmage",
};
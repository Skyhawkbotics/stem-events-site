import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function EventPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: scrimmages, error } = await supabase
    .from("scrimmages")
    .select("*")
    .eq("id", params.id)
    .single();

    if (error || !scrimmages) {
        notFound(); // built-in Next.js 404
    }

    return (
        <div>
            <Navbar />
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">{scrimmages.title}</h1>
                <p className="text-gray-600 text-sm mb-4">
                    {new Date(scrimmages.scrimmage_date).toLocaleString()}
                </p>
                <p>{scrimmages.scrimmage_description}</p>
            </div>
            <Footer />
        </div>
    );
}

export const metadata = {
    title: "Scrimmage Details",
    description: "Details of the selected scrimmage",
};
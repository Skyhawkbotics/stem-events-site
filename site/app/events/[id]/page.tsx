import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EventPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

    if (error || !event) {
        notFound(); // built-in Next.js 404
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-600 text-sm mb-4">
            {new Date(event.eventTime).toLocaleString()}
            </p>
            <p>{event.description}</p>
        </div>
    );
}

export const metadata = {
    title: "Event Details",
    description: "Details of the selected event",
};
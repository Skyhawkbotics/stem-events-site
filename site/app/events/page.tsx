import { createClient } from "@/lib/supabase/server";

export default async function Page() {
    const supabase = await createClient();
    const { data: events, error } = await supabase.from("events").select();

    if (error) {
        return <p className="text-red-500">Error fetching events: {error.message}</p>;
    }

    if (!events || events.length === 0) {
        return <p>No events found.</p>;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

        <div className="space-y-4">
            {events.map((event) => (
            <div
                key={event.id}
                className="border rounded-lg p-4 shadow hover:shadow-md transition"
            >
                <h2 className="text-xl font-semibold">{event.title}</h2>
                <p className="text-gray-600 text-sm">
                {new Date(event.eventTime).toLocaleString()}
                </p>
                <p className="mt-2">{event.description}</p>
            </div>
            ))}
        </div>
        </div>
    );
}

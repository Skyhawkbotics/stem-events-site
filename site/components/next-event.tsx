import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock, MapPin } from "lucide-react";

export async function NextEvent() {
    const supabase = await createClient();
    
    // Get current timestamp
    const now = new Date().toISOString();
    
    const { data: events, error } = await supabase
        .from("events")
        .select()
        .gte("eventTime", now) // Only get events that are in the future
        .order("eventTime", { ascending: true }) // Order by event time ascending
        .limit(1); // Only get the first (next) upcoming event

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <p className="text-destructive font-medium">Error fetching events: {error.message}</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="bg-muted border border-border rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No upcoming events found</p>
                <p className="text-muted-foreground/80 text-sm mt-2">Check back soon for new events!</p>
            </div>
        );
    }

    const nextEvent = events[0];
    
    // Format the event time
    const eventDate = new Date(nextEvent.eventTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });

    return (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Next Event</h2>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{nextEvent.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{nextEvent.description}</p>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{formattedDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{formattedTime}</span>
                    </div>
                    
                    {nextEvent.location && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">{nextEvent.location}</span>
                        </div>
                    )}
                </div>
                
                <div className="pt-4">
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
}
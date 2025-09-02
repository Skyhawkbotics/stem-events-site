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
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <p className="text-destructive font-medium text-sm">Error fetching events: {error.message}</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No upcoming events found</p>
                <p className="text-muted-foreground/80 text-sm mt-1">Check back soon for new events!</p>
            </div>
        );
    }

    const nextEvent = events[0];
    
    // Format the event time
    const eventDate = new Date(nextEvent.eventTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });

    return (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-5 shadow-lg transition-all duration-300 relative">
            {/* Shadow gradient overlay */}
            <div className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(1,155,214,0.3),0_0_40px_rgba(238,28,37,0.2)] pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary p-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Next Event</h2>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">{nextEvent.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{nextEvent.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-primary" />
                            <span className="font-medium">{formattedTime}</span>
                        </div>
                        
                        {nextEvent.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span className="font-medium truncate max-w-24">{nextEvent.location}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2">
                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
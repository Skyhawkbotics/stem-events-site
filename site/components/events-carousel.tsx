"use client";

import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  eventTime: string;
  location: string;
  eventType: string;
}

export function EventsCarousel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [events.length]);

  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      
      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .gte("eventTime", now)
        .order("eventTime", { ascending: true })
        .limit(4); // Get up to 4 events for the carousel

      if (error) {
        setError(error.message);
      } else {
        setEvents(eventsData || []);
      }
    } catch (err) {
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const formatEventTime = (eventTime: string) => {
    const eventDate = new Date(eventTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return { formattedDate, formattedTime };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-muted rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
        <p className="text-destructive font-medium text-sm">Error fetching events: {error}</p>
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

  // If only one event, show it without carousel controls
  if (events.length === 1) {
    const event = events[0];
    const { formattedDate, formattedTime } = formatEventTime(event.eventTime);

    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-5 shadow-lg transition-all duration-300 relative">
        <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_var(--primary),0_0_60px_var(--secondary),inset_0_0_20px_var(--primary)] pointer-events-none opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Featured Event</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
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
              
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-medium truncate max-w-24">{event.location}</span>
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

  // Carousel for multiple events
  const currentEvent = events[currentIndex];
  const { formattedDate, formattedTime } = formatEventTime(currentEvent.eventTime);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-5 shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_var(--primary),0_0_60px_var(--secondary),inset_0_0_20px_var(--primary)] pointer-events-none opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Featured Events</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors duration-200"
                aria-label="Previous event"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {events.length}
              </span>
              <button
                onClick={nextSlide}
                className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors duration-200"
                aria-label="Next event"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">{currentEvent.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{currentEvent.description}</p>
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
              
              {currentEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="font-medium truncate max-w-24">{currentEvent.location}</span>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Carousel indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

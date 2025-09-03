"use client";
import { useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EditEvent from "@/components/editEvent";
import EditScrimmage from "@/components/editScrimmage";
import AddScrimmage from "@/components/addScrimmage";
import AddEvent from "@/components/addEvent";

interface Scrimmage {
  id: string;
  title: string;
  scrimmage_description: string;
  scrimmage_date: string;
  location: string;
  number_teams?: number;
  created_at: string;
  scrimmage_owner: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventTime: string;
  location?: string;
  event_type?: string;
  created_at: string;
  event_owner?: string;
}

interface DashboardContentProps {
  ownedScrimmages: Scrimmage[];
  ownedEvents: Event[];
  userEmail: string;
}

export default function DashboardContent({ ownedScrimmages, ownedEvents, userEmail }: DashboardContentProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScrimmage, setEditingScrimmage] = useState<Scrimmage | null>(null);
  const [isEditScrimmageModalOpen, setIsEditScrimmageModalOpen] = useState(false);
  const [isAddScrimmageModalOpen, setIsAddScrimmageModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [hidePastItems, setHidePastItems] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date < now) {
      return <Badge variant="secondary">Past</Badge>;
    } else if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="destructive">Today</Badge>;
    } else if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return <Badge variant="default">This Week</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const getTypeBadge = (type: 'scrimmage' | 'event') => {
    return type === 'scrimmage' 
      ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">Scrimmage</Badge>
      : <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">Event</Badge>;
  };

  // Filter items based on hidePastItems state
  const filteredScrimmages = hidePastItems 
    ? ownedScrimmages?.filter(s => new Date(s.scrimmage_date) > new Date()) || []
    : ownedScrimmages || [];
  
  const filteredEvents = hidePastItems 
    ? ownedEvents?.filter(e => new Date(e.eventTime) > new Date()) || []
    : ownedEvents || [];

  const totalItems = (ownedScrimmages?.length || 0) + (ownedEvents?.length || 0);
  const upcomingItems = (ownedScrimmages?.filter(s => new Date(s.scrimmage_date) > new Date()).length || 0) + 
                       (ownedEvents?.filter(e => new Date(e.eventTime) > new Date()).length || 0);
  const pastItems = (ownedScrimmages?.filter(s => new Date(s.scrimmage_date) <= new Date()).length || 0) + 
                   (ownedEvents?.filter(e => new Date(e.eventTime) <= new Date()).length || 0);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdated = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleEditScrimmage = (scrimmage: Scrimmage) => {
    setEditingScrimmage(scrimmage);
    setIsEditScrimmageModalOpen(true);
  };

  const handleCloseEditScrimmageModal = () => {
    setIsEditScrimmageModalOpen(false);
    setEditingScrimmage(null);
  };

  const handleScrimmageUpdated = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleScrimmageAdded = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleAddScrimmageModalOpen = () => {
    setIsAddScrimmageModalOpen(true);
  };

  const handleCloseAddScrimmageModal = () => {
    setIsAddScrimmageModalOpen(false);
  };

  const handleAddEventModalOpen = () => {
    setIsAddEventModalOpen(true);
  };

  const handleCloseAddEventModal = () => {
    setIsAddEventModalOpen(false);
  };

  const handleEventAdded = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome back, {userEmail}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {totalItems}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {upcomingItems}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Past
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {pastItems}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Scrimmages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {ownedScrimmages?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unified Content Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                My Content
              </h2>
              <button
                onClick={() => setHidePastItems(!hidePastItems)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  hidePastItems
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {hidePastItems ? 'Show Past Items' : 'Hide Past Items'}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddScrimmageModalOpen}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Scrimmage
              </button>
              <button
                onClick={handleAddEventModalOpen}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Event
              </button>
            </div>
          </div>

          {(filteredScrimmages.length === 0 && filteredEvents.length === 0) ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {hidePastItems ? 'No upcoming content' : 'No content yet'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {hidePastItems 
                      ? 'All your scrimmages and events are in the past. Toggle to show past items or create new ones.'
                      : 'Get started by creating your first scrimmage or event.'
                    }
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={handleAddScrimmageModalOpen}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Create Scrimmage
                    </button>
                    <button
                      onClick={handleAddEventModalOpen}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                  {hidePastItems && totalItems > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setHidePastItems(false)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Show Past Items
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Scrimmages Section */}
              {filteredScrimmages && filteredScrimmages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Scrimmages ({filteredScrimmages.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredScrimmages.map((scrimmage) => (
                      <Card key={`scrimmage-${scrimmage.id}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeBadge('scrimmage')}
                                {getStatusBadge(scrimmage.scrimmage_date)}
                              </div>
                              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                {scrimmage.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                            {scrimmage.scrimmage_description}
                          </CardDescription>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(scrimmage.scrimmage_date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{scrimmage.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/scrimmage/${scrimmage.id}`}
                              className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                            >
                              View Details
                            </Link>
                            <button 
                              onClick={() => handleEditScrimmage(scrimmage)}
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Edit
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Section */}
              {filteredEvents && filteredEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    My Events ({filteredEvents.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredEvents.map((event) => (
                      <Card key={`event-${event.id}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeBadge('event')}
                                {getStatusBadge(event.eventTime)}
                              </div>
                              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                {event.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                            {event.description}
                          </CardDescription>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(event.eventTime)}</span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                            >
                              View Details
                            </Link>
                            <button 
                              onClick={() => handleEditEvent(event)}
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Edit
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAddScrimmageModalOpen}
                className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20 transition-colors bg-white dark:bg-gray-800 w-full text-left"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create Scrimmage</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule a new scrimmage</p>
                </div>
              </button>
              
              <button
                onClick={handleAddEventModalOpen}
                className="flex items-center p-4 border border-green-200 rounded-md hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20 transition-colors bg-white dark:bg-gray-800 w-full text-left"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create Event</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule a new STEM event</p>
                </div>
              </button>
              
              <Link
                href="/scrimmage"
                className="flex items-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20 transition-colors bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Join Scrimmages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Find scrimmages to join</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEvent
          event={editingEvent}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* Edit Scrimmage Modal */}
      {editingScrimmage && (
        <EditScrimmage
          scrimmage={editingScrimmage}
          isOpen={isEditScrimmageModalOpen}
          onClose={handleCloseEditScrimmageModal}
          onScrimmageUpdated={handleScrimmageUpdated}
        />
      )}

      {/* Add Scrimmage Modal */}
      {isAddScrimmageModalOpen && (
        <AddScrimmage
          isOpen={isAddScrimmageModalOpen}
          onClose={handleCloseAddScrimmageModal}
          onScrimmageAdded={handleScrimmageAdded}
        />
      )}

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <AddEvent
          isOpen={isAddEventModalOpen}
          onClose={handleCloseAddEventModal}
          onEventAdded={handleEventAdded}
        />
      )}
    </>
  );
}

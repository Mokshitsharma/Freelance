import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, CheckCircle, Clock, Check, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

const Events = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        const now = new Date().toISOString();
        const upcoming = eventsData.filter(e => e.date >= now).reverse(); // Ascending for upcoming
        const past = eventsData.filter(e => e.date < now); // Descending for past
        
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Error fetching events:", error);
      }

      if (currentUser) {
        try {
          const regQ = query(collection(db, 'event_registrations'), where('user_id', '==', currentUser.uid));
          const regSnapshot = await getDocs(regQ);
          const userRegs = regSnapshot.docs
            .map(doc => doc.data())
            .map(data => data.event_id);
          setRegisteredEvents(new Set(userRegs));
        } catch (error) {
          console.error("Error fetching event registrations:", error);
        }
      }
      
      setLoading(false);
    };

    fetchEvents();
  }, [currentUser]);

  const handleAttend = async (eventId: string) => {
    if (!currentUser) {
      alert(t('login') + " " + t('required_field'));
      return;
    }

    setRegistering(eventId);
    try {
      const registrationId = `${currentUser.uid}_${eventId}`;
      const regRef = doc(db, 'event_registrations', registrationId);
      
      if (registeredEvents.has(eventId)) {
        await deleteDoc(regRef);
        setRegisteredEvents(prev => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await setDoc(regRef, {
          user_id: currentUser.uid,
          event_id: eventId,
          created_at: new Date().toISOString()
        });
        setRegisteredEvents(prev => new Set(prev).add(eventId));
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      alert(t('error'));
    } finally {
      setRegistering(null);
    }
  };

  const handleShare = (event: Event) => {
    const text = `*${event.title}*\n\n${event.description}\n\n📅 *Date:* ${format(new Date(event.date), 'dd MMM yyyy')}\n🕒 *Time:* ${format(new Date(event.date), 'h:mm a')}\n📍 *Location:* ${event.location}\n\nJoin us at Sarv Brahmin Sanghtan!\n\nRegister here: ${window.location.origin}/events`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const EventCard: React.FC<{ event: Event, isPast: boolean }> = ({ event, isPast }) => {
    const isRegistered = registeredEvents.has(event.id);
    const eventDate = new Date(event.date);

    return (
      <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border ${isPast ? 'border-gray-200 opacity-80' : 'border-orange-100'} transition-all hover:shadow-md`}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Date Block */}
          <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-center ${isPast ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
            <span className="text-sm font-bold uppercase tracking-wider">{format(eventDate, 'MMM')}</span>
            <span className="text-3xl font-extrabold leading-none my-1">{format(eventDate, 'dd')}</span>
            <span className="text-xs font-semibold">{format(eventDate, 'yyyy')}</span>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">{event.description}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Clock size={18} className={isPast ? 'text-gray-400' : 'text-orange-500'} />
                {format(eventDate, 'h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className={isPast ? 'text-gray-400' : 'text-orange-500'} />
                {event.location}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isPast && (
                <button
                  onClick={() => handleAttend(event.id)}
                  disabled={registering === event.id}
                  className={`flex-grow sm:flex-grow-0 px-6 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    isRegistered 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                  } ${registering === event.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {registering === event.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : isRegistered ? (
                    <>
                      <CheckCircle size={20} />
                      {t('registered')}
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {t('i_will_attend')}
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => handleShare(event)}
                className="px-6 py-3 rounded-xl font-bold text-base bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                {t('share_whatsapp')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          {t('events')}
        </h1>
        <div className="h-1 w-24 bg-orange-600 rounded-full mx-auto"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
          {t('events_page_desc')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          {/* Upcoming Events */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-orange-600" size={32} />
              <h2 className="text-3xl font-bold text-gray-900">{t('upcoming_events')}</h2>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} isPast={false} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 font-medium">{t('no_events')}</p>
              </div>
            )}
          </section>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-8 opacity-80">
                <Calendar className="text-gray-500" size={32} />
                <h2 className="text-3xl font-bold text-gray-700">{t('past_events')}</h2>
              </div>
              
              <div className="space-y-6">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} isPast={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Events;

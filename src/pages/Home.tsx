import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Users, Heart, ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
}

interface LeadershipMessage {
  id: string;
  name: string;
  designation: string;
  message: string;
  photo_url: string;
  order: number;
}

const Home = () => {
  const { t } = useTranslation();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [leadershipMessages, setLeadershipMessages] = useState<LeadershipMessage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Events
        const eventsQ = query(collection(db, 'events'), orderBy('date', 'asc'), limit(3));
        const eventsSnapshot = await getDocs(eventsQ);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        const now = new Date().toISOString();
        setUpcomingEvents(eventsData.filter(e => e.date >= now));

        // Fetch Gallery
        const galleryQ = query(collection(db, 'gallery'), orderBy('date', 'desc'), limit(10));
        const gallerySnapshot = await getDocs(galleryQ);
        setGalleryImages(gallerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryImage[]);

        // Fetch Leadership Messages
        const leadershipQ = query(collection(db, 'leadership_messages'), orderBy('order', 'asc'));
        const leadershipSnapshot = await getDocs(leadershipQ);
        setLeadershipMessages(leadershipSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeadershipMessage[]);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (galleryImages.length > 0) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [galleryImages.length]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-orange-600 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-500 opacity-90"></div>
        <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            {t('app_name')}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-orange-100 max-w-3xl mb-10 font-medium">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/register" 
              className="bg-white text-orange-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Users size={24} />
              पंजीकरण करें (Register)
            </Link>
            <Link 
              to="/donate" 
              className="bg-orange-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-900 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-orange-700"
            >
              <Heart size={24} />
              {t('donate_now')}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/events" className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100 group">
          <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600">
            <Calendar size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('events')}</h3>
          <p className="text-gray-600 mb-4">{t('events_desc')}</p>
          <span className="text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            {t('view_events')} <ArrowRight size={18} />
          </span>
        </Link>

        <Link to="/members" className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100 group">
          <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('members') || 'Members'}</h3>
          <p className="text-gray-600 mb-4">{t('members_desc') || 'View our community member directory.'}</p>
          <span className="text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            {t('view_members') || 'View Members'} <ArrowRight size={18} />
          </span>
        </Link>

        <Link to="/parichay" className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100 group">
          <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('parichay')}</h3>
          <p className="text-gray-600 mb-4">{t('parichay_desc')}</p>
          <span className="text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            {t('register_now')} <ArrowRight size={18} />
          </span>
        </Link>

        <Link to="/donate" className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-orange-100 group">
          <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600">
            <Heart size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('donate')}</h3>
          <p className="text-gray-600 mb-4">{t('donate_desc')}</p>
          <span className="text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            {t('donate')} <ArrowRight size={18} />
          </span>
        </Link>
      </section>

      {/* Upcoming Events Preview */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-orange-100">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('upcoming_events')}</h2>
            <div className="h-1 w-20 bg-orange-600 rounded-full"></div>
          </div>
          <Link to="/events" className="hidden sm:flex text-orange-600 font-semibold items-center gap-1 hover:text-orange-800 transition-colors">
            {t('see_all')} <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="border border-gray-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="text-orange-600 font-bold mb-2 text-sm uppercase tracking-wider">
                  {format(new Date(event.date), 'MMM dd, yyyy')}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{event.description}</p>
                <div className="flex items-center text-gray-500 text-sm mb-6">
                  <span className="truncate">{event.location}</span>
                </div>
                <Link to={`/events`} className="block w-full text-center bg-orange-50 text-orange-700 font-semibold py-3 rounded-xl hover:bg-orange-100 transition-colors">
                  {t('i_will_attend')}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t('no_events')}</p>
          </div>
        )}
        
        <Link to="/events" className="sm:hidden mt-6 flex justify-center w-full text-orange-600 font-semibold items-center gap-1 hover:text-orange-800 transition-colors bg-orange-50 py-3 rounded-xl">
          {t('see_all_events')} <ArrowRight size={20} />
        </Link>
      </section>

      {/* Gallery Carousel */}
      {galleryImages.length > 0 && (
        <section className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] md:aspect-[21/9]">
          <div className="absolute inset-0">
            {galleryImages.map((img, index) => (
              <div 
                key={img.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{img.title}</h3>
                  <p className="text-gray-200 text-sm md:text-base max-w-2xl line-clamp-2">{img.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-orange-500 w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Leadership Messages */}
      {leadershipMessages.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">हमारे मार्गदर्शक (Our Leaders)</h2>
            <div className="h-1 w-20 bg-orange-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {leadershipMessages.map(m => (
              <div key={m.id} className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 relative group hover:shadow-md transition-shadow">
                <div className="absolute top-6 right-8 text-orange-100 group-hover:text-orange-200 transition-colors">
                  <Quote size={48} />
                </div>
                <div className="flex items-start gap-6 relative">
                  <img 
                    src={m.photo_url} 
                    alt={m.name} 
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-orange-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{m.name}</h3>
                    <p className="text-orange-600 font-semibold text-sm mb-4">{m.designation}</p>
                    <p className="text-gray-600 italic leading-relaxed">"{m.message}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

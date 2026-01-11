'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';
import Link from 'next/link';

const CITIES = ['Paris', 'Dakar', 'Nice', 'Grasse'];

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    search: '',
    tags: '',
  });
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(20); // Rayon en km

  useEffect(() => {
    loadEvents();
  }, [filters, nearbyMode, searchRadius]);

  useEffect(() => {
    // Charger la ville de l'utilisateur
    const savedCity = localStorage.getItem('userCity');
    if (savedCity && !filters.city) {
      setFilters({ ...filters, city: savedCity });
    }
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      const params = new URLSearchParams();

      if (nearbyMode && userLocation) {
        // Mode proximité avec géolocalisation
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lng.toString());
        params.append('radius', searchRadius.toString());
        endpoint = `/events/nearby?${params.toString()}`;
        console.log('🌍 Mode proximité activé:', { lat: userLocation.lat, lng: userLocation.lng, radius: searchRadius, endpoint });
      } else {
        // Mode normal avec filtres
        if (filters.city) params.append('city', filters.city);
        if (filters.search) params.append('q', filters.search);
        if (filters.tags) params.append('tags', filters.tags);
        
        const queryString = params.toString();
        endpoint = filters.search 
          ? `/events/search?${queryString}`
          : `/events?${queryString}`;
      }

      console.log('📡 Appel API:', endpoint);
      const response = await api.get<any>(endpoint);
      console.log('📦 Réponse API:', response);
      
      // L'API peut retourner soit { data: Event[] } soit { data: { events: Event[] } }
      const eventsData = response.data?.events || response.data || [];
      console.log('✅ Événements extraits:', eventsData.length);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error('❌ Erreur chargement événements:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNearbyToggle = () => {
    if (!nearbyMode) {
      // Activer le mode proximité - demander la géolocalisation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setNearbyMode(true);
          },
          (error) => {
            console.error('Erreur géolocalisation:', error);
            alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
          }
        );
      } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      }
    } else {
      // Désactiver le mode proximité
      setNearbyMode(false);
      setUserLocation(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-4xl mb-2">Événements</h1>
                <p className="text-gray-600 text-lg">
                  {nearbyMode 
                    ? 'Événements à proximité de votre position'
                    : 'Découvrez les événements près de chez vous'
                  }
                </p>
              </div>
              <button
                onClick={handleNearbyToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-colors ${
                  nearbyMode
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {nearbyMode ? 'Mode proximité activé' : 'Événements à proximité'}
              </button>
            </div>

            {/* Slider rayon de recherche */}
            {nearbyMode && (
              <div className="mt-6 bg-white rounded-2xl p-6 border-2 border-primary/20">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rayon de recherche : <span className="text-primary font-semibold">{searchRadius} km</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>5 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}
          </div>

          {/* Filtres */}
          {!nearbyMode && (
            <div className="card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Mots-clés..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                >
                  <option value="">Toutes les villes</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="sport, musique..."
                  value={filters.tags}
                  onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              onClick={() => setFilters({ city: '', search: '', tags: '' })}
              className="mt-4 text-primary hover:text-primary-dark text-sm transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
          )}

          {/* Liste des événements */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl mb-2">Aucun événement trouvé</h2>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos filtres ou créez votre propre événement
              </p>
              <Link href="/create" className="btn-primary inline-block">
                Créer un événement
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                {events.length} événement{events.length > 1 ? 's' : ''} trouvé{events.length > 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="card overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  >
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-6xl">
                        {event.tags.includes('sport') ? '⚽' :
                         event.tags.includes('musique') ? '🎵' :
                         event.tags.includes('culture') ? '🎨' :
                         event.tags.includes('nature') ? '🌳' :
                         '🎉'}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Titre */}
                      <h3 className="text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Infos */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.startDate)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.city}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            {event.participantCount} / {event.maxCapacity}
                            {event.participantCount >= event.maxCapacity && (
                              <span className="ml-2 text-red-500 font-medium">Complet</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

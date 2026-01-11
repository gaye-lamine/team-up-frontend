'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocationModal from '@/components/LocationModal';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Event } from '@/lib/types';

export default function Home() {
  const [userCity, setUserCity] = useState<string | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyEvents();
  }, []);

  const handleLocationSet = (city: string) => {
    setUserCity(city);
    loadNearbyEvents();
  };

  const loadNearbyEvents = async () => {
    try {
      setLoading(true);

      // Essayer d'obtenir la position GPS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Utiliser la position GPS
            console.log('🌍 Position GPS:', position.coords.latitude, position.coords.longitude);
            const response = await api.get<any>(
              `/events/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&radius=20`
            );
            console.log('📦 Réponse API nearby:', response);
            const eventsData = response.data?.events || [];
            console.log('✅ Événements trouvés:', eventsData.length);
            setNearbyEvents(Array.isArray(eventsData) ? eventsData.slice(0, 6) : []);
            setLoading(false);
          },
          async () => {
            // Si GPS échoue, utiliser la ville sauvegardée
            console.log('❌ GPS échoué, utilisation de la ville');
            const savedCity = localStorage.getItem('userCity');
            console.log('🏙️ Ville sauvegardée:', savedCity);
            if (savedCity) {
              const response = await api.get<any>(`/events?city=${savedCity}&limit=6`);
              console.log('📦 Réponse API ville:', response);
              const eventsData = response.data?.events || response.data || [];
              console.log('✅ Événements trouvés:', eventsData.length);
              setNearbyEvents(Array.isArray(eventsData) ? eventsData.slice(0, 6) : []);
            }
            setLoading(false);
          }
        );
      } else {
        // Pas de géolocalisation, utiliser la ville
        console.log('❌ Pas de géolocalisation disponible');
        const savedCity = localStorage.getItem('userCity');
        console.log('🏙️ Ville sauvegardée:', savedCity);
        if (savedCity) {
          const response = await api.get<any>(`/events?city=${savedCity}&limit=6`);
          console.log('📦 Réponse API ville:', response);
          const eventsData = response.data?.events || response.data || [];
          console.log('✅ Événements trouvés:', eventsData.length);
          setNearbyEvents(Array.isArray(eventsData) ? eventsData.slice(0, 6) : []);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Erreur chargement événements:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <LocationModal onLocationSet={handleLocationSet} />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Bienvenue sur <span className="gradient-text">TeamUp</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez et créez des événements locaux dans votre ville.
              Rejoignez une communauté active près de chez vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events" className="btn-primary text-lg">
                Explorer les événements
              </Link>
              <Link href="/create" className="btn-secondary text-lg">
                Créer un événement
              </Link>
            </div>
          </div>
        </section>

        {/* Événements à proximité */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Événements près de vous</h2>
                <p className="text-gray-600">
                  Découvrez les événements dans votre région
                </p>
              </div>
              <Link href="/events" className="btn-secondary">
                Voir tout
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : nearbyEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 mb-4">
                  Aucun événement trouvé près de vous
                </p>
                <Link href="/create" className="btn-primary inline-block">
                  Créer le premier événement
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group card overflow-hidden transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {event.tags.includes('sport') ? '⚽' :
                          event.tags.includes('musique') ? '🎵' :
                            event.tags.includes('culture') ? '🎨' :
                              event.tags.includes('nature') ? '🌳' :
                                '🎉'}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="badge-gradient"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(event.startDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            {event.participantCount} / {event.maxCapacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card-premium p-8 text-center group">
                <div className="text-5xl mb-4 group-hover:animate-float">📍</div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Événements locaux</h2>
                <p className="text-gray-600">
                  Découvrez des événements près de chez vous à Paris, Dakar, Nice et Grasse
                </p>
              </div>

              <div className="card-premium p-8 text-center group">
                <div className="text-5xl mb-4 group-hover:animate-float">✨</div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Création simple</h2>
                <p className="text-gray-600">
                  Organisez votre événement en 3 étapes simples et rapides
                </p>
              </div>

              <div className="card-premium p-8 text-center group">
                <div className="text-5xl mb-4 group-hover:animate-float">👥</div>
                <h2 className="text-2xl font-bold mb-4 gradient-text">Communauté active</h2>
                <p className="text-gray-600">
                  Rejoignez des milliers de personnes qui partagent vos centres d'intérêt
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold gradient-text mb-6">Prêt à commencer ?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Inscrivez-vous gratuitement et découvrez les événements près de chez vous
            </p>
            <Link href="/register" className="btn-primary text-lg inline-block">
              Créer un compte
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

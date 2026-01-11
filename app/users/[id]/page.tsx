'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { User, Event } from '@/lib/types';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'organized' | 'participating'>('organized');

  useEffect(() => {
    loadUserData();
  }, [params.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les infos utilisateur
      const userResponse = await api.get<any>(`/users/${params.id}`);
      const userData = userResponse.data?.user || userResponse.data;
      setUser(userData);

      // Charger les événements de l'utilisateur
      const eventsResponse = await api.get<any>(`/events?organizerId=${params.id}`);
      const eventsData = eventsResponse.data?.events || eventsResponse.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Utilisateur introuvable</h1>
            <button onClick={() => router.push('/events')} className="btn-primary">
              Retour aux événements
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* En-tête profil */}
          <div className="card p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white text-5xl font-semibold flex-shrink-0">
                {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
              </div>

              {/* Infos */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                {user.pseudo && (
                  <p className="text-xl text-gray-600 mb-4">@{user.pseudo}</p>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{user.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{calculateAge(user.birthYear)} ans</span>
                  </div>
                </div>

                {/* Centres d'intérêt */}
                {user.interests && user.interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold text-primary mb-2">
                {events.length}
              </div>
              <div className="text-gray-600">Événements organisés</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold text-primary mb-2">
                {events.reduce((sum, e) => sum + e.participantCount, 0)}
              </div>
              <div className="text-gray-600">Participants accueillis</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold text-primary mb-2">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
              </div>
              <div className="text-gray-600">Membre depuis</div>
            </div>
          </div>

          {/* Onglets */}
          <div className="card">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('organized')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'organized'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Événements organisés ({events.length})
                </button>
              </div>
            </div>

            {/* Contenu onglet */}
            <div className="p-6">
              {activeTab === 'organized' && (
                <div>
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Aucun événement organisé pour le moment</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all"
                        >
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
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {new Date(event.startDate).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>
                                {event.participantCount} / {event.maxCapacity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.city}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

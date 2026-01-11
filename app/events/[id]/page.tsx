'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { Event, Comment, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import AddToCalendar from '@/components/AddToCalendar';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEventData();
  }, [params.id, isAuthenticated, user?.id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger l'événement
      const eventResponse = await api.get<any>(`/events/${params.id}`);
      const eventData = eventResponse.data?.event || eventResponse.data;
      setEvent(eventData);

      // Charger les commentaires
      const commentsResponse = await api.get<any>(
        `/events/${params.id}/comments`
      );
      const commentsData = commentsResponse.data?.comments || commentsResponse.data || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);

      // Charger les participants si authentifié
      if (isAuthenticated && user) {
        try {
          const participantsResponse = await api.get<any>(
            `/events/${params.id}/participants`
          );
          const participantsData = participantsResponse.data?.participants || participantsResponse.data || [];
          const participantsList = Array.isArray(participantsData) ? participantsData : [];

          // L'API retourne des objets avec { user: {...} }, on extrait les users
          const users = participantsList.map((p: any) => p.user || p);
          setParticipants(users);

          // Vérifier si l'utilisateur a rejoint l'événement
          const hasJoined = users.some((p: User) => p.id === user.id);
          setIsJoined(hasJoined);
        } catch (err) {
          console.error('Erreur chargement participants:', err);
          setParticipants([]);
          setIsJoined(false);
        }
      } else {
        setParticipants([]);
        setIsJoined(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setError('');
      await api.post(`/events/${params.id}/join`);

      // Recharger immédiatement les données
      await loadEventData();
    } catch (err: any) {
      // Si l'erreur dit qu'on est déjà inscrit, recharger quand même
      if (err.message?.includes('déjà inscrit')) {
        await loadEventData();
      } else {
        setError(err.message || 'Erreur lors de l\'inscription');
      }
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setError('');
      await api.delete(`/events/${params.id}/leave`);

      // Recharger immédiatement les données
      await loadEventData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la désinscription');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      await api.post(`/events/${params.id}/comments`, {
        content: commentText,
      });
      setCommentText('');
      loadEventData(); // Recharger les commentaires
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      loadEventData();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancelEvent = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/events/${params.id}`);
      router.push('/events');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation de l\'événement');
    }
  };

  const handleReportEvent = async () => {
    const reportType = prompt(
      'Type de signalement :\n1. spam\n2. inappropriate\n3. fake\n4. other\n\nEntrez le numéro (1-4):'
    );

    const types = ['spam', 'inappropriate', 'fake', 'other'];
    const typeIndex = parseInt(reportType || '0') - 1;

    if (typeIndex < 0 || typeIndex > 3) {
      alert('Type de signalement invalide');
      return;
    }

    const reason = prompt('Raison du signalement :');
    if (!reason || !reason.trim()) {
      alert('Veuillez fournir une raison');
      return;
    }

    try {
      await api.post(`/events/${params.id}/report`, {
        type: types[typeIndex],
        reason: reason.trim(),
      });
      alert('Signalement envoyé avec succès. Merci pour votre contribution.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du signalement');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  if (error || !event) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Événement introuvable</h1>
            <button onClick={() => router.push('/events')} className="btn-primary">
              Retour aux événements
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isOrganizer = user?.id === event.organizer?.id;
  const isFull = event.participantCount >= event.maxCapacity;

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600">
            <button onClick={() => router.push('/events')} className="hover:text-primary">
              Événements
            </button>
            <span className="mx-2">/</span>
            <span>{event.title}</span>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* En-tête événement */}
              <div className="card p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl mb-4">{event.title}</h1>

                <div className="flex items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{event.participantCount} / {event.maxCapacity} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.city}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Détails */}
              <div className="card p-8">
                <h2 className="text-2xl mb-6">Détails</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Date et heure</p>
                      <p className="text-gray-600">Début : {formatDate(event.startDate)}</p>
                      <p className="text-gray-600">Fin : {formatDate(event.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-gray-600">{event.address}</p>
                      <p className="text-gray-600">{event.city}</p>
                    </div>
                  </div>

                  {(event.minAge || event.maxAge) && (
                    <div className="flex items-start gap-4">
                      <svg className="w-6 h-6 text-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="font-medium">Âge requis</p>
                        <p className="text-gray-600">
                          {event.minAge && event.maxAge
                            ? `${event.minAge} - ${event.maxAge} ans`
                            : event.minAge
                              ? `${event.minAge} ans et plus`
                              : `Jusqu'à ${event.maxAge} ans`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium">Type d'événement</p>
                      <p className="text-gray-600">
                        {event.isPublic ? 'Public' : 'Privé'}
                        {event.requiresApproval && ' - Inscription sur approbation'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaires */}
              <div className="card p-8">
                <h2 className="text-2xl mb-6">Commentaires ({comments.length})</h2>

                {/* Formulaire ajout commentaire */}
                {isAuthenticated ? (
                  <form onSubmit={handleAddComment} className="mb-8">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="btn-primary mt-3"
                    >
                      Publier
                    </button>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl mb-8 text-center">
                    <p className="text-gray-600 mb-3">
                      Connectez-vous pour commenter
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="btn-primary"
                    >
                      Se connecter
                    </button>
                  </div>
                )}

                {/* Liste des commentaires */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucun commentaire pour le moment
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {comment.user?.firstName?.[0] || '?'}{comment.user?.lastName?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium">
                                {comment.user?.firstName || 'Utilisateur'} {comment.user?.lastName || ''}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          {(user?.id === comment.userId || isOrganizer || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 ml-13">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="card p-6">
                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      Connectez-vous pour participer
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="btn-primary w-full"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="btn-secondary w-full"
                    >
                      S'inscrire
                    </button>
                  </div>
                ) : isOrganizer ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Vous êtes l'organisateur</p>
                    <button
                      onClick={() => router.push(`/events/${params.id}/edit`)}
                      className="btn-secondary w-full"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={handleCancelEvent}
                      className="w-full px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium rounded-2xl transition-colors"
                    >
                      Supprimer l'événement
                    </button>
                  </div>
                ) : isJoined ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-center mb-4">
                      ✓ Vous participez
                    </div>
                    <button
                      onClick={handleLeaveEvent}
                      className="btn-secondary w-full"
                    >
                      Se désinscrire
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinEvent}
                    disabled={isFull}
                    className="btn-primary w-full"
                  >
                    {isFull ? 'Complet' : 'Rejoindre'}
                  </button>
                )}

                {isAuthenticated && !isOrganizer && (
                  <button
                    onClick={handleReportEvent}
                    className="w-full mt-3 text-gray-600 hover:text-red-500 text-sm transition-colors"
                  >
                    Signaler
                  </button>
                )}
              </div>

              {/* Ajouter au calendrier */}
              {isJoined && <AddToCalendar event={event} />}

              {/* Organisateur */}
              {event.organizer && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Organisateur</h3>
                  <button
                    onClick={() => event.organizer && router.push(`/users/${event.organizer.id}`)}
                    className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {event.organizer.firstName?.[0] || '?'}{event.organizer.lastName?.[0] || '?'}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">
                        {event.organizer.firstName || 'Utilisateur'} {event.organizer.lastName || ''}
                      </p>
                      <p className="text-sm text-gray-600">{event.organizer.city}</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Participants */}
              {isAuthenticated && participants.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Participants ({participants.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                          {participant.firstName?.[0] || '?'}{participant.lastName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {participant.firstName || 'Utilisateur'} {participant.lastName || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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

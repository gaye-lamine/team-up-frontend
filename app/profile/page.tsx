'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const CITIES = ['Paris', 'Dakar', 'Nice', 'Grasse'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pseudo: '',
    city: '',
    birthYear: new Date().getFullYear() - 25,
    interests: [] as string[],
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        pseudo: user.pseudo || '',
        city: user.city || '',
        birthYear: user.birthYear || new Date().getFullYear() - 25,
        interests: user.interests || [],
      });
    }
  }, [user]);

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const interest = newInterest.trim().toLowerCase();
    
    if (interest && !formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interestToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/auth/profile', formData);
      
      // Mettre à jour l'utilisateur dans le localStorage
      if (typeof window !== 'undefined') {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setSuccess('Profil mis à jour avec succès !');
      setEditing(false);
      
      // Recharger la page après 1 seconde
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Mon profil</h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Avatar */}
              <div className="card p-6 text-center">
                <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-semibold mx-auto mb-4">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <h2 className="text-xl font-semibold mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                {user.pseudo && (
                  <p className="text-gray-600 mb-2">@{user.pseudo}</p>
                )}
                <p className="text-sm text-gray-500">{user.city}</p>
              </div>

              {/* Statistiques */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Événements créés</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participations</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-semibold">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl">Informations personnelles</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-secondary"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Pseudo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pseudo
                      </label>
                      <input
                        type="text"
                        value={formData.pseudo}
                        onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* Ville et Année */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ville *
                        </label>
                        <select
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        >
                          <option value="">Sélectionnez une ville</option>
                          {CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Année de naissance *
                        </label>
                        <input
                          type="number"
                          required
                          min="1920"
                          max={new Date().getFullYear()}
                          value={formData.birthYear}
                          onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Centres d'intérêt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Centres d'intérêt
                      </label>
                      
                      {formData.interests.length > 0 && (
                        <div className="mb-4 p-4 bg-primary/5 rounded-xl">
                          <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-sm"
                              >
                                {interest}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInterest(interest)}
                                  className="hover:bg-primary-dark rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleAddInterest} className="flex gap-2">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Ajouter un centre d'intérêt..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        />
                        <button
                          type="submit"
                          disabled={!newInterest.trim()}
                          className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Ajouter
                        </button>
                      </form>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setError('');
                          // Réinitialiser le formulaire
                          if (user) {
                            setFormData({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              pseudo: user.pseudo || '',
                              city: user.city || '',
                              birthYear: user.birthYear || new Date().getFullYear() - 25,
                              interests: user.interests || [],
                            });
                          }
                        }}
                        className="btn-secondary flex-1"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Prénom</p>
                        <p className="font-medium">{user.firstName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nom</p>
                        <p className="font-medium">{user.lastName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pseudo</p>
                        <p className="font-medium">{user.pseudo || '-'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ville</p>
                        <p className="font-medium">{user.city}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Année de naissance</p>
                        <p className="font-medium">{user.birthYear}</p>
                      </div>
                    </div>

                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Centres d'intérêt</p>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest) => (
                            <span
                              key={interest}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

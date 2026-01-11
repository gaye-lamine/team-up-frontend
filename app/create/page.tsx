'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const CITIES = ['Paris', 'Dakar', 'Nice', 'Grasse'];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Paris: { lat: 48.8566, lng: 2.3522 },
  Dakar: { lat: 14.6928, lng: -17.4467 },
  Nice: { lat: 43.7102, lng: 7.2620 },
  Grasse: { lat: 43.6584, lng: 6.9222 },
};

const POPULAR_TAGS = [
  'sport', 'musique', 'culture', 'nature', 'gastronomie',
  'art', 'cinéma', 'danse', 'jeux', 'technologie',
  'lecture', 'photographie', 'randonnée', 'vélo', 'yoga'
];

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Étape 1 : Informations de base
    title: '',
    description: '',
    tags: [] as string[],
    
    // Étape 2 : Date et lieu
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    city: user?.city || '',
    address: '',
    
    // Étape 3 : Paramètres
    maxCapacity: 10,
    minAge: undefined as number | undefined,
    maxAge: undefined as number | undefined,
    isPublic: true,
    requiresApproval: false,
  });

  const [customTag, setCustomTag] = useState('');

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Afficher un loader pendant la vérification de l'authentification
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

  // Ne rien afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  const handleTagToggle = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = customTag.trim().toLowerCase();
    
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove),
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setError('Le titre est requis');
        return false;
      }
      if (!formData.description.trim()) {
        setError('La description est requise');
        return false;
      }
      if (formData.tags.length === 0) {
        setError('Sélectionnez au moins un tag');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.startDate || !formData.startTime) {
        setError('La date et l\'heure de début sont requises');
        return false;
      }
      if (!formData.endDate || !formData.endTime) {
        setError('La date et l\'heure de fin sont requises');
        return false;
      }
      if (!formData.city) {
        setError('La ville est requise');
        return false;
      }
      if (!formData.address.trim()) {
        setError('L\'adresse est requise');
        return false;
      }

      // Vérifier que la date de fin est après la date de début
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (end <= start) {
        setError('La date de fin doit être après la date de début');
        return false;
      }
    }

    if (currentStep === 3) {
      if (formData.maxCapacity < 2) {
        setError('La capacité doit être d\'au moins 2 personnes');
        return false;
      }
      if (formData.minAge && formData.maxAge && formData.minAge > formData.maxAge) {
        setError('L\'âge minimum ne peut pas être supérieur à l\'âge maximum');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      // Construire les dates ISO
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDate = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      // Obtenir les coordonnées de la ville
      const coords = CITY_COORDS[formData.city];

      const eventData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        startDate,
        endDate,
        address: formData.address,
        city: formData.city,
        latitude: coords.lat,
        longitude: coords.lng,
        maxCapacity: formData.maxCapacity,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        isPublic: formData.isPublic,
        requiresApproval: formData.requiresApproval,
      };

      const response = await api.post<{ data: { id: string } }>('/events', eventData);
      
      // Rediriger vers l'événement créé
      router.push(`/events/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">Créer un événement</h1>
            <p className="text-gray-600">
              Organisez votre événement en quelques étapes simples
            </p>
          </div>

          {/* Progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      s <= step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        s < step ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Informations</span>
              <span>Date & Lieu</span>
              <span>Paramètres</span>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <div className="card p-8">
            {/* Étape 1 : Informations de base */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'événement *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Sortie vélo au Bois de Boulogne"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.title.length}/100 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre événement en détail..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/1000 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tags * (sélectionnez au moins un)
                  </label>
                  
                  {/* Tags sélectionnés */}
                  {formData.tags.length > 0 && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Tags sélectionnés :</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
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

                  {/* Tags populaires */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Tags populaires :</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          disabled={formData.tags.includes(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ajouter un tag personnalisé */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ou ajoutez un tag personnalisé :</p>
                    <form onSubmit={handleAddCustomTag} className="flex gap-2">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Ex: football, cuisine..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        maxLength={20}
                      />
                      <button
                        type="submit"
                        disabled={!customTag.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Ajouter
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Date et lieu */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <select
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
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: 15 Avenue Foch, 75016 Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Étape 3 : Paramètres */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité maximale *
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    min="2"
                    max="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Nombre maximum de participants
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge minimum (optionnel)
                    </label>
                    <input
                      type="number"
                      value={formData.minAge || ''}
                      onChange={(e) => setFormData({ ...formData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      max="100"
                      placeholder="Ex: 18"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge maximum (optionnel)
                    </label>
                    <input
                      type="number"
                      value={formData.maxAge || ''}
                      onChange={(e) => setFormData({ ...formData, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      max="100"
                      placeholder="Ex: 65"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="isPublic" className="ml-3">
                      <span className="font-medium text-gray-700">Événement public</span>
                      <p className="text-sm text-gray-500">
                        Visible par tous les utilisateurs
                      </p>
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="requiresApproval"
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                      className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="requiresApproval" className="ml-3">
                      <span className="font-medium text-gray-700">Approbation requise</span>
                      <p className="text-sm text-gray-500">
                        Vous devrez approuver chaque participant
                      </p>
                    </label>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                  <h3 className="font-semibold mb-4">Récapitulatif</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Titre :</span> {formData.title}</p>
                    <p><span className="text-gray-600">Tags :</span> {formData.tags.join(', ')}</p>
                    <p><span className="text-gray-600">Date :</span> {formData.startDate} à {formData.startTime}</p>
                    <p><span className="text-gray-600">Lieu :</span> {formData.city}</p>
                    <p><span className="text-gray-600">Capacité :</span> {formData.maxCapacity} personnes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary"
                >
                  Retour
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Création...' : 'Publier l\'événement'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const POPULAR_TAGS = [
  'sport', 'musique', 'culture', 'nature', 'gastronomie',
  'art', 'cinéma', 'danse', 'jeux', 'technologie',
  'lecture', 'photographie', 'randonnée', 'vélo', 'yoga'
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadEvent();
  }, [params.id, isAuthenticated]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/events/${params.id}`);
      const event = response.data?.event || response.data;

      // Populate form with existing data
      setTitle(event.title);
      setDescription(event.description);
      setSelectedTags(event.tags || []);
      
      // Parse dates
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
      
      setCity(event.city);
      setAddress(event.address);
      setMaxCapacity(event.maxCapacity);
      setMinAge(event.minAge || '');
      setMaxAge(event.maxAge || '');
      setIsPublic(event.isPublic);
      setRequiresApproval(event.requiresApproval);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim() || !description.trim()) {
      setError('Le titre et la description sont obligatoires');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Veuillez sélectionner au moins un tag');
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Veuillez renseigner les dates et heures');
      return;
    }

    if (!city.trim() || !address.trim()) {
      setError('Veuillez renseigner le lieu');
      return;
    }

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        setError('La date de fin doit être après la date de début');
        return;
      }

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        city: city.trim(),
        address: address.trim(),
        maxCapacity,
        minAge: minAge || undefined,
        maxAge: maxAge || undefined,
        isPublic,
        requiresApproval,
      };

      await api.put(`/events/${params.id}`, eventData);
      router.push(`/events/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'événement');
    }
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

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.push(`/events/${params.id}`)}
              className="text-gray-600 hover:text-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'événement
            </button>
          </div>

          <div className="card p-8">
            <h1 className="text-3xl mb-6">Modifier l'événement</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de base */}
              <div>
                <h2 className="text-xl mb-4">Informations de base</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'événement *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Sortie vélo au Bois de Boulogne"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Décrivez votre événement..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags * (sélectionnez au moins un)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {POPULAR_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                        className="input-field flex-1"
                        placeholder="Ajouter un tag personnalisé"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        className="btn-secondary"
                      >
                        Ajouter
                      </button>
                    </div>

                    {selectedTags.filter(tag => !POPULAR_TAGS.includes(tag)).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Tags personnalisés:</span>
                        {selectedTags
                          .filter(tag => !POPULAR_TAGS.includes(tag))
                          .map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date et lieu */}
              <div>
                <h2 className="text-xl mb-4">Date et lieu</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de début *
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="input-field"
                        required
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
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure de fin *
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Paris"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Bois de Boulogne, Paris"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Paramètres */}
              <div>
                <h2 className="text-xl mb-4">Paramètres</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre maximum de participants *
                    </label>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
                      min="2"
                      max="1000"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Âge minimum (optionnel)
                      </label>
                      <input
                        type="number"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value ? parseInt(e.target.value) : '')}
                        min="1"
                        max="120"
                        className="input-field"
                        placeholder="Ex: 18"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Âge maximum (optionnel)
                      </label>
                      <input
                        type="number"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value ? parseInt(e.target.value) : '')}
                        min="1"
                        max="120"
                        className="input-field"
                        placeholder="Ex: 65"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-700">Événement public</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requiresApproval}
                        onChange={(e) => setRequiresApproval(e.target.checked)}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-700">Approbation requise pour rejoindre</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/events/${params.id}`)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

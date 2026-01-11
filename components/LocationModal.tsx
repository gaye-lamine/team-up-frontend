'use client';

import { useState, useEffect } from 'react';
import { api, ApiResponse } from '@/lib/api';

interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface LocationModalProps {
  onLocationSet: (city: string) => void;
}

export default function LocationModal({ onLocationSet }: LocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [useGeolocation, setUseGeolocation] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà défini sa ville
    const savedCity = localStorage.getItem('userCity');
    if (!savedCity) {
      setIsOpen(true);
      loadCities();
      detectLocation();
    }
  }, []);

  const loadCities = async () => {
    try {
      const response = await api.get<ApiResponse<{ cities: City[] }>>('/geolocation/cities');
      const citiesData = response.data?.cities || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (err) {
      console.error('Erreur chargement villes:', err);
      // Fallback sur les villes par défaut
      setCities([
        { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, radius: 10 },
        { name: 'Dakar', country: 'Sénégal', latitude: 14.6928, longitude: -17.4467, radius: 10 },
        { name: 'Nice', country: 'France', latitude: 43.7102, longitude: 7.2620, radius: 20 },
        { name: 'Grasse', country: 'France', latitude: 43.6584, longitude: 6.9222, radius: 20 },
      ]);
    }
  };

  const detectLocation = async () => {
    try {
      const response = await api.get<any>('/geolocation/detect');
      const suggestedCity = response.data?.suggestedCity?.name || response.data?.city;
      if (suggestedCity) {
        setDetectedCity(suggestedCity);
        setSelectedCity(suggestedCity);
      }
    } catch (err) {
      console.error('Erreur détection localisation:', err);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCity) {
      alert('Veuillez sélectionner une ville');
      return;
    }

    setLoading(true);

    try {
      const city = cities.find(c => c.name === selectedCity);
      if (!city) return;

      await api.post('/geolocation/set-city', {
        cityName: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        enablePreciseLocation: useGeolocation,
      });

      localStorage.setItem('userCity', city.name);
      setIsOpen(false);
      onLocationSet(city.name);
    } catch (err) {
      console.error('Erreur définition ville:', err);
      alert('Erreur lors de la définition de la ville');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Définir Paris par défaut
    localStorage.setItem('userCity', 'Paris');
    setIsOpen(false);
    onLocationSet('Paris');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-3xl max-w-md w-full p-8 shadow-2xl animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📍</div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Bienvenue sur TeamUp !</h2>
          <p className="text-gray-600">
            Sélectionnez votre ville pour découvrir les événements près de chez vous
          </p>
        </div>

        {detectedCity && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Ville détectée :</span> {detectedCity}
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisissez votre ville *
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-modern"
            >
              <option value="">Sélectionnez une ville</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name} ({city.country})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start">
            <input
              id="useGeolocation"
              type="checkbox"
              checked={useGeolocation}
              onChange={(e) => setUseGeolocation(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="useGeolocation" className="ml-3 text-sm text-gray-700">
              Utiliser ma position précise pour trouver les événements les plus proches
              <span className="block text-xs text-gray-500 mt-1">
                (Optionnel - améliore la précision des résultats)
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedCity}
            className="btn-primary w-full"
          >
            {loading ? 'Confirmation...' : 'Confirmer'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Passer (Paris par défaut)
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Vous pourrez modifier votre ville à tout moment dans les paramètres
        </p>
      </div>
    </div>
  );
}

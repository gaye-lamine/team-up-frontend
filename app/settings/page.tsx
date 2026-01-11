'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, ApiResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCities();
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  const loadCities = async () => {
    try {
      const response = await api.get<ApiResponse<{ cities: City[] }>>('/geolocation/cities');
      const citiesData = response.data?.cities || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (err) {
      console.error('Erreur chargement villes:', err);
      setCities([
        { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, radius: 10 },
        { name: 'Dakar', country: 'Sénégal', latitude: 14.6928, longitude: -17.4467, radius: 10 },
        { name: 'Nice', country: 'France', latitude: 43.7102, longitude: 7.2620, radius: 20 },
        { name: 'Grasse', country: 'France', latitude: 43.6584, longitude: 6.9222, radius: 20 },
      ]);
    }
  };

  const handleSave = async () => {
    if (!selectedCity) {
      setError('Veuillez sélectionner une ville');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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
      setSuccess('Ville mise à jour avec succès !');

      setTimeout(() => {
        router.push('/events');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Paramètres</h1>
            <p className="text-gray-600">
              Gérez vos préférences de localisation
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="card p-8">
            <h2 className="text-2xl mb-6">Localisation</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre ville *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.country}) - Rayon {city.radius}km
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Les événements seront filtrés selon cette ville
                </p>
              </div>

              <div className="flex items-start">
                <input
                  id="useGeolocation"
                  type="checkbox"
                  checked={useGeolocation}
                  onChange={(e) => setUseGeolocation(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="useGeolocation" className="ml-3">
                  <span className="font-medium text-gray-700">
                    Utiliser ma position précise
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Améliore la précision des événements à proximité
                  </p>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  📍 Villes disponibles
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {cities.map((city) => (
                    <li key={city.name}>
                      • {city.name} ({city.country}) - Rayon de recherche : {city.radius}km
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !selectedCity}
                className="btn-primary w-full"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

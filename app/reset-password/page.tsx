'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Lien invalide ou expiré.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Les mots de passe ne correspondent pas.');
            setStatus('error');
            return;
        }

        if (!token) {
            setErrorMessage('Token manquant.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            await api.resetPassword(token, formData.password);
            setStatus('success');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setErrorMessage(err.message || 'Une erreur est survenue. Veuillez réessayer.');
            setStatus('error');
        }
    };

    return (
        <>
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl mb-2">Réinitialisation du mot de passe</h1>
                            <p className="text-gray-600">
                                Choisissez un nouveau mot de passe sécurisé.
                            </p>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-center">
                                <p className="font-medium">Mot de passe modifié !</p>
                                <p className="text-sm mt-1">
                                    Vous allez être redirigé vers la page de connexion...
                                </p>
                            </div>
                        ) : (
                            <>
                                {status === 'error' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                                        {errorMessage}
                                        {!token && (
                                            <div className="mt-2 text-sm">
                                                <Link href="/forgot-password" className="underline hover:text-red-800">
                                                    Demander un nouveau lien
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || !token}
                                        className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? 'Modification...' : 'Modifier le mot de passe'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

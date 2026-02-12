'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await api.forgotPassword(email);
            setStatus('success');
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
                            <h1 className="text-3xl mb-2">Mot de passe oublié ?</h1>
                            <p className="text-gray-600">
                                Entrez votre adresse email pour recevoir un lien de réinitialisation.
                            </p>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-center">
                                <p className="font-medium">Email envoyé !</p>
                                <p className="text-sm mt-1">
                                    Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.
                                </p>
                                <Link
                                    href="/login"
                                    className="block mt-4 text-primary hover:text-primary-dark font-medium"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        ) : (
                            <>
                                {status === 'error' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                                        {errorMessage}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="votre@email.com"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="btn-primary w-full text-lg"
                                    >
                                        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link
                                        href="/login"
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                    >
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

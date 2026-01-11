import { Event } from '@/lib/types';
import { useMemo } from 'react';

interface AddToCalendarProps {
    event: Event;
}

export default function AddToCalendar({ event }: AddToCalendarProps) {
    // Helpers
    const formatDateForCalendar = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const calendarUrls = useMemo(() => {
        const startDate = new Date(event.startDate).toISOString();
        const endDate = new Date(event.endDate).toISOString();
        const startCompact = formatDateForCalendar(event.startDate);
        const endCompact = formatDateForCalendar(event.endDate);

        const details = `${event.description}\n\nOrganisé par: ${event.organizer?.firstName || 'Equipe TeamUp'} ${event.organizer?.lastName || ''}`;
        const location = `${event.address}, ${event.city}`;

        return {
            google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startCompact}/${endCompact}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`,
            outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(details)}&startdt=${startDate}&enddt=${endDate}&location=${encodeURIComponent(location)}`
        };
    }, [event]);

    const downloadIcs = () => {
        const startCompact = formatDateForCalendar(event.startDate);
        const endCompact = formatDateForCalendar(event.endDate);
        const details = `${event.description}\\n\\nOrganisé par: ${event.organizer?.firstName || 'Equipe TeamUp'} ${event.organizer?.lastName || ''}`;

        const content = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${startCompact}`,
            `DTEND:${endCompact}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${details}`,
            `LOCATION:${event.address}, ${event.city}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card-premium p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl shadow-inner">
                    📅
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Ajouter au calendrier
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                    href={calendarUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Google</span>
                </a>

                <a
                    href={calendarUrls.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 17L1 7L9 1L9 23L1 17Z" fill="#2aa4f4" />
                        <path d="M9 23L9 1L23 5L23 19L9 23Z" fill="#0072c6" />
                        <path d="M9 22L9 2L22 5L22 19L9 22Z" fill="#188ad6" />
                        <path d="M22 19L22 5L10 2L10 22L22 19Z" fill="#188ad6" />
                        <path d="M10 2L22 5L22 19L10 22L10 2Z" fill="#0072c6" />
                        <path d="M4 16L6 16.5L8 16L8 8L6 7.5L4 8L4 16Z" fill="white" />
                        <path d="M5.5 14L5.5 10L6.5 10L6.5 13L7 13L7 14L5.5 14Z" fill="#0072c6" />
                        <path d="M14.5 14L14.5 10L15.5 10L15.5 13L16 13L16 14L14.5 14Z" fill="white" />
                    </svg>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Outlook</span>
                </a>

                <button
                    onClick={downloadIcs}
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 2V5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 9H21" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 8V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8Z" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <text x="7" y="17" fontSize="8" fontWeight="bold" fill="#1F2937" fontFamily="sans-serif">iCal</text>
                    </svg>
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Apple / iCal</span>
                </button>
            </div>
        </div>
    );
}

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
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                        alt="Google"
                        className="w-6 h-6 object-contain"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Google</span>
                </a>

                <a
                    href={calendarUrls.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                        alt="Outlook"
                        className="w-6 h-6 object-contain"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Outlook</span>
                </a>

                <button
                    onClick={downloadIcs}
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                    <span className="text-2xl leading-none">🍏</span>
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Apple / iCal</span>
                </button>
            </div>
        </div>
    );
}

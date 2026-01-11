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

            <div className="grid grid-cols-1 gap-2">
                <a
                    href={calendarUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5 w-full"
                >
                    <img
                        src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png"
                        alt="Google"
                        className="w-5 h-5 object-contain"
                    />
                    <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Google Calendar</span>
                </a>

                <a
                    href={calendarUrls.outlook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5 w-full"
                >
                    <img
                        src="https://res.cdn.office.net/assets/mail/pwa/v1/pngs/apple-touch-icon.png"
                        alt="Outlook"
                        className="w-5 h-5 object-contain"
                    />
                    <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Outlook / Office</span>
                </a>

                <button
                    onClick={downloadIcs}
                    className="group relative flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5 w-full"
                >
                    <span className="text-xl leading-none w-5 text-center">🍏</span>
                    <span className="font-semibold text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Apple / iCal</span>
                </button>
            </div>
        </div>
    );
}

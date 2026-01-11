import { Event } from '@/lib/types';

interface AddToCalendarProps {
    event: Event;
}

export default function AddToCalendar({ event }: AddToCalendarProps) {
    // Format helpers
    const formatDateForCalendar = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const getGoogleUrl = () => {
        const startDate = formatDateForCalendar(event.startDate);
        const endDate = formatDateForCalendar(event.endDate);
        const details = `${event.description}\n\nOrganisé par: ${event.organizer?.firstName} ${event.organizer?.lastName}`;

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.address + ', ' + event.city)}`;
    };

    const getOutlookUrl = () => {
        const startDate = new Date(event.startDate).toISOString();
        const endDate = new Date(event.endDate).toISOString();
        const details = `${event.description}\n\nOrganisé par: ${event.organizer?.firstName} ${event.organizer?.lastName}`;

        return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(details)}&startdt=${startDate}&enddt=${endDate}&location=${encodeURIComponent(event.address + ', ' + event.city)}`;
    };

    const downloadIcs = () => {
        const startDate = formatDateForCalendar(event.startDate);
        const endDate = formatDateForCalendar(event.endDate);
        const details = `${event.description}\\n\\nOrganisé par: ${event.organizer?.firstName} ${event.organizer?.lastName}`;

        const content = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
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
        <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span> Ajouter au calendrier
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                    href={getGoogleUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-5 h-5" />
                    <span className="font-medium">Google</span>
                </a>

                <a
                    href={getOutlookUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-5 h-5" />
                    <span className="font-medium">Outlook</span>
                </a>

                <button
                    onClick={downloadIcs}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                    <span className="text-xl">🍏</span>
                    <span className="font-medium">iCal / Apple</span>
                </button>
            </div>
        </div>
    );
}

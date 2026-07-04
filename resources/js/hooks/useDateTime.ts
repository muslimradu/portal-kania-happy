import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('id');

export function useDateTime() {
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        date: now.format('dddd, D MMMM YYYY'),
        time: now.format('HH:mm:ss'),
        dayjs,
    };
}
import { useEffect, useState } from 'react';
export function CalendarRails() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = (calendar: string) => new Intl.DateTimeFormat(`en-US-u-ca-${calendar}`, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(now);
  return <div aria-hidden="true" className="pointer-events-none hidden xl:block"><div className="calendar-rail calendar-rail-left"><span className="text-primary">ETH /</span> {date('ethiopic')} · {time}</div><div className="calendar-rail calendar-rail-right"><span className="text-primary">GREG /</span> {date('gregory')} · {time}</div></div>;
}

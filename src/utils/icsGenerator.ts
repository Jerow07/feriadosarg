import type { UpcomingHoliday, Holiday } from '../types';

export function downloadCalendar(holidays: Holiday[] | UpcomingHoliday[], filename: string = 'feriados_arg.ics') {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FeriadosArg//Jeromino Parra//ES\nCALSCALE:GREGORIAN\n";
  
  holidays.forEach(h => {
    let eventDate: Date;
    if ('date' in h) {
      eventDate = (h as UpcomingHoliday).date;
    } else {
      const [year, month, day] = h.fecha.split("-").map(Number);
      eventDate = new Date(year, month - 1, day);
    }
    
    // Formato requerido YYYYMMDD
    const yyyy = eventDate.getFullYear();
    const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
    const dd = String(eventDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    
    // Al ser un evento de todo un día (VALUE=DATE), DTEND debe ser exclusivo (el día siguiente al feriado)
    const endDateStr = `${yyyy}${mm}${String(eventDate.getDate() + 1).padStart(2, '0')}`;
    
    icsContent += "BEGIN:VEVENT\n";
    icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
    icsContent += `DTEND;VALUE=DATE:${endDateStr}\n`;
    icsContent += `SUMMARY:${h.nombre}\n`;
    if ('tipo' in h && h.tipo) {
      icsContent += `DESCRIPTION:Feriado ${h.tipo}\n`;
    }
    icsContent += "TRANSP:TRANSPARENT\n"; // Evita que se marque como "Ocupado" todo el día
    icsContent += "END:VEVENT\n";
  });
  
  icsContent += "END:VCALENDAR";
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar memoria
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

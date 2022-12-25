const ical = require('ical-generator')

// TODO: konstansok
exports.createCalendarEvent = (event, eventId) => {
  const calendar = ical({ name: event.title });
  calendar.createEvent({
    organizer: {
      name: 'Évgyűrű Alapítvány',
      email: 'info@evgyuru.hu'
    },
    start: event.dateFrom,
    end:event.dateTo,
    summary: event.title,
    description: event.title,
    location: `${event.city}, ${event.streetAddress}, ${event.zipCode}`,
    url: 'https://www.evgyuru.hu/'
  });
  const headers = {
    'x-invite': {
      prepared: true,
      value: eventId
    }
  }
  const icalEvent = {
    filename: 'invite.ics',
    method: 'PUBLISH',
    content: calendar.toString()
  }
  return { headers, icalEvent }
}
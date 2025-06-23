export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  price: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
}

export interface Attendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status: "confirmed" | "waitlist";
  userType: "participant" | "organizer";
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveEvent = (
  event: Omit<Event, "id" | "registered" | "createdAt">
) => {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: generateId(),
    registered: 0,
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));
  return newEvent;
};

export const getEvents = (): Event[] => {
  const events = localStorage.getItem("events");
  return events ? JSON.parse(events) : [];
};

export const getEventById = (id: string): Event | null => {
  const events = getEvents();
  return events.find((event) => event.id === id) || null;
};

export const getEventsByOrganizer = (organizerId: string): Event[] => {
  const events = getEvents();
  return events.filter((event) => event.organizerId === organizerId);
};

export const updateEvent = (id: string, updates: Partial<Event>) => {
  const events = getEvents();
  const index = events.findIndex((event) => event.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    localStorage.setItem("events", JSON.stringify(events));
    return events[index];
  }
  return null;
};

export const saveAttendee = (
  attendee: Omit<Attendee, "id" | "registrationDate">
) => {
  const attendees = getAttendees();
  const newAttendee: Attendee = {
    ...attendee,
    id: generateId(),
    registrationDate: new Date().toISOString(),
  };
  attendees.push(newAttendee);
  localStorage.setItem("attendees", JSON.stringify(attendees));

  const event = getEventById(attendee.eventId);
  if (event) {
    updateEvent(attendee.eventId, { registered: event.registered + 1 });
  }

  return newAttendee;
};

export const getAttendees = (): Attendee[] => {
  const attendees = localStorage.getItem("attendees");
  return attendees ? JSON.parse(attendees) : [];
};

export const getAttendeesByEvent = (eventId: string): Attendee[] => {
  const attendees = getAttendees();
  return attendees.filter((attendee) => attendee.eventId === eventId);
};

export const getAttendeesByUser = (userEmail: string): Attendee[] => {
  const attendees = getAttendees();
  return attendees.filter((attendee) => attendee.email === userEmail);
};

export const removeAttendee = (eventId: string, userEmail: string) => {
  const attendees = getAttendees();
  const filteredAttendees = attendees.filter(
    (attendee) =>
      !(attendee.eventId === eventId && attendee.email === userEmail)
  );
  localStorage.setItem("attendees", JSON.stringify(filteredAttendees));

  const event = getEventById(eventId);
  if (event && event.registered > 0) {
    updateEvent(eventId, { registered: event.registered - 1 });
  }
};

export const isUserRegistered = (
  eventId: string,
  userEmail: string
): boolean => {
  const attendees = getAttendeesByUser(userEmail);
  return attendees.some((attendee) => attendee.eventId === eventId);
};

export const initializeMockData = () => {
  const events = getEvents();
  if (events.length === 0) {
    const mockEvents: Omit<Event, "id" | "registered" | "createdAt">[] = [
      {
        title: "Workshop de React Avançado",
        description:
          "Aprenda técnicas avançadas de React com hooks customizados e otimização de performance.",
        date: "2024-02-15",
        time: "14:00",
        location: "Centro de Convenções - São Paulo",
        category: "tecnologia",
        capacity: 50,
        price: 0,
        organizerId: "mock-org-1",
        organizerName: "Tech Academy",
        organizerEmail: "contato@techacademy.com",
        status: "upcoming",
      },
      {
        title: "Palestra: Futuro da IA",
        description:
          "Discussão sobre as tendências e impactos da inteligência artificial no mercado.",
        date: "2024-02-20",
        time: "19:00",
        location: "Auditório Central - Rio de Janeiro",
        category: "tecnologia",
        capacity: 100,
        price: 0,
        organizerId: "mock-org-2",
        organizerName: "AI Institute",
        organizerEmail: "contato@aiinstitute.com",
        status: "upcoming",
      },
      {
        title: "Encontro de Empreendedores",
        description:
          "Networking e troca de experiências entre empreendedores de diversos setores.",
        date: "2024-02-25",
        time: "18:30",
        location: "Hub de Inovação - Belo Horizonte",
        category: "negocios",
        capacity: 80,
        price: 0,
        organizerId: "mock-org-3",
        organizerName: "Startup Hub",
        organizerEmail: "contato@startuphub.com",
        status: "upcoming",
      },
      {
        title: "Workshop de Design UX/UI",
        description:
          "Aprenda os fundamentos do design de experiência do usuário e interface.",
        date: "2024-03-01",
        time: "09:00",
        location: "Escola de Design - Porto Alegre",
        category: "design",
        capacity: 30,
        price: 0,
        organizerId: "mock-org-4",
        organizerName: "Design School",
        organizerEmail: "contato@designschool.com",
        status: "upcoming",
      },
    ];

    mockEvents.forEach((event) => {
      const savedEvent = saveEvent(event);
      const numAttendees = Math.floor(Math.random() * (event.capacity * 0.8));
      for (let i = 0; i < numAttendees; i++) {
        saveAttendee({
          eventId: savedEvent.id,
          name: `Participante ${i + 1}`,
          email: `participante${i + 1}@email.com`,
          phone: `(11) 9999${i.toString().padStart(4, "0")}`,
          status: i < numAttendees * 0.9 ? "confirmed" : "waitlist",
          userType: "participant",
        });
      }
    });
  }
};

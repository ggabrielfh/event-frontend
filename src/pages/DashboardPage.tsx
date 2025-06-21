"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Settings,
  Download,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  status: "upcoming" | "ongoing" | "completed";
}

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  status: "confirmed" | "waitlist";
}

export default function DashboardPage() {
  const [user, setUser] = useState({ name: "", email: "", type: "" });
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Carregar dados do usuário
    const userName = localStorage.getItem("userName") || "";
    const userEmail = localStorage.getItem("userEmail") || "";
    const userType = localStorage.getItem("userType") || "";

    setUser({ name: userName, email: userEmail, type: userType });

    // Simular eventos criados pelo usuário (se for organizador)
    if (userType === "organizer") {
      const mockMyEvents: Event[] = [
        {
          id: "my1",
          title: "Workshop de React Avançado",
          description: "Aprenda técnicas avançadas de React",
          date: "2024-02-15",
          time: "14:00",
          location: "Centro de Convenções - São Paulo",
          category: "tecnologia",
          capacity: 50,
          registered: 32,
          status: "upcoming",
        },
        {
          id: "my2",
          title: "Meetup de JavaScript",
          description: "Discussão sobre as novidades do JS",
          date: "2024-01-20",
          time: "19:00",
          location: "Coworking Tech - São Paulo",
          category: "tecnologia",
          capacity: 30,
          registered: 28,
          status: "completed",
        },
      ];
      setMyEvents(mockMyEvents);
    }

    // Simular inscrições do usuário
    const mockRegistrations: Registration[] = [
      {
        id: "reg1",
        eventId: "2",
        eventTitle: "Palestra: Futuro da IA",
        eventDate: "2024-02-20",
        eventTime: "19:00",
        eventLocation: "Auditório Central - Rio de Janeiro",
        status: "confirmed",
      },
      {
        id: "reg2",
        eventId: "3",
        eventTitle: "Encontro de Empreendedores",
        eventDate: "2024-02-25",
        eventTime: "18:30",
        eventLocation: "Hub de Inovação - Belo Horizonte",
        status: "confirmed",
      },
    ];
    setMyRegistrations(mockRegistrations);
  }, [navigate]);

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      confirmed: "bg-green-100 text-green-800",
      waitlist: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const exportAttendees = (eventId: string) => {
    // Simular exportação CSV
    const csvContent =
      "Nome,Email,Data de Inscrição\nJoão Silva,joao@email.com,2024-01-15\nMaria Santos,maria@email.com,2024-01-16";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-evento-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              EventHub
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost">Explorar Eventos</Button>
              </Link>
              <Link to="/create-event">
                <Button variant="ghost">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Evento
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user.name}!
          </h1>
          <p className="text-gray-600">
            Gerencie seus eventos e inscrições em um só lugar.
          </p>
        </div>

        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="registrations">Minhas Inscrições</TabsTrigger>
            {user.type === "organizer" && (
              <TabsTrigger value="events">Meus Eventos</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Eventos Inscritos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(registration.status)}>
                        {registration.status === "confirmed"
                          ? "Confirmado"
                          : "Lista de espera"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {registration.eventTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(registration.eventDate).toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        às {registration.eventTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {registration.eventLocation}
                      </div>
                    </div>
                    <Link to={`/event/${registration.eventId}`}>
                      <Button size="sm" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myRegistrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  Você ainda não se inscreveu em nenhum evento.
                </p>
                <Link to="/">
                  <Button>Explorar Eventos</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {user.type === "organizer" && (
            <TabsContent value="events" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Eventos Organizados</h2>
                <Link to="/create-event">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === "upcoming"
                            ? "Próximo"
                            : event.status === "ongoing"
                            ? "Em andamento"
                            : "Concluído"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.date).toLocaleDateString(
                            "pt-BR"
                          )} às {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {event.registered}/{event.capacity} inscritos
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => exportAttendees(event.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                        <Link to={`/event/${event.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {myEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    Você ainda não criou nenhum evento.
                  </p>
                  <Link to="/create-event">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Evento
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

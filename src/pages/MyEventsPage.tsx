"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Eye,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, type Event } from "@/utils/apiService";
import { useAuth } from "@/contexts/AuthContext";

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadMyEvents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const myEvents = await apiService.getEventsByOrganizer();
      setEvents(myEvents);
    } catch (err) {
      console.error("Failed to fetch organizer events:", err);
      setError("Erro ao carregar seus eventos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const searchMyEvents = async (term: string) => {
    if (!term.trim()) {
      loadMyEvents();
      return;
    }

    try {
      setIsSearching(true);
      setError("");
      // Use the global search API, then filter to only show organizer's events
      const searchResults = await apiService.searchEvents(term);
      const myEvents = await apiService.getEventsByOrganizer();
      const myEventIds = new Set(myEvents.map((event) => event.id));
      const filteredResults = searchResults.filter((event) =>
        myEventIds.has(event.id)
      );
      setEvents(filteredResults);
    } catch (err) {
      console.error("Failed to search organizer events:", err);
      setError("Erro ao buscar seus eventos. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadMyEvents();
  }, [isAuthenticated, navigate]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMyEvents(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter by category locally
  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter(
          (event) =>
            event.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const getCategoryColor = (category: string) => {
    const colors = {
      tecnologia: "bg-blue-100 text-blue-800",
      negocios: "bg-green-100 text-green-800",
      design: "bg-purple-100 text-purple-800",
      educacao: "bg-orange-100 text-orange-800",
      saude: "bg-red-100 text-red-800",
      arte: "bg-pink-100 text-pink-800",
      esporte: "bg-indigo-100 text-indigo-800",
      outros: "bg-gray-100 text-gray-800",
    };
    return (
      colors[category.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const attendeesCount = event.attendees?.length || 0;
    const registrationPercentage = (attendeesCount / event.limit) * 100;

    if (eventDate < now) {
      return { text: "Finalizado", color: "bg-gray-100 text-gray-800" };
    } else if (registrationPercentage >= 100) {
      return { text: "Lotado", color: "bg-red-100 text-red-800" };
    } else if (registrationPercentage >= 80) {
      return { text: "Quase Lotado", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { text: "Disponível", color: "bg-green-100 text-green-800" };
    }
  };

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "negocios", label: "Negócios" },
    { value: "design", label: "Design" },
    { value: "educacao", label: "Educação" },
    { value: "saude", label: "Saúde" },
    { value: "arte", label: "Arte" },
    { value: "esporte", label: "Esporte" },
    { value: "outros", label: "Outros" },
  ];

  if (isLoading && !isSearching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              EventHub
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost">Explorar Eventos</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Eventos</h1>
              <p className="text-gray-600 mt-2">
                Gerencie os eventos que você organizou
              </p>
            </div>
            <Link to="/create-event">
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-sm text-gray-600">Total de Eventos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {events.filter((e) => new Date(e.date) > new Date()).length}
                </div>
                <div className="text-sm text-gray-600">Eventos Futuros</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {events.reduce(
                    (total, event) => total + (event.attendees?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total de Inscritos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    events.length > 0
                      ? events.reduce(
                          (total, event) =>
                            total + (event.attendees?.length || 0),
                          0
                        ) / events.length
                      : 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Média por Evento</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar eventos por nome, descrição ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "Nenhum evento encontrado"
                    : "Você ainda não criou nenhum evento"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando seu primeiro evento e organize experiências incríveis!"}
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <Link to="/create-event">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Evento
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <Card
                  key={event.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <Badge className={status.color}>{status.text}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {event.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees?.length || 0}/{event.limit} inscritos
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex gap-2">
                      <Link to={`/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link
                        to={`/events/${event.id}/attendees`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-1" />
                          Gerenciar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

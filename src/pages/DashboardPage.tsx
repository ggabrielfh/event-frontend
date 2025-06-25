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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Plus, Search, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, type Event } from "@/utils/apiService";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const userEvents = await apiService.getEventsByUser();
      setMyEvents(userEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadEvents();
  }, [navigate, isAuthenticated]);

  const searchEvents = async (term: string) => {
    if (!term.trim()) {
      loadEvents();
      return;
    }

    try {
      setIsSearching(true);
      // Use the global search API, then filter to only show user's registered events
      const searchResults = await apiService.searchEvents(term);
      const userEvents = await apiService.getEventsByUser();
      const userEventIds = new Set(userEvents.map((event) => event.id));
      const filteredResults = searchResults.filter((event) =>
        userEventIds.has(event.id)
      );
      setMyEvents(filteredResults);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEvents(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter by category locally after search
  const filteredEvents =
    categoryFilter === "all"
      ? myEvents
      : myEvents.filter((event) => event.category === categoryFilter);

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

  const getEventStatus = (limit: number, attendeesCount: number) => {
    const percentage = (attendeesCount / limit) * 100;
    if (percentage >= 100) return { text: "Inscrito", color: "text-green-600" };
    if (percentage >= 80) return { text: "Inscrito", color: "text-green-600" };
    return { text: "Inscrito", color: "text-green-600" };
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando eventos...</p>
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
              <Link to="/">
                <Button variant="ghost">Explorar Eventos</Button>
              </Link>
              <Link to="/create-event">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Evento
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Minhas Inscrições</h2>
          <p className="text-xl mb-6 opacity-90">
            Acompanhe todos os eventos em que você se inscreveu
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              <Search className="w-4 h-4 mr-2" />
              Explorar Mais Eventos
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={
                isSearching ? "Buscando..." : "Buscar nas suas inscrições..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="negocios">Negócios</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="arte">Arte e Cultura</SelectItem>
                <SelectItem value="esporte">Esporte</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 && !isLoading ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || categoryFilter !== "all"
                      ? "Nenhum evento encontrado"
                      : "Você ainda não se inscreveu em nenhum evento"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || categoryFilter !== "all"
                      ? "Tente ajustar os filtros de busca."
                      : "Explore eventos interessantes e faça sua primeira inscrição."}
                  </p>
                  {!searchTerm && categoryFilter === "all" && (
                    <Link to="/">
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Explorar Eventos
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const eventStatus = getEventStatus(
                event.limit,
                event.attendees.length
              );
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
                      <span
                        className={`text-sm font-medium ${eventStatus.color}`}
                      >
                        {eventStatus.text}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees.length}/{event.limit} inscritos
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <Link to={`/event/${event.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

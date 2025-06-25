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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService, type Event } from "@/utils/apiService";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const allEvents = await apiService.getAllEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchEvents = async (term: string) => {
    if (!term.trim()) {
      loadEvents();
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await apiService.searchEvents(term);
      setEvents(searchResults);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
      ? events
      : events.filter((event) => event.category === categoryFilter);

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

  const getAvailabilityStatus = (limit: number, attendeesCount: number) => {
    const percentage = (attendeesCount / limit) * 100;
    if (percentage >= 100) return { text: "Lotado", color: "text-red-600" };
    if (percentage >= 80)
      return { text: "Poucas vagas", color: "text-orange-600" };
    return { text: "Vagas disponíveis", color: "text-green-600" };
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EventHub</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/create-event">
                    <Button variant="ghost">Criar Evento</Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Entrar</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Cadastrar</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Descubra e Participe dos Melhores Eventos
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Conecte-se com pessoas, aprenda coisas novas e expanda seus
            horizontes
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Comece Agora
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
          {isLoading || isSearching ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">
                {isLoading ? "Carregando eventos..." : "Buscando eventos..."}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const attendeesCount = event.attendees?.length || 0;
              const availability = getAvailabilityStatus(
                event.limit,
                attendeesCount
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
                        className={`text-sm font-medium ${availability.color}`}
                      >
                        {availability.text}
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
                        {attendeesCount}/{event.limit} inscritos
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Evento #{event.id.slice(0, 8)}
                      </span>
                      <Link to={`/event/${event.id}`}>
                        <Button size="sm">Ver Detalhes</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum evento encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

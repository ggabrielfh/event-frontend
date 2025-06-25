"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Users, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiService, type Event } from "@/utils/apiService";
import { useAuth } from "@/contexts/AuthContext";

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError("");
        const eventData = await apiService.getEventById(id);
        setEvent(eventData);

        // Check if user is registered to this event
        if (isAuthenticated && user) {
          setIsRegistered(eventData.attendees.includes(user.id));
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Erro ao carregar o evento. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated, user]);

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      setMessage("Você precisa fazer login para se inscrever no evento.");
      return;
    }

    if (!event || !id) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await apiService.registerToEvent(id);
      setMessage("Inscrição realizada com sucesso!");
      setIsRegistered(true);

      // Refresh event data to get updated attendees list
      const updatedEvent = await apiService.getEventById(id);
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        "Erro ao realizar inscrição. Verifique se há vagas disponíveis."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getAvailabilityStatus = () => {
    if (!event) return { text: "", color: "" };

    const registered = event.attendees.length;
    const capacity = event.limit;
    const percentage = (registered / capacity) * 100;

    if (percentage >= 100)
      return { text: "Evento Lotado", color: "text-red-600" };
    if (percentage >= 80)
      return { text: "Poucas Vagas Restantes", color: "text-orange-600" };
    return { text: "Vagas Disponíveis", color: "text-green-600" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            {error || "Evento não encontrado"}
          </h2>
          <Link to="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              EventHub
            </Link>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
                <span className={`font-medium ${availability.color}`}>
                  {availability.text}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description
                    .split("\n")
                    .map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraph || `empty-${paragraphIndex}`}
                        className="mb-4 text-gray-700 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Organizador</p>
                    <p className="text-sm text-gray-600">
                      ID: {event.organizer_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                  <p className="leading-relaxed">{event.location}</p>
                </div>

                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <p>
                    {event.attendees.length}/{event.limit} inscritos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {message && (
                  <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-600">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Faça login para se inscrever no evento
                    </p>
                    <Link to="/login" className="block">
                      <Button className="w-full">Fazer Login</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isRegistered ? (
                      <div className="text-center">
                        <Badge className="bg-green-100 text-green-800 mb-2">
                          Você está inscrito neste evento
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={handleRegistration}
                        disabled={
                          isSubmitting || event.attendees.length >= event.limit
                        }
                      >
                        {(() => {
                          if (isSubmitting) return "Inscrevendo...";
                          if (event.attendees.length >= event.limit)
                            return "Evento Lotado";
                          return "Inscrever-se";
                        })()}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

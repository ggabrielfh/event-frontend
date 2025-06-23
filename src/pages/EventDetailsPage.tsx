"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Users, Clock, DollarSign, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getEventById,
  saveAttendee,
  removeAttendee,
  isUserRegistered,
  getAttendeesByEvent,
  type Event,
} from "@/utils/eventStorage";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (id) {
      const eventData = getEventById(id);
      setEvent(eventData);

      if (loggedIn) {
        const userEmail = localStorage.getItem("userEmail") || "";
        setIsRegistered(isUserRegistered(id, userEmail));
      }
    }
  }, [id]);

  useEffect(() => {
    if (!event || !id) return;

    const userEmail = localStorage.getItem("userEmail") || "";
    const isOrganizer = event.organizerId === userEmail;

    if (isOrganizer) {
      const eventAttendees = getAttendeesByEvent(id);
      console.log("Event attendees:", eventAttendees);
    }
  }, [id, event]);

  const handleRegistration = async () => {
    if (!isLoggedIn) {
      setMessage("Você precisa fazer login para se inscrever no evento.");
      return;
    }

    if (!event) return;

    setIsLoading(true);
    setMessage("");

    setTimeout(() => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "";
        const userName = localStorage.getItem("userName") || "";

        if (event.registered >= event.capacity) {
          saveAttendee({
            eventId: event.id,
            name: userName,
            email: userEmail,
            status: "waitlist",
            userType: "participant",
          });
          setMessage("Evento lotado! Você foi adicionado à lista de espera.");
        } else {
          saveAttendee({
            eventId: event.id,
            name: userName,
            email: userEmail,
            status: "confirmed",
            userType: "participant",
          });
          setMessage("Inscrição realizada com sucesso!");
        }

        setIsRegistered(true);
        const updatedEvent = getEventById(event.id);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
      } catch (error) {
        setMessage("Erro ao realizar inscrição. Tente novamente.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCancelRegistration = async () => {
    if (!event) return;

    setIsLoading(true);
    setMessage("");

    setTimeout(() => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "";
        removeAttendee(event.id, userEmail);

        setMessage("Inscrição cancelada com sucesso.");
        setIsRegistered(false);

        const updatedEvent = getEventById(event.id);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
      } catch (error) {
        setMessage("Erro ao cancelar inscrição. Tente novamente.");
      }
      setIsLoading(false);
    }, 1000);
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
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getAvailabilityStatus = () => {
    if (!event) return { text: "", color: "" };

    const percentage = (event.registered / event.capacity) * 100;
    if (percentage >= 100)
      return { text: "Evento Lotado", color: "text-red-600" };
    if (percentage >= 80)
      return { text: "Poucas Vagas Restantes", color: "text-orange-600" };
    return { text: "Vagas Disponíveis", color: "text-green-600" };
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Evento não encontrado</h2>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              EventHub
            </Link>
            <nav className="flex items-center space-x-4">
              {isLoggedIn ? (
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
                {event.title}
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description.split("\n").map((paragraph, index) => (
                    <p
                      key={index}
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
                    <p className="font-medium text-gray-900">
                      {event.organizerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.organizerEmail}
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

                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-gray-400" />
                  <p>{event.time}</p>
                </div>

                <div className="flex items-start text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                  <p className="leading-relaxed">{event.location}</p>
                </div>

                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <p>
                    {event.registered}/{event.capacity} inscritos
                  </p>
                </div>

                {event.price > 0 && (
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="font-medium">R$ {event.price.toFixed(2)}</p>
                  </div>
                )}

                {event.price === 0 && (
                  <div className="flex items-center text-green-600">
                    <DollarSign className="w-5 h-5 mr-3" />
                    <p className="font-medium">Gratuito</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {message && (
                  <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {!isLoggedIn ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Faça login para se inscrever no evento
                    </p>
                    <Link to="/login" className="block">
                      <Button className="w-full">Fazer Login</Button>
                    </Link>
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        Você está inscrito
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelRegistration}
                      disabled={isLoading}
                    >
                      {isLoading ? "Cancelando..." : "Cancelar Inscrição"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleRegistration}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Inscrevendo..."
                      : event.registered >= event.capacity
                      ? "Entrar na Lista de Espera"
                      : "Inscrever-se"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

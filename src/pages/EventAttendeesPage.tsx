"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Download,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getEventById,
  getAttendeesByEvent,
  type Event,
  type Attendee,
} from "@/utils/eventStorage";

export default function EventAttendeesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (id) {
      const eventData = getEventById(id);
      setEvent(eventData);

      if (eventData) {
        const eventAttendees = getAttendeesByEvent(id);
        setAttendees(eventAttendees);
        setFilteredAttendees(eventAttendees);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = attendees.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAttendees(filtered);
    } else {
      setFilteredAttendees(attendees);
    }
  }, [attendees, searchTerm]);

  const getStatusColor = (status: string) => {
    return status === "confirmed"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (status: string) => {
    return status === "confirmed" ? "Confirmado" : "Lista de Espera";
  };

  const exportAttendees = () => {
    if (!event) return;

    const csvHeader = "Nome,Email,Telefone,Data de Inscrição,Status\n";
    const csvContent = filteredAttendees
      .map(
        (attendee) =>
          `${attendee.name},${attendee.email},${
            attendee.phone || ""
          },${new Date(attendee.registrationDate).toLocaleDateString(
            "pt-BR"
          )},${getStatusText(attendee.status)}`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${event.title
      .replace(/\s+/g, "-")
      .toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const confirmedAttendees = filteredAttendees.filter(
    (a) => a.status === "confirmed"
  );
  const waitlistAttendees = filteredAttendees.filter(
    (a) => a.status === "waitlist"
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Evento não encontrado</h2>
          <Link to="/dashboard">
            <Button>Voltar ao Dashboard</Button>
          </Link>
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
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString("pt-BR")} às{" "}
                {event.time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {event.registered}/{event.capacity} inscritos
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {confirmedAttendees.length}
                </div>
                <div className="text-sm text-gray-600">Confirmados</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {waitlistAttendees.length}
                </div>
                <div className="text-sm text-gray-600">Lista de Espera</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {filteredAttendees.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportAttendees} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Inscritos ({filteredAttendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAttendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(attendee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {attendee.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {attendee.email}
                      </div>
                      {attendee.phone && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {attendee.phone}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Inscrito em{" "}
                        {new Date(attendee.registrationDate).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(attendee.status)}>
                      {getStatusText(attendee.status)}
                    </Badge>
                  </div>
                </div>
              ))}

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? "Nenhum inscrito encontrado com esse termo."
                      : "Nenhum inscrito ainda."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

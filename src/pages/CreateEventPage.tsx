"use client";

import type React from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveEvent } from "@/utils/eventStorage";

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    price: "0",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.category ||
      !formData.capacity
    ) {
      setError("Por favor, preencha todos os campos obrigatórios");
      setIsLoading(false);
      return;
    }

    if (Number.parseInt(formData.capacity) <= 0) {
      setError("A capacidade deve ser maior que zero");
      setIsLoading(false);
      return;
    }

    const eventDate = new Date(`${formData.date}T${formData.time}`);
    if (eventDate <= new Date()) {
      setError("A data e hora do evento devem ser no futuro");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "";
        const userName = localStorage.getItem("userName") || "";

        console.log("Debug - Creating event with organizerId:", userEmail);
        console.log("Debug - userName:", userName);

        const now = new Date();
        const eventDateTime = new Date(`${formData.date}T${formData.time}`);
        let status: "upcoming" | "ongoing" | "completed" = "upcoming";

        if (eventDateTime < now) {
          status = "completed";
        } else if (
          Math.abs(eventDateTime.getTime() - now.getTime()) <
          24 * 60 * 60 * 1000
        ) {
          status = "ongoing";
        }

        const newEvent = saveEvent({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          category: formData.category,
          capacity: Number.parseInt(formData.capacity),
          price: Number.parseFloat(formData.price),
          organizerId: userEmail,
          organizerName: userName,
          organizerEmail: userEmail,
          status,
        });

        console.log("Debug - Event created:", newEvent);

        // Verificar se o evento foi realmente salvo
        const allEvents = JSON.parse(localStorage.getItem("events") || "[]");
        console.log("Debug - All events in storage:", allEvents);

        setSuccess("Evento criado com sucesso!");
        setIsLoading(false);

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Error creating event:", err);
        setError("Erro ao criar evento. Tente novamente.");
        setIsLoading(false);
      }
    }, 1000);
  };

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
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Novo Evento
          </h1>
          <p className="text-gray-600">
            Preencha as informações do seu evento para começar a receber
            inscrições.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
            <CardDescription>
              Forneça todos os detalhes necessários para que os participantes
              possam se inscrever.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Título do Evento *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Workshop de React Avançado"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o que os participantes podem esperar do evento..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10"
                      value={formData.time}
                      onChange={(e) =>
                        handleInputChange("time", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="location">Local *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      placeholder="Ex: Centro de Convenções - São Paulo"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Ex: 50"
                      className="pl-10"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange("capacity", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Deixe em 0 para eventos gratuitos
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link to="/dashboard">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Evento"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}

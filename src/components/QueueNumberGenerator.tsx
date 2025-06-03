
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueue, ServiceType } from "@/context/QueueContext";
import { CheckCircle, Ticket, User, FileText, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface QueueNumberGeneratorProps {
  showTitle?: boolean;
}

const QueueNumberGenerator: React.FC<QueueNumberGeneratorProps> = ({ showTitle = true }) => {
  const { services, addToQueue, getEstimatedWaitTime, getTicketById } = useQueue();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [priority, setPriority] = useState<"normal" | "urgent" | "vip">("normal");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerateTicket = async (serviceId: string) => {
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Nama pelanggan harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSelectedService(serviceId);
    
    try {
      const number = addToQueue(serviceId, customerName.trim(), purpose.trim(), priority);
      setTicketNumber(number);
      
      // Find the ticket ID to display full details
      const tickets = JSON.parse(localStorage.getItem('queueData') || '[]');
      const newTicket = tickets.find((t: any) => t.number === number);
      if (newTicket) {
        setTicketId(newTicket.id);
      }
      
      toast({
        title: "Tiket Berhasil Dibuat",
        description: `Nomor antrian Anda adalah ${number}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat tiket. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTicket = () => {
    setSelectedService(null);
    setTicketNumber(null);
    setTicketId(null);
    setCustomerName("");
    setPurpose("");
    setPriority("normal");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "vip": return "text-purple-600 bg-purple-100";
      case "urgent": return "text-red-600 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "vip": return "VIP";
      case "urgent": return "Mendesak";
      default: return "Normal";
    }
  };

  if (ticketNumber && ticketId) {
    const ticket = getTicketById(ticketId);
    const service = services.find(s => s.id === selectedService);
    const estimatedWait = getEstimatedWaitTime(selectedService!);

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center bg-green-50">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Tiket Berhasil Dibuat!</CardTitle>
          <CardDescription>
            Tiket antrian Anda telah berhasil dibuat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Ticket Number */}
          <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-1">Nomor Antrian</div>
            <div className="text-4xl font-bold text-primary">{ticketNumber}</div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Nama:</span>
              <span className="font-medium">{ticket?.customerName || 'Tidak ada'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Ticket className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Layanan:</span>
              <span className="font-medium">{service?.name}</span>
            </div>

            {ticket?.purpose && (
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">Keperluan:</span>
                <span className="font-medium flex-1">{ticket.purpose}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Prioritas:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority || 'normal')}`}>
                {getPriorityText(ticket?.priority || 'normal')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Estimasi Tunggu:</span>
              <span className="font-medium">{estimatedWait} menit</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Waktu Ambil:</span>
              <span className="font-medium">
                {ticket?.timestamp ? new Intl.DateTimeFormat('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }).format(new Date(ticket.timestamp)) : '-'}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Instruksi:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Simpan tiket ini sebagai bukti</li>
              <li>• Tunggu nomor Anda dipanggil di display</li>
              <li>• Perhatikan counter yang memanggil</li>
              <li>• Datang ke counter saat dipanggil</li>
            </ul>
          </div>

          <Button 
            onClick={handleNewTicket} 
            className="w-full"
            variant="outline"
          >
            Ambil Tiket Baru
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle className="flex items-center">
              <Ticket className="mr-2 h-5 w-5" />
              Ambil Nomor Antrian
            </CardTitle>
            <CardDescription>
              Pilih layanan dan isi data untuk mengambil nomor antrian
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Nama Pelanggan *</Label>
          <Input
            id="customerName"
            placeholder="Masukkan nama lengkap"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <Label htmlFor="purpose">Keperluan (Opsional)</Label>
          <Textarea
            id="purpose"
            placeholder="Jelaskan keperluan Anda secara singkat"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Prioritas</Label>
          <Select value={priority} onValueChange={(value: "normal" | "urgent" | "vip") => setPriority(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Mendesak</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Selection */}
        <div className="space-y-3">
          <Label>Pilih Layanan:</Label>
          {services.map((service: ServiceType) => {
            const waitingCount = service.waiting;
            const estimatedWait = getEstimatedWaitTime(service.id);
            
            return (
              <Button
                key={service.id}
                onClick={() => handleGenerateTicket(service.id)}
                className="w-full h-auto p-4 flex flex-col items-start space-y-2"
                variant="outline"
                disabled={isLoading}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-left">{service.name}</span>
                  <span className="text-sm text-gray-500">
                    {service.prefix}xxx
                  </span>
                </div>
                <div className="flex justify-between items-center w-full text-sm text-gray-600">
                  <span>Antrian: {waitingCount}</span>
                  <span>~{estimatedWait} menit</span>
                </div>
              </Button>
            );
          })}
        </div>

        {isLoading && (
          <div className="text-center text-sm text-gray-500">
            Membuat tiket...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueNumberGenerator;


import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueue } from "@/context/QueueContext";
import QueueTicket from "./QueueTicket";
import { Search, MapPin, Clock, AlertCircle } from "lucide-react";

const TicketTracker: React.FC = () => {
  const { queue, getTicketPosition, services } = useQueue();
  const [ticketNumber, setTicketNumber] = useState("");
  const [trackedTicket, setTrackedTicket] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrackTicket = () => {
    setError("");
    
    if (!ticketNumber.trim()) {
      setError("Masukkan nomor tiket");
      return;
    }

    const ticket = queue.find(t => t.number.toLowerCase() === ticketNumber.toLowerCase().trim());
    
    if (!ticket) {
      setError("Tiket tidak ditemukan");
      setTrackedTicket(null);
      return;
    }

    setTrackedTicket(ticket);
  };

  const getQueueStatus = (ticket: any) => {
    const position = getTicketPosition(ticket.id);
    const service = services.find(s => s.id === ticket.serviceType);
    
    switch (ticket.status) {
      case "waiting":
        return {
          message: `Anda berada di posisi ${position} dalam antrian`,
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: "text-yellow-700",
          bgColor: "bg-yellow-50 border-yellow-200"
        };
      case "serving":
        return {
          message: `Sedang dilayani di Counter ${ticket.counterAssigned}`,
          icon: <MapPin className="h-5 w-5 text-green-500" />,
          color: "text-green-700",
          bgColor: "bg-green-50 border-green-200"
        };
      case "completed":
        return {
          message: "Layanan telah selesai",
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: "text-gray-700",
          bgColor: "bg-gray-50 border-gray-200"
        };
      default:
        return {
          message: "Status tidak diketahui",
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          color: "text-gray-700",
          bgColor: "bg-gray-50 border-gray-200"
        };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Lacak Tiket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <div className="flex space-x-2">
          <Input
            placeholder="Masukkan nomor tiket (mis: A001)"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTrackTicket()}
          />
          <Button onClick={handleTrackTicket}>
            Lacak
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Tracked Ticket */}
        {trackedTicket && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`p-4 border rounded-lg ${getQueueStatus(trackedTicket).bgColor}`}>
              <div className="flex items-center space-x-3">
                {getQueueStatus(trackedTicket).icon}
                <span className={`font-medium ${getQueueStatus(trackedTicket).color}`}>
                  {getQueueStatus(trackedTicket).message}
                </span>
              </div>
            </div>

            {/* Ticket Details */}
            <QueueTicket 
              ticket={trackedTicket} 
              showPosition={trackedTicket.status === "waiting"}
              showDetails={true}
            />

            {/* Additional Info for Waiting Tickets */}
            {trackedTicket.status === "waiting" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informasi Antrian:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Perkiraan waktu tunggu: {trackedTicket.estimatedWaitTime || 0} menit</li>
                  <li>• Tetap berada di area tunggu</li>
                  <li>• Perhatikan layar display untuk panggilan</li>
                  <li>• Refresh halaman ini untuk update terbaru</li>
                </ul>
              </div>
            )}

            {/* Clear Button */}
            <Button 
              variant="outline" 
              onClick={() => {
                setTrackedTicket(null);
                setTicketNumber("");
                setError("");
              }}
              className="w-full"
            >
              Lacak Tiket Lain
            </Button>
          </div>
        )}

        {/* Instructions */}
        {!trackedTicket && !error && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Masukkan nomor tiket untuk melacak status antrian</p>
            <p className="text-sm mt-2">Contoh: A001, D002</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketTracker;

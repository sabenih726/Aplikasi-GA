
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueue } from "@/context/QueueContext";
import QueueTicket from "./QueueTicket";
import { Search, History, Filter } from "lucide-react";

const TicketHistory: React.FC = () => {
  const { queue, services } = useQueue();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Filter tickets based on search and filters
  const filteredTickets = queue.filter(ticket => {
    const matchesSearch = 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.customerName && ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.purpose && ticket.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesService = serviceFilter === "all" || ticket.serviceType === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  // Sort tickets by timestamp (newest first)
  const sortedTickets = filteredTickets.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5" />
          Riwayat Tiket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nomor tiket, nama, atau keperluan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="waiting">Menunggu</SelectItem>
              <SelectItem value="serving">Sedang Dilayani</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Layanan</SelectItem>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Menampilkan {sortedTickets.length} dari {queue.length} tiket
        </div>

        {/* Tickets List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedTickets.length > 0 ? (
            sortedTickets.map(ticket => (
              <QueueTicket 
                key={ticket.id} 
                ticket={ticket} 
                showPosition={ticket.status === "waiting"}
                showDetails={true}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada tiket yang ditemukan</p>
              <p className="text-sm">Coba ubah filter pencarian Anda</p>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== "all" || serviceFilter !== "all") && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setServiceFilter("all");
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Hapus Semua Filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketHistory;

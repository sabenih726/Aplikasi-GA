
import { useQueue, QueueTicket as TicketType } from "@/context/QueueContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, User, FileText, AlertCircle, MapPin } from "lucide-react";

interface QueueTicketProps {
  ticket: TicketType;
  showPosition?: boolean;
  showDetails?: boolean;
}

const QueueTicket: React.FC<QueueTicketProps> = ({ 
  ticket, 
  showPosition = false, 
  showDetails = true 
}) => {
  const { getTicketPosition, services, counters } = useQueue();
  const position = showPosition ? getTicketPosition(ticket.id) : null;
  
  const service = services.find(s => s.id === ticket.serviceType);
  const assignedCounter = ticket.counterAssigned ? 
    counters.find(c => c.id === ticket.counterAssigned) : null;
  
  // Format timestamp to readable time
  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(ticket.timestamp));

  // Format called time if available
  const formattedCalledTime = ticket.calledAt ? 
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(ticket.calledAt)) : null;

  // Format completed time if available
  const formattedCompletedTime = ticket.completedAt ? 
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(ticket.completedAt)) : null;

  // Get priority styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "vip":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">VIP</Badge>;
      case "urgent":
        return <Badge variant="destructive">Mendesak</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  // Get status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case "serving":
        return <Badge variant="default" className="bg-green-100 text-green-800">Sedang Dilayani</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Selesai</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-primary text-white p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Ticket className="h-5 w-5" />
            <span className="font-semibold">{service?.name}</span>
            {ticket.priority !== "normal" && (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
          <div className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formattedTime}
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Ticket Number and Position */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-500 text-sm">Nomor Antrian</span>
              <div className="text-3xl font-bold text-primary">{ticket.number}</div>
            </div>
            {showPosition && position !== null && (
              <div className="text-right">
                <span className="text-gray-500 text-sm">Posisi</span>
                <div className="text-3xl font-bold text-primary">#{position}</div>
              </div>
            )}
          </div>

          {/* Status and Priority */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">Status:</span>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">Prioritas:</span>
              {getPriorityBadge(ticket.priority)}
            </div>
          </div>

          {/* Customer Details */}
          {showDetails && (
            <>
              {ticket.customerName && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Nama:</span>
                  <span className="font-medium">{ticket.customerName}</span>
                </div>
              )}

              {ticket.purpose && (
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">Keperluan:</span>
                  <span className="text-sm flex-1">{ticket.purpose}</span>
                </div>
              )}

              {/* Counter Assignment */}
              {ticket.status === "serving" && assignedCounter && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Counter:</span>
                  <span className="font-medium">{assignedCounter.name}</span>
                </div>
              )}

              {/* Estimated Wait Time */}
              {ticket.status === "waiting" && ticket.estimatedWaitTime !== undefined && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Estimasi tunggu:</span>
                  <span className="font-medium">{ticket.estimatedWaitTime} menit</span>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t pt-3 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Diambil:</span>
                  <span className="ml-2 font-medium">{formattedTime}</span>
                </div>
                
                {formattedCalledTime && (
                  <div className="text-sm">
                    <span className="text-gray-500">Dipanggil:</span>
                    <span className="ml-2 font-medium">{formattedCalledTime}</span>
                  </div>
                )}
                
                {formattedCompletedTime && (
                  <div className="text-sm">
                    <span className="text-gray-500">Selesai:</span>
                    <span className="ml-2 font-medium">{formattedCompletedTime}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {ticket.notes && (
                <div className="border-t pt-3">
                  <span className="text-sm text-gray-500">Catatan:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{ticket.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueTicket;

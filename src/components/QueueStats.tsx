
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueue } from "@/context/QueueContext";
import { Users, UserCheck, Clock, ClipboardCheck } from "lucide-react";

const QueueStats = () => {
  const { services, queue } = useQueue();
  
  const totalWaiting = queue.filter(ticket => ticket.status === "waiting").length;
  const totalServed = queue.filter(ticket => ticket.status === "completed").length;
  const totalInService = queue.filter(ticket => ticket.status === "serving").length;
  
  const averageWaitTime = () => {
    const completedTickets = queue.filter(ticket => ticket.status === "completed");
    if (completedTickets.length === 0) return "0 menit";
    
    // This is a mock calculation since we don't track actual service time
    // In a real app, we would calculate this from ticket timestamps
    return "5 menit";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Antrian Menunggu</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWaiting}</div>
          <p className="text-xs text-muted-foreground">
            Total pengunjung yang sedang menunggu
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Sedang Dilayani</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInService}</div>
          <p className="text-xs text-muted-foreground">
            Pengunjung yang sedang dilayani
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Waktu Rata-rata</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageWaitTime()}</div>
          <p className="text-xs text-muted-foreground">
            Waktu tunggu rata-rata
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Dilayani</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalServed}</div>
          <p className="text-xs text-muted-foreground">
            Total pengunjung yang telah dilayani hari ini
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueStats;


import { useQueue } from "@/context/QueueContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Clock, User, FileText, MapPin } from "lucide-react";

const QueueStatistics = () => {
  const { services, queue, counters } = useQueue();
  
  // Data untuk grafik pie distribusi layanan
  const pieData = services.map(service => ({
    name: service.name,
    value: service.served + service.waiting,
    color: getRandomColor(parseInt(service.id))
  }));
  
  // Total tiket yang sudah dilayani dan yang masih menunggu
  const totalServed = services.reduce((acc, service) => acc + service.served, 0);
  const totalWaiting = services.reduce((acc, service) => acc + service.waiting, 0);
  
  // Persentase tiket yang sudah dilayani
  const servedPercentage = totalServed + totalWaiting > 0 
    ? Math.round((totalServed / (totalServed + totalWaiting)) * 100) 
    : 0;

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case "serving":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Dilayani</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Selesai</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Tinggi</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  // Sort tickets by timestamp (newest first)
  const sortedTickets = [...queue].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tiket Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServed + totalWaiting}</div>
            <p className="text-xs text-muted-foreground">
              {totalServed} dilayani, {totalWaiting} menunggu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Persentase Dilayani</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servedPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {totalServed} dari {totalServed + totalWaiting} tiket
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loket Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {counters.filter(counter => counter.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari total {counters.length} loket
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribusi Layanan</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Data Tiket Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Nomor</TableHead>
                    <TableHead className="w-[120px]">Nama</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[80px]">Prioritas</TableHead>
                    <TableHead className="w-[100px]">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTickets.slice(0, 10).map((ticket) => {
                    const service = services.find(s => s.id === ticket.serviceType);
                    const counter = counters.find(c => c.id === ticket.counterAssigned);
                    const ticketTime = new Date(ticket.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{ticket.number}</span>
                            <span className="text-xs text-gray-500">{service?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{ticket.customerName || 'N/A'}</span>
                            {ticket.purpose && (
                              <span className="text-xs text-gray-500 truncate max-w-[100px]" title={ticket.purpose}>
                                {ticket.purpose}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(ticket.status)}
                            {ticket.status === "serving" && counter && (
                              <span className="text-xs text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {counter.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{ticketTime}</span>
                            {ticket.status === "waiting" && ticket.estimatedWaitTime && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {ticket.estimatedWaitTime}m
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {sortedTickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mb-2" />
                  <p className="text-sm">Belum ada tiket hari ini</p>
                </div>
              )}
              
              {sortedTickets.length > 10 && (
                <div className="p-3 text-center border-t bg-gray-50">
                  <span className="text-xs text-gray-600">
                    Menampilkan 10 dari {sortedTickets.length} tiket terbaru
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Fungsi helper untuk mendapatkan warna berdasarkan ID
const getRandomColor = (id: number) => {
  const colors = [
    "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", 
    "#10B981", "#F59E0B", "#EF4444", "#6366F1"
  ];
  return colors[id % colors.length];
};

export default QueueStatistics;

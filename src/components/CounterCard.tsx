
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueue, Counter } from "@/context/QueueContext";
import { UserCheck, UserX, Users } from "lucide-react";

interface CounterCardProps {
  counter: Counter;
}

const CounterCard: React.FC<CounterCardProps> = ({ counter }) => {
  const { services, setCounterStatus, setCounterService, callNext, completeService, queue } = useQueue();
  
  const handleStatusToggle = () => {
    setCounterStatus(counter.id, counter.status === "active" ? "inactive" : "active");
  };
  
  const handleServiceChange = (serviceId: string) => {
    setCounterService(counter.id, serviceId);
  };
  
  const handleCallNext = () => {
    if (counter.serviceType) {
      callNext(counter.id, counter.serviceType);
    }
  };
  
  const handleCompleteService = () => {
    if (counter.currentlyServing) {
      const ticket = queue.find(
        t => t.number === counter.currentlyServing && t.counterAssigned === counter.id
      );
      if (ticket) {
        completeService(ticket.id);
      }
    }
  };
  
  return (
    <Card className={`h-full ${counter.status === "inactive" ? "bg-gray-100" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{counter.name}</CardTitle>
          <Button
            variant={counter.status === "active" ? "default" : "outline"}
            size="sm"
            onClick={handleStatusToggle}
          >
            {counter.status === "active" ? (
              <UserCheck className="h-4 w-4 mr-2" />
            ) : (
              <UserX className="h-4 w-4 mr-2" />
            )}
            {counter.status === "active" ? "Aktif" : "Nonaktif"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {counter.status === "active" ? (
          <>
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Jenis Layanan</label>
              <Select
                value={counter.serviceType || ""}
                onValueChange={handleServiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih layanan" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Melayani Nomor:</span>
                <span className="font-medium">
                  {counter.currentlyServing || "-"}
                </span>
              </div>
              {counter.serviceType && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Antrian Menunggu:</span>
                  <span className="font-medium">
                    {services.find(s => s.id === counter.serviceType)?.waiting || 0}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                onClick={handleCallNext}
                disabled={!counter.serviceType || counter.currentlyServing !== null}
                variant="default"
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Panggil
              </Button>
              <Button
                onClick={handleCompleteService}
                disabled={counter.currentlyServing === null}
                variant="outline"
                className="w-full"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Selesai
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <UserX className="h-10 w-10 mb-2" />
            <p>Counter tidak aktif</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleStatusToggle}
            >
              Aktifkan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CounterCard;

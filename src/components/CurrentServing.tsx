
import { useQueue } from "@/context/QueueContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const CurrentServing = () => {
  const { counters } = useQueue();
  
  const activeCounters = counters.filter(counter => 
    counter.status === "active" && counter.currentlyServing
  );

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="text-center text-xl flex items-center justify-center">
          <Bell className="mr-2 h-5 w-5" />
          Sedang Dilayani
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activeCounters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0">
            {activeCounters.map((counter) => (
              <div 
                key={counter.id}
                className="p-4 text-center flex flex-col items-center justify-center"
              >
                <div className="text-4xl font-bold text-primary mb-1">
                  {counter.currentlyServing}
                </div>
                <div className="text-sm text-gray-500">{counter.name}</div>
              </div>
            ))}
            {/* Fill empty slots with placeholder if less than 4 active counters */}
            {Array.from({ length: Math.max(0, 4 - activeCounters.length) }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="p-4 text-center flex flex-col items-center justify-center"
              >
                <div className="text-4xl font-bold text-gray-200 mb-1">-</div>
                <div className="text-sm text-gray-300">Tidak Ada Panggilan</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada nomor antrian yang sedang dilayani</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentServing;

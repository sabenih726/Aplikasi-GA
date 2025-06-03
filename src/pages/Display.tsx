
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueue } from "@/context/QueueContext";
import { Card } from "@/components/ui/card";
import { Clock, ArrowLeft, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Display = () => {
  const { counters, services } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCalled, setLastCalled] = useState<string | null>(null);
  
  // Update the clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format the current date and time
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);
  
  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(currentTime);
  
  // Get active counters that are serving someone
  const activeCounters = counters.filter(
    counter => counter.status === "active" && counter.currentlyServing
  );
  
  // Watch for changes in counters to detect newly called numbers
  useEffect(() => {
    const currentServing = activeCounters.map(c => c.currentlyServing);
    const latestCalled = currentServing[currentServing.length - 1];
    
    if (latestCalled && latestCalled !== lastCalled) {
      setLastCalled(latestCalled);
      
      // Text-to-speech announcement
      if ('speechSynthesis' in window) {
        const counter = activeCounters[activeCounters.length - 1];
        const serviceName = counter.serviceType && 
          services.find(s => s.id === counter.serviceType)?.name;
        
        const announcement = `Nomor antrian ${latestCalled}, silakan menuju ke ${counter.name} untuk layanan ${serviceName || ''}`;
        const speech = new SpeechSynthesisUtterance(announcement);
        speech.lang = 'id-ID';
        window.speechSynthesis.speak(speech);
      }
    }
  }, [activeCounters, lastCalled, services]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4 text-white hover:text-white hover:bg-primary/90">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Display Antrian</h1>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <div>
              <div className="text-sm font-medium">{formattedDate}</div>
              <div className="text-lg font-bold">{formattedTime}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Last called number animation */}
          <AnimatePresence mode="wait">
            {lastCalled && (
              <motion.div
                key={lastCalled}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg border-2 border-primary text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Volume2 className="h-6 w-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">Nomor Terpanggil</h2>
                </div>
                <div className="text-6xl font-bold text-primary my-4">{lastCalled}</div>
                <div className="text-gray-600">
                  {activeCounters.length > 0 && 
                    activeCounters.find(c => c.currentlyServing === lastCalled)?.name}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-primary text-white p-4 text-center">
              <h2 className="text-2xl font-bold">NOMOR ANTRIAN YANG SEDANG DILAYANI</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
              {activeCounters.length > 0 ? (
                activeCounters.map((counter) => (
                  <motion.div
                    key={counter.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-lg shadow-md p-4 text-center"
                  >
                    <div className="text-gray-600 text-lg mb-2">{counter.name}</div>
                    <div className="text-5xl font-bold text-primary my-4">
                      {counter.currentlyServing}
                    </div>
                    <div className="text-sm text-gray-500">
                      {counter.serviceType && services.find(s => s.id === counter.serviceType)?.name}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  <p className="text-2xl">Tidak ada antrian yang sedang dilayani</p>
                </div>
              )}
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <motion.div key={service.id} whileHover={{ y: -5 }}>
                <Card className="overflow-hidden h-full">
                  <div className="bg-secondary p-3">
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Menunggu</div>
                    <div className="text-3xl font-bold">{service.waiting}</div>
                    <div className="mt-2 text-xs text-gray-400">
                      Sudah dilayani: {service.served || 0}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Display;

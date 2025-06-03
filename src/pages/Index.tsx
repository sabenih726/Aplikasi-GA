
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { LayoutDashboard, Monitor, Settings, LogOut, RefreshCw, Ticket, History } from "lucide-react";
import QueueNumberGenerator from "@/components/QueueNumberGenerator";
import CurrentServing from "@/components/CurrentServing";
import TicketHistory from "@/components/TicketHistory";
import TicketTracker from "@/components/TicketTracker";
import { useAuth } from "@/context/AuthContext";
import { useQueue } from "@/context/QueueContext";
import { useState, useEffect } from "react";

const Index = () => {
  const { isAdmin, logout } = useAuth();
  const { queue } = useQueue();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update last update time when queue changes
  useEffect(() => {
    setLastUpdate(new Date());
  }, [queue]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Flex container untuk gambar dan judul */}
          <div className="flex items-center space-x-4">
            {/* Gambar logo di pojok kiri */}
            <img
              src="/images/logo.png" // Pastikan gambar berada di folder public/images
              alt="Logo"
              className="header-logo" // Menggunakan kelas header-logo dari CSS
            />
            <h1 className="header-title">Sistem Antrian GA</h1>
          </div>

          {/* Sync indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>

          {/* Menu kanan */}
          <div className="flex space-x-2">
            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin-login">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/display">
                <Monitor className="mr-2 h-4 w-4" />
                Display
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <CurrentServing />
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Informasi</h2>
              <p className="text-gray-600 mb-4">
                Selamat datang di Sistem Antrian Divisi General Affairs. Silakan pilih layanan yang Anda butuhkan dan ambil nomor antrian.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Pastikan untuk memilih jenis layanan yang sesuai</li>
                <li>Tunggu sampai nomor Anda dipanggil di layar display</li>
                <li>Perhatikan nomor counter yang memanggil Anda</li>
                <li>Mohon untuk tidak meninggalkan area tunggu ketika menunggu</li>
              </ul>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{queue.filter(t => t.status === "waiting").length}</div>
                  <div className="text-sm text-blue-600">Menunggu</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{queue.filter(t => t.status === "serving").length}</div>
                  <div className="text-sm text-green-600">Dilayani</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Tabs defaultValue="new-ticket" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new-ticket" className="flex items-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  Ambil Tiket
                </TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  Lacak
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  Riwayat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="new-ticket">
                <QueueNumberGenerator />
              </TabsContent>
              
              <TabsContent value="tracker">
                <TicketTracker />
              </TabsContent>
              
              <TabsContent value="history">
                <TicketHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueue } from "@/context/QueueContext";
import CounterCard from "@/components/CounterCard";
import QueueStats from "@/components/QueueStats";
import ServiceSelection from "@/components/ServiceSelection";
import QueueStatistics from "@/components/QueueStatistics";
import { ArrowLeft, LogOut, LayoutDashboard, Activity, Users, Settings, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

const Admin = () => {
  const { isAdmin } = useAuth();
  const { 
    services, 
    counters, 
    queue, 
    callNext, 
    completeService, 
    setCounterStatus, 
    setCounterService,
    getAllWaitingTickets,
    clearAllData
  } = useQueue();

  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Update sync time when queue data changes
  useEffect(() => {
    setLastSyncTime(new Date());
  }, [queue, services, counters]);

  const { logout, getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();

  const handleResetData = () => {
    clearAllData();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-white shadow-sm h-screen fixed">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-primary">Panel Admin</h2>
            <p className="text-sm text-gray-500">Selamat datang, {getCurrentUser()}</p>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/admin">
                    <Activity className="mr-2 h-4 w-4" />
                    Statistik
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/admin">
                    <Users className="mr-2 h-4 w-4" />
                    Manajemen Counter
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-64">
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center md:hidden">
                <Button variant="ghost" size="sm" asChild className="mr-4">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Link>
                </Button>
                <h1 className="text-xl font-bold text-primary">Panel Admin</h1>
              </div>
               <div className="md:flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Panel Admin</h1>
            <div className="text-sm text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          </div>
              <div className="md:flex items-center space-x-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset Semua Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Semua Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus semua data antrian? Tindakan ini tidak dapat dibatalkan dan akan menghapus:
                        <br />• Semua nomor antrian
                        <br />• Status counter
                        <br />• Statistik layanan
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetData} className="bg-red-600 hover:bg-red-700">
                        Ya, Reset Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="statistics">Statistik</TabsTrigger>
                <TabsTrigger value="counters">Loket</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <QueueStats />
                <QueueStatistics />
              </TabsContent>

              <TabsContent value="statistics" className="space-y-6">
                <Card className="p-6">
                  <QueueStatistics />
                </Card>
              </TabsContent>

              <TabsContent value="counters" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Manajemen Counter</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {counters.map((counter) => (
                        <CounterCard key={counter.id} counter={counter} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Statistik Layanan</h2>
                    <ServiceSelection />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;
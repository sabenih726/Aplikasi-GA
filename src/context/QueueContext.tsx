
import React, { createContext, useContext, useState, useEffect } from "react";

// Service types
export type ServiceType = {
  id: string;
  name: string;
  prefix: string;
  currentNumber: number;
  served: number;
  waiting: number;
};

// Counter status
export type Counter = {
  id: number;
  name: string;
  status: "active" | "inactive";
  currentlyServing: string | null;
  serviceType: string | null;
};

// Queue ticket
export type QueueTicket = {
  id: string;
  number: string;
  serviceType: string;
  status: "waiting" | "serving" | "completed";
  timestamp: Date;
  counterAssigned?: number;
  customerName?: string;
  purpose?: string;
  priority: "normal" | "urgent" | "vip";
  estimatedWaitTime?: number;
  calledAt?: Date;
  completedAt?: Date;
  notes?: string;
};

type QueueContextType = {
  services: ServiceType[];
  counters: Counter[];
  queue: QueueTicket[];
  addToQueue: (serviceType: string, customerName?: string, purpose?: string, priority?: "normal" | "urgent" | "vip") => string;
  callNext: (counterId: number, serviceType: string) => QueueTicket | null;
  completeService: (ticketId: string, notes?: string) => void;
  setCounterStatus: (counterId: number, status: "active" | "inactive") => void;
  setCounterService: (counterId: number, serviceType: string | null) => void;
  getWaitingCount: (serviceType: string) => number;
  getTicketPosition: (ticketId: string) => number | null;
  getAllWaitingTickets: () => QueueTicket[];
  getServiceByPrefix: (prefix: string) => ServiceType | undefined;
  clearAllData: () => void;
  getTicketById: (ticketId: string) => QueueTicket | undefined;
  updateTicket: (ticketId: string, updates: Partial<QueueTicket>) => void;
  getEstimatedWaitTime: (serviceType: string) => number;
};

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or use defaults
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects for queue items
        if (key === 'queueData' && Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })) as T;
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  // Sync data across tabs using storage events
  const syncFromStorage = () => {
    const syncedServices = loadFromStorage('queueServices', [
      { id: "general", name: "Pelayanan Umum", prefix: "A", currentNumber: 0, served: 0, waiting: 0 },
      { id: "facility", name: "Fasilitas", prefix: "D", currentNumber: 0, served: 0, waiting: 0 },
    ]);
    const syncedCounters = loadFromStorage('queueCounters', [
      { id: 1, name: "Counter 1", status: "active" as const, currentlyServing: null, serviceType: null },
      { id: 2, name: "Counter 2", status: "active" as const, currentlyServing: null, serviceType: null },
      { id: 3, name: "Counter 3", status: "inactive" as const, currentlyServing: null, serviceType: null },
      { id: 4, name: "Counter 4", status: "inactive" as const, currentlyServing: null, serviceType: null },
    ]);
    const syncedQueue = loadFromStorage('queueData', []);

    setServices(syncedServices);
    setCounters(syncedCounters);
    setQueue(syncedQueue);
  };

  // Initial services
  const [services, setServices] = useState<ServiceType[]>(() =>
    loadFromStorage('queueServices', [
      { id: "general", name: "Pelayanan Umum", prefix: "A", currentNumber: 0, served: 0, waiting: 0 },
      { id: "facility", name: "Fasilitas", prefix: "D", currentNumber: 0, served: 0, waiting: 0 },
    ])
  );

  // Initial counters
  const [counters, setCounters] = useState<Counter[]>(() =>
    loadFromStorage('queueCounters', [
      { id: 1, name: "Counter 1", status: "active", currentlyServing: null, serviceType: null },
      { id: 2, name: "Counter 2", status: "active", currentlyServing: null, serviceType: null },
      { id: 3, name: "Counter 3", status: "inactive", currentlyServing: null, serviceType: null },
      { id: 4, name: "Counter 4", status: "inactive", currentlyServing: null, serviceType: null },
    ])
  );

  // Queue
  const [queue, setQueue] = useState<QueueTicket[]>(() =>
    loadFromStorage('queueData', [])
  );

  // Add storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'queueServices' || e.key === 'queueCounters' || e.key === 'queueData') {
        // Sync data when localStorage changes in another tab
        console.log('Storage changed in another tab, syncing...', e.key);
        syncFromStorage();
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for visibility change to sync when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became active, syncing data...');
        syncFromStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for focus events to sync when window regains focus
    const handleFocus = () => {
      console.log('Window focused, syncing data...');
      syncFromStorage();
    };

    window.addEventListener('focus', handleFocus);

    // Listen for custom queue data change events
    const handleQueueDataChange = (e: CustomEvent) => {
      console.log('Queue data changed:', e.detail);
      setTimeout(() => syncFromStorage(), 100); // Small delay to ensure data is written
    };

    window.addEventListener('queueDataChanged', handleQueueDataChange as EventListener);

    // Periodic sync every 5 seconds as fallback
    const intervalId = setInterval(() => {
      syncFromStorage();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('queueDataChanged', handleQueueDataChange as EventListener);
      clearInterval(intervalId);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('queueServices', JSON.stringify(services));
    // Trigger custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('queueDataChanged', { detail: { type: 'services' } }));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('queueCounters', JSON.stringify(counters));
    // Trigger custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('queueDataChanged', { detail: { type: 'counters' } }));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('queueData', JSON.stringify(queue));
    // Trigger custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('queueDataChanged', { detail: { type: 'queue' } }));
  }, [queue]);

  // Update service waiting counts
  useEffect(() => {
    const updatedServices = services.map(service => {
      const waitingCount = queue.filter(
        ticket => ticket.serviceType === service.id && ticket.status === "waiting"
      ).length;
      
      return { ...service, waiting: waitingCount };
    });
    
    setServices(updatedServices);
  }, [queue]);

  // Add new ticket to queue
  const addToQueue = (serviceType: string, customerName?: string, purpose?: string, priority: "normal" | "urgent" | "vip" = "normal"): string => {
    const service = services.find(s => s.id === serviceType);
    if (!service) return "";

    const newNumber = service.currentNumber + 1;
    const ticketNumber = `${service.prefix}${newNumber.toString().padStart(3, '0')}`;
    
    // Calculate estimated wait time
    const waitingCount = getWaitingCount(serviceType);
    const avgServiceTime = 5; // minutes per service (configurable)
    const estimatedWait = waitingCount * avgServiceTime;
    
    const newTicket: QueueTicket = {
      id: `${serviceType}-${Date.now()}`,
      number: ticketNumber,
      serviceType: serviceType,
      status: "waiting",
      timestamp: new Date(),
      customerName,
      purpose,
      priority,
      estimatedWaitTime: estimatedWait,
    };
    
    // Sort by priority: vip > urgent > normal, then by timestamp
    setQueue(prev => {
      const newQueue = [...prev, newTicket];
      return newQueue.sort((a, b) => {
        if (a.status !== "waiting" || b.status !== "waiting") return 0;
        
        const priorityOrder = { vip: 3, urgent: 2, normal: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
    });
    
    // Update the service's current number
    setServices(prev => 
      prev.map(s => s.id === serviceType ? { ...s, currentNumber: newNumber } : s)
    );
    
    return ticketNumber;
  };

  // Call next ticket for counter
  const callNext = (counterId: number, serviceType: string): QueueTicket | null => {
    const nextTicket = queue.find(
      ticket => ticket.serviceType === serviceType && ticket.status === "waiting"
    );
    
    if (!nextTicket) return null;
    
    // Update ticket status
    setQueue(prev => 
      prev.map(ticket => 
        ticket.id === nextTicket.id 
          ? { ...ticket, status: "serving", counterAssigned: counterId, calledAt: new Date() } 
          : ticket
      )
    );
    
    // Update counter
    setCounters(prev => 
      prev.map(counter => 
        counter.id === counterId 
          ? { ...counter, currentlyServing: nextTicket.number } 
          : counter
      )
    );
    
    // Update service statistics
    setServices(prev => 
      prev.map(service => 
        service.id === serviceType
          ? { ...service, served: service.served + 1 }
          : service
      )
    );
    
    return nextTicket;
  };

  // Complete current service at counter
  const completeService = (ticketId: string, notes?: string) => {
    const ticket = queue.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== "serving") return;

    // Update ticket
    setQueue(prev => 
      prev.map(t => 
        t.id === ticketId ? { ...t, status: "completed", completedAt: new Date(), notes } : t
      )
    );

    // Update counter
    if (ticket.counterAssigned) {
      setCounters(prev => 
        prev.map(counter => 
          counter.id === ticket.counterAssigned 
            ? { ...counter, currentlyServing: null } 
            : counter
        )
      );
    }
  };

  // Set counter status (active/inactive)
  const setCounterStatus = (counterId: number, status: "active" | "inactive") => {
    setCounters(prev => 
      prev.map(counter => 
        counter.id === counterId ? { ...counter, status } : counter
      )
    );
  };

  // Set counter service type
  const setCounterService = (counterId: number, serviceType: string | null) => {
    setCounters(prev => 
      prev.map(counter => 
        counter.id === counterId ? { ...counter, serviceType } : counter
      )
    );
  };

  // Get waiting count for a service
  const getWaitingCount = (serviceType: string): number => {
    return queue.filter(
      ticket => ticket.serviceType === serviceType && ticket.status === "waiting"
    ).length;
  };

  // Get position in queue
  const getTicketPosition = (ticketId: string): number | null => {
    const ticket = queue.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== "waiting") return null;
    
    const waitingTickets = queue.filter(
      t => t.serviceType === ticket.serviceType && t.status === "waiting"
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return waitingTickets.findIndex(t => t.id === ticketId) + 1;
  };

  // Get all waiting tickets
  const getAllWaitingTickets = (): QueueTicket[] => {
    return queue.filter(ticket => ticket.status === "waiting")
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  // Get service by prefix
  const getServiceByPrefix = (prefix: string): ServiceType | undefined => {
    return services.find(service => service.prefix === prefix);
  };

  // Get ticket by ID
  const getTicketById = (ticketId: string): QueueTicket | undefined => {
    return queue.find(ticket => ticket.id === ticketId);
  };

  // Update ticket
  const updateTicket = (ticketId: string, updates: Partial<QueueTicket>) => {
    setQueue(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      )
    );
  };

  // Get estimated wait time for service
  const getEstimatedWaitTime = (serviceType: string): number => {
    const waitingCount = getWaitingCount(serviceType);
    const avgServiceTime = 5; // minutes per service
    return waitingCount * avgServiceTime;
  };

  // Clear all data (for admin reset)
  const clearAllData = () => {
    const initialServices = [
      { id: "general", name: "Pelayanan Umum", prefix: "A", currentNumber: 0, served: 0, waiting: 0 },
      { id: "facility", name: "Fasilitas", prefix: "D", currentNumber: 0, served: 0, waiting: 0 },
    ];
    const initialCounters = [
      { id: 1, name: "Counter 1", status: "active" as const, currentlyServing: null, serviceType: null },
      { id: 2, name: "Counter 2", status: "active" as const, currentlyServing: null, serviceType: null },
      { id: 3, name: "Counter 3", status: "inactive" as const, currentlyServing: null, serviceType: null },
      { id: 4, name: "Counter 4", status: "inactive" as const, currentlyServing: null, serviceType: null },
    ];

    setServices(initialServices);
    setCounters(initialCounters);
    setQueue([]);
    
    // Clear localStorage
    localStorage.removeItem('queueServices');
    localStorage.removeItem('queueCounters');
    localStorage.removeItem('queueData');
  };

  const value = {
    services,
    counters,
    queue,
    addToQueue,
    callNext,
    completeService,
    setCounterStatus,
    setCounterService,
    getWaitingCount,
    getTicketPosition,
    getAllWaitingTickets,
    getServiceByPrefix,
    clearAllData,
    getTicketById,
    updateTicket,
    getEstimatedWaitTime
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};

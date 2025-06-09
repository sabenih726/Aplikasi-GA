// src/hooks/useTickets.ts
import { useState, useEffect, useCallback } from 'react';
import { ticketService, Ticket } from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tickets with real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Setup real-time listener
    const unsubscribe = ticketService.onTicketsChange((updatedTickets) => {
      setTickets(updatedTickets);
      setLoading(false);
      setError(null);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const createTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      await ticketService.createTicket(ticketData);
      // Real-time listener will automatically update the tickets list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      await ticketService.updateTicket(ticketId, updates);
      // Real-time listener will automatically update the tickets list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string) => {
    try {
      setError(null);
      await ticketService.deleteTicket(ticketId);
      // Real-time listener will automatically update the tickets list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ticket';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const freshTickets = await ticketService.getAllTickets();
      setTickets(freshTickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tickets';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getTicketsByStatus = useCallback((status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  const getTicketStats = useCallback(() => {
    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  }, [tickets]);

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    refreshTickets,
    getTicketsByStatus,
    getTicketStats
  };
};

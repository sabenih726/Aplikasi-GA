// src/services/ticketService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Ticket {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignee?: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
}

class TicketService {
  private collectionName = 'tickets';

  // Create new ticket
  async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...ticket,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('Ticket created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error('Failed to create ticket');
    }
  }

  // Get all tickets
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Ticket[];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  // Real-time listener for tickets
  onTicketsChange(callback: (tickets: Ticket[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const tickets: Ticket[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Ticket[];
      
      callback(tickets);
    }, (error) => {
      console.error('Error listening to tickets:', error);
    });
  }

  // Update ticket
  async updateTicket(ticketId: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const ticketRef = doc(db, this.collectionName, ticketId);
      await updateDoc(ticketRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('Ticket updated:', ticketId);
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw new Error('Failed to update ticket');
    }
  }

  // Delete ticket
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, ticketId));
      console.log('Ticket deleted:', ticketId);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw new Error('Failed to delete ticket');
    }
  }

  // Get tickets by status
  async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    try {
      const tickets = await this.getAllTickets();
      return tickets.filter(ticket => ticket.status === status);
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      throw new Error('Failed to fetch tickets by status');
    }
  }

  // Get tickets statistics
  async getTicketStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const tickets = await this.getAllTickets();
      return {
        total: tickets.length,
        pending: tickets.filter(t => t.status === 'pending').length,
        inProgress: tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length
      };
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw new Error('Failed to fetch ticket statistics');
    }
  }
}

export const ticketService = new TicketService();

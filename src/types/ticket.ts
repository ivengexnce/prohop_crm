export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketCategory = 'General' | 'Technical' | 'Billing' | 'Account' | 'Feature Request';

export interface NoteItem {
  id: number;
  note_text: string;
  author: string;
  is_internal: boolean;
  activity_type?: 'comment' | 'status_change' | 'system' | 'sla_escalation';
  created_at: string;
}

export interface TicketItem {
  ticket_id: string;
  organization_id?: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  attachment_url?: string | null;
  attachment_name?: string | null;
  is_archived?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  notes_count?: number;
}

export interface TicketDetail extends TicketItem {
  notes: NoteItem[];
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  urgent: number;
  archived?: number;
  resolution_rate: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

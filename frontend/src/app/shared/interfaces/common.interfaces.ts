export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Innovation {
  id: number;
  created: string;
  modified: string;
  owner_id: number;
  owner?: string;
  partners: any[];
  nome: string;
  descricao: string;
  investimento_minimo: string;
  porcentagem_cedida: string;
  categorias: string[];
  imagens: string[];
}

export interface ImageData {
  id: number;
  url: string;
  name: string;
}

export interface ProposalInnovation {
  id: number;
  created: string;
  modified: string;
  investor: number;
  sponsored: number;
  innovation: number;
  descricao: string;
  investimento_minimo: string;
  porcentagem_cedida: string;
  accepted: boolean;
  status: string;
}

export interface ModalConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export interface Mensagem {
  id: string;
  sender: string;
  sender_id: number;
  sender_img_url: string | null;
  sender_img: string | null;
  receiver_id: number;
  room_id: string;
  content: string;
  created: string;
  is_read: boolean;
  profile_picture_url?: string;
}

export interface Participant {
  id: number;
  name: string;
  img_url: string;
}

export interface Sala {
  id: string;
  status: 'open' | 'active' | 'pending' | 'closed';
  innovation_id: number;
  innovation_name: string;
  img: string;
  participants: Participant[];
  created: string;
  last_activity?: string;
}

export interface RoomsResponse {
  data: Sala[];
}




export interface CreditHistoryItem {
  id: number;
  amount: number;
  formatted_amount: string;
  status: string;
  stripe_payment_intent_id: string;
  created: string;
}

export interface CreditHistoryResponse {
  history: CreditHistoryItem[];
  current_balance: number;
  formatted_balance: string;
  total_accumulated: number;
  message: string;
}
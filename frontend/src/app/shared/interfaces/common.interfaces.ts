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
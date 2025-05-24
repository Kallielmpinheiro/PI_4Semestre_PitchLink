export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Innovation {
  id: number;
  nome: string;
  descricao: string;
  owner?: string; 
  investimento_minimo?: string;
  porcentagem_cedida?: string;
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
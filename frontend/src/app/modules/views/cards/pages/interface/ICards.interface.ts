export interface ICards {
    idCard: number
    imagens: string
    title: string
    slogan: string
    categorias: string
    investimento_minimo: string;
    porcentagem_cedida: string;
    owner_id: number;


}

export interface Innovation {
    
    id: number;
    owner: string;
    owner_id: number;
    nome: string;
    imagens : string;
    descricao: string;
    investimento_minimo: string;
    porcentagem_cedida: string;
    categorias: string;
  }
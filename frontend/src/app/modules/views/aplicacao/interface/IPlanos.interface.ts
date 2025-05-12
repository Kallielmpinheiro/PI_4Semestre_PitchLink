export interface Plano {
    nome: string;
    imagem: string;
    corGradiente: string;
    preco: {
        semana: {
            valor: number;
        };
        mes: {
            valor: number;
            economia: string;
        };
        semestre: {
            valor: number;
            economia: string;
        };
    };
    curtidas: Beneficio[];
    premium: Beneficio[];
    controle: Beneficio[];
}

export interface Beneficio {
    nome: string;
    subtitulo?: string;
    status: boolean;
}

import { Plano } from "../interface/IPlanos.interface";

export const PLANOS: Record<string, Plano> = {
  Ruby: {
    nome: "Ruby",
    imagem: "assets/imgs/planos/Rubi.png",
    corGradiente: "from-[#e0115f] to-[#9b3e63]",
    preco: {
      semana: { valor: 99.90 },
      mes: { valor: 99.90, economia: "56%" },
      semestre: { valor: 99.90, economia: "78%" }
    },
    curtidas: [
      { nome: "Curtidas ilimitadas", status: true },
      { nome: "Veja quem curtiu você", status: false },
      {
        nome: "Curtidas prioritárias",
        subtitulo: "Seus likes serão visualizados mais rápido com as curtidas prioritárias.",
        status: false
      },
      { nome: "Use o Voltar quantas vezes quiser", status: true },
      { nome: "1 Boost gratuito por mês", status: false },
      { nome: "3 Super Likes grátis por semana", status: false },
      {
        nome: "Mande mensagem antes do match",
        subtitulo: "Mande uma mensagem junto com os Super Likes.",
        status: false
      }
    ],
    premium: [
      {
        nome: "Modo Passaporte ilimitado",
        subtitulo: "Dê Match e converse com pessoas de qualquer lugar do mundo.",
        status: true
      }
    ],
    controle: [
      {
        nome: "Controle o seu perfil",
        subtitulo: "Mostre apenas o que você quer que as outras pessoas vejam.",
        status: true
      },
      {
        nome: "Controle quem vê você",
        subtitulo: "Gerencie quem vê o seu perfil.",
        status: true
      },
      {
        nome: "Controle quem você vê",
        subtitulo: "Escolha os tipos de pessoas com as quais você quer se conectar.",
        status: true
      },
      {
        nome: "Oculte anúncios",
        subtitulo: "Remova os anúncios da sua experiência.",
        status: false
      }
    ]
  },

  Sapphire: {
    nome: "Sapphire",
    imagem: "assets/imgs/planos/Safira.png",
    corGradiente: "from-[#385f8f] to-[#004268]",
    preco: {
      semana: { valor: 59.90 },
      mes: { valor: 59.90, economia: "56%" },
      semestre: { valor:59.90, economia: "78%" }
    },
    curtidas: [
      { nome: "Curtidas ilimitadas", status: true },
      { nome: "Veja quem curtiu você", status: true },
      {
        nome: "Curtidas prioritárias",
        subtitulo: "Seus likes serão visualizados mais rápido com as curtidas prioritárias.",
        status: false
      },
      { nome: "Use o Voltar quantas vezes quiser", status: true },
      { nome: "1 Boost gratuito por mês", status: false },
      { nome: "3 Super Likes grátis por semana", status: true },
      {
        nome: "Mande mensagem antes do match",
        subtitulo: "Mande uma mensagem junto com os Super Likes.",
        status: false
      }
    ],
    premium: [
      {
        nome: "Modo Passaporte ilimitado",
        subtitulo: "Dê Match e converse com pessoas de qualquer lugar do mundo.",
        status: true
      }
    ],
    controle: [
      {
        nome: "Controle o seu perfil",
        subtitulo: "Mostre apenas o que você quer que as outras pessoas vejam.",
        status: true
      },
      {
        nome: "Controle quem vê você",
        subtitulo: "Gerencie quem vê o seu perfil.",
        status: true
      },
      {
        nome: "Controle quem você vê",
        subtitulo: "Escolha os tipos de pessoas com as quais você quer se conectar.",
        status: true
      },
      {
        nome: "Oculte anúncios",
        subtitulo: "Remova os anúncios da sua experiência.",
        status: true
      }
    ]
  },

  Emerald: {
    nome: "Emerald",
    imagem: "assets/imgs/planos/Esmeralda.png",
    corGradiente: "from-[#50C878] to-[#24753f]",
    preco: {
      semana: { valor: 29.90 },
      mes: { valor: 29.90, economia: "52%" },
      semestre: { valor: 29.90, economia: "76%" }
    },
    curtidas: [
      { nome: "Curtidas ilimitadas", status: true },
      { nome: "Veja quem curtiu você", status: true },
      {
        nome: "Curtidas prioritárias",
        subtitulo: "Seus likes serão visualizados mais rápido com as curtidas prioritárias.",
        status: true
      },
      { nome: "Use o Voltar quantas vezes quiser", status: true },
      { nome: "1 Boost gratuito por mês", status: true },
      { nome: "3 Super Likes grátis por semana", status: true },
      {
        nome: "Mande mensagem antes do match",
        subtitulo: "Mande uma mensagem junto com os Super Likes.",
        status: true
      }
    ],
    premium: [
      {
        nome: "Modo Passaporte ilimitado",
        subtitulo: "Dê Match e converse com pessoas de qualquer lugar do mundo.",
        status: true
      }
    ],
    controle: [
      {
        nome: "Controle o seu perfil",
        subtitulo: "Mostre apenas o que você quer que as outras pessoas vejam.",
        status: true
      },
      {
        nome: "Controle quem vê você",
        subtitulo: "Gerencie quem vê o seu perfil.",
        status: true
      },
      {
        nome: "Controle quem você vê",
        subtitulo: "Escolha os tipos de pessoas com as quais você quer se conectar.",
        status: true
      },
      {
        nome: "Oculte anúncios",
        subtitulo: "Remova os anúncios da sua experiência.",
        status: true
      }
    ]
  }
};

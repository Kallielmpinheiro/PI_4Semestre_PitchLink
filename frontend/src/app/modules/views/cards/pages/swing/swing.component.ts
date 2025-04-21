import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import Hammer from 'hammerjs';
import { ICards } from '../interface/ICards.interface';

@Component({
  selector: 'app-swing',
  imports: [CommonModule],
  templateUrl: './swing.component.html',
  styleUrls: ['./swing.component.css']  // Corrigir o nome de styleUrl para styleUrls
})
export class SwingComponent implements AfterViewInit {
  title = 'Pitch Cards';

  public arrayCards = signal<ICards[]>([
    {
      idCard: 1,
      title: "Gabriel de Oliveira",
      src: "https://avatars.githubusercontent.com/u/143122763?v=4",
      slogan: "Inovação que conecta. Simples assim.",
      categorias: ["Tecnologia", "Desenvolvimento Web", "Inteligência Artificial", "Big Data e Analytics"]
    },
    {
      idCard: 2,
      title: "Gabriel Cardoso",
      src: "https://avatars.githubusercontent.com/u/147005428?v=4",
      slogan: "Menos ruído, mais essência.",
      categorias: ["Marketing", "Publicidade", "Marketing Digital", "Gestão de Marca"]
    },
    {
      idCard: 3,
      title: "Dilma Rusbé",
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Dilma_Rousseff_fevereiro_2011_3-B.jpg",
      slogan: "O futuro é agora. Nós estocamos vento.",
      categorias: ["Startups", "Empreendedorismo Social", "Inovação", "Mentoria de Carreira"]
    }
  ])

  ngAfterViewInit(): void {
    const tinderContainer = document.querySelector('.pitch')!;
    const allCards = document.querySelectorAll('.pitch--card');
    const nope = document.getElementById('nope');  // Botão de "Não"
    const love = document.getElementById('love');  // Botão de "Sim"

    // Função que inicializa as cartas na tela
    const initCards = () => {
      const newCards = document.querySelectorAll('.pitch--card:not(.removed)');

      newCards.forEach((card, index) => {
        const cardElement = card as HTMLElement;  // Garantir que card é tratado como HTMLElement
        cardElement.style.zIndex = (allCards.length - index).toString();
        cardElement.style.transform = `scale(${(20 - index) / 20}) translateY(-${30 * index}px)`;
        cardElement.style.opacity = ((10 - index) / 10).toString();
      });

      tinderContainer.classList.add('loaded');
    };

    initCards();

    // Para cada carta, é configurado o evento de "pan" (movimento do dedo ou mouse)
    allCards.forEach((el) => {
      const card = el as HTMLElement;  // Type assertion para garantir que `el` seja tratado como HTMLElement
      const hammertime = new Hammer(card);
      const tolerance = 250;  // Distância mínima em pixels que o cartão precisa mover para ser removido
    
      hammertime.on('pan', (event) => {
        card.classList.add('moving');
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        console.log(event.deltaX)
    
        // Quando o movimento for para a direita (deltaX > 0), é um "like" (coração)
        card.classList.toggle('pitch_love', event.deltaX > tolerance);
        tinderContainer.classList.toggle('pitch_love_btn', event.deltaX > tolerance);
        
        // Quando o movimento for para a esquerda (deltaX < 0), é um "dislike" (X)
        card.classList.toggle('pitch_nope', event.deltaX < -tolerance);
        tinderContainer.classList.toggle('pitch_nope_btn', event.deltaX < -tolerance);
    
        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;
    
        card.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
      });
    
      hammertime.on('panend', (event) => {
        card.classList.remove('moving');
        tinderContainer.classList.remove('pitch_love');
        tinderContainer.classList.remove('pitch_nope');
      
        const moveOutWidth = document.body.clientWidth;
      
        // Verifica se o movimento foi suficiente para ultrapassar a margem de tolerância
        const movedEnough = Math.abs(event.deltaX) > tolerance || Math.abs(event.velocityX) > 0.5;
      
        // Se o movimento for suficiente, o cartão é removido
        card.classList.toggle('removed', movedEnough);
      
        // Se o movimento foi suficiente, o cartão sai da tela
        if (movedEnough) {
          const endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
          const toX = event.deltaX > 0 ? endX : -endX;
          const endY = Math.abs(event.velocityY) * moveOutWidth;
          const toY = event.deltaY > 0 ? endY : -endY;
          const xMulti = event.deltaX * 0.03;
          const yMulti = event.deltaY / 80;
          const rotate = xMulti * yMulti;
      
          // Aplica a transformação para deslocar o cartão para fora da tela
          card.style.transform = `translate(${toX}px, ${toY + event.deltaY}px) rotate(${rotate}deg)`;
        } else {
          // Se o movimento não foi suficiente, o cartão volta para o lugar original
          card.style.transform = '';
        }
      
        // Atualiza a posição dos cartões restantes
        initCards();

        // AQUI PODE SE COLOCAR TRATATIVAS PARA QUANDO O CARD FOR LIBERADO:
        // if (event.deltaX > tolerance) {
        //   console.log("Aqui vc pode colocar o que deseja quando for SIM");
        // } else if(event.deltaX < -tolerance){
        //   console.log("Aqui vc pode colocar o que deseja quando for NÃO");
        // }
      });
    });

    // Função para criar os ouvintes de evento para os botões de "Sim" e "Não"
    const createButtonListener = (love: boolean) => (event: MouseEvent) => {
      const cards = document.querySelectorAll('.pitch--card:not(.removed)');
      const moveOutWidth = document.body.clientWidth * 1.5;

      if (!cards.length) return;

      const card = cards[0] as HTMLElement;

      card.classList.add('removed');

      // Quando é "Sim" (coração), move a carta para a direita
      if (love) {
        card.style.transform = `translate(${moveOutWidth}px, -100px) rotate(-30deg)`;
      } else {
        // Quando é "Não" (X), move a carta para a esquerda
        card.style.transform = `translate(-${moveOutWidth}px, -100px) rotate(30deg)`;
      }

      initCards();

      event.preventDefault();
    };

    const nopeListener = createButtonListener(false);  // Listener para o botão "Não" (X)
    const loveListener = createButtonListener(true);   // Listener para o botão "Sim" (coração)

    nope?.addEventListener('click', nopeListener);
    love?.addEventListener('click', loveListener);
  }
}

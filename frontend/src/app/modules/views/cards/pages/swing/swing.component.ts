import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import Hammer from 'hammerjs';
import { ICards, Innovation } from '../interface/ICards.interface';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-swing',
  imports: [CommonModule],
  templateUrl: './swing.component.html',
  styleUrls: ['./swing.component.css']
})
export class SwingComponent implements AfterViewInit {

  constructor(
    private authService: AuthService
  ) { }

  title = 'Pitch Cards';

  public arrayCards = signal<ICards[]>([]);
  public cardIndexes: { [idCard: string]: number } = {};
  @ViewChildren('pitchCardRef') cardsElements!: QueryList<ElementRef>;

  CreatePro(cardId: string) {
    const selectedCard = this.arrayCards().find(card => card.idCard.toString() === cardId);

    if (!selectedCard) {
      console.error('Dados do card não encontrados');
      return;
    }

    const payload = {
      sponsored: parseInt(selectedCard.owner_id.toString()),
      innovation: parseInt(selectedCard.idCard.toString()),
      descricao: selectedCard.slogan,
      investimento_minimo: parseFloat(selectedCard.investimento_minimo.toString()),
      porcentagem_cedida: parseFloat(selectedCard.porcentagem_cedida.toString())
    };

    console.log(payload);

    this.authService.postCreateProposalInnovation(payload).subscribe(
      response => {
        console.log('Proposta criada com sucesso:', response);
      },
      error => {
        console.error('Erro ao criar proposta:', error);
        if (error.status === 422 && error.error?.detail) {
          console.log('Detalhes do erro de validação:', error.error.detail);
        }
      }
    );
  }


  ngOnInit(): void {
    this.authService.getInnovation().subscribe(
      dataResponse => {
        const innovations: Innovation[] = dataResponse.data;
        const cards: ICards[] = innovations.map((innovation: Innovation) => {

          return {
            owner_id: innovation.owner_id,
            idCard: innovation.id,
            imagens: innovation.imagens,
            title: innovation.nome,
            slogan: innovation.descricao,
            categorias: innovation.categorias,
            investimento_minimo: innovation.investimento_minimo,
            porcentagem_cedida: innovation.porcentagem_cedida,
          };
        });

        this.arrayCards.set(cards);

        // Inicializa os índices dos carrosséis
        cards.forEach(card => {
          this.cardIndexes[card.idCard] = 0;
        });
        
      },
      error => {
        console.log(error);
      }
    );
  }


  // Avança imagem do carrossel do card específico
  next(idCard: string) {
    const card = this.arrayCards().find(c => c.idCard.toString() === idCard);
    if (card) {
      const total = card.imagens.length;
      this.cardIndexes[idCard] = (this.cardIndexes[idCard] + 1) % total;
    }
  }

  // Volta imagem do carrossel do card específico
  prev(idCard: string) {
    const card = this.arrayCards().find(c => c.idCard.toString() === idCard);
    if (card) {
      const total = card.imagens.length;
      this.cardIndexes[idCard] = (this.cardIndexes[idCard] - 1 + total) % total;
    }
  }

  ngAfterViewInit(): void {
    this.cardsElements.changes.subscribe(() => {
      if (this.cardsElements.length) {
        this.initCards();
      }
    });
  }

  private initCards(): void {
    const tinderContainer = document.querySelector('.pitch');

    if (!tinderContainer) {
      console.error('Pitch container not found');
      return;
    }

    const allCards = this.cardsElements.map(ref => ref.nativeElement);
    const nope = document.getElementById('nope');  // Botão de "Não"
    const love = document.getElementById('love');  // Botão de "Sim"

    // Store the component instance for use in event handlers
    const component = this;

    if (!allCards.length) {
      return;
    }

    // Função que inicializa as cartas na tela
    const initCardsPosition = () => {
      const newCards = document.querySelectorAll('.pitch--card:not(.removed)');

      newCards.forEach((card, index) => {
        const cardElement = card as HTMLElement;
        cardElement.style.zIndex = (allCards.length - index).toString();
        cardElement.style.transform = `scale(${(20 - index) / 20}) translateY(-${30 * index}px)`;
        cardElement.style.opacity = ((10 - index) / 10).toString();
      });

      tinderContainer.classList.add('loaded');
    };

    initCardsPosition();

    // Para cada carta, é configurado o evento de "pan" (movimento do dedo ou mouse)
    allCards.forEach((el) => {
      const card = el as HTMLElement;
      const hammertime = new Hammer(card);
      const tolerance = 250;  // Distância mínima em pixels que o cartão precisa mover para ser removido

      // Get the card ID from the element
      const cardId = card.id.replace('card-', '');

      hammertime.on('pan', (event) => {
        card.classList.add('moving');
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

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

          if (event.deltaX > 0) {
            component.CreatePro(cardId);
          }

          // Aplica a transformação para deslocar o cartão para fora da tela
          card.style.transform = `translate(${toX}px, ${toY + event.deltaY}px) rotate(${rotate}deg)`;

        } else {
          card.style.transform = '';
        }

        // Atualiza a posição dos cartões restantes
        initCardsPosition();
      });
    });

    // Função para criar os ouvintes de evento para os botões de "Sim" e "Não"
    const createButtonListener = (love: boolean) => (event: MouseEvent) => {
      const cards = document.querySelectorAll('.pitch--card:not(.removed)');
      const moveOutWidth = document.body.clientWidth * 1.5;

      if (!cards.length) return;

      const card = cards[0] as HTMLElement;
      const cardId = card.id.replace('card-', '');

      if (love) {
        this.CreatePro(cardId);
      }

      card.classList.add('removed');

      // Quando é "Sim" (coração), move a carta para a direita
      if (love) {
        card.style.transform = `translate(${moveOutWidth}px, -100px) rotate(-30deg)`;
      } else {
        // Quando é "Não" (X), move a carta para a esquerda
        card.style.transform = `translate(-${moveOutWidth}px, -100px) rotate(30deg)`;
      }

      initCardsPosition();

      event.preventDefault();
    };

    const nopeListener = createButtonListener(false);  // Listener para o botão "Não" (X)
    const loveListener = createButtonListener(true);   // Listener para o botão "Sim" (coração)

    nope?.addEventListener('click', nopeListener);
    love?.addEventListener('click', loveListener);
  }
}
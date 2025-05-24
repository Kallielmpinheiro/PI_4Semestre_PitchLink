import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import Hammer from 'hammerjs';
import { ICards, Innovation } from '../interface/ICards.interface';
import { AuthService } from '../../../../../core/services/auth.service';
import { PropostasComponent } from '../../../propostas/propostas.component';
@Component({
  selector: 'app-swing',
  imports: [CommonModule, PropostasComponent],
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

  // Adicione estas propriedades para controlar o modal e o estado do card
  public showModal = signal<boolean>(false);
  public selectedCard = signal<ICards | null>(null);
  private pendingCardElement: HTMLElement | null = null; // Card que está esperando ação
  private pendingAction: 'accept' | 'reject' | null = null; // Ação pendente

  CreatePro(cardId: string) {
    const selectedCard = this.arrayCards().find(card => card.idCard.toString() === cardId);

    if (!selectedCard) {
      console.error('Dados do card não encontrados');
      return;
    }

    console.log('Card selecionado para proposta:', selectedCard);
    console.log('ID da inovação:', selectedCard.idCard);

    // Armazena o card e a ação pendente
    this.pendingCardElement = document.getElementById(cardId);
    this.pendingAction = 'accept';

    // Abre o modal
    this.selectedCard.set(selectedCard);
    this.showModal.set(true);
  }

  closeModal() {
    if (this.pendingCardElement) {
      this.pendingCardElement.style.transform = '';
      this.pendingCardElement.classList.remove('removed');
      this.pendingCardElement.classList.remove('moving');
    }

    this.resetPendingState();
  }

  onProposalSubmitted(proposalData: any) {
    

    if (this.pendingCardElement) {
      this.removeCard(this.pendingCardElement, true);
    }
    
    this.resetPendingState();
  }

  // Método para resetar o estado pendente
  private resetPendingState() {
    this.showModal.set(false);
    this.selectedCard.set(null);
    this.pendingCardElement = null;
    this.pendingAction = null;
  }

  // Método para remover um card
  private removeCard(card: HTMLElement, isAccept: boolean) {
    const moveOutWidth = document.body.clientWidth * 1.5;
    
    card.classList.add('removed');
    
    if (isAccept) {
      // Move para a direita (aceitar)
      card.style.transform = `translate(${moveOutWidth}px, -100px) rotate(-30deg)`;
    } else {
      // Move para a esquerda (rejeitar)
      card.style.transform = `translate(-${moveOutWidth}px, -100px) rotate(30deg)`;
    }
    
    // Atualiza a posição dos cartões restantes
    this.initCardsPosition();
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
    const nope = document.getElementById('nope');
    const love = document.getElementById('love');

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

    this.initCardsPosition = initCardsPosition; // Armazena a referência
    initCardsPosition();

    allCards.forEach((el) => {
      const card = el as HTMLElement;
      const hammertime = new Hammer(card);
      const tolerance = 250;
      const cardId = card.id;

      hammertime.on('pan', (event) => {
        // Se há um modal aberto, não permite interação
        if (this.showModal()) {
          return;
        }

        card.classList.add('moving');
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        card.classList.toggle('pitch_love', event.deltaX > tolerance);
        tinderContainer.classList.toggle('pitch_love_btn', event.deltaX > tolerance);

        card.classList.toggle('pitch_nope', event.deltaX < -tolerance);
        tinderContainer.classList.toggle('pitch_nope_btn', event.deltaX < -tolerance);

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;

        card.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
      });

      hammertime.on('panend', (event) => {
        // Se há um modal aberto, não permite interação
        if (this.showModal()) {
          return;
        }

        card.classList.remove('moving');
        tinderContainer.classList.remove('pitch_love');
        tinderContainer.classList.remove('pitch_nope');

        const movedEnough = Math.abs(event.deltaX) > tolerance || Math.abs(event.velocityX) > 0.5;

        if (movedEnough) {
          if (event.deltaX > 0) {
            // Movimento para direita - abre modal de proposta
            component.CreatePro(cardId);
          } else {
            // Movimento para esquerda - rejeita diretamente
            component.removeCard(card, false);
          }
        } else {
          // Retorna o card para a posição original
          card.style.transform = '';
        }
      });
    });

    // Função para criar os ouvintes de evento para os botões
    const createButtonListener = (love: boolean) => (event: MouseEvent) => {
      // Se há um modal aberto, não permite interação
      if (this.showModal()) {
        return;
      }

      const cards = document.querySelectorAll('.pitch--card:not(.removed)');

      if (!cards.length) return;

      const card = cards[0] as HTMLElement;
      const cardId = card.id;

      if (love) {
        // Botão de aceitar - abre modal
        this.CreatePro(cardId);
      } else {
        // Botão de rejeitar - remove diretamente
        this.removeCard(card, false);
      }

      event.preventDefault();
    };

    const nopeListener = createButtonListener(false);
    const loveListener = createButtonListener(true);

    nope?.addEventListener('click', nopeListener);
    love?.addEventListener('click', loveListener);
  }

  // Torna o método público para poder ser chamado
  public initCardsPosition(): void {
    const newCards = document.querySelectorAll('.pitch--card:not(.removed)');

    newCards.forEach((card, index) => {
      const cardElement = card as HTMLElement;
      cardElement.style.zIndex = (this.cardsElements.length - index).toString();
      cardElement.style.transform = `scale(${(20 - index) / 20}) translateY(-${30 * index}px)`;
      cardElement.style.opacity = ((10 - index) / 10).toString();
    });
  }
}
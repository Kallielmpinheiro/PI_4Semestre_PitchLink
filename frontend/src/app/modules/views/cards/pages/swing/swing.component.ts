import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, signal, ViewChildren, QueryList, ElementRef, computed, OnInit } from '@angular/core';
import Hammer from 'hammerjs';
import { ICards, Innovation } from '../interface/ICards.interface';
import { AuthService } from '../../../../../core/services/auth.service';
import { PropostasComponent } from '../../../propostas/propostas.component';
import { CATEGORIES } from '../../../../../core/constants/categories';

@Component({
  selector: 'app-swing',
  imports: [CommonModule, PropostasComponent, FormsModule],
  templateUrl: './swing.component.html',
  styleUrls: ['./swing.component.css']
})
export class SwingComponent implements OnInit, AfterViewInit {
  constructor(
    private authService: AuthService
  ) { }

  title = 'Pitch Cards';

  public arrayCards = signal<ICards[]>([]);
  public cardIndexes: { [idCard: string]: number } = {};
  @ViewChildren('pitchCardRef') cardsElements!: QueryList<ElementRef>;

  public showModal = signal<boolean>(false);
  public selectedCard = signal<ICards | null>(null);
  public hasError = signal<boolean>(false);
  public isLoading = signal<boolean>(true);
  public allCardsProcessed = signal<boolean>(false); // Nova propriedade

  public showFilter = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public selectedCategories = signal<string[]>([]);
  public minInvestment = signal<number | null>(null);
  public maxInvestment = signal<number | null>(null);
  
  private pendingCardElement: HTMLElement | null = null;
  private pendingAction: 'accept' | 'reject' | null = null;

  public allCategories = computed(() => {
    return CATEGORIES.sort();
  });

  public filteredCards = computed(() => {
    let filtered = this.arrayCards();

    if (this.searchTerm().trim()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(term) ||
        card.slogan?.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategories().length > 0) {
      filtered = filtered.filter(card =>
        Array.isArray(card.categorias) && card.categorias.some(cat => this.selectedCategories().includes(cat))
      );
    }

    if (this.minInvestment() !== null) {
      filtered = filtered.filter(card => Number(card.investimento_minimo) >= this.minInvestment()!);
    }

    if (this.maxInvestment() !== null) {
      filtered = filtered.filter(card => Number(card.investimento_minimo) <= this.maxInvestment()!);
    }

    return filtered;
  });

  toggleFilter(): void {
    if (this.arrayCards().length === 0) {
      return; 
    }
    this.showFilter.set(!this.showFilter());
  }

  toggleCategory(category: string): void {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter(c => c !== category));
    } else {
      this.selectedCategories.set([...current, category]);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    setTimeout(() => {
      this.initCardsPosition();
    }, 0);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategories.set([]);
    this.minInvestment.set(null);
    this.maxInvestment.set(null);
    this.applyFilters();
  }

  clearSelectedCategories(): void {
    this.selectedCategories.set([]);
    this.applyFilters();
  }

  getCategoryCount(category: string): number {
    return this.arrayCards().filter(card => 
      Array.isArray(card.categorias) && card.categorias.includes(category)
    ).length;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onMinInvestmentChange(value: string): void {
    this.minInvestment.set(value ? Number(value) : null);
    this.applyFilters();
  }

  onMaxInvestmentChange(value: string): void {
    this.maxInvestment.set(value ? Number(value) : null);
    this.applyFilters();
  }

  CreatePro(cardId: string) {
    const selectedCard = this.filteredCards().find(card => card.idCard.toString() === cardId);

    if (!selectedCard) {
      return;
    }

    this.pendingCardElement = document.getElementById(cardId);
    this.pendingAction = 'accept';

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
    this.checkIfAllCardsProcessed(); // Verificar se todos os cards foram processados
  }

  // Método para resetar o estado pendente
  private resetPendingState() {
    this.showModal.set(false);
    this.selectedCard.set(null);
    this.pendingCardElement = null;
    this.pendingAction = null;
  }

  // Método para verificar se todos os cards foram processados
  private checkIfAllCardsProcessed() {
    setTimeout(() => {
      const remainingCards = document.querySelectorAll('.pitch--card:not(.removed)').length;
      if (remainingCards === 0 && this.arrayCards().length > 0) {
        this.allCardsProcessed.set(true);
      }
    }, 500); // Pequeno delay para garantir que a animação de remoção termine
  }

  // Método para resetar e recarregar cards
  reloadCards(): void {
    this.allCardsProcessed.set(false);
    this.ngOnInit();
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
    
    // Verificar se todos os cards foram processados
    this.checkIfAllCardsProcessed();
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.allCardsProcessed.set(false); // Reset do estado
    
    this.authService.getInnovation().subscribe({
      next: (dataResponse) => {
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
        this.isLoading.set(false);

        if (cards.length === 0) {
          this.showFilter.set(false);
          this.clearFilters();
        }

        // Inicializa os índices dos carrosséis
        cards.forEach(card => {
          this.cardIndexes[card.idCard] = 0;
        });
      },
      error: (error) => {
        console.log(error);
        this.isLoading.set(false);
        this.hasError.set(true);
        this.showFilter.set(false);
      }
    });
  }

  retryLoadCards(): void {
    this.ngOnInit();
  }

  // Avança imagem do carrossel do card específico
  next(idCard: string) {
    const card = this.filteredCards().find(c => c.idCard.toString() === idCard);
    if (card) {
      const total = card.imagens.length;
      this.cardIndexes[idCard] = (this.cardIndexes[idCard] + 1) % total;
    }
  }

  // Volta imagem do carrossel do card específico
  prev(idCard: string) {
    const card = this.filteredCards().find(c => c.idCard.toString() === idCard);
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
        if (this.showModal() || this.showFilter()) {
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
        if (this.showModal() || this.showFilter()) {
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
            // Movimento para a esquerda - rejeita diretamente
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
      if (this.showModal() || this.showFilter()) {
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

  public initCardsPosition(): void {
    const newCards = document.querySelectorAll('.pitch--card:not(.removed)');

    newCards.forEach((card, index) => {
      const cardElement = card as HTMLElement;
      cardElement.style.zIndex = (this.cardsElements.length - index).toString();
      cardElement.style.transform = `scale(${(20 - index) / 20}) translateY(-${30 * index}px)`;
      cardElement.style.opacity = ((10 - index) / 10).toString();
    });
  }

  private initializeCardIndexes(): void {
    this.arrayCards().forEach(card => {
      if (!(card.idCard in this.cardIndexes)) {
        this.cardIndexes[card.idCard] = 0;
      }
    });
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }
}
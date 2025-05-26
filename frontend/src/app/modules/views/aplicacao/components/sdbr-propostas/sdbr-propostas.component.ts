import { COMPILER_OPTIONS, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { environment } from '../../../../../../environments/environment';
import { ResponseModalComponent } from '../../../response-modal/response-modal.component';
import { ModalConfig } from '../../../../../shared/interfaces/common.interfaces';

@Component({
  selector: 'app-sdbr-propostas',
  standalone: true,
  imports: [CommonModule, ResponseModalComponent],
  templateUrl: './sdbr-propostas.component.html',
  styleUrl: './sdbr-propostas.component.css'
})
export class SdbrPropostasComponent implements OnInit {
  private authService = inject(AuthService);
  
  baseUrl = environment.baseUrl;
  
  propostas: any[] = [];
  loading = false;
  error: string | null = null;
  
  mostrarModal = false;
  propostaSelecionada: any = null;
  
  showResponseModal = false;
  modalConfig: ModalConfig = {
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false
  };

  ngOnInit(): void {
    this.carregarPropostas();
  }

  carregarPropostas() {
    this.loading = true;
    this.authService.userProposalsInnovations().subscribe({
      next: (response) => {
        this.propostas = response.message;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        
        if (error.status === 404 && error.error?.message) {
          this.propostas = []; 
          this.error = null;   
        } else {
          this.error = error.error?.message;
        }
        
        this.loading = false;
      }
    });
  }
  

  getImageUrl(proposta: any): string {
    if (proposta.investor_profile_picture_url) {
      return proposta.investor_profile_picture_url;
    }
    
    if (proposta.investor_profile_picture) {
      if (proposta.investor_profile_picture.startsWith('http://') || 
          proposta.investor_profile_picture.startsWith('https://')) {
        return proposta.investor_profile_picture;
      }
      
      return `${this.baseUrl}/media/${proposta.investor_profile_picture.replace(/^\//, '')}`;
    }
    
    return 'assets/images/default-avatar.png';
  }

formatMoneyCompact(value: number | string | null | undefined): string {
  const numVal = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (!value || isNaN(numVal)) {
    return 'R$ 0,00';
  }

  if (numVal <= 999_999_999.99) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numVal);
  }

  // Para valores acima de 999.999.999,99, usar abreviação com vírgula como separador decimal
  const abbreviations = [
    { limit: 1_000_000_000_000, suffix: 'T' },
    { limit: 1_000_000_000, suffix: 'B' },
    { limit: 1_000_000, suffix: 'M' },
    { limit: 1_000, suffix: 'K' },
  ];

  for (const { limit, suffix } of abbreviations) {
    if (numVal >= limit) {
      const short = (numVal / limit).toFixed(1).replace('.', ',');
      return `R$ ${short}${suffix}`;
    }
  }

  return `R$ ${numVal.toFixed(2).replace('.', ',')}`; // fallback
}

  handlePropostaClick(proposta: any) {
    this.propostaSelecionada = proposta;
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
    this.propostaSelecionada = null;
  }

  aceitarProposta(propostaId: number) {

    const id = propostaId;
    
    this.authService.postAcceptProposalInnovation(id).subscribe({
      next: (response) => {
        this.error = null;
        this.criarSalaParaProposta(response.proposal);
      },
      error: (error) => {
        let errorMessage = error.error?.message || error.message;
        this.error = errorMessage;
        this.showErrorModal(errorMessage);
      }
    });
  }

  private criarSalaParaProposta(proposta: any) {
    if (!proposta) {
      return;
    }

    const criarSalaPayload = {
      innovation_id: proposta.innovation?.id || proposta.innovation_id,
      investor_id: proposta.investor?.id || proposta.investor_id
    };
    this.authService.createRoom(criarSalaPayload).subscribe({
      next: (roomResponse) => {
        this.finalizarAceitacao('Proposta aceita e sala de negociação criada com sucesso!');
      },
      error: (roomError) => {
        this.finalizarAceitacao('Proposta aceita com sucesso! Erro ao criar sala de negociação.');
      }
    });
  }

  private finalizarAceitacao(mensagem: string = 'Proposta aceita com sucesso!') {
    this.carregarPropostas();
    this.fecharModal();
    this.showSuccessModal(mensagem);
  }

  rejeitarProposta(propostaId: number) {
    const id = propostaId 
    this.authService.postRejectProposalInnovation(id).subscribe({
      next: (response) => {
        this.error = null;
        this.carregarPropostas();
        this.fecharModal();
        this.showSuccessModal('Proposta rejeitada com sucesso!');
      },
      error: (error) => {
        let errorMessage = error;
        this.error = errorMessage;
        this.showErrorModal(errorMessage);
      }
    });
  }

  showSuccessModal(message: string) {
    this.modalConfig = {
      title: 'Sucesso!',
      message: message,
      type: 'success',
      confirmText: 'OK',
      showCancel: false
    };
    this.showResponseModal = true;
  }

  showErrorModal(message: string) {
    this.modalConfig = {
      title: 'Erro!',
      message: message,
      type: 'error',
      confirmText: 'OK',
      showCancel: false
    };
    this.showResponseModal = true;
  }

  showWarningModal(message: string) {
    this.modalConfig = {
      title: 'Atenção!',
      message: message,
      type: 'warning',
      confirmText: 'OK',
      showCancel: false
    };
    this.showResponseModal = true;
  }

  onModalConfirm() {
    this.showResponseModal = false;
  }

  onModalCancel() {
    this.showResponseModal = false;
  }

  onModalClose() {
    this.showResponseModal = false;
  }
}
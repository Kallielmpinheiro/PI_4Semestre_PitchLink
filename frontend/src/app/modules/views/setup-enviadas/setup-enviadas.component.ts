import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { initFlowbite } from 'flowbite';
import { ModalConfig } from '../../../shared/interfaces/common.interfaces';
import { ResponseModalComponent } from '../response-modal/response-modal.component';

interface ProposalData {
  id: number;
  created: string;
  modified: string;
  investor_id: number;
  investor_name: string;
  sponsored_id: number;
  sponsored_name: string;
  innovation_id: number;
  innovation_name: string;
  descricao: string;
  investimento_minimo: number;
  porcentagem_cedida: number;
  accepted: boolean;
  status: string;
}

type TabType = 'open' | 'canceled' | 'rejected' | 'closed';

@Component({
  selector: 'app-setup-propostas',
  standalone: true,
  imports: [CommonModule, ResponseModalComponent],
  templateUrl: './setup-enviadas.component.html',
  styleUrl: './setup-enviadas.component.css'
})
export class SetupEnviadasComponent implements OnInit {
  private authService = inject(AuthService);

  proposalsOpen: ProposalData[] = [];
  proposalsCanceled: ProposalData[] = [];
  proposalsClosed: ProposalData[] = [];
  proposalsRejected: ProposalData[] = [];

  loading = true;
  error = '';
  activeTab: TabType = 'open';
  showCancelModal = false;
  showStatus = false;
  statusMessage = '';
  statusClasses = '';

  proposalToCancel: ProposalData | null = null;


  // Response Modal Configuration
  responseModalConfig: ModalConfig = {
    message: '',
    type: 'info',
    confirmText: 'OK',
    showCancel: false
  };
  responseModalVisible: boolean = false;

  ngOnInit() {
    this.loadAllProposals();
    initFlowbite();
  }

  setActiveTab(tab: TabType) {
    this.activeTab = tab;
  }

  getCurrentProposals(): ProposalData[] {
    switch (this.activeTab) {
      case 'open':
        return this.proposalsOpen;
      case 'canceled':
        return this.proposalsCanceled;
      case 'rejected':
        return this.proposalsRejected;
      case 'closed':
        return this.proposalsClosed;
      default:
        return [];
    }
  }

  getTabConfig() {
    return {
      open: {
        title: 'Propostas Abertas',
        count: this.proposalsOpen.length,
        color: 'blue',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        headerColor: 'text-white',
        buttonActions: ['Visualizar', 'Aceitar']
      },
      canceled: {
        title: 'Propostas Canceladas',
        count: this.proposalsCanceled.length,
        color: 'red',
        icon: 'M6 18L18 6M6 6l12 12',
        headerColor: 'text-red-600',
        buttonActions: ['Visualizar']
      },
      rejected: {
        title: 'Propostas Rejeitadas',
        count: this.proposalsRejected.length,
        color: 'orange',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z',
        headerColor: 'text-orange-600',
        buttonActions: ['Visualizar']
      },
      closed: {
        title: 'Negócios Fechados',
        count: this.proposalsClosed.length,
        color: 'green',
        icon: 'M5 13l4 4L19 7',
        headerColor: 'text-green-500',
        buttonActions: ['Contrato', 'Detalhes']
      }
    };
  }

  loadAllProposals() {
    this.loading = true;
    let completedRequests = 0;
    const totalRequests = 4;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };
    
    this.authService.proposalOpenSponsoredInvestor().subscribe({
      next: (response) => {
        this.proposalsOpen = response.data || [];
        checkComplete();
      },
      error: (error) => {
        console.error(error);
        this.proposalsOpen = [];
        checkComplete();
      }
    });

    this.authService.proposalCanceledSponsoredInvestor().subscribe({
      next: (response) => {
        this.proposalsCanceled = response.data || [];
        checkComplete();
      },
      error: (error) => {
        console.error(error);
        this.proposalsCanceled = [];
        checkComplete();
      }
    });

    this.authService.proposalClosedSponsoredInvestor().subscribe({
      next: (response) => {
        this.proposalsClosed = response.data || [];
        checkComplete();
      },
      error: (error) => {
        console.error(error);
        this.proposalsClosed = [];
        checkComplete();
      }
    });

    this.authService.proposalRejectedSponsoredInvestor().subscribe({
      next: (response) => {
        this.proposalsRejected = response.data || [];
        checkComplete();
      },
      error: (error) => {
        console.error(error);
        this.proposalsRejected = [];
        checkComplete();
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Em Análise';
      case 'canceled':
        return 'Cancelada';
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  }

  showFeedback(message: string, type: 'success' | 'error') {
    this.statusMessage = message;

    if (type === 'success') {
      this.statusClasses = 'bg-gradient-to-r from-emerald-700 to-emerald-800 border border-green-200';
    } else if (type === 'error') {
      this.statusClasses = 'bg-gradient-to-r from-red-700 to-red-800 border border-red-200';
    }

    this.showStatus = true;
    setTimeout(() => this.showStatus = false, 3000);
  }

  cancelar(): void {
    if (!this.proposalToCancel) {
      this.showResponseModal('Nenhuma proposta selecionada para cancelamento!', 'error');
      return;
    }

    this.showCancelModal = false;
    this.loading = true;

    this.authService.cancelProposal(this.proposalToCancel.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.showResponseModal(
          `Proposta para "${this.proposalToCancel?.innovation_name}" foi cancelada com sucesso!`, 
          'success'
        );
        this.loadAllProposals();
        this.proposalToCancel = null;
      },
      error: (error) => {
        console.error('Erro ao cancelar proposta:', error);
        this.loading = false;
        this.showResponseModal('Erro ao cancelar a proposta. Tente novamente.', 'error');
        this.proposalToCancel = null;
      }
    });
  }

  private showResponseModal(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.responseModalConfig = {
      message: message,
      type: type,
      confirmText: 'OK',
      showCancel: false
    };
    this.responseModalVisible = true;
  }

  onResponseModalConfirm(): void {
    this.closeResponseModal();
  }

  closeResponseModal(): void {
    this.responseModalVisible = false;
  }

  openCancelModal(proposal: ProposalData): void {
    this.proposalToCancel = proposal;
    this.showCancelModal = true;
  }
}


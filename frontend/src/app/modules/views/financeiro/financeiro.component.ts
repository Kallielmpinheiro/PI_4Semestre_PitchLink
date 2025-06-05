import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CreditHistoryItem, CreditHistoryResponse } from '../../../shared/interfaces/common.interfaces';


@Component({
  selector: 'app-financeiro',
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro.component.html',
  styleUrl: './financeiro.component.css'
})
export class FinanceiroComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  saldoDisponivel: number = 0;
  totalDepositado: number = 0;
  ultimaTransacao: number = 0;
  transacoes: CreditHistoryItem[] = [];
  
  showDepositModal: boolean = false;
  depositAmount: number = 0;
  processing: boolean = false;
  
  private stripe: Stripe | null = null;
  private elements: any = null;
  private cardElement: any = null;
  private stripePublishableKey: string = '';
  
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit() {
    this.loadUserBalance();
    this.getCreditHistory();
    this.loadStripeKey();
  }
  
  
  loadUserBalance() {
    this.authService.getUserBalance().subscribe({
      next: (response) => {
        if (response.balance) {
          this.saldoDisponivel = response.balance;
        }
      },
    });
  }

  getCreditHistory() {
    this.authService.getCreditHistory().subscribe({
      next: (response: CreditHistoryResponse) => {
        console.log(response);
        
        this.saldoDisponivel = response.current_balance;
        this.totalDepositado = response.total_accumulated;
        this.transacoes = response.history;
        
        if (response.history && response.history.length > 0) {
          this.ultimaTransacao = response.history[0].amount;
        }
      },
    });
  }
  
  loadStripeKey() {
    this.authService.getPaymentPlans().subscribe({
      next: (response) => {
        if (response && response.stripe_publishable_key) {
          this.stripePublishableKey = response.stripe_publishable_key;
          this.loadStripe();
        }
      },
      
    });
  }
  
  private async loadStripe() {
    if (!this.stripePublishableKey) {
      this.errorMessage = 'Erro na configuração do sistema de pagamento';
      return;
    }
    
    this.stripe = await loadStripe(this.stripePublishableKey);
    
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.setupCardElement();
    } 
  }
  
  private setupCardElement() {
    if (this.elements) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'transparent',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
              color: '#9ca3af',
            },
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444'
          }
        },
        hidePostalCode: true
      });
    }
  }
  
  openDepositModal() {
    this.showDepositModal = true;
    this.clearMessages();
    setTimeout(() => {
      this.mountCardElement();
    }, 100);
  }
  
  closeDepositModal() {
    this.showDepositModal = false;
    this.depositAmount = 0;
    this.clearMessages();
    if (this.cardElement) {
      this.cardElement.clear();
    }
  }
  
  mountCardElement() {
    if (this.cardElement) {
      setTimeout(() => {
        const cardContainer = document.getElementById('card-element');
        if (cardContainer && !cardContainer.hasChildNodes()) {
          this.cardElement.mount('#card-element');
        }
      }, 100);
    }
  }
  
  async processDeposit() {
    if (!this.depositAmount || this.depositAmount < 1) {
      this.errorMessage = 'Por favor, insira um valor válido (mínimo R$ 1,00)';
      return;
    }
    
    
    if (!this.stripe || !this.cardElement) {
      this.errorMessage = 'Sistema de pagamento não carregado. Tente novamente.';
      return;
    }
    
    this.processing = true;
    this.clearMessages();
    
    try {
      const intentResponse = await this.authService.createCreditPaymentIntent(this.depositAmount.toString()).toPromise();
      
      if (!intentResponse.success) {
        throw new Error(intentResponse.message);
      }
      
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        intentResponse.client_secret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: 'Cliente PitchLink'
            }
          }
        }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        const confirmResponse = await this.authService.postConfirmCreditPayment(
          '',
          paymentIntent.id
        ).toPromise();
        
        if (confirmResponse.success) {
          this.successMessage = confirmResponse.message;
          this.saldoDisponivel = confirmResponse.new_balance;
          
          this.getCreditHistory();
          
          setTimeout(() => {
            this.closeDepositModal();
          }, 2000);
          
        } else {
          throw new Error(confirmResponse.message);
        }
      } else {
        throw new Error(`Pagamento não processado. Status: ${paymentIntent.status}`);
      }
      
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.processing = false;
    }
  }
  
  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Concluído',
      'succeeded': 'Concluído',
      'pending': 'Pendente',
      'processing': 'Processando',
      'failed': 'Falhou',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }
}
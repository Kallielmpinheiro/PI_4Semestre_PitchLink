import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular: boolean;
}

interface PaymentTransaction {
  id: number;
  plan: string;
  plan_name: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string;
  created: string;
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  
  plans: PaymentPlan[] = [];
  paymentHistory: PaymentTransaction[] = [];
  currentPlan: string = 'no_plan';
  loading = false;
  processingPayment = false;
  selectedPlan: string = '';
  
  // Stripe
  private stripe: Stripe | null = null;
  private elements: any = null;
  private cardElement: any = null;
  private stripePublishableKey: string = '';
  
  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  
  ngOnInit() {
    this.loadPlans();
    
    this.route.queryParams.subscribe(params => {
      if (params['plan']) {
        const planId = this.mapPlanNameToId(params['plan']);
        if (planId) {
          this.selectedPlan = planId;
          setTimeout(() => {
            if (this.selectedPlan && this.stripe) {
              this.mountCardElement();
            }
          }, 1000);
        }
      }
    });
  }
  
  private mapPlanNameToId(planName: string): string {
    const planMapping: { [key: string]: string } = {
      'ruby': 'ruby',
      'sapphire': 'sapphire', 
      'emerald': 'esmerald' 
    };
    return planMapping[planName] || '';
  }
  
  getSelectedPlanPrice(): number {
    if (!this.selectedPlan) return 0;
    const plan = this.plans.find(p => p.id === this.selectedPlan);
    return plan?.price || 0;
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
    } else {
      this.errorMessage = 'Erro ao carregar sistema de pagamento';
    }
  }
  
  private setupCardElement() {
  if (this.elements) {
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#ffffff',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
      hidePostalCode: true, 
      fields: {
        postalCode: 'never'
      }
    });
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
  
  loadPlans() {
    this.loading = true;
    this.authService.getPaymentPlans().subscribe({
      next: (response) => {
        if (response && response.plans) {
          this.plans = response.plans;
          this.currentPlan = response.current_plan || 'Gratuito';
          this.stripePublishableKey = response.stripe_publishable_key;
          
          if (this.stripePublishableKey) {
            this.loadStripe();
          } else {
            this.errorMessage = 'Chave do Stripe não encontrada';
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar planos';
        this.loading = false;
      }
    });
  }
  
  selectPlan(planId: string) {
    this.selectedPlan = planId;
    this.clearMessages();
    setTimeout(() => {
      this.mountCardElement();
    }, 100);
  }
  
  async processPayment() {
    if (!this.selectedPlan || !this.stripe || !this.cardElement) {
      this.errorMessage = 'Por favor, selecione um plano e preencha os dados do cartão';
      return;
    }
    
    this.processingPayment = true;
    this.clearMessages();
    
    try {
      const intentResponse = await this.authService.createPaymentIntent(this.selectedPlan).toPromise();
      
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
        throw new Error(error.message || 'Erro no pagamento');
      }
      
      if (paymentIntent.status === 'succeeded') {
        const confirmResponse = await this.authService.confirmPayment(
          this.selectedPlan,
          paymentIntent.id
        ).toPromise();
        
        if (confirmResponse.success) {
          this.successMessage = confirmResponse.message;
          this.currentPlan = this.selectedPlan;
          this.selectedPlan = '';
          
          if (this.cardElement) {
            this.cardElement.clear();
          }
          
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
        } else {
          throw new Error(confirmResponse.message);
        }
      } else {
        throw new Error(`Pagamento não processado. Status: ${paymentIntent.status}`);
      }
      
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao processar pagamento';
    } finally {
      this.processingPayment = false;
    }
  }
  
  cancelPlan() {
    this.selectedPlan = '';
    this.clearMessages();
  }
  
  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  getPlanDisplayName(planId: string): string {
    const planNames: { [key: string]: string } = {
      'no_plan': 'Plano Gratuito',
      'esmerald': 'Plano Esmeralda',
      'sapphire': 'Plano Safira',
      'ruby': 'Plano Rubi'
    };
    return planNames[planId] || planId;
  }
  
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'succeeded': 'success',
      'pending': 'warning',
      'failed': 'error',
      'cancelled': 'error'
    };
    return classes[status] || 'error';
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
}

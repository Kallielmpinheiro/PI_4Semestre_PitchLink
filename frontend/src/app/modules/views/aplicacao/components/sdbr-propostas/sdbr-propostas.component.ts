import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-sdbr-propostas',
  standalone: true,
  imports: [CommonModule],
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

  ngOnInit(): void {
    this.carregarPropostas();
    this.baseUrl
  }

  carregarPropostas() {
    this.loading = true;
    this.authService.userProposalsInnovations().subscribe({
      next: (response) => {
        console.log('Resposta da API:', response);
        this.propostas = response.message || [];        
        
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'Não foi possível carregar as propostas';
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

  formatMoneyCompact(value: any): string {
    if (value === null || value === undefined) {
      return 'R$ 0';
    }
    
    const numVal = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(numVal)) return 'R$ 0';
    
    if (numVal >= 1000000) {
      return `R$ ${(numVal / 1000000).toFixed(1)}M`;
    }
    else if (numVal >= 1000) {
      return `R$ ${(numVal / 1000).toFixed(1)}K`;
    } 
    else {
      return `R$ ${numVal.toFixed(0)}`;
    }
  }

  // Método para formatar valores monetários completos
  formatMoney(value: any): string {
    if (value === null || value === undefined) {
      return 'R$ 0';
    }
    
    const numVal = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(numVal)) return 'R$ 0';
    
    return numVal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    });
  }

  getFormattedDisplayValue(value: any): string {
    if (value === null || value === undefined) {
      return 'R$ 0';
    }
    
    const numVal = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(numVal)) return 'R$ 0';
    
    const formattedValue = numVal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    });
    
    if (formattedValue.length > 15) {
      return this.formatMoneyCompact(value);
    }
    
    return formattedValue;
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
    console.log('Aceitando proposta com ID:', propostaId);
  }

  rejeitarProposta(propostaId: number) {
    console.log('Rejeitando proposta com ID:', propostaId);
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { environment } from '../../../../../../environments/environment.prod';

@Component({
  selector: 'app-sdbr-propostas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sdbr-propostas.component.html',
  styleUrl: './sdbr-propostas.component.css'
})
export class SdbrPropostasComponent implements OnInit {
  private authService = inject(AuthService);
  baseUrl = environment.getBaseUrl();
  
  propostas: any[] = [];
  loading = false;
  error: string | null = null;
  
  // Variáveis para controle do modal
  mostrarModal = false;
  propostaSelecionada: any = null;

  ngOnInit(): void {
    this.getpropostas();
  }

  getpropostas() {
    this.loading = true;
    this.authService.userProposalsInnovations().subscribe({
      next: (response) => {
        console.log(response);
        this.propostas = response.message || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching propostas:', error);
        this.error = 'Não foi possível carregar as propostas';
        this.loading = false;
      }
    });
  }
  
  formatMoney(value: string): string {
    const numVal = parseFloat(value);
    return numVal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  handlePropostaClick(proposta: any) {
    console.log('Proposta clicada:', proposta);
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
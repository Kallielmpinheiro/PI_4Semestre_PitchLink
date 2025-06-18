import { Component, inject, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User, Innovation, ProposalInnovation } from '../../../shared/interfaces/common.interfaces';

@Component({
  selector: 'app-propostas',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './propostas.component.html',
  styleUrl: './propostas.component.css'
})
export class PropostasComponent implements OnInit, OnChanges {
  
  @Input() selectedCard: any = null;
  @Output() proposalSubmitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private authService = inject(AuthService);
  
  proposalForm: FormGroup;
  users: User[] = [];
  innovations: Innovation[] = [];
  
  showResponseModal = false;
  backendResponse: any = null;
  isSuccess = false;

  proposalSummary: {
  investor: string;
  sponsored: string;
  innovation: string;
  descricao: string;
  investimento_minimo: string;
  porcentagem_cedida: string;
} | null = null;

  constructor(private fb: FormBuilder) {
    this.proposalForm = this.fb.group({
      investor: [{value: '', disabled: true}, Validators.required],
      sponsored: [{value: '', disabled: true}, Validators.required],
      innovation: [{value: '', disabled: true}, Validators.required],
      descricao: [{value: '', disabled: true}, [Validators.maxLength(255)]],
      investimento_minimo: ['', [Validators.maxLength(255)]],
      porcentagem_cedida: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.getUser();
    this.loadInnovations();
  }

  ngOnChanges(): void {
    if (this.selectedCard) {
      this.processSelectedCard();
    }
  }

  private processSelectedCard(): void {
    
    if (this.selectedCard) {
      const sponsoredId = Number(this.selectedCard.owner_id);
      const innovationId = Number(this.selectedCard.idCard);
      
      
      this.proposalForm.patchValue({
        sponsored: sponsoredId,
        innovation: innovationId,
        descricao: this.selectedCard.slogan || '',
        investimento_minimo: this.selectedCard.investimento_minimo || '',
        porcentagem_cedida: this.selectedCard.porcentagem_cedida || ''
      });
      
      if (innovationId) {
        this.searchInnovations(innovationId);
      }
    }
  }

  getUser(): void {
    this.authService.getUser().subscribe({
      next: (response) => {
        if (response && response.data) {
          const userData = response.data;
          
          const currentUser = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email
          };
          
          this.users = [currentUser];
          
          this.proposalForm.patchValue({
            investor: currentUser.id
          });
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
    
  }


  loadInnovations(): void {
    this.authService.getInnovation().subscribe({
      next: (response) => {
        if (response.data) {
          this.innovations = response.data;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  searchInnovations(id: number): void {
    const payload = { id: Number(id) };
    
    
    this.authService.postSearchInnovation(payload).subscribe({
      next: (response) => {
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const innovation = response.data[0];
          
          
          const existingIndex = this.innovations.findIndex(i => i.id === innovation.id);
          if (existingIndex >= 0) {
            this.innovations[existingIndex] = {
              ...this.innovations[existingIndex],
              ...innovation
            };
          } else {
            this.innovations.push(innovation);
          }
          
          const currentValues = this.proposalForm.getRawValue();
          
          this.proposalForm.patchValue({
            sponsored: this.selectedCard.owner_id,
            innovation: innovation.id || currentValues.innovation,
            descricao: innovation.descricao || currentValues.descricao,
            investimento_minimo: innovation.investimento_minimo || currentValues.investimento_minimo,
            porcentagem_cedida: innovation.porcentagem_cedida || currentValues.porcentagem_cedida
          });
          
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.proposalForm.valid) {
      const rawFormData = this.proposalForm.getRawValue();

      const formData = {
        sponsored: Number(rawFormData.sponsored),
        innovation: Number(rawFormData.innovation),
        descricao: rawFormData.descricao || '',
        investimento_minimo: parseFloat(rawFormData.investimento_minimo?.toString().replace(',', '.') || '0'),
        porcentagem_cedida: parseFloat(rawFormData.porcentagem_cedida?.toString().replace(',', '.') || '0')
      };

      this.authService.postCreateProposalInnovation(formData).subscribe({
        next: (response) => {
          this.backendResponse = response;
          this.isSuccess = true;
          this.showResponseModal = true;

          // Define o resumo da proposta aqui
          this.proposalSummary = {
            investor: this.getInvestorName(),
            sponsored: this.getSponsoredName(),
            innovation: this.getInnovationName(),
            descricao: formData.descricao,
            investimento_minimo: formData.investimento_minimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            porcentagem_cedida: formData.porcentagem_cedida.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%'
          };
        },
        error: (error) => {
          this.backendResponse = error;
          this.isSuccess = false;
          this.showResponseModal = true;
        }
      });
    }
  }


  closeResponseModal(): void {
    this.showResponseModal = false;
    this.backendResponse = null;
    
    if (this.isSuccess) {
      const rawFormData = this.proposalForm.getRawValue();
      const formData = {
        sponsored: Number(rawFormData.sponsored),
        innovation: Number(rawFormData.innovation),
        descricao: rawFormData.descricao || '',
        investimento_minimo: parseFloat(rawFormData.investimento_minimo?.toString().replace(',', '.') || '0'),
        porcentagem_cedida: parseFloat(rawFormData.porcentagem_cedida?.toString().replace(',', '.') || '0')
      };
      this.proposalSubmitted.emit(formData);
    }
  }

  getFormattedResponse(): string {
    if (!this.backendResponse) return '';
    
    try {
      if (this.backendResponse.message) {
        return this.backendResponse.message;
      }
      
      if (this.backendResponse.error) {
        if (typeof this.backendResponse.error === 'string') {
          return this.backendResponse.error;
        }
        if (this.backendResponse.error.message) {
          return this.backendResponse.error.message;
        }
      }
      
      if (this.backendResponse.data && this.backendResponse.data.message) {
        return this.backendResponse.data.message;
      }
      
      if (this.isSuccess && this.backendResponse.data) {
        return 'Proposta criada com sucesso!';
      }
      
      return this.backendResponse.toString();
    } catch (error) {
      return 'Erro ao processar resposta do servidor';
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.proposalForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  getInvestorName(): string {
    const investorId = this.proposalForm.get('investor')?.value;
    const user = this.users.find(u => u.id == investorId);
    if (user) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return 'Carregando...';
  }

  getSponsoredName(): string {
    if (this.selectedCard && this.selectedCard.owner_name) {
      return this.selectedCard.owner_name;
    }
    
    const innovationId = this.proposalForm.get('innovation')?.value;
    if (innovationId) {
      const innovation = this.innovations.find(i => i.id == innovationId);
      if (innovation && innovation.owner) {
        return innovation.owner;
      }
    }
    
    return 'Empreendedor';
  }

  getInnovationName(): string {
    const innovationId = this.proposalForm.get('innovation')?.value;
    
    if (this.selectedCard && this.selectedCard.nome) {
      return this.selectedCard.nome;
    }
    
    const innovation = this.innovations.find(i => i.id == innovationId);
    return innovation ? innovation.nome : 'Carregando...';
  }

  getDescriptionValue(): string {
    return this.proposalForm.get('descricao')?.value || '';
  }

  formatCurrency(event: any): void {
    let value = event.target.value;

    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');

    // Garante pelo menos "0" caso esteja vazio
    if (value === '') {
      value = '0';
    }

    // Converte para número e divide por 100 para representar centavos
    const numericValue = parseInt(value, 10) / 100;

    // Formata como moeda brasileira com 2 casas decimais
    const formattedValue = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Atualiza o input visivelmente
    event.target.value = formattedValue;

    // Atualiza o valor do formulário (como número ou string)
    this.proposalForm.get('investimento_minimo')?.setValue(numericValue.toFixed(2));
  }


  formatPercentage(event: any): void {
    let value = event.target.value;

    // Remove tudo que não for número
    value = value.replace(/\D/g, '');

    // Garante pelo menos '0' pra permitir digitar 0%
    if (value === '') {
      value = '0';
    }

    // Converte para número decimal com 2 casas (ex: 1 => 0.01, 123 => 1.23)
    const numericValue = parseInt(value, 10) / 100;

    // Garante que não ultrapasse 100%
    const limitedValue = Math.min(numericValue, 100);

    // Formata no padrão brasileiro com 2 casas
    const formattedValue = limitedValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Mostra o valor formatado no input
    event.target.value = formattedValue;

    // Atualiza o formulário com precisão de 2 casas
    this.proposalForm.get('porcentagem_cedida')?.setValue(limitedValue.toFixed(2));
  }


  onCancel(): void {
    this.cancelled.emit();
  }

}
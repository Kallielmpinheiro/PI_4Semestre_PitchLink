import { NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { CATEGORIES } from '../../../../../core/constants/categories';

interface Innovation {
  id: number;
  created: string;
  modified: string;
  owner_id: number;
  partners: any[];
  nome: string;
  descricao: string;
  investimento_minimo: string;
  porcentagem_cedida: string;
  categorias: string[];
  imagens: string[];
}

@Component({
  selector: 'app-lista-ideias',
  imports: [NgFor, NgIf, NgClass, CommonModule, FormsModule],
  templateUrl: './lista-ideias.component.html',
  styleUrl: './lista-ideias.component.css'
})
export class ListaIdeiasComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  innovations: Innovation[] = [];
  page = 1;
  pageSize = 8;
  isLoading = false;
  
  categories = CATEGORIES;
  
  isModalOpen = false;
  selectedInnovation: Innovation | null = null;
  isEditMode = false;
  originalInnovation: Innovation | null = null;

  ngOnInit() {
    this.loadInnovations();
  }

  loadInnovations() {
    this.isLoading = true;
    this.authService.getInnovation().subscribe({
      next: (response) => {
        console.log('Resposta das inovações:', response);
        const innovations = response.message || response.data || response;
        
        this.innovations = Array.isArray(innovations) ? innovations : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar inovações:', error);
        this.isLoading = false;
      }
    });
  }

  get paginatedInnovations(): Innovation[] {
    const start = (this.page - 1) * this.pageSize;
    return this.innovations.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.innovations.length / this.pageSize);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
    }
  }

  viewInnovation(innovation: Innovation) {
    this.selectedInnovation = { ...innovation };
    this.originalInnovation = { ...innovation };
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  editInnovation(innovation: Innovation) {
    this.selectedInnovation = { ...innovation };
    this.originalInnovation = { ...innovation };
    this.isEditMode = true;
    this.isModalOpen = true;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.selectedInnovation) {
      this.originalInnovation = { ...this.selectedInnovation };
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedInnovation = null;
    this.originalInnovation = null;
    this.isEditMode = false;
  }

  cancelEdit() {
    if (this.originalInnovation) {
      this.selectedInnovation = { ...this.originalInnovation };
    }
    this.isEditMode = false;
  }

  saveChanges() {
    if (!this.selectedInnovation) return;

    
    const index = this.innovations.findIndex(inn => inn.id === this.selectedInnovation!.id);
    if (index !== -1) {
      this.innovations[index] = { ...this.selectedInnovation };
    }

    this.isEditMode = false;
    this.closeModal();
  }

  toggleCategory(category: string) {
    if (!this.selectedInnovation) return;

    const index = this.selectedInnovation.categorias.indexOf(category);
    if (index > -1) {
      this.selectedInnovation.categorias.splice(index, 1);
    } else {
      this.selectedInnovation.categorias.push(category);
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (!files || !this.selectedInnovation) return;

    for (let file of files) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.selectedInnovation) {
            this.selectedInnovation.imagens.push(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    if (!this.selectedInnovation) return;
    this.selectedInnovation.imagens.splice(index, 1);
  }

  formatCurrency(value: string): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  }

  formatPercentage(value: string): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0%';
    return `${numValue}%`;
  }

  getMainImage(imagens: string[]): string {
    if (imagens && imagens.length > 0) {
      return imagens[0];
    }
    return '/assets/images/default-innovation.jpg';
  }

  getCategoryColor(category: string): string {
    const colors = [
      'bg-blue-900 text-blue-200',
      'bg-green-900 text-green-200',
      'bg-purple-900 text-purple-200',
      'bg-red-900 text-red-200',
      'bg-yellow-900 text-yellow-200',
      'bg-indigo-900 text-indigo-200',
      'bg-pink-900 text-pink-200',
      'bg-gray-900 text-gray-200'
    ];
    
    const index = this.categories.indexOf(category);
    return colors[index % colors.length] || 'bg-gray-900 text-gray-200';
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByInnovationId(index: number, innovation: Innovation): number {
    return innovation.id;
  }
}

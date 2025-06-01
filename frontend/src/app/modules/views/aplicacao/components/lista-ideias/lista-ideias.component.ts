import { NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { CATEGORIES } from '../../../../../core/constants/categories';
import { ResponseModalComponent } from '../../../response-modal/response-modal.component';
import { ModalConfig, Innovation, ImageData } from '../../../../../shared/interfaces/common.interfaces';

@Component({
  selector: 'app-lista-ideias',
  imports: [NgFor, NgIf, CommonModule, FormsModule, ResponseModalComponent],
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
  
  currentImages: ImageData[] = [];
  newImages: File[] = [];
  imagesToDelete: number[] = [];
  previewUrls: string[] = [];

  responseModalConfig: ModalConfig = {
    message: '',
    type: 'info',
    confirmText: 'OK',
    showCancel: false
  };
  responseModalVisible: boolean = false;

  ngOnInit() {
    this.loadInnovations();
  }

  loadInnovations() {
    this.isLoading = true;
    this.authService.getInnovation().subscribe({
      next: (response) => {
        const innovations = response.message || response.data || response;
        
        this.innovations = Array.isArray(innovations) ? innovations : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        this.showResponseModal('Erro ao carregar inovações', error);
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
    this.loadInnovationImages(innovation.id);
  }

  editInnovation(innovation: Innovation) {
    this.selectedInnovation = { ...innovation };
    this.originalInnovation = { ...innovation };
    this.isEditMode = true;
    this.isModalOpen = true;
    this.loadInnovationImages(innovation.id);
  }

  loadInnovationImages(innovationId: number) {
    this.authService.getInnovationImages(innovationId).subscribe({
      next: (response) => {
        this.currentImages = response.images;
      },
      error: (error) => {
        console.error(error);
        this.currentImages = [];
        const messageerror = error
        this.showResponseModal(messageerror, 'error');
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.selectedInnovation) {
      this.originalInnovation = { ...this.selectedInnovation };
      this.resetImageState();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedInnovation = null;
    this.originalInnovation = null;
    this.isEditMode = false;
    this.resetImageState();
  }

  cancelEdit() {
    if (this.originalInnovation) {
      this.selectedInnovation = { ...this.originalInnovation };
    }
    this.isEditMode = false;
    this.resetImageState();
  }

  resetImageState() {
    this.newImages = [];
    this.imagesToDelete = [];
    this.previewUrls = [];
  }

  saveChanges() {
    if (!this.selectedInnovation) return;

    const formData = new FormData();
    
    formData.append('id', this.selectedInnovation.id.toString());
    formData.append('nome', this.selectedInnovation.nome);
    formData.append('descricao', this.selectedInnovation.descricao);
    formData.append('investimento_minimo', this.selectedInnovation.investimento_minimo);
    formData.append('porcentagem_cedida', this.selectedInnovation.porcentagem_cedida);
    formData.append('categorias', this.selectedInnovation.categorias.join(','));
    
    if (this.imagesToDelete.length > 0) {
      formData.append('delete_image_ids', this.imagesToDelete.join(','));
    }
    
    this.newImages.forEach((file, index) => {
      formData.append('novas_imagens', file);
    });
    
    if (this.currentImages.length === this.imagesToDelete.length && this.newImages.length === 0) {
      formData.append('keep_existing_images', 'false');
    }

    this.authService.postUpdateInnovationDetails(formData).subscribe({
      next: (response) => {
        
        const index = this.innovations.findIndex(inn => inn.id === this.selectedInnovation!.id);
        if (index !== -1) {
          this.innovations[index] = { ...this.selectedInnovation! };
        }

        if (this.selectedInnovation) {
          this.loadInnovationImages(this.selectedInnovation.id);
        }
        
        this.isEditMode = false;
        this.resetImageState();
        
        const message = response.message;
        this.showResponseModal(message, 'success');
      },
      error: (error) => {
        console.error(error);
        
        if (this.originalInnovation) {
          this.selectedInnovation = { ...this.originalInnovation };
        }
        this.resetImageState();
        
        const errorMessage = error?.error?.message || error?.message;
        this.showResponseModal(errorMessage, 'error');
      }
    });
  }

  showResponseModal(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.responseModalConfig = {
      message: message,
      type: type,
      confirmText: 'OK',
      showCancel: false
    };
    this.responseModalVisible = true;
  }

  onResponseModalClose() {
    this.responseModalVisible = false;
  }

  onResponseModalConfirm() {
    this.responseModalVisible = false;
  }

  saveInnovation() {
    this.saveChanges();
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
    if (!files) return;

    for (let file of files) {
      if (this.isValidImageFile(file) && (this.currentImages.length + this.newImages.length - this.imagesToDelete.length) < 6) {
        this.newImages.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (!this.isValidImageFile(file)) {
        this.showResponseModal('Arquivo inválido. Use apenas JPG ou PNG com até 5MB.', 'warning');
      } else if ((this.currentImages.length + this.newImages.length - this.imagesToDelete.length) >= 6) {
        this.showResponseModal('Limite máximo de 6 imagens atingido.', 'warning');
        break;
      }
    }
    
    event.target.value = '';
  }

  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  removeExistingImage(imageId: number) {
    if (!this.imagesToDelete.includes(imageId)) {
      this.imagesToDelete.push(imageId);
    }
  }

  restoreImage(imageId: number) {
    const index = this.imagesToDelete.indexOf(imageId);
    if (index > -1) {
      this.imagesToDelete.splice(index, 1);
    }
  }

  removeNewImage(index: number) {
    this.newImages.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  isImageMarkedForDeletion(imageId: number): boolean {
    return this.imagesToDelete.includes(imageId);
  }

  getAllCurrentImages(): any[] {
    const existingImages = this.currentImages
      .filter(img => !this.imagesToDelete.includes(img.id))
      .map(img => ({ ...img, type: 'existing' }));
    
    const newImages = this.previewUrls.map((url, index) => ({
      id: `new_${index}`,
      url: url,
      name: this.newImages[index].name,
      type: 'new'
    }));
    
    return [...existingImages, ...newImages];
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

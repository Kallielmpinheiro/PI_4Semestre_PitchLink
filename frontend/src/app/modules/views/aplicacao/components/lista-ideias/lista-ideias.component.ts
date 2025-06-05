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
  this.authService.getInnovationDetails().subscribe({
    next: (response) => {
      const innovations = response.message || response.data || response;
      
      this.innovations = Array.isArray(innovations) ? innovations : [];
      this.isLoading = false;
    },
    error: (error) => {
      console.error(error);
      this.isLoading = false;
      
      const isNotFoundError = error.status === 404 && 
        error.error?.message === 'Nenhuma inovação encontrada';
      
      if (isNotFoundError) {

        this.innovations = [];
      } else {
        const errorMessage = error?.error?.message || error?.message || 'Erro ao carregar inovações';
        this.showResponseModal(errorMessage, 'error');
      }
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

  cancelInnovation(innovation: Innovation) {
    if (!innovation) return;

    this.responseModalConfig = {
      title: 'Confirmar Cancelamento',
      message: `Tem certeza que deseja cancelar a inovação "${innovation.nome}"? Esta ação não pode ser desfeita e todas as propostas pendentes serão canceladas.`,
      type: 'warning',
      confirmText: 'Sim, Cancelar',
      cancelText: 'Não, Manter',
      showCancel: true
    };
    this.responseModalVisible = true;
    
    this.innovationToCancel = innovation;
  }

  private innovationToCancel: Innovation | null = null;

  onResponseModalConfirm() {
    this.responseModalVisible = false;
    
    if (this.innovationToCancel) {
      this.executeCancelInnovation(this.innovationToCancel);
      this.innovationToCancel = null;
    }
  }

  onResponseModalCancel() {
    this.responseModalVisible = false;
    this.innovationToCancel = null;
  }

  private executeCancelInnovation(innovation: Innovation) {
    this.authService.cancelInovation(innovation.id).subscribe({
      next: (response) => {
        const index = this.innovations.findIndex(inn => inn.id === innovation.id);
        if (index !== -1) {
          this.innovations[index] = { 
            ...this.innovations[index], 
            status: 'cancelled' 
          };
        }

        if (this.selectedInnovation && this.selectedInnovation.id === innovation.id) {
          this.closeModal();
        }
        
        const message = response.message;
        this.showResponseModal(message, 'success');
      },
      error: (error) => {
        console.error('Erro ao cancelar inovação:', error);
        const errorMessage = error?.error?.message || error?.message || 'Erro ao cancelar inovação';
        this.showResponseModal(errorMessage, 'error');
      }
    });
  }

  canCancelInnovation(innovation: Innovation): boolean {
    return innovation.status !== 'cancelled' && innovation.status !== 'completed';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa',
      'cancelled': 'Cancelada',
      'completed': 'Concluída',
      'pending': 'Pendente'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'active': 'bg-green-600 text-green-200',
      'cancelled': 'bg-red-600 text-red-200',
      'completed': 'bg-blue-600 text-blue-200',
      'pending': 'bg-yellow-600 text-yellow-200'
    };
    return colorMap[status] || 'bg-gray-600 text-gray-200';
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

  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  }

  formatPercentage(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue}%`;
  }

  toggleCategory(category: string): void {
    if (!this.selectedInnovation) return;
    
    const index = this.selectedInnovation.categorias.indexOf(category);
    if (index > -1) {
      this.selectedInnovation.categorias.splice(index, 1);
    } else {
      this.selectedInnovation.categorias.push(category);
    }
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const totalImages = this.getAllCurrentImages().length;
    const maxImages = 6;
    const availableSlots = maxImages - totalImages;

    if (availableSlots <= 0) {
      this.showResponseModal('Máximo de 6 imagens permitido', 'warning');
      return;
    }

    const filesToAdd = Math.min(files.length, availableSlots);
    
    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      // Validar tipo de arquivo
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        this.showResponseModal(`Arquivo ${file.name} não é uma imagem válida`, 'error');
        continue;
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showResponseModal(`Arquivo ${file.name} é muito grande (máx. 5MB)`, 'error');
        continue;
      }
      
      this.newImages.push(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    // Limpar input
    event.target.value = '';
  }

  getAllCurrentImages(): any[] {
    const existingImages = this.currentImages.filter(img => !this.imagesToDelete.includes(img.id));
    return [...existingImages, ...this.newImages];
  }

  isImageMarkedForDeletion(imageId: number): boolean {
    return this.imagesToDelete.includes(imageId);
  }

  removeExistingImage(imageId: number): void {
    if (!this.imagesToDelete.includes(imageId)) {
      this.imagesToDelete.push(imageId);
    }
  }

  restoreImage(imageId: number): void {
    const index = this.imagesToDelete.indexOf(imageId);
    if (index > -1) {
      this.imagesToDelete.splice(index, 1);
    }
  }

  removeNewImage(index: number): void {
    this.newImages.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }
}

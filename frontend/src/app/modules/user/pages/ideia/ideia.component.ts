import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { AlertFormComponent } from '../../components/alert-form/alert-form.component';
import { ResponseModalComponent } from '../../../views/response-modal/response-modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CATEGORIES } from '../../../../core/constants/categories';
import { ModalConfig } from '../../../../shared/interfaces/common.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ideia',
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    AlertFormComponent,
    ResponseModalComponent
  ],
  templateUrl: './ideia.component.html',
  styleUrl: './ideia.component.css'
})
export class IdeiaComponent {

  submitForm = false;
  categories = CATEGORIES
  selectedFiles: File[] = [];
  previewImages: string[] = [];

  private formBuilderService = inject(FormBuilder);
  private authService = inject(AuthService)
  private readonly router = inject(Router);

  // Response Modal Configuration
  responseModalConfig: ModalConfig = {
    message: '',
    type: 'info',
    confirmText: 'OK',
    showCancel: false
  };
  responseModalVisible: boolean = false;

  // form
  protected formNewIdea = this.formBuilderService.group({
    nameIdeia: ["", [Validators.required]],
    descriptionIdeia: ["", [Validators.required, Validators.minLength(30)]],
    valueInvestment: [0, [Validators.required, Validators.min(1)]],
    valueIPercentInvestment: [0, [Validators.required, Validators.min(1)]],
    categoriesItens: this.buildCategories()
  });

  // nomes tratados para callback
  protected formFieldNames: { [key: string]: string } = {
    nameIdeia: "Nome da Ideia",
    descriptionIdeia: "Descrição da Ideia",
    valueInvestment: "Valor do Investimento",
    valueIPercentInvestment: "Porcentagem de Investimento",
    categoriesItens: "Categorias"
  };
  
  // slots das img
  getRemainingSlots(): number[] {
    const uploadButtonSlot = this.previewImages.length < 6 ? 1 : 0;
    const totalSlots = 6;
    const usedSlots = this.previewImages.length + uploadButtonSlot;
    const remainingSlots = Math.max(0, totalSlots - usedSlots);

    return Array(remainingSlots).fill(0);
  }

  // categorias
  private getSelectedCategories(): string[] {
    const selected = (this.formNewIdea.get('categoriesItens') as FormArray).controls
      .map((control, index) => control.value ? this.categories[index] : null)
      .filter(Boolean) as string[];
    return selected;
  }

  buildCategories() {
    const values = this.categories.map(() => new FormControl(false));
    return this.formBuilderService.array(values, [Validators.required]);
  }

  // tratamento das img
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isValidImageFile(file) && this.previewImages.length < 6) {
          this.selectedFiles.push(file);

          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png'];
    return validTypes.includes(file.type);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }
  
  submitFomr() {
    if (this.formNewIdea.valid) {
      this.submitForm = true;

      const formData = new FormData();
      formData.append('nome', this.formNewIdea.value.nameIdeia || '');
      formData.append('descricao', this.formNewIdea.value.descriptionIdeia?.trim() || '');
      formData.append('investimento_minimo', this.formNewIdea.value.valueInvestment?.toString() || '0');
      formData.append('porcentagem_cedida', this.formNewIdea.value.valueIPercentInvestment?.toString() || '0');
      formData.append('categorias', this.getSelectedCategories().join(','));

      this.selectedFiles.forEach((file, index) => {
        formData.append(`imagens`, file);
      });
      
      this.authService.postCreateInnovation(formData).subscribe({
        next: (response) => {
          console.log(response)
          this.submitForm = false;
          this.showSuccessModal(response.message);
          this.resetForm();
        },
        error: (error) => {
          console.log(error.error?.message || error.message);
          this.submitForm = false;
          this.showErrorModal(error.error?.message || 'Erro ao criar inovação');
        }
      });
    } else {
      let firstErrorKey: string | null = null;
      Object.keys(this.formNewIdea.controls).forEach(key => {
        const control = this.formNewIdea.get(key);
        if (control?.errors && !firstErrorKey) {
          firstErrorKey = key;
        }
      });

      let errorMessage = 'Formulário inválido';
      if (firstErrorKey) {
        const control = this.formNewIdea.get(firstErrorKey);
        const friendlyName = this.formFieldNames[firstErrorKey] || firstErrorKey; 

        if (control?.errors) {
          if (control.errors['required']) {
            errorMessage = `O campo ${friendlyName} é obrigatório`;
          } else if (control.errors['min']) {
            errorMessage = `O campo ${friendlyName} precisa ser maior ou igual a ${control.errors['min'].min}`;
          } else if (control.errors['minlength']) {
            errorMessage = `O campo ${friendlyName} precisa ter no mínimo ${control.errors['minlength'].requiredLength} caracteres`;
          }
        }
      }
      
      this.showErrorModal(errorMessage);
      this.formNewIdea.markAllAsTouched();
    }
  }

  private showSuccessModal(message: string): void {
    this.responseModalConfig = {
      title: 'Ideia Criada!',
      message: message || 'Sua ideia foi criada com sucesso.',
      type: 'success',
      confirmText: 'Continuar',
      showCancel: false
    };
    this.responseModalVisible = true;
  }

  private showErrorModal(message: string): void {
    this.responseModalConfig = {
      title: 'Erro',
      message: message,
      type: 'error',
      confirmText: 'Tentar Novamente',
      showCancel: false
    };
    this.responseModalVisible = true;
  }

  onResponseModalConfirm(): void {
    if (this.responseModalConfig.type === 'success') {
      this.router.navigate(['/app/recs']);
    }
    this.closeResponseModal();
  }

  closeResponseModal(): void {
    this.responseModalVisible = false;
  }

  // valida porcentagem
  validationPercent() {
    const value = this.formNewIdea.value.valueIPercentInvestment || 0;
    if (value < 0 || value > 100) {
      this.formNewIdea.patchValue({
        valueIPercentInvestment: 0
      })
    }
  }

  resetForm() {
    this.formNewIdea.reset();
    this.formNewIdea.setControl('categoriesItens', this.buildCategories());
    this.selectedFiles = [];
    this.previewImages = [];
  }
}

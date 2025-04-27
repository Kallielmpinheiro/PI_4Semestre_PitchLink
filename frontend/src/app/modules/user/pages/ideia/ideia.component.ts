import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { formatCurrency } from '@angular/common';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { AlertFormComponent } from '../../components/alert-form/alert-form.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-ideia',
  imports: [
    NavBarComponent,
    ReactiveFormsModule,
    ModalComponent,
    AlertFormComponent    
  ],
  templateUrl: './ideia.component.html',
  styleUrl: './ideia.component.css'
})
export class IdeiaComponent {
imageUser() {
throw new Error('Method not implemented.');
}

  /*
  TODO: 
    AJUSTAR ALERTAS
    ADICIONAR GRID DE IMAGES

  */

  teste = [0, 1,2,3, 4,5]
  submitForm = false;
  categories = [
    "Tecnologia", "Marketing", "Vendas", "Finanças", "Gestão de Projetos",
    "Recursos Humanos", "Design", "Desenvolvimento Web", "Desenvolvimento Mobile",
    "Inteligência Artificial", "Blockchain", "Consultoria", "Educação", "Investimentos",
    "Saúde", "E-commerce", "Startups", "Sustentabilidade", "Publicidade",
    "Produção de Conteúdo", "Mentoria", "Inovação", "Relacionamento com Clientes",
    "Marketing Digital", "Marketing de Conteúdo", "Venture Capital", "Parcerias Estratégicas",
    "Franquias", "Serviços Jurídicos", "Seguros", "Imobiliário", "Logística",
    "Produção Audiovisual", "Empreendedorismo Social", "Negócios Internacionais",
    "Gestão de Marca", "Consultoria Financeira", "Tecnologia Educacional",
    "Games e Entretenimento", "Comunicação Corporativa", "Mentoria de Carreira",
    "Big Data e Analytics", "Coworking", "Marketing Pessoal", "Liderança", "Eventos e Conferências"
  ];

  selectedFiles: File[] = [];
  previewImages: string[] = [];

  private formBuilderService = inject(FormBuilder);
  private authService = inject(AuthService)
  protected formNewIdea = this.formBuilderService.group({
    nameIdeia: ["", [Validators.required]],
    descriptionIdeia: [ 
      "", 
      [ Validators.required, Validators.min(30)]
    ],
    valueInvestment: [ 0 ],
    valueIPercentInvestment: [ 0 ],
    categoriesItens: this.buildCategories()
  });
  
  getRemainingSlots(): number[] {

    const uploadButtonSlot = this.previewImages.length < 6 ? 1 : 0;
    const totalSlots = 6;
    const usedSlots = this.previewImages.length + uploadButtonSlot;
    const remainingSlots = Math.max(0, totalSlots - usedSlots);
    
    return Array(remainingSlots).fill(0);
  }

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
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }


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

  validationPercent() {
    const value = this.formNewIdea.value.valueIPercentInvestment || 0;

    if( value < 0 || value > 100) {
      this.formNewIdea.patchValue({
        valueIPercentInvestment: 0
      })
    }
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
        this.submitForm = false;
        this.openModal(response.message);
      },
      error: (error) => {
        this.submitForm = false;
        this.openModal(error.error?.message);
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
        if (control?.errors) {
          if (control.errors['required']) {
        errorMessage = `O campo ${firstErrorKey} é obrigatório`;
          } else if (control.errors['min']) {
        errorMessage = `O campo ${firstErrorKey} precisa ter no mínimo ${control.errors['min'].min} caracteres`;
          }
        }
      }
      this.openModal(errorMessage);
      this.formNewIdea.markAllAsTouched();
    }
  }

  modalText: string = '';

openModal(text: string) {
  this.modalText = text;
  const modal = document.getElementById('response-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

closeModal() {
  const modal = document.getElementById('response-modal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }}

}

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

      
      const formData = {
        nome: this.formNewIdea?.value.nameIdeia,
        descricao: this.formNewIdea.value.descriptionIdeia?.trim(),
        investimento_minimo: this.formNewIdea.value.valueInvestment?.toString(),
        porcentagem_cedida: this.formNewIdea.value.valueIPercentInvestment?.toString(),
        categorias: this.getSelectedCategories().join(','), 
        imagem: null 
      };
  
      this.authService.postCreateInnovation(formData).subscribe({
        next: (response) => {
          console.log('Innovation created successfully', response);
          this.submitForm = false;
        },
        error: (error) => {
          console.error('Error creating innovation', error);
          this.submitForm = false;
        }
      });
    } else {
      Object.keys(this.formNewIdea.controls).forEach(key => {
        this.formNewIdea.get(key)?.markAsTouched();
      });
    }
  }

}

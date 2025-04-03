import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { formatCurrency } from '@angular/common';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { AlertFormComponent } from '../../components/alert-form/alert-form.component';

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

  /*
  TODO: 
    AJUSTAR ALERTAS
    ADICIONAR GRID DE IMAGES

  */
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
  
  submitFomr() {
    console.log(this.formNewIdea.valid)
    console.log(this.formNewIdea.getError("nameIdea"))
    

    if( this.formNewIdea.valid ) {
      const formData = {
        nameIdeia: this.formNewIdea?.value.nameIdeia,
        descriptionIdeia: this.formNewIdea.value.descriptionIdeia?.trim(),
        valueInvestment: this.formNewIdea.value.valueInvestment,
        valueIPercentnvestment: this.formNewIdea.value.valueIPercentInvestment, 
        categoriesItens: this.getSelectedCategories(),
      };

      console.log(formData)
    }
    
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
}

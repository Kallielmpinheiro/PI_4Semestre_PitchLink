import { NgModule } from '@angular/core';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';


@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, NavBarComponent, CommonModule, ModalComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})

export class PerfilComponent {

  categories = [
    "Tecnologia",
    "Marketing",
    "Vendas",
    "Finanças",
    "Gestão de Projetos",
    "Recursos Humanos",
    "Design",
    "Desenvolvimento Web",
    "Desenvolvimento Mobile",
    "Inteligência Artificial",
    "Blockchain",
    "Consultoria",
    "Educação",
    "Investimentos",
    "Saúde",
    "E-commerce",
    "Startups",
    "Sustentabilidade",
    "Publicidade",
    "Produção de Conteúdo",
    "Mentoria",
    "Inovação",
    "Relacionamento com Clientes",
    "Marketing Digital",
    "Marketing de Conteúdo",
    "Venture Capital",
    "Parcerias Estratégicas",
    "Franquias",
    "Serviços Jurídicos",
    "Seguros",
    "Imobiliário",
    "Logística",
    "Produção Audiovisual",
    "Empreendedorismo Social",
    "Negócios Internacionais",
    "Gestão de Marca",
    "Consultoria Financeira",
    "Tecnologia Educacional",
    "Games e Entretenimento",
    "Comunicação Corporativa",
    "Mentoria de Carreira",
    "Big Data e Analytics",
    "Coworking",
    "Marketing Pessoal",
    "Liderança",
    "Eventos e Conferências"
  ];
  
  private formBuilderService = inject(FormBuilder)

  imageUser: WritableSignal<string | null | ArrayBuffer> = signal(null)

  protected formPerfil = this.formBuilderService.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    data: [""],
    categoriesItens: this.buildCategories()
    
  })

  buildCategories() {
    const values =  this.categories.map(() => new FormControl(false))
    
    return this.formBuilderService.array(values)
  }

  changePhoto(event: Event) {
    const inputImageUser = event.target as HTMLInputElement

    if (inputImageUser.files && inputImageUser.files[0]) {
      const file = inputImageUser.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        this.imageUser.set(reader.result)
        inputImageUser.value = ""
      }

      reader.readAsDataURL(file)
    }
  }

  removePhoto() {
    this.imageUser.set(null)
  }

 

  sendForm() {
    const date = document.getElementById("data") as HTMLInputElement;

    this.formPerfil.patchValue( { data: date.value })    

    console.log(this.formPerfil.value); 

  }
}

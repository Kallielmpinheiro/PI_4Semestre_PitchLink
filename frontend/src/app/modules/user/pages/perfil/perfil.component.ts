import { Component, inject, signal, WritableSignal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormArray, FormGroup } from '@angular/forms';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CommonModule, formatDate } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { AlertFormComponent } from '../../components/alert-form/alert-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface DateValidationResult {
  invalidDate?: boolean;
  required?: boolean;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NavBarComponent, 
    CommonModule, 
    ModalComponent,
    AlertFormComponent
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']

})

export class PerfilComponent implements OnInit {

  userProfile: any = null;
  loading = false;
  error: string | null = null;
  hideNav = true;
  submittedFormPerfil = false;
  imageUser: WritableSignal<string | null | ArrayBuffer> = signal(null);

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

  protected formPerfil = this.formBuilderService.group({
    firstName: ["", [Validators.required, Validators.minLength(2)]],
    lastName: ["", Validators.required],
    data: [""],
    categoriesItens: this.buildCategories()

  });

  constructor(
    private route: ActivatedRoute, 
    private authService: AuthService,
    private router: Router
  ) {
    this.route.data.subscribe(data => {
      this.hideNav = data['hideNav'];
    });
  }

  ngOnInit() {
    this.loadUserProfileData();
  }

  
  dateValidator(control: FormControl): { [key: string]: any } | null {
    if (!control.value || control.value.trim() === '') {
      return null;
    }
  
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = control.value.match(dateRegex);
    
    if (!match) {
      return { invalidFormat: true };
    }
  
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
  
    if (month < 1 || month > 12) return { invalidDate: true };
    if (day < 1 || day > 31) return { invalidDate: true };
  
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return { invalidDate: true };
    }
  
    return null;
  }

  formatDateInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
  
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length > 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
  
    input.value = value;
    this.formPerfil.get('data')?.setValue(value);
  }

  buildCategories() {
    const values = this.categories.map(() => new FormControl(false));
    return this.formBuilderService.array(values, [Validators.required]);
  }

  loadUserProfileData() {
    this.loading = true;
    this.error = null;
    
    this.authService.DTO().subscribe({
      next: (response: any) => {
        console.log(response);
        
        if (Array.isArray(response) && response.length === 2 && response[0] === 200) {
          this.userProfile = response[1];
        } else if (response?.status === 200) {
          this.userProfile = response.dados || response;
        } else if (typeof response === 'object') {
          this.userProfile = response;
        }
        
        this.updateFormWithProfileData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.error = err.error?.message || err.message;
        this.loading = false;
      }
    });
  }

  private updateFormWithProfileData() {
    if (!this.userProfile) return;

    let firstName = '';
    let lastName = '';
    
    if (this.userProfile.provedores) {
      if (this.userProfile.provedores['linkedin-server']) {
        firstName = this.userProfile.provedores['linkedin-server'].given_name || '';
        lastName = this.userProfile.provedores['linkedin-server'].family_name || '';
      } else if (this.userProfile.provedores['google']) {
        firstName = this.userProfile.provedores['google'].given_name || '';
        if (this.userProfile.provedores['google'].name && 
            this.userProfile.provedores['google'].name !== firstName) {
          const nameParts = this.userProfile.provedores['google'].name.split(' ');
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(' ');
          }
        }
      }
    }
    
    if (!firstName && this.userProfile.username) {
      firstName = this.userProfile.username;
    }
    
    this.formPerfil.patchValue({
      firstName: firstName,
      lastName: lastName
    });
    
    if (this.userProfile.provedores) {
      if (this.userProfile.provedores['linkedin-server']?.url_imagem_perfil) {
        this.imageUser.set(this.userProfile.provedores['linkedin-server'].url_imagem_perfil);
      } else if (this.userProfile.provedores['google']?.picture) {
        this.imageUser.set(this.userProfile.provedores['google'].picture);
      }
    }
    
    if (this.userProfile.data_nasc) {
      const [year, month, day] = this.userProfile.data_nasc.split('-');
      if (year && month && day) {
        const formattedDate = `${day}/${month}/${year}`;
        this.formPerfil.get('data')?.setValue(formattedDate);
      }
    }
    
    if (this.userProfile.categorias?.length) {
      const categoriesArray = this.formPerfil.get('categoriesItens') as FormArray;
      categoriesArray.clear();
      
      this.categories.forEach(category => {
        const isSelected = this.userProfile?.categorias.includes(category);
        categoriesArray.push(new FormControl(isSelected));
      });
    }
  }

  changePhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUser.set(reader.result);
        input.value = "";
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removePhoto() {
    this.imageUser.set(null);
  }

  sendForm() {
    this.submittedFormPerfil = true;
    this.markFormGroupTouched(this.formPerfil);
  
    if (this.formPerfil.valid) {
      this.loading = true;
  
      const rawDate = this.formPerfil.get('data')?.value;
      let formattedDate = null;
  
      if (rawDate && rawDate.trim() !== '') {
        try {
          const cleanedDate = rawDate.replace(/\D/g, '');
          
          const day = cleanedDate.substring(0, 2);
          const month = cleanedDate.substring(2, 4);
          const year = cleanedDate.substring(4, 8);
  
          if (day && month && year) {
            formattedDate = `${year}-${month}-${day}`;
            
            const dateObj = new Date(formattedDate);
            if (isNaN(dateObj.getTime())) {
              throw new Error('Data inválida');
            }
          }
        } catch (e) {
          console.error('Erro ao formatar data:', e);
          this.loading = false;
          return;
        }
      }
  
      const formData = {
        email: this.userProfile?.email,
        first_name: this.formPerfil.value.firstName?.trim(),
        last_name: this.formPerfil.value.lastName?.trim(),
        data_nasc: formattedDate, 
        categories: this.getSelectedCategories(),
        profile_picture: this.imageUser() ? this.imageUser() : null
      };
  
      console.log(formData);
  
      this.authService.saveFullProfile(formData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.status === 200) {
            this.userProfile = {
              ...this.userProfile,
              first_name: formData.first_name,
              last_name: formData.last_name,
              data_nasc: formattedDate,
              categorias: formData.categories,
              profile_picture: formData.profile_picture
            };

            this.router.navigate(['/app/recs'])

          }
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert(err.error?.message);
        }
      });
    }
  }

  

  private getSelectedCategories(): string[] {
    const selected = (this.formPerfil.get('categoriesItens') as FormArray).controls
      .map((control, index) => control.value ? this.categories[index] : null)
      .filter(Boolean) as string[];
    console.log(selected);
    return selected;
  }

  
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
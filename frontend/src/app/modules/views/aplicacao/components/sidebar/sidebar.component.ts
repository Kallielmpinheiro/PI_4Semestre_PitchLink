import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { environment } from '../../../../../../environments/environment.prod';
import { MensagensPropostaComponent } from './mensagens-proposta/mensagens-proposta.component';
import { Router } from '@angular/router';
import { ConfiguracoesComponent } from './configuracoes/configuracoes.component';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    MensagensPropostaComponent,
    ConfiguracoesComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent implements OnInit {

  isRecs = false;
  isPerfil = false;

  nome: string = '';
  sobrenome: string = '';
  email: string = '';
  data_nasc: string = '';
  categories: string = '';

  imagem: string = '';

  constructor(
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    initFlowbite();

    this.isRecs = this.router.url === '/app/recs';
    this.isPerfil = this.router.url === '/app/perfil';

    this.authService.image().subscribe(
      imageResponse => {

        // Verifica se a URL já é absoluta

        if (imageResponse.image_url.startsWith('http')) {
          this.imagem = imageResponse.image_url;
        } else {
          this.imagem = `${environment.getBaseUrl()}${imageResponse.image_url}`;
        }
      },
      error => {
        console.error(error);
      }
    );

    this.authService.getUser().subscribe(
      dataResponse =>{
        this.nome = dataResponse.data.first_name;
        this.sobrenome = dataResponse.data.last_name;
        this.email = dataResponse.data.email;
        this.data_nasc = dataResponse.data.data_nasc;
        this.categories = dataResponse.data.categories;
  
        
    },
    error => {
      console.error('Error fetching user data:', error);
    }

      

    )

  }
}

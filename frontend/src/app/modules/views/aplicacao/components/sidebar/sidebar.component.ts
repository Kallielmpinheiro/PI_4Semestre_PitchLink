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
  }
}

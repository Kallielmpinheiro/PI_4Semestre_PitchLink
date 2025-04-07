import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

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
  ) {}

    ngOnInit(): void {
      initFlowbite();
      this.isRecs = this.router.url === '/app/recs';
      this.isPerfil = this.router.url === '/app/perfil';

      this.authService.checkAuth().subscribe(response => {
        let data: any = response.data[0]
        this.nome = `${data.first_name} ${data.last_name}`
        this.imagem = data.profile_picture
      });
    }
}

import { Component } from '@angular/core';
import { AuthService } from '../../../../../../core/services/auth.service';

@Component({
  selector: 'app-configuracoes',
  imports: [],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent {
    constructor(
      private authService: AuthService,
    ) {}
  
  logout(){
    this.authService.logout().subscribe();
  }
}

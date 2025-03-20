import { Component } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-modal-login',
  imports: [],
  templateUrl: './modal-login.component.html',
  styleUrl: './modal-login.component.css'
})
export class ModalLoginComponent {
  constructor(private authService: AuthService) {}

  loginWithGoogle() {
    this.authService.loginWithGoogle();
    console.log('test')
  }

  loginWithLinkedin(){
    this.authService.loginWithLinkedin();
  }

  Listarusuarios() {
    this.authService.ListService().subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Requisição completada');
      }
    });
  }

}

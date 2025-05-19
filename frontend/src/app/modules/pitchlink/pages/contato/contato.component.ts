import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-contato',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css'
})
export class ContatoComponent {

}

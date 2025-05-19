import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-politicas-privacidade',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './politicas-privacidade.component.html',
  styleUrl: './politicas-privacidade.component.css'
})
export class PoliticasPrivacidadeComponent {

}

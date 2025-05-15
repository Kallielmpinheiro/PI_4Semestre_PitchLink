import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-licenciamento',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './licenciamento.component.html',
  styleUrl: './licenciamento.component.css'
})
export class LicenciamentoComponent {

}

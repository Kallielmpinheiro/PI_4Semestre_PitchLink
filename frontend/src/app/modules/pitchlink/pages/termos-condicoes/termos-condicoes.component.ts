import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-termos-condicoes',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './termos-condicoes.component.html',
  styleUrl: './termos-condicoes.component.css'
})
export class TermosCondicoesComponent {

}

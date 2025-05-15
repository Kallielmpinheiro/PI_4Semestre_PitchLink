import { Component } from '@angular/core';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-sobre',
  imports: [HeaderComponent, ModalLoginComponent, FooterComponent],
  templateUrl: './sobre.component.html',
  styleUrl: './sobre.component.css'
})
export class SobreComponent {

}

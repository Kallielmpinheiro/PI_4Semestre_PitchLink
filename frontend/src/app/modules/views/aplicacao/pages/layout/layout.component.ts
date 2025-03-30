import { SidebarComponent } from './../../components/sidebar/sidebar.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-layout',
  imports: [
    SidebarComponent,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}

import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    private authService: AuthService,
  ) {}

    ngOnInit(): void {
      initFlowbite();
    }

    logout(){
      this.authService.logout().subscribe();
    }
}

import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Online' | 'Offline';
  avatar: string;
  selected: boolean;
}

@Component({
  selector: 'app-lista-ideias',
  imports: [NgClass, NgFor],
  templateUrl: './lista-ideias.component.html',
  styleUrl: './lista-ideias.component.css'
})
export class ListaIdeiasComponent {
  users: User[] = [
    // 👇 adicione mais para testar a paginação
    { id: 1, name: 'Neil Sims', email: 'neil.sims@company.com', role: 'React Developer', status: 'Online', avatar: '/assets/neil.jpg', selected: false },
    { id: 2, name: 'Bonnie Green', email: 'bonnie.green@company.com', role: 'UI/UX Designer', status: 'Offline', avatar: '/assets/bonnie.jpg', selected: false },
    { id: 3, name: 'John Doe', email: 'john.doe@company.com', role: 'Backend Dev', status: 'Offline', avatar: '/assets/john.jpg', selected: false },
    { id: 4, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Fullstack Dev', status: 'Online', avatar: '/assets/jane.jpg', selected: false },
    { id: 5, name: 'Carlos Lima', email: 'carlos.lima@company.com', role: 'DevOps Engineer', status: 'Online', avatar: '/assets/carlos.jpg', selected: false },
    { id: 6, name: 'Lúcia Alves', email: 'lucia.alves@company.com', role: 'Product Manager', status: 'Offline', avatar: '/assets/lucia.jpg', selected: false },
  ];

  page = 1;
  pageSize = 8;

  get paginatedUsers(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
    }
  }

  toggleAll() {
    const allSelected = this.paginatedUsers.every(u => u.selected);
    this.paginatedUsers.forEach(u => u.selected = !allSelected);
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.every(u => u.selected);
  }

  editUser(user: User) {
    console.log('Editar:', user);
  }
}

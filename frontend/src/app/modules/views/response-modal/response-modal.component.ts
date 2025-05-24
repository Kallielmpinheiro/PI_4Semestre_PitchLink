import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfig } from '../../../shared/interfaces/common.interfaces';

@Component({
  selector: 'app-response-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './response-modal.component.html',
  styleUrl: './response-modal.component.css'
})
export class ResponseModalComponent {
  
  @Input() visible: boolean = false;
  @Input() config: ModalConfig = {
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false
  };

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  getIconPath(): string {
    switch (this.config.type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getIconColor(): string {
    switch (this.config.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  }

  getIconBgColor(): string {
    switch (this.config.type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  }

  getConfirmButtonClasses(): string {
    switch (this.config.type) {
      case 'success':
        return 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:focus:ring-green-800';
      case 'error':
        return 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:focus:ring-red-800';
      case 'warning':
        return 'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-300 dark:focus:ring-yellow-800';
      default:
        return 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800';
    }
  }

  handleConfirm(): void {
    this.onConfirm.emit();
    this.close();
  }

  handleCancel(): void {
    this.onCancel.emit();
    this.close();
  }

  close(): void {
    this.onClose.emit();
  }
}

import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModalComponent {
  // Inputs using signal-based input()
  isOpen = input(false);
  title = input('Confirm Action');
  message = input('Are you sure you want to proceed?');
  confirmText = input('Confirm');
  cancelText = input('Cancel');
  confirmClass = input('bg-red-500 hover:bg-red-600'); // Destructive by default
  requireTypedConfirmation = input(false);
  confirmationWord = input('DELETE');

  // Outputs using signal-based output()
  confirmed = output<void>();
  cancelled = output<void>();

  // Internal state
  typedInput = signal('');

  // Computed property for validation
  canConfirm = computed(() => {
    if (!this.requireTypedConfirmation()) return true;
    return this.typedInput() === this.confirmationWord();
  });

  onConfirm(): void {
    if (this.canConfirm()) {
      this.typedInput.set('');
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    this.typedInput.set('');
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCancel();
    }
  }
}

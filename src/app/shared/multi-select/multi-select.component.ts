import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent implements OnChanges {
  @Input() items: SelectItem[] = [];
  @Input() placeholder = 'اختر...';
  @Input() label = '';
  @Input() required = false;
  @Input() invalid = false;
  @Input() preSelectedIds: number[] = [];

  @Output() selectionChange = new EventEmitter<number[]>();

  selectedIds: number[] = [];
  isOpen = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preSelectedIds'] && this.preSelectedIds?.length) {
      this.selectedIds = [...this.preSelectedIds];
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  toggleItem(id: number, event: MouseEvent): void {
    event.stopPropagation();
    const idx = this.selectedIds.indexOf(id);
    if (idx === -1) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter((i) => i !== id);
    }
    this.selectionChange.emit(this.selectedIds);
  }

  removeItem(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedIds = this.selectedIds.filter((i) => i !== id);
    this.selectionChange.emit(this.selectedIds);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  getItemName(id: number): string {
    return this.items.find((i) => i.id === id)?.name ?? '';
  }

  clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedIds = [];
    this.selectionChange.emit(this.selectedIds);
  }
}

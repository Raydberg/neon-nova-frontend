import { ChangeDetectionStrategy, Component, input, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'pagination',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input<number>(1);
  totalPages = input<number>(1);

  pageChange = output<number>();

  showPagination = computed(() => this.totalPages() > 1);

  isFirstPage = computed(() => this.currentPage() <= 1);

  isLastPage = computed(() => this.currentPage() >= this.totalPages());

  pageNumbers = computed(() => {
    const result: number[] = [];
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      result.push(1);

      if (currentPage <= 4) {
        // Near the start
        result.push(2, 3, 4, 5, -1);
      } else if (currentPage >= totalPages - 3) {
        result.push(-1);
        for (let i = totalPages - 4; i < totalPages; i++) {
          result.push(i);
        }
      } else {
        result.push(-1, currentPage - 1, currentPage, currentPage + 1, -1);
      }

      result.push(totalPages);
    }

    return result;
  });

  // Helper methods
  goToPreviousPage(): void {
    if (!this.isFirstPage()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (!this.isLastPage()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    if (page !== -1 && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  isActivePage = computed(() => {
    return (page: number) => page === this.currentPage();
  });
}

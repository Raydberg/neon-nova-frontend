import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LucideAngularModule} from 'lucide-angular';
import type {ProductByComments, Comment} from '@app/core/interfaces/product-by-comments.interface';
import {RatingDisplayComponent} from '../rating-display/rating-display.component';

@Component({
  selector: 'comments-section',
  imports: [CommonModule, LucideAngularModule, RatingDisplayComponent],
  templateUrl: './comments-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsSectionComponent {
  product = input.required<ProductByComments | null>();
  currentPage = input.required<number>();

  pageChange = output<number>();

  protected comments = computed<Comment[]>(() => this.product()?.comments || []);
  protected totalCommentsCount = computed(() => this.product()?.totalCommentsCount || 0);
  protected rating = computed(() => this.product()?.punctuation || 0);

  getPageNumbers(): number[] {
    const totalPages = this.product()?.commentsTotalPages || 0;
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  getCommentsPageNumber(): number {
    return this.product()?.commentsPageNumber || 1;
  }

  getCommentsTotalPages(): number {
    return this.product()?.commentsTotalPages || 1;
  }

  loadCommentPage(page: number): void {
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  getFirstLetterUppercase(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '';
  }

  getRingClass(rating: number): string {
    if (rating >= 4) return 'ring ring-primary ring-offset-base-100 ring-offset-2';
    if (rating === 3) return 'ring ring-warning ring-offset-base-100 ring-offset-2';
    return 'ring ring-error ring-offset-base-100 ring-offset-2';
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ProductByComments, Comment } from '@app/core/interfaces/product-by-comments.interface';
import { RatingDisplayComponent } from '../rating-display/rating-display.component';
import { AuthService } from '@app/core/services/auth.service';
import { ProductCommentService, CommentRequest } from '@app/core/services/product-comment.service';
import { NotificationService } from '@app/core/services/notification.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {AvatarService} from '@core/services/avatar.service';
import {environment} from '@environments/environment';

@Component({
  selector: 'comments-section',
  imports: [CommonModule, LucideAngularModule, RatingDisplayComponent, FormsModule],
  templateUrl: './comments-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsSectionComponent {
  private authService = inject(AuthService);
  private commentService = inject(ProductCommentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private avatarService = inject(AvatarService);

  private avatarLoadErrors = signal<Record<string, boolean>>({});

  product = input.required<ProductByComments | null>();
  currentPage = input.required<number>();

  pageChange = output<number>();
  commentAdded = output<void>();

  // Estado UI
  isWritingReview = signal(false);
  isSubmitting = signal(false);
  isEditingMode = signal(false);
  isDeleting = signal(false);

  // Datos del nuevo comentario
  newComment = signal('');
  newRating = signal(0);

  // Comentario que está siendo editado o eliminado
  currentCommentId = signal<number | null>(null);

  // Modal de confirmación para eliminar
  showDeleteModal = signal(false);

  // Datos calculados
  protected comments = computed<Comment[]>(() => this.product()?.comments || []);
  protected totalCommentsCount = computed(() => this.product()?.totalCommentsCount || 0);
  protected rating = computed(() => this.product()?.punctuation || 0);
  protected isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected currentUserId = computed(() => this.authService.getUserId());

  // Verificar si el usuario ya ha comentado
  protected hasUserAlreadyCommented = computed(() => {
    const userId = this.currentUserId();
    if (!userId) return false;
    return this.commentService.hasUserCommented(
      this.product()?.id || 0,
      userId,
      this.comments()
    );
  });

  constructor() {
    // Efecto para reiniciar el formulario cuando cambia el producto
    effect(() => {
      if (this.product()) {
        this.resetCommentForm();
      }
    });
  }
  // Métodos para gestionar avatares
  hasAvatar(comment: Comment): boolean {
    return !!comment.avatarUrl && !this.avatarLoadErrors()[comment.userId];
  }
  getUserAvatar(comment: Comment): string | null {
    if (this.avatarLoadErrors()[comment.userId]) return null;

    if (comment.avatarUrl) {
      // Procesar la URL del avatar (maneja URLs de Google y rutas relativas)
      return this.processAvatarUrl(comment.avatarUrl);
    }

    // Si no hay avatar URL, generamos uno con las iniciales
    return this.avatarService.getAvatarURL(this.getFirstLetterUppercase(comment.userName), comment.userId);
  }
  onAvatarError(userId: string): void {
    // Registrar el error de carga para este avatar
    this.avatarLoadErrors.update(errors => ({
      ...errors,
      [userId]: true
    }));
  }
  getAvatarBackgroundColor(userId: string): string {
    return this.avatarService.getAvatarBackgroundColor(userId);
  }
  private processAvatarUrl(avatarUrl: string | undefined): string | null {
    if (!avatarUrl) return null;

    // URLs absolutas (como las de Google)
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    // URLs relativas API
    if (avatarUrl.startsWith('/api/')) {
      const baseUrl = environment.apiUrl.endsWith('/api')
        ? environment.apiUrl.substring(0, environment.apiUrl.length - 4)
        : environment.apiUrl;

      return `${baseUrl}${avatarUrl}`;
    }

    // Otras URLs relativas
    if (avatarUrl.startsWith('/')) {
      return `${environment.apiUrl}${avatarUrl}`;
    }

    return avatarUrl;
  }
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

  // Método para establecer la calificación
  setRating(rating: number): void {
    this.newRating.set(rating);
  }

  // Método para determinar si un comentario pertenece al usuario actual
  isCommentOwner(comment: Comment): boolean {
    return comment.userId === this.currentUserId();
  }

  // Método para abrir el formulario de comentarios
  startReview(): void {
    if (!this.isLoggedIn()) {
      this.notificationService.warning('Debes iniciar sesión para escribir una reseña');
      const currentUrl = this.router.url;
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: currentUrl }
      });
      return;
    }

    if (this.hasUserAlreadyCommented()) {
      this.notificationService.info('Ya has dejado una reseña para este producto');
      return;
    }

    this.isWritingReview.set(true);
  }

  // Método para cancelar el comentario
  cancelReview(): void {
    this.resetCommentForm();
    this.isWritingReview.set(false);
    this.isEditingMode.set(false);
    this.currentCommentId.set(null);
  }

  // Método para enviar el comentario (crear nuevo o editar existente)
  submitComment(): void {
    if (!this.newComment() || this.newComment().trim() === '') {
      this.notificationService.error('El comentario no puede estar vacío');
      return;
    }

    if (this.newRating() === 0) {
      this.notificationService.error('Debes seleccionar una calificación');
      return;
    }

    const commentRequest: CommentRequest = {
      comment: this.newComment(),
      rating: this.newRating()
    };

    this.isSubmitting.set(true);

    // Determinar si estamos creando un nuevo comentario o editando uno existente
    if (this.isEditingMode() && this.currentCommentId()) {
      // Editar comentario existente
      this.commentService.updateComment(this.currentCommentId()!, commentRequest)
        .pipe(
          finalize(() => this.isSubmitting.set(false))
        )
        .subscribe({
          next: (response) => {
            this.notificationService.success('¡Reseña actualizada correctamente!');
            this.resetCommentForm();
            this.isWritingReview.set(false);
            this.isEditingMode.set(false);
            this.currentCommentId.set(null);
            this.commentAdded.emit(); // Recargar comentarios
          },
          error: (error) => {
            this.notificationService.error(error.message || 'Error al actualizar la reseña');
          }
        });
    } else {
      // Crear nuevo comentario
      const productId = this.product()?.id;
      if (!productId) {
        this.notificationService.error('Error al identificar el producto');
        this.isSubmitting.set(false);
        return;
      }

      this.commentService.addComment(productId, commentRequest)
        .pipe(
          finalize(() => this.isSubmitting.set(false))
        )
        .subscribe({
          next: (response) => {
            this.notificationService.success('¡Reseña publicada correctamente!');
            this.resetCommentForm();
            this.isWritingReview.set(false);
            this.commentAdded.emit();

            // Recargar los comentarios después de añadir uno nuevo
            this.loadCommentPage(1); // Volver a la primera página para ver el comentario
          },
          error: (error) => {
            this.notificationService.error(error.message || 'Error al publicar la reseña');
          }
        });
    }
  }

  // Método para iniciar la edición de un comentario
  editComment(comment: Comment): void {
    if (!this.isCommentOwner(comment)) {
      this.notificationService.error('No tienes permiso para editar este comentario');
      return;
    }

    this.isWritingReview.set(true);
    this.isEditingMode.set(true);
    this.currentCommentId.set(comment.id);

    // Cargar los datos del comentario en el formulario
    this.newComment.set(comment.comment);
    this.newRating.set(comment.rating);
  }

// Método para mostrar el modal de confirmación de eliminación
showDeleteConfirmation(comment: Comment): void {
  if (!this.isCommentOwner(comment)) {
    this.notificationService.error('No tienes permiso para eliminar este comentario');
    return;
  }

  // Establecer el ID del comentario y mostrar el modal
  this.currentCommentId.set(comment.id);
  // Asegurarnos de que el modal se muestre después de establecer el ID
  setTimeout(() => {
    this.showDeleteModal.set(true);
  }, 0);
}
  // Método para cancelar la eliminación


  cancelDelete(): void {
    // Ocultar el modal primero
    this.showDeleteModal.set(false);
    // Resetear el ID después de un pequeño retraso para permitir animaciones
    setTimeout(() => {
      this.currentCommentId.set(null);
    }, 300);
  }
  confirmDelete(): void {
    if (!this.currentCommentId()) {
      this.cancelDelete();
      return;
    }

    // Activar estado de eliminación
    this.isDeleting.set(true);

    this.commentService.deleteComment(this.currentCommentId()!)
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
          this.showDeleteModal.set(false);
          // Pequeño retraso para completar animaciones
          setTimeout(() => {
            this.currentCommentId.set(null);
          }, 300);
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Comentario eliminado correctamente');
          this.commentAdded.emit(); // Recargar comentarios
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Error al eliminar el comentario');
        }
      });
  }
  // Método para reiniciar el formulario
  private resetCommentForm(): void {
    this.newComment.set('');
    this.newRating.set(0);
    this.currentCommentId.set(null);
    this.isEditingMode.set(false);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Comment } from '@app/core/interfaces/product-by-comments.interface';

export interface CommentRequest {
  comment: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductCommentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Verifica si un usuario ya ha comentado en un producto específico
  hasUserCommented(productId: number, userId: string, comments: Comment[]): boolean {
    return comments.some(comment => comment.userId === userId);
  }

  // Añade un nuevo comentario a un producto
  addComment(productId: number, commentData: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/comments/${productId}`, commentData)
      .pipe(
        tap(response => console.log('Comentario añadido:', response)),
        catchError(error => {
          console.error('Error al añadir comentario:', error);
          let errorMsg = 'Error al publicar el comentario';

          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.status === 401) {
            errorMsg = 'Debes iniciar sesión para comentar';
          } else if (error.status === 409) {
            errorMsg = 'Ya has comentado en este producto';
          }

          return throwError(() => new Error(errorMsg));
        })
      );
  }

  // Edita un comentario existente
  updateComment(commentId: number, commentData: CommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/comments/${commentId}`, commentData)
      .pipe(
        tap(response => console.log('Comentario actualizado:', response)),
        catchError(error => {
          console.error('Error al actualizar comentario:', error);
          let errorMsg = 'Error al actualizar el comentario';

          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.status === 401) {
            errorMsg = 'No tienes permiso para editar este comentario';
          } else if (error.status === 404) {
            errorMsg = 'Comentario no encontrado';
          }

          return throwError(() => new Error(errorMsg));
        })
      );
  }

  // Elimina un comentario
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/comments/${commentId}`)
      .pipe(
        tap(() => console.log('Comentario eliminado:', commentId)),
        catchError(error => {
          console.error('Error al eliminar comentario:', error);
          let errorMsg = 'Error al eliminar el comentario';

          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.status === 401) {
            errorMsg = 'No tienes permiso para eliminar este comentario';
          } else if (error.status === 404) {
            errorMsg = 'Comentario no encontrado';
          }

          return throwError(() => new Error(errorMsg));
        })
      );
  }
}

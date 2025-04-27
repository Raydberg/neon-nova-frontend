import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  // Colores para avatares basados en iniciales
  private backgroundColors = [
    'bg-primary text-primary-content',
    'bg-secondary text-secondary-content',
    'bg-accent text-accent-content',
    'bg-info text-info-content',
    'bg-success text-success-content',
    'bg-warning text-warning-content',
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-purple-500 text-white',
    'bg-amber-500 text-white'
  ];

  // Mapeo de colores CSS a valores hexadecimales para SVGs
  private hexColors = [
    '#3B82F6', // primary
    '#10B981', // secondary
    '#F59E0B', // accent
    '#06B6D4', // info
    '#10B981', // success
    '#F59E0B', // warning
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#8B5CF6', // purple-500
    '#F59E0B'  // amber-500
  ];

  /**
   * Obtiene un color de fondo consistente basado en un ID
   * @param userId ID único del usuario para generar un color consistente
   * @returns Clase CSS para el color de fondo
   */
  getAvatarBackgroundColor(userId: string): string {
    if (!userId) return this.backgroundColors[0];

    // Generar índice basado en el ID para obtener siempre el mismo color para el mismo usuario
    const numericValue = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.backgroundColors[numericValue % this.backgroundColors.length];
  }

  /**
   * Procesa una URL de avatar para asegurarse de que sea absoluta
   * @param avatarUrl URL posiblemente relativa
   * @returns URL absoluta o null si no existe
   */
  processAvatarUrl(avatarUrl: string | undefined): string | null {
    if (!avatarUrl) return null;

    // URLs absolutas
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

  /**
   * Crea un SVG para avatar con iniciales perfectamente centradas
   * @param initials Iniciales a mostrar (1-2 caracteres)
   * @param userId ID del usuario para elegir color consistente
   * @returns String SVG
   */
  createAvatarSVG(initials: string, userId: string): string {
    // Limitar a máximo 3 caracteres
    const displayInitials = initials?.slice(0, 3).toUpperCase() || 'U';

    // Determinar el color basado en el ID del usuario
    const colorIndex = userId ?
      userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % this.hexColors.length :
      0;

    const backgroundColor = this.hexColors[colorIndex];
    const textColor = '#FFFFFF';

    // Ajustar el tamaño de fuente según la longitud de las iniciales
    const fontSize = displayInitials.length > 2 ? '32' : '38';

    // Crear SVG como string con iniciales perfectamente centradas
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="50" fill="${backgroundColor}" />
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="${fontSize}"
          font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central"
          letter-spacing="-1">
          ${displayInitials}
        </text>
      </svg>
    `;
  }

  /**
   * Convierte un SVG a una URL de datos
   * @param svg String SVG
   * @returns URL de datos (data:image/svg+xml)
   */
  svgToDataURL(svg: string): string {
    const encodedSVG = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=utf-8,${encodedSVG}`;
  }

  /**
   * Genera una URL de avatar basada en iniciales
   * @param initials Iniciales del usuario
   * @param userId ID del usuario para color consistente
   * @returns URL del avatar
   */
  getAvatarURL(initials: string, userId: string): string {
    const svg = this.createAvatarSVG(initials, userId);
    return this.svgToDataURL(svg);
  }
}

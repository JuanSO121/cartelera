export type RentalStatus = 'ACTIVE' | 'RETURNED';

export interface Rental {
  id: number;
  movieId: number;
  movieTitle: string;
  customerName: string;
  rentedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: RentalStatus;
  /** Sigue activo y ya pasó la fecha límite (lo calcula el backend). */
  overdue: boolean;
  /**
   * Solo en activos: si la película sigue publicada. `null` si no aplica o no se pudo
   * verificar; en ese caso no se muestra ninguna etiqueta.
   */
  movieAvailable: boolean | null;
}

export interface RentalRequest {
  movieId: number;
  customerName: string;
  customerEmail: string;
}

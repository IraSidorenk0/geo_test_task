import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../core/services/storage.service';
import { Place } from '../../core/models/place.model';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  constructor(private storageService: StorageService) {}

  getWishlist(): Place[] {
    return this.storageService.getWishlist();
  }

  isInWishlist(id: string): boolean {
    return this.getWishlist().some(p => p.id === id);
  }

  addToWishlist(place: Place): void {
    this.storageService.addToWishlist(place);
  }

  removeFromWishlist(id: string): void {
    this.storageService.removeFromWishlist(id);
  }

  toggleWishlist(place: Place): boolean {
    if (this.isInWishlist(place.id)) {
      this.removeFromWishlist(place.id);
      return false;
    } else {
      this.addToWishlist(place);
      return true;
    }
  }

  clearWishlist(): void {
    this.storageService.clearWishlist();
  }

  watchWishlist(): Observable<Place[]> {
    return this.storageService.watchWishlist();
  }
}
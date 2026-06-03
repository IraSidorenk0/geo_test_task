import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Place } from '../models/place.model';

const WISHLIST_KEY = 'wishlist';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private wishListSubject = new BehaviorSubject<Place[]>([]);

  constructor() {
    const saved = this.getWishlist();
    if (saved) {
      this.wishListSubject.next(saved);
    }
  }

  getWishlist(): Place[] {
    try {
      const item = localStorage.getItem(WISHLIST_KEY);
      return item ? JSON.parse(item) as Place[] : [];
    } catch {
      return [];
    }
  }

  addToWishlist(place: Place): void {
    const current = this.getWishlist();
    if (!current.find(p => p.id === place.id)) {
      this.setWishlist([...current, place]);
    }
  }

  removeFromWishlist(id: string): void {
    const current = this.getWishlist();
    this.setWishlist(current.filter(p => p.id !== id));
  }

  private setWishlist(places: Place[]): void {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(places));
    this.wishListSubject.next(places);
  }

  clearWishlist(): void {
    localStorage.removeItem(WISHLIST_KEY);
    this.wishListSubject.next([]);
  }

  watchWishlist() {
    return this.wishListSubject.asObservable();
  }
}
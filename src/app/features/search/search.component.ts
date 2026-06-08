import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchService } from './search.service';
import { WishListService } from '../wishlist/wishlist.service';
import { Place } from '../../core/models/place.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  query = '';
  lat: number | null = null;
  lng: number | null = null;
  results: Place[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private searchService: SearchService,
    public wishListService: WishListService,
    private cdr: ChangeDetectorRef
  ) {}

  search(): void {
    console.log('[SearchComponent] search() called');
    if (!this.query || this.lat === null || this.lng === null) {
      console.log('[SearchComponent] Early return - missing params');
      return;
    }

    this.loading = true;
    this.error = null;
    console.log('[SearchComponent] Loading set to true');

    this.searchService.searchPlaces(this.query, this.lat, this.lng).subscribe({
      next: places => {
        console.log('[SearchComponent] Received', places.length, 'places');
        this.results = places;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('[SearchComponent] Error:', err);
        this.error = 'Search failed: ' + (err.message || 'Unknown error');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleWishlist(place: Place): void {
    this.wishListService.toggleWishlist(place);
  }
}

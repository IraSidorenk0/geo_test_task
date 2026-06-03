import { Component } from '@angular/core';
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

  constructor(private searchService: SearchService, public wishListService: WishListService) {}

  search(): void {
    if (!this.query || this.lat === null || this.lng === null) return;

    this.loading = true;
    this.error = null;

    this.searchService.searchPlaces(this.query, this.lat, this.lng).subscribe({
      next: places => {
        this.results = places;
        this.loading = false;
      },
      error: err => {
        this.error = 'Search failed: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  toggleWishlist(place: Place): void {
    this.wishListService.toggleWishlist(place);
  }
}
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { WishListService } from '../wishlist/wishlist.service';
import { Place } from '../../core/models/place.model';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './place-details.component.html',
  styleUrl: './place-details.component.css'
})
export class PlaceDetailsComponent {
  place: Place | null = null;
  safePhotos: SafeUrl[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public wishListService: WishListService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlace(id);
    }
  }

  loadPlace(id: string): void {
    this.apiService.getPlaceDetails(id).subscribe({
      next: place => {
        this.place = place;
        if (place.photos) {
          this.safePhotos = place.photos.map(p => this.sanitizer.bypassSecurityTrustUrl(p));
        }
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Failed to load place', err);
      }
    });
  }

  toggleWishlist(place: Place): void {
    this.wishListService.toggleWishlist(place);
  }
}

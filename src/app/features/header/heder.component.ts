import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  wishlistCount: number = 0;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.watchWishlist().subscribe((wishlist) => {
      this.wishlistCount = wishlist.length;
    });
  }
}
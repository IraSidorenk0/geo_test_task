import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CacheService } from '../../core/services/cache.service';
import { tap } from 'rxjs/operators';
import { Place } from '../../core/models/place.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService
  ) {}

  searchPlaces(keyword: string, lat: number, lng: number): Observable<Place[]> {
    const cacheKey = `${keyword}_${lat}_${lng}`;
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.apiService.searchPlaces(keyword, lat, lng).pipe(
      tap(places => this.cacheService.set(cacheKey, places))
    );
  }
}
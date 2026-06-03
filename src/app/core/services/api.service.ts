import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout, map, tap } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api.foursquare.com/v2/venues';

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  searchPlaces(keyword: string, lat: number, lng: number): Observable<Place[]> {
    const cacheKey = `${keyword}_${lat}_${lng}`;
    const cachedData = this.cacheService.get(cacheKey);

    if (cachedData) {
      console.log('[ApiService] Cache hit for', cacheKey);
      return of(cachedData);
    }

    const params = new HttpParams()
      .set('client_id', environment.foursquareClientId)
      .set('client_secret', environment.foursquareClientSecret)
      .set('v', '20231010')
      .set('query', keyword)
      .set('ll', `${lat},${lng}`);

    console.log('[ApiService] Searching:', `${this.apiUrl}/search`, 'params:', params.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      timeout(15000),
      catchError(err => {
        console.error('[ApiService] Search error', err);
        return throwError(() => new Error(err.message || 'Search failed'));
      }),
      map(response => {
        console.log('[ApiService] Raw response keys:', Object.keys(response));
        if (!response || !response.response || !response.response.venues) {
          console.error('[ApiService] Unexpected response shape', response);
          return [];
        }
        return this.transformResponse(response);
      }),
      tap(places => {
        console.log('[ApiService] Transformed places count:', places.length);
        this.cacheService.set(cacheKey, places);
      })
    );
  }

  getPlaceDetails(fsqId: string): Observable<Place> {
    const params = new HttpParams()
      .set('client_id', environment.foursquareClientId)
      .set('client_secret', environment.foursquareClientSecret)
      .set('v', '20231010');

    return this.http.get<any>(`${this.apiUrl}/${fsqId}`, { params }).pipe(
      timeout(15000),
      catchError(err => {
        console.error('[ApiService] Detail error', err);
        return throwError(() => new Error(err.message || 'Failed to load details'));
      }),
      map(response => this.transformDetail(response))
    );
  }

  private transformResponse(response: any): Place[] {
    return response.response.venues.map((item: any) => ({
      id: item.id,
      name: item.name,
      address: item.location?.address || '',
      rating: item.rating,
      categories: item.categories?.map((c: any) => c.name) || [],
      photos: item.photos?.groups?.flatMap((g: any) => g.items?.map((p: any) => p.prefix + '300x300' + p.suffix) || []) || [],
      reviews: item.tips?.groups?.flatMap((g: any) => g.items?.map((t: any) => t.text) || []) || [],
      geolocation: { lat: item.location?.lat, lng: item.location?.lng }
    }));
  }

  private transformDetail(item: any): Place {
    return {
      id: item.id,
      name: item.name,
      address: item.location?.address || '',
      rating: item.rating,
      categories: item.categories?.map((c: any) => c.name) || [],
      photos: item.photos?.groups?.flatMap((g: any) => g.items?.map((p: any) => p.prefix + '300x300' + p.suffix) || []) || [],
      reviews: item.tips?.groups?.flatMap((g: any) => g.items?.map((t: any) => t.text) || []) || [],
      geolocation: { lat: item.location?.lat, lng: item.location?.lng }
    };
  }
}
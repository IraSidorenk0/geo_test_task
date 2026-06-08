import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout, map, tap } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/serpapi';

  constructor(private http: HttpClient, private cacheService: CacheService) { }

  searchPlaces(keyword: string, lat: number, lng: number): Observable<Place[]> {
    const cacheKey = `${keyword}_${lat}_${lng}`;
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('engine', 'google_maps')
      .set('type', 'search')
      .set('q', keyword)
      .set('ll', `@${lat},${lng},14z`)
      .set('api_key', environment.serpApiKey);

    console.log('[ApiService] Requesting:', this.apiUrl, params.toString());

    return this.http.get<any>(this.apiUrl, { params, headers: this.getHeaders() }).pipe(
      timeout(30000),
      catchError(err => {
        console.error('API Error details:', err);
        return throwError(() => err);
      }),
      map(response => {
        console.log('[ApiService] Response status:', response.search_metadata?.status);
        if (!response || !Array.isArray(response.local_results)) {
          console.error('[ApiService] Unexpected response shape', response);
          return [];
        }
        return this.transformResponse(response.local_results, lat, lng);
      }),
      tap(places => {
        console.log('[ApiService] Transformed places:', places.length);
        this.cacheService.set(cacheKey, places);
      })
    );
  }

  getPlaceDetails(fsqId: string): Observable<Place> {
    const params = new HttpParams()
      .set('engine', 'google_maps')
      .set('place_id', fsqId)
      .set('api_key', environment.serpApiKey);

    return this.http.get<any>(this.apiUrl, { params, headers: this.getHeaders() }).pipe(
      timeout(30000),
      catchError(err => {
        console.error('[ApiService] Detail error', err);
        return throwError(() => new Error(err.message || 'Failed to load details'));
      }),
      map(response => {
        const placeData = response.place_results;
        if (!placeData) {
          console.error('[ApiService] No place_results in response', response);
          return {
            id: fsqId,
            name: '',
            address: '',
            categories: [],
            geolocation: { lat: 0, lng: 0 }
          };
        }
        return this.transformDetail(placeData);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('accept', 'application/json');
  }

  private transformResponse(response: any[], lat: number, lng: number): Place[] {
    return (response || []).map((item: any) => ({
      id: item.place_id || item.data_id || String(item.position),
      name: item.title || '',
      address: item.address || '',
      rating: item.rating,
      categories: item.types || [],
      photos: item.thumbnail ? [item.thumbnail] : [],
      reviews: [],
      geolocation: {
        lat: item.gps_coordinates?.latitude ?? lat,
        lng: item.gps_coordinates?.longitude ?? lng
      }
    }));
  }

  private transformDetail(item: any): Place {
    return {
      id: item.place_id || item.data_id || '',
      name: item.title || '',
      address: item.address || '',
      rating: item.rating,
      categories: item.types || [],
      photos: item.thumbnail ? [item.thumbnail] : [],
      reviews: [],
      geolocation: {
        lat: item.gps_coordinates?.latitude ?? 0,
        lng: item.gps_coordinates?.longitude ?? 0
      }
    };
  }
}

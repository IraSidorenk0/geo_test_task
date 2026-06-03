import { Injectable } from '@angular/core';
import { CacheEntry, Place } from '../models/place.model';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

  set(key: string, data: Place[]): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data: data
    });
  }

  get(key: string): Place[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }
}
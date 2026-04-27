import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  from,
  of,
  switchMap,
} from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as L from 'leaflet';
import { ToastService } from '../../../core/services/toast.service';

export type LocationGranularity = 'detailed' | 'admin';

export interface LocationChangePayload {
  lat: number;
  lng: number;
  addressAr: string;
  addressEn: string;
  accuracy?: number;
}

interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

interface RecentSearch {
  id: number;
  label: string;
  lat: number;
  lng: number;
  ts: number;
}

type MapType = 'streets' | 'satellite' | 'hybrid';
type PickerStatus = 'idle' | 'locating' | 'searching' | 'resolving' | 'ready' | 'error';

const DEFAULT_CENTER: L.LatLngTuple = [30.0444, 31.2357];
const DEFAULT_ZOOM = 13;
const FOCUSED_ZOOM = 16;
const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 450;
const SUGGESTIONS_LIMIT = 6;
const RECENT_LIMIT = 5;
const RECENT_STORAGE_KEY = 'lp:recent-locations:v1';
const REVERSE_CACHE_LIMIT = 30;
const COORD_PRECISION = 6;
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const TILE_LAYERS: Record<MapType, { url: string; attribution: string; maxZoom: number; subdomains?: string }> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
  hybrid: {
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxZoom: 20,
    subdomains: 'mt0,mt1,mt2,mt3',
  },
};

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialLat: number | null = null;
  @Input() initialLng: number | null = null;
  @Input() height = 460;
  @Input() autoLocate = true;
  @Input() defaultCenter: L.LatLngTuple = DEFAULT_CENTER;
  @Input() defaultZoom: number = DEFAULT_ZOOM;
  @Input() focusedZoom: number = FOCUSED_ZOOM;
  @Input() countryCode: string | null = null;
  /**
   * 'detailed' (default): full street-level display name.
   * 'admin': only the administrative scope (governorate / state / country) — used for
   * commercial-area pickers where street precision is not desired.
   */
  @Input() granularity: LocationGranularity = 'detailed';

  @Output() locationChange = new EventEmitter<LocationChangePayload>();

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  @ViewChild('searchBox') searchBox?: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private map?: L.Map;
  private marker?: L.Marker;
  private accuracyCircle?: L.Circle;
  private tileLayer?: L.TileLayer;
  private resizeObserver?: ResizeObserver;

  private searchSubject = new Subject<string>();
  private reverseAbort?: AbortController;
  private searchAbort?: AbortController;
  private locationWatchId: number | null = null;
  private locationTimer: ReturnType<typeof setTimeout> | null = null;
  private reverseCache = new Map<string, { ar: string; en: string }>();

  searchQuery = '';
  suggestions: NominatimSuggestion[] = [];
  recentSearches: RecentSearch[] = [];
  highlightedIndex = -1;
  showRecent = false;

  isSearching = false;
  isResolvingAddress = false;
  isLocating = false;
  showWarning = true;

  status: PickerStatus = 'idle';
  errorMessage: string | null = null;

  selectedAddress: string | null = null;
  selectedAddressEn: string | null = null;
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  selectedAccuracy: number | null = null;

  mapType: MapType = 'streets';
  copiedField: 'lat' | 'lng' | 'both' | null = null;
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  private toast = inject(ToastService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.recentSearches = this.loadRecent();

    this.searchSubject
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((query) => this.runSearch(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.suggestions = results ?? [];
        this.highlightedIndex = -1;
        this.showRecent = false;
        this.cdr.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    this.fixLeafletDefaultIcon();
    this.zone.runOutsideAngular(() => this.initMap());

    if (this.initialLat != null && this.initialLng != null) {
      this.setMarker(this.initialLat, this.initialLng, this.focusedZoom);
    } else if (this.autoLocate) {
      this.checkLocationPermission();
    }
  }

  ngOnDestroy(): void {
    this.searchAbort?.abort();
    this.reverseAbort?.abort();
    this.clearLocationWatch();
    this.resizeObserver?.disconnect();
    if (this.copiedTimer) clearTimeout(this.copiedTimer);
    this.map?.remove();
  }

  // ────────────────────────── Map setup ──────────────────────────
  private initMap(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    }).setView(this.defaultCenter, this.defaultZoom);

    this.applyTileLayer(this.mapType);

    L.control.zoom({ position: 'topleft' }).addTo(this.map);
    L.control
      .attribution({ prefix: false, position: 'bottomleft' })
      .addAttribution(TILE_LAYERS[this.mapType].attribution)
      .addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.zone.run(() => this.setMarker(e.latlng.lat, e.latlng.lng));
    });

    // Robustly handle late layout (hidden tabs, modals): observe size changes
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapEl.nativeElement);
  }

  private applyTileLayer(type: MapType): void {
    if (!this.map) return;
    const def = TILE_LAYERS[type];

    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    this.tileLayer = L.tileLayer(def.url, {
      maxZoom: def.maxZoom,
      attribution: def.attribution,
      ...(def.subdomains ? { subdomains: def.subdomains.split(',') } : {}),
    });
    this.tileLayer.addTo(this.map);
  }

  setMapType(type: MapType): void {
    if (this.mapType === type) return;
    this.mapType = type;
    this.zone.runOutsideAngular(() => this.applyTileLayer(type));
    this.cdr.markForCheck();
  }

  private fixLeafletDefaultIcon(): void {
    const base = 'https://unpkg.com/leaflet@1.9.4/dist/images';
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl: `${base}/marker-icon-2x.png`,
      iconUrl: `${base}/marker-icon.png`,
      shadowUrl: `${base}/marker-shadow.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  }

  private createMarkerIcon(): L.DivIcon {
    return L.divIcon({
      className: 'lp-pin',
      html: `
        <div class="lp-pin-pulse"></div>
        <div class="lp-pin-body">
          <div class="lp-pin-head"></div>
          <div class="lp-pin-tail"></div>
        </div>
        <div class="lp-pin-shadow"></div>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 48],
    });
  }

  private setMarker(lat: number, lng: number, zoom?: number): void {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        draggable: true,
        icon: this.createMarkerIcon(),
        riseOnHover: true,
        autoPan: true,
      }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.zone.run(() => this.reverseGeocode(pos.lat, pos.lng));
      });
    }

    if (zoom != null) {
      this.map.flyTo([lat, lng], zoom, { duration: 0.7, easeLinearity: 0.25 });
    } else {
      this.map.panTo([lat, lng], { animate: true, duration: 0.4 });
    }
    this.reverseGeocode(lat, lng);
  }

  private setAccuracyCircle(lat: number, lng: number, accuracy: number): void {
    if (!this.map) return;
    if (this.accuracyCircle) {
      this.accuracyCircle.setLatLng([lat, lng]).setRadius(accuracy);
    } else {
      this.accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: 'var(--lp-brand)',
        weight: 1,
        opacity: 0.4,
        fillColor: '#8c0f14',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(this.map);
    }
  }

  recenter(): void {
    if (this.selectedLat != null && this.selectedLng != null) {
      this.map?.flyTo([this.selectedLat, this.selectedLng], this.focusedZoom, {
        duration: 0.6,
      });
    } else {
      this.map?.flyTo(this.defaultCenter, this.defaultZoom, { duration: 0.6 });
    }
  }

  // ────────────────────────── Geolocation ──────────────────────────
  private clearLocationWatch(): void {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
    if (this.locationTimer) {
      clearTimeout(this.locationTimer);
      this.locationTimer = null;
    }
  }

  setCurrentLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.toast.warning('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    this.isLocating = true;
    this.status = 'locating';
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.clearLocationWatch();

    let bestPos: GeolocationPosition | null = null;
    let firstFixApplied = false;
    const ACCEPTABLE_ACCURACY = 20; // meters
    const MAX_WAIT = 12000; // ms

    const applyPosition = (pos: GeolocationPosition, zoom?: number) => {
      const { latitude, longitude, accuracy } = pos.coords;
      this.selectedAccuracy = accuracy;
      this.zone.run(() => {
        this.setMarker(latitude, longitude, zoom);
        this.setAccuracyCircle(latitude, longitude, accuracy);
        this.cdr.markForCheck();
      });
    };

    const finalize = () => {
      this.clearLocationWatch();
      this.zone.run(() => {
        this.isLocating = false;
        if (this.status === 'locating') this.status = 'ready';
        this.cdr.markForCheck();
      });
    };

    this.locationWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
          bestPos = pos;
        }

        if (!firstFixApplied) {
          firstFixApplied = true;
          applyPosition(bestPos, this.focusedZoom);
        } else {
          applyPosition(bestPos);
        }

        if (pos.coords.accuracy <= ACCEPTABLE_ACCURACY) {
          finalize();
        }
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'تم رفض إذن الوصول للموقع'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'تعذر تحديد الموقع، تأكد من تفعيل خدمة GPS'
              : 'انتهت مهلة تحديد الموقع، حاول مرة أخرى';
        this.zone.run(() => {
          this.toast.error(msg);
          this.status = 'error';
          this.errorMessage = msg;
          this.isLocating = false;
          this.cdr.markForCheck();
        });
        this.clearLocationWatch();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    this.locationTimer = setTimeout(finalize, MAX_WAIT);
  }

  private checkLocationPermission(): void {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      this.setCurrentLocation();
      return;
    }

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          this.setCurrentLocation();
        } else {
          this.toast.warning('من فضلك فعل إذن الموقع من إعدادات المتصفح');
        }
      })
      .catch(() => this.setCurrentLocation());
  }

  // ────────────────────────── Reverse Geocoding ──────────────────────────
  private cacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(COORD_PRECISION)},${lng.toFixed(COORD_PRECISION)}`;
  }

  private cachePut(key: string, ar: string, en: string): void {
    if (this.reverseCache.size >= REVERSE_CACHE_LIMIT) {
      const oldest = this.reverseCache.keys().next().value as string | undefined;
      if (oldest !== undefined) this.reverseCache.delete(oldest);
    }
    this.reverseCache.set(key, { ar, en });
  }

  private extractAddress(data: any, fallback: string): string {
    if (!data) return fallback;

    if (this.granularity === 'admin') {
      const a = data.address ?? {};
      const parts: string[] = [];
      const region =
        a.state ||
        a.region ||
        a.governorate ||
        a.province ||
        a.county ||
        a.city ||
        a.town ||
        a.village;
      if (region) parts.push(region);
      if (a.country && a.country !== region) parts.push(a.country);
      const composed = parts.join('، ').trim();
      return composed || (data.display_name as string) || fallback;
    }

    return (data.display_name as string) || fallback;
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.reverseAbort?.abort();
    this.reverseAbort = new AbortController();

    this.selectedLat = lat;
    this.selectedLng = lng;

    const cacheKey = this.cacheKey(lat, lng);
    const cached = this.reverseCache.get(cacheKey);
    if (cached) {
      this.applyAddress(lat, lng, cached.ar, cached.en);
      return;
    }

    this.isResolvingAddress = true;
    this.status = 'resolving';
    this.cdr.markForCheck();

    const needsBreakdown = this.granularity === 'admin';
    const buildUrl = (lang: string) =>
      `${NOMINATIM_BASE}/reverse?format=json${needsBreakdown ? '&addressdetails=1' : ''}&lat=${lat}&lon=${lng}&accept-language=${lang}`;

    const fetchLang = (lang: string) =>
      fetch(buildUrl(lang), {
        signal: this.reverseAbort!.signal,
        headers: { 'Accept-Language': lang },
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch((err) => {
          if (err?.name === 'AbortError') throw err;
          return null;
        });

    Promise.all([fetchLang('ar'), fetchLang('en')])
      .then(([arData, enData]) => {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const addressAr = this.extractAddress(arData, fallback);
        const addressEn = this.extractAddress(enData, fallback);
        const both = !arData && !enData;
        this.cachePut(cacheKey, addressAr, addressEn);
        this.applyAddress(lat, lng, addressAr, addressEn, both);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        this.applyAddress(lat, lng, fallback, fallback, true);
      });
  }

  private applyAddress(
    lat: number,
    lng: number,
    addressAr: string,
    addressEn: string,
    isError = false,
  ): void {
    this.zone.run(() => {
      this.selectedAddress = addressAr;
      this.selectedAddressEn = addressEn;
      this.isResolvingAddress = false;
      this.status = isError ? 'error' : 'ready';
      this.errorMessage = isError ? 'تعذر جلب العنوان، تم استخدام الإحداثيات بدلًا منه' : null;

      this.locationChange.emit({
        lat,
        lng,
        addressAr,
        addressEn,
        accuracy: this.selectedAccuracy ?? undefined,
      });

      this.cdr.markForCheck();
    });
  }

  // ────────────────────────── Search ──────────────────────────
  private runSearch(query: string) {
    this.searchAbort?.abort();
    this.searchAbort = new AbortController();
    this.isSearching = true;
    this.status = 'searching';
    this.cdr.markForCheck();

    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: String(SUGGESTIONS_LIMIT),
      q: query,
    });
    if (this.countryCode) params.set('countrycodes', this.countryCode);

    return from(
      fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
        signal: this.searchAbort.signal,
        headers: { 'Accept-Language': 'ar,en' },
      }).then((res) => (res.ok ? (res.json() as Promise<NominatimSuggestion[]>) : [])),
    ).pipe(
      catchError(() => of<NominatimSuggestion[]>([])),
      finalize(() => {
        this.isSearching = false;
        if (this.status === 'searching') {
          this.status = this.selectedAddress ? 'ready' : 'idle';
        }
        this.cdr.markForCheck();
      }),
    );
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      this.suggestions = [];
      this.highlightedIndex = -1;
      this.showRecent = !query && this.recentSearches.length > 0;
      this.cdr.markForCheck();
      return;
    }
    this.searchSubject.next(query);
  }

  onSearchFocus(): void {
    if (!this.searchQuery && this.recentSearches.length) {
      this.showRecent = true;
      this.cdr.markForCheck();
    }
  }

  selectPlace(place: NominatimSuggestion): void {
    const lat = +place.lat;
    const lng = +place.lon;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    this.setMarker(lat, lng, this.focusedZoom);
    this.searchQuery = place.display_name;
    this.suggestions = [];
    this.highlightedIndex = -1;
    this.showRecent = false;
    this.pushRecent({
      id: place.place_id,
      label: place.display_name,
      lat,
      lng,
      ts: Date.now(),
    });
    this.cdr.markForCheck();
  }

  selectRecent(item: RecentSearch): void {
    this.setMarker(item.lat, item.lng, this.focusedZoom);
    this.searchQuery = item.label;
    this.showRecent = false;
    this.suggestions = [];
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.highlightedIndex = -1;
    this.showRecent = this.recentSearches.length > 0;
    this.searchAbort?.abort();
    this.searchInput?.nativeElement.focus();
    this.cdr.markForCheck();
  }

  // ────────────────────────── Recent searches ──────────────────────────
  private loadRecent(): RecentSearch[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as RecentSearch[];
      return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
    } catch {
      return [];
    }
  }

  private pushRecent(item: RecentSearch): void {
    const existing = this.recentSearches.filter(
      (r) => Math.abs(r.lat - item.lat) > 1e-5 || Math.abs(r.lng - item.lng) > 1e-5,
    );
    this.recentSearches = [item, ...existing].slice(0, RECENT_LIMIT);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(this.recentSearches));
      } catch {
        /* quota exceeded — silently ignore */
      }
    }
  }

  removeRecent(id: number, event: Event): void {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter((r) => r.id !== id);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(this.recentSearches));
      } catch {
        /* ignore */
      }
    }
    if (!this.recentSearches.length) this.showRecent = false;
    this.cdr.markForCheck();
  }

  // ────────────────────────── Copy ──────────────────────────
  copy(field: 'lat' | 'lng' | 'both'): void {
    if (this.selectedLat == null || this.selectedLng == null) return;
    const value =
      field === 'lat'
        ? String(this.selectedLat)
        : field === 'lng'
          ? String(this.selectedLng)
          : `${this.selectedLat}, ${this.selectedLng}`;

    const done = () => {
      this.copiedField = field;
      this.cdr.markForCheck();
      if (this.copiedTimer) clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => {
        this.copiedField = null;
        this.cdr.markForCheck();
      }, 1500);
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => this.toast.warning('تعذر النسخ'));
    } else {
      this.toast.warning('النسخ غير مدعوم في هذا المتصفح');
    }
  }

  // ────────────────────────── Keyboard ──────────────────────────
  onKeydown(event: KeyboardEvent): void {
    if (!this.suggestions.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = (this.highlightedIndex + 1) % this.suggestions.length;
        this.cdr.markForCheck();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex =
          this.highlightedIndex <= 0
            ? this.suggestions.length - 1
            : this.highlightedIndex - 1;
        this.cdr.markForCheck();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          event.preventDefault();
          this.selectPlace(this.suggestions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.suggestions = [];
        this.highlightedIndex = -1;
        this.showRecent = false;
        this.cdr.markForCheck();
        break;
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.searchBox) return;
    if (!(target instanceof Node)) return;
    if (!this.searchBox.nativeElement.contains(target)) {
      this.suggestions = [];
      this.highlightedIndex = -1;
      this.showRecent = false;
      this.cdr.markForCheck();
    }
  }

  dismissWarning(): void {
    this.showWarning = false;
    this.cdr.markForCheck();
  }

  // ────────────────────────── Helpers ──────────────────────────
  trackBySuggestion = (_: number, item: NominatimSuggestion): number => item.place_id;
  trackByRecent = (_: number, item: RecentSearch): number => item.id;

  get statusLabel(): string {
    switch (this.status) {
      case 'locating':
        return 'جاري تحديد الموقع';
      case 'searching':
        return 'جاري البحث';
      case 'resolving':
        return 'جاري جلب العنوان';
      case 'ready':
        return 'جاهز';
      case 'error':
        return 'خطأ';
      default:
        return 'حدد موقعك';
    }
  }

  get accuracyLabel(): string | null {
    if (this.selectedAccuracy == null) return null;
    return this.selectedAccuracy >= 1000
      ? `±${(this.selectedAccuracy / 1000).toFixed(1)} كم`
      : `±${Math.round(this.selectedAccuracy)} م`;
  }
}

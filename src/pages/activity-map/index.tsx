import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './index.module.css';

// Location data for markers
const locations = [
  { id: 'us-west', coordinates: [-122.4194, 37.7749], region: 'US', name: 'San Francisco' },
  { id: 'us-east', coordinates: [-74.0060, 40.7128], region: 'US', name: 'New York' },
  { id: 'eu-london', coordinates: [-0.1276, 51.5074], region: 'EU', name: 'London' },
  { id: 'eu-berlin', coordinates: [13.4050, 52.5200], region: 'EU', name: 'Berlin' },
  { id: 'cn-beijing', coordinates: [116.4074, 39.9042], region: 'CN', name: 'Beijing' },
  { id: 'cn-shanghai', coordinates: [121.4737, 31.2304], region: 'CN', name: 'Shanghai' },
  { id: 'jp-tokyo', coordinates: [139.6917, 35.6895], region: 'JP', name: 'Tokyo' },
];

const regions = [
  { id: 'all', label: 'All', active: true },
  { id: 'US', label: 'US', active: false },
  { id: 'EU', label: 'EU', active: false },
  { id: 'CN', label: 'CN', active: false },
  { id: 'JP', label: 'JP', active: false },
];

export default function ActivityMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [activeRegion, setActiveRegion] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize map with a simple dark style
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'simple-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#1a1a1a'
            }
          },
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'simple-tiles',
            paint: {
              'raster-opacity': 0.3
            }
          }
        ]
      },
      center: [0, 20],
      zoom: 1.5,
      maxZoom: 8,
      minZoom: 1,
    });

    map.current.on('load', () => {
      setIsLoading(false);
      // Add markers
      addMarkers();
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
      setError('Failed to load map');
      setIsLoading(false);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter locations based on active region
    const filteredLocations = activeRegion === 'all' 
      ? locations 
      : locations.filter(loc => loc.region === activeRegion);

    // Create markers
    filteredLocations.forEach(location => {
      // Create marker element
      const el = document.createElement('div');
      el.className = styles.activityMarker;

      // Create marker
      const marker = new maplibregl.Marker(el)
        .setLngLat(location.coordinates as [number, number])
        .addTo(map.current!);

      markers.current.push(marker);

      // Add popup on click
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`<div style="color: #333; font-weight: 500;">${location.name}</div>`);

      marker.setPopup(popup);
    });
  };

  const handleRegionChange = (regionId: string) => {
    setActiveRegion(regionId);
  };

  // Re-add markers when region changes
  useEffect(() => {
    if (map.current) {
      addMarkers();
    }
  }, [activeRegion]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Activity Map</h1>
        <p className={styles.subtitle}>Global activity visualization</p>
      </div>

      {/* Map Container */}
      <div className={styles.mapContainer}>
        <div ref={mapContainer} className={styles.mapElement} />
        
        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingText}>Loading map...</div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className={styles.errorOverlay}>
            <div className={styles.errorText}>{error}</div>
          </div>
        )}
        
        {/* Region Filter Buttons */}
        {!isLoading && !error && (
          <div className={styles.filterButtons}>
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => handleRegionChange(region.id)}
                className={`${styles.filterButton} ${
                  activeRegion === region.id
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
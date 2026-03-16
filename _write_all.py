import os

BT = chr(96)  # backtick
DLR = chr(36)  # dollar sign

# ConfidenceBadge.tsx
badge = f"""import {{ useState }} from 'react';
import type {{ ConfidenceScore, ConfidenceLevel }} from '../../services/confidenceScore.ts';

interface ConfidenceBadgeProps {{
  confidence: ConfidenceScore;
  compact?: boolean;
}}

const levelConfig: Record<ConfidenceLevel, {{ emoji: string; label: string; classes: string }}> = {{
  high: {{ emoji: '\U0001F7E2', label: 'Alta', classes: 'bg-green-100 text-green-800' }},
  medium: {{ emoji: '\U0001F7E1', label: 'Media', classes: 'bg-amber-100 text-amber-800' }},
  low: {{ emoji: '\U0001F534', label: 'Baja', classes: 'bg-red-100 text-red-800' }},
}};

export default function ConfidenceBadge({{ confidence, compact = false }}: ConfidenceBadgeProps) {{
  const [showTooltip, setShowTooltip] = useState(false);
  const config = levelConfig[confidence.level];

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={{() => setShowTooltip(true)}}
      onMouseLeave={{() => setShowTooltip(false)}}
      data-testid="confidence-badge"
      data-level={{confidence.level}}
    >
      <span
        className={{{BT}inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {DLR}{{config.classes}}{BT}}}
      >
        <span>{{config.emoji}}</span>
        {{!compact && <span>{{config.label}}</span>}}
      </span>

      {{showTooltip && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap z-50"
          data-testid="confidence-tooltip"
        >
          {{confidence.reason}}
        </span>
      )}}
    </span>
  );
}}
"""

os.makedirs('src/components/shared', exist_ok=True)
with open('src/components/shared/ConfidenceBadge.tsx', 'w', encoding='utf-8') as f:
    f.write(badge)
print('ConfidenceBadge.tsx written:', os.path.exists('src/components/shared/ConfidenceBadge.tsx'))

# RoutePanel.tsx
rp = f"""import type {{ MultiModalRoute, WalkingRoute, StationData }} from '../../types/index.ts';
import ConfidenceBadge from '../shared/ConfidenceBadge.tsx';
import {{
  calculatePickupConfidence,
  calculateDropoffConfidence,
  routeConfidence,
}} from '../../services/confidenceScore.ts';
import type {{ ConfidenceScore }} from '../../services/confidenceScore.ts';

interface RoutePanelProps {{
  routes: MultiModalRoute[];
  walkingRoute: WalkingRoute | null;
  stations: StationData[];
  loading: boolean;
  error: string | null;
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
}}

function formatTime(seconds: number): string {{
  const mins = Math.round(seconds / 60);
  if (mins < 1) return '< 1 min';
  return {BT}{DLR}{{mins}} min{BT};
}}

function formatDistance(meters: number): string {{
  if (meters < 1000) return {BT}{DLR}{{Math.round(meters)}} m{BT};
  return {BT}{DLR}{{(meters / 1000).toFixed(1)}} km{BT};
}}

function RouteCard({{
  route,
  walkingRoute,
  confidence,
  index,
  isSelected,
  onSelect,
}}: {{
  route: MultiModalRoute;
  walkingRoute: WalkingRoute | null;
  confidence: ConfidenceScore | null;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}}) {{
  const bikeMinutes = Math.round(route.total_time_seconds / 60);
  const walkMinutes = walkingRoute ? Math.round(walkingRoute.total_time_seconds / 60) : null;
  const timeSaved = walkMinutes ? walkMinutes - bikeMinutes : null;

  return (
    <button
      onClick={{onSelect}}
      className={{{BT}w-full text-left p-3 rounded-lg border-2 transition-colors {DLR}{{
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }}{BT}}}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Ruta {{index + 1}}</span>
          {{confidence && <ConfidenceBadge confidence={{confidence}} />}}
        </div>
        <span className="text-lg font-bold text-gray-900">{{formatTime(route.total_time_seconds)}}</span>
      </div>

      <div className="flex gap-3 text-xs text-gray-600 mb-2">
        <span>\U0001F6B6 {{formatTime(route.walk_time_seconds)}} ({{formatDistance(route.walk_distance_meters)}})</span>
        <span>\U0001F6B2 {{formatTime(route.bike_time_seconds)}} ({{formatDistance(route.bike_distance_meters)}})</span>
      </div>

      <div className="text-xs text-gray-500">
        <div>\U0001F4CD Recoger: {{route.pickup_station.name}}</div>
        <div>\U0001F17F\uFE0F Dejar: {{route.dropoff_station.name}}</div>
      </div>

      {{timeSaved !== null && (
        <div className={{{BT}mt-2 text-xs font-medium px-2 py-1 rounded {DLR}{{
          timeSaved > 0
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }}{BT}}}>
          {{timeSaved > 0
            ? {BT}\U0001F6B2 Bici: {DLR}{{bikeMinutes}} min | \U0001F6B6 Andando: {DLR}{{walkMinutes}} min | \u26A1 Ahorras {DLR}{{timeSaved}} min{BT}
            : {BT}\U0001F6B6 Andando es m\u00E1s r\u00E1pido ({DLR}{{walkMinutes}} min vs {DLR}{{bikeMinutes}} min en bici){BT}}}
        </div>
      )}}
    </button>
  );
}}

function getRouteConfidence(
  route: MultiModalRoute,
  stations: StationData[],
): ConfidenceScore | null {{
  const pickup = stations.find((s) => s.station_id === route.pickup_station.station_id);
  const dropoff = stations.find((s) => s.station_id === route.dropoff_station.station_id);
  if (!pickup || !dropoff) return null;
  const walkToPickupMin = route.walk_to_pickup.duration_seconds / 60;
  const bikeToDropoffMin = route.bike_segment.duration_seconds / 60;
  const pickupConf = calculatePickupConfidence(pickup, walkToPickupMin);
  const dropoffConf = calculateDropoffConfidence(dropoff, bikeToDropoffMin);
  return routeConfidence(pickupConf, dropoffConf);
}}

const LEVEL_PRIORITY: Record<string, number> = {{ high: 0, medium: 1, low: 2 }};

export default function RoutePanel({{
  routes,
  walkingRoute,
  stations,
  loading,
  error,
  selectedIndex,
  onSelectRoute,
}}: RoutePanelProps) {{
  const routesWithConfidence = routes.map((route) => ({{
    route,
    confidence: getRouteConfidence(route, stations),
  }}));

  routesWithConfidence.sort((a, b) => {{
    const aPri = a.confidence ? LEVEL_PRIORITY[a.confidence.level] ?? 2 : 2;
    const bPri = b.confidence ? LEVEL_PRIORITY[b.confidence.level] ?? 2 : 2;
    if (aPri !== bPri) return aPri - bPri;
    return a.route.total_time_seconds - b.route.total_time_seconds;
  }});

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">\U0001F5FA\uFE0F Rutas</h2>

      {{loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Calculando rutas...
        </div>
      )}}

      {{error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          \u26A0\uFE0F {{error}}
        </div>
      )}}

      {{!loading && !error && routesWithConfidence.length === 0 && (
        <p className="text-sm text-gray-500">
          Haz clic en el mapa para seleccionar origen y destino.
        </p>
      )}}

      {{routesWithConfidence.map(({{ route, confidence }}, i) => (
        <RouteCard
          key={{{BT}{DLR}{{route.pickup_station.station_id}}-{DLR}{{route.dropoff_station.station_id}}{BT}}}
          route={{route}}
          walkingRoute={{walkingRoute}}
          confidence={{confidence}}
          index={{i}}
          isSelected={{i === selectedIndex}}
          onSelect={{() => onSelectRoute(i)}}
        />
      ))}}

      {{walkingRoute && !loading && (
        <div className="text-xs text-gray-500 border-t pt-2 mt-2">
          \U0001F6B6 Ruta directa andando: {{formatTime(walkingRoute.total_time_seconds)}} ({{formatDistance(walkingRoute.total_distance_meters)}})
        </div>
      )}}
    </div>
  );
}}
"""

with open('src/components/RoutePanel/RoutePanel.tsx', 'w', encoding='utf-8') as f:
    f.write(rp)
print('RoutePanel.tsx written:', os.path.exists('src/components/RoutePanel/RoutePanel.tsx'))

# StationPopup.tsx  
sp = f"""import {{ Popup }} from 'react-leaflet';
import type {{ StationData }} from '../../types/index.ts';
import ConfidenceBadge from '../shared/ConfidenceBadge.tsx';
import {{
  calculatePickupConfidence,
  calculateDropoffConfidence,
}} from '../../services/confidenceScore.ts';

interface StationPopupProps {{
  station: StationData;
}}

function formatLastReported(timestamp: number): string {{
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return seconds + 's ago';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  return Math.floor(seconds / 3600) + 'h ago';
}}

export default function StationPopup({{ station }}: StationPopupProps) {{
  const fitCount =
    station.vehicle_types_available.find((v) => v.vehicle_type_id === 'FIT')?.count ?? 0;
  const efitCount =
    station.vehicle_types_available.find((v) => v.vehicle_type_id === 'EFIT')?.count ?? 0;
  const hasVehicleTypes = station.vehicle_types_available.length > 0;

  const pickupConf = calculatePickupConfidence(station, 0);
  const dropoffConf = calculateDropoffConfidence(station, 0);

  return (
    <Popup>
      <div className="min-w-[180px]" data-testid="station-popup">
        <h3 className="font-semibold text-sm mb-2 text-gray-900">{{station.name}}</h3>

        <div className="text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bikes</span>
            <span className="flex items-center gap-1 font-medium">
              {{station.num_bikes_available}}/{{station.capacity}}
              <ConfidenceBadge confidence={{pickupConf}} compact />
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Docks</span>
            <span className="flex items-center gap-1 font-medium">
              {{station.num_docks_available}}/{{station.capacity}}
              <ConfidenceBadge confidence={{dropoffConf}} compact />
            </span>
          </div>

          {{hasVehicleTypes && (
            <div className="pt-1 border-t border-gray-200 text-gray-500">
              {{fitCount > 0 && <span>{{fitCount}} FIT</span>}}
              {{fitCount > 0 && efitCount > 0 && <span>, </span>}}
              {{efitCount > 0 && <span>{{efitCount}} EFIT</span>}}
            </div>
          )}}

          <div className="pt-1 text-gray-400">
            Updated {{formatLastReported(station.last_reported)}}
          </div>
        </div>
      </div>
    </Popup>
  );
}}
"""

with open('src/components/Map/StationPopup.tsx', 'w', encoding='utf-8') as f:
    f.write(sp)
print('StationPopup.tsx written:', os.path.exists('src/components/Map/StationPopup.tsx'))

# App.tsx
app = f"""import {{ useState, useCallback }} from 'react';
import MapView from './components/Map/MapView.tsx';
import StationPanel from './components/StationPanel/StationPanel.tsx';
import RoutePanel from './components/RoutePanel/RoutePanel.tsx';
import {{ useStations }} from './hooks/useStations.ts';
import {{ useRoutes }} from './hooks/useRoutes.ts';
import type {{ StationData, LatLng }} from './types/index.ts';

function App() {{
  const {{ stations, loading, error, lastUpdated }} = useStations();
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const {{ routes, walkingRoute, loading: routeLoading, error: routeError }} = useRoutes(origin, destination, stations);

  const handleClearRoute = useCallback(() => {{
    setOrigin(null);
    setDestination(null);
    setSelectedRouteIndex(0);
  }}, []);

  const selectedRoute = routes[selectedRouteIndex] ?? null;

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-blue-700 text-white px-4 py-2 flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold">\U0001F6B2 BiciCoru\u00F1a</span>
        <span className="text-sm opacity-80">Smart bike-sharing route planner</span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {{/* Map */}}
        <main className="flex-1 relative">
          <MapView
            stations={{stations}}
            selectedStationId={{selectedStation?.station_id}}
            onStationSelect={{setSelectedStation}}
            lastUpdated={{lastUpdated}}
            origin={{origin}}
            destination={{destination}}
            selectedRoute={{selectedRoute}}
            onSetOrigin={{setOrigin}}
            onSetDestination={{setDestination}}
            onClearRoute={{handleClearRoute}}
          />
        </main>

        {{/* Sidebar */}}
        <aside
          className={{{BT}
            {DLR}{{selectedStation || origin || destination ? 'block' : 'hidden lg:block'}}
            lg:w-80 lg:border-l lg:border-gray-200 lg:relative
            {DLR}{{selectedStation ? 'panel-mobile lg:panel-mobile-reset' : ''}}
            bg-white overflow-y-auto
          {BT}}}
          style={{selectedStation ? {{ zIndex: 40 }} : undefined}}
        >
          <RoutePanel
            routes={{routes}}
            walkingRoute={{walkingRoute}}
            stations={{stations}}
            loading={{routeLoading}}
            error={{routeError}}
            selectedIndex={{selectedRouteIndex}}
            onSelectRoute={{setSelectedRouteIndex}}
          />
          <StationPanel
            station={{selectedStation}}
            loading={{loading}}
            error={{error}}
            lastUpdated={{lastUpdated}}
            onClose={{() => setSelectedStation(null)}}
          />
        </aside>
      </div>
    </div>
  );
}}

export default App;
"""

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)
print('App.tsx written:', os.path.exists('src/App.tsx'))

# Update map test
with open('tests/unit/map.test.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_test = """    expect(screen.getByText('8/15 bikes')).toBeInTheDocument();
    expect(screen.getByText('7/15 docks')).toBeInTheDocument();"""

new_test = """    expect(screen.getByText('Bikes')).toBeInTheDocument();
    expect(screen.getByText('Docks')).toBeInTheDocument();
    expect(screen.getAllByTestId('confidence-badge').length).toBe(2);"""

content = content.replace(old_test, new_test)
with open('tests/unit/map.test.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('map.test.tsx updated:', 'confidence-badge' in content)
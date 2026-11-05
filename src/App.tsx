import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowDownUp,
  Bell,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  CircleUserRound,
  CloudLightning,
  CloudRain,
  Cross,
  Download,
  Droplets,
  Flame,
  HeartPulse,
  Hospital,
  LayoutDashboard,
  LifeBuoy,
  Map,
  MapPin,
  Menu,
  PackageOpen,
  Phone,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  TentTree,
  Thermometer,
  TrendingUp,
  Truck,
  Upload,
  Users,
  Wind,
  X,
  Zap,
} from "lucide-react"
import { CRS, LatLng } from "leaflet"
import { CircleMarker, ImageOverlay, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

type Page = "overview" | "incidents" | "map" | "teams" | "resources" | "shelters" | "weather" | "settings"
type Severity = "Critical" | "High" | "Medium" | "Safe"
type Incident = {
  id: string
  title: string
  category: string
  location: string
  severity: Severity
  status: string
  affected: number
  time: string
  description: string
  team: string
  lat: number
  lng: number
}

const initialIncidents: Incident[] = [
  {
    id: "INC-2408",
    title: "Flash flooding near Sukhna Lake",
    category: "Flood",
    location: "Sector 6, Chandigarh",
    severity: "Critical",
    status: "Response in progress",
    affected: 1240,
    time: "12 min ago",
    description:
      "Rapid water-level rise has blocked two access roads. Evacuation is underway in low-lying residential pockets.",
    team: "Alpha Rescue Unit",
    lat: 30.7433,
    lng: 76.8186,
  },
  {
    id: "INC-2407",
    title: "Industrial warehouse fire",
    category: "Fire",
    location: "Phase 8B, Mohali",
    severity: "High",
    status: "Teams dispatched",
    affected: 186,
    time: "34 min ago",
    description:
      "Fire reported at a storage facility. Nearby buildings have been cleared as a precaution.",
    team: "Fire Response 03",
    lat: 30.6978,
    lng: 76.6909,
  },
  {
    id: "INC-2406",
    title: "Slope instability reported",
    category: "Landslide",
    location: "Morni Road, Panchkula",
    severity: "Medium",
    status: "Under assessment",
    affected: 42,
    time: "1 hr ago",
    description:
      "Minor rockfall reported after sustained rainfall. Traffic has been diverted while engineers assess the slope.",
    team: "Geo Response Unit",
    lat: 30.7415,
    lng: 76.9017,
  },
  {
    id: "INC-2405",
    title: "Low-intensity seismic activity",
    category: "Earthquake",
    location: "Zirakpur, Mohali",
    severity: "Medium",
    status: "Monitoring",
    affected: 0,
    time: "3 hrs ago",
    description:
      "A 2.8 magnitude tremor was detected. No structural damage has been reported.",
    team: "Assessment Team 05",
    lat: 30.6425,
    lng: 76.8173,
  },
  {
    id: "INC-2404",
    title: "Storm drainage overflow",
    category: "Flood",
    location: "Sector 19, Panchkula",
    severity: "High",
    status: "Contained",
    affected: 325,
    time: "5 hrs ago",
    description:
      "Drainage overflow affected three streets. Pumping equipment remains on site.",
    team: "Bravo Rescue Unit",
    lat: 30.6948,
    lng: 76.8606,
  },
]

const teams = [
  {
    name: "Alpha Rescue Unit",
    type: "Urban Search & Rescue",
    members: 18,
    status: "Deployed",
    location: "Sector 6, Chandigarh",
    progress: 72,
  },
  {
    name: "Bravo Rescue Unit",
    type: "Flood Response",
    members: 14,
    status: "Available",
    location: "Sector 17, Chandigarh",
    progress: 100,
  },
  {
    name: "Fire Response 03",
    type: "Fire & Hazmat",
    members: 12,
    status: "Deployed",
    location: "Phase 8B, Mohali",
    progress: 58,
  },
  {
    name: "Medical Rapid 02",
    type: "Emergency Medical",
    members: 9,
    status: "Available",
    location: "PGIMER, Chandigarh",
    progress: 100,
  },
  {
    name: "Geo Response Unit",
    type: "Technical Assessment",
    members: 7,
    status: "On standby",
    location: "Panchkula",
    progress: 86,
  },
  {
    name: "Air Support 01",
    type: "Aerial Rescue",
    members: 6,
    status: "Maintenance",
    location: "Chandigarh Airport",
    progress: 35,
  },
]

const resources = [
  {
    name: "Emergency medical kits",
    category: "Medical",
    icon: HeartPulse,
    available: 384,
    total: 500,
    unit: "kits",
    hub: "Central Warehouse",
  },
  {
    name: "Rescue boats",
    category: "Rescue",
    icon: LifeBuoy,
    available: 28,
    total: 36,
    unit: "units",
    hub: "Sukhna Response Hub",
  },
  {
    name: "Food & water packs",
    category: "Relief",
    icon: PackageOpen,
    available: 8420,
    total: 10000,
    unit: "packs",
    hub: "Mohali Depot",
  },
  {
    name: "Emergency vehicles",
    category: "Transport",
    icon: Truck,
    available: 41,
    total: 58,
    unit: "vehicles",
    hub: "Tri-city Network",
  },
  {
    name: "Portable generators",
    category: "Power",
    icon: Zap,
    available: 62,
    total: 80,
    unit: "units",
    hub: "Panchkula Depot",
  },
  {
    name: "Temporary shelters",
    category: "Shelter",
    icon: TentTree,
    available: 740,
    total: 1000,
    unit: "beds",
    hub: "Multiple locations",
  },
]

const shelters = [
  {
    name: "Government Model School Shelter",
    type: "Shelter",
    location: "Sector 16, Chandigarh",
    capacity: 500,
    occupied: 318,
    phone: "+91 172 270 1122",
    status: "Open",
  },
  {
    name: "PGIMER Emergency Centre",
    type: "Hospital",
    location: "Sector 12, Chandigarh",
    capacity: 280,
    occupied: 207,
    phone: "+91 172 275 6565",
    status: "Operational",
  },
  {
    name: "Mohali Community Relief Camp",
    type: "Shelter",
    location: "Phase 7, Mohali",
    capacity: 350,
    occupied: 126,
    phone: "+91 172 221 4100",
    status: "Open",
  },
  {
    name: "Fortis Hospital Mohali",
    type: "Hospital",
    location: "Sector 62, Mohali",
    capacity: 210,
    occupied: 168,
    phone: "+91 172 469 2222",
    status: "Operational",
  },
  {
    name: "Panchkula Sports Complex Camp",
    type: "Shelter",
    location: "Sector 3, Panchkula",
    capacity: 420,
    occupied: 92,
    phone: "+91 172 258 5500",
    status: "Open",
  },
  {
    name: "Civil Hospital Panchkula",
    type: "Hospital",
    location: "Sector 6, Panchkula",
    capacity: 180,
    occupied: 149,
    phone: "+91 172 256 7222",
    status: "Near capacity",
  },
]

const mapPoints = [
  ...initialIncidents.map((item) => ({ ...item, pointType: "Incident" })),
  {
    id: "H-01",
    title: "PGIMER Emergency Centre",
    category: "Hospital",
    location: "Sector 12, Chandigarh",
    severity: "Safe" as Severity,
    status: "Operational · 73 beds",
    affected: 0,
    time: "Live",
    description: "Level 1 trauma and emergency care center.",
    team: "",
    lat: 30.7649,
    lng: 76.7756,
    pointType: "Hospital",
  },
  {
    id: "S-01",
    title: "Sector 16 Relief Shelter",
    category: "Shelter",
    location: "Sector 16, Chandigarh",
    severity: "Safe" as Severity,
    status: "Open · 182 beds",
    affected: 0,
    time: "Live",
    description: "Government-managed emergency shelter.",
    team: "",
    lat: 30.7418,
    lng: 76.7735,
    pointType: "Shelter",
  },
  {
    id: "T-01",
    title: "Bravo Rescue Unit",
    category: "Rescue team",
    location: "Sector 17, Chandigarh",
    severity: "Safe" as Severity,
    status: "Available",
    affected: 0,
    time: "Live",
    description: "14 trained flood-response personnel.",
    team: "",
    lat: 30.7392,
    lng: 76.7824,
    pointType: "Team",
  },
  {
    id: "H-02",
    title: "Civil Hospital Panchkula",
    category: "Hospital",
    location: "Sector 6, Panchkula",
    severity: "Safe" as Severity,
    status: "Operational · 31 beds",
    affected: 0,
    time: "Live",
    description: "Public emergency and trauma care.",
    team: "",
    lat: 30.7042,
    lng: 76.8532,
    pointType: "Hospital",
  },
]

const navItems: { id: Page; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "incidents", label: "Live Incidents", icon: AlertTriangle },
  { id: "map", label: "Disaster Map", icon: Map },
  { id: "teams", label: "Rescue Teams", icon: Users },
  { id: "resources", label: "Emergency Resources", icon: PackageOpen },
  { id: "shelters", label: "Shelters & Hospitals", icon: Hospital },
  { id: "weather", label: "Weather Monitoring", icon: CloudRain },
  { id: "settings", label: "Settings", icon: Settings },
]

const severityColor: Record<Severity, string> = {
  Critical: "#e5484d",
  High: "#f0783c",
  Medium: "#e7a928",
  Safe: "#16a085",
}
const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value)

function Badge({ value }: { value: Severity | string }) {
  return (
    <span className={`badge badge-${value.toLowerCase().replaceAll(" ", "-")}`}>
      <span />
      {value}
    </span>
  )
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function DisasterMap({ compact = false }: { compact?: boolean }) {
  const [layer, setLayer] = useState("All")
  const filtered =
    layer === "All"
      ? mapPoints
      : mapPoints.filter((point) => point.pointType === layer)

  if (!compact) {
    const bounds: [[number, number], [number, number]] = [[0, 0], [1000, 1000]]
    const yx = LatLng
    const xy = function(x: number | [number, number], y?: number) {
      if (Array.isArray(x)) {
        return new yx(x[1], x[0])
      }
      return new yx(y as number, x)
    }

    const sol = xy(175.2, 145.0)
    const mizar = xy(41.6, 130.1)
    const kruegerZ = xy(13.4, 56.5)
    const deneb = xy(218.7, 8.3)

    return (
      <div className="map-shell">
        <div className="map-toolbar">
          <div className="map-layers">
            {["All", "Incident", "Hospital", "Shelter", "Team"].map((item) => (
              <button
                className={layer === item ? "active" : ""}
                key={item}
                onClick={() => setLayer(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="map-legend">
            <span>
              <i className="critical-dot" />
              UQY / Star Map
            </span>
          </div>
        </div>
        <MapContainer
          crs={CRS.Simple}
          bounds={bounds}
          minZoom={-5}
          zoom={0}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <ImageOverlay url="uqm_map_full.png" bounds={bounds} />
          <Marker position={sol}>
            <Popup>Sol</Popup>
          </Marker>
          <Marker position={mizar}>
            <Popup>Mizar</Popup>
          </Marker>
          <Marker position={kruegerZ}>
            <Popup>Krueger-Z</Popup>
          </Marker>
          <Marker position={deneb}>
            <Popup>Deneb</Popup>
          </Marker>
          <Polyline positions={[sol, deneb]} pathOptions={{ color: '#139f98', weight: 3 }} />
        </MapContainer>
      </div>
    )
  }

  return (
    <div className="map-shell compact-map">
      <MapContainer
        center={[30.713, 76.787]}
        zoom={11}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {filtered.map((point, index) => (
          <CircleMarker
            key={`${point.id}-${index}`}
            center={[point.lat, point.lng]}
            radius={point.severity === "Critical" ? 11 : 9}
            pathOptions={{
              color: "#fff",
              weight: 3,
              fillColor: severityColor[point.severity],
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="map-popup">
                <span>{point.category}</span>
                <strong>{point.title}</strong>
                <p>{point.location}</p>
                <small>{point.status}</small>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-live-label">
        <Radio size={13} /> LIVE TRI-CITY OPERATIONS
      </div>
    </div>
  )
}

function MiniOperationalMap({
  title,
  subtitle,
  center,
  zoom,
  points,
}: {
  title: string
  subtitle: string
  center: [number, number]
  zoom: number
  points: typeof mapPoints
}) {
  return (
    <div className="mini-map">
      <div className="mini-map-label">
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        <small>
          <i /> {points.length} tracked
        </small>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {points.map((point, index) => (
          <CircleMarker
            key={`${point.id}-${index}`}
            center={[point.lat, point.lng]}
            radius={point.severity === "Critical" ? 9 : 7}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: severityColor[point.severity],
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="map-popup">
                <span>{point.category}</span>
                <strong>{point.title}</strong>
                <p>{point.location}</p>
                <small>{point.status}</small>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

function Overview({
  incidents,
  navigate,
  openReport,
  selectIncident,
}: {
  incidents: Incident[]
  navigate: (page: Page) => void
  openReport: () => void
  selectIncident: (incident: Incident) => void
}) {
  const [eonetPoints, setEonetPoints] = useState([
    { id: "e1", title: "Volcanic Activity - Kilauea", category: "Volcanoes", location: "Hawaii, USA", severity: "High" as Severity, status: "Active", lat: 19.42, lng: -155.29, pointType: "Event" },
    { id: "e2", title: "Severe Storm - Typhoon", category: "Severe Storms", location: "Western Pacific", severity: "Critical" as Severity, status: "Active", lat: 18.5, lng: 135.2, pointType: "Event" },
  ])
  const [usgsPoints, setUsgsPoints] = useState([
    { id: "u1", title: "M 5.2 Earthquake", category: "Earthquake", location: "Off Oregon", severity: "High" as Severity, status: "Mag 5.2", lat: 44.2, lng: -128.5, pointType: "Earthquake" },
    { id: "u2", title: "M 4.8 Earthquake", category: "Earthquake", location: "Hindu Kush", severity: "Medium" as Severity, status: "Mag 4.8", lat: 36.5, lng: 70.8, pointType: "Earthquake" },
  ])
  const [gdacsPoints, setGdacsPoints] = useState([
    { id: "g1", title: "Flood Alert - South Asia", category: "Flood", location: "South Asia", severity: "Critical" as Severity, status: "Orange Alert", lat: 24.5, lng: 90.3, pointType: "GDACS" },
    { id: "g2", title: "Drought Advisory", category: "Drought", location: "East Africa", severity: "Medium" as Severity, status: "Green Alert", lat: 5.1, lng: 46.2, pointType: "GDACS" },
  ])
  const [firmsPoints, setFirmsPoints] = useState([
    { id: "f1", title: "Wildfire Hotspot", category: "Wildfire", location: "California, USA", severity: "High" as Severity, status: "Confidence: Nominal", lat: 40.5, lng: -122.3, pointType: "Wildfire" },
    { id: "f2", title: "Wildfire Hotspot", category: "Wildfire", location: "Australia", severity: "High" as Severity, status: "Confidence: High", lat: -32.5, lng: 149.2, pointType: "Wildfire" },
  ])

  useEffect(() => {
    // 1. NASA EONET GeoJSON API
    fetch("https://eonet.gsfc.nasa.gov/api/v3/events/geojson?limit=50&status=open")
      .then(res => res.json())
      .then(data => {
        if (data?.features && Array.isArray(data.features)) {
          const parsed = data.features.map((feat: any, idx: number) => {
            const coords = feat.geometry?.coordinates
            let lat = 0, lng = 0
            if (Array.isArray(coords)) {
              if (typeof coords[0] === "number" && typeof coords[1] === "number") {
                lng = coords[0]
                lat = coords[1]
              } else if (Array.isArray(coords[0])) {
                lng = coords[0][0] || 0
                lat = coords[0][1] || 0
              }
            }
            return {
              id: `eo-${feat.properties?.id || idx}-${idx}`,
              title: feat.properties?.title || "Natural Event",
              category: feat.properties?.categories?.[0]?.title || "Natural Event",
              location: feat.properties?.sources?.[0]?.id || "Global",
              severity: "High" as Severity,
              status: "Active (Open)",
              lat,
              lng,
              pointType: "Event"
            }
          }).filter((p: any) => p.lat !== 0 && p.lng !== 0)
          if (parsed.length > 0) setEonetPoints(parsed)
        }
      }).catch(() => {})

    // 2. USGS Earthquakes GeoJSON API
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
      .then(res => res.json())
      .then(data => {
        if (data?.features && Array.isArray(data.features)) {
          const parsed = data.features.slice(0, 30).map((feat: any, idx: number) => {
            const coords = feat.geometry?.coordinates || [0, 0, 0]
            const mag = feat.properties?.mag || 0
            return {
              id: `usgs-${feat.id || idx}-${idx}`,
              title: feat.properties?.title || "Earthquake",
              category: `M${mag} Earthquake`,
              location: feat.properties?.place || "Unknown",
              severity: (mag >= 5 ? "Critical" : mag >= 3 ? "High" : "Medium") as Severity,
              status: `Mag ${mag} - Depth ${coords[2] || 0}km`,
              lat: coords[1] || 0,
              lng: coords[0] || 0,
              pointType: "Earthquake"
            }
          }).filter((p: any) => p.lat !== 0 && p.lng !== 0)
          if (parsed.length > 0) setUsgsPoints(parsed)
        }
      }).catch(() => {})

    // 3. GDACS Events API
    fetch("https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH")
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data?.features || data?.events
        if (items && Array.isArray(items)) {
          const parsed = items.slice(0, 20).map((item: any, idx: number) => {
            const lat = item.latitude || item.geometry?.coordinates?.[1] || 0
            const lng = item.longitude || item.geometry?.coordinates?.[0] || 0
            return {
              id: `gd-${item.eventid || idx}-${idx}`,
              title: item.name || item.eventname || "Disaster Event",
              category: item.eventtype || "GDACS Alert",
              location: item.country || "Global",
              severity: (item.alertlevel === "Red" ? "Critical" : item.alertlevel === "Orange" ? "High" : "Medium") as Severity,
              status: item.alertlevel ? `Alert: ${item.alertlevel}` : "Active",
              lat,
              lng,
              pointType: "GDACS"
            }
          }).filter((p: any) => p.lat !== 0 && p.lng !== 0)
          if (parsed.length > 0) setGdacsPoints(parsed)
        }
      }).catch(() => {})

    // 4. NASA FIRMS Wildfires API
    fetch("https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_NOAA20_NRT/world/1")
      .then(res => res.text())
      .then(text => {
        if (text && typeof text === "string" && text.includes("latitude")) {
          const lines = text.split("\n").slice(1, 25)
          const parsed = lines.map((line, idx) => {
            const cols = line.split(",")
            if (cols.length > 2) {
              const lat = parseFloat(cols[0])
              const lng = parseFloat(cols[1])
              if (!isNaN(lat) && !isNaN(lng)) {
                return {
                  id: `fire-${idx}`,
                  title: `Wildfire Detection`,
                  category: "Wildfire (FIRMS)",
                  location: `Lat ${lat.toFixed(1)}, Lng ${lng.toFixed(1)}`,
                  severity: "High" as Severity,
                  status: cols[5] || "Nominal",
                  lat,
                  lng,
                  pointType: "Wildfire"
                }
              }
            }
            return null
          }).filter(Boolean)
          if (parsed.length > 0) setFirmsPoints(parsed as any)
        }
      }).catch(() => {})
  }, [])
  const kpis = [
    {
      label: "Active Incidents",
      value: "08",
      change: "+2 today",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "People Affected",
      value: "2,184",
      change: "76 evacuated",
      icon: Users,
      tone: "orange",
    },
    {
      label: "Rescue Personnel",
      value: "126",
      change: "82 deployed",
      icon: ShieldCheck,
      tone: "teal",
    },
    {
      label: "Active Shelters",
      value: "14",
      change: "1,068 beds open",
      icon: TentTree,
      tone: "blue",
    },
  ]
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="pulse-dot" /> TRI-CITY RESPONSE NETWORK ACTIVE
          </div>
          <h1>
            Stay Ahead.
            <br />
            <em>Save Lives.</em>
          </h1>
          <p>
            Real-time emergency coordination and decisive response for
            Chandigarh, Mohali and Panchkula.
          </p>
          <div className="hero-actions">
            <button className="btn btn-danger" onClick={openReport}>
              <Plus size={18} /> Report an Incident
            </button>
            <button className="btn btn-light" onClick={() => navigate("map")}>
              <Map size={18} /> View Live Map
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="radar">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="hero-stat">
            <strong>94%</strong>
            <span>Network readiness</span>
          </div>
        </div>
      </section>
      <div className="alert-strip">
        <div className="alert-icon">
          <CloudLightning size={21} />
        </div>
        <div>
          <strong>Severe weather advisory</strong>
          <p>
            Heavy rainfall expected across the tri-city region until 20:00.
            Flood response units are on high alert.
          </p>
        </div>
        <button onClick={() => navigate("weather")}>
          View advisory <span>→</span>
        </button>
      </div>
      <div className="kpi-grid">
        {kpis.map(({ label, value, change, icon: Icon, tone }) => (
          <div className="kpi-card" key={label}>
            <div className={`kpi-icon ${tone}`}>
              <Icon size={21} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{change}</span>
            </div>
            <TrendingUp className="kpi-trend" size={17} />
          </div>
        ))}
      </div>
      <section className="card overview-map-card">
        <SectionHeader
          eyebrow="Operational picture · Chandigarh tri-city"
          title="Live disaster map"
          action={
            <div className="overview-map-actions">
              <span>
                <i /> Live updates
              </span>
              <button className="text-btn" onClick={() => navigate("map")}>
                Open command map <span>→</span>
              </button>
            </div>
          }
        />
        <div className="overview-map-grid">
          <MiniOperationalMap
            title="NASA EONET Events"
            subtitle="eonet.gsfc.nasa.gov/api/v3/events"
            center={[20, 0]}
            zoom={1}
            points={eonetPoints}
          />
          <MiniOperationalMap
            title="USGS Earthquakes"
            subtitle="earthquake.usgs.gov/.../all_day.geojson"
            center={[20, 0]}
            zoom={1}
            points={usgsPoints}
          />
          <MiniOperationalMap
            title="GDACS Disaster Alerts"
            subtitle="www.gdacs.org/.../geteventlist/SEARCH"
            center={[20, 0]}
            zoom={1}
            points={gdacsPoints}
          />
          <MiniOperationalMap
            title="NASA FIRMS Wildfires"
            subtitle="firms.modaps.eosdis.nasa.gov/.../VIIRS_NOAA20_NRT/world/1"
            center={[20, 0]}
            zoom={1}
            points={firmsPoints}
          />
        </div>
        <div className="overview-map-status">
          <div>
            <span className="critical-dot" />
            <p>
              <strong>2</strong> Critical incidents
            </p>
          </div>
          <div>
            <span className="high-dot" />
            <p>
              <strong>3</strong> Response zones
            </p>
          </div>
          <div>
            <span className="safe-dot" />
            <p>
              <strong>4</strong> Teams in field
            </p>
          </div>
          <div>
            <Radio size={15} />
            <p>
              <strong>12 sec</strong> Last network sync
            </p>
          </div>
        </div>
      </section>
      <div className="overview-grid">
        <section className="card incidents-card">
          <SectionHeader
            eyebrow="Live feed"
            title="Recent incidents"
            action={
              <button
                className="text-btn"
                onClick={() => navigate("incidents")}
              >
                View all <span>→</span>
              </button>
            }
          />
          <div className="incident-list">
            {incidents.slice(0, 4).map((incident) => (
              <button
                className="incident-row"
                key={incident.id}
                onClick={() => selectIncident(incident)}
              >
                <div
                  className={`incident-type ${incident.category.toLowerCase()}`}
                >
                  {incident.category === "Fire" ? (
                    <Flame />
                  ) : incident.category === "Flood" ? (
                    <Droplets />
                  ) : incident.category === "Earthquake" ? (
                    <Activity />
                  ) : (
                    <AlertTriangle />
                  )}
                </div>
                <div className="incident-main">
                  <div>
                    <strong>{incident.title}</strong>
                    <Badge value={incident.severity} />
                  </div>
                  <p>
                    <MapPin size={13} />
                    {incident.location}
                    <span>•</span>
                    {incident.time}
                  </p>
                </div>
                <span className="row-arrow">→</span>
              </button>
            ))}
          </div>
        </section>
        <section className="card teams-card">
          <SectionHeader
            eyebrow="Field operations"
            title="Team availability"
            action={
              <button className="text-btn" onClick={() => navigate("teams")}>
                Manage <span>→</span>
              </button>
            }
          />
          <div className="availability">
            <div className="donut">
              <div>
                <strong>68</strong>
                <span>ready</span>
              </div>
            </div>
            <div className="availability-legend">
              <div>
                <i className="available" />
                <span>Available</span>
                <strong>68</strong>
              </div>
              <div>
                <i className="deployed" />
                <span>Deployed</span>
                <strong>45</strong>
              </div>
              <div>
                <i className="standby" />
                <span>Standby</span>
                <strong>13</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="card weather-card">
          <SectionHeader
            eyebrow="Chandigarh"
            title="Weather conditions"
            action={
              <button className="icon-btn" onClick={() => navigate("weather")}>
                <ArrowDownUp size={16} />
              </button>
            }
          />
          <div className="weather-now">
            <CloudRain size={50} />
            <div>
              <strong>27°</strong>
              <span>Heavy rain</span>
            </div>
          </div>
          <div className="weather-metrics">
            <div>
              <Droplets size={15} />
              <span>Humidity</span>
              <strong>88%</strong>
            </div>
            <div>
              <Wind size={15} />
              <span>Wind</span>
              <strong>18 km/h</strong>
            </div>
            <div>
              <CloudRain size={15} />
              <span>Rainfall</span>
              <strong>48 mm</strong>
            </div>
          </div>
        </section>
        <section className="card stats-card">
          <SectionHeader
            eyebrow="Past 7 days"
            title="Emergency statistics"
            action={
              <button className="icon-btn">
                <Download size={16} />
              </button>
            }
          />
          <div className="bar-chart">
            {[42, 55, 38, 70, 62, 88, 58].map((height, i) => (
              <div key={i}>
                <span
                  style={{ height: `${height}%` }}
                  className={i === 5 ? "peak" : ""}
                />
                <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function IncidentsPage({
  incidents,
  selectIncident,
}: {
  incidents: Incident[]
  selectIncident: (incident: Incident) => void
}) {
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState("All")
  const [sortNewest, setSortNewest] = useState(true)
  const list = useMemo(
    () =>
      incidents.filter(
        (item) =>
          (severity === "All" || item.severity === severity) &&
          `${item.title} ${item.location} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [incidents, query, severity],
  )
  const ordered = sortNewest ? list : [...list].reverse()
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>INCIDENT COMMAND</p>
          <h1>Live Incidents</h1>
          <span>Monitor, verify and coordinate every active emergency.</span>
        </div>
        <div className="title-stat">
          <i />
          <strong>{incidents.length}</strong>
          <span>active events</span>
        </div>
      </div>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents or locations"
          />
        </label>
        <div className="filter-pills">
          {["All", "Critical", "High", "Medium"].map((item) => (
            <button
              key={item}
              className={severity === item ? "active" : ""}
              onClick={() => setSeverity(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="sort-btn" onClick={() => setSortNewest(!sortNewest)}>
          <ArrowDownUp size={16} />{" "}
          {sortNewest ? "Newest first" : "Oldest first"}
        </button>
      </div>
      <div className="incident-table card">
        <div className="table-head">
          <span>Incident</span>
          <span>Category</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Affected</span>
          <span />
        </div>
        {ordered.map((item) => (
          <button
            className="table-row"
            key={item.id}
            onClick={() => selectIncident(item)}
          >
            <span className="incident-cell">
              <i className={`severity-line ${item.severity.toLowerCase()}`} />
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.id} · {item.location}
                </small>
              </span>
            </span>
            <span>{item.category}</span>
            <span>
              <Badge value={item.severity} />
            </span>
            <span className="status-cell">
              <i />
              {item.status}
            </span>
            <span>{formatNumber(item.affected)}</span>
            <span>→</span>
          </button>
        ))}
        {!ordered.length && (
          <div className="empty-state">
            <Search size={30} />
            <strong>No matching incidents</strong>
            <span>Try changing your search or severity filter.</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MapPage() {
  return (
    <div className="page-stack map-page">
      <div className="page-title">
        <div>
          <p>REAL-TIME GEOSPATIAL VIEW</p>
          <h1>Disaster Map</h1>
          <span>
            Live operational intelligence across the Chandigarh tri-city region.
          </span>
        </div>
        <div className="network-pill">
          <Radio size={15} /> Updating live
        </div>
      </div>
      <DisasterMap />
      <div className="map-summary">
        {[
          ["5", "Active incidents"],
          ["4", "Teams in field"],
          ["6", "Care facilities"],
          ["14", "Open shelters"],
        ].map((item) => (
          <div key={item[1]}>
            <strong>{item[0]}</strong>
            <span>{item[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamsPage({ notify }: { notify: (message: string) => void }) {
  const [tab, setTab] = useState("All teams")
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>FIELD OPERATIONS</p>
          <h1>Rescue Teams</h1>
          <span>Coordinate personnel, deployments and response readiness.</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => notify("New team deployment request created")}
        >
          <Plus size={17} /> Create deployment
        </button>
      </div>
      <div className="summary-strip">
        {[
          ["126", "Total personnel"],
          ["68", "Available now"],
          ["45", "Currently deployed"],
          ["13", "On standby"],
        ].map((x, i) => (
          <div key={x[1]}>
            <span className={`summary-icon s${i}`}>
              <Users size={17} />
            </span>
            <p>{x[1]}</p>
            <strong>{x[0]}</strong>
          </div>
        ))}
      </div>
      <div className="tabs">
        {["All teams", "Available", "Deployed", "On standby"].map((item) => (
          <button
            onClick={() => setTab(item)}
            className={tab === item ? "active" : ""}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="team-grid">
        {teams
          .filter((t) => tab === "All teams" || t.status === tab)
          .map((team) => (
            <article className="team-card card" key={team.name}>
              <div className="team-top">
                <div className="team-avatar">
                  <ShieldCheck />
                </div>
                <Badge value={team.status} />
              </div>
              <h3>{team.name}</h3>
              <p>{team.type}</p>
              <div className="team-meta">
                <span>
                  <Users size={14} />
                  {team.members} personnel
                </span>
                <span>
                  <MapPin size={14} />
                  {team.location}
                </span>
              </div>
              <div className="readiness">
                <div>
                  <span>Operational readiness</span>
                  <strong>{team.progress}%</strong>
                </div>
                <div>
                  <i style={{ width: `${team.progress}%` }} />
                </div>
              </div>
              <button
                onClick={() =>
                  notify(`${team.name} opened in dispatch console`)
                }
              >
                View & coordinate <span>→</span>
              </button>
            </article>
          ))}
      </div>
    </div>
  )
}

function ResourcesPage({ notify }: { notify: (message: string) => void }) {
  const [query, setQuery] = useState("")
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>LOGISTICS COMMAND</p>
          <h1>Emergency Resources</h1>
          <span>
            Track critical supplies and allocate equipment in real time.
          </span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => notify("Inventory report exported")}
        >
          <Download size={17} /> Export inventory
        </button>
      </div>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            placeholder="Search inventory"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button className="sort-btn">
          <SlidersHorizontal size={16} /> All categories
        </button>
        <div className="inventory-health">
          <i />
          <span>Inventory health</span>
          <strong>82%</strong>
        </div>
      </div>
      <div className="resource-grid">
        {resources
          .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
          .map(({ icon: Icon, ...resource }) => {
            const percent = Math.round(
              (resource.available / resource.total) * 100,
            )
            return (
              <article className="resource-card card" key={resource.name}>
                <div className="resource-head">
                  <span>
                    <Icon size={21} />
                  </span>
                  <Badge value={resource.category} />
                </div>
                <h3>{resource.name}</h3>
                <p>
                  <MapPin size={13} />
                  {resource.hub}
                </p>
                <div className="resource-count">
                  <strong>{formatNumber(resource.available)}</strong>
                  <span>
                    / {formatNumber(resource.total)} {resource.unit}
                  </span>
                </div>
                <div className="resource-meter">
                  <i style={{ width: `${percent}%` }} />
                </div>
                <div className="resource-foot">
                  <span>{percent}% available</span>
                  <button
                    onClick={() =>
                      notify(`${resource.name} allocation request opened`)
                    }
                  >
                    Allocate →
                  </button>
                </div>
              </article>
            )
          })}
      </div>
    </div>
  )
}

function SheltersPage({ notify }: { notify: (message: string) => void }) {
  const [type, setType] = useState("All")
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>CARE NETWORK</p>
          <h1>Shelters & Hospitals</h1>
          <span>
            Real-time capacity and contacts for emergency care facilities.
          </span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => notify("Facility registration form opened")}
        >
          <Plus size={17} /> Add facility
        </button>
      </div>
      <div className="care-banner">
        <div>
          <BedDouble size={26} />
          <span>
            <strong>1,068</strong> shelter beds available
          </span>
        </div>
        <div>
          <Cross size={26} />
          <span>
            <strong>146</strong> hospital beds available
          </span>
        </div>
        <p>
          <ShieldCheck size={18} /> All facilities checked 4 minutes ago
        </p>
      </div>
      <div className="tabs">
        {["All", "Shelter", "Hospital"].map((item) => (
          <button
            className={type === item ? "active" : ""}
            onClick={() => setType(item)}
            key={item}
          >
            {item === "All" ? "All facilities" : `${item}s`}
          </button>
        ))}
      </div>
      <div className="facility-grid">
        {shelters
          .filter((x) => type === "All" || x.type === type)
          .map((facility) => {
            const percent = Math.round(
              (facility.occupied / facility.capacity) * 100,
            )
            return (
              <article className="facility-card card" key={facility.name}>
                <div className="facility-icon">
                  {facility.type === "Hospital" ? <Hospital /> : <TentTree />}
                </div>
                <div className="facility-info">
                  <div>
                    <span>{facility.type}</span>
                    <Badge value={facility.status} />
                  </div>
                  <h3>{facility.name}</h3>
                  <p>
                    <MapPin size={14} />
                    {facility.location}
                  </p>
                  <div className="capacity-row">
                    <span>Occupancy</span>
                    <strong>
                      {facility.occupied} / {facility.capacity}
                    </strong>
                  </div>
                  <div className="resource-meter">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <div className="facility-actions">
                    <a href={`tel:${facility.phone}`}>
                      <Phone size={15} /> Call facility
                    </a>
                    <button
                      onClick={() => notify(`${facility.name} located on map`)}
                    >
                      View on map →
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
      </div>
    </div>
  )
}

function WeatherPage() {
  const forecasts = [
    ["Now", "27°", CloudRain, "Heavy rain"],
    ["15:00", "26°", CloudLightning, "Thunderstorms"],
    ["18:00", "25°", CloudRain, "Heavy rain"],
    ["21:00", "24°", CloudRain, "Showers"],
    ["00:00", "23°", Wind, "Cloudy"],
  ] as const
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>ENVIRONMENTAL INTELLIGENCE</p>
          <h1>Weather Monitoring</h1>
          <span>
            Forecasts, warnings and live conditions for field operations.
          </span>
        </div>
        <div className="network-pill">
          <Radio size={15} /> IMD data · 2 min ago
        </div>
      </div>
      <div className="weather-hero">
        <div>
          <span>CHANDIGARH · MONDAY, 14 OCTOBER</span>
          <div className="weather-big">
            <CloudRain />
            <strong>27°</strong>
            <p>
              Heavy rain<small>Feels like 30°</small>
            </p>
          </div>
        </div>
        <div className="weather-detail">
          <div>
            <Droplets />
            <span>
              Humidity<strong>88%</strong>
            </span>
          </div>
          <div>
            <Wind />
            <span>
              Wind<strong>18 km/h NE</strong>
            </span>
          </div>
          <div>
            <CloudRain />
            <span>
              Rainfall<strong>48 mm</strong>
            </span>
          </div>
          <div>
            <Thermometer />
            <span>
              Pressure<strong>1006 hPa</strong>
            </span>
          </div>
        </div>
      </div>
      <div className="warning-card">
        <AlertTriangle />
        <div>
          <span>ORANGE ALERT · VALID UNTIL 20:00</span>
          <h3>Heavy to very heavy rainfall is likely</h3>
          <p>
            Localized flooding, reduced visibility and waterlogging are
            expected. Avoid low-lying routes and keep flood units ready.
          </p>
        </div>
      </div>
      <section className="card forecast-card">
        <SectionHeader eyebrow="Next 12 hours" title="Hourly forecast" />
        <div className="forecast-row">
          {forecasts.map(([time, temp, Icon, label]) => (
            <div key={time}>
              <span>{time}</span>
              <Icon />
              <strong>{temp}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SettingsPage({ notify }: { notify: (message: string) => void }) {
  const [toggles, setToggles] = useState([true, true, false])
  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <p>SYSTEM ADMINISTRATION</p>
          <h1>Settings</h1>
          <span>
            Configure your response center, alerts and user preferences.
          </span>
        </div>
      </div>
      <div className="settings-layout">
        <aside className="settings-nav">
          {["General", "Notifications", "Team access", "Integrations"].map(
            (x, i) => (
              <button className={i === 0 ? "active" : ""} key={x}>
                {x}
              </button>
            ),
          )}
        </aside>
        <section className="card settings-card">
          <SectionHeader eyebrow="Response center" title="General settings" />
          <div className="form-grid">
            <label>
              <span>Organization name</span>
              <input defaultValue="ResQ Tri-City Command Center" />
            </label>
            <label>
              <span>Emergency hotline</span>
              <input defaultValue="112" />
            </label>
            <label>
              <span>Operating region</span>
              <select defaultValue="tri">
                <option value="tri">Chandigarh Tri-City</option>
              </select>
            </label>
            <label>
              <span>Default timezone</span>
              <select defaultValue="ist">
                <option value="ist">India Standard Time (IST)</option>
              </select>
            </label>
          </div>
          <hr />
          <h3>Alert preferences</h3>
          {[
            "Critical incident alerts",
            "Weather advisory updates",
            "Daily operational briefing",
          ].map((item, i) => (
            <div className="setting-row" key={item}>
              <div>
                <strong>{item}</strong>
                <span>
                  {i === 0
                    ? "Notify immediately on all devices"
                    : i === 1
                      ? "Receive official weather warnings"
                      : "Daily summary at 08:00"}
                </span>
              </div>
              <button
                className={`toggle ${toggles[i] ? "on" : ""}`}
                onClick={() =>
                  setToggles(toggles.map((x, idx) => (idx === i ? !x : x)))
                }
              >
                <i />
              </button>
            </div>
          ))}
          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={() => notify("Settings saved successfully")}
            >
              <Check size={17} /> Save changes
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function ReportModal({
  close,
  submit,
}: {
  close: () => void
  submit: (incident: Incident) => void
}) {
  const [form, setForm] = useState({
    title: "",
    category: "Flood",
    description: "",
    location: "",
    severity: "High" as Severity,
    affected: "0",
    team: "Alpha Rescue Unit",
  })
  const update = (key: string, value: string) =>
    setForm({ ...form, [key]: value })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit({
      id: `INC-${2410 + Math.floor(Math.random() * 80)}`,
      ...form,
      affected: Number(form.affected),
      status: "New report",
      time: "Just now",
      lat: 30.7333,
      lng: 76.7794,
    })
  }
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal report-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>EMERGENCY REPORT</span>
            <h2>Report an incident</h2>
            <p>Provide accurate details to alert the response network.</p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full">
              <span>Incident title</span>
              <input
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Flash flooding on Madhya Marg"
              />
            </label>
            <label>
              <span>Disaster category</span>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {["Flood", "Earthquake", "Fire", "Landslide", "Cyclone"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              <span>Severity</span>
              <select
                value={form.severity}
                onChange={(e) => update("severity", e.target.value)}
              >
                {["Critical", "High", "Medium"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="full">
              <span>Location</span>
              <div className="input-icon">
                <MapPin size={16} />
                <input
                  required
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Address, landmark or sector"
                />
              </div>
            </label>
            <label className="full">
              <span>Description</span>
              <textarea
                required
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the situation, hazards and immediate needs"
                rows={4}
              />
            </label>
            <label>
              <span>Affected population</span>
              <input
                type="number"
                min="0"
                value={form.affected}
                onChange={(e) => update("affected", e.target.value)}
              />
            </label>
            <label>
              <span>Assign rescue team</span>
              <select
                value={form.team}
                onChange={(e) => update("team", e.target.value)}
              >
                {teams.map((x) => (
                  <option key={x.name}>{x.name}</option>
                ))}
              </select>
            </label>
            <label className="full upload-field">
              <input type="file" accept="image/*" />
              <Upload size={20} />
              <span>
                <strong>Upload incident images</strong>PNG or JPG up to 10 MB
              </span>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button className="btn btn-danger" type="submit">
              <Radio size={17} /> Submit emergency report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IncidentModal({
  incident,
  close,
  notify,
}: {
  incident: Incident
  close: () => void
  notify: (message: string) => void
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal detail-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>
              {incident.id} · {incident.category}
            </span>
            <h2>{incident.title}</h2>
            <p>
              <MapPin size={14} /> {incident.location}
            </p>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <div className="detail-banner">
          <Badge value={incident.severity} />
          <span>{incident.status}</span>
          <small>Reported {incident.time}</small>
        </div>
        <div className="detail-body">
          <div>
            <h4>Situation overview</h4>
            <p>{incident.description}</p>
          </div>
          <div className="detail-stats">
            <span>
              <strong>{formatNumber(incident.affected)}</strong>People affected
            </span>
            <span>
              <strong>{incident.team}</strong>Assigned unit
            </span>
          </div>
          <div>
            <h4>Response controls</h4>
            <div className="control-buttons">
              <button
                onClick={() => notify("Incident status updated to contained")}
              >
                <Check /> Mark contained
              </button>
              <button onClick={() => notify("Additional resources requested")}>
                <PackageOpen /> Allocate resources
              </button>
              <button onClick={() => notify("Public alert notification sent")}>
                <Bell /> Send alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  )
  const [incidents, setIncidents] = useState(initialIncidents)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState("")
  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }
  const navigate = (next: Page) => {
    setPage(next)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const submitIncident = (incident: Incident) => {
    setIncidents([incident, ...incidents])
    setReportOpen(false)
    setPage("incidents")
    notify("Incident reported and response network alerted")
  }
  const title = navItems.find((item) => item.id === page)?.label
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div>
            <LifeBuoy />
          </div>
          <span>
            <strong>ResQ</strong>
            <small>Emergency Response Network</small>
          </span>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="command-status">
          <span>
            <i /> Command center
          </span>
          <strong>OPERATIONAL</strong>
        </div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => navigate(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "incidents" && <b>{incidents.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <div>
            <Phone />
          </div>
          <span>
            <small>National emergency</small>
            <strong>112</strong>
          </span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText("112")
              notify("Emergency number copied")
            }}
          >
            Copy
          </button>
        </div>
        <div className="sidebar-footer">
          <ShieldCheck size={14} /> Secured response network
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="top-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
            <div>
              <small>Operations /</small>
              <strong>{title}</strong>
            </div>
          </div>
          <label className="global-search">
            <Search size={17} />
            <input placeholder="Search incidents, teams, locations..." />
          </label>
          <div className="top-actions">
            <div className="network-status">
              <i />
              <span>
                <small>NETWORK</small>
                <strong>Online</strong>
              </span>
            </div>
            <div className="dropdown-wrap">
              <button
                className="notification-btn"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileOpen(false)
                }}
              >
                <Bell size={19} />
                <i>3</i>
              </button>
              {notificationsOpen && (
                <div className="dropdown notification-menu">
                  <div>
                    <strong>Notifications</strong>
                    <button
                      onClick={() => notify("All notifications marked as read")}
                    >
                      Mark all read
                    </button>
                  </div>
                  {[
                    ["Critical flood alert", "Sector 6 · 12 min ago"],
                    ["Team Alpha deployed", "Command update · 21 min ago"],
                    ["Orange weather warning", "IMD advisory · 38 min ago"],
                  ].map((x) => (
                    <button
                      key={x[0]}
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <i />
                      <span>
                        <strong>{x[0]}</strong>
                        <small>{x[1]}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown-wrap">
              <button
                className="profile"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationsOpen(false)
                }}
              >
                <span>AK</span>
                <div>
                  <strong>Arjun Khanna</strong>
                  <small>System Administrator</small>
                </div>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="dropdown profile-menu">
                  <button>
                    <CircleUserRound /> My profile
                  </button>
                  <button onClick={() => navigate("settings")}>
                    <Settings /> Account settings
                  </button>
                  <button>
                    <ShieldCheck /> Security center
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          {page === "overview" && (
            <Overview
              incidents={incidents}
              navigate={navigate}
              openReport={() => setReportOpen(true)}
              selectIncident={setSelectedIncident}
            />
          )}
          {page === "incidents" && (
            <IncidentsPage
              incidents={incidents}
              selectIncident={setSelectedIncident}
            />
          )}
          {page === "map" && <MapPage />}
          {page === "teams" && <TeamsPage notify={notify} />}
          {page === "resources" && <ResourcesPage notify={notify} />}
          {page === "shelters" && <SheltersPage notify={notify} />}
          {page === "weather" && <WeatherPage />}
          {page === "settings" && <SettingsPage notify={notify} />}
        </main>
      </div>
      <button className="mobile-report" onClick={() => setReportOpen(true)}>
        <Plus /> <span>Report incident</span>
      </button>
      {reportOpen && (
        <ReportModal
          close={() => setReportOpen(false)}
          submit={submitIncident}
        />
      )}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          close={() => setSelectedIncident(null)}
          notify={notify}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  )
}

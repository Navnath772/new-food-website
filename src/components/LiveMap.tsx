import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FoodDonation, Organization, Volunteer } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import { Layers, MapPin, Navigation, Sparkles, Filter, Info, Flame, Eye } from 'lucide-react';

interface LiveMapProps {
  focusedDonationId?: string;
  onSelectDonation?: (id: string) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ focusedDonationId, onSelectDonation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const animIntervalRef = useRef<any>(null);

  const [filterType, setFilterType] = useState<
    'ALL' | 'URGENT' | 'DONORS' | 'NGOS' | 'VOLUNTEERS' | 'ACTIVE' | 'HEATMAP'
  >('ALL');
  const [donations, setDonations] = useState<FoodDonation[]>(appStore.getDonations());
  const [organizations, setOrganizations] = useState<Organization[]>(appStore.getOrganizations());
  const [volunteers, setVolunteers] = useState<Volunteer[]>(appStore.getVolunteers());

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setDonations([...appStore.getDonations()]);
      setOrganizations([...appStore.getOrganizations()]);
      setVolunteers([...appStore.getVolunteers()]);
    });
    return unsub;
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.705, 74.2433],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | FoodBridge AI',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routesLayerRef.current = L.layerGroup().addTo(map);
      heatmapLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render markers, route animations, and heatmap layers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routesLayerRef.current || !heatmapLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const createCustomIcon = (bgColor: string, iconText: string, borderColor: string) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: white;
            border: 2px solid ${borderColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            ${iconText}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // --- Heatmap Mode ---
    if (filterType === 'HEATMAP') {
      // Surplus area circles (Emerald)
      donations.forEach((d) => {
        L.circle([d.latitude, d.longitude], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.25,
          radius: 400 + d.quantity * 5,
        })
          .bindPopup(`<b>SURPLUS HOTSPOT:</b><br/>${d.donor_name}<br/>${d.quantity} ${d.unit} surplus`)
          .addTo(heatmapLayerRef.current!);
      });

      // Demand area circles (Blue)
      organizations.forEach((org) => {
        L.circle([org.latitude, org.longitude], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.25,
          radius: 450 + org.capacity * 4,
        })
          .bindPopup(`<b>DEMAND HOTSPOT:</b><br/>${org.name}<br/>Capacity: ${org.capacity} people`)
          .addTo(heatmapLayerRef.current!);
      });

      // Urgent Rescue areas (Rose)
      donations.filter((d) => d.urgency === 'Critical').forEach((d) => {
        L.circle([d.latitude, d.longitude], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          radius: 300,
        })
          .bindPopup(`<b>CRITICAL RESCUE PRIORITY:</b><br/>${d.food_name}`)
          .addTo(heatmapLayerRef.current!);
      });
      return;
    }

    // 1. Render Donors & Food Donations (🟢 Green / 🔴 Urgent Red)
    if (filterType === 'ALL' || filterType === 'URGENT' || filterType === 'DONORS' || filterType === 'ACTIVE') {
      donations.forEach((d) => {
        if (filterType === 'URGENT' && d.urgency !== 'Critical' && d.urgency !== 'High') return;
        if (filterType === 'ACTIVE' && (d.status === 'COMPLETED' || d.status === 'EXPIRED')) return;

        const isUrgent = d.urgency === 'Critical' || d.urgency === 'High';
        const icon = createCustomIcon(
          isUrgent ? '#ef4444' : '#10b981',
          isUrgent ? '🚨' : '🍲',
          isUrgent ? '#b91c1c' : '#047857'
        );

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 2px;">
            <div style="font-size: 10px; font-weight: bold; color: ${isUrgent ? '#b91c1c' : '#047857'}; text-transform: uppercase;">
              ${d.status.replace('_', ' ')} · ${d.urgency.toUpperCase()} PRIORITY
            </div>
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0; color: #111827;">${d.food_name}</h4>
            <div style="font-size: 11px; color: #4b5563; margin-bottom: 6px;">
              <strong>${d.quantity} ${d.unit}</strong> (~${d.estimated_meals} meals)<br/>
              Donor: ${d.donor_name}<br/>
              Rescue Score: <strong>${d.food_rescue_score || 88} / 100</strong>
            </div>
            <div style="font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 4px;">
              Safe Window: ${d.recommended_pickup_window}
            </div>
          </div>
        `;

        L.marker([d.latitude, d.longitude], { icon })
          .bindPopup(popupContent)
          .addTo(markersLayerRef.current!);
      });
    }

    // 2. Render NGOs & Shelters (🔵 Blue)
    if (filterType === 'ALL' || filterType === 'NGOS') {
      organizations.forEach((org) => {
        const icon = createCustomIcon('#3b82f6', '🏠', '#1d4ed8');
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 190px;">
            <div style="font-size: 10px; font-weight: bold; color: #1d4ed8; text-transform: uppercase;">
              ${org.type} · ${org.verified ? 'Verified Partner' : 'Community Center'}
            </div>
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0; color: #111827;">${org.name}</h4>
            <div style="font-size: 11px; color: #4b5563;">
              Capacity: <strong>${org.capacity} people</strong><br/>
              Phone: ${org.phone}<br/>
              ${org.address}
            </div>
          </div>
        `;
        L.marker([org.latitude, org.longitude], { icon })
          .bindPopup(popupContent)
          .addTo(markersLayerRef.current!);
      });
    }

    // 3. Render Volunteer Couriers (🟠 Amber)
    if (filterType === 'ALL' || filterType === 'VOLUNTEERS') {
      volunteers.forEach((v) => {
        const icon = createCustomIcon('#f59e0b', '🚴', '#b45309');
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-size: 10px; font-weight: bold; color: #b45309; text-transform: uppercase;">
              Active Courier · ${v.availability}
            </div>
            <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0; color: #111827;">${v.name}</h4>
            <div style="font-size: 11px; color: #4b5563;">
              Vehicle: <strong>${v.vehicle_type}</strong><br/>
              Completed Runs: <strong>${v.completed_pickups}</strong><br/>
              Badges: ${v.badges.join(', ') || 'Courier'}
            </div>
          </div>
        `;
        L.marker([v.current_latitude, v.current_longitude], { icon })
          .bindPopup(popupContent)
          .addTo(markersLayerRef.current!);
      });
    }

    // 4. Render Active Delivery Routes & Animated Moving Courier Marker
    donations.forEach((d) => {
      if (
        (d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT') &&
        d.assigned_ngo_id
      ) {
        const targetOrg = organizations.find((o) => o.id === d.assigned_ngo_id);
        if (targetOrg) {
          const latLngs: [number, number][] = [
            [d.latitude, d.longitude],
            [targetOrg.latitude, targetOrg.longitude],
          ];

          // Dashed polyline
          L.polyline(latLngs, {
            color: '#059669',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8',
          })
            .bindTooltip(`Demo Route: ${d.food_name} (${d.quantity} ${d.unit})`, {
              permanent: false,
            })
            .addTo(routesLayerRef.current!);

          // Moving marker animation along route (Demo Route Visualization)
          let step = 0;
          const movingIcon = L.divIcon({
            className: 'moving-courier-marker',
            html: `
              <div style="background: #064e3b; color: #34d399; border: 2px solid white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 12px #10b981;">
                🚚
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const movingMarker = L.marker(latLngs[0], { icon: movingIcon })
            .bindTooltip('Demo Route Visualization', { permanent: false })
            .addTo(routesLayerRef.current!);

          animIntervalRef.current = setInterval(() => {
            step = (step + 1) % 100;
            const progress = step / 100;
            const currentLat = latLngs[0][0] + (latLngs[1][0] - latLngs[0][0]) * progress;
            const currentLng = latLngs[0][1] + (latLngs[1][1] - latLngs[0][1]) * progress;
            movingMarker.setLatLng([currentLat, currentLng]);
          }, 300);
        }
      }
    });

    // Zoom focus
    if (focusedDonationId) {
      const targetDonation = donations.find((d) => d.id === focusedDonationId);
      if (targetDonation && mapInstanceRef.current) {
        mapInstanceRef.current.setView([targetDonation.latitude, targetDonation.longitude], 15, {
          animate: true,
        });
      }
    }
  }, [donations, organizations, volunteers, filterType, focusedDonationId]);

  return (
    <div className="space-y-4 py-2">
      {/* Map Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Hyper-Local Rescue Radar (Kolhapur Network)</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time GPS coordination between food donors, AI matches, active couriers, and shelters.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 flex-wrap text-xs font-bold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            Active Routes
          </button>
          <button
            onClick={() => setFilterType('URGENT')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'URGENT'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            }`}
          >
            🔴 Urgent
          </button>
          <button
            onClick={() => setFilterType('DONORS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'DONORS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            🟢 Donors
          </button>
          <button
            onClick={() => setFilterType('NGOS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'NGOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
            }`}
          >
            🔵 Shelters
          </button>
          <button
            onClick={() => setFilterType('VOLUNTEERS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'VOLUNTEERS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
            }`}
          >
            🟠 Couriers
          </button>
          <button
            onClick={() => setFilterType('HEATMAP')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'HEATMAP'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300'
            }`}
          >
            <Flame className="w-3 h-3 text-purple-400" />
            <span>Heatmap</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-md overflow-hidden h-[600px] w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 text-xs space-y-2 max-w-xs">
          <div className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1 flex items-center justify-between">
            <span>Map Legend</span>
            <span className="text-[10px] text-gray-400 font-mono">Demo Route Visualization</span>
          </div>
          <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
            {filterType === 'HEATMAP' ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-60 shrink-0"></span>
                  <span>SURPLUS Hotspots (Food Supply)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60 shrink-0"></span>
                  <span>DEMAND Hotspots (Shelter Capacity)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 opacity-60 shrink-0"></span>
                  <span>RESCUE Hotspots (Critical Expiry)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700 shrink-0"></span>
                  <span>🟢 Donors (College Mess, Banquets)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 shrink-0"></span>
                  <span>🔴 Urgent Batches (&lt; 2 hrs window)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-700 shrink-0"></span>
                  <span>🔵 Beneficiary Shelters &amp; Orphanages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-700 shrink-0"></span>
                  <span>🟠 Rapid Couriers (Bike/EV/Walk)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-0.5 border-t-2 border-dashed border-emerald-600 shrink-0"></span>
                  <span>Green Line: Active Transit Corridor</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

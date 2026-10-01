import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FoodDonation, Organization, Volunteer } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import {
  Layers,
  MapPin,
  Navigation,
  Sparkles,
  Filter,
  Info,
  Flame,
  Eye,
  Clock,
  Utensils,
  Home,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Play,
  X,
  Phone,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { TrackOrderModal } from './TrackOrderModal.tsx';

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

  // Live Node Inspector State per user prompt
  const [inspectedNode, setInspectedNode] = useState<{
    type: 'donor' | 'ngo' | 'volunteer';
    data: any;
  } | null>(null);

  // Track Order Modal state
  const [activeTrackingDonation, setActiveTrackingDonation] = useState<FoodDonation | null>(null);

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

  // Render markers, route vectors, and node click handlers
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !markersLayerRef.current ||
      !routesLayerRef.current ||
      !heatmapLayerRef.current
    )
      return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    // Custom Icon Builder
    const createCustomIcon = (
      bgColor: string,
      iconEmoji: string,
      borderColor: string,
      isPulsing = false,
      badgeText?: string
    ) => {
      return L.divIcon({
        className: 'custom-map-node',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${
              isPulsing
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${bgColor}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              background: ${bgColor};
              color: white;
              border: 2px solid ${borderColor};
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              position: relative;
              z-index: 10;
              cursor: pointer;
            ">
              ${iconEmoji}
            </div>
            ${
              badgeText
                ? `<div style="
                    position: absolute;
                    bottom: -8px;
                    background: #111827;
                    color: #f9fafb;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 1px 4px;
                    border-radius: 9999px;
                    border: 1px solid rgba(255,255,255,0.4);
                    white-space: nowrap;
                    z-index: 15;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  ">
                    ${badgeText}
                  </div>`
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    };

    // --- Heatmap Mode ---
    if (filterType === 'HEATMAP') {
      donations.forEach((d) => {
        L.circle([d.latitude, d.longitude], {
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.25,
          radius: 350 + d.quantity * 4,
        })
          .bindPopup(`<b>SURPLUS HOTSPOT:</b><br/>${d.donor_name}<br/>${d.quantity} ${d.unit} surplus`)
          .addTo(heatmapLayerRef.current!);
      });

      organizations.forEach((org) => {
        L.circle([org.latitude, org.longitude], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.25,
          radius: 400 + org.capacity * 3,
        })
          .bindPopup(`<b>DEMAND HOTSPOT:</b><br/>${org.name}<br/>Quota: ${org.capacity} people`)
          .addTo(heatmapLayerRef.current!);
      });

      donations
        .filter((d) => d.urgency === 'Critical' || d.urgency === 'High')
        .forEach((d) => {
          L.circle([d.latitude, d.longitude], {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            radius: 280,
          })
            .bindPopup(`<b>CRITICAL RESCUE PRIORITY:</b><br/>${d.food_name}`)
            .addTo(heatmapLayerRef.current!);
        });
      return;
    }

    // 1. Render Donors & Food Donations (🟠 Orange Markers per Prompt)
    if (
      filterType === 'ALL' ||
      filterType === 'URGENT' ||
      filterType === 'DONORS' ||
      filterType === 'ACTIVE'
    ) {
      donations.forEach((d) => {
        if (filterType === 'URGENT' && d.urgency !== 'Critical' && d.urgency !== 'High') return;
        if (filterType === 'ACTIVE' && (d.status === 'COMPLETED' || d.status === 'EXPIRED')) return;

        const isUrgent = d.urgency === 'Critical' || d.urgency === 'High';
        const icon = createCustomIcon(
          isUrgent ? '#ef4444' : '#f97316', // Orange 🟠 or Urgent Red 🔴
          isUrgent ? '🚨' : '🍱',
          isUrgent ? '#b91c1c' : '#c2410c',
          isUrgent,
          `${d.estimated_meals}m`
        );

        const marker = L.marker([d.latitude, d.longitude], { icon }).addTo(markersLayerRef.current!);
        marker.on('click', () => {
          setInspectedNode({ type: 'donor', data: d });
        });
      });
    }

    // 2. Render NGOs & Shelters (🟢 Green Markers per Prompt)
    if (filterType === 'ALL' || filterType === 'NGOS') {
      organizations.forEach((org) => {
        const icon = createCustomIcon(
          '#10b981', // Green 🟢
          '🏠',
          '#047857',
          false,
          `${org.capacity}p`
        );

        const marker = L.marker([org.latitude, org.longitude], { icon }).addTo(markersLayerRef.current!);
        marker.on('click', () => {
          setInspectedNode({ type: 'ngo', data: org });
        });
      });
    }

    // 3. Render Volunteer Couriers (🔵 Blue Markers per Prompt)
    if (filterType === 'ALL' || filterType === 'VOLUNTEERS') {
      volunteers.forEach((v) => {
        const iconEmoji = v.vehicle_type.includes('Van')
          ? '🚐'
          : v.vehicle_type.includes('Bike')
          ? '🚴'
          : '🛵';
        const icon = createCustomIcon(
          '#3b82f6', // Blue 🔵
          iconEmoji,
          '#1d4ed8',
          v.availability === 'On Delivery',
          v.vehicle_type.split(' ')[0]
        );

        const marker = L.marker([v.current_latitude, v.current_longitude], { icon }).addTo(
          markersLayerRef.current!
        );
        marker.on('click', () => {
          setInspectedNode({ type: 'volunteer', data: v });
        });
      });
    }

    // 4. Dynamic Route Vectors: Connecting Donor -> Volunteer -> Shelter
    donations.forEach((d) => {
      if (
        (d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT') &&
        d.assigned_ngo_id
      ) {
        const targetOrg = organizations.find((o) => o.id === d.assigned_ngo_id);
        const assignedVol = volunteers.find((v) => v.name === d.assigned_volunteer_name) || volunteers[0];

        if (targetOrg && assignedVol) {
          const routePoints: [number, number][] = [
            [d.latitude, d.longitude], // Donor 🟠
            [assignedVol.current_latitude, assignedVol.current_longitude], // Volunteer 🔵
            [targetOrg.latitude, targetOrg.longitude], // Shelter 🟢
          ];

          // Dynamic Animated Gradient Polyline
          L.polyline(routePoints, {
            color: '#10b981',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8',
          })
            .bindTooltip(`Active Rescue Corridor: ${d.food_name} → ${targetOrg.name}`, {
              permanent: false,
            })
            .addTo(routesLayerRef.current!);

          // Pulsing Vehicle Indicator moving along the route
          let step = 0;
          const courierVehicleIcon = L.divIcon({
            className: 'pulsing-transit-vehicle',
            html: `
              <div style="
                background: #047857;
                color: #ffffff;
                border: 2px solid #ffffff;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                box-shadow: 0 0 14px #10b981;
                cursor: pointer;
              ">
                🛵
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const movingMarker = L.marker(routePoints[0], { icon: courierVehicleIcon })
            .bindTooltip(`En Route: ${d.food_name} (Click to Track Order)`, { permanent: false })
            .addTo(routesLayerRef.current!);

          movingMarker.on('click', () => {
            setActiveTrackingDonation(d);
          });

          animIntervalRef.current = setInterval(() => {
            step = (step + 1) % 100;
            const progress = step / 100;
            // Interpolate along the 2 segment route
            let lat = 0;
            let lng = 0;
            if (progress < 0.5) {
              const segProgress = progress * 2;
              lat = routePoints[0][0] + (routePoints[1][0] - routePoints[0][0]) * segProgress;
              lng = routePoints[0][1] + (routePoints[1][1] - routePoints[0][1]) * segProgress;
            } else {
              const segProgress = (progress - 0.5) * 2;
              lat = routePoints[1][0] + (routePoints[2][0] - routePoints[1][0]) * segProgress;
              lng = routePoints[1][1] + (routePoints[2][1] - routePoints[1][1]) * segProgress;
            }
            movingMarker.setLatLng([lat, lng]);
          }, 250);
        }
      }
    });

    // Zoom focus if prop given
    if (focusedDonationId) {
      const targetDonation = donations.find((d) => d.id === focusedDonationId);
      if (targetDonation && mapInstanceRef.current) {
        mapInstanceRef.current.setView([targetDonation.latitude, targetDonation.longitude], 15, {
          animate: true,
        });
        setInspectedNode({ type: 'donor', data: targetDonation });
      }
    }
  }, [donations, organizations, volunteers, filterType, focusedDonationId]);

  return (
    <div className="space-y-4 py-2">
      {/* Map Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Hyper-Local Food Rescue Radar</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Spatial situational awareness tracking surplus nodes, urgent expiry limits, and couriers.
          </p>
        </div>

        {/* Color-Coded Filter Pills */}
        <div className="flex items-center space-x-1.5 flex-wrap text-xs font-bold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setFilterType('DONORS')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'DONORS'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
            }`}
          >
            <span>🟠 Donors</span>
          </button>
          <button
            onClick={() => setFilterType('NGOS')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'NGOS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <span>🟢 Shelters</span>
          </button>
          <button
            onClick={() => setFilterType('VOLUNTEERS')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'VOLUNTEERS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
            }`}
          >
            <span>🔵 Couriers</span>
          </button>
          <button
            onClick={() => setFilterType('URGENT')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'URGENT'
                ? 'bg-red-600 text-white shadow-xs animate-pulse'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            }`}
          >
            <span>🚨 Urgent (&lt;2h)</span>
          </button>
          <button
            onClick={() => setFilterType('HEATMAP')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              filterType === 'HEATMAP'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-md overflow-hidden h-[620px] w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 text-xs space-y-2 max-w-xs">
          <div className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-1 flex items-center justify-between">
            <span>Spatial Nodes</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">Real-Time</span>
          </div>
          <div className="space-y-1.5 text-gray-700 dark:text-gray-300 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-700 shrink-0" />
              <span>🟠 Food Donors (Messes, Hotels, Banquets)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700 shrink-0" />
              <span>🟢 Verified Shelters &amp; Orphanages</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-700 shrink-0" />
              <span>🔵 Field Volunteers (Insulated Cargo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 shrink-0 animate-ping" />
              <span>🚨 Critical Expiry (&lt; 2h Safe Window)</span>
            </div>
            <div className="flex items-center space-x-2 pt-1 border-t border-gray-100 dark:border-slate-800">
              <span className="w-6 h-0.5 border-t-2 border-dashed border-emerald-600 shrink-0" />
              <span>Dynamic Route Vector with Courier Marker</span>
            </div>
          </div>
        </div>

        {/* Live Node Inspector Drawer / Card per prompt */}
        {inspectedNode && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 text-xs space-y-3 animate-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    inspectedNode.type === 'donor'
                      ? 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300'
                      : inspectedNode.type === 'ngo'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {inspectedNode.type === 'donor'
                    ? 'Food Donor Node'
                    : inspectedNode.type === 'ngo'
                    ? 'Shelter Demand Node'
                    : 'Courier Field Unit'}
                </span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                  {inspectedNode.type === 'donor'
                    ? inspectedNode.data.food_name
                    : inspectedNode.data.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectedNode(null)}
                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Inspector Details */}
            {inspectedNode.type === 'donor' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Donor:</span>
                  <strong>{inspectedNode.data.donor_name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quantity:</span>
                  <strong className="text-emerald-600 font-bold">
                    {inspectedNode.data.quantity} {inspectedNode.data.unit} (~{inspectedNode.data.estimated_meals} meals)
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safe Window:</span>
                  <span className="font-bold text-amber-600">
                    {inspectedNode.data.recommended_pickup_window}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Address:</span>
                  <span className="text-right truncate max-w-[180px]">
                    {inspectedNode.data.pickup_address}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTrackingDonation(inspectedNode.data)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center space-x-1 shadow-sm transition-all"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order (7 Stages)</span>
                  </button>
                </div>
              </div>
            )}

            {inspectedNode.type === 'ngo' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Shelter Type:</span>
                  <strong>{inspectedNode.data.type}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hunger Demand:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    HIGH DEMAND
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resident Quota:</span>
                  <strong>{inspectedNode.data.capacity} people</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phone:</span>
                  <strong>{inspectedNode.data.phone}</strong>
                </div>
                <div className="text-[11px] text-gray-500">{inspectedNode.data.address}</div>
              </div>
            )}

            {inspectedNode.type === 'volunteer' && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Vehicle:</span>
                  <strong>{inspectedNode.data.vehicle_type}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <strong className="text-emerald-600">{inspectedNode.data.availability}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed Rescues:</span>
                  <strong>{inspectedNode.data.completed_pickups} runs</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Badges:</span>
                  <span className="truncate max-w-[180px]">
                    {inspectedNode.data.badges.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7-Stage Track Order Modal Integration */}
      <TrackOrderModal
        isOpen={!!activeTrackingDonation}
        onClose={() => setActiveTrackingDonation(null)}
        donation={activeTrackingDonation}
      />
    </div>
  );
};

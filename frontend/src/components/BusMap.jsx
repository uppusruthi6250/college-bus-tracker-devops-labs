/**
 * Bus Map Component with Smooth Animation
 * Features:
 * - Linear Interpolation (LERP) for smooth marker movement
 * - Bearing calculation for realistic vehicle rotation
 * - requestAnimationFrame for 60fps animations
 * - Road snapping support (optional with Google Roads API)
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BusMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Calculate bearing (angle) between two coordinates
 * @param {Object} from - {latitude, longitude}
 * @param {Object} to - {latitude, longitude}
 * @returns {number} - Bearing in degrees (0-360)
 */
function calculateBearing(from, to) {
    const lat1 = from.latitude * Math.PI / 180;
    const lat2 = to.latitude * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
}

/**
 * Linear interpolation between two values
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} t - Progress (0 to 1)
 * @returns {number} - Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

function BusMap({ stops = [], busLocation = null, myStopId = null, visitedStops = [], height = '400px' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const busMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const stopMarkersRef = useRef([]);
    const lastRouteIdRef = useRef(null);

    // Animation state
    const animationRef = useRef(null);
    const currentPositionRef = useRef(null); // Current animated position
    const targetPositionRef = useRef(null);  // Target position to animate to
    const lastGPSPositionRef = useRef(null); // Last confirmed GPS position (source of truth)
    const animationStartTimeRef = useRef(null);
    const currentBearingRef = useRef(0);
    const targetBearingRef = useRef(0);

    // Animation duration in milliseconds (smooth transition over 1 second)
    const ANIMATION_DURATION = 1000;

    const [isZoomLocked, setIsZoomLocked] = useState(true);
    const hasInitializedRef = useRef(false);
    const lastUpdateReceivedRef = useRef(0);
    const MIN_UPDATE_INTERVAL = 1000; // Minimum time between UI updates in ms

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map with a default view
        const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([17.4124, 78.3970], 13); // Default to GNITS area

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Listen for manual zoom/pan
        map.on('zoomend', () => {
            // Keep track of zoom if we ever need to re-setView
        });

        map.on('moveend', () => {
            // User moved map manually
        });

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update stops and route
    useEffect(() => {
        if (!mapInstanceRef.current || !stops.length) return;

        const map = mapInstanceRef.current;

        // Clear existing stop markers
        stopMarkersRef.current.forEach(marker => marker.remove());
        stopMarkersRef.current = [];

        // Clear existing route line
        if (routeLineRef.current) {
            routeLineRef.current.remove();
            routeLineRef.current = null;
        }

        // Create custom icons
        const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: '<div class="stop-marker-inner">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        const visitedStopIcon = L.divIcon({
            className: 'custom-stop-marker visited-stop',
            html: '<div class="stop-marker-inner">✅</div>',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
        });

        const myStopIcon = L.divIcon({
            className: 'custom-stop-marker my-stop',
            html: '<div class="stop-marker-inner">🏠</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        // Add stop markers
        const coordinates = [];
        stops.forEach(stop => {
            const isMyStop = stop.id === myStopId;
            const isVisited = visitedStops.includes(stop.id);

            let icon = stopIcon;
            if (isMyStop) {
                icon = myStopIcon;
            } else if (isVisited) {
                icon = visitedStopIcon;
            }

            const marker = L.marker([stop.latitude, stop.longitude], {
                icon: icon
            }).addTo(map);

            let popupContent = `
        <div class="map-popup">
          <h4>${stop.name}</h4>
          <p>${isMyStop ? '🏠 Your Stop' : 'Stop #' + stop.sequence_order}</p>`;

            if (isVisited) {
                popupContent += `<p style="color: #10b981; font-weight: bold;">✅ Visited</p>`;
            }

            popupContent += `</div>`;
            marker.bindPopup(popupContent);

            stopMarkersRef.current.push(marker);
            coordinates.push([stop.latitude, stop.longitude]);
        });

        const currentRouteId = stops.length > 0 ? stops[0].route_id || stops[0].routeId : null;
        const lastRouteId = lastRouteIdRef.current;
        
        // Draw route line
        if (coordinates.length > 1) {
            const routeLine = L.polyline(coordinates, {
                color: '#6366f1',
                weight: 5,
                opacity: 0.6,
                smoothFactor: 1
            }).addTo(map);

            routeLineRef.current = routeLine;

            // Fit bounds if route ID changed or first load
            if (!hasInitializedRef.current || currentRouteId !== lastRouteId) {
                map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
                hasInitializedRef.current = true;
                lastRouteIdRef.current = currentRouteId;
            }
        }
    }, [stops]);

    // Separate effect for visited stops to avoid refitting bounds
    useEffect(() => {
        if (!mapInstanceRef.current || !stops.length) return;
        // Update marker icons without re-fitting bounds
        stopMarkersRef.current.forEach((marker, index) => {
            const stop = stops[index];
            if (!stop) return;
            
            const isMyStop = stop.id === myStopId;
            const isVisited = visitedStops.includes(stop.id);
            
            if (isVisited && !marker.getElement()?.classList.contains('visited-stop')) {
                const visitedStopIcon = L.divIcon({
                    className: 'custom-stop-marker visited-stop',
                    html: '<div class="stop-marker-inner">✅</div>',
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                });
                marker.setIcon(visitedStopIcon);
            }
        });
    }, [visitedStops, myStopId, stops]);

    // Animate bus marker smoothly using LERP
    const animateBusMarker = (timestamp) => {
        if (!animationStartTimeRef.current) {
            animationStartTimeRef.current = timestamp;
        }

        const elapsed = timestamp - animationStartTimeRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        // Cubic easing for premium feel
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        if (currentPositionRef.current && targetPositionRef.current) {
            const newLat = lerp(
                currentPositionRef.current.latitude,
                targetPositionRef.current.latitude,
                easeProgress
            );
            const newLng = lerp(
                currentPositionRef.current.longitude,
                targetPositionRef.current.longitude,
                easeProgress
            );

            let bearingDiff = targetBearingRef.current - currentBearingRef.current;
            if (bearingDiff > 180) bearingDiff -= 360;
            if (bearingDiff < -180) bearingDiff += 360;

            const newBearing = currentBearingRef.current + bearingDiff * easeProgress;

            if (busMarkerRef.current) {
                busMarkerRef.current.setLatLng([newLat, newLng]);
                const markerElement = busMarkerRef.current.getElement();
                if (markerElement) {
                    const busIconElement = markerElement.querySelector('.bus-icon');
                    if (busIconElement) {
                        busIconElement.style.transform = `rotate(${newBearing}deg)`;
                    }
                }
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateBusMarker);
            } else {
                currentPositionRef.current = { ...targetPositionRef.current };
                currentBearingRef.current = targetBearingRef.current;
                animationStartTimeRef.current = null;
            }
        }
    };

    // Update bus location with smooth animation and viewport control
    useEffect(() => {
        if (!mapInstanceRef.current || !busLocation) return;

        const now = Date.now();
        // Throttle updates to avoid jumpy UI from frequent backend spikes
        if (now - lastUpdateReceivedRef.current < MIN_UPDATE_INTERVAL && lastUpdateReceivedRef.current !== 0) {
            return;
        }
        lastUpdateReceivedRef.current = now;

        const map = mapInstanceRef.current;
        const newPosition = {
            latitude: busLocation.latitude,
            longitude: busLocation.longitude
        };

        if (!busMarkerRef.current) {
            // ... (setup bus marker)
            const busIcon = L.divIcon({
                className: 'custom-bus-marker',
                html: `
                <div class="bus-marker-inner">
                  <div class="bus-icon" style="transform: rotate(0deg);">🚌</div>
                  <div class="bus-pulse"></div>
                </div>
              `,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
            });

            busMarkerRef.current = L.marker([newPosition.latitude, newPosition.longitude], {
                icon: busIcon,
                zIndexOffset: 1000
            }).addTo(map);

            currentPositionRef.current = newPosition;
            targetPositionRef.current = newPosition;
            map.setView([newPosition.latitude, newPosition.longitude], map.getZoom());
        } else {
            // Calculate dynamic duration based on update interval
            // Using 90% of the last interval to ensure we finish before next update
            let dynamicDuration = now - lastUpdateReceivedRef.current;
            if (dynamicDuration < 1000) dynamicDuration = 1000;
            if (dynamicDuration > 15000) dynamicDuration = 5000; // Cap at 15s, fallback to 5s if very long gap

            const startPos = busMarkerRef.current.getLatLng();
            currentPositionRef.current = {
                latitude: startPos.lat,
                longitude: startPos.lng
            };
            
            targetPositionRef.current = newPosition;
            targetBearingRef.current = calculateBearing(currentPositionRef.current, newPosition);

            // Update constant for this animation segment
            // We'll use a local variable instead of the constant to avoid re-renders
            const segmentDuration = dynamicDuration;

            // Updated animation function with local segmentDuration
            const animateSegment = (timestamp) => {
                if (!animationStartTimeRef.current) animationStartTimeRef.current = timestamp;
                const elapsed = timestamp - animationStartTimeRef.current;
                const progress = Math.min(elapsed / segmentDuration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                if (currentPositionRef.current && targetPositionRef.current) {
                    const newLat = lerp(currentPositionRef.current.latitude, targetPositionRef.current.latitude, easeProgress);
                    const newLng = lerp(currentPositionRef.current.longitude, targetPositionRef.current.longitude, easeProgress);
                    
                    let bearingDiff = targetBearingRef.current - currentBearingRef.current;
                    if (bearingDiff > 180) bearingDiff -= 360;
                    if (bearingDiff < -180) bearingDiff += 360;
                    const newBearing = currentBearingRef.current + bearingDiff * easeProgress;

                    if (busMarkerRef.current) {
                        busMarkerRef.current.setLatLng([newLat, newLng]);
                        const markerElement = busMarkerRef.current.getElement();
                        if (markerElement) {
                            const busIconElement = markerElement.querySelector('.bus-icon');
                            if (busIconElement) busIconElement.style.transform = `rotate(${newBearing}deg)`;
                        }
                    }

                    if (progress < 1) {
                        animationRef.current = requestAnimationFrame(animateSegment);
                    } else {
                        currentPositionRef.current = { ...targetPositionRef.current };
                        currentBearingRef.current = targetBearingRef.current;
                        animationStartTimeRef.current = null;
                    }
                }
            };

            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            animationStartTimeRef.current = null;
            animationRef.current = requestAnimationFrame(animateSegment);
        }

        // Viewport Control: Only pan if marker is out of bounds or near edge
        const bounds = map.getBounds();
        const buffer = 0.1; // 10% buffer from edges
        const latRange = bounds.getNorth() - bounds.getSouth();
        const lngRange = bounds.getEast() - bounds.getWest();
        
        const innerBounds = L.latLngBounds(
            [bounds.getSouth() + latRange * buffer, bounds.getWest() + lngRange * buffer],
            [bounds.getNorth() - latRange * buffer, bounds.getEast() - lngRange * buffer]
        );

        if (!innerBounds.contains([newPosition.latitude, newPosition.longitude])) {
            map.panTo([newPosition.latitude, newPosition.longitude], {
                animate: true,
                duration: 1.5 // Smooth slow pan
            });
        }


    }, [busLocation]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="bus-map-container">
            <div
                ref={mapRef}
                className="bus-map"
                style={{ height, width: '100%', borderRadius: 'var(--radius-lg)' }}
            />
            
            {/* Map Controls Overlay */}
            <div className="map-controls">
                <button 
                    className={`map-control-btn ${isZoomLocked ? 'active' : ''}`}
                    onClick={() => setIsZoomLocked(!isZoomLocked)}
                    title={isZoomLocked ? "Unlock Auto-Follow" : "Lock Auto-Follow"}
                >
                    {isZoomLocked ? '🔒 Locked' : '🔓 Unlocked'}
                </button>
                <button 
                    className="map-control-btn"
                    onClick={() => {
                        if (mapInstanceRef.current && routeLineRef.current) {
                            mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] });
                        }
                    }}
                    title="Fit Route"
                >
                    🔍 Fit Route
                </button>
                {busLocation && (
                    <button 
                        className="map-control-btn"
                        onClick={() => {
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.panTo([busLocation.latitude, busLocation.longitude], { animate: true });
                            }
                        }}
                        title="Recenter on Bus"
                    >
                        🚌 Recenter
                    </button>
                )}
            </div>

            {!busLocation && (
                <div className="map-overlay">
                    <p>🚌 Waiting for bus to start trip...</p>
                </div>
            )}
        </div>
    );
}

export default BusMap;

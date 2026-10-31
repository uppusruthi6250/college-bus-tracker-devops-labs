┌─────────────────────────────────────────────────────────────────┐
│                        DRIVER SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📱 GPS Hardware                                                 │
│       │                                                          │
│       │ Raw GPS Signal (every 1-3 seconds)                      │
│       ▼                                                          │
│  🔧 navigator.geolocation.watchPosition()                       │
│       │                                                          │
│       │ { latitude, longitude }                                 │
│       ▼                                                          │
│  [Optional: GPS Filtering] ◄─── location.service.js            │
│       │                                                          │
│       │ Filtered/Smoothed coordinates                           │
│       ▼                                                          │
│  🌐 WebSocket.sendLocation()                                    │
│       │                                                          │
└───────┼──────────────────────────────────────────────────────────┘
        │
        │ Real-time GPS updates
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📡 WebSocket Server                                            │
│       │                                                          │
│       │ Broadcast to all students on route                      │
│       ▼                                                          │
└───────┼──────────────────────────────────────────────────────────┘
        │
        │ GPS updates broadcast
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🌐 WebSocket.onLocationUpdate()                                │
│       │                                                          │
│       │ { latitude, longitude }                                 │
│       ▼                                                          │
│  ⚛️ setBusLocation(newLocation)                                 │
│       │                                                          │
│       │ Triggers React useEffect                                │
│       ▼                                                          │
│  🗺️ BusMap Component                                            │
│       │                                                          │
│       ├─► Calculate Bearing (direction)                         │
│       │   calculateBearing(oldPos, newPos)                      │
│       │   → angle in degrees (0-360°)                           │
│       │                                                          │
│       ├─► Set Animation Targets                                 │
│       │   targetPositionRef = newLocation                       │
│       │   targetBearingRef = calculatedBearing                  │
│       │                                                          │
│       └─► Start Animation Loop                                  │
│           requestAnimationFrame(animateBusMarker)               │
│                   │                                              │
│                   ▼                                              │
│           ┌───────────────────┐                                 │
│           │ Animation Loop    │                                 │
│           │ (60fps / 16.67ms) │                                 │
│           └───────────────────┘                                 │
│                   │                                              │
│                   ├─► Calculate Progress (0 to 1)               │
│                   │   elapsed / ANIMATION_DURATION              │
│                   │                                              │
│                   ├─► Apply Easing                              │
│                   │   easeProgress = 1 - (1-progress)³          │
│                   │                                              │
│                   ├─► LERP Position                             │
│                   │   newLat = lerp(current, target, ease)      │
│                   │   newLng = lerp(current, target, ease)      │
│                   │                                              │
│                   ├─► LERP Rotation                             │
│                   │   newBearing = lerp(current, target, ease)  │
│                   │                                              │
│                   ├─► Update Marker                             │
│                   │   marker.setLatLng([newLat, newLng])        │
│                   │   icon.style.transform = rotate(bearing)    │
│                   │                                              │
│                   ├─► Check if Complete                         │
│                   │   if (progress < 1) → continue loop         │
│                   │   else → animation complete                 │
│                   │                                              │
│                   └─► Next Frame                                │
│                       requestAnimationFrame(...)                │
│                                                                  │
│  👁️ User sees smooth, gliding bus marker with rotation         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Animation Timeline

```
Time: 0ms                                                    1000ms
      │                                                         │
      ▼                                                         ▼
GPS Update A ─────────────────────────────────────► GPS Update B
      │                                                         │
      │                                                         │
      ├─► Frame 1  (t=0ms,    progress=0.00)                  │
      ├─► Frame 2  (t=16ms,   progress=0.016)                 │
      ├─► Frame 3  (t=33ms,   progress=0.033)                 │
      ├─► Frame 4  (t=50ms,   progress=0.050)                 │
      │   ...                                                   │
      ├─► Frame 30 (t=500ms,  progress=0.50)  ◄── Halfway     │
      │   ...                                                   │
      ├─► Frame 58 (t=967ms,  progress=0.967)                 │
      ├─► Frame 59 (t=983ms,  progress=0.983)                 │
      └─► Frame 60 (t=1000ms, progress=1.00)  ◄── Complete ───┘

Total Frames: ~60 frames (at 60fps)
Each Frame: ~16.67ms apart
Result: Smooth, continuous motion
```

## LERP (Linear Interpolation) Explained

```
Start Position (A)          Target Position (B)
    │                              │
    │                              │
    ▼                              ▼
(28.6139, 77.2090)         (28.6149, 77.2100)
    │                              │
    │                              │
    │  Progress = 0.0 ─────► Position = A (start)
    │  Progress = 0.25 ────► Position = 25% between A and B
    │  Progress = 0.5 ─────► Position = 50% between A and B
    │  Progress = 0.75 ────► Position = 75% between A and B
    │  Progress = 1.0 ─────► Position = B (end)
    │
    └─► Formula: newValue = start + (end - start) * progress
```

## Bearing Calculation

```
                    North (0°)
                        │
                        │
                        │
West (270°) ────────────┼──────────── East (90°)
                        │
                        │
                        │
                    South (180°)


Example Movement:
    Start: (28.6139, 77.2090)
    End:   (28.6149, 77.2100)
    
    Calculation:
    1. Convert to radians
    2. Calculate y = sin(Δlon) * cos(lat2)
    3. Calculate x = cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(Δlon)
    4. Bearing = atan2(y, x) * 180/π
    5. Normalize to 0-360°
    
    Result: ~45° (Northeast direction)
    
    Bus Icon Rotation:
    🚌 → rotated 45° → 🚌 (facing northeast)
```

## Easing Function Visualization

```
Linear (no easing):
Progress │
  1.0 ──┤                    ╱
        │                  ╱
  0.75 ─┤                ╱
        │              ╱
  0.5 ──┤            ╱
        │          ╱
  0.25 ─┤        ╱
        │      ╱
  0.0 ──┼────╱─────────────────
        0   250  500  750  1000ms

Cubic Ease-Out (current):
Progress │
  1.0 ──┤              ╭────────
        │            ╱
  0.75 ─┤          ╱
        │        ╱
  0.5 ──┤      ╱
        │    ╱
  0.25 ─┤  ╱
        │╱
  0.0 ──┼─────────────────────
        0   250  500  750  1000ms

Result: Natural deceleration (like a car slowing down)
```

## Component State Flow

```
┌─────────────────────────────────────────────────────────┐
│                    BusMap Component                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  State (useRef - no re-renders):                        │
│  ┌────────────────────────────────────────────────┐    │
│  │ currentPositionRef  = { lat, lng }             │    │
│  │ targetPositionRef   = { lat, lng }             │    │
│  │ currentBearingRef   = 0°                       │    │
│  │ targetBearingRef    = 45°                      │    │
│  │ animationRef        = requestAnimationFrame ID │    │
│  │ animationStartTimeRef = timestamp              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Props (from parent):                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │ busLocation = { latitude, longitude }          │    │
│  │ stops = [...]                                  │    │
│  │ myStopId = 123                                 │    │
│  │ visitedStops = [101, 102]                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Effects:                                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ useEffect(() => { init map }, [])              │    │
│  │ useEffect(() => { draw stops }, [stops])       │    │
│  │ useEffect(() => { animate bus }, [busLocation])│    │
│  │ useEffect(() => { cleanup }, [])               │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## GPS Filtering Flow (Optional)

```
Raw GPS Signal
      │
      ▼
┌─────────────────┐
│ Validation      │ ◄── isValidGPSUpdate()
│ Filter          │     - Check speed < 30 m/s
└─────────────────┘     - Filter unrealistic jumps
      │
      │ Valid? Yes
      ▼
┌─────────────────┐
│ Kalman Filter   │ ◄── GPSKalmanFilter.filter()
│ Smoothing       │     - Reduce GPS noise
└─────────────────┘     - Statistical smoothing
      │
      │ Smoothed coordinates
      ▼
┌─────────────────┐
│ Road Snapping   │ ◄── snapToRoads() [Optional]
│ (Google API)    │     - Align to actual roads
└─────────────────┘     - Correct GPS drift
      │
      │ Final coordinates
      ▼
  Send to Backend
```

## Performance Optimization

```
❌ BAD (causes re-renders):
   const [currentPosition, setCurrentPosition] = useState(...)
   // Every animation frame triggers re-render = 60 re-renders/sec!

✅ GOOD (no re-renders):
   const currentPositionRef = useRef(...)
   // Direct DOM manipulation = smooth 60fps

Memory Management:
   useEffect(() => {
       // Start animation
       animationRef.current = requestAnimationFrame(...)
       
       return () => {
           // Cleanup on unmount
           cancelAnimationFrame(animationRef.current)
       }
   }, [])
```

## File Dependencies

```
StudentDashboard.jsx
        │
        ├─► BusMap.jsx
        │       │
        │       ├─► BusMap.css
        │       ├─► leaflet (library)
        │       └─► location.service.js (optional)
        │
        └─► websocket.service.js
                │
                └─► Backend WebSocket Server
```

---

## Legend

- 📱 Hardware/Device
- 🔧 Browser API
- 🌐 Network/WebSocket
- ⚛️ React State
- 🗺️ Map Component
- 👁️ User Interface
- ✅ Success/Complete
- ❌ Error/Bad Practice
- ⚠️ Optional/Warning

---

**This diagram shows the complete flow from GPS hardware to smooth animation on screen!**

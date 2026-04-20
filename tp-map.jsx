// Map Tab — Leaflet map with destination pins and route lines
// Exports: MapTab

function genId() { return Math.random().toString(36).slice(2, 10); }

function MapTab({ trip, onUpdateTrip }) {
  const mapContainerRef = React.useRef(null);
  const leafletMapRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const routeLineRef = React.useRef(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState('');

  const destinations = trip.destinations || [];

  // Initialize map once
  React.useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([20, 10], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    leafletMapRef.current = map;
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update markers & route whenever destinations change
  React.useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }

    if (destinations.length === 0) return;

    const latlngs = [];
    destinations.forEach((dest, i) => {
      const color = '#4A72C0';
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color};color:#fff;border:2.5px solid #fff;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          width:28px;height:28px;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);font-weight:700;font-size:11px;
        "><span style="transform:rotate(45deg)">${i + 1}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([dest.lat, dest.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${dest.name}</strong>`);
      markersRef.current.push(marker);
      latlngs.push([dest.lat, dest.lng]);
    });

    // Draw route line
    if (latlngs.length > 1) {
      routeLineRef.current = L.polyline(latlngs, {
        color: '#4A72C0', weight: 2, opacity: 0.6,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // Fit bounds
    const group = L.featureGroup(markersRef.current);
    map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 10 });
  }, [destinations]);

  // Geocode using Nominatim (free, no API key)
  const searchAndAdd = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data || data.length === 0) {
        setSearchError('Location not found. Try a different name.');
      } else {
        const { lat, lon, display_name } = data[0];
        // Use city/country part of name
        const shortName = display_name.split(',').slice(0, 2).join(',').trim();
        const newDest = { id: genId(), name: shortName, lat: parseFloat(lat), lng: parseFloat(lon) };
        onUpdateTrip({ ...trip, destinations: [...destinations, newDest] });
        setSearchQuery('');
      }
    } catch (e) {
      setSearchError('Search failed. Check your connection.');
    }
    setSearching(false);
  };

  const removeDestination = (id) => {
    onUpdateTrip({ ...trip, destinations: destinations.filter(d => d.id !== id) });
  };

  const moveUp = (i) => {
    if (i === 0) return;
    const arr = [...destinations];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    onUpdateTrip({ ...trip, destinations: arr });
  };
  const moveDown = (i) => {
    if (i === destinations.length - 1) return;
    const arr = [...destinations];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    onUpdateTrip({ ...trip, destinations: arr });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${tpColors.border}`, background: tpColors.surface, display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchError(''); }}
                onKeyDown={e => e.key === 'Enter' && searchAndAdd()}
                placeholder="Search a city or place to add…"
                style={{
                  width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 13,
                  padding: '8px 12px', border: `1px solid ${tpColors.border}`, borderRadius: 8,
                  background: tpColors.bg, color: tpColors.text, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = tpColors.accent}
                onBlur={e => e.target.style.borderColor = tpColors.border}
              />
            </div>
            <Btn onClick={searchAndAdd} disabled={searching || !searchQuery.trim()}>
              {searching ? 'Searching…' : 'Add Pin'}
            </Btn>
          </div>
          {searchError && <p style={{ margin: '4px 0 0', fontSize: 11, color: tpColors.danger }}>{searchError}</p>}
        </div>

        {/* Destination list */}
        {destinations.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {destinations.map((d, i) => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 4, background: tpColors.accentLight,
                border: `1px solid ${tpColors.accent}22`, borderRadius: 20, padding: '3px 8px 3px 6px',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: tpColors.accent, minWidth: 14, textAlign: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: tpColors.text, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <div style={{ display: 'flex', gap: 1 }}>
                  {i > 0 && <button onClick={() => moveUp(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tpColors.textMuted, fontSize: 10, padding: '0 2px', lineHeight: 1 }}>↑</button>}
                  {i < destinations.length - 1 && <button onClick={() => moveDown(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tpColors.textMuted, fontSize: 10, padding: '0 2px', lineHeight: 1 }}>↓</button>}
                  <button onClick={() => removeDestination(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tpColors.textMuted, fontSize: 11, padding: '0 2px', lineHeight: 1 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainerRef} style={{ flex: 1, background: '#e8e4d9' }} />
    </div>
  );
}

Object.assign(window, { MapTab });

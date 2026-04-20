// Flights & Hotels Tab
// Exports: FlightsTab

function genId() { return Math.random().toString(36).slice(2, 10); }

function FlightModal({ flight, onSave, onClose }) {
  const [form, setForm] = React.useState(flight || {
    airline: '', flightNumber: '', from: '', to: '',
    departureDate: '', departureTime: '', arrivalTime: '', arrivalDate: '',
    confirmationCode: '', notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={flight ? 'Edit Flight' : 'Add Flight'} onClose={onClose} width={520}
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={() => { if (!form.from || !form.to) return; onSave(form); onClose(); }}>Save</Btn></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="From *" value={form.from} onChange={v => set('from', v)} placeholder="JFK — New York" autoFocus />
          <Input label="To *" value={form.to} onChange={v => set('to', v)} placeholder="CDG — Paris" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Airline" value={form.airline} onChange={v => set('airline', v)} placeholder="Air France" />
          <Input label="Flight Number" value={form.flightNumber} onChange={v => set('flightNumber', v)} placeholder="AF 007" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Input label="Departure Date" type="date" value={form.departureDate} onChange={v => set('departureDate', v)} />
          <Input label="Departure Time" value={form.departureTime} onChange={v => set('departureTime', v)} placeholder="09:00" />
          <Input label="Arrival Time" value={form.arrivalTime} onChange={v => set('arrivalTime', v)} placeholder="22:30 +1" />
        </div>
        <Input label="Confirmation Code" value={form.confirmationCode} onChange={v => set('confirmationCode', v)} placeholder="ABC123" />
        <Textarea label="Notes" value={form.notes} onChange={v => set('notes', v)} placeholder="Terminal, baggage, seat number…" rows={2} />
      </div>
    </Modal>
  );
}

function HotelModal({ hotel, onSave, onClose }) {
  const [form, setForm] = React.useState(hotel || {
    name: '', city: '', address: '', checkIn: '', checkOut: '',
    confirmationCode: '', phone: '', notes: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={hotel ? 'Edit Hotel' : 'Add Hotel'} onClose={onClose} width={520}
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={() => { if (!form.name) return; onSave(form); onClose(); }}>Save</Btn></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Hotel Name *" value={form.name} onChange={v => set('name', v)} placeholder="Hôtel du Louvre" autoFocus />
          <Input label="City" value={form.city} onChange={v => set('city', v)} placeholder="Paris" />
        </div>
        <Input label="Address" value={form.address} onChange={v => set('address', v)} placeholder="Place André Malraux, 75001 Paris" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Check-in" type="date" value={form.checkIn} onChange={v => set('checkIn', v)} />
          <Input label="Check-out" type="date" value={form.checkOut} onChange={v => set('checkOut', v)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Confirmation Code" value={form.confirmationCode} onChange={v => set('confirmationCode', v)} placeholder="XYZ-789" />
          <Input label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+33 1 44 58 38 38" />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={v => set('notes', v)} placeholder="Check-in instructions, parking, etc." rows={2} />
      </div>
    </Modal>
  );
}

function FlightCard({ flight, onEdit, onDelete }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ border: `1px solid ${tpColors.border}`, borderRadius: 10, padding: '14px 16px', background: hover ? tpColors.bg : tpColors.surface, transition: 'background 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {/* Route */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: tpColors.text }}>{flight.from}</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, height: 1, background: tpColors.border }} />
              <span style={{ fontSize: 14, color: tpColors.textMuted }}>✈</span>
              <div style={{ flex: 1, height: 1, background: tpColors.border }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: tpColors.text }}>{flight.to}</span>
          </div>
          {/* Details row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: tpColors.textMuted }}>
            {flight.airline && <span>{flight.airline}{flight.flightNumber && ` · ${flight.flightNumber}`}</span>}
            {flight.departureDate && <span>{formatDate(flight.departureDate)}</span>}
            {flight.departureTime && <span>{flight.departureTime}{flight.arrivalTime && ` → ${flight.arrivalTime}`}</span>}
            {flight.confirmationCode && <span style={{ fontWeight: 600, color: tpColors.accent }}>#{flight.confirmationCode}</span>}
          </div>
          {flight.notes && <p style={{ margin: '6px 0 0', fontSize: 12, color: tpColors.textMuted }}>{flight.notes}</p>}
        </div>
        {hover && (
          <div style={{ display: 'flex', gap: 4 }}>
            <Btn variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: 11 }}>Edit</Btn>
            <Btn variant="ghost" size="sm" onClick={onDelete} style={{ fontSize: 11, color: tpColors.danger }}>✕</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function HotelCard({ hotel, onEdit, onDelete }) {
  const [hover, setHover] = React.useState(false);
  const nights = (hotel.checkIn && hotel.checkOut)
    ? Math.round((new Date(hotel.checkOut) - new Date(hotel.checkIn)) / 86400000)
    : null;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ border: `1px solid ${tpColors.border}`, borderRadius: 10, padding: '14px 16px', background: hover ? tpColors.bg : tpColors.surface, transition: 'background 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: tpColors.text }}>{hotel.name}</span>
            {hotel.city && <span style={{ fontSize: 12, color: tpColors.textMuted }}>{hotel.city}</span>}
            {nights !== null && nights > 0 && <Badge color="blue">{nights} night{nights > 1 ? 's' : ''}</Badge>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: tpColors.textMuted }}>
            {hotel.checkIn && <span>{formatDate(hotel.checkIn)}{hotel.checkOut && ` → ${formatDate(hotel.checkOut)}`}</span>}
            {hotel.confirmationCode && <span style={{ fontWeight: 600, color: tpColors.accent }}>#{hotel.confirmationCode}</span>}
            {hotel.phone && <span>{hotel.phone}</span>}
          </div>
          {hotel.address && <p style={{ margin: '5px 0 0', fontSize: 12, color: tpColors.textMuted }}>{hotel.address}</p>}
          {hotel.notes && <p style={{ margin: '4px 0 0', fontSize: 12, color: tpColors.textMuted }}>{hotel.notes}</p>}
        </div>
        {hover && (
          <div style={{ display: 'flex', gap: 4 }}>
            <Btn variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: 11 }}>Edit</Btn>
            <Btn variant="ghost" size="sm" onClick={onDelete} style={{ fontSize: 11, color: tpColors.danger }}>✕</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function FlightsTab({ trip, onUpdateTrip }) {
  const [addingFlight, setAddingFlight] = React.useState(false);
  const [editFlight, setEditFlight] = React.useState(null);
  const [confirmDeleteFlight, setConfirmDeleteFlight] = React.useState(null);
  const [addingHotel, setAddingHotel] = React.useState(false);
  const [editHotel, setEditHotel] = React.useState(null);
  const [confirmDeleteHotel, setConfirmDeleteHotel] = React.useState(null);

  const flights = trip.flights || [];
  const hotels = trip.hotels || [];

  const addFlight = (form) => onUpdateTrip({ ...trip, flights: [...flights, { id: genId(), ...form }] });
  const updateFlight = (id, form) => onUpdateTrip({ ...trip, flights: flights.map(f => f.id === id ? { ...f, ...form } : f) });
  const deleteFlight = (id) => { onUpdateTrip({ ...trip, flights: flights.filter(f => f.id !== id) }); setConfirmDeleteFlight(null); };

  const addHotel = (form) => onUpdateTrip({ ...trip, hotels: [...hotels, { id: genId(), ...form }] });
  const updateHotel = (id, form) => onUpdateTrip({ ...trip, hotels: hotels.map(h => h.id === id ? { ...h, ...form } : h) });
  const deleteHotel = (id) => { onUpdateTrip({ ...trip, hotels: hotels.filter(h => h.id !== id) }); setConfirmDeleteHotel(null); };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Flights Section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tpColors.text }}>Flights</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: tpColors.textMuted }}>{flights.length} flight{flights.length !== 1 ? 's' : ''}</p>
          </div>
          <Btn onClick={() => setAddingFlight(true)}>+ Add Flight</Btn>
        </div>
        {flights.length === 0
          ? <EmptyState icon="✈" title="No flights yet" subtitle="Add your flight details to keep everything in one place."
              action={<Btn onClick={() => setAddingFlight(true)}>+ Add Flight</Btn>} />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {flights.map(f => (
                <FlightCard key={f.id} flight={f}
                  onEdit={() => setEditFlight(f)}
                  onDelete={() => setConfirmDeleteFlight(f.id)}
                />
              ))}
            </div>
        }
      </div>

      {/* Hotels Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tpColors.text }}>Hotels</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: tpColors.textMuted }}>{hotels.length} hotel{hotels.length !== 1 ? 's' : ''}</p>
          </div>
          <Btn onClick={() => setAddingHotel(true)}>+ Add Hotel</Btn>
        </div>
        {hotels.length === 0
          ? <EmptyState icon="🏨" title="No hotels yet" subtitle="Track your accommodations and confirmation codes."
              action={<Btn onClick={() => setAddingHotel(true)}>+ Add Hotel</Btn>} />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hotels.map(h => (
                <HotelCard key={h.id} hotel={h}
                  onEdit={() => setEditHotel(h)}
                  onDelete={() => setConfirmDeleteHotel(h.id)}
                />
              ))}
            </div>
        }
      </div>

      {addingFlight && <FlightModal onSave={addFlight} onClose={() => setAddingFlight(false)} />}
      {editFlight && <FlightModal flight={editFlight} onSave={f => { updateFlight(editFlight.id, f); setEditFlight(null); }} onClose={() => setEditFlight(null)} />}
      {confirmDeleteFlight && <ConfirmDialog message="Delete this flight?" onConfirm={() => deleteFlight(confirmDeleteFlight)} onCancel={() => setConfirmDeleteFlight(null)} />}

      {addingHotel && <HotelModal onSave={addHotel} onClose={() => setAddingHotel(false)} />}
      {editHotel && <HotelModal hotel={editHotel} onSave={h => { updateHotel(editHotel.id, h); setEditHotel(null); }} onClose={() => setEditHotel(null)} />}
      {confirmDeleteHotel && <ConfirmDialog message="Delete this hotel?" onConfirm={() => deleteHotel(confirmDeleteHotel)} onCancel={() => setConfirmDeleteHotel(null)} />}
    </div>
  );
}

Object.assign(window, { FlightsTab });

// Itinerary Tab — day-by-day schedule builder
// Exports: ItineraryTab

const ACTIVITY_TYPES = [
  { value: 'activity', label: 'Activity', icon: '◆', color: '#4A72C0' },
  { value: 'food', label: 'Food & Drink', icon: '◆', color: '#C07A4A' },
  { value: 'transport', label: 'Transport', icon: '◆', color: '#7A4AC0' },
  { value: 'sight', label: 'Sightseeing', icon: '◆', color: '#4A9C6B' },
  { value: 'accommodation', label: 'Accommodation', icon: '◆', color: '#C0B04A' },
  { value: 'other', label: 'Other', icon: '◆', color: '#888' },
];

const TYPE_COLORS = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.value, t.color]));
const TYPE_LABELS = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.value, t.label]));

function genId() { return Math.random().toString(36).slice(2, 10); }

function weatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '❄️';
  return '⛈️';
}

function weatherDesc(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

// Fetch weather from Open-Meteo (free, no API key) for trip destination + day dates
function useWeather(destination, days) {
  const [weather, setWeather] = React.useState({});

  const dateKey = (days || []).map(d => d.date).join(',');

  React.useEffect(() => {
    if (!destination || !days || days.length === 0) return;
    const datesWithDate = days.filter(d => d.date);
    if (datesWithDate.length === 0) return;

    const sorted = [...datesWithDate].sort((a, b) => a.date.localeCompare(b.date));
    const startDate = sorted[0].date;
    const endDate = sorted[sorted.length - 1].date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startD = new Date(startDate + 'T00:00:00');
    const endD = new Date(endDate + 'T00:00:00');

    // Open-Meteo forecast covers up to 16 days ahead; skip fully past trips
    const maxForecast = new Date(today);
    maxForecast.setDate(maxForecast.getDate() + 15);
    if (endD < today || startD > maxForecast) { setWeather({}); return; }

    let cancelled = false;

    async function fetchWeather() {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) return;
        const { latitude, longitude } = geoData.results[0];

        const clampedStart = startD < today ? today.toISOString().slice(0, 10) : startDate;
        const clampedEnd = endD > maxForecast ? maxForecast.toISOString().slice(0, 10) : endDate;

        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${clampedStart}&end_date=${clampedEnd}`
        );
        const wxData = await wxRes.json();
        if (!wxData.daily) return;

        const result = {};
        wxData.daily.time.forEach((date, i) => {
          result[date] = {
            code: wxData.daily.weathercode[i],
            max: Math.round(wxData.daily.temperature_2m_max[i]),
            min: Math.round(wxData.daily.temperature_2m_min[i]),
          };
        });
        if (!cancelled) setWeather(result);
      } catch {}
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, [destination, dateKey]);

  return weather;
}

function ActivityModal({ activity, days, currentDayId, onSave, onClose }) {
  const [form, setForm] = React.useState(
    activity || { time: '', title: '', description: '', type: 'activity', endDayId: '' }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const currentIdx = days ? days.findIndex(d => d.id === currentDayId) : -1;
  const laterDays = days ? days.slice(currentIdx + 1) : [];

  return (
    <Modal title={activity ? 'Edit Activity' : 'Add Activity'} onClose={onClose}
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={() => { if (!form.title.trim()) return; onSave(form); onClose(); }}>Save</Btn></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Title *" value={form.title} onChange={v => set('title', v)} placeholder="e.g. Eiffel Tower visit" autoFocus />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Time" value={form.time} onChange={v => set('time', v)} placeholder="e.g. 10:00 AM" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: tpColors.textMuted }}>Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={{
              fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', border: `1px solid ${tpColors.border}`,
              borderRadius: 7, background: tpColors.surface, color: tpColors.text, outline: 'none',
            }}>
              {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        {laterDays.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: tpColors.textMuted }}>Spans until (optional)</label>
            <select value={form.endDayId || ''} onChange={e => set('endDayId', e.target.value)} style={{
              fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', border: `1px solid ${tpColors.border}`,
              borderRadius: 7, background: tpColors.surface, color: tpColors.text, outline: 'none',
            }}>
              <option value="">Same day only</option>
              {laterDays.map(d => {
                const idx = days.findIndex(x => x.id === d.id);
                const label = d.date ? `Day ${idx + 1} — ${formatDate(d.date)}` : `Day ${idx + 1}`;
                return <option key={d.id} value={d.id}>{label}</option>;
              })}
            </select>
          </div>
        )}
        <Textarea label="Notes" value={form.description} onChange={v => set('description', v)} placeholder="Details, address, booking info…" rows={3} />
      </div>
    </Modal>
  );
}

function ActivityCard({ activity, isSpanning, isContinuation, onEdit, onDelete }) {
  const color = TYPE_COLORS[activity.type] || '#888';
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8,
        background: isContinuation ? tpColors.accentLight : hover ? tpColors.bg : tpColors.surface,
        border: `1px solid ${isContinuation ? tpColors.accent + '44' : tpColors.border}`,
        cursor: 'default', transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 3, borderRadius: 2, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          {activity.time && !isContinuation && (
            <span style={{ fontSize: 11, fontWeight: 600, color: tpColors.textMuted, flexShrink: 0 }}>{activity.time}</span>
          )}
          {isContinuation && (
            <span style={{ fontSize: 11, fontWeight: 600, color: tpColors.accent, flexShrink: 0 }}>↪ cont'd</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: tpColors.text }}>{activity.title}</span>
          <span style={{ fontSize: 11, color: color, fontWeight: 500 }}>{TYPE_LABELS[activity.type]}</span>
          {isSpanning && !isContinuation && (
            <span style={{ fontSize: 10, fontWeight: 600, color: tpColors.accent, background: tpColors.accentLight, padding: '1px 6px', borderRadius: 99 }}>multi-day</span>
          )}
        </div>
        {activity.description && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: tpColors.textMuted, lineHeight: 1.5, textWrap: 'pretty' }}>{activity.description}</p>
        )}
      </div>
      {hover && !isContinuation && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'flex-start' }}>
          <Btn variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: 11 }}>Edit</Btn>
          <Btn variant="ghost" size="sm" onClick={onDelete} style={{ fontSize: 11, color: tpColors.danger }}>✕</Btn>
        </div>
      )}
    </div>
  );
}

function DayColumn({ day, dayIndex, allDays, weather, onUpdateDay, onDeleteDay }) {
  const [showAddActivity, setShowAddActivity] = React.useState(false);
  const [editActivity, setEditActivity] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState(false);

  const activities = day.activities || [];
  const currentIdx = allDays.findIndex(d => d.id === day.id);

  // Collect activities from earlier days whose endDayId reaches this day or beyond
  const continuedActivities = [];
  allDays.slice(0, currentIdx).forEach(prevDay => {
    (prevDay.activities || []).forEach(act => {
      if (!act.endDayId) return;
      const endIdx = allDays.findIndex(d => d.id === act.endDayId);
      if (endIdx >= currentIdx) continuedActivities.push(act);
    });
  });

  const addActivity = (form) => {
    onUpdateDay({ ...day, activities: [...activities, { id: genId(), ...form }] });
  };
  const updateActivity = (id, form) => {
    onUpdateDay({ ...day, activities: activities.map(a => a.id === id ? { ...a, ...form } : a) });
  };
  const deleteActivity = (id) => {
    onUpdateDay({ ...day, activities: activities.filter(a => a.id !== id) });
    setConfirmDelete(null);
  };

  const dateLabel = day.date ? formatDate(day.date) : `Day ${dayIndex + 1}`;
  const wx = weather && day.date ? weather[day.date] : null;
  const totalCount = activities.length + continuedActivities.length;

  return (
    <div style={{
      background: tpColors.surface, border: `1px solid ${tpColors.border}`, borderRadius: 10,
      overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        padding: '12px 14px', background: tpColors.bg, borderBottom: `1px solid ${tpColors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
      }} onClick={() => setCollapsed(c => !c)}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: tpColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day {dayIndex + 1}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: tpColors.text }}>{dateLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {wx && (
            <div
              title={`${weatherDesc(wx.code)} · ${wx.max}° high / ${wx.min}° low`}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                color: tpColors.textMuted, background: tpColors.surface,
                padding: '3px 8px', borderRadius: 99, border: `1px solid ${tpColors.border}`,
              }}
            >
              <span>{weatherEmoji(wx.code)}</span>
              <span style={{ fontWeight: 600, color: tpColors.text }}>{wx.max}°</span>
              <span style={{ opacity: 0.55 }}>{wx.min}°</span>
            </div>
          )}
          <Badge color="gray">{totalCount}</Badge>
          <span style={{ color: tpColors.textMuted, fontSize: 12 }}>{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {continuedActivities.map(a => (
            <ActivityCard key={`cont-${a.id}`} activity={a} isSpanning={true} isContinuation={true} onEdit={() => {}} onDelete={() => {}} />
          ))}
          {totalCount === 0 && (
            <div style={{ fontSize: 12, color: tpColors.textMuted, textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>No activities yet</div>
          )}
          {activities.map(a => (
            <ActivityCard key={a.id} activity={a}
              isSpanning={!!a.endDayId}
              isContinuation={false}
              onEdit={() => setEditActivity(a)}
              onDelete={() => setConfirmDelete(a.id)}
            />
          ))}
          <Btn variant="ghost" size="sm" onClick={() => setShowAddActivity(true)} style={{ marginTop: 2, justifyContent: 'center', color: tpColors.accent }}>
            + Add activity
          </Btn>
        </div>
      )}

      {showAddActivity && (
        <ActivityModal onSave={addActivity} onClose={() => setShowAddActivity(false)} days={allDays} currentDayId={day.id} />
      )}
      {editActivity && (
        <ActivityModal activity={editActivity} days={allDays} currentDayId={day.id}
          onSave={form => { updateActivity(editActivity.id, form); setEditActivity(null); }}
          onClose={() => setEditActivity(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog message="Delete this activity?" onConfirm={() => deleteActivity(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  );
}

function ItineraryTab({ trip, onUpdateTrip }) {
  const [showAddDay, setShowAddDay] = React.useState(false);
  const [newDayDate, setNewDayDate] = React.useState('');
  const [confirmDeleteDay, setConfirmDeleteDay] = React.useState(null);

  const days = trip.days || [];
  const weather = useWeather(trip.destination, days);

  const addDay = () => {
    const d = { id: genId(), date: newDayDate, activities: [] };
    onUpdateTrip({ ...trip, days: [...days, d] });
    setShowAddDay(false);
    setNewDayDate('');
  };

  const updateDay = (updated) => {
    onUpdateTrip({ ...trip, days: days.map(d => d.id === updated.id ? updated : d) });
  };

  const deleteDay = (id) => {
    onUpdateTrip({ ...trip, days: days.filter(d => d.id !== id) });
    setConfirmDeleteDay(null);
  };

  React.useEffect(() => {
    if (showAddDay) {
      if (days.length > 0) {
        const lastDate = days[days.length - 1].date;
        if (lastDate) {
          const next = new Date(lastDate + 'T00:00:00');
          next.setDate(next.getDate() + 1);
          setNewDayDate(next.toISOString().slice(0, 10));
        }
      } else if (trip.startDate) {
        setNewDayDate(trip.startDate);
      }
    }
  }, [showAddDay]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: tpColors.text }}>Itinerary</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: tpColors.textMuted }}>{days.length} day{days.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Btn onClick={() => setShowAddDay(true)}>+ Add Day</Btn>
      </div>

      {days.length === 0 ? (
        <EmptyState icon="📅" title="No days yet" subtitle="Add your first day to start building your itinerary."
          action={<Btn onClick={() => setShowAddDay(true)}>+ Add Day</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {days.map((day, i) => (
            <DayColumn key={day.id} day={day} dayIndex={i} allDays={days}
              weather={weather}
              onUpdateDay={updateDay}
              onDeleteDay={() => setConfirmDeleteDay(day.id)}
            />
          ))}
        </div>
      )}

      {showAddDay && (
        <Modal title="Add Day" onClose={() => setShowAddDay(false)} width={360}
          footer={<><Btn variant="secondary" onClick={() => setShowAddDay(false)}>Cancel</Btn><Btn onClick={addDay}>Add Day</Btn></>}
        >
          <Input label="Date (optional)" type="date" value={newDayDate} onChange={setNewDayDate} />
        </Modal>
      )}

      {confirmDeleteDay && (
        <ConfirmDialog message="Delete this day and all its activities?" onConfirm={() => deleteDay(confirmDeleteDay)} onCancel={() => setConfirmDeleteDay(null)} />
      )}
    </div>
  );
}

Object.assign(window, { ItineraryTab });

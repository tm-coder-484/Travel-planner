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

function ActivityModal({ activity, onSave, onClose }) {
  const [form, setForm] = React.useState(activity || { time: '', title: '', description: '', type: 'activity' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
        <Textarea label="Notes" value={form.description} onChange={v => set('description', v)} placeholder="Details, address, booking info…" rows={3} />
      </div>
    </Modal>
  );
}

function ActivityCard({ activity, onEdit, onDelete }) {
  const color = TYPE_COLORS[activity.type] || '#888';
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8,
        background: hover ? tpColors.bg : tpColors.surface,
        border: `1px solid ${tpColors.border}`, cursor: 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 3, borderRadius: 2, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          {activity.time && <span style={{ fontSize: 11, fontWeight: 600, color: tpColors.textMuted, flexShrink: 0 }}>{activity.time}</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: tpColors.text }}>{activity.title}</span>
          <span style={{ fontSize: 11, color: color, fontWeight: 500 }}>{TYPE_LABELS[activity.type]}</span>
        </div>
        {activity.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: tpColors.textMuted, lineHeight: 1.5, textWrap: 'pretty' }}>{activity.description}</p>}
      </div>
      {hover && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'flex-start' }}>
          <Btn variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: 11 }}>Edit</Btn>
          <Btn variant="ghost" size="sm" onClick={onDelete} style={{ fontSize: 11, color: tpColors.danger }}>✕</Btn>
        </div>
      )}
    </div>
  );
}

function DayColumn({ day, dayIndex, tripStart, onUpdateDay, onDeleteDay }) {
  const [showAddActivity, setShowAddActivity] = React.useState(false);
  const [editActivity, setEditActivity] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState(false);

  const activities = day.activities || [];

  const addActivity = (form) => {
    const a = { id: genId(), ...form };
    onUpdateDay({ ...day, activities: [...activities, a] });
  };
  const updateActivity = (id, form) => {
    onUpdateDay({ ...day, activities: activities.map(a => a.id === id ? { ...a, ...form } : a) });
  };
  const deleteActivity = (id) => {
    onUpdateDay({ ...day, activities: activities.filter(a => a.id !== id) });
    setConfirmDelete(null);
  };

  const dateLabel = day.date ? formatDate(day.date) : `Day ${dayIndex + 1}`;

  return (
    <div style={{
      background: tpColors.surface, border: `1px solid ${tpColors.border}`, borderRadius: 10,
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Day Header */}
      <div style={{
        padding: '12px 14px', background: tpColors.bg, borderBottom: `1px solid ${tpColors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
      }} onClick={() => setCollapsed(c => !c)}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: tpColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day {dayIndex + 1}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: tpColors.text }}>{dateLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge color="gray">{activities.length}</Badge>
          <span style={{ color: tpColors.textMuted, fontSize: 12 }}>{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.length === 0 && (
            <div style={{ fontSize: 12, color: tpColors.textMuted, textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>No activities yet</div>
          )}
          {activities.map(a => (
            <ActivityCard key={a.id} activity={a}
              onEdit={() => setEditActivity(a)}
              onDelete={() => setConfirmDelete(a.id)}
            />
          ))}
          <Btn variant="ghost" size="sm" onClick={() => setShowAddActivity(true)} style={{ marginTop: 2, justifyContent: 'center', color: tpColors.accent }}>
            + Add activity
          </Btn>
        </div>
      )}

      {showAddActivity && <ActivityModal onSave={addActivity} onClose={() => setShowAddActivity(false)} />}
      {editActivity && <ActivityModal activity={editActivity} onSave={form => { updateActivity(editActivity.id, form); setEditActivity(null); }} onClose={() => setEditActivity(null)} />}
      {confirmDelete && <ConfirmDialog message="Delete this activity?" onConfirm={() => deleteActivity(confirmDelete)} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

function ItineraryTab({ trip, onUpdateTrip }) {
  const [showAddDay, setShowAddDay] = React.useState(false);
  const [newDayDate, setNewDayDate] = React.useState('');
  const [confirmDeleteDay, setConfirmDeleteDay] = React.useState(null);

  const days = trip.days || [];

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

  // Auto-suggest next date
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
            <DayColumn key={day.id} day={day} dayIndex={i} tripStart={trip.startDate}
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

      {confirmDeleteDay && <ConfirmDialog message="Delete this day and all its activities?" onConfirm={() => deleteDay(confirmDeleteDay)} onCancel={() => setConfirmDeleteDay(null)} />}
    </div>
  );
}

Object.assign(window, { ItineraryTab });

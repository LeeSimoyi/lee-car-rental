/* ═══════════════════════════════════════════════════════════════
   LCR DATABASE — localStorage-backed state management
   Acts as the "backend" for all booking, fleet, and user data.
═══════════════════════════════════════════════════════════════ */

const LCR_DB = (() => {

  /* ── Keys ── */
  const KEYS = {
    bookings:  'lcr_bookings',
    fleet:     'lcr_fleet_status',
    customers: 'lcr_customers',
    settings:  'lcr_settings',
    admin_log: 'lcr_admin_log',
  };

  /* ── Helpers ── */
  const get  = key => JSON.parse(localStorage.getItem(key) || 'null');
  const set  = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const uuid = () => 'LCR-' + Math.random().toString(36).substr(2,4).toUpperCase() + '-' + Date.now().toString(36).toUpperCase().slice(-4);
  const now  = () => new Date().toISOString();

  /* ── Seed fleet availability ── */
  function initFleet() {
    if (get(KEYS.fleet)) return;
    set(KEYS.fleet, {
      camry:    { available: true, notes: '', maintenanceUntil: null },
      explorer: { available: true, notes: '', maintenanceUntil: null },
      mercedes: { available: true, notes: '', maintenanceUntil: null },
      tesla:    { available: true, notes: '', maintenanceUntil: null },
      bmw:      { available: true, notes: '', maintenanceUntil: null },
      civic:    { available: true, notes: '', maintenanceUntil: null },
    });
  }

  /* ── Seed settings ── */
  function initSettings() {
    if (get(KEYS.settings)) return;
    set(KEYS.settings, {
      adminPin:       '1234',
      businessName:   'LCR Lee Car Rental',
      phone:          '+263 77 123 4567',
      email:          'info@leecarsrental.co.zw',
      autoApprove:    false,
      requireDeposit: true,
      depositPercent: 30,
      currency:       'USD',
    });
  }

  /* ── Bookings ── */
  function getBookings() { return get(KEYS.bookings) || []; }
  function saveBookings(b) { set(KEYS.bookings, b); }

  function createBooking(data) {
    const bookings = getBookings();
    const ref = uuid();
    const settings = getSettings();
    const booking = {
      ref,
      status:     settings.autoApprove ? 'approved' : 'pending',
      createdAt:  now(),
      updatedAt:  now(),
      carId:      data.carId,
      carName:    data.carName,
      carPrice:   data.carPrice,
      fullName:   data.fullName,
      phone:      data.phone,
      email:      data.email,
      pickupDate: data.pickupDate,
      returnDate: data.returnDate,
      pickupLoc:  data.pickupLoc,
      passengers: data.passengers,
      message:    data.message || '',
      totalDays:  data.totalDays,
      totalPrice: data.totalPrice,
      depositDue: data.depositDue,
      adminNote:  '',
      paymentStatus: 'unpaid',
    };
    bookings.unshift(booking);
    saveBookings(bookings);
    addLog('BOOKING_CREATED', `New booking ${ref} for ${data.carName} by ${data.fullName}`);
    return booking;
  }

  function updateBookingStatus(ref, status, adminNote) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.ref === ref);
    if (idx === -1) return null;
    bookings[idx].status    = status;
    bookings[idx].updatedAt = now();
    if (adminNote !== undefined) bookings[idx].adminNote = adminNote;
    saveBookings(bookings);
    addLog('STATUS_CHANGE', `Booking ${ref} → ${status}`);
    return bookings[idx];
  }

  function getBookingByRef(ref) {
    return getBookings().find(b => b.ref === ref) || null;
  }

  function cancelBooking(ref) {
    return updateBookingStatus(ref, 'cancelled', 'Cancelled by customer');
  }

  /* ── Fleet ── */
  function getFleet() {
    initFleet();
    return get(KEYS.fleet);
  }

  function updateFleetCar(carId, updates) {
    const fleet = getFleet();
    fleet[carId] = { ...fleet[carId], ...updates };
    set(KEYS.fleet, fleet);
    addLog('FLEET_UPDATE', `${carId} updated: ${JSON.stringify(updates)}`);
  }

  function isCarAvailable(carId, pickupDate, returnDate) {
    const fleet = getFleet();
    if (!fleet[carId]?.available) return false;
    // Check no approved/pending booking overlaps
    const bookings = getBookings().filter(b =>
      b.carId === carId && ['pending','approved'].includes(b.status)
    );
    const pd = new Date(pickupDate), rd = new Date(returnDate);
    for (const b of bookings) {
      const bp = new Date(b.pickupDate), br = new Date(b.returnDate);
      if (pd < br && rd > bp) return false;
    }
    return true;
  }

  /* ── Settings ── */
  function getSettings() { initSettings(); return get(KEYS.settings); }
  function saveSettings(s) { set(KEYS.settings, s); }

  /* ── Admin Log ── */
  function addLog(type, message) {
    const log = get(KEYS.admin_log) || [];
    log.unshift({ type, message, ts: now() });
    if (log.length > 200) log.splice(200);
    set(KEYS.admin_log, log);
  }
  function getLog() { return get(KEYS.admin_log) || []; }

  /* ── Analytics ── */
  function getAnalytics() {
    const bookings = getBookings();
    const total    = bookings.length;
    const pending  = bookings.filter(b => b.status === 'pending').length;
    const approved = bookings.filter(b => b.status === 'approved').length;
    const cancelled= bookings.filter(b => b.status === 'cancelled').length;
    const completed= bookings.filter(b => b.status === 'completed').length;
    const revenue  = bookings
      .filter(b => ['approved','completed'].includes(b.status))
      .reduce((s, b) => s + (b.totalPrice || 0), 0);

    // Bookings by car
    const byCar = {};
    bookings.forEach(b => { byCar[b.carId] = (byCar[b.carId] || 0) + 1; });

    // Last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const count = bookings.filter(b => b.createdAt.startsWith(ds)).length;
      last7.push({ date: ds.slice(5), count });
    }

    return { total, pending, approved, cancelled, completed, revenue, byCar, last7 };
  }

  /* ── Init ── */
  initFleet();
  initSettings();

  return {
    createBooking, getBookings, getBookingByRef,
    updateBookingStatus, cancelBooking,
    getFleet, updateFleetCar, isCarAvailable,
    getSettings, saveSettings,
    getAnalytics, getLog,
  };
})();

/* ═══════════════════════════════════════════════════════════════
   LCR ADMIN DASHBOARD — Complete Application
═══════════════════════════════════════════════════════════════ */

const adminApp = (() => {

  /* ── State ── */
  let currentPage    = 'dashboard';
  let currentFilter  = 'all';
  let currentPage_n  = 1;
  const PAGE_SIZE    = 10;
  let drawerRef      = null;
  let confirmCallback = null;
  let searchQuery    = '';

  const CAR_IMAGES = {
    camry:    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    explorer: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80',
    mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80',
    tesla:    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
    bmw:      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
    civic:    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&q=80',
  };
  const CAR_PRICES = { camry:45, explorer:75, mercedes:120, tesla:95, bmw:140, civic:35 };
  const CAR_NAMES  = {
    camry:'Toyota Camry', explorer:'Ford Explorer', mercedes:'Mercedes-Benz C300',
    tesla:'Tesla Model 3', bmw:'BMW X5', civic:'Honda Civic',
  };

  /* ── Helper: resolve missing carName/carPrice from carId ── */
  function resolveBooking(b) {
    return {
      ...b,
      carName:    b.carName    || CAR_NAMES[b.carId]  || b.carId   || '—',
      carPrice:   b.carPrice   || CAR_PRICES[b.carId] || 0,
      totalDays:  b.totalDays  || (b.pickupDate && b.returnDate
                    ? Math.max(1, Math.round((new Date(b.returnDate)-new Date(b.pickupDate))/86400000))
                    : 1),
      totalPrice: b.totalPrice || ((b.totalDays||1) * (b.carPrice || CAR_PRICES[b.carId] || 0)),
      depositDue: b.depositDue || Math.round(((b.totalDays||1)*(b.carPrice||CAR_PRICES[b.carId]||0))*(LCR_DB.getSettings().depositPercent/100)),
      pickupLoc:  b.pickupLoc  || '—',
      passengers: b.passengers || '—',
      paymentMethod: b.paymentMethod || '—',
    };
  }

  /* ── Login ── */
  function initLogin() {
    const btn   = document.getElementById('loginBtn');
    const input = document.getElementById('loginPin');
    const doLogin = () => {
      const pin = input.value.trim();
      const settings = LCR_DB.getSettings();
      if (pin === settings.adminPin) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminShell').style.display  = 'flex';
        seedDemoData();
        init();
      } else {
        document.getElementById('loginError').textContent = 'Incorrect PIN. Try again.';
        input.value = '';
        input.focus();
        setTimeout(() => document.getElementById('loginError').textContent = '', 3000);
      }
    };
    btn.addEventListener('click', doLogin);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    input.focus();
  }

  function logout() {
    document.getElementById('adminShell').style.display  = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPin').value = '';
    document.getElementById('loginPin').focus();
  }

  /* ── Seed demo bookings so dashboard isn't empty ── */
  function seedDemoData() {
    if (LCR_DB.getBookings().length > 0) return;
    const demos = [
      { carId:'mercedes', carName:'Mercedes-Benz C300', carPrice:120, fullName:'Tafadzwa Mutasa',   phone:'+263771234567', email:'tafadzwa@email.com', pickupDate:'2026-06-10', returnDate:'2026-06-13', pickupLoc:'Mutare City Centre', passengers:'1-2', paymentMethod:'card',    totalDays:3, totalPrice:360, depositDue:108, message:'VIP client', idNumber:'63-112233A44' },
      { carId:'bmw',      carName:'BMW X5',             carPrice:140, fullName:'Nyaradzo Zvenyika', phone:'+263772345678', email:'nyaradzo@email.com', pickupDate:'2026-06-12', returnDate:'2026-06-14', pickupLoc:'Mutare Airport',      passengers:'1-2', paymentMethod:'ecocash', totalDays:2, totalPrice:280, depositDue:84,  message:'Wedding',   idNumber:'63-223344B55' },
      { carId:'camry',    carName:'Toyota Camry',       carPrice:45,  fullName:'Chipo Sibanda',     phone:'+263773456789', email:'chipo@email.com',    pickupDate:'2026-06-08', returnDate:'2026-06-11', pickupLoc:'Sakubva Bus Terminal', passengers:'3-4', paymentMethod:'cash',    totalDays:3, totalPrice:135, depositDue:41,  message:'',          idNumber:'63-334455C66' },
      { carId:'tesla',    carName:'Tesla Model 3',      carPrice:95,  fullName:'Ruvimbo Moyo',      phone:'+263774567890', email:'ruvimbo@email.com',  pickupDate:'2026-06-09', returnDate:'2026-06-12', pickupLoc:'Greenside',          passengers:'1-2', paymentMethod:'card',    totalDays:3, totalPrice:285, depositDue:86,  message:'EV fan',    idNumber:'63-445566D77' },
      { carId:'explorer', carName:'Ford Explorer',      carPrice:75,  fullName:'Simba Kurewa',      phone:'+263775678901', email:'simba@email.com',    pickupDate:'2026-06-05', returnDate:'2026-06-08', pickupLoc:'Mutare City Centre', passengers:'5-6', paymentMethod:'bank',    totalDays:3, totalPrice:225, depositDue:68,  message:'Family trip', idNumber:'63-556677E88' },
      { carId:'civic',    carName:'Honda Civic',        carPrice:35,  fullName:'Fadzai Mhlanga',    phone:'+263776789012', email:'fadzai@email.com',   pickupDate:'2026-06-11', returnDate:'2026-06-13', pickupLoc:'Dangamvura',         passengers:'1-2', paymentMethod:'ecocash', totalDays:2, totalPrice:70,  depositDue:21,  message:'',          idNumber:'63-667788F99' },
    ];
    demos.forEach(d => {
      const b = LCR_DB.createBooking(d);
      // Make some approved/completed for analytics
      if (d.carId === 'camry')    LCR_DB.updateBookingStatus(b.ref, 'approved', 'Confirmed by admin');
      if (d.carId === 'explorer') LCR_DB.updateBookingStatus(b.ref, 'completed', 'Returned in good condition');
      if (d.carId === 'civic')    LCR_DB.updateBookingStatus(b.ref, 'cancelled', 'Customer cancelled');
    });
  }

  /* ── Init ── */
  function init() {
    updateNotifBadge();
    setupSearch();
    loadProfilePicture();
    loadAdminName();
    navigate('dashboard');
  }

  /* ── Profile picture helpers ── */
  function loadProfilePicture() {
    const pic = localStorage.getItem('lcr_admin_avatar');
    const s   = LCR_DB.getSettings();
    // Sidebar
    const sideImg  = document.getElementById('sidebarAvatarImg');
    const sideInit = document.getElementById('sidebarAvatarInitial');
    // Topbar
    const topImg   = document.getElementById('topbarAvatarImg');
    const topInit  = document.getElementById('topbarAvatarInitial');

    if (pic) {
      if (sideImg)  { sideImg.src = pic; sideImg.style.display = 'block'; }
      if (sideInit) { sideInit.style.display = 'none'; }
      if (topImg)   { topImg.src = pic; topImg.style.display = 'block'; }
      if (topInit)  { topInit.style.display = 'none'; }
    } else {
      if (sideImg)  { sideImg.style.display = 'none'; }
      if (sideInit) { sideInit.style.display = 'flex'; }
      if (topImg)   { topImg.style.display = 'none'; }
      if (topInit)  { topInit.style.display = 'flex'; }
    }
  }

  function loadAdminName() {
    const s = LCR_DB.getSettings();
    const el = document.getElementById('sidebarAdminName');
    if (el && s.adminName) el.textContent = s.adminName;
  }

  /* ── Sidebar ── */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('sidebarOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);

  /* ── Navigation ── */
  function navigate(page) {
    currentPage   = page;
    currentPage_n = 1;
    currentFilter = 'all';
    closeSidebar();

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (active) active.classList.add('active');

    const titles = {
      dashboard:'Dashboard', bookings:'Bookings', fleet:'Fleet Status',
      cars:'Manage Cars', analytics:'Analytics', log:'Activity Log', settings:'Settings',
    };
    document.getElementById('topbarTitle').textContent = titles[page] || page;
    renderPage(page);
    updateNotifBadge();
  }

  function refreshPage() { navigate(currentPage); }

  /* ── Notification badge ── */
  function updateNotifBadge() {
    const pending = LCR_DB.getBookings().filter(b => b.status === 'pending').length;
    const dot     = document.getElementById('notifDot');
    const badge   = document.getElementById('nav-badge-bookings');
    if (dot)   dot.style.display   = pending > 0 ? '' : 'none';
    if (badge) badge.textContent   = pending > 0 ? pending : '';
    if (badge) badge.style.display = pending > 0 ? '' : 'none';
  }

  /* ── Search ── */
  function setupSearch() {
    document.getElementById('topbarSearch')?.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (currentPage === 'bookings') renderPage('bookings');
    });
  }

  /* ── Toast ── */
  function toast(title, msg, type = 'blue') {
    const t    = document.getElementById('adminToast');
    const icon = document.getElementById('adminToastIcon');
    const colorMap = { blue:'#4169E1', green:'#10b981', red:'#ef4444', amber:'#f59e0b' };
    t.style.borderLeftColor = colorMap[type] || colorMap.blue;
    icon.style.color        = colorMap[type] || colorMap.blue;
    icon.className = `admin-toast-icon fa-solid ${type==='red'?'fa-circle-xmark':type==='amber'?'fa-triangle-exclamation':'fa-circle-check'}`;
    document.getElementById('adminToastTitle').textContent = title;
    document.getElementById('adminToastMsg').textContent   = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  /* ── Confirm dialog ── */
  function confirm(title, msg, okLabel, okClass, cb) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent   = msg;
    const okBtn = document.getElementById('confirmOk');
    okBtn.textContent = okLabel || 'Confirm';
    okBtn.className   = 'admin-confirm-ok ' + (okClass || '');
    confirmCallback   = cb;
    document.getElementById('adminConfirmOverlay').classList.add('open');
  }
  document.getElementById('confirmOk')?.addEventListener('click', () => {
    document.getElementById('adminConfirmOverlay').classList.remove('open');
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  });
  document.getElementById('confirmCancel')?.addEventListener('click', () => {
    document.getElementById('adminConfirmOverlay').classList.remove('open');
    confirmCallback = null;
  });

  /* ══════════════════════════════════════════
     PAGE RENDERERS
  ══════════════════════════════════════════ */
  function renderPage(page) {
    const content = document.getElementById('adminContent');
    content.innerHTML = '';
    if (page === 'dashboard') renderDashboard(content);
    if (page === 'bookings')  renderBookings(content);
    if (page === 'fleet')     renderFleet(content);
    if (page === 'cars')      renderCars(content);
    if (page === 'analytics') renderAnalytics(content);
    if (page === 'log')       renderLog(content);
    if (page === 'settings')  renderSettings(content);
  }

  /* ────────────────────────────────────────
     DASHBOARD
  ──────────────────────────────────────── */
  function renderDashboard(el) {
    const a = LCR_DB.getAnalytics();
    const pendingBookings = LCR_DB.getBookings().filter(b => b.status === 'pending').slice(0, 5);
    const fleet = LCR_DB.getFleet();
    const fleetAvail = Object.values(fleet).filter(f => f.available).length;

    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Dashboard</h1>
          <p>${new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div class="page-header-actions">
          <button class="btn-ghost-sm" onclick="adminApp.navigate('analytics')"><i class="fa-solid fa-chart-line"></i> Analytics</button>
          <button class="btn-primary-sm" onclick="adminApp.navigate('bookings')"><i class="fa-solid fa-list"></i> All Bookings</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-icon sci-blue"><i class="fa-solid fa-calendar-check"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${a.total}</div>
            <div class="stat-card-label">Total Bookings</div>
          </div>
          <div class="stat-card-change change-up">All time</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-amber"><i class="fa-solid fa-clock"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${a.pending}</div>
            <div class="stat-card-label">Pending Approval</div>
          </div>
          ${a.pending > 0 ? `<div class="stat-card-change change-down">Action needed</div>` : `<div class="stat-card-change change-neu">All clear</div>`}
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-green"><i class="fa-solid fa-dollar-sign"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${convertCurrency(a.revenue)}</div>
            <div class="stat-card-label">Total Revenue</div>
          </div>
          <div class="stat-card-change change-up">Approved</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-purple"><i class="fa-solid fa-car"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${fleetAvail}/6</div>
            <div class="stat-card-label">Cars Available</div>
          </div>
          <div class="stat-card-change ${fleetAvail < 3 ? 'change-down' : 'change-up'}">${fleetAvail < 3 ? 'Low' : 'Good'}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-action-grid">
        <div class="quick-action-btn" onclick="adminApp.navigate('bookings')">
          <i class="fa-solid fa-calendar-check"></i><span>Bookings</span>
        </div>
        <div class="quick-action-btn" onclick="adminApp.navigate('fleet')">
          <i class="fa-solid fa-car"></i><span>Fleet</span>
        </div>
        <div class="quick-action-btn" onclick="adminApp.navigate('analytics')">
          <i class="fa-solid fa-chart-bar"></i><span>Analytics</span>
        </div>
        <div class="quick-action-btn" onclick="adminApp.navigate('settings')">
          <i class="fa-solid fa-gear"></i><span>Settings</span>
        </div>
      </div>

      <!-- Pending + Recent side by side -->
      <div class="dashboard-grid-2">
        <!-- Pending Bookings -->
        <div class="table-card">
          <div class="table-card-header">
            <div class="table-card-title"><i class="fa-solid fa-clock"></i> Pending Approvals</div>
            <button class="btn-ghost-sm" onclick="adminApp.navigate('bookings')">View All</button>
          </div>
          ${pendingBookings.length === 0 ? `<div class="empty-state" style="padding:32px"><div class="empty-state-icon"><i class="fa-solid fa-circle-check" style="color:#10b981"></i></div><h3>All caught up!</h3><p>No pending bookings.</p></div>` :
          `<div class="table-wrap">
            <table>
              <thead><tr><th>Reference</th><th>Customer</th><th>Car</th><th>Action</th></tr></thead>
              <tbody>
                ${pendingBookings.map(b => `
                  <tr onclick="adminApp.openDrawer('${b.ref}')">
                    <td><span style="font-family:monospace;font-weight:700;color:#4169E1;font-size:0.78rem">${b.ref}</span></td>
                    <td>${b.fullName}</td>
                    <td>${b.carName}</td>
                    <td>
                      <div class="tbl-actions" onclick="event.stopPropagation()">
                        <button class="tbl-btn tbl-btn-approve" title="Approve" onclick="adminApp.approveBooking('${b.ref}')"><i class="fa-solid fa-check"></i></button>
                        <button class="tbl-btn tbl-btn-reject"  title="Reject"  onclick="adminApp.rejectBooking('${b.ref}')"><i class="fa-solid fa-xmark"></i></button>
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>

        <!-- Recent Activity -->
        <div class="table-card">
          <div class="table-card-header">
            <div class="table-card-title"><i class="fa-solid fa-list-ul"></i> Recent Activity</div>
            <button class="btn-ghost-sm" onclick="adminApp.navigate('log')">Full Log</button>
          </div>
          <div class="log-list" style="padding:8px 0">
            ${LCR_DB.getLog().slice(0,8).map(l => `
              <div class="log-item">
                <div class="log-icon ${logIconClass(l.type)}"><i class="fa-solid ${logIcon(l.type)}"></i></div>
                <div class="log-body">
                  <div class="log-msg">${l.message}</div>
                  <div class="log-time">${timeAgo(l.ts)}</div>
                </div>
              </div>`).join('') || '<div class="empty-state" style="padding:24px"><p>No activity yet.</p></div>'}
          </div>
        </div>
      </div>

      <!-- Mini bar chart -->
      <div class="table-card">
        <div class="table-card-header">
          <div class="table-card-title"><i class="fa-solid fa-chart-bar"></i> Bookings — Last 7 Days</div>
        </div>
        <div style="padding:20px 24px">
          <div class="bar-chart" id="dashBarChart"></div>
        </div>
      </div>
    `;

    renderBarChart('dashBarChart', LCR_DB.getAnalytics().last7);
  }

  /* ────────────────────────────────────────
     BOOKINGS PAGE
  ──────────────────────────────────────── */
  function renderBookings(el) {
    let bookings = LCR_DB.getBookings();

    // Apply search
    if (searchQuery) {
      bookings = bookings.filter(b =>
        b.ref.toLowerCase().includes(searchQuery) ||
        b.fullName.toLowerCase().includes(searchQuery) ||
        b.carName.toLowerCase().includes(searchQuery) ||
        b.email.toLowerCase().includes(searchQuery) ||
        b.phone.includes(searchQuery)
      );
    }

    // Apply filter
    if (currentFilter !== 'all') bookings = bookings.filter(b => b.status === currentFilter);

    const totalCount = bookings.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const start      = (currentPage_n - 1) * PAGE_SIZE;
    const pageItems  = bookings.slice(start, start + PAGE_SIZE);

    const counts = LCR_DB.getAnalytics();

    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Bookings</h1>
          <p>${totalCount} booking${totalCount !== 1 ? 's' : ''} found</p>
        </div>
        <div class="page-header-actions">
          <button class="btn-ghost-sm" onclick="adminApp.exportCSV()"><i class="fa-solid fa-download"></i> Export CSV</button>
        </div>
      </div>

      <div class="table-card">
        <div class="table-card-header">
          <div class="table-card-title"><i class="fa-solid fa-calendar-check"></i> All Bookings</div>
          <div class="table-actions">
            <div style="position:relative">
              <i class="fa-solid fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:0.78rem"></i>
              <input type="text" placeholder="Search…" style="padding:7px 12px 7px 28px;border:1.5px solid #e5e7eb;border-radius:999px;font-size:0.82rem;outline:none;width:160px;font-family:'Poppins',sans-serif"
                value="${searchQuery}" oninput="document.getElementById('topbarSearch').value=this.value;adminApp._search(this.value)">
            </div>
          </div>
        </div>

        <div class="table-filter-row">
          ${['all','pending','approved','completed','cancelled'].map(f => `
            <button class="filter-chip ${currentFilter===f?'active':''}" onclick="adminApp.setFilter('${f}')">
              ${f.charAt(0).toUpperCase()+f.slice(1)}
              ${f==='pending' && counts.pending > 0 ? `<span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:999px;font-size:0.68rem;margin-left:4px">${counts.pending}</span>` : ''}
            </button>`).join('')}
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.length === 0 ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-calendar-xmark"></i></div><h3>No bookings found</h3><p>Try changing your filters or search term.</p></div></td></tr>` :
              pageItems.map(b => `
                <tr onclick="adminApp.openDrawer('${b.ref}')">
                  <td><span style="font-family:monospace;font-weight:700;color:#4169E1;font-size:0.78rem">${highlight(b.ref, searchQuery)}</span></td>
                  <td>
                    <div style="font-weight:600">${highlight(b.fullName, searchQuery)}</div>
                    <div style="font-size:0.75rem;color:#9ca3af">${highlight(b.email, searchQuery)}</div>
                  </td>
                  <td>${b.carName}</td>
                  <td style="font-size:0.8rem;white-space:nowrap">
                    <div>${fmtDate(b.pickupDate)}</div>
                    <div style="color:#9ca3af">→ ${fmtDate(b.returnDate)}</div>
                  </td>
                  <td style="font-weight:700;color:#0d1b2a">${convertCurrency(b.totalPrice)}</td>
                  <td><span class="badge badge-${b.status}">${b.status}</span></td>
                  <td>
                    <div class="tbl-actions" onclick="event.stopPropagation()">
                      <button class="tbl-btn tbl-btn-view"    title="View details"  onclick="adminApp.openDrawer('${b.ref}')"><i class="fa-solid fa-eye"></i></button>
                      ${b.status==='pending'  ? `<button class="tbl-btn tbl-btn-approve" title="Approve" onclick="adminApp.approveBooking('${b.ref}')"><i class="fa-solid fa-check"></i></button>` : ''}
                      ${b.status==='pending'  ? `<button class="tbl-btn tbl-btn-reject"  title="Reject"  onclick="adminApp.rejectBooking('${b.ref}')"><i class="fa-solid fa-xmark"></i></button>` : ''}
                      ${b.status==='approved' ? `<button class="tbl-btn tbl-btn-complete" title="Mark complete" onclick="adminApp.completeBooking('${b.ref}')"><i class="fa-solid fa-flag-checkered"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="pagination-info">Showing ${start+1}–${Math.min(start+PAGE_SIZE,totalCount)} of ${totalCount}</div>
          <div class="pagination-btns">
            <button class="pag-btn" ${currentPage_n<=1?'disabled':''} onclick="adminApp.gotoPage(${currentPage_n-1})"><i class="fa-solid fa-chevron-left"></i></button>
            ${Array.from({length:Math.min(totalPages,5)},(_,i)=>{
              const p = i+1;
              return `<button class="pag-btn ${currentPage_n===p?'active':''}" onclick="adminApp.gotoPage(${p})">${p}</button>`;
            }).join('')}
            <button class="pag-btn" ${currentPage_n>=totalPages?'disabled':''} onclick="adminApp.gotoPage(${currentPage_n+1})"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  function _search(val) {
    searchQuery = val.toLowerCase().trim();
    currentPage_n = 1;
    renderPage('bookings');
  }

  function setFilter(f) { currentFilter = f; currentPage_n = 1; renderPage('bookings'); }
  function gotoPage(p)  { currentPage_n = p; renderPage('bookings'); }

  /* ── Booking actions ── */
  function approveBooking(ref) {
    const note = prompt('Optional admin note for customer:') || 'Booking confirmed';
    confirm('Approve Booking', `Approve booking ${ref}?`, 'Approve', 'green', () => {
      LCR_DB.updateBookingStatus(ref, 'approved', note);
      toast('Booking Approved', `${ref} has been approved.`, 'green');
      refreshPage();
      updateNotifBadge();
      if (drawerRef === ref) openDrawer(ref);
    });
  }

  function rejectBooking(ref) {
    confirm('Reject Booking', `Reject and decline booking ${ref}? The customer will be notified.`, 'Reject', '', () => {
      LCR_DB.updateBookingStatus(ref, 'rejected', 'Booking rejected by admin');
      toast('Booking Rejected', `${ref} has been rejected.`, 'red');
      refreshPage();
      updateNotifBadge();
      if (drawerRef === ref) openDrawer(ref);
    });
  }

  function completeBooking(ref) {
    confirm('Mark as Completed', `Mark booking ${ref} as completed?`, 'Complete', 'blue', () => {
      LCR_DB.updateBookingStatus(ref, 'completed', 'Rental completed successfully');
      toast('Booking Completed', `${ref} marked as completed.`, 'blue');
      refreshPage();
      if (drawerRef === ref) openDrawer(ref);
    });
  }

  function cancelBookingAdmin(ref) {
    confirm('Cancel Booking', `Cancel booking ${ref}? This cannot be undone.`, 'Cancel Booking', '', () => {
      LCR_DB.updateBookingStatus(ref, 'cancelled', 'Cancelled by admin');
      toast('Booking Cancelled', `${ref} has been cancelled.`, 'amber');
      refreshPage();
      if (drawerRef === ref) openDrawer(ref);
    });
  }

  function saveAdminNote(ref) {
    const note = document.getElementById('drawerNote')?.value || '';
    LCR_DB.updateBookingStatus(ref, LCR_DB.getBookingByRef(ref)?.status, note);
    toast('Note Saved', 'Admin note updated.', 'blue');
  }

  /* ── Booking Drawer ── */
  function openDrawer(ref) {
    drawerRef = ref;
    const raw = LCR_DB.getBookingByRef(ref);
    if (!raw) return;
    const b   = resolveBooking(raw);
    const overlay = document.getElementById('drawerOverlay');
    const drawer  = document.getElementById('bookingDrawer');
    const body    = document.getElementById('drawerBody');

    const pickupFmt = b.pickupDate ? fmtDate(b.pickupDate) : '—';
    const returnFmt = b.returnDate ? fmtDate(b.returnDate) : '—';
    const createdFmt = b.createdAt ? new Date(b.createdAt).toLocaleString() : '—';
    const carImg = CAR_IMAGES[b.carId] || CAR_IMAGES['camry'];

    body.innerHTML = `
      <img class="drawer-car-thumb" src="${carImg}" alt="${b.carName}" onerror="this.src='https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80'">

      <div class="drawer-section">
        <div class="drawer-section-title"><i class="fa-solid fa-id-card"></i> Booking Info</div>
        <div class="drawer-info-grid">
          <div class="drawer-info-item drawer-info-full">
            <label>Reference</label>
            <span style="font-family:monospace;color:#4169E1;font-size:1.05rem;font-weight:800;letter-spacing:1px">${b.ref}</span>
          </div>
          <div class="drawer-info-item">
            <label>Status</label>
            <span class="badge badge-${b.status}">${b.status}</span>
          </div>
          <div class="drawer-info-item">
            <label>Created</label>
            <span>${createdFmt}</span>
          </div>
          <div class="drawer-info-item">
            <label>Vehicle</label>
            <span>${b.carName}</span>
          </div>
          <div class="drawer-info-item">
            <label>Rate</label>
            <span>$${b.carPrice}/day</span>
          </div>
          <div class="drawer-info-item">
            <label>Pickup Date</label>
            <span>${pickupFmt}</span>
          </div>
          <div class="drawer-info-item">
            <label>Return Date</label>
            <span>${returnFmt}</span>
          </div>
          <div class="drawer-info-item">
            <label>Duration</label>
            <span>${b.totalDays} day${b.totalDays > 1 ? 's' : ''}</span>
          </div>
          <div class="drawer-info-item">
            <label>Pickup Location</label>
            <span>${b.pickupLoc}</span>
          </div>
          <div class="drawer-info-item">
            <label>Passengers</label>
            <span>${b.passengers}</span>
          </div>
          <div class="drawer-info-item">
            <label>Payment Method</label>
            <span>${b.paymentMethod}</span>
          </div>
          <div class="drawer-info-item">
            <label>Payment Status</label>
            <span class="badge ${b.paymentStatus === 'paid' ? 'badge-approved' : 'badge-pending'}">${b.paymentStatus || 'unpaid'}</span>
          </div>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title"><i class="fa-solid fa-user"></i> Customer Details</div>
        <div class="drawer-info-grid">
          <div class="drawer-info-item drawer-info-full"><label>Full Name</label><span>${b.fullName || '—'}</span></div>
          <div class="drawer-info-item"><label>Phone</label><span><a href="tel:${b.phone || ''}" style="color:#4169E1">${b.phone || '—'}</a></span></div>
          <div class="drawer-info-item"><label>Email</label><span><a href="mailto:${b.email || ''}" style="color:#4169E1;font-size:0.82rem;word-break:break-all">${b.email || '—'}</a></span></div>
          <div class="drawer-info-item drawer-info-full"><label>ID / Passport</label><span>${b.idNumber || '—'}</span></div>
          ${b.message ? `<div class="drawer-info-item drawer-info-full"><label>Special Request</label><span>${b.message}</span></div>` : ''}
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title"><i class="fa-solid fa-receipt"></i> Pricing Breakdown</div>
        <div class="drawer-total-box">
          <div class="drawer-total-row"><span>${b.totalDays} day${b.totalDays > 1 ? 's' : ''} × ${convertCurrency(b.carPrice)}/day</span><span>${convertCurrency(b.totalPrice)}</span></div>
          <div class="drawer-total-row"><span>Insurance &amp; taxes</span><span>Included</span></div>
          <div class="drawer-total-row drawer-total-final"><span>Total</span><strong>${convertCurrency(b.totalPrice)}</strong></div>
          <div class="drawer-total-row" style="color:rgba(255,255,255,0.7);margin-top:6px;font-size:0.8rem">
            <span>Deposit required (${LCR_DB.getSettings().depositPercent}%)</span><span>${convertCurrency(b.depositDue)}</span>
          </div>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title"><i class="fa-solid fa-comment"></i> Admin Note</div>
        <div class="drawer-admin-note-wrap">
          <textarea id="drawerNote" class="drawer-admin-note-input" rows="3" placeholder="Add a note about this booking…">${b.adminNote || ''}</textarea>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button onclick="adminApp.saveAdminNote('${b.ref}')" class="btn-primary-sm" style="font-size:0.82rem">
              <i class="fa-solid fa-floppy-disk"></i> Save Note
            </button>
            <button onclick="adminApp.markPaid('${b.ref}')" class="btn-ghost-sm" style="font-size:0.82rem">
              <i class="fa-solid fa-credit-card"></i> Mark Paid
            </button>
          </div>
        </div>
      </div>

      <div class="drawer-section">
        <div class="drawer-section-title"><i class="fa-solid fa-bolt"></i> Actions</div>
        <div class="drawer-action-row">
          ${b.status === 'pending'  ? `<button class="btn-approve" onclick="adminApp.approveBooking('${b.ref}')"><i class="fa-solid fa-check"></i> Approve</button>` : ''}
          ${b.status === 'pending'  ? `<button class="btn-reject"  onclick="adminApp.rejectBooking('${b.ref}')"><i class="fa-solid fa-xmark"></i> Reject</button>` : ''}
          ${b.status === 'approved' ? `<button class="btn-complete" onclick="adminApp.completeBooking('${b.ref}')"><i class="fa-solid fa-flag-checkered"></i> Complete</button>` : ''}
          ${['pending','approved'].includes(b.status) ? `<button class="btn-cancel-bk" onclick="adminApp.cancelBookingAdmin('${b.ref}')"><i class="fa-solid fa-ban"></i> Cancel</button>` : ''}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <a href="mailto:${b.email || ''}?subject=Your LCR Booking ${b.ref}" class="btn-ghost-sm" style="font-size:0.8rem;text-decoration:none">
            <i class="fa-solid fa-envelope"></i> Email Customer
          </a>
          <a href="tel:${b.phone || ''}" class="btn-ghost-sm" style="font-size:0.8rem;text-decoration:none">
            <i class="fa-solid fa-phone"></i> Call Customer
          </a>
        </div>
      </div>
    `;

    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('bookingDrawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  function markPaid(ref) {
    const bookings = LCR_DB.getBookings();
    const idx = bookings.findIndex(b => b.ref === ref);
    if (idx !== -1) {
      bookings[idx].paymentStatus = 'paid';
      bookings[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('lcr_bookings', JSON.stringify(bookings));
      toast('Payment Recorded', `${ref} marked as paid.`, 'green');
      openDrawer(ref);
    }
  }

  /* ────────────────────────────────────────
     FLEET PAGE
  ──────────────────────────────────────── */
  function renderFleet(el) {
    const fleet    = LCR_DB.getFleet();
    const bookings = LCR_DB.getBookings();
    const cars = [
      { id:'camry',    name:'Toyota Camry',       sub:'Mid-Size Sedan · $45/day',   cat:'sedan'   },
      { id:'explorer', name:'Ford Explorer',       sub:'Full-Size SUV · $75/day',    cat:'suv'     },
      { id:'mercedes', name:'Mercedes-Benz C300',  sub:'Luxury Sedan · $120/day',    cat:'luxury'  },
      { id:'tesla',    name:'Tesla Model 3',        sub:'Electric Sedan · $95/day',   cat:'electric'},
      { id:'bmw',      name:'BMW X5',               sub:'Luxury SUV · $140/day',      cat:'suv'     },
      { id:'civic',    name:'Honda Civic',           sub:'Compact Sedan · $35/day',   cat:'sedan'   },
    ];

    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Fleet Management</h1>
          <p>Manage vehicle availability and status</p>
        </div>
      </div>
      <div class="fleet-grid">
        ${cars.map(c => {
          const fs   = fleet[c.id] || { available: true };
          const bkgs = bookings.filter(b => b.carId === c.id && ['pending','approved'].includes(b.status));
          return `
          <div class="fleet-card">
            <div class="fleet-card-img-wrap">
              <img class="fleet-card-img" src="${CAR_IMAGES[c.id]}" alt="${c.name}" loading="lazy">
              <div class="fleet-status-dot ${fs.available ? 'available':'unavailable'}"></div>
            </div>
            <div class="fleet-card-body">
              <div class="fleet-card-name">${c.name}</div>
              <div class="fleet-card-sub">${c.sub}</div>
              <div class="fleet-card-stats">
                <div class="fleet-stat">
                  <strong>${bookings.filter(b=>b.carId===c.id&&b.status==='completed').length}</strong>
                  <span>Completed</span>
                </div>
                <div class="fleet-stat">
                  <strong>${bkgs.length}</strong>
                  <span>Active</span>
                </div>
                <div class="fleet-stat">
                  <strong>${convertCurrency(CAR_PRICES[c.id])}</strong>
                  <span>Per Day</span>
                </div>
              </div>
              ${fs.notes ? `<div style="font-size:0.78rem;color:#f59e0b;background:#fef3c7;border-radius:8px;padding:8px 10px;margin-bottom:12px;display:flex;gap:6px;align-items:flex-start"><i class="fa-solid fa-triangle-exclamation" style="flex-shrink:0;margin-top:1px"></i>${fs.notes}</div>` : ''}
              <div class="fleet-card-actions">
                <button class="fleet-toggle-btn ${fs.available ? 'fleet-toggle-available':'fleet-toggle-unavailable'}"
                  onclick="adminApp.toggleCar('${c.id}', ${!fs.available})">
                  <i class="fa-solid ${fs.available ? 'fa-toggle-on':'fa-toggle-off'}"></i>
                  ${fs.available ? 'Available':'Unavailable'}
                </button>
                <button class="fleet-toggle-btn" style="flex:0;padding:9px 12px;background:#f8f9ff;border:1.5px solid #e5e7eb;color:#4b5563;border-radius:10px;font-size:0.82rem" onclick="adminApp.editFleetNote('${c.id}')">
                  <i class="fa-solid fa-note-sticky"></i>
                </button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function toggleCar(carId, makeAvailable) {
    const action = makeAvailable ? 'mark as available' : 'mark as unavailable';
    confirm(`Update Fleet`, `Are you sure you want to ${action} this vehicle?`, 'Confirm', makeAvailable ? 'green' : '', () => {
      LCR_DB.updateFleetCar(carId, { available: makeAvailable });
      toast('Fleet Updated', `Vehicle is now ${makeAvailable ? 'available' : 'unavailable'}.`, makeAvailable ? 'green' : 'amber');
      renderPage('fleet');
    });
  }

  function editFleetNote(carId) {
    const fleet = LCR_DB.getFleet();
    const note  = prompt('Add a maintenance note (leave blank to clear):', fleet[carId]?.notes || '');
    if (note === null) return;
    LCR_DB.updateFleetCar(carId, { notes: note.trim() });
    toast('Note Updated', 'Fleet note saved.', 'blue');
    renderPage('fleet');
  }

  /* ────────────────────────────────────────
     ANALYTICS PAGE
  ──────────────────────────────────────── */
  function renderAnalytics(el) {
    const a = LCR_DB.getAnalytics();
    const bookings = LCR_DB.getBookings();

    // Revenue breakdown
    const approvedRev  = bookings.filter(b=>b.status==='approved').reduce((s,b)=>s+b.totalPrice,0);
    const completedRev = bookings.filter(b=>b.status==='completed').reduce((s,b)=>s+b.totalPrice,0);

    // Top car
    const carNames = { camry:'Camry', explorer:'Explorer', mercedes:'Mercedes', tesla:'Tesla', bmw:'BMW X5', civic:'Civic' };
    const maxByCar = Math.max(1, ...Object.values(a.byCar));

    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>Analytics</h1><p>Business performance overview</p></div>
      </div>

      <!-- Top stats row -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-icon sci-green"><i class="fa-solid fa-dollar-sign"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${convertCurrency(a.revenue)}</div>
            <div class="stat-card-label">Total Revenue</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-blue"><i class="fa-solid fa-calendar-check"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${a.approved + a.completed}</div>
            <div class="stat-card-label">Confirmed Bookings</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-purple"><i class="fa-solid fa-flag-checkered"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${a.completed}</div>
            <div class="stat-card-label">Completed Rentals</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon sci-red"><i class="fa-solid fa-ban"></i></div>
          <div class="stat-card-body">
            <div class="stat-card-value">${a.cancelled}</div>
            <div class="stat-card-label">Cancellations</div>
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Booking trend -->
        <div class="chart-card full">
          <div class="chart-card-title"><i class="fa-solid fa-chart-bar"></i> Daily Bookings — Last 7 Days</div>
          <div class="bar-chart" id="anaBarChart"></div>
        </div>

        <!-- Revenue breakdown -->
        <div class="chart-card">
          <div class="chart-card-title"><i class="fa-solid fa-dollar-sign"></i> Revenue Breakdown</div>
          <div class="revenue-big">${convertCurrency(a.revenue)}</div>
          <div class="revenue-sub">Total confirmed revenue</div>
          <div class="revenue-breakdown">
            <div class="rev-row"><span>Approved (in progress)</span><strong>${convertCurrency(approvedRev)}</strong></div>
            <div class="rev-row"><span>Completed rentals</span><strong>${convertCurrency(completedRev)}</strong></div>
            <div class="rev-row"><span>Cancellations (lost)</span><strong style="color:#ef4444">${convertCurrency(bookings.filter(b=>['cancelled','rejected'].includes(b.status)).reduce((s,b)=>s+b.totalPrice,0))}</strong></div>
          </div>
        </div>

        <!-- Status donut -->
        <div class="chart-card">
          <div class="chart-card-title"><i class="fa-solid fa-chart-pie"></i> Booking Status</div>
          <div class="donut-wrap">
            ${renderDonut(a)}
            <div class="donut-legend">
              <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div><span class="legend-label">Pending</span><span class="legend-val">${a.pending}</span></div>
              <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div><span class="legend-label">Approved</span><span class="legend-val">${a.approved}</span></div>
              <div class="legend-item"><div class="legend-dot" style="background:#4169E1"></div><span class="legend-label">Completed</span><span class="legend-val">${a.completed}</span></div>
              <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div><span class="legend-label">Cancelled</span><span class="legend-val">${a.cancelled}</span></div>
            </div>
          </div>
        </div>

        <!-- Car popularity -->
        <div class="chart-card full">
          <div class="chart-card-title"><i class="fa-solid fa-car"></i> Bookings by Vehicle</div>
          <div class="pop-bar-list">
            ${Object.entries(carNames).map(([id, name]) => {
              const count = a.byCar[id] || 0;
              const pct   = Math.round((count / maxByCar) * 100);
              return `<div class="pop-bar-row">
                <div class="pop-bar-name">${name}</div>
                <div class="pop-bar-track"><div class="pop-bar-fill" style="width:${pct}%"></div></div>
                <div class="pop-bar-count">${count}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    renderBarChart('anaBarChart', a.last7);
  }

  /* ────────────────────────────────────────
     ACTIVITY LOG PAGE
  ──────────────────────────────────────── */
  function renderLog(el) {
    const logs = LCR_DB.getLog();
    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>Activity Log</h1><p>${logs.length} events recorded</p></div>
        <div class="page-header-actions">
          <button class="btn-ghost-sm" onclick="adminApp.clearLog()"><i class="fa-solid fa-trash"></i> Clear Log</button>
        </div>
      </div>
      <div class="table-card">
        <div class="table-card-header">
          <div class="table-card-title"><i class="fa-solid fa-list-ul"></i> System Events</div>
        </div>
        <div class="log-list" style="padding:8px 0">
          ${logs.length === 0 ? `<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-list-ul"></i></div><h3>No activity yet</h3><p>Events will appear here as you use the system.</p></div>` :
          logs.map(l => `
            <div class="log-item">
              <div class="log-icon ${logIconClass(l.type)}"><i class="fa-solid ${logIcon(l.type)}"></i></div>
              <div class="log-body">
                <div class="log-msg">${l.message}</div>
                <div class="log-time">${new Date(l.ts).toLocaleString()} · ${timeAgo(l.ts)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function clearLog() {
    confirm('Clear Log', 'Are you sure you want to clear all activity log entries?', 'Clear', '', () => {
      localStorage.removeItem('lcr_admin_log');
      toast('Log Cleared', 'Activity log has been cleared.', 'amber');
      renderPage('log');
    });
  }

  /* ────────────────────────────────────────
     SETTINGS PAGE
  ──────────────────────────────────────── */
  function renderSettings(el) {
    const s   = LCR_DB.getSettings();
    const pic = localStorage.getItem('lcr_admin_avatar') || '';
    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left"><h1>Settings</h1><p>Configure your rental system</p></div>
        <div class="page-header-actions">
          <button class="btn-primary-sm" onclick="adminApp.saveSettings()"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
        </div>
      </div>
      <div class="settings-grid">

        <!-- Profile Picture -->
        <div class="settings-card full">
          <div class="settings-card-title"><i class="fa-solid fa-circle-user"></i> Admin Profile</div>
          <div class="profile-pic-section">
            <div class="profile-pic-preview-wrap">
              ${pic
                ? `<img id="profilePicPreview" src="${pic}" alt="Profile" class="profile-pic-preview">`
                : `<div id="profilePicPreview" class="profile-pic-placeholder"><i class="fa-solid fa-user"></i></div>`
              }
              <div class="profile-pic-overlay" onclick="document.getElementById('profilePicInput').click()">
                <i class="fa-solid fa-camera"></i>
                <span>Change Photo</span>
              </div>
            </div>
            <div class="profile-pic-info">
              <h4 id="profileNameDisplay">${s.adminName || 'Administrator'}</h4>
              <p>Super Admin · Lee Car Rental</p>
              <input type="file" id="profilePicInput" accept="image/*" style="display:none" onchange="adminApp.handleProfilePicUpload(this)">
              <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
                <button class="btn-primary-sm" onclick="document.getElementById('profilePicInput').click()">
                  <i class="fa-solid fa-upload"></i> Upload Photo
                </button>
                ${pic ? `<button class="btn-ghost-sm" onclick="adminApp.removeProfilePic()"><i class="fa-solid fa-trash"></i> Remove</button>` : ''}
              </div>
              <p style="font-size:0.72rem;color:var(--text-3);margin-top:8px">JPG, PNG or GIF · Max 2MB · Will be shown in sidebar &amp; topbar</p>
            </div>
          </div>
          <div class="settings-field" style="margin-top:16px;max-width:320px">
            <label>Admin Display Name</label>
            <input id="s-admin-name" class="settings-input" value="${s.adminName || 'Administrator'}" placeholder="Your display name">
          </div>
        </div>

        <!-- Business Info -->
        <div class="settings-card">
          <div class="settings-card-title"><i class="fa-solid fa-building"></i> Business Information</div>
          <div class="settings-field">
            <label>Business Name</label>
            <input id="s-name" class="settings-input" value="${s.businessName}">
          </div>
          <div class="settings-field">
            <label>Phone Number</label>
            <input id="s-phone" class="settings-input" value="${s.phone}">
          </div>
          <div class="settings-field">
            <label>Email Address</label>
            <input id="s-email" class="settings-input" type="email" value="${s.email}">
          </div>
        </div>

        <!-- Security -->
        <div class="settings-card">
          <div class="settings-card-title"><i class="fa-solid fa-lock"></i> Security</div>
          <div class="settings-field">
            <label>Current PIN</label>
            <input id="s-pin-old" class="settings-input" type="password" placeholder="Current PIN">
          </div>
          <div class="settings-field">
            <label>New PIN</label>
            <input id="s-pin-new" class="settings-input" type="password" placeholder="New 4-digit PIN" maxlength="4">
          </div>
          <div class="settings-field">
            <label>Confirm New PIN</label>
            <input id="s-pin-conf" class="settings-input" type="password" placeholder="Repeat new PIN" maxlength="4">
          </div>
          <button class="btn-primary-sm" onclick="adminApp.changePIN()" style="margin-top:4px">
            <i class="fa-solid fa-key"></i> Change PIN
          </button>
        </div>

        <!-- Booking Options -->
        <div class="settings-card full">
          <div class="settings-card-title"><i class="fa-solid fa-sliders"></i> Booking Options</div>
          <div class="settings-toggle-row">
            <div class="settings-toggle-info">
              <strong>Auto-Approve Bookings</strong>
              <span>Automatically approve new booking requests without manual review</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="s-auto-approve" ${s.autoApprove ? 'checked' : ''}>
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </label>
          </div>
          <div class="settings-toggle-row">
            <div class="settings-toggle-info">
              <strong>Require Deposit</strong>
              <span>Require customers to pay a percentage deposit upfront</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="s-req-deposit" ${s.requireDeposit ? 'checked' : ''}>
              <div class="toggle-track"><div class="toggle-thumb"></div></div>
            </label>
          </div>
          <div class="settings-toggle-row">
            <div class="settings-toggle-info">
              <strong>Deposit Percentage</strong>
              <span>Percentage of total rental cost required as deposit</span>
            </div>
            <div>
              <select id="s-deposit-pct" class="settings-select" style="width:100px">
                ${[10,15,20,25,30,40,50].map(p => `<option value="${p}" ${s.depositPercent===p?'selected':''}>${p}%</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Currency Switcher — standalone full card -->
        <div class="settings-card full">
          <div class="settings-card-title"><i class="fa-solid fa-coins"></i> Currency Settings</div>
          <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:20px;line-height:1.6">
            Set the display currency for all booking prices and totals across the admin dashboard.
            <strong>USD is the base currency.</strong> ZiG and Rands use live conversion rates.
          </p>

          <!-- 3 currency cards: USD, ZiG, Rands -->
          <div class="currency-card-grid">

            <div class="currency-card ${s.currency==='USD'?'active':''}" onclick="adminApp.switchCurrency('USD')">
              <div class="currency-card-flag">🇺🇸</div>
              <div class="currency-card-code">USD</div>
              <div class="currency-card-name">US Dollar</div>
              <div class="currency-card-rate">Base currency</div>
              ${s.currency==='USD' ? '<div class="currency-card-badge"><i class="fa-solid fa-circle-check"></i> Active</div>' : ''}
            </div>

            <div class="currency-card ${s.currency==='ZiG'?'active':''}" onclick="adminApp.switchCurrency('ZiG')">
              <div class="currency-card-flag">🇿🇼</div>
              <div class="currency-card-code">ZiG</div>
              <div class="currency-card-name">Zimbabwe Gold</div>
              <div class="currency-card-rate">1 USD ≈ 13.56 ZiG</div>
              ${s.currency==='ZiG' ? '<div class="currency-card-badge"><i class="fa-solid fa-circle-check"></i> Active</div>' : ''}
            </div>

            <div class="currency-card ${s.currency==='Rands'?'active':''}" onclick="adminApp.switchCurrency('Rands')">
              <div class="currency-card-flag">🇿🇦</div>
              <div class="currency-card-code">ZAR</div>
              <div class="currency-card-name">South African Rand</div>
              <div class="currency-card-rate">1 USD ≈ 18.20 ZAR</div>
              ${s.currency==='Rands' ? '<div class="currency-card-badge"><i class="fa-solid fa-circle-check"></i> Active</div>' : ''}
            </div>

          </div>

          <!-- Current rate info -->
          <div class="currency-rate-info" id="currencyRateInfo">
            ${getCurrencyRateInfo(s.currency)}
          </div>

          <p style="font-size:0.72rem;color:var(--text-3);margin-top:12px">
            <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b"></i>
            Exchange rates are approximate. Actual rates may vary. USD is always the settlement currency.
          </p>
        </div>

        <!-- Danger zone -->
        <div class="settings-card full" style="border-color:#fca5a5">
          <div class="settings-card-title" style="color:#dc2626"><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn-ghost-sm" style="border-color:#fca5a5;color:#dc2626" onclick="adminApp.resetAllData()">
              <i class="fa-solid fa-trash"></i> Reset All Data
            </button>
            <button class="btn-ghost-sm" onclick="adminApp.exportCSV()">
              <i class="fa-solid fa-download"></i> Export Bookings CSV
            </button>
          </div>
        </div>

      </div>
    `;
  }

  function saveSettings() {
    const s = LCR_DB.getSettings();
    s.businessName   = document.getElementById('s-name')?.value || s.businessName;
    s.phone          = document.getElementById('s-phone')?.value || s.phone;
    s.email          = document.getElementById('s-email')?.value || s.email;
    s.autoApprove    = document.getElementById('s-auto-approve')?.checked || false;
    s.requireDeposit = document.getElementById('s-req-deposit')?.checked || false;
    s.depositPercent = parseInt(document.getElementById('s-deposit-pct')?.value) || 30;
    // Currency is now handled by switchCurrency() — no select element to read
    s.adminName      = document.getElementById('s-admin-name')?.value || s.adminName || 'Administrator';
    LCR_DB.saveSettings(s);
    loadAdminName();
    toast('Settings Saved', 'Your settings have been updated.', 'green');
  }

  /* ── Profile picture upload ── */
  function handleProfilePicUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('File Too Large', 'Please choose an image under 2MB.', 'red');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      localStorage.setItem('lcr_admin_avatar', dataUrl);
      loadProfilePicture();
      // Update preview in settings page immediately
      const preview = document.getElementById('profilePicPreview');
      if (preview) {
        if (preview.tagName === 'DIV') {
          // Replace placeholder with img
          const img = document.createElement('img');
          img.id        = 'profilePicPreview';
          img.src       = dataUrl;
          img.alt       = 'Profile';
          img.className = 'profile-pic-preview';
          preview.replaceWith(img);
        } else {
          preview.src = dataUrl;
        }
      }
      toast('Photo Updated', 'Your profile picture has been saved.', 'green');
      // Re-render settings to show remove button
      setTimeout(() => renderPage('settings'), 800);
    };
    reader.readAsDataURL(file);
  }

  function removeProfilePic() {
    localStorage.removeItem('lcr_admin_avatar');
    loadProfilePicture();
    toast('Photo Removed', 'Profile picture cleared.', 'amber');
    renderPage('settings');
  }

  function changePIN() {
    const s       = LCR_DB.getSettings();
    const old_pin = document.getElementById('s-pin-old')?.value;
    const new_pin = document.getElementById('s-pin-new')?.value;
    const conf    = document.getElementById('s-pin-conf')?.value;
    if (old_pin !== s.adminPin) { toast('Error', 'Current PIN is incorrect.', 'red'); return; }
    if (!new_pin || new_pin.length < 4) { toast('Error', 'New PIN must be 4 digits.', 'red'); return; }
    if (new_pin !== conf) { toast('Error', 'PINs do not match.', 'red'); return; }
    s.adminPin = new_pin;
    LCR_DB.saveSettings(s);
    toast('PIN Changed', 'Admin PIN updated successfully.', 'green');
    document.getElementById('s-pin-old').value = '';
    document.getElementById('s-pin-new').value = '';
    document.getElementById('s-pin-conf').value = '';
  }

  function resetAllData() {
    confirm('Reset All Data', 'This will DELETE all bookings, fleet settings, and logs permanently. This cannot be undone.', 'Reset Everything', '', () => {
      ['lcr_bookings','lcr_fleet_status','lcr_customers','lcr_settings','lcr_admin_log'].forEach(k => localStorage.removeItem(k));
      toast('Data Reset', 'All data has been cleared.', 'amber');
      logout();
    });
  }

  /* ── Export CSV ── */
  function exportCSV() {
    const bookings = LCR_DB.getBookings();
    const headers  = ['Reference','Status','Customer','Email','Phone','Vehicle','Pickup Date','Return Date','Days','Total','Created'];
    const rows     = bookings.map(b => [
      b.ref, b.status, b.fullName, b.email, b.phone,
      b.carName, b.pickupDate, b.returnDate, b.totalDays, `$${b.totalPrice}`,
      new Date(b.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `lcr-bookings-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast('Exported', 'Bookings exported as CSV.', 'green');
  }

  /* ══════════════════════════════════════════
     CHART HELPERS
  ══════════════════════════════════════════ */
  function renderBarChart(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el || !data) return;
    const max = Math.max(1, ...data.map(d => d.count));
    el.innerHTML = data.map(d => {
      const h = Math.round((d.count / max) * 140);
      return `<div class="bar-item">
        <div class="bar-fill" style="height:${Math.max(4, h)}px">
          <div class="bar-tooltip">${d.count} booking${d.count!==1?'s':''}</div>
        </div>
        <div class="bar-label">${d.date}</div>
      </div>`;
    }).join('');
  }

  function renderDonut(a) {
    const total = a.total || 1;
    const segs  = [
      { val: a.pending,   color: '#f59e0b' },
      { val: a.approved,  color: '#10b981' },
      { val: a.completed, color: '#4169E1' },
      { val: a.cancelled, color: '#ef4444' },
    ];
    const r = 44, cx = 50, cy = 50, stroke = 14;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const paths = segs.map(s => {
      const pct    = s.val / total;
      const dash   = pct * circ;
      const gap    = circ - dash;
      const path   = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none" stroke="${s.color}" stroke-width="${stroke}"
        stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += dash;
      return path;
    });
    return `<svg class="donut-svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0f1f5" stroke-width="${stroke}"/>
      ${paths.join('')}
      <text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="800" fill="#0d1b2a">${total}</text>
      <text x="${cx}" y="${cy+14}" text-anchor="middle" font-size="7" fill="#9ca3af">total</text>
    </svg>`;
  }

  /* ══════════════════════════════════════════
     UTILITY HELPERS
  ══════════════════════════════════════════ */
  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60)  return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  function highlight(text, query) {
    if (!query) return text;
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark class="search-hl">$1</mark>');
  }

  function logIconClass(type) {
    if (type === 'BOOKING_CREATED') return 'booking';
    if (type === 'STATUS_CHANGE')   return 'status';
    if (type === 'FLEET_UPDATE')    return 'fleet';
    return 'settings';
  }
  function logIcon(type) {
    if (type === 'BOOKING_CREATED') return 'fa-calendar-plus';
    if (type === 'STATUS_CHANGE')   return 'fa-rotate';
    if (type === 'FLEET_UPDATE')    return 'fa-car';
    return 'fa-gear';
  }

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      document.getElementById('adminConfirmOverlay').classList.remove('open');
    }
  });

  /* ── Auto-refresh badge every 30s ── */
  setInterval(updateNotifBadge, 30000);

  /* ── Boot ── */
  initLogin();

  /* ── Public API ── */
  /* ══════════════════════════════════════════
     CURRENCY SYSTEM
     USD is base. ZiG and Rands use fixed rates.
     switchCurrency() saves choice and refreshes
     all price displays in the dashboard.
  ══════════════════════════════════════════ */

  /* Exchange rates (USD as base, 1 USD = X) */
  const CURRENCY_RATES = {
    USD:   { symbol: '$',    rate: 1,     code: 'USD',   name: 'US Dollar',          flag: '🇺🇸' },
    ZiG:   { symbol: 'ZiG ', rate: 13.56, code: 'ZiG',   name: 'Zimbabwe Gold',      flag: '🇿🇼' },
    Rands: { symbol: 'R',    rate: 18.20, code: 'ZAR',   name: 'South African Rand', flag: '🇿🇦' },
  };

  /* Convert a USD amount to the current display currency */
  function convertCurrency(amountUSD) {
    const s    = LCR_DB.getSettings();
    const curr = CURRENCY_RATES[s.currency] || CURRENCY_RATES.USD;
    const val  = (amountUSD * curr.rate);
    // Format with 2 decimal places, remove trailing .00 for whole numbers
    const formatted = val % 1 === 0 ? val.toLocaleString() : val.toFixed(2);
    return curr.symbol + formatted;
  }

  /* Get the current currency symbol */
  function getCurrencySymbol() {
    const s = LCR_DB.getSettings();
    return (CURRENCY_RATES[s.currency] || CURRENCY_RATES.USD).symbol;
  }

  /* Rate info string for the settings card */
  function getCurrencyRateInfo(currency) {
    const curr = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    if (currency === 'USD') {
      return `<div class="currency-active-info">
        <i class="fa-solid fa-circle-check" style="color:#10b981"></i>
        <strong>Active: US Dollar (USD)</strong>
        <span>All prices shown in USD — the base currency. No conversion applied.</span>
      </div>`;
    }
    return `<div class="currency-active-info">
      <i class="fa-solid fa-arrows-rotate" style="color:#4169E1"></i>
      <strong>Active: ${curr.name} (${curr.code})</strong>
      <span>All USD prices multiplied by <strong>${curr.rate}</strong>. Example: $45 USD = ${curr.symbol}${(45*curr.rate).toFixed(0)} ${curr.code}</span>
    </div>`;
  }

  /* ── Switch currency and immediately refresh the page ── */
  function switchCurrency(currencyCode) {
    if (!CURRENCY_RATES[currencyCode]) return;
    const s = LCR_DB.getSettings();
    const prev = s.currency;
    if (prev === currencyCode) return; // already active

    s.currency = currencyCode;
    LCR_DB.saveSettings(s);

    const curr = CURRENCY_RATES[currencyCode];
    toast(
      `Currency: ${curr.flag} ${curr.name}`,
      currencyCode === 'USD'
        ? 'Prices now shown in US Dollars (base currency).'
        : `Prices converted at 1 USD = ${curr.rate} ${curr.code}.`,
      'green'
    );

    // Re-render settings page to update active card state
    renderPage('settings');
  }

  /* Apply currency to a price display string */
  function applyCurrencyToAll(usdAmount) {
    return convertCurrency(usdAmount);
  }

  /* ══════════════════════════════════════════
     CAR MANAGEMENT — DB helpers
  ══════════════════════════════════════════ */
  function getCarsDB() {
    const stored = localStorage.getItem('lcr_cars_db');
    if (stored) return JSON.parse(stored);
    // Seed with the default 6 cars
    const defaults = [
      {
        id:'camry', name:'Toyota Camry', category:'sedan', subtitle:'Mid-Size Sedan · 2023 Model',
        price:45, badge:'Popular', badgeColor:'#f59e0b', available:true, desc:'',
        seats:'5 Adults', transmission:'Automatic', fuel:'Petrol', engine:'2.5L 4-Cylinder',
        luggage:'3 Large Bags', drive:'Front-Wheel Drive',
        weeklyNote:'Save $35 vs daily rate', monthlyPrice:900, monthlyNote:'Best long-term value',
        features:['Apple CarPlay & Android Auto','Adaptive Cruise Control','Lane Departure Warning','Pre-Collision Safety System','Wireless Phone Charging','Leather-Trimmed Seats'],
        images:[
          { url:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1400&q=85', label:'Exterior' },
          { url:'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=1400&q=85', label:'Dashboard' },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id:'explorer', name:'Ford Explorer', category:'suv', subtitle:'Full-Size SUV · 2023 Model',
        price:75, badge:'Family Choice', badgeColor:'#f59e0b', available:true, desc:'',
        seats:'7 Adults', transmission:'Automatic', fuel:'Diesel', engine:'3.0L EcoBoost V6',
        luggage:'5 Large Bags', drive:'All-Wheel Drive',
        weeklyNote:'Save $55 vs daily rate', monthlyPrice:1500, monthlyNote:'Best long-term value',
        features:['3rd Row Seating','SYNC 4 Infotainment 13.2"','Adaptive Cruise Control','Ford Co-Pilot360','Terrain Management System','Panoramic Vista Roof'],
        images:[{ url:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1400&q=85', label:'Exterior' }],
        createdAt: new Date().toISOString(),
      },
      {
        id:'mercedes', name:'Mercedes-Benz C300', category:'luxury', subtitle:'Luxury Sedan · 2024 Model',
        price:120, badge:'Premium', badgeColor:'#8b5cf6', available:true, desc:'',
        seats:'5 Adults', transmission:'9G-TRONIC Auto', fuel:'Petrol', engine:'2.0L Turbo I4',
        luggage:'3 Large Bags', drive:'4MATIC All-Wheel',
        weeklyNote:'Save $90 vs daily rate', monthlyPrice:2400, monthlyNote:'Best long-term value',
        features:['MBUX Multimedia System','Burmester® Surround Sound','Heated & Ventilated Seats','Massage Function','Ambient Lighting 64 Colours','KEYLESS GO'],
        images:[{ url:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1400&q=85', label:'Exterior' }],
        createdAt: new Date().toISOString(),
      },
      {
        id:'tesla', name:'Tesla Model 3', category:'electric', subtitle:'Electric Sedan · 2024 Model',
        price:95, badge:'New', badgeColor:'#ef4444', available:true, desc:'',
        seats:'5 Adults', transmission:'Single-Speed Auto', fuel:'Electric', engine:'570 km range',
        luggage:'2 Large Bags + Frunk', drive:'Rear-Wheel Drive',
        weeklyNote:'Save $70 vs daily rate', monthlyPrice:1900, monthlyNote:'Best long-term value',
        features:['15.4" Cinematic Touchscreen','Autopilot','OTA Updates','Sentry Mode & Dashcam','0–100 km/h in 3.1s','Premium 17-Speaker Audio'],
        images:[{ url:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1400&q=85', label:'Exterior' }],
        createdAt: new Date().toISOString(),
      },
      {
        id:'bmw', name:'BMW X5', category:'suv', subtitle:'Luxury SUV · 2023 Model',
        price:140, badge:'Luxury', badgeColor:'#4169E1', available:true, desc:'',
        seats:'5 Adults', transmission:'8-Speed Steptronic', fuel:'Petrol', engine:'3.0L TwinPower Turbo I6',
        luggage:'4 Large Bags', drive:'xDrive All-Wheel',
        weeklyNote:'Save $105 vs daily rate', monthlyPrice:2800, monthlyNote:'Best long-term value',
        features:['BMW Live Cockpit Pro','Harman Kardon Sound','Panoramic Sunroof','Driving Assistant Pro','Heated Front & Rear Seats','BMW Head-Up Display'],
        images:[{ url:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85', label:'Exterior' }],
        createdAt: new Date().toISOString(),
      },
      {
        id:'civic', name:'Honda Civic', category:'sedan', subtitle:'Compact Sedan · 2023 Model',
        price:35, badge:'Economy', badgeColor:'#10b981', available:true, desc:'',
        seats:'5 Adults', transmission:'Manual', fuel:'Petrol', engine:'1.5L VTEC Turbo',
        luggage:'2 Large Bags', drive:'Front-Wheel Drive',
        weeklyNote:'Save $35 vs daily rate', monthlyPrice:700, monthlyNote:'Best long-term value',
        features:['Honda Sensing Safety Suite','9" Touchscreen CarPlay','Lane Keeping Assist','Auto Emergency Braking','Adaptive Cruise Control','Backup Camera'],
        images:[{ url:'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1400&q=85', label:'Exterior' }],
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('lcr_cars_db', JSON.stringify(defaults));
    return defaults;
  }
  function saveCarsDB(cars) { localStorage.setItem('lcr_cars_db', JSON.stringify(cars)); }
  function genCarId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12) + '_' + Date.now().toString(36);
  }

  /* ────────────────────────────────────────
     CARS PAGE
  ──────────────────────────────────────── */
  function renderCars(el) {
    const cars = getCarsDB();
    const catColors = { sedan:'#4169E1', suv:'#f59e0b', luxury:'#8b5cf6', electric:'#10b981', truck:'#ef4444', minivan:'#0d9488' };

    el.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Manage Cars</h1>
          <p>${cars.length} vehicle${cars.length !== 1 ? 's' : ''} in the system</p>
        </div>
        <div class="page-header-actions">
          <button class="btn-primary-sm" onclick="adminApp.openCarForm()">
            <i class="fa-solid fa-plus"></i> Add New Car
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="table-filter-row" style="margin-bottom:20px;background:transparent;padding:0;border:none">
        ${['all','sedan','suv','luxury','electric','truck','minivan'].map(cat =>
          `<button class="filter-chip ${cat==='all'?'active':''}" onclick="adminApp.filterCars('${cat}', this)">${cat==='all'?'All':cat.charAt(0).toUpperCase()+cat.slice(1)}</button>`
        ).join('')}
      </div>

      <div class="car-mgmt-grid" id="carMgmtGrid">
        ${cars.length === 0
          ? `<div class="empty-state" style="grid-column:1/-1">
               <div class="empty-state-icon"><i class="fa-solid fa-car"></i></div>
               <h3>No vehicles yet</h3>
               <p>Click "Add New Car" to add your first vehicle.</p>
             </div>`
          : cars.map(c => renderCarMgmtCard(c, catColors)).join('')
        }
      </div>
    `;
  }

  function renderCarMgmtCard(c, catColors) {
    const mainImg = c.images && c.images.length > 0 ? c.images[0].url : '';
    const catColor = (catColors || {})[c.category] || '#4169E1';
    return `
      <div class="car-mgmt-card" data-cat="${c.category}">
        <div class="car-mgmt-img-wrap">
          ${mainImg
            ? `<img class="car-mgmt-img" src="${mainImg}" alt="${c.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : ''
          }
          <div class="car-mgmt-img-placeholder" ${mainImg ? 'style="display:none"' : ''}>
            <i class="fa-solid fa-car"></i>
            <span>No Image</span>
          </div>
          <span class="car-mgmt-status-dot ${c.available ? 'available':'unavailable'}">
            ${c.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div class="car-mgmt-body">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px">
            <div class="car-mgmt-name">${c.name}</div>
            ${c.badge ? `<span style="background:${c.badgeColor||'#4169E1'}20;color:${c.badgeColor||'#4169E1'};border:1px solid ${c.badgeColor||'#4169E1'}40;font-size:0.65rem;font-weight:800;padding:2px 8px;border-radius:999px;white-space:nowrap">${c.badge}</span>` : ''}
          </div>
          <div class="car-mgmt-cat">
            <span style="background:${catColor}15;color:${catColor};padding:2px 8px;border-radius:999px;font-size:0.7rem;font-weight:700">${c.category}</span>
            ${c.subtitle ? `<span style="color:var(--text-3);font-size:0.72rem;margin-left:6px">${c.subtitle}</span>` : ''}
          </div>
          <div class="car-mgmt-price-row">
            <div class="car-mgmt-price">${convertCurrency(c.price)}<span>/day</span></div>
            <div style="font-size:0.72rem;color:var(--text-3)">${c.images?.length||0} photo${c.images?.length!==1?'s':''} · ${c.features?.length||0} features</div>
          </div>
          <div class="car-mgmt-actions">
            <button class="car-mgmt-btn car-mgmt-btn-edit"   onclick="adminApp.openCarForm('${c.id}')">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="car-mgmt-btn car-mgmt-btn-delete" onclick="adminApp.deleteCarConfirm('${c.id}', '${c.name}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function filterCars(cat, btn) {
    document.querySelectorAll('.table-filter-row .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#carMgmtGrid .car-mgmt-card').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
    });
  }

  /* ── Car Form ── */
  let _editingCarId = null;
  let _imgRows = [];
  let _featureRows = [];

  function openCarForm(carId) {
    _editingCarId = carId || null;
    _imgRows     = [];
    _featureRows = [];

    const overlay = document.getElementById('carFormOverlay');
    const title   = document.getElementById('carFormTitle');

    if (carId) {
      title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Vehicle';
      const car = getCarsDB().find(c => c.id === carId);
      if (car) populateCarForm(car);
    } else {
      title.innerHTML = '<i class="fa-solid fa-car-on"></i> Add New Vehicle';
      clearCarForm();
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCarForm() {
    document.getElementById('carFormOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function clearCarForm() {
    ['cfCarId','cfName','cfSubtitle','cfBadge','cfSeats','cfEngine',
     'cfLuggage','cfWeeklyNote','cfMonthlyNote'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const priceEl = document.getElementById('cfPrice');
    if (priceEl) priceEl.value = '';
    const monthlyEl = document.getElementById('cfMonthlyPrice');
    if (monthlyEl) monthlyEl.value = '';
    const availEl = document.getElementById('cfAvailable');
    if (availEl) availEl.value = 'true';
    _imgRows = [{ url:'', label:'Exterior' }];
    _featureRows = [''];
    renderImgRows();
    renderFeatureRows();
  }

  function populateCarForm(car) {
    document.getElementById('cfCarId').value        = car.id;
    document.getElementById('cfName').value         = car.name || '';
    document.getElementById('cfSubtitle').value     = car.subtitle || '';
    document.getElementById('cfBadge').value        = car.badge || '';
    document.getElementById('cfSeats').value        = car.seats || '';
    document.getElementById('cfEngine').value       = car.engine || '';
    document.getElementById('cfLuggage').value      = car.luggage || '';
    document.getElementById('cfPrice').value        = car.price || '';
    document.getElementById('cfWeeklyNote').value   = car.weeklyNote || '';
    document.getElementById('cfMonthlyPrice').value = car.monthlyPrice || '';
    document.getElementById('cfMonthlyNote').value  = car.monthlyNote || '';
    document.getElementById('cfAvailable').value    = car.available ? 'true' : 'false';

    // Select fields
    const catEl = document.getElementById('cfCategory');
    if (catEl) catEl.value = car.category || '';
    const transEl = document.getElementById('cfTransmission');
    if (transEl) transEl.value = car.transmission || 'Automatic';
    const fuelEl = document.getElementById('cfFuel');
    if (fuelEl) fuelEl.value = car.fuel || 'Petrol';
    const driveEl = document.getElementById('cfDrive');
    if (driveEl) driveEl.value = car.drive || 'Front-Wheel Drive';

    _imgRows     = (car.images || []).map(i => ({ url: i.url || '', label: i.label || 'Exterior' }));
    _featureRows = (car.features || []).map(f => f);
    if (_imgRows.length === 0)     _imgRows     = [{ url:'', label:'Exterior' }];
    if (_featureRows.length === 0) _featureRows = [''];
    renderImgRows();
    renderFeatureRows();
  }

  /* ── Render image rows with URL input + file upload option ── */
  function renderImgRows() {
    const list = document.getElementById('cfImageList');
    if (!list) return;
    list.innerHTML = _imgRows.map((row, i) => `
      <div class="img-url-row-wrap" id="imgRow${i}">

        <!-- Preview thumbnail -->
        <div class="img-url-thumb-wrap">
          <img class="img-url-preview" id="imgPreview${i}"
            src="${row.url || ''}" alt=""
            onerror="this.style.display='none';document.getElementById('imgPlaceholder${i}').style.display='flex'"
            onload="this.style.display='block';document.getElementById('imgPlaceholder${i}').style.display='none'"
            style="${row.url ? '' : 'display:none'}">
          <div class="img-url-placeholder" id="imgPlaceholder${i}" style="${row.url ? 'display:none' : 'display:flex'}">
            <i class="fa-solid fa-image"></i>
          </div>
        </div>

        <!-- URL input + upload button + label + remove -->
        <div class="img-url-fields">
          <div class="img-url-input-row">
            <input type="text" class="car-form-input" value="${row.url}"
              placeholder="Paste image URL or upload below…"
              id="imgUrlInput${i}"
              oninput="adminApp._updateImgRow(${i},'url',this.value)">
            <!-- Hidden file input -->
            <input type="file" accept="image/*" style="display:none"
              id="cfImgUpload${i}"
              onchange="adminApp.handleCarImgUpload(${i}, this)">
            <!-- Upload from computer button -->
            <button type="button" class="img-upload-btn"
              onclick="document.getElementById('cfImgUpload${i}').click()"
              title="Upload from computer">
              <i class="fa-solid fa-upload"></i>
              <span>Upload</span>
            </button>
          </div>
          <input type="text" class="car-form-input" value="${row.label}"
            placeholder="Label e.g. Exterior, Dashboard, Interior"
            oninput="adminApp._updateImgRow(${i},'label',this.value)">
        </div>

        <!-- Remove row button -->
        <button class="img-url-remove" onclick="adminApp.removeImgRow(${i})" title="Remove image">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  /* ── Handle image file upload from computer — converts to base64 data URL ── */
  function handleCarImgUpload(rowIndex, input) {
    const file = input.files[0];
    if (!file) return;

    // Validate size (max 3MB for car images)
    if (file.size > 3 * 1024 * 1024) {
      toast('File Too Large', 'Please use an image under 3MB.', 'red');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      _imgRows[rowIndex].url = dataUrl;

      // Update the URL input field
      const urlInput = document.getElementById('imgUrlInput' + rowIndex);
      if (urlInput) urlInput.value = '(uploaded image)';

      // Show preview
      const preview = document.getElementById('imgPreview' + rowIndex);
      const placeholder = document.getElementById('imgPlaceholder' + rowIndex);
      if (preview) {
        preview.src = dataUrl;
        preview.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';

      toast('Image Uploaded', `Image ${rowIndex + 1} uploaded successfully.`, 'green');
    };
    reader.readAsDataURL(file);
  }

  function addImageRow() {
    _imgRows.push({ url:'', label:'Exterior' });
    renderImgRows();
  }
  function removeImgRow(i) {
    _imgRows.splice(i, 1);
    if (_imgRows.length === 0) _imgRows = [{ url:'', label:'Exterior' }];
    renderImgRows();
  }
  function _updateImgRow(i, field, val) {
    _imgRows[i][field] = val;
    if (field === 'url') {
      const prev = document.getElementById('imgPreview' + i);
      if (prev) { prev.src = val; prev.style.opacity = val ? '1' : '0.3'; }
    }
  }

  function renderFeatureRows() {
    const list = document.getElementById('cfFeaturesList');
    if (!list) return;
    list.innerHTML = _featureRows.map((f, i) => `
      <div class="feature-row">
        <input type="text" class="car-form-input" value="${f}"
          placeholder="e.g. Apple CarPlay & Android Auto"
          oninput="adminApp._updateFeatureRow(${i}, this.value)">
        <button class="img-url-remove" onclick="adminApp.removeFeatureRow(${i})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }
  function addFeatureRow() {
    _featureRows.push('');
    renderFeatureRows();
  }
  function removeFeatureRow(i) {
    _featureRows.splice(i, 1);
    if (_featureRows.length === 0) _featureRows = [''];
    renderFeatureRows();
  }
  function _updateFeatureRow(i, val) { _featureRows[i] = val; }

  function saveCarForm() {
    const name     = document.getElementById('cfName')?.value.trim();
    const category = document.getElementById('cfCategory')?.value;
    const price    = parseFloat(document.getElementById('cfPrice')?.value);

    if (!name)     { toast('Missing Field', 'Car name is required.', 'red'); return; }
    if (!category) { toast('Missing Field', 'Please select a category.', 'red'); return; }
    if (!price || price < 1) { toast('Missing Field', 'Please enter a valid daily price.', 'red'); return; }

    const cars = getCarsDB();
    const isEdit = !!_editingCarId;
    const existingId = document.getElementById('cfCarId')?.value || _editingCarId;

    const carData = {
      id:           isEdit ? existingId : genCarId(name),
      name,
      category,
      subtitle:     document.getElementById('cfSubtitle')?.value.trim() || '',
      price,
      badge:        document.getElementById('cfBadge')?.value.trim() || '',
      badgeColor:   '#4169E1',
      available:    document.getElementById('cfAvailable')?.value === 'true',
      desc:         '',
      seats:        document.getElementById('cfSeats')?.value.trim() || '5 Adults',
      transmission: document.getElementById('cfTransmission')?.value || 'Automatic',
      fuel:         document.getElementById('cfFuel')?.value || 'Petrol',
      engine:       document.getElementById('cfEngine')?.value.trim() || '',
      luggage:      document.getElementById('cfLuggage')?.value.trim() || '',
      drive:        document.getElementById('cfDrive')?.value || 'Front-Wheel Drive',
      weeklyNote:   document.getElementById('cfWeeklyNote')?.value.trim() || `Save $${Math.round(price*7*0.1)} vs daily rate`,
      monthlyPrice: parseFloat(document.getElementById('cfMonthlyPrice')?.value) || Math.round(price * 25),
      monthlyNote:  document.getElementById('cfMonthlyNote')?.value.trim() || 'Best long-term value',
      images:       _imgRows.filter(r => r.url.trim() !== ''),
      features:     _featureRows.filter(f => f.trim() !== ''),
      createdAt:    isEdit ? (cars.find(c=>c.id===existingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    };

    if (isEdit) {
      const idx = cars.findIndex(c => c.id === existingId);
      if (idx !== -1) cars[idx] = carData;
      else cars.unshift(carData);
    } else {
      cars.unshift(carData);
    }

    saveCarsDB(cars);
    // Also update fleet availability
    LCR_DB.updateFleetCar(carData.id, { available: carData.available, notes: '' });
    closeCarForm();
    toast(isEdit ? 'Car Updated' : 'Car Added', `${name} has been ${isEdit ? 'updated' : 'added'} successfully.`, 'green');
    renderPage('cars');
  }

  function deleteCarConfirm(carId, carName) {
    confirm('Delete Vehicle', `Permanently delete "${carName}" from the system? All associated data will remain but this car will no longer appear.`, 'Delete', '', () => {
      const cars = getCarsDB().filter(c => c.id !== carId);
      saveCarsDB(cars);
      toast('Car Deleted', `${carName} removed from the fleet.`, 'amber');
      renderPage('cars');
    });
  }

  /* ── Car form keyboard close ── */
  document.getElementById('carFormOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('carFormOverlay')) closeCarForm();
  });

  return {
    navigate, refreshPage, openSidebar, closeSidebar, logout,
    openDrawer, closeDrawer,
    approveBooking, rejectBooking, completeBooking, cancelBookingAdmin,
    saveAdminNote, markPaid,
    toggleCar, editFleetNote,
    setFilter, gotoPage,
    saveSettings, changePIN, resetAllData, exportCSV, clearLog,
    handleProfilePicUpload, removeProfilePic,
    openCarForm, closeCarForm, saveCarForm,
    addImageRow, removeImgRow, _updateImgRow, handleCarImgUpload,
    addFeatureRow, removeFeatureRow, _updateFeatureRow,
    deleteCarConfirm, filterCars,
    switchCurrency, convertCurrency, getCurrencySymbol,
    _search,
  };

})();

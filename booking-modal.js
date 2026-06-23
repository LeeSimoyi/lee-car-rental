/* ═══════════════════════════════════════════════════════════════
   LCR BOOKING MODAL — Multi-step booking wizard
   Steps: 1) Car & Dates  2) Personal Info  3) Review  4) Confirm
═══════════════════════════════════════════════════════════════ */

const BookingModal = (() => {

  let currentStep = 1;
  let bookingData = {};
  const TOTAL_STEPS = 4;

  /* ── Car price map ── */
  const CAR_PRICES = {
    camry: 45, explorer: 75, mercedes: 120,
    tesla: 95, bmw: 140, civic: 35,
  };
  const CAR_NAMES = {
    camry: 'Toyota Camry', explorer: 'Ford Explorer',
    mercedes: 'Mercedes-Benz C300', tesla: 'Tesla Model 3',
    bmw: 'BMW X5', civic: 'Honda Civic',
  };
  const CAR_IMAGES = {
    camry:    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80',
    explorer: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
    mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80',
    tesla:    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80',
    bmw:      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80',
    civic:    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&q=80',
  };

  function daysBetween(a, b) {
    return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function calcTotals(carId, pickup, ret) {
    const days  = daysBetween(pickup, ret);
    const rate  = CAR_PRICES[carId] || 45;
    const total = days * rate;
    const dep   = Math.round(total * (LCR_DB.getSettings().depositPercent / 100));
    return { days, rate, total, dep };
  }

  /* ── Open modal ── */
  function open(carId) {
    bookingData = { carId: carId || '' };
    currentStep = 1;

    const overlay = document.getElementById('bookingModalOverlay');
    if (!overlay) { createModal(); }

    // Pre-select car if passed
    if (carId) {
      const sel = document.getElementById('bm-car-select');
      if (sel) sel.value = carId;
    }

    renderStep(1);
    document.getElementById('bookingModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const overlay = document.getElementById('bookingModalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Create modal DOM ── */
  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'bookingModalOverlay';
    overlay.className = 'bm-overlay';
    overlay.innerHTML = `
      <div class="bm-modal" id="bookingModal">
        <div class="bm-header">
          <div class="bm-header-left">
            <div class="bm-logo"><span>LCR</span></div>
            <div>
              <div class="bm-header-title">Book Your Vehicle</div>
              <div class="bm-header-sub">Secure online reservation</div>
            </div>
          </div>
          <button class="bm-close" id="bmClose" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="bm-progress">
          <div class="bm-progress-bar-track">
            <div class="bm-progress-bar" id="bmProgressBar"></div>
          </div>
          <div class="bm-steps" id="bmSteps">
            <div class="bm-step" data-step="1"><span>1</span><label>Vehicle</label></div>
            <div class="bm-step" data-step="2"><span>2</span><label>Details</label></div>
            <div class="bm-step" data-step="3"><span>3</span><label>Review</label></div>
            <div class="bm-step" data-step="4"><span>4</span><label>Done</label></div>
          </div>
        </div>

        <!-- Content area -->
        <div class="bm-content" id="bmContent"></div>

        <!-- Footer nav -->
        <div class="bm-footer" id="bmFooter">
          <button class="bm-btn-back" id="bmBack"><i class="fa-solid fa-arrow-left"></i> Back</button>
          <button class="bm-btn-next" id="bmNext">Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('bmClose').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.getElementById('bmBack').addEventListener('click', prevStep);
    document.getElementById('bmNext').addEventListener('click', nextStep);
  }

  /* ── Render step ── */
  function renderStep(step) {
    currentStep = step;
    updateProgress();

    const content = document.getElementById('bmContent');
    const back    = document.getElementById('bmBack');
    const next    = document.getElementById('bmNext');
    const footer  = document.getElementById('bmFooter');

    back.style.display   = step === 1 ? 'none' : '';
    footer.style.display = step === 4 ? 'none' : '';

    content.innerHTML = '';
    content.classList.remove('bm-slide-in');
    void content.offsetWidth;
    content.classList.add('bm-slide-in');

    if (step === 1) renderStep1(content, next);
    if (step === 2) renderStep2(content, next);
    if (step === 3) renderStep3(content, next);
    if (step === 4) renderStep4(content);
  }

  function updateProgress() {
    const bar = document.getElementById('bmProgressBar');
    if (bar) bar.style.width = `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`;

    document.querySelectorAll('.bm-step').forEach(s => {
      const n = parseInt(s.dataset.step);
      s.classList.toggle('active',    n === currentStep);
      s.classList.toggle('completed', n < currentStep);
    });
  }

  /* ─── STEP 1: Vehicle & Dates ─── */
  function renderStep1(container, nextBtn) {
    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const cars = Object.entries(CAR_NAMES).map(([id, name]) => {
      const avail = LCR_DB.isCarAvailable(id, bookingData.pickupDate || today, bookingData.returnDate || tomorrow);
      return `<option value="${id}" ${!avail ? 'disabled' : ''} ${bookingData.carId === id ? 'selected' : ''}>
        ${name} — $${CAR_PRICES[id]}/day${!avail ? ' (Unavailable)' : ''}
      </option>`;
    }).join('');

    container.innerHTML = `
      <div class="bm-step-content">
        <div class="bm-step-title"><i class="fa-solid fa-car"></i> Choose Your Vehicle & Dates</div>

        <div class="bm-car-preview" id="bmCarPreview">
          ${renderCarPreview(bookingData.carId || 'camry')}
        </div>

        <div class="bm-field">
          <label><i class="fa-solid fa-car-side"></i> Select Vehicle</label>
          <select id="bm-car-select" class="bm-select">
            <option value="">— Choose a vehicle —</option>
            ${cars}
          </select>
        </div>

        <div class="bm-field-row">
          <div class="bm-field">
            <label><i class="fa-solid fa-calendar-days"></i> Pickup Date</label>
            <input type="date" id="bm-pickup" class="bm-input" min="${today}" value="${bookingData.pickupDate || today}">
          </div>
          <div class="bm-field">
            <label><i class="fa-solid fa-calendar-check"></i> Return Date</label>
            <input type="date" id="bm-return" class="bm-input" min="${tomorrow}" value="${bookingData.returnDate || tomorrow}">
          </div>
        </div>

        <div class="bm-field">
          <label><i class="fa-solid fa-location-dot"></i> Pickup Location</label>
          <select id="bm-location" class="bm-select">
            <option value="">— Select location —</option>
            <option ${bookingData.pickupLoc === 'Mutare City Centre' ? 'selected':''}>Mutare City Centre</option>
            <option ${bookingData.pickupLoc === 'Mutare Airport' ? 'selected':''}>Mutare Airport</option>
            <option ${bookingData.pickupLoc === 'Sakubva Bus Terminal' ? 'selected':''}>Sakubva Bus Terminal</option>
            <option ${bookingData.pickupLoc === 'Dangamvura' ? 'selected':''}>Dangamvura</option>
            <option ${bookingData.pickupLoc === 'Greenside' ? 'selected':''}>Greenside</option>
            <option ${bookingData.pickupLoc === 'Hotel Delivery' ? 'selected':''}>Hotel Delivery (+$10)</option>
          </select>
        </div>

        <div id="bm-price-summary" class="bm-price-summary" style="display:none"></div>
      </div>
    `;

    const carSel   = document.getElementById('bm-car-select');
    const pickupEl = document.getElementById('bm-pickup');
    const returnEl = document.getElementById('bm-return');

    function refreshSummary() {
      const cId = carSel.value;
      const pd  = pickupEl.value;
      const rd  = returnEl.value;
      if (cId && pd && rd && rd > pd) {
        const t = calcTotals(cId, pd, rd);
        document.getElementById('bm-price-summary').style.display = '';
        document.getElementById('bm-price-summary').innerHTML = `
          <div class="bm-summary-row"><span>${t.days} day${t.days>1?'s':''} × $${t.rate}/day</span><strong>$${t.total}</strong></div>
          <div class="bm-summary-row deposit"><span>Deposit required (${LCR_DB.getSettings().depositPercent}%)</span><strong>$${t.dep}</strong></div>
        `;
        document.getElementById('bmCarPreview').innerHTML = renderCarPreview(cId);
      } else {
        document.getElementById('bm-price-summary').style.display = 'none';
      }
    }

    carSel.addEventListener('change', refreshSummary);
    pickupEl.addEventListener('change', () => {
      const min = new Date(pickupEl.value);
      min.setDate(min.getDate() + 1);
      returnEl.min = min.toISOString().split('T')[0];
      if (returnEl.value <= pickupEl.value) returnEl.value = min.toISOString().split('T')[0];
      refreshSummary();
    });
    returnEl.addEventListener('change', refreshSummary);
    refreshSummary();

    nextBtn.onclick = () => {
      const carId    = document.getElementById('bm-car-select').value;
      const pickup   = document.getElementById('bm-pickup').value;
      const ret      = document.getElementById('bm-return').value;
      const location = document.getElementById('bm-location').value;

      // ── Step 1 validation: block next if required fields missing ──
      let hasError = false;
      if (!carId)    { showFieldError('bm-car-select', 'Please select a vehicle'); hasError = true; }
      if (!pickup)   { showFieldError('bm-pickup',     'Please select a pickup date'); hasError = true; }
      if (!ret)      { showFieldError('bm-return',     'Please select a return date'); hasError = true; }
      if (pickup && ret && ret <= pickup) { showFieldError('bm-return', 'Return date must be after pickup date'); hasError = true; }
      if (!location) { showFieldError('bm-location',   'Please select a pickup location'); hasError = true; }
      if (hasError)  { shakeNextBtn(); return; }

      if (!LCR_DB.isCarAvailable(carId, pickup, ret)) {
        showFieldError('bm-car-select', 'This vehicle is not available for the selected dates. Please choose different dates or another vehicle.');
        shakeNextBtn();
        return;
      }

      const totals = calcTotals(carId, pickup, ret);
      Object.assign(bookingData, {
        carId, pickupDate: pickup, returnDate: ret, pickupLoc: location,
        carName: CAR_NAMES[carId], carPrice: CAR_PRICES[carId],
        ...totals
      });
      nextStep();
    };
  }

  function renderCarPreview(carId) {
    if (!carId || !CAR_NAMES[carId]) return `<div class="bm-car-placeholder"><i class="fa-solid fa-car"></i><span>Select a vehicle above</span></div>`;
    return `<img src="${CAR_IMAGES[carId]}" alt="${CAR_NAMES[carId]}" class="bm-car-img">
            <div class="bm-car-overlay"><strong>${CAR_NAMES[carId]}</strong><span>$${CAR_PRICES[carId]}/day</span></div>`;
  }

  /* ─── STEP 2: Personal Info ─── */
  function renderStep2(container, nextBtn) {
    container.innerHTML = `
      <div class="bm-step-content">
        <div class="bm-step-title"><i class="fa-solid fa-user"></i> Your Details</div>

        <div class="bm-field-row">
          <div class="bm-field">
            <label><i class="fa-solid fa-user"></i> Full Name *</label>
            <input type="text" id="bm-name" class="bm-input" placeholder="e.g. Tafadzwa Mutasa" value="${bookingData.fullName || ''}">
          </div>
          <div class="bm-field">
            <label><i class="fa-solid fa-phone"></i> Phone Number *</label>
            <input type="tel" id="bm-phone" class="bm-input" placeholder="+263 77 123 4567" value="${bookingData.phone || ''}">
          </div>
        </div>

        <div class="bm-field">
          <label><i class="fa-solid fa-envelope"></i> Email Address *</label>
          <input type="email" id="bm-email" class="bm-input" placeholder="you@email.com" value="${bookingData.email || ''}">
        </div>

        <div class="bm-field">
          <label><i class="fa-solid fa-id-card"></i> National ID / Passport Number *</label>
          <input type="text" id="bm-idnum" class="bm-input" placeholder="e.g. 63-123456A78" value="${bookingData.idNumber || ''}">
        </div>

        <div class="bm-field-row">
          <div class="bm-field">
            <label><i class="fa-solid fa-users"></i> Passengers</label>
            <select id="bm-passengers" class="bm-select">
              <option ${bookingData.passengers==='1-2'?'selected':''} value="1-2">1–2 passengers</option>
              <option ${bookingData.passengers==='3-4'?'selected':''} value="3-4">3–4 passengers</option>
              <option ${bookingData.passengers==='5-6'?'selected':''} value="5-6">5–6 passengers</option>
              <option ${bookingData.passengers==='7+'?'selected':''} value="7+">7+ passengers</option>
            </select>
          </div>
          <div class="bm-field">
            <label><i class="fa-solid fa-credit-card"></i> Payment Method</label>
            <select id="bm-payment" class="bm-select">
              <option ${bookingData.paymentMethod==='ecocash'?'selected':''} value="ecocash">EcoCash</option>
              <option ${bookingData.paymentMethod==='card'?'selected':''} value="card">Visa / Mastercard</option>
              <option ${bookingData.paymentMethod==='cash'?'selected':''} value="cash">Cash on Pickup</option>
              <option ${bookingData.paymentMethod==='bank'?'selected':''} value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div class="bm-field">
          <label><i class="fa-solid fa-comment-dots"></i> Special Requests <span class="bm-optional">(optional)</span></label>
          <textarea id="bm-message" class="bm-textarea" rows="3" placeholder="Any special requirements, child seats, GPS, etc.">${bookingData.message || ''}</textarea>
        </div>

        <div class="bm-terms">
          <label class="bm-checkbox-label">
            <input type="checkbox" id="bm-terms-check" ${bookingData.agreedTerms?'checked':''}>
            <span>I agree to the <a href="#" onclick="return false">Terms & Conditions</a> and <a href="#" onclick="return false">Rental Policy</a></span>
          </label>
        </div>
      </div>
    `;

    nextBtn.onclick = () => {
      const name  = document.getElementById('bm-name').value.trim();
      const phone = document.getElementById('bm-phone').value.trim();
      const email = document.getElementById('bm-email').value.trim();
      const idnum = document.getElementById('bm-idnum').value.trim();
      const terms = document.getElementById('bm-terms-check').checked;

      // ── Step 2 validation: block next if required fields missing ──
      let s2Error = false;
      if (!name)  { showFieldError('bm-name',  'Full name is required'); s2Error = true; }
      if (!phone) { showFieldError('bm-phone', 'Phone number is required'); s2Error = true; }
      if (!email || !email.includes('@')) { showFieldError('bm-email', 'Please enter a valid email address'); s2Error = true; }
      if (!idnum) { showFieldError('bm-idnum', 'ID or Passport number is required'); s2Error = true; }
      if (s2Error) { shakeNextBtn(); return; }
      if (!terms) { showBmAlert('You must agree to the Terms & Conditions to continue.'); shakeNextBtn(); return; }

      Object.assign(bookingData, {
        fullName: name, phone, email, idNumber: idnum,
        passengers: document.getElementById('bm-passengers').value,
        paymentMethod: document.getElementById('bm-payment').value,
        message: document.getElementById('bm-message').value.trim(),
        agreedTerms: true,
      });
      nextStep();
    };
  }

  /* ─── STEP 3: Review ─── */
  function renderStep3(container, nextBtn) {
    const t = bookingData;
    container.innerHTML = `
      <div class="bm-step-content">
        <div class="bm-step-title"><i class="fa-solid fa-clipboard-check"></i> Review Your Booking</div>

        <div class="bm-review-card">
          <div class="bm-review-car">
            <img src="${CAR_IMAGES[t.carId]}" alt="${t.carName}">
            <div>
              <h3>${t.carName}</h3>
              <span>$${t.rate}/day · ${t.days} day${t.days>1?'s':''}</span>
            </div>
          </div>

          <div class="bm-review-grid">
            <div class="bm-review-item"><i class="fa-solid fa-calendar-days"></i><div><label>Pickup</label><span>${formatDate(t.pickupDate)}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-calendar-check"></i><div><label>Return</label><span>${formatDate(t.returnDate)}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-location-dot"></i><div><label>Location</label><span>${t.pickupLoc}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-users"></i><div><label>Passengers</label><span>${t.passengers}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-user"></i><div><label>Name</label><span>${t.fullName}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-phone"></i><div><label>Phone</label><span>${t.phone}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-envelope"></i><div><label>Email</label><span>${t.email}</span></div></div>
            <div class="bm-review-item"><i class="fa-solid fa-credit-card"></i><div><label>Payment</label><span>${t.paymentMethod}</span></div></div>
          </div>

          <div class="bm-review-total">
            <div class="bm-total-row"><span>${t.days} day${t.days>1?'s':''} × $${t.rate}</span><span>$${t.total}</span></div>
            <div class="bm-total-row"><span>Insurance & taxes</span><span>Included</span></div>
            <div class="bm-total-row bm-total-final"><span>Total</span><strong>$${t.total}</strong></div>
            <div class="bm-total-row bm-total-deposit"><span>Deposit due now (${LCR_DB.getSettings().depositPercent}%)</span><strong>$${t.dep}</strong></div>
          </div>

          <div class="bm-review-notice">
            <i class="fa-solid fa-circle-info"></i>
            Your booking will be <strong>pending approval</strong>. Our team will confirm within 15–30 minutes and send details to <strong>${t.email}</strong>.
          </div>
        </div>
      </div>
    `;

    nextBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Confirm Booking';
    nextBtn.classList.add('bm-btn-confirm');

    nextBtn.onclick = () => {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';
      setTimeout(() => {
        const booking = LCR_DB.createBooking(bookingData);
        bookingData.ref = booking.ref;
        nextStep();
      }, 1200);
    };
  }

  /* ─── STEP 4: Confirmation ─── */
  function renderStep4(container) {
    const ref = bookingData.ref;
    container.innerHTML = `
      <div class="bm-step-content bm-confirm-content">
        <div class="bm-confirm-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h2 class="bm-confirm-title">Booking Submitted!</h2>
        <p class="bm-confirm-sub">Your request has been received and is awaiting approval.</p>

        <div class="bm-ref-box">
          <div class="bm-ref-label">Your Booking Reference</div>
          <div class="bm-ref-code" id="bmRefCode">${ref}</div>
          <button class="bm-ref-copy" onclick="navigator.clipboard.writeText('${ref}').then(()=>{ this.innerHTML='<i class=\\'fa-solid fa-check\\'></i> Copied!'; setTimeout(()=>{ this.innerHTML='<i class=\\'fa-solid fa-copy\\'></i> Copy'; },2000) })">
            <i class="fa-solid fa-copy"></i> Copy
          </button>
        </div>

        <div class="bm-confirm-steps">
          <div class="bm-cs-item done"><i class="fa-solid fa-check-circle"></i><span>Booking request submitted</span></div>
          <div class="bm-cs-item active"><i class="fa-solid fa-clock"></i><span>Admin review in progress (15–30 min)</span></div>
          <div class="bm-cs-item"><i class="fa-regular fa-envelope"></i><span>Confirmation sent to ${bookingData.email}</span></div>
          <div class="bm-cs-item"><i class="fa-solid fa-key"></i><span>Pick up your vehicle on ${formatDate(bookingData.pickupDate)}</span></div>
        </div>

        <div class="bm-confirm-actions">
          <button class="bm-btn-status" onclick="BookingModal.openStatusChecker('${ref}')">
            <i class="fa-solid fa-magnifying-glass"></i> Track Booking Status
          </button>
          <button class="bm-btn-done" onclick="BookingModal.close()">
            <i class="fa-solid fa-house"></i> Back to Home
          </button>
        </div>
      </div>
    `;
  }

  /* ── Navigation ── */
  function nextStep() {
    if (currentStep < TOTAL_STEPS) renderStep(currentStep + 1);
  }
  function prevStep() {
    if (currentStep > 1) renderStep(currentStep - 1);
  }

  /* ── Helpers ── */
  /* ── Field error: highlights input + shows message below ── */
  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('bm-error');
    // Remove any existing error msg first
    const existing = el.parentNode.querySelector('.bm-err-msg');
    if (existing) existing.remove();
    const err = document.createElement('div');
    err.className = 'bm-err-msg';
    err.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + msg;
    el.parentNode.appendChild(err);
    el.addEventListener('input', () => {
      el.classList.remove('bm-error');
      err.remove();
    }, { once: true });
    el.focus();
  }

  /* ── Shake the Next button to signal the user cannot proceed ── */
  function shakeNextBtn() {
    const btn = document.getElementById('bmNext');
    if (!btn) return;
    btn.classList.remove('bm-shake');
    void btn.offsetWidth; // reflow to restart animation
    btn.classList.add('bm-shake');
    setTimeout(() => btn.classList.remove('bm-shake'), 600);
  }

  function showBmAlert(msg) {
    let alert = document.getElementById('bmAlert');
    if (!alert) {
      alert = document.createElement('div');
      alert.id = 'bmAlert';
      alert.className = 'bm-alert';
      document.getElementById('bookingModal').appendChild(alert);
    }
    alert.textContent = msg;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 3500);
  }

  /* ── Status Checker Modal ── */
  function openStatusChecker(prefillRef) {
    close();
    let sc = document.getElementById('statusCheckerOverlay');
    if (!sc) {
      sc = document.createElement('div');
      sc.id = 'statusCheckerOverlay';
      sc.className = 'sc-overlay';
      sc.innerHTML = `
        <div class="sc-modal">
          <div class="sc-header">
            <div class="sc-title"><i class="fa-solid fa-magnifying-glass"></i> Track Booking</div>
            <button class="sc-close" onclick="document.getElementById('statusCheckerOverlay').classList.remove('open');document.body.style.overflow=''">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="sc-body">
            <p class="sc-desc">Enter your booking reference number to check the current status of your reservation.</p>
            <div class="sc-input-row">
              <input type="text" id="scRefInput" class="sc-input" placeholder="e.g. LCR-AB12-XY34" maxlength="16">
              <button class="sc-search-btn" id="scSearchBtn"><i class="fa-solid fa-search"></i> Check</button>
            </div>
            <div id="scResult"></div>
          </div>
        </div>
      `;
      document.body.appendChild(sc);
      sc.addEventListener('click', e => { if(e.target===sc){ sc.classList.remove('open'); document.body.style.overflow=''; }});
      document.getElementById('scSearchBtn').addEventListener('click', checkStatus);
      document.getElementById('scRefInput').addEventListener('keydown', e => { if(e.key==='Enter') checkStatus(); });
    }

    if (prefillRef) {
      document.getElementById('scRefInput').value = prefillRef;
    }
    sc.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (prefillRef) setTimeout(checkStatus, 300);
  }

  function checkStatus() {
    const ref = document.getElementById('scRefInput').value.trim().toUpperCase();
    const result = document.getElementById('scResult');
    if (!ref) { result.innerHTML = `<div class="sc-error">Please enter a booking reference.</div>`; return; }

    const booking = LCR_DB.getBookingByRef(ref);
    if (!booking) {
      result.innerHTML = `<div class="sc-error"><i class="fa-solid fa-circle-xmark"></i> No booking found with reference <strong>${ref}</strong>. Please check and try again.</div>`;
      return;
    }

    const statusColors = { pending:'#f59e0b', approved:'#10b981', cancelled:'#ef4444', completed:'#4169E1', rejected:'#ef4444' };
    const statusIcons  = { pending:'fa-clock', approved:'fa-circle-check', cancelled:'fa-ban', completed:'fa-flag-checkered', rejected:'fa-times-circle' };
    const sc = booking.status.toUpperCase();

    result.innerHTML = `
      <div class="sc-result-card">
        <div class="sc-result-header" style="background:${statusColors[booking.status]}20;border-color:${statusColors[booking.status]}40">
          <div class="sc-status-badge" style="background:${statusColors[booking.status]}">
            <i class="fa-solid ${statusIcons[booking.status]}"></i> ${sc}
          </div>
          <div class="sc-ref-display">${booking.ref}</div>
        </div>
        <div class="sc-result-body">
          <div class="sc-result-row"><label>Vehicle</label><span>${booking.carName}</span></div>
          <div class="sc-result-row"><label>Pickup</label><span>${formatDate(booking.pickupDate)}</span></div>
          <div class="sc-result-row"><label>Return</label><span>${formatDate(booking.returnDate)}</span></div>
          <div class="sc-result-row"><label>Location</label><span>${booking.pickupLoc}</span></div>
          <div class="sc-result-row"><label>Total</label><span><strong>$${booking.totalPrice}</strong></span></div>
          <div class="sc-result-row"><label>Booked</label><span>${new Date(booking.createdAt).toLocaleString()}</span></div>
          ${booking.adminNote ? `<div class="sc-admin-note"><i class="fa-solid fa-comment"></i> <strong>Admin note:</strong> ${booking.adminNote}</div>` : ''}
        </div>
        ${booking.status === 'pending' ? `<div class="sc-pending-msg"><i class="fa-solid fa-clock"></i> Your booking is being reviewed. We'll notify you at <strong>${booking.email}</strong> once approved.</div>` : ''}
        ${['pending','approved'].includes(booking.status) ? `<button class="sc-cancel-btn" onclick="BookingModal.handleCancelFromStatus('${booking.ref}')"><i class="fa-solid fa-ban"></i> Cancel Booking</button>` : ''}
      </div>
    `;
  }

  function handleCancelFromStatus(ref) {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    LCR_DB.cancelBooking(ref);
    checkStatus();
    showToast && showToast('Booking Cancelled', `Booking ${ref} has been cancelled.`);
  }

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      close();
      const sc = document.getElementById('statusCheckerOverlay');
      if (sc?.classList.contains('open')) {
        sc.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  return { open, close, openStatusChecker, handleCancelFromStatus };
})();

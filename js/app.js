// anavoroom — client-side ticket & payment logic

(function () {
  'use strict';

  // ── Shared helpers ────────────────────────────────────────────────────────

  function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function fmtPrice(n) {
    return n === 0 ? 'Free' : `£${Number(n).toFixed(2)}`;
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

  function qs(sel) { return document.querySelector(sel); }

  // Inline field-level error — injects a small error line below the input
  function setFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    let err = el.parentElement.querySelector('.field-inline-err');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-inline-err';
      err.style.cssText = 'color:#fc8181;font-size:0.78rem;margin-top:0.3rem;display:none';
      el.after(err);
    }
    if (msg) {
      err.textContent = msg;
      err.style.display = 'block';
      el.style.borderColor = 'rgba(239,68,68,0.5)';
    } else {
      err.style.display = 'none';
      el.style.borderColor = '';
    }
  }

  function clearFieldErrors(...ids) {
    ids.forEach(id => setFieldError(id, ''));
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  // Validates ticket form fields; returns true if all OK, false + shows errors if not
  function validateTicketForm() {
    const name  = (document.getElementById('buyer-name')?.value  || '').trim();
    const email = (document.getElementById('buyer-email')?.value || '').trim();
    let ok = true;

    if (!name || name.length < 2) {
      setFieldError('buyer-name', 'Please enter your full name');
      ok = false;
    } else {
      setFieldError('buyer-name', '');
    }

    if (!email) {
      setFieldError('buyer-email', 'Please enter your email address');
      ok = false;
    } else if (!isValidEmail(email)) {
      setFieldError('buyer-email', 'Please enter a valid email address (e.g. you@example.com)');
      ok = false;
    } else {
      setFieldError('buyer-email', '');
    }

    return ok;
  }

  // Validates payment form; returns true if OK
  function validatePaymentForm() {
    const name = (document.getElementById('payer-name')?.value || '').trim();
    let ok = true;

    if (!name || name.length < 2) {
      setFieldError('payer-name', 'Please enter the name on your bank account');
      ok = false;
    } else {
      setFieldError('payer-name', '');
    }

    return ok;
  }

  // Friendly API error messages — turn technical strings into plain English
  function friendlyError(raw) {
    if (!raw) return 'Something went wrong. Please try again.';
    const r = raw.toLowerCase();
    if (r.includes('only') && r.includes('remaining'))  return raw; // "Only N tickets remaining" is already clear
    if (r.includes('sold out'))                          return 'Sorry, this event is now sold out.';
    if (r.includes('event not found'))                   return 'We couldn\'t find this event. Please go back and try again.';
    if (r.includes('required'))                          return 'Please fill in all required fields.';
    if (r.includes('quantity'))                          return 'Please choose a valid number of tickets (1–10).';
    if (r.includes('payment not found'))                 return 'We couldn\'t find your payment. Please go back and try again.';
    if (r.includes('ticket not found'))                  return 'We couldn\'t find your ticket. Keep your reference number safe.';
    return 'Something went wrong. Please try again.';
  }

  // ── Homepage: load events from API ───────────────────────────────────────

  const eventsGrid = document.getElementById('homepage-events-grid');
  if (eventsGrid) loadHomeEvents();

  async function loadHomeEvents() {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('API unavailable');
      const { events } = await res.json();
      if (!events.length) {
        eventsGrid.innerHTML = '<p class="events-empty">No upcoming events. Check back soon.</p>';
        return;
      }
      eventsGrid.innerHTML = events.map(eventListCard).join('');
    } catch {
      eventsGrid.innerHTML = staticFallbackCard();
    }
  }

  function eventListCard(ev) {
    const available = ev.available ?? (ev.capacity - ev.tickets_sold);
    const soldOut   = available <= 0;
    const d = new Date(ev.date + 'T00:00:00');
    const day   = d.toLocaleDateString('en-GB', { day: 'numeric' });
    const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const year  = d.getFullYear();
    return `
      <article class="ev-card" style="--ev-color:${ev.image_color || '#FF8050'}">
        <div class="ev-card-banner">
          <div class="ev-card-date-pill">
            <span class="ev-pill-day">${day}</span>
            <span class="ev-pill-month">${month} ${year}</span>
          </div>
          ${soldOut ? '<div class="ev-sold-out-badge">Sold Out</div>' : ''}
        </div>
        <div class="ev-card-body">
          <p class="ev-card-city">${ev.city}</p>
          <h3 class="ev-card-title">${ev.title}</h3>
          <p class="ev-card-desc">${ev.description || ''}</p>
          <div class="ev-card-footer">
            <span class="ev-card-price">${fmtPrice(ev.price)}</span>
            ${soldOut
              ? '<span class="btn-sold">Sold Out</span>'
              : `<a href="/event.html?slug=${ev.slug}" class="btn btn-orange ev-cta">Get Tickets</a>`}
          </div>
          <p class="ev-avail">${soldOut ? '' : `${available} ticket${available === 1 ? '' : 's'} left`}</p>
        </div>
      </article>`;
  }

  function staticFallbackCard() {
    return `
      <article class="ev-card" style="--ev-color:#FF8050">
        <div class="ev-card-banner"></div>
        <div class="ev-card-body">
          <p class="ev-card-city">Manchester</p>
          <h3 class="ev-card-title">anavoroom Live</h3>
          <p class="ev-card-desc">An evening of worship, prayer, and encounter.</p>
          <div class="ev-card-footer">
            <span class="ev-card-price">£5.00</span>
            <a href="/event.html?slug=anavoroom-live-sep-2026" class="btn btn-orange ev-cta">Get Tickets</a>
          </div>
          <p class="ev-avail">5 September 2026</p>
        </div>
      </article>`;
  }

  // ── event.html — Event detail + ticket form ───────────────────────────────

  const eventDetailWrap = document.getElementById('event-detail-wrap');
  if (eventDetailWrap) initEventPage();

  async function initEventPage() {
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get('slug');
    if (!slug) { window.location.href = '/events.html'; return; }

    const loading = document.getElementById('event-loading');
    const errEl   = document.getElementById('event-error');

    try {
      const res = await fetch(`/api/events/${slug}`);
      if (!res.ok) throw new Error('Event not found');
      const { event } = await res.json();
      renderEventDetail(event);
    } catch {
      if (loading) loading.style.display = 'none';
      if (errEl)   showError(errEl, 'Could not load event details. Please refresh the page or go back to Events.');
    }
  }

  function renderEventDetail(ev) {
    const loading = document.getElementById('event-loading');
    if (loading) loading.style.display = 'none';

    const available = ev.available ?? (ev.capacity - ev.tickets_sold);
    const soldOut   = available <= 0;

    // Banner — content wrapped in .container so it respects page margins
    const banner = document.getElementById('event-banner');
    if (banner) {
      banner.style.background = `linear-gradient(135deg, ${ev.image_color}22 0%, #111 60%)`;
      banner.innerHTML = `
        <div class="ev-detail-banner-inner">
          <div class="container">
            <p class="section-label">${ev.city} &nbsp;·&nbsp; ${fmtDate(ev.date)}</p>
            <h1 class="ev-detail-title">${ev.title}</h1>
            <p class="ev-detail-time">${ev.time}</p>
            <div class="ev-detail-price-row">
              <span class="ev-detail-price">${fmtPrice(ev.price)}</span>
              ${!soldOut
                ? `<span class="ev-avail-badge">${available} tickets left</span>`
                : '<span class="ev-avail-badge sold">Sold Out</span>'}
            </div>
          </div>
        </div>`;
    }

    // Long description
    const desc = document.getElementById('event-long-desc');
    if (desc && ev.long_description) {
      desc.innerHTML = ev.long_description.split('\n').map(p => p ? `<p>${p}</p>` : '').join('');
    }

    // Form
    const formWrap = document.getElementById('ticket-form-wrap');
    if (formWrap) {
      if (soldOut) {
        formWrap.innerHTML = '<div class="sold-out-notice"><h3>This event is sold out</h3><p>Follow us on Instagram for announcements about new events.</p></div>';
        return;
      }

      // Quantity selector
      const maxQty = Math.min(10, available);
      const qtyEl  = document.getElementById('ticket-qty');
      if (qtyEl) {
        for (let i = 1; i <= maxQty; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `${i} ticket${i > 1 ? 's' : ''}`;
          qtyEl.appendChild(opt);
        }
        qtyEl.addEventListener('change', () => updateTotal(ev.price));
      }
      updateTotal(ev.price);

      // Live validation on blur
      document.getElementById('buyer-name')?.addEventListener('blur', () => {
        const v = document.getElementById('buyer-name').value.trim();
        setFieldError('buyer-name', v.length < 2 ? 'Please enter your full name' : '');
      });
      document.getElementById('buyer-email')?.addEventListener('blur', () => {
        const v = document.getElementById('buyer-email').value.trim();
        if (!v) setFieldError('buyer-email', 'Please enter your email address');
        else if (!isValidEmail(v)) setFieldError('buyer-email', 'Please enter a valid email address (e.g. you@example.com)');
        else setFieldError('buyer-email', '');
      });

      // Form submit
      const form      = document.getElementById('ticket-form');
      const errMsg    = document.getElementById('ticket-form-error');
      const submitBtn = document.getElementById('ticket-submit');

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (errMsg) errMsg.style.display = 'none';

          if (!validateTicketForm()) return; // stop here, inline errors already shown

          submitBtn.disabled    = true;
          submitBtn.textContent = 'Processing…';

          const body = {
            event_id:    ev.id,
            buyer_name:  document.getElementById('buyer-name').value.trim(),
            buyer_email: document.getElementById('buyer-email').value.trim(),
            buyer_phone: document.getElementById('buyer-phone').value.trim(),
            quantity:    parseInt(document.getElementById('ticket-qty').value, 10),
          };

          try {
            const res  = await fetch('/api/payment/initiate', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create booking');

            sessionStorage.setItem('anavoroom_checkout', JSON.stringify(data));
            window.location.href = '/checkout.html';

          } catch (err) {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Proceed to Payment →';
            if (errMsg) showError(errMsg, friendlyError(err.message));
          }
        });
      }
    }
  }

  function updateTotal(unitPrice) {
    const qty     = parseInt((document.getElementById('ticket-qty') || {}).value || '1', 10);
    const totalEl = document.getElementById('ticket-total');
    if (totalEl) totalEl.textContent = fmtPrice(unitPrice * qty);
  }

  // ── checkout.html — Payment page ──────────────────────────────────────────

  const checkoutWrap = document.getElementById('checkout-wrap');
  if (checkoutWrap) initCheckout();

  function initCheckout() {
    const raw = sessionStorage.getItem('anavoroom_checkout');
    if (!raw) { window.location.href = '/events.html'; return; }
    renderCheckout(JSON.parse(raw));
  }

  function renderCheckout(data) {
    const { payment_ref, ticket_ref, amount, event, buyer, bank_details } = data;

    // Order summary
    const summaryEl = document.getElementById('checkout-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="checkout-summary-row">
          <span>Event</span><strong>${event.title}</strong>
        </div>
        <div class="checkout-summary-row">
          <span>Date</span><strong>${fmtDate(event.date)}</strong>
        </div>
        <div class="checkout-summary-row">
          <span>Tickets</span><strong>${buyer.quantity} × ${fmtPrice(amount / buyer.quantity)}</strong>
        </div>
        <div class="checkout-summary-row total-row">
          <span>Total</span><strong>${fmtPrice(amount)}</strong>
        </div>`;
    }

    // Bank transfer destination
    const bankEl = document.getElementById('bank-dest-details');
    if (bankEl) {
      bankEl.innerHTML = `
        <div class="bank-detail-row"><span>Pay to</span><strong>${bank_details.account_name}</strong></div>
        <div class="bank-detail-row"><span>Account No.</span><strong class="bank-mono">${bank_details.account_number}</strong></div>
        <div class="bank-detail-row"><span>Sort Code</span><strong class="bank-mono">${bank_details.sort_code}</strong></div>
        <div class="bank-detail-row ref-row"><span>Reference</span><strong class="bank-mono ref-highlight">${bank_details.payment_reference}</strong></div>
        <div class="bank-detail-row total-row"><span>Amount</span><strong>${fmtPrice(amount)}</strong></div>`;
    }

    // Ticket ref
    const refEl = document.getElementById('pending-ticket-ref');
    if (refEl) refEl.textContent = ticket_ref;

    // Amount display
    const amountEl = document.querySelector('.co-amount-val');
    if (amountEl) amountEl.textContent = fmtPrice(amount);

    // Live validation on blur
    document.getElementById('payer-name')?.addEventListener('blur', () => {
      const v = document.getElementById('payer-name').value.trim();
      setFieldError('payer-name', v.length < 2 ? 'Please enter the name on your bank account' : '');
    });

    // Auto-format sort code as XX-XX-XX
    const sortEl = document.getElementById('payer-sort');
    if (sortEl) {
      sortEl.addEventListener('input', () => {
        let v = sortEl.value.replace(/\D/g, '').slice(0, 6);
        if (v.length > 4) v = v.slice(0,2) + '-' + v.slice(2,4) + '-' + v.slice(4);
        else if (v.length > 2) v = v.slice(0,2) + '-' + v.slice(2);
        sortEl.value = v;
      });
    }

    // Form submit
    const form      = document.getElementById('payment-form');
    const errMsg    = document.getElementById('payment-form-error');
    const submitBtn = document.getElementById('payment-submit');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errMsg) errMsg.style.display = 'none';

        if (!validatePaymentForm()) return;

        submitBtn.disabled    = true;
        submitBtn.textContent = 'Confirming payment…';

        await new Promise(r => setTimeout(r, 1800));

        try {
          const res  = await fetch('/api/payment/confirm', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payment_ref,
              payer_name:      document.getElementById('payer-name').value.trim(),
              payer_sort_code: document.getElementById('payer-sort').value.trim(),
              payer_account:   document.getElementById('payer-account').value.trim(),
            }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Payment failed');

          sessionStorage.removeItem('anavoroom_checkout');
          window.location.href = `/confirmation.html?ref=${result.ticket_ref}`;

        } catch (err) {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Confirm Payment →';
          if (errMsg) showError(errMsg, friendlyError(err.message));
        }
      });
    }
  }

  // ── confirmation.html — Ticket confirmed ─────────────────────────────────

  const confirmationWrap = document.getElementById('confirmation-wrap');
  if (confirmationWrap) initConfirmation();

  async function initConfirmation() {
    const params = new URLSearchParams(window.location.search);
    const ref    = params.get('ref');
    if (!ref) { window.location.href = '/events.html'; return; }

    const loading = document.getElementById('conf-loading');
    const errEl   = document.getElementById('conf-error');

    try {
      const res = await fetch(`/api/tickets/${ref}`);
      if (!res.ok) throw new Error('Ticket not found');
      const { ticket } = await res.json();
      if (loading) loading.style.display = 'none';
      renderConfirmation(ticket);
    } catch {
      if (loading) loading.style.display = 'none';
      if (errEl)   showError(errEl, `Could not load your ticket. Your booking reference is ${ref} — keep it safe.`);
    }
  }

  function renderConfirmation(t) {
    const wrap = document.getElementById('ticket-card');
    if (!wrap) return;

    const statusClass = t.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
    const statusLabel = t.status === 'confirmed' ? 'Confirmed' : 'Pending';

    wrap.innerHTML = `
      <div class="ticket-card">
        <div class="ticket-card-header">
          <div class="ticket-status ${statusClass}">
            <span class="status-icon">${t.status === 'confirmed' ? '✓' : '⏳'}</span>
            ${statusLabel}
          </div>
          <p class="ticket-event-name">${t.event_title}</p>
          <p class="ticket-event-date">${fmtDate(t.event_date)} &nbsp;·&nbsp; ${t.event_time}</p>
        </div>
        <div class="ticket-card-body">
          <div class="ticket-ref-block">
            <p class="ticket-ref-label">Your Ticket Reference</p>
            <p class="ticket-ref-number">${t.reference}</p>
          </div>
          <div class="ticket-details-grid">
            <div class="td-item"><span>Name</span><strong>${t.buyer_name}</strong></div>
            <div class="td-item"><span>Email</span><strong>${t.buyer_email}</strong></div>
            <div class="td-item"><span>Tickets</span><strong>${t.quantity}</strong></div>
            <div class="td-item"><span>Total Paid</span><strong>${fmtPrice(t.amount)}</strong></div>
            <div class="td-item"><span>Venue</span><strong>${t.event_venue}</strong></div>
            <div class="td-item"><span>Booked</span><strong>${new Date(t.created_at).toLocaleDateString('en-GB')}</strong></div>
          </div>
          <div class="ticket-notice">
            <p>📍 The exact venue address will be emailed to <strong>${t.buyer_email}</strong> before the event.</p>
            <p>Keep your ticket reference: <strong>${t.reference}</strong> — you'll need it on the door.</p>
          </div>
        </div>
        <div class="ticket-card-footer">
          <button onclick="window.print()" class="btn btn-outline-orange">Print / Save Ticket</button>
          <a href="/events.html" class="btn btn-dark">Back to Events</a>
        </div>
      </div>`;
  }

})();

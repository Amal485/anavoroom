// ===== USPC MANCHESTER — MAIN JS =====

document.addEventListener('DOMContentLoaded', () => {

  // ----- Sticky Navbar -----
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile Hamburger -----
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Mobile dropdown toggle
  document.querySelectorAll('.has-dropdown').forEach(item => {
    const link = item.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  // ----- Scroll Reveal -----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => revealObserver.observe(el));
  }

  // ----- Contact Form -----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Message Sent!';
      btn.disabled = true;
      btn.style.background = '#22c55e';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        btn.style = '';
        contactForm.reset();
      }, 3500);
    });
  }

  // ----- Prayer Form -----
  const prayerForm = document.getElementById('prayer-form');
  if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = prayerForm.querySelector('button[type="submit"]');
      btn.textContent = 'Prayer Request Submitted!';
      btn.disabled = true;
      btn.style.background = '#22c55e';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.textContent = 'Submit Prayer Request';
        btn.disabled = false;
        btn.style = '';
        prayerForm.reset();
      }, 3500);
    });
  }

  // ----- Home Page: Live Google Calendar Events -----
  const eventsGrid = document.getElementById('events-grid');
  if (eventsGrid) {
    const API_KEY = 'AIzaSyB0Ih441qc5696rs_ANj_OuY4lsc0H8ZV8';
    const CALENDAR_IDS = [
      'unitedshalomchurch@gmail.com',
      'k7dl1baho552adrqj6a2f853ic@group.calendar.google.com'
    ];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    function formatTime(dateStr) {
      const d = new Date(dateStr);
      let h = d.getHours(), m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}${m ? ':' + String(m).padStart(2, '0') : ''} ${ampm}`;
    }

    function renderEvents(events) {
      if (!events.length) {
        eventsGrid.innerHTML = '<p style="color:var(--gray);grid-column:1/-1">No upcoming events at the moment. Check back soon!</p>';
        return;
      }
      eventsGrid.innerHTML = events.slice(0, 3).map(ev => {
        const start = ev.start.dateTime || ev.start.date;
        const d = new Date(start);
        const meta = ev.start.dateTime
          ? `${DAYS[d.getDay()]} · ${formatTime(start)}`
          : `${DAYS[d.getDay()]} · All day`;
        const desc = ev.description
          ? ev.description.replace(/<[^>]*>/g, '').trim().slice(0, 100) + (ev.description.length > 100 ? '…' : '')
          : 'Join us for this upcoming event at USPC Manchester.';
        return `
          <div class="event-card reveal visible">
            <div class="event-date">
              <span class="month">${MONTHS[d.getMonth()]}</span>
              <span class="day">${d.getDate()}</span>
            </div>
            <div class="event-info">
              <p class="event-meta">${meta}</p>
              <h3>${ev.summary || 'Church Event'}</h3>
              <p>${desc}</p>
            </div>
          </div>`;
      }).join('');
    }

    async function loadHomeEvents() {
      const now = new Date().toISOString();
      const url = id =>
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events?key=${API_KEY}&timeMin=${encodeURIComponent(now)}&maxResults=5&singleEvents=true&orderBy=startTime`;
      try {
        const results = await Promise.all(CALENDAR_IDS.map(id => fetch(url(id)).then(r => r.json())));
        const seen = new Set();
        const all = results.flatMap(r => (r.items || []).filter(ev => {
          if (seen.has(ev.id) || ev.status === 'cancelled') return false;
          seen.add(ev.id);
          return true;
        }));
        all.sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date));
        renderEvents(all);
      } catch {
        eventsGrid.innerHTML = '<p style="color:var(--gray);grid-column:1/-1">Unable to load events right now. <a href="events.html" style="color:var(--gold)">View full calendar →</a></p>';
      }
    }

    loadHomeEvents();
  }

  // ----- Current year for footer -----
  const yearEls = document.querySelectorAll('.current-year');
  yearEls.forEach(el => { el.textContent = new Date().getFullYear(); });

  // ----- Active nav link (single-page anchor) -----
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const activateLink = () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--gold)' : '';
      });
    };
    window.addEventListener('scroll', activateLink, { passive: true });
  }

});

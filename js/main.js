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

  // ----- YouTube Integration -----
  const YT = {
    key: 'AIzaSyB0Ih441qc5696rs_ANj_OuY4lsc0H8ZV8',
    handle: 'USPC_MCR',
    _id: null,

    async channelId() {
      if (this._id) return this._id;
      const cached = sessionStorage.getItem('yt_channel_id');
      if (cached) { this._id = cached; return cached; }
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${this.handle}&key=${this.key}`);
      const d = await r.json();
      this._id = d.items?.[0]?.id || null;
      if (this._id) sessionStorage.setItem('yt_channel_id', this._id);
      return this._id;
    },

    async liveVideoId(channelId) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${this.key}`);
      const d = await r.json();
      return d.items?.[0]?.id?.videoId || null;
    },

    async uploadsPlaylistId(channelId) {
      const cacheKey = `yt_uploads_${channelId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return cached;
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${this.key}`);
      const d = await r.json();
      const pid = d.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
      if (pid) sessionStorage.setItem(cacheKey, pid);
      return pid;
    },

    async latestVideos(channelId, max = 6) {
      const pid = await this.uploadsPlaylistId(channelId);
      if (!pid) return [];
      const r = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${pid}&maxResults=${max}&key=${this.key}`);
      const d = await r.json();
      return (d.items || []).map(item => ({
        id: { videoId: item.snippet.resourceId.videoId },
        snippet: {
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          description: item.snippet.description
        }
      }));
    },

    async playlists(channelId, max = 8) {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=${max}&key=${this.key}`);
      const d = await r.json();
      return d.items || [];
    },

    videoCard(video, clickToPlay = false) {
      const id = video.id?.videoId || video.id;
      const s = video.snippet;
      const thumb = s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '';
      const date = new Date(s.publishedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
      if (clickToPlay) {
        return `<div class="video-card">
          <div class="video-thumb-wrap" data-vid="${id}" style="cursor:pointer;position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/9;background:#000">
            <img src="${thumb}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
            <div class="play-btn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none">▶</div>
          </div>
          <h3>${s.title}</h3>
          <p>${date}</p>
        </div>`;
      }
      return `<div class="video-card">
        <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
          <div style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/9;background:#000">
            <img src="${thumb}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
            <div class="play-btn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">▶</div>
          </div>
        </a>
        <h3>${s.title}</h3>
        <p>${date}</p>
      </div>`;
    },

    playlistCard(pl) {
      const s = pl.snippet;
      const thumb = s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '';
      return `<a href="https://www.youtube.com/playlist?list=${pl.id}" target="_blank" rel="noopener" class="playlist-card">
        <div style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/9;background:#000">
          <img src="${thumb}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
          <div class="playlist-overlay">
            <span>▶ Playlist</span>
          </div>
        </div>
        <h3>${s.title}</h3>
        <p>${s.description ? s.description.slice(0, 80) + (s.description.length > 80 ? '…' : '') : ''}</p>
      </a>`;
    }
  };

  // Click-to-play: swap thumbnail for iframe on click
  document.addEventListener('click', e => {
    const wrap = e.target.closest('[data-vid]');
    if (!wrap) return;
    const vid = wrap.dataset.vid;
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?autoplay=1" frameborder="0" allow="autoplay;encrypted-media" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe>`;
    wrap.style.position = 'relative';
  });

  // Home page: live widget
  const liveWidget = document.getElementById('live-widget');
  if (liveWidget) {
    (async () => {
      try {
        const cid = await YT.channelId();
        if (!cid) return;
        const liveId = await YT.liveVideoId(cid);
        if (liveId) {
          document.getElementById('live-embed').innerHTML =
            `<iframe src="https://www.youtube.com/embed/${liveId}?autoplay=0" frameborder="0" allow="encrypted-media" allowfullscreen style="width:100%;height:100%;display:block"></iframe>`;
          liveWidget.style.display = 'block';
        }
      } catch { /* silently skip if API unavailable */ }
    })();
  }

  // Gallery page: latest videos
  const galleryVideoGrid = document.getElementById('gallery-video-grid');
  if (galleryVideoGrid) {
    (async () => {
      try {
        const cid = await YT.channelId();
        if (!cid) throw new Error('no channel');
        const videos = await YT.latestVideos(cid, 3);
        if (!videos.length) throw new Error('no videos');
        galleryVideoGrid.innerHTML = videos.map(v => YT.videoCard(v, true)).join('');
      } catch {
        galleryVideoGrid.innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Videos unavailable. <a href="https://www.youtube.com/@USPC_MCR" target="_blank" style="color:var(--gold)">Watch on YouTube →</a></p>`;
      }
    })();
  }

  // Watch page: live + latest videos + playlists
  const watchLiveSection = document.getElementById('watch-live-section');
  const watchVideoGrid   = document.getElementById('watch-video-grid');
  const watchPlaylists   = document.getElementById('watch-playlists');

  if (watchLiveSection || watchVideoGrid || watchPlaylists) {
    (async () => {
      try {
        const cid = await YT.channelId();
        if (!cid) throw new Error('no channel');

        const [liveId, videos, playlists] = await Promise.all([
          YT.liveVideoId(cid),
          watchVideoGrid  ? YT.latestVideos(cid, 6) : Promise.resolve([]),
          watchPlaylists  ? YT.playlists(cid, 8)    : Promise.resolve([])
        ]);

        if (watchLiveSection) {
          if (liveId) {
            document.getElementById('watch-live-embed').innerHTML =
              `<iframe src="https://www.youtube.com/embed/${liveId}" frameborder="0" allow="encrypted-media" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe>`;
            watchLiveSection.style.display = 'block';
            document.getElementById('watch-no-live').style.display = 'none';
          } else {
            watchLiveSection.style.display = 'none';
            document.getElementById('watch-no-live').style.display = 'block';
          }
        }

        if (watchVideoGrid) {
          watchVideoGrid.innerHTML = videos.length
            ? videos.map(v => YT.videoCard(v, true)).join('')
            : `<p style="color:var(--gray);grid-column:1/-1">No videos found.</p>`;
        }

        if (watchPlaylists) {
          watchPlaylists.innerHTML = playlists.length
            ? playlists.map(pl => YT.playlistCard(pl)).join('')
            : `<p style="color:var(--gray);grid-column:1/-1">No playlists found.</p>`;
        }

      } catch {
        [watchVideoGrid, watchPlaylists].forEach(el => {
          if (el) el.innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Unable to load. <a href="https://www.youtube.com/@USPC_MCR" target="_blank" style="color:var(--gold)">Visit our YouTube channel →</a></p>`;
        });
      }
    })();
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

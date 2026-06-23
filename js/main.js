// ===== ANAVOROOM — MAIN JS =====

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

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

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
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));
  }

  // ----- Countdown to September 5, 2026 -----
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const eventDate = new Date('2026-09-05T00:00:00');
    function updateCountdown() {
      const now = new Date();
      const diff = eventDate - now;
      if (diff <= 0) {
        countdownEl.innerHTML = '<div class="count-item"><span class="count-num" style="color:var(--orange)">Today!</span></div>';
        return;
      }
      const days  = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
      const mins  = Math.floor((diff % (1000*60*60)) / (1000*60));
      const secs  = Math.floor((diff % (1000*60)) / 1000);
      countdownEl.innerHTML = `
        <div class="count-item"><span class="count-num">${days}</span><span class="count-label">Days</span></div>
        <div class="count-sep">:</div>
        <div class="count-item"><span class="count-num">${String(hours).padStart(2,'0')}</span><span class="count-label">Hours</span></div>
        <div class="count-sep">:</div>
        <div class="count-item"><span class="count-num">${String(mins).padStart(2,'0')}</span><span class="count-label">Mins</span></div>
        <div class="count-sep">:</div>
        <div class="count-item"><span class="count-num">${String(secs).padStart(2,'0')}</span><span class="count-label">Secs</span></div>`;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ----- Form helpers -----
  const isLocal = !window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  function netlifySubmit(form, successLabel, resetLabel) {
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const done = (ok) => {
      if (ok) {
        btn.textContent = successLabel;
        btn.style.cssText = 'background:#22c55e;border-color:#22c55e;color:#fff';
        setTimeout(() => { btn.textContent = resetLabel; btn.disabled = false; btn.style = ''; form.reset(); }, 3500);
      } else {
        btn.textContent = 'Failed — please email us directly';
        btn.style.cssText = 'background:#ef4444;border-color:#ef4444;color:#fff';
        setTimeout(() => { btn.textContent = resetLabel; btn.disabled = false; btn.style = ''; }, 4000);
      }
    };

    if (isLocal) { done(true); return; }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(() => done(true)).catch(() => done(false));
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      netlifySubmit(contactForm, 'Message Sent!', 'Send Message');
    });
  }

  // ----- YouTube Integration -----
  const YT = {
    key: 'AIzaSyB0Ih441qc5696rs_ANj_OuY4lsc0H8ZV8',
    handle: 'anavoroom',
    _id: null,

    async channelId() {
      if (this._id) return this._id;
      const cached = sessionStorage.getItem('yt_channel_id_anavoroom');
      if (cached) { this._id = cached; return cached; }
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${this.handle}&key=${this.key}`);
      const d = await r.json();
      this._id = d.items?.[0]?.id || null;
      if (this._id) sessionStorage.setItem('yt_channel_id_anavoroom', this._id);
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
          <div class="video-thumb-wrap" data-vid="${id}" style="cursor:pointer">
            <img src="${thumb}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
            <div class="play-btn">▶</div>
          </div>
          <h3>${s.title}</h3>
          <p>${date}</p>
        </div>`;
      }
      return `<div class="video-card">
        <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
          <div class="video-thumb-wrap">
            <img src="${thumb}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
            <div class="play-btn">▶</div>
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
          <div class="playlist-overlay"><span>▶ Playlist</span></div>
        </div>
        <h3>${s.title}</h3>
        <p>${s.description ? s.description.slice(0,80) + (s.description.length > 80 ? '…' : '') : ''}</p>
      </a>`;
    }
  };

  // Click-to-play: swap thumbnail for iframe
  document.addEventListener('click', e => {
    const wrap = e.target.closest('[data-vid]');
    if (!wrap) return;
    const vid = wrap.dataset.vid;
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?autoplay=1" frameborder="0" allow="autoplay;encrypted-media" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe>`;
    wrap.style.position = 'relative';
  });

  // Home: live widget
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
      } catch { /* silently skip */ }
    })();
  }

  // Home / Gallery: latest 3 videos preview
  const watchPreviewGrid = document.getElementById('watch-preview-grid');
  if (watchPreviewGrid) {
    (async () => {
      try {
        const cid = await YT.channelId();
        if (!cid) throw new Error('no channel');
        const videos = await YT.latestVideos(cid, 3);
        if (!videos.length) throw new Error('no videos');
        watchPreviewGrid.innerHTML = videos.map(v => YT.videoCard(v, true)).join('');
      } catch {
        watchPreviewGrid.innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Videos unavailable. <a href="https://www.youtube.com/@anavoroom" target="_blank" style="color:var(--orange)">Watch on YouTube →</a></p>`;
      }
    })();
  }

  // Gallery: latest 3 videos
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
        galleryVideoGrid.innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Videos unavailable. <a href="https://www.youtube.com/@anavoroom" target="_blank" style="color:var(--orange)">Watch on YouTube →</a></p>`;
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
          watchVideoGrid ? YT.latestVideos(cid, 6) : Promise.resolve([]),
          watchPlaylists ? YT.playlists(cid, 8)    : Promise.resolve([])
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
          if (el) el.innerHTML = `<p style="color:var(--gray);grid-column:1/-1">Unable to load. <a href="https://www.youtube.com/@anavoroom" target="_blank" style="color:var(--orange)">Visit our YouTube →</a></p>`;
        });
      }
    })();
  }

  // Footer year
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const activateLink = () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--orange)' : '';
      });
    };
    window.addEventListener('scroll', activateLink, { passive: true });
  }

});

// CinePass - Main Application Controller
(function () {
  'use strict';

  // DOM Elements Cache
  const DOM = {
    citySelect: document.getElementById('citySelect'),
    searchInput: document.getElementById('searchInput'),
    audioToggleBtn: document.getElementById('audioToggleBtn'),
    audioToggleText: document.getElementById('audioToggleText'),
    myTicketsBtn: document.getElementById('myTicketsBtn'),
    ticketsCountBadge: document.getElementById('ticketsCountBadge'),

    // Hero
    heroTrack: document.getElementById('heroTrack'),
    heroDots: document.getElementById('heroDots'),

    // Date & Genres
    dateStrip: document.getElementById('dateStrip'),
    genrePills: document.getElementById('genrePills'),
    catalogMeta: document.getElementById('catalogMeta'),
    moviesGrid: document.getElementById('moviesGrid'),

    // Booking Modal
    bookingModal: document.getElementById('bookingModal'),
    btnCloseBookingModal: document.getElementById('btnCloseBookingModal'),
    modalPosterThumb: document.getElementById('modalPosterThumb'),
    modalMovieTitle: document.getElementById('modalMovieTitle'),
    modalMovieSub: document.getElementById('modalMovieSub'),
    stepNodes: document.querySelectorAll('.step-node'),
    modalBody: document.getElementById('modalBody'),

    // Trailer Modal
    trailerModal: document.getElementById('trailerModal'),
    btnCloseTrailerModal: document.getElementById('btnCloseTrailerModal'),
    trailerIframeWrap: document.getElementById('trailerIframeWrap'),

    // My Bookings Drawer
    drawerOverlay: document.getElementById('drawerOverlay'),
    btnCloseDrawer: document.getElementById('btnCloseDrawer'),
    savedBookingsList: document.getElementById('savedBookingsList'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  let heroCurrentIndex = 0;
  let heroInterval = null;
  let currentStep = 1;

  // Initialize
  function init() {
    setupCityPicker();
    setupAudioToggle();
    renderHeroCarousel();
    renderDateStrip();
    renderGenreFilters();
    renderMoviesGrid();
    setupEventListeners();
    updateTicketsBadge();
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `cine-toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Audio Toggle
  function setupAudioToggle() {
    updateAudioUI();
    DOM.audioToggleBtn.addEventListener('click', () => {
      const isMuted = cineAudio.toggleMute();
      updateAudioUI();
      showToast(isMuted ? 'Sound effects muted' : 'Sound effects enabled', 'info');
    });
  }

  function updateAudioUI() {
    const muted = cineAudio.isMuted();
    DOM.audioToggleText.textContent = muted ? 'Muted' : 'Sound ON';
    DOM.audioToggleBtn.setAttribute('title', muted ? 'Unmute sounds' : 'Mute sounds');
  }

  // City Picker
  function setupCityPicker() {
    DOM.citySelect.innerHTML = CINE_DATA.cities
      .map(c => `<option value="${c.id}" ${c.id === cineState.currentCity ? 'selected' : ''}>${c.name}</option>`)
      .join('');

    DOM.citySelect.addEventListener('change', (e) => {
      cineState.setCity(e.target.value);
      showToast(`City changed to ${DOM.citySelect.options[DOM.citySelect.selectedIndex].text}`, 'info');
    });
  }

  // Hero Showcase
  function renderHeroCarousel() {
    const featuredMovies = CINE_DATA.movies.filter(m => m.featured);
    if (!featuredMovies.length) return;

    DOM.heroTrack.innerHTML = featuredMovies.map((movie, idx) => `
      <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <img src="${movie.backdrop}" alt="${movie.title}" class="hero-backdrop" onerror="this.onerror=null; this.src='${movie.poster}';" />
        <div class="hero-gradient-overlay"></div>
        <div class="hero-content">
          <div class="hero-badges">
            <span class="badge-pill badge-featured">Featured Release</span>
            <span class="badge-pill badge-imdb">⭐ ${movie.rating}</span>
            <span class="badge-pill badge-rt">🍅 ${movie.rottenTomatoes}</span>
            <span class="badge-pill badge-format">${movie.ageRating}</span>
            <span class="badge-pill badge-format">${movie.formats[0]}</span>
          </div>
          <h1 class="hero-title">${movie.title}</h1>
          <div class="hero-tagline">${movie.tagline}</div>
          <p class="hero-synopsis">${movie.synopsis}</p>
          <div class="hero-actions">
            <button class="btn-primary-hero" onclick="window.CineApp.startBooking('${movie.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/><path d="M9 21V9"/><path d="m15 15-3-3 3-3"/></svg>
              Book Tickets
            </button>
            <button class="btn-secondary-hero" onclick="window.CineApp.openTrailer('${movie.trailerUrl}', '${movie.title.replace(/'/g, "\\'")}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch Trailer
            </button>
          </div>
        </div>
        <div class="hero-poster-preview">
          <img src="${movie.poster}" alt="${movie.title} Poster" class="hero-poster-img" />
        </div>
      </div>
    `).join('');

    DOM.heroDots.innerHTML = featuredMovies.map((_, idx) => `
      <button class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>
    `).join('');

    DOM.heroDots.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        switchHeroSlide(idx);
        restartHeroTimer();
      });
    });

    restartHeroTimer();
  }

  function switchHeroSlide(targetIdx) {
    const slides = DOM.heroTrack.querySelectorAll('.hero-slide');
    const dots = DOM.heroDots.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    heroCurrentIndex = (targetIdx + slides.length) % slides.length;
    slides[heroCurrentIndex].classList.add('active');
    dots[heroCurrentIndex].classList.add('active');
  }

  function restartHeroTimer() {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      switchHeroSlide(heroCurrentIndex + 1);
    }, 6000);
  }

  // Date Strip Navigation
  function renderDateStrip() {
    DOM.dateStrip.innerHTML = cineState.dates.map((dateObj, idx) => `
      <div class="date-pill ${idx === cineState.selectedDateIndex ? 'active' : ''}" data-date-index="${idx}">
        <span class="day-name">${dateObj.dayName}</span>
        <span class="day-num">${dateObj.dayNumber}</span>
        <span class="month-name">${dateObj.month}</span>
      </div>
    `).join('');

    DOM.dateStrip.querySelectorAll('.date-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const target = e.currentTarget;
        cineState.selectedDateIndex = parseInt(target.dataset.dateIndex, 10);
        DOM.dateStrip.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        showToast(`Selected date: ${cineState.getSelectedDate().fullDate}`, 'info');
      });
    });
  }

  // Genre Filters
  function renderGenreFilters() {
    DOM.genrePills.innerHTML = CINE_DATA.genres.map(genre => `
      <button class="genre-btn ${genre === cineState.activeGenre ? 'active' : ''}" data-genre="${genre}">${genre}</button>
    `).join('');

    DOM.genrePills.querySelectorAll('.genre-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        cineState.activeGenre = target.dataset.genre;
        DOM.genrePills.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        renderMoviesGrid();
      });
    });
  }

  // Movies Catalog
  function renderMoviesGrid() {
    const query = (cineState.searchQuery || '').trim().toLowerCase();
    const filtered = CINE_DATA.movies.filter(movie => {
      const matchGenre = cineState.activeGenre === 'All' || movie.genres.includes(cineState.activeGenre);
      const matchSearch = !query || 
        movie.title.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query) ||
        movie.cast.some(actor => actor.toLowerCase().includes(query));
      return matchGenre && matchSearch;
    });

    DOM.catalogMeta.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'Movie' : 'Movies'} in ${DOM.citySelect.options[DOM.citySelect.selectedIndex].text}`;

    if (filtered.length === 0) {
      DOM.moviesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎬</div>
          <h3 style="color: #fff; font-size: 1.3rem; margin-bottom: 0.5rem;">No movies found</h3>
          <p>Try searching for a different title or resetting your genre filter.</p>
        </div>
      `;
      return;
    }

    DOM.moviesGrid.innerHTML = filtered.map(movie => `
      <div class="movie-card" data-movie-id="${movie.id}">
        <div class="card-poster-wrap">
          <img 
            src="${movie.poster}" 
            alt="${movie.title}" 
            class="card-poster" 
            loading="lazy" 
            onerror="window.CineApp.onPosterError(this, '${movie.id}')"
          />
          <div class="card-overlay-gradient"></div>
          <div class="card-badge-rating">
            <span>⭐</span>
            <span>${movie.rating}</span>
          </div>
          <div class="card-badge-age">${movie.ageRating}</div>
          <button class="card-play-btn" onclick="window.CineApp.openTrailer('${movie.trailerUrl}', '${movie.title.replace(/'/g, "\\'")}')" aria-label="Play Trailer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
        <div class="card-body">
          <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
          <div class="card-meta">
            <span>${movie.runtime}</span>
            <span>•</span>
            <span>${movie.genres.slice(0, 2).join(', ')}</span>
          </div>
          <div class="card-formats">
            ${movie.formats.map(f => `<span class="format-tag">${f}</span>`).join('')}
          </div>
          <div class="card-footer">
            <div class="card-price-hint">From <span>₹${movie.priceTier.standard}</span></div>
            <button class="btn-book-card" onclick="window.CineApp.startBooking('${movie.id}')">Book Tickets</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Setup Global Listeners
  function setupEventListeners() {
    // Search with debounce
    let searchDebounce = null;
    DOM.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        cineState.searchQuery = e.target.value;
        renderMoviesGrid();
      }, 250);
    });

    // Close Modals on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBookingModal();
        closeTrailerModal();
        closeDrawer();
      }
    });

    // Modal close buttons
    DOM.btnCloseBookingModal.addEventListener('click', closeBookingModal);
    DOM.btnCloseTrailerModal.addEventListener('click', closeTrailerModal);
    DOM.trailerModal.addEventListener('click', (e) => {
      if (e.target === DOM.trailerModal) closeTrailerModal();
    });

    // Bookings Drawer
    DOM.myTicketsBtn.addEventListener('click', openDrawer);
    DOM.btnCloseDrawer.addEventListener('click', closeDrawer);
    DOM.drawerOverlay.addEventListener('click', (e) => {
      if (e.target === DOM.drawerOverlay) closeDrawer();
    });
  }

  // ==========================================================================
  // Booking Multi-Step Modal Controller
  // ==========================================================================
  function startBooking(movieId) {
    const movie = CINE_DATA.movies.find(m => m.id === movieId);
    if (!movie) return;

    // Reset current booking draft
    cineState.currentBooking = {
      movie: movie,
      cinema: null,
      showtime: null,
      dateString: cineState.getSelectedDate().fullDate,
      seats: [],
      concessions: {},
      promoCode: null,
      discount: 0,
      customer: {
        name: '',
        email: '',
        phone: ''
      },
      paymentMethod: 'card'
    };

    DOM.modalPosterThumb.src = movie.poster;
    DOM.modalPosterThumb.onerror = () => {
      DOM.modalPosterThumb.src = generateFallbackPosterSVG(movie);
    };
    DOM.modalMovieTitle.textContent = movie.title;
    DOM.modalMovieSub.textContent = `${movie.runtime} • ${movie.ageRating} • ${movie.genres.join(', ')}`;

    goToStep(1);
    DOM.bookingModal.classList.add('active');
  }

  function closeBookingModal() {
    DOM.bookingModal.classList.remove('active');
  }

  function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Update Step Indicators
    DOM.stepNodes.forEach((node, idx) => {
      const stepIdx = idx + 1;
      node.classList.remove('active', 'completed');
      if (stepIdx === currentStep) {
        node.classList.add('active');
      } else if (stepIdx < currentStep) {
        node.classList.add('completed');
      }
    });

    // Render step content
    if (stepNumber === 1) renderStep1Showtimes();
    if (stepNumber === 2) renderStep2Seats();
    if (stepNumber === 3) renderStep3Concessions();
    if (stepNumber === 4) renderStep4Checkout();
    if (stepNumber === 5) renderStep5Confirmation();
  }

  // STEP 1: Cinemas & Showtimes
  function renderStep1Showtimes() {
    const movie = cineState.currentBooking.movie;
    const dateObj = cineState.getSelectedDate();

    DOM.modalBody.innerHTML = `
      <div class="cinema-selection-view">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
          <h2 style="font-size: 1.3rem; font-weight: 800;">Choose Theater & Showtime</h2>
          <div style="font-size: 0.88rem; color: var(--accent-gold); font-weight: 600;">📅 ${dateObj.fullDate}</div>
        </div>

        ${CINE_DATA.cinemas.map(cinema => `
          <div class="cinema-card-item">
            <div class="cinema-header-row">
              <div>
                <h3 class="cinema-title">${cinema.name}</h3>
                <div class="cinema-address">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${cinema.address}
                </div>
              </div>
              <span class="cinema-distance">${cinema.distance}</span>
            </div>

            <div class="cinema-amenities">
              ${cinema.amenities.map(a => `<span class="amenity-chip">✨ ${a}</span>`).join('')}
            </div>

            <div class="showtimes-grid">
              ${cinema.showtimes.map(st => `
                <button class="showtime-btn" onclick="window.CineApp.selectShowtime('${cinema.id}', '${st.time}')">
                  <span class="showtime-time">${st.time}</span>
                  <span class="showtime-format">${st.format}</span>
                  <span class="showtime-status-dot ${st.status}" title="${st.status === 'available' ? 'Available' : 'Filling Fast'}"></span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function selectShowtime(cinemaId, time) {
    const cinema = CINE_DATA.cinemas.find(c => c.id === cinemaId);
    if (!cinema) return;
    const showtime = cinema.showtimes.find(s => s.time === time);
    if (!showtime) return;

    cineState.currentBooking.cinema = cinema;
    cineState.currentBooking.showtime = showtime;
    cineState.currentBooking.dateString = cineState.getSelectedDate().fullDate;

    goToStep(2);
  }

  // STEP 2: Realistic Interactive Seat Map
  function renderStep2Seats() {
    const movie = cineState.currentBooking.movie;
    const cinema = cineState.currentBooking.cinema;
    const showtime = cineState.currentBooking.showtime;
    const occupiedSeats = cineState.getOccupiedSeats(movie.id, cinema.id, showtime.time, cineState.currentBooking.dateString);

    const layout = CINE_DATA.seatLayout;

    DOM.modalBody.innerHTML = `
      <div class="seat-selection-view">
        <div class="seat-map-top-bar">
          <div class="theater-info-badge">
            ${cinema.name} • <span>${showtime.screen}</span> (${showtime.format}) • ${showtime.time}
          </div>
          <button class="audio-toggle-btn" onclick="window.CineApp.toggleAudioInsideModal()">
            <span id="modalAudioIcon">🔊</span>
            <span id="modalAudioLabel">${cineAudio.isMuted() ? 'Audio Muted' : 'Sound Effects ON'}</span>
          </button>
        </div>

        <!-- Realistic Curved Silver Screen with Projection Beam -->
        <div class="cinema-screen-container">
          <div class="cinema-screen-curved"></div>
          <div class="cinema-screen-beam"></div>
          <div class="screen-label">CINEMA SCREEN - ALL EYES THIS WAY</div>
        </div>

        <!-- Legend -->
        <div class="seat-legend">
          <div class="legend-item"><div class="seat-sample available"></div> Available</div>
          <div class="legend-item"><div class="seat-sample selected"></div> Selected</div>
          <div class="legend-item"><div class="seat-sample occupied"></div> Sold Out</div>
          <div class="legend-item"><div class="seat-sample vip"></div> LUXE Recliner (₹${movie.priceTier.vip})</div>
          <div class="legend-item"><div class="seat-sample wheelchair"></div> Accessible (₹${movie.priceTier.standard})</div>
        </div>

        <!-- Seats Grid -->
        <div class="seats-grid-layout" id="seatMatrixContainer">
          ${layout.rows.map(r => {
            const rowPrice = r.tier === 'vip' ? movie.priceTier.vip : (r.tier === 'premium' ? movie.priceTier.premium : movie.priceTier.standard);
            return `
              <div class="seat-row">
                <div class="row-letter">${r.row}</div>
                ${Array.from({ length: layout.seatsPerRow }, (_, sIdx) => {
                  const seatNum = sIdx + 1;
                  const seatId = `${r.row}${seatNum}`;
                  const isOccupied = occupiedSeats.has(seatId);
                  const isSelected = cineState.isSeatSelected(seatId);
                  const isAisleGap = layout.aisleIndices.includes(seatNum);

                  let seatClasses = ['seat-btn'];
                  if (r.tier === 'vip') seatClasses.push('vip');
                  if (r.isAccessible) seatClasses.push('accessible');
                  if (isOccupied) seatClasses.push('occupied');
                  if (isSelected) seatClasses.push('selected');

                  return `
                    ${isAisleGap ? '<div class="aisle-gap"></div>' : ''}
                    <button 
                      class="${seatClasses.join(' ')}"
                      data-seat-id="${seatId}"
                      data-row="${r.row}"
                      data-num="${seatNum}"
                      data-tier="${r.tier}"
                      data-price="${rowPrice}"
                      data-accessible="${r.isAccessible}"
                      ${isOccupied ? 'disabled' : ''}
                      onclick="window.CineApp.onSeatClick(this)"
                    >
                      ${r.isAccessible ? '♿' : seatNum}
                      <span class="seat-tooltip">${r.row}-${seatNum} • ${r.name} • ₹${rowPrice}</span>
                    </button>
                  `;
                }).join('')}
                <div class="row-letter">${r.row}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Sticky Selection Summary Bar -->
        <div class="seat-summary-bar">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.35rem;">SELECTED SEATS (${cineState.currentBooking.seats.length}/8 Max):</div>
            <div class="selected-seats-list" id="selectedSeatsList">
              ${renderSelectedSeatsChips()}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div class="seat-price-total">
              <span id="seatCountText">${cineState.currentBooking.seats.length} Tickets: </span>
              <span id="seatsPriceTotal" style="color:var(--accent-gold); font-size:1.4rem;">₹${cineState.calculateTotals().seatsSubtotal}</span>
            </div>
            <button class="btn-primary-hero" id="btnContinueToSnacks" ${cineState.currentBooking.seats.length === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="window.CineApp.goToStep(3)">
              Continue to Snacks →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSelectedSeatsChips() {
    if (!cineState.currentBooking.seats.length) {
      return `<span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No seats selected yet</span>`;
    }
    return cineState.currentBooking.seats.map(s => `
      <div class="selected-seat-chip">
        <span>${s.id} (₹${s.price})</span>
        <span class="chip-remove" onclick="window.CineApp.removeSeat('${s.id}')">✕</span>
      </div>
    `).join('');
  }

  function onSeatClick(btn) {
    const seatId = btn.dataset.seatId;
    const row = btn.dataset.row;
    const num = parseInt(btn.dataset.num, 10);
    const tier = btn.dataset.tier;
    const price = parseFloat(btn.dataset.price);
    const isAccessible = btn.dataset.accessible === 'true';

    const seatObj = { id: seatId, row, num, tier, price, isAccessible };
    const result = cineState.toggleSeat(seatObj);

    if (result === 'MAX_LIMIT_REACHED') {
      cineAudio.playError();
      showToast('You can select a maximum of 8 seats per booking.', 'warning');
      return;
    }

    if (result === true) {
      // Added
      btn.classList.add('selected');
      cineAudio.playSeatSelect();
    } else {
      // Removed
      btn.classList.remove('selected');
      cineAudio.playSeatDeselect();
    }

    updateSeatSelectionUI();
  }

  function removeSeat(seatId) {
    const btn = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (btn) btn.classList.remove('selected');
    cineState.toggleSeat({ id: seatId });
    cineAudio.playSeatDeselect();
    updateSeatSelectionUI();
  }

  function updateSeatSelectionUI() {
    const list = document.getElementById('selectedSeatsList');
    if (list) list.innerHTML = renderSelectedSeatsChips();

    const countText = document.getElementById('seatCountText');
    const priceText = document.getElementById('seatsPriceTotal');
    const continueBtn = document.getElementById('btnContinueToSnacks');

    const totals = cineState.calculateTotals();
    const count = cineState.currentBooking.seats.length;

    if (countText) countText.textContent = `${count} ${count === 1 ? 'Ticket' : 'Tickets'}: `;
    if (priceText) priceText.textContent = `₹${totals.seatsSubtotal}`;

    if (continueBtn) {
      if (count > 0) {
        continueBtn.removeAttribute('disabled');
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
      } else {
        continueBtn.setAttribute('disabled', 'true');
        continueBtn.style.opacity = '0.5';
        continueBtn.style.cursor = 'not-allowed';
      }
    }
  }

  function toggleAudioInsideModal() {
    const isMuted = cineAudio.toggleMute();
    updateAudioUI();
    const icon = document.getElementById('modalAudioIcon');
    const label = document.getElementById('modalAudioLabel');
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    if (label) label.textContent = isMuted ? 'Audio Muted' : 'Sound Effects ON';
  }

  // STEP 3: Concessions & Add-Ons
  function renderStep3Concessions() {
    DOM.modalBody.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800;">Gourmet Cinema Bites & Drinks</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem;">Skip the queue! Pick up fresh & warm at the CineBites express counter.</p>
          </div>
          <button class="btn-secondary-hero" onclick="window.CineApp.goToStep(4)">Skip to Checkout →</button>
        </div>

        <div class="concessions-grid">
          ${CINE_DATA.concessions.map(c => {
            const qty = cineState.currentBooking.concessions[c.id] || 0;
            return `
              <div class="snack-card">
                <div class="snack-icon">${c.icon}</div>
                <div class="snack-info">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 class="snack-title">${c.name}</h4>
                    ${c.badge ? `<span class="badge-pill badge-rt" style="font-size:0.65rem;">${c.badge}</span>` : ''}
                  </div>
                  <div class="snack-desc">${c.description}</div>
                  <div class="snack-bottom">
                    <span class="snack-price">₹${c.price}</span>
                    <div class="snack-counter">
                      <button class="counter-btn" onclick="window.CineApp.changeConcession('${c.id}', -1)">-</button>
                      <span class="counter-qty" id="qty-${c.id}">${qty}</span>
                      <button class="counter-btn" onclick="window.CineApp.changeConcession('${c.id}', 1)">+</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="seat-summary-bar">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Current Order Summary</div>
            <div style="font-weight: 700; font-size: 1.05rem;" id="snacksTotalLabel">
              ${cineState.currentBooking.seats.length} Seats + Concessions
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn-secondary-hero" onclick="window.CineApp.goToStep(2)">← Back to Seats</button>
            <button class="btn-primary-hero" onclick="window.CineApp.goToStep(4)">
              Proceed to Payment (₹<span id="step3GrandTotal">${cineState.calculateTotals().grandTotal}</span>) →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function changeConcession(id, delta) {
    cineState.updateConcession(id, delta);
    const qtySpan = document.getElementById(`qty-${id}`);
    if (qtySpan) {
      qtySpan.textContent = cineState.currentBooking.concessions[id] || 0;
    }
    const grandTotalSpan = document.getElementById('step3GrandTotal');
    if (grandTotalSpan) {
      grandTotalSpan.textContent = cineState.calculateTotals().grandTotal;
    }
  }

  // STEP 4: Realistic Checkout & 3D Interactive Card Preview
  function renderStep4Checkout() {
    const movie = cineState.currentBooking.movie;
    const cinema = cineState.currentBooking.cinema;
    const showtime = cineState.currentBooking.showtime;
    const totals = cineState.calculateTotals();

    DOM.modalBody.innerHTML = `
      <div class="checkout-view">
        <!-- Left: Payment Form & 3D Card -->
        <div class="payment-left-col">
          <!-- 3D Flipping Card Preview -->
          <div class="card-3d-wrap" id="card3dWrap">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div class="card-chip-brand">
                  <div class="card-chip"></div>
                  <div class="card-brand-logo" id="cardBrandLogo">VISA</div>
                </div>
                <div class="card-number-display" id="cardNumPreview">•••• •••• •••• ••••</div>
                <div class="card-holder-exp">
                  <div>
                    <div class="card-label-small">CARDHOLDER</div>
                    <div class="card-val" id="cardHolderPreview">YOUR NAME</div>
                  </div>
                  <div>
                    <div class="card-label-small">EXPIRES</div>
                    <div class="card-val" id="cardExpPreview">MM/YY</div>
                  </div>
                </div>
              </div>

              <div class="card-face card-back">
                <div class="card-magnetic-stripe"></div>
                <div style="padding: 0 1.5rem; text-align:right;">
                  <div class="card-label-small" style="margin-bottom:0.3rem;">SECURITY CODE</div>
                  <div class="card-cvv-stripe" id="cardCvvPreview">•••</div>
                </div>
                <div style="padding: 0.5rem 1.5rem 0; font-size: 0.65rem; color: var(--text-muted); text-align: center;">
                  CinePass Secure Encryption • 256-bit SSL Protected
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Tabs -->
          <div class="payment-tabs">
            <button class="payment-tab-btn active" id="tabUPI" onclick="window.CineApp.switchPaymentTab('upi')">
              📱 Instant UPI & QR
            </button>
            <button class="payment-tab-btn" id="tabCard" onclick="window.CineApp.switchPaymentTab('card')">
              💳 RuPay / Cards
            </button>
            <button class="payment-tab-btn" id="tabApplePay" onclick="window.CineApp.switchPaymentTab('applepay')">
              ⚡ Net Banking
            </button>
          </div>

          <!-- Card Form View -->
          <div id="cardPaymentForm" style="display:none;">
            <div class="form-group">
              <label class="form-label">CARD NUMBER (RUPAY / VISA / MASTERCARD)</label>
              <input type="text" class="form-input" id="inputCardNumber" maxlength="19" placeholder="6080 •••• •••• 1234" />
            </div>
            <div class="form-group">
              <label class="form-label">NAME ON CARD</label>
              <input type="text" class="form-input" id="inputCardHolder" placeholder="RAHUL SHARMA" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">EXPIRY DATE</label>
                <input type="text" class="form-input" id="inputCardExp" maxlength="5" placeholder="MM/YY" />
              </div>
              <div class="form-group">
                <label class="form-label">CVV / CVC</label>
                <input type="password" class="form-input" id="inputCardCvv" maxlength="4" placeholder="123" />
              </div>
            </div>
          </div>

          <!-- Instant Pay View (Net Banking / Fast Checkout) -->
          <div id="walletPaymentForm" style="display:none; text-align:center; padding: 2rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏛️</div>
            <h4 style="margin-bottom: 0.5rem;">Indian Net Banking</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">Instant direct payment via HDFC Bank, State Bank of India, ICICI, or Axis Bank.</p>
            <button class="btn-primary-hero" style="width: 100%; justify-content: center;" onclick="window.CineApp.processWalletCheckout()">
              Pay ₹${totals.grandTotal} via Net Banking
            </button>
          </div>

          <!-- UPI / QR Pay View -->
          <div id="upiPaymentForm" style="text-align:center; padding: 1.5rem 1rem;">
            <canvas id="checkoutQrCanvas" width="160" height="160" style="margin: 0 auto 1rem; border-radius: 8px; background:#fff; padding:6px;"></canvas>
            <h4>Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)</h4>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">UPI ID: cinepass.pay@icici • Zero Convenience Surcharge</p>
          </div>

          <!-- Contact Details -->
          <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; color: #fff;">E-Ticket & WhatsApp Delivery Contact</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">FULL NAME</label>
                <input type="text" class="form-input" id="inputCustomerName" placeholder="Rahul Sharma" value="${cineState.currentBooking.customer.name}" />
              </div>
              <div class="form-group">
                <label class="form-label">EMAIL ADDRESS</label>
                <input type="email" class="form-input" id="inputCustomerEmail" placeholder="rahul@example.com" value="${cineState.currentBooking.customer.email}" />
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">WHATSAPP / MOBILE NUMBER</label>
              <input type="tel" class="form-input" id="inputCustomerPhone" placeholder="+91 98200 12345" value="${cineState.currentBooking.customer.phone}" />
            </div>
          </div>
        </div>

        <!-- Right: Order Breakdown -->
        <div class="order-summary-box">
          <h3 class="summary-title">Booking Summary</h3>

          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 700; font-size: 1.1rem; color: #fff;">${movie.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${cinema.name}</div>
            <div style="font-size: 0.8rem; color: var(--accent-gold); margin-top: 0.2rem;">
              📅 ${cineState.currentBooking.dateString} • ⏰ ${showtime.time} (${showtime.format})
            </div>
          </div>

          <div class="summary-item-row">
            <span>Seats (${cineState.currentBooking.seats.map(s => s.id).join(', ')})</span>
            <span>₹${totals.seatsSubtotal}</span>
          </div>

          ${totals.concessionsSubtotal > 0 ? `
            <div class="summary-item-row">
              <span>Gourmet Concessions</span>
              <span>₹${totals.concessionsSubtotal}</span>
            </div>
          ` : ''}

          <div class="summary-item-row">
            <span>Convenience Booking Fee</span>
            <span>₹${totals.convenienceFee}</span>
          </div>

          <div class="summary-item-row">
            <span>Integrated GST (18%)</span>
            <span>₹${totals.tax}</span>
          </div>

          ${totals.discount > 0 ? `
            <div class="summary-item-row" style="color: var(--accent-emerald);">
              <span>Promo Discount (${cineState.currentBooking.promoCode})</span>
              <span>-₹${totals.discount}</span>
            </div>
          ` : ''}

          <div class="summary-divider"></div>

          <!-- Promo Code Engine -->
          <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.4rem;">
            PROMO CODES: (Try: <span style="color:var(--accent-gold); cursor:pointer;" onclick="document.getElementById('inputPromoCode').value='DESI100'">DESI100</span> or <span style="color:var(--accent-gold); cursor:pointer;" onclick="document.getElementById('inputPromoCode').value='RUPAY20'">RUPAY20</span> or <span style="color:var(--accent-gold); cursor:pointer;" onclick="document.getElementById('inputPromoCode').value='SNACKS50'">SNACKS50</span>)
          </div>
          <div class="promo-input-wrap">
            <input type="text" id="inputPromoCode" placeholder="ENTER CODE" value="${cineState.currentBooking.promoCode || ''}" />
            <button class="btn-apply-promo" onclick="window.CineApp.applyPromoCode()">Apply</button>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-grand-total">
            <span>Total Payable</span>
            <span id="grandTotalDisplay">₹${totals.grandTotal}</span>
          </div>

          <button class="btn-primary-hero" style="width: 100%; justify-content: center; margin-top: 1.5rem;" onclick="window.CineApp.submitBookingPayment()">
            Confirm & Pay ₹${totals.grandTotal}
          </button>
          <div style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.75rem;">
            🔒 256-Bit SSL Encrypted Indian Banking Gateway
          </div>
        </div>
      </div>
    `;

    setupCheckoutCardInteractivity();
    // Default render UPI QR
    setTimeout(() => {
      const canvas = document.getElementById('checkoutQrCanvas');
      if (canvas && window.CineQR) {
        CineQR.draw(canvas, `upi://pay?pa=cinepass@icici&pn=CinePassIndia&am=${cineState.calculateTotals().grandTotal}&cu=INR`, { size: 160 });
      }
    }, 60);
  }

  function setupCheckoutCardInteractivity() {
    const cardWrap = document.getElementById('card3dWrap');
    const numInput = document.getElementById('inputCardNumber');
    const holderInput = document.getElementById('inputCardHolder');
    const expInput = document.getElementById('inputCardExp');
    const cvvInput = document.getElementById('inputCardCvv');

    const numPreview = document.getElementById('cardNumPreview');
    const holderPreview = document.getElementById('cardHolderPreview');
    const expPreview = document.getElementById('cardExpPreview');
    const cvvPreview = document.getElementById('cardCvvPreview');
    const brandLogo = document.getElementById('cardBrandLogo');

    if (!numInput) return;

    numInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = val;
      numPreview.textContent = val || '•••• •••• •••• ••••';

      // Detect Brand (RuPay / Visa / Mastercard / Amex)
      if (val.startsWith('60') || val.startsWith('65') || val.startsWith('508') || val.startsWith('353') || val.startsWith('81')) {
        brandLogo.textContent = 'RUPAY';
      } else if (val.startsWith('4')) {
        brandLogo.textContent = 'VISA';
      } else if (val.startsWith('5')) {
        brandLogo.textContent = 'MASTERCARD';
      } else if (val.startsWith('3')) {
        brandLogo.textContent = 'AMEX';
      } else {
        brandLogo.textContent = 'CARD';
      }
    });

    holderInput.addEventListener('input', (e) => {
      holderPreview.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });

    expInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2);
      }
      e.target.value = val;
      expPreview.textContent = val || 'MM/YY';
    });

    cvvInput.addEventListener('focus', () => cardWrap.classList.add('flipped'));
    cvvInput.addEventListener('blur', () => cardWrap.classList.remove('flipped'));
    cvvInput.addEventListener('input', (e) => {
      cvvPreview.textContent = e.target.value || '•••';
    });
  }

  function switchPaymentTab(tab) {
    cineState.currentBooking.paymentMethod = tab;
    document.querySelectorAll('.payment-tab-btn').forEach(btn => btn.classList.remove('active'));

    const cardForm = document.getElementById('cardPaymentForm');
    const walletForm = document.getElementById('walletPaymentForm');
    const upiForm = document.getElementById('upiPaymentForm');
    const cardWrap = document.getElementById('card3dWrap');

    if (tab === 'card') {
      document.getElementById('tabCard').classList.add('active');
      cardForm.style.display = 'block';
      cardWrap.style.display = 'block';
      walletForm.style.display = 'none';
      upiForm.style.display = 'none';
    } else if (tab === 'applepay') {
      document.getElementById('tabApplePay').classList.add('active');
      cardForm.style.display = 'none';
      cardWrap.style.display = 'none';
      walletForm.style.display = 'block';
      upiForm.style.display = 'none';
    } else if (tab === 'upi') {
      document.getElementById('tabUPI').classList.add('active');
      cardForm.style.display = 'none';
      cardWrap.style.display = 'none';
      walletForm.style.display = 'none';
      upiForm.style.display = 'block';
      // Render UPI QR Code
      const canvas = document.getElementById('checkoutQrCanvas');
      if (canvas && window.CineQR) {
        CineQR.draw(canvas, `upi://pay?pa=cinepass@icici&pn=CinePassIndia&am=${cineState.calculateTotals().grandTotal}&cu=INR`, { size: 160 });
      }
    }
  }

  function applyPromoCode() {
    const input = document.getElementById('inputPromoCode');
    const code = input ? input.value : '';
    const result = cineState.applyPromo(code);

    if (result.success) {
      showToast(`Promo Applied! ${result.promo.description}`, 'success');
      cineAudio.playSeatSelect();
      renderStep4Checkout();
    } else {
      cineAudio.playError();
      showToast(result.message, 'error');
    }
  }

  function submitBookingPayment() {
    const nameInput = document.getElementById('inputCustomerName');
    const emailInput = document.getElementById('inputCustomerEmail');
    const phoneInput = document.getElementById('inputCustomerPhone');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!name || !email) {
      cineAudio.playError();
      showToast('Please enter your full name and email address for ticket delivery.', 'warning');
      return;
    }

    cineState.currentBooking.customer = { name, email, phone };

    // Finalize booking
    const completedBooking = cineState.confirmBooking();
    cineAudio.playSuccessChime();
    showToast('Payment successful! Your tickets are ready.', 'success');
    updateTicketsBadge();
    goToStep(5);
  }

  function processWalletCheckout() {
    const nameInput = document.getElementById('inputCustomerName');
    const emailInput = document.getElementById('inputCustomerEmail');
    if (!nameInput.value) nameInput.value = 'John Doe';
    if (!emailInput.value) emailInput.value = 'guest@cinepass.com';
    submitBookingPayment();
  }

  // STEP 5: Digital Boarding Pass & Confirmation
  function renderStep5Confirmation() {
    const lastBooking = cineState.bookings[0];
    if (!lastBooking) return;

    DOM.modalBody.innerHTML = `
      <div class="confirmation-view">
        <div class="success-header-badge">
          <div class="success-circle-icon">✓</div>
          <h2 class="success-title">Booking Confirmed!</h2>
          <div class="success-sub">A confirmation email and SMS have been sent to <strong>${lastBooking.customer.email}</strong></div>
        </div>

        <!-- Boarding Pass Ticket Stub -->
        <div class="ticket-boarding-pass" id="printableTicketArea">
          <div class="ticket-header-strip">
            <div class="ticket-brand">🍿 CINEPASS CINEMAS</div>
            <div class="ticket-booking-ref">REF: ${lastBooking.id}</div>
          </div>

          <div class="ticket-main-grid">
            <div class="ticket-info-col">
              <div class="ticket-movie-title">${lastBooking.movieTitle}</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
                ${lastBooking.cinemaName} • ${lastBooking.cinemaAddress}
              </div>

              <div class="ticket-details-grid">
                <div class="ticket-field">
                  <span class="ticket-field-label">DATE</span>
                  <span class="ticket-field-val">${lastBooking.dateString}</span>
                </div>
                <div class="ticket-field">
                  <span class="ticket-field-label">TIME</span>
                  <span class="ticket-field-val highlight">${lastBooking.showtime}</span>
                </div>
                <div class="ticket-field">
                  <span class="ticket-field-label">AUDITORIUM / FORMAT</span>
                  <span class="ticket-field-val">${lastBooking.screen} (${lastBooking.format})</span>
                </div>
                <div class="ticket-field">
                  <span class="ticket-field-label">SEATS</span>
                  <span class="ticket-field-val highlight">${lastBooking.seats.map(s => s.id).join(', ')} (${lastBooking.seats.length})</span>
                </div>
                <div class="ticket-field">
                  <span class="ticket-field-label">GUEST</span>
                  <span class="ticket-field-val">${lastBooking.customer.name}</span>
                </div>
                <div class="ticket-field">
                  <span class="ticket-field-label">TOTAL PAID</span>
                  <span class="ticket-field-val">₹${lastBooking.totals.grandTotal}</span>
                </div>
              </div>

              ${lastBooking.concessions && lastBooking.concessions.length ? `
                <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.15); font-size: 0.8rem;">
                  <span style="color: var(--accent-gold); font-weight: 700;">Concessions Added: </span>
                  <span>${lastBooking.concessions.map(c => `${c.count}x ${c.name}`).join(', ')}</span>
                </div>
              ` : ''}
            </div>

            <div class="ticket-qr-col">
              <canvas class="canvas-qr" id="confirmationQrCanvas" width="140" height="140"></canvas>
              <div class="ticket-qr-hint">Scan at cinema entry turnstile</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="ticket-actions-row">
          <button class="btn-print-ticket" onclick="window.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Ticket / Save PDF
          </button>
          <button class="btn-done-booking" onclick="window.CineApp.closeBookingModal()">
            Done & Book Another Movie
          </button>
        </div>
      </div>
    `;

    // Render Canvas QR Code
    setTimeout(() => {
      const qrCanvas = document.getElementById('confirmationQrCanvas');
      if (qrCanvas && window.CineQR) {
        CineQR.draw(qrCanvas, lastBooking.qrPayload, { size: 140 });
      }
    }, 50);
  }

  // ==========================================================================
  // Trailer Modal
  // ==========================================================================
  function openTrailer(trailerUrl, movieTitle) {
    if (!trailerUrl) return;
    DOM.trailerIframeWrap.innerHTML = `
      <iframe 
        src="${trailerUrl}?autoplay=1&rel=0&modestbranding=1" 
        title="${movieTitle} Trailer" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    DOM.trailerModal.classList.add('active');
  }

  function closeTrailerModal() {
    DOM.trailerModal.classList.remove('active');
    DOM.trailerIframeWrap.innerHTML = '';
  }

  // ==========================================================================
  // My Bookings Drawer
  // ==========================================================================
  function updateTicketsBadge() {
    const count = cineState.bookings.length;
    DOM.ticketsCountBadge.textContent = count;
    DOM.ticketsCountBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  function openDrawer() {
    renderSavedBookings();
    DOM.drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    DOM.drawerOverlay.classList.remove('active');
  }

  function renderSavedBookings() {
    if (!cineState.bookings.length) {
      DOM.savedBookingsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🎟️</div>
          <h4 style="color:#fff; margin-bottom: 0.25rem;">No Bookings Yet</h4>
          <p style="font-size: 0.85rem;">Your confirmed cinema tickets will show up here with live QR entry passes.</p>
        </div>
      `;
      return;
    }

    DOM.savedBookingsList.innerHTML = cineState.bookings.map(b => `
      <div class="saved-ticket-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">${b.movieTitle}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${b.cinemaName}</div>
          </div>
          <span style="font-family: monospace; font-size: 0.75rem; background: rgba(245,197,24,0.15); color: var(--accent-gold); padding: 0.2rem 0.5rem; border-radius: 4px;">
            ${b.id}
          </span>
        </div>

        <div style="display:flex; gap: 1rem; font-size: 0.8rem; color: #cbd5e1;">
          <div>📅 ${b.dateString}</div>
          <div>⏰ ${b.showtime}</div>
          <div>💺 Seats: <strong>${b.seats.map(s => s.id).join(', ')}</strong></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle);">
          <div style="font-weight: 700; color: var(--accent-gold);">₹${b.totals.grandTotal}</div>
          <div style="display:flex; gap: 0.5rem;">
            <button class="amenity-chip" style="cursor:pointer; color: #ef4444; border: 1px solid rgba(239,68,68,0.3);" onclick="window.CineApp.cancelBooking('${b.id}')">Cancel</button>
            <button class="amenity-chip" style="cursor:pointer; color: #fff; background: rgba(255,255,255,0.15);" onclick="window.CineApp.viewSavedTicket('${b.id}')">View Pass</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function viewSavedTicket(bookingId) {
    const booking = cineState.bookings.find(b => b.id === bookingId);
    if (!booking) return;
    // Move to front of bookings to display in Step 5
    const idx = cineState.bookings.indexOf(booking);
    cineState.bookings.splice(idx, 1);
    cineState.bookings.unshift(booking);
    closeDrawer();
    startBooking(booking.movieId);
    goToStep(5);
  }

  function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this cinema reservation? A full refund will be processed.')) {
      cineState.cancelBooking(bookingId);
      updateTicketsBadge();
      renderSavedBookings();
      showToast('Reservation cancelled. Refund has been initiated.', 'info');
    }
  }

  // High-Resolution Fallback SVG Cinema Poster Generator
  function generateFallbackPosterSVG(movie) {
    const title = (movie ? (movie.posterTitle || movie.title) : 'CINEMA').toUpperCase();
    const subtitle = (movie ? (movie.posterSubtitle || movie.director) : 'IN THEATERS').toUpperCase();
    const rating = movie ? movie.rating : '9.2';
    const age = movie ? movie.ageRating : 'U/A';
    const theme = movie ? (movie.posterTheme || 'gold') : 'gold';

    let primaryColor = '#f5c518';
    let gradColor = '#fef08a';
    if (theme === 'saffron') { primaryColor = '#ff9933'; gradColor = '#fed7aa'; }
    if (theme === 'army') { primaryColor = '#eab308'; gradColor = '#fef08a'; }
    if (theme === 'crimson') { primaryColor = '#ef4444'; gradColor = '#fca5a5'; }
    if (theme === 'cyan') { primaryColor = '#06b6d4'; gradColor = '#a5f3fc'; }
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#151b2e"/>
            <stop offset="60%" stop-color="#0b0e1a"/>
            <stop offset="100%" stop-color="#04060c"/>
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="400" height="600" fill="url(#bgGrad)"/>
        <circle cx="200" cy="240" r="180" fill="url(#glowGrad)"/>
        
        <!-- Border Filigree -->
        <rect x="18" y="18" width="364" height="564" fill="none" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.5" rx="8"/>
        <text x="200" y="44" fill="${primaryColor}" font-size="11" font-weight="800" letter-spacing="3.5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">★ CINEPASS EXCLUSIVE RELEASE ★</text>
        <line x1="40" y1="56" x2="360" y2="56" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        
        <!-- Center Emblem -->
        <polygon points="200,140 216,182 260,182 225,208 238,250 200,224 162,250 175,208 140,182 184,182" fill="none" stroke="${primaryColor}" stroke-width="2.5"/>
        <circle cx="200" cy="198" r="9" fill="${primaryColor}"/>
        
        <!-- Title & Subtitle -->
        <text x="200" y="325" fill="#ffffff" font-size="28" font-weight="900" letter-spacing="2" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">${title}</text>
        <text x="200" y="358" fill="${gradColor}" font-size="12" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">${subtitle}</text>
        
        <!-- Bottom Credits -->
        <line x1="50" y1="480" x2="350" y2="480" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <text x="200" y="515" fill="#e2e8f0" font-size="12" font-weight="700" letter-spacing="1.5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">IN IMAX 3D • 4DX • DOLBY ATMOS</text>
        <text x="200" y="540" fill="#94a3b8" font-size="10.5" letter-spacing="1" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif">CERTIFIED ${age} • AUDIENCE RATING ${rating}/10</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function onPosterError(img, movieId) {
    const movie = CINE_DATA.movies.find(m => m.id === movieId);
    img.onerror = null;
    img.src = generateFallbackPosterSVG(movie);
  }

  // Global Exports for inline HTML onclick handlers
  window.CineApp = {
    startBooking,
    closeBookingModal,
    goToStep,
    selectShowtime,
    onSeatClick,
    removeSeat,
    changeConcession,
    switchPaymentTab,
    applyPromoCode,
    submitBookingPayment,
    processWalletCheckout,
    openTrailer,
    closeTrailerModal,
    toggleAudioInsideModal,
    viewSavedTicket,
    cancelBooking,
    onPosterError
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

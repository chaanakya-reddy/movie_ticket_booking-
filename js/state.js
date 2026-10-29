// CinePass Application State Management
class CineStateManager {
  constructor() {
    this.currentCity = localStorage.getItem('cinepass_selected_city') || 'mumbai';
    this.activeGenre = 'All';
    this.searchQuery = '';
    this.selectedDateIndex = 0; // 0 = Today, 1 = Tomorrow, etc.

    // Active booking in progress
    this.currentBooking = {
      movie: null,
      cinema: null,
      showtime: null,
      dateString: '',
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

    // Load persisted bookings
    this.bookings = this.loadBookings();

    // Generate dates for the upcoming 7 days
    this.dates = this.generateUpcomingDates();
  }

  generateUpcomingDates() {
    const dates = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dayName: i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : days[d.getDay()]),
        dayNumber: d.getDate(),
        month: months[d.getMonth()],
        fullDate: `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
        isoDate: d.toISOString().split('T')[0]
      });
    }
    return dates;
  }

  getSelectedDate() {
    return this.dates[this.selectedDateIndex];
  }

  setCity(cityId) {
    this.currentCity = cityId;
    localStorage.setItem('cinepass_selected_city', cityId);
  }

  // Calculate deterministic occupied seats for any movie + cinema + showtime + date
  getOccupiedSeats(movieId, cinemaId, showtimeStr, dateStr) {
    // Generate pseudo-random hash
    const seed = `${movieId}-${cinemaId}-${showtimeStr}-${dateStr}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const occupied = new Set();
    const rows = CINE_DATA.seatLayout.rows;
    const seatsPerRow = CINE_DATA.seatLayout.seatsPerRow;

    // Pseudo-randomly mark ~25-40% seats as occupied
    for (let r = 0; r < rows.length; r++) {
      const rowChar = rows[r].row;
      for (let s = 1; s <= seatsPerRow; s++) {
        const val = Math.abs(Math.sin(hash + r * 19 + s * 37)) * 10000;
        const rand = val - Math.floor(val);
        // Prime center rows C-F tend to be more booked
        const centerBias = (r >= 2 && r <= 6 && s >= 4 && s <= 11) ? 0.45 : 0.28;
        if (rand < centerBias) {
          occupied.add(`${rowChar}${s}`);
        }
      }
    }

    // Also include seats already booked in persistent storage
    this.bookings.forEach(b => {
      if (b.movieId === movieId && b.cinemaId === cinemaId && b.showtime === showtimeStr && b.dateString === dateStr) {
        b.seats.forEach(s => occupied.add(s.id));
      }
    });

    return occupied;
  }

  // Seat management
  toggleSeat(seatObj) {
    const index = this.currentBooking.seats.findIndex(s => s.id === seatObj.id);
    if (index > -1) {
      this.currentBooking.seats.splice(index, 1);
      return false; // Removed
    } else {
      if (this.currentBooking.seats.length >= 8) {
        return 'MAX_LIMIT_REACHED';
      }
      this.currentBooking.seats.push(seatObj);
      return true; // Added
    }
  }

  isSeatSelected(seatId) {
    return this.currentBooking.seats.some(s => s.id === seatId);
  }

  // Concessions
  updateConcession(id, delta) {
    const current = this.currentBooking.concessions[id] || 0;
    const updated = Math.max(0, current + delta);
    if (updated === 0) {
      delete this.currentBooking.concessions[id];
    } else {
      this.currentBooking.concessions[id] = updated;
    }
  }

  // Price calculations
  calculateTotals() {
    const seatsSubtotal = this.currentBooking.seats.reduce((sum, s) => sum + s.price, 0);

    let concessionsSubtotal = 0;
    Object.entries(this.currentBooking.concessions).forEach(([id, qty]) => {
      const item = CINE_DATA.concessions.find(c => c.id === id);
      if (item) {
        concessionsSubtotal += item.price * qty;
      }
    });

    // Indian Multiplex Standard: ₹35 Convenience Fee per ticket + 18% GST (₹6.30) = ₹41.30 per ticket
    const feePerTicket = 35;
    const convenienceFee = this.currentBooking.seats.length * feePerTicket;
    const gstRate = 0.18;
    const tax = convenienceFee > 0 ? Math.round(convenienceFee * gstRate) : 0;
    const rawTotal = seatsSubtotal + concessionsSubtotal + convenienceFee;

    let discount = 0;
    if (this.currentBooking.promoCode) {
      const promo = CINE_DATA.promoCodes[this.currentBooking.promoCode];
      if (promo) {
        if (promo.discountPercent) {
          const calculated = (seatsSubtotal * promo.discountPercent) / 100;
          discount = promo.maxDiscount ? Math.min(calculated, promo.maxDiscount) : calculated;
        } else if (promo.flatDiscount) {
          discount = Math.min(rawTotal, promo.flatDiscount);
        }
      }
    }

    const grandTotal = Math.max(0, Math.round(rawTotal + tax - discount));

    return {
      seatsSubtotal,
      concessionsSubtotal,
      convenienceFee,
      tax,
      discount,
      grandTotal
    };
  }

  applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    const promo = CINE_DATA.promoCodes[cleanCode];
    if (promo) {
      if (promo.minSeats && this.currentBooking.seats.length < promo.minSeats) {
        return { success: false, message: `This code requires booking at least ${promo.minSeats} tickets.` };
      }
      this.currentBooking.promoCode = cleanCode;
      return { success: true, promo: promo };
    }
    return { success: false, message: 'Invalid or expired promo code.' };
  }

  removePromo() {
    this.currentBooking.promoCode = null;
  }

  // Finalize booking
  confirmBooking() {
    const totals = this.calculateTotals();
    const bookingRef = 'CP-' + Math.floor(100000 + Math.random() * 900000) + '-' + ['X', 'A', 'K', 'L', 'M', 'R'][Math.floor(Math.random() * 6)] + Math.floor(10 + Math.random() * 90);

    const newBooking = {
      id: bookingRef,
      createdAt: new Date().toISOString(),
      movieId: this.currentBooking.movie.id,
      movieTitle: this.currentBooking.movie.title,
      moviePoster: this.currentBooking.movie.poster,
      runtime: this.currentBooking.movie.runtime,
      ageRating: this.currentBooking.movie.ageRating,
      cinemaId: this.currentBooking.cinema.id,
      cinemaName: this.currentBooking.cinema.name,
      cinemaAddress: this.currentBooking.cinema.address,
      screen: this.currentBooking.showtime.screen,
      format: this.currentBooking.showtime.format,
      showtime: this.currentBooking.showtime.time,
      dateString: this.currentBooking.dateString,
      seats: [...this.currentBooking.seats],
      concessions: Object.entries(this.currentBooking.concessions).map(([id, count]) => {
        const item = CINE_DATA.concessions.find(c => c.id === id);
        return { id, name: item.name, count, price: item.price };
      }),
      totals,
      customer: { ...this.currentBooking.customer },
      paymentMethod: this.currentBooking.paymentMethod,
      qrPayload: `CINEPASS:${bookingRef}:${this.currentBooking.seats.map(s => s.id).join('-')}`
    };

    this.bookings.unshift(newBooking);
    this.saveBookings();
    return newBooking;
  }

  loadBookings() {
    try {
      const data = localStorage.getItem('cinepass_my_bookings');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveBookings() {
    try {
      localStorage.setItem('cinepass_my_bookings', JSON.stringify(this.bookings));
    } catch (e) {}
  }

  cancelBooking(bookingId) {
    this.bookings = this.bookings.filter(b => b.id !== bookingId);
    this.saveBookings();
  }
}

const cineState = new CineStateManager();

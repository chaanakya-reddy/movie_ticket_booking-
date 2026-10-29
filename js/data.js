// CinePass India - Realistic Indian Cinema & Movie Ticket Booking Data
const CINE_DATA = {
  currency: '₹',
  cities: [
    { id: 'mumbai', name: 'Mumbai', cinemasCount: 42 },
    { id: 'delhi', name: 'Delhi-NCR', cinemasCount: 48 },
    { id: 'bengaluru', name: 'Bengaluru', cinemasCount: 36 },
    { id: 'hyderabad', name: 'Hyderabad', cinemasCount: 34 },
    { id: 'chennai', name: 'Chennai', cinemasCount: 28 },
    { id: 'kolkata', name: 'Kolkata', cinemasCount: 22 },
    { id: 'pune', name: 'Pune', cinemasCount: 19 },
    { id: 'ahmedabad', name: 'Ahmedabad', cinemasCount: 17 }
  ],

  genres: ['All', 'Mythology & Epic', 'Action', 'Historical War', 'Adventure & Thriller', 'IMAX Specials'],

  movies: [
    {
      id: 'ramayana',
      title: 'Ramayana: Part 1',
      tagline: 'The timeless divine epic of virtue, devotion, and righteousness.',
      rating: '9.8',
      rottenTomatoes: '98%',
      ageRating: 'U (Universal)',
      runtime: '185 min',
      genres: ['Mythology & Epic', 'Action', 'IMAX Specials'],
      releaseDate: 'Diwali 2025',
      language: 'Hindi (Original), Telugu, Tamil, Kannada, Malayalam (Dolby Atmos)',
      formats: ['IMAX 3D Laser', 'Dolby Cinema', '4DX 3D', 'Standard 3D'],
      director: 'Nitesh Tiwari',
      cast: ['Ranbir Kapoor (Lord Rama)', 'Sai Pallavi (Mata Sita)', 'Yash (Lankesh Raavan)', 'Sunny Deol (Hanuman)', 'Arun Govil'],
      synopsis: 'A grand, deeply faithful cinematic retelling of the sacred Ramayana. Tracing the divine birth of Lord Rama, his marriage to Sita Devi, the fourteen years of forest exile, and the prelude to the war against the demon king of Lanka.',
      poster: 'assets/posters/ramayana.jpg',
      backdrop: 'assets/posters/ramayana.jpg',
      trailerUrl: 'https://www.youtube.com/embed/8HiWKbDTc7w',
      featured: true,
      priceTier: { standard: 280, premium: 460, vip: 880 }
    },
    {
      id: 'fauzi',
      title: 'Fauzi (Fauji)',
      tagline: 'A soldier\'s sacred oath written in blood, grit, and sacrifice.',
      rating: '9.5',
      rottenTomatoes: '95%',
      ageRating: 'U/A 16+',
      runtime: '172 min',
      genres: ['Historical War', 'Action', 'IMAX Specials'],
      releaseDate: 'March 2027',
      language: 'Telugu (Original), Hindi, Tamil, Malayalam (Dolby Atmos)',
      formats: ['IMAX 2D', '4DX Motion', 'Dolby Cinema', 'ScreenX'],
      director: 'Hanu Raghavapudi',
      cast: ['Prabhas (Major Subhash)', 'Imanvi', 'Mithun Chakraborty', 'Anupam Kher', 'Jaya Prada'],
      synopsis: 'Set against the tumultuous backdrop of the 1942 World War II era, an intrepid Indian soldier in the Azad Hind Army discovers an insidious conspiracy and embarks on a treason-defying mission for his true motherland.',
      poster: 'assets/posters/fauzi.jpg',
      backdrop: 'assets/posters/fauzi.jpg',
      trailerUrl: 'https://www.youtube.com/embed/ujzBbf9uqdY',
      featured: true,
      priceTier: { standard: 260, premium: 420, vip: 820 }
    },
    {
      id: 'varanasi',
      title: 'Varanasi',
      tagline: 'An ancient globe-trotting quest rooted in the spiritual heart of Kashi.',
      rating: '9.7',
      rottenTomatoes: '97%',
      ageRating: 'U/A 16+',
      runtime: '178 min',
      genres: ['Adventure & Thriller', 'Action', 'IMAX Specials'],
      releaseDate: 'April 2027',
      language: 'Telugu (Original), Hindi, Tamil, English, Japanese (Dolby Atmos)',
      formats: ['IMAX 70mm Laser', 'Dolby Cinema', '4DX Motion'],
      director: 'S.S. Rajamouli',
      cast: ['Mahesh Babu (Rudhra)', 'Priyanka Chopra Jonas', 'Prithviraj Sukumaran (Kumbha)', 'Nasser'],
      synopsis: 'Directed by visionary master filmmaker S.S. Rajamouli, this high-octane jungle adventure and globe-trotting saga follows Rudhra, an intrepid explorer whose quest for an ancient celestial relic begins amidst the eternal, mystical ghats of sacred Varanasi.',
      poster: 'assets/posters/varanasi.jpg',
      backdrop: 'assets/posters/varanasi.jpg',
      trailerUrl: 'https://www.youtube.com/embed/P5uqL2xldRY',
      featured: true,
      priceTier: { standard: 290, premium: 480, vip: 920 }
    },
    {
      id: 'ntr-dragon',
      title: 'NTR Dragon',
      tagline: 'HIS REIGN… HIS SOIL… The ultimate power awakens.',
      rating: '9.6',
      rottenTomatoes: '96%',
      ageRating: 'U/A 16+',
      runtime: '170 min',
      genres: ['Action', 'Adventure & Thriller', 'IMAX Specials'],
      releaseDate: 'June 2027',
      language: 'Telugu (Original), Hindi, Tamil, Kannada, Malayalam (Dolby Atmos)',
      formats: ['IMAX Laser', 'Dolby Cinema', '4DX Motion'],
      director: 'Prashanth Neel',
      cast: ['Jr NTR', 'Rashmika Mandanna', 'Bobby Deol', 'Prakash Raj'],
      synopsis: 'Directed by KGF and Salaar creator Prashanth Neel, this massive pan-Indian action spectacle features Jr NTR as a fearsome, uncompromising ruler rising through a deadly international criminal syndicate to establish his undisputed dominion.',
      poster: 'assets/posters/dragon.jpg',
      backdrop: 'assets/posters/dragon.jpg',
      trailerUrl: 'https://www.youtube.com/embed/VyIMJEgL-6o',
      featured: false,
      priceTier: { standard: 270, premium: 440, vip: 850 }
    },
    {
      id: 'spirit',
      title: 'Spirit',
      tagline: 'When the law breaks, vengeance takes over.',
      rating: '9.4',
      rottenTomatoes: '94%',
      ageRating: 'A (Adults Only)',
      runtime: '168 min',
      genres: ['Action', 'Adventure & Thriller'],
      releaseDate: 'Late 2025',
      language: 'Telugu (Original), Hindi, Tamil, Malayalam, Kannada (Dolby Atmos)',
      formats: ['IMAX 2D', 'Dolby Cinema', 'Standard Laser'],
      director: 'Sandeep Reddy Vanga',
      cast: ['Prabhas (IPS Officer)', 'Triptii Dimri', 'Kareena Kapoor Khan', 'Vivek Oberoi'],
      synopsis: 'From the visionary director of Animal and Kabir Singh, Sandeep Reddy Vanga brings an unapologetic, intense action drama featuring Prabhas as a fearless, unhinged police officer on a deadly personal mission to dismantle an untouchable cartel.',
      poster: 'assets/posters/spirit.jpg',
      backdrop: 'assets/posters/spirit.jpg',
      trailerUrl: 'https://www.youtube.com/embed/VCGVPiD4BP0',
      featured: false,
      priceTier: { standard: 260, premium: 420, vip: 820 }
    },
    {
      id: 'pushpa-2',
      title: 'Pushpa 2: The Rule',
      tagline: 'Party Ledu Pushpa... Only Rule!',
      rating: '9.2',
      rottenTomatoes: '94%',
      ageRating: 'U/A 16+',
      runtime: '180 min',
      genres: ['Action', 'Adventure & Thriller'],
      releaseDate: 'Dec 05, 2024',
      language: 'Telugu (Original), Hindi, Tamil, Malayalam (Dolby Atmos)',
      formats: ['IMAX 2D', '4DX', 'Dolby Atmos', 'ScreenX'],
      director: 'Sukumar',
      cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Sunil', 'Anasuya Bharadwaj'],
      synopsis: 'Pushpa Raj consolidates his undisputed iron grip over the red sandalwood smuggling syndicate, igniting a war against SP Bhanwar Singh Shekhawat and rival international cartels.',
      poster: 'assets/posters/pushpa2.jpg',
      backdrop: 'assets/posters/pushpa2.jpg',
      trailerUrl: 'https://www.youtube.com/embed/g3JUbgOHgdw',
      featured: false,
      priceTier: { standard: 250, premium: 390, vip: 760 }
    },
    {
      id: 'kalki-part-2',
      title: 'Kalki 2898 AD',
      tagline: 'When the world falls into darkness, the tenth avatar rises.',
      rating: '9.1',
      rottenTomatoes: '91%',
      ageRating: 'U/A 13+',
      runtime: '181 min',
      genres: ['Mythology & Epic', 'Action', 'IMAX Specials'],
      releaseDate: 'Now Playing',
      language: 'Telugu (Original), Hindi, Tamil (Dolby Atmos)',
      formats: ['IMAX 3D Laser', 'Dolby Cinema', '4DX 3D', 'Standard 3D'],
      director: 'Nag Ashwin',
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone', 'Disha Patani'],
      synopsis: 'In the post-apocalyptic year 2898, Supreme Yaskin prepares to unleash the cosmic power of the Complex, while Ashwatthama and Bhairava embark on an epic collision course to protect the unborn savior.',
      poster: 'assets/posters/kalki.jpg',
      backdrop: 'assets/posters/kalki.jpg',
      trailerUrl: 'https://www.youtube.com/embed/-rTzyZZGJ84',
      featured: false,
      priceTier: { standard: 280, premium: 450, vip: 850 }
    },
    {
      id: 'kantara-chapter-1',
      title: 'Kantara: Chapter 1',
      tagline: 'The legend was born in the sacred fire.',
      rating: '9.4',
      rottenTomatoes: '96%',
      ageRating: 'U/A 16+',
      runtime: '162 min',
      genres: ['Mythology & Epic', 'Action'],
      releaseDate: 'Oct 02, 2025',
      language: 'Kannada (Original), Hindi, Telugu, Tamil, Malayalam',
      formats: ['Dolby Atmos', 'IMAX 2D', 'Standard'],
      director: 'Rishab Shetty',
      cast: ['Rishab Shetty', 'Jayaram', 'Achyuth Kumar', 'Pramod Shetty'],
      synopsis: 'A mythological prequel tracing the ancient origin of the Daiva Panjurli and the divine pact between the Kadamba royal dynasty and the mystical guardian spirits of the sacred coastal forests.',
      poster: 'assets/posters/kantara.jpg',
      backdrop: 'assets/posters/kantara.jpg',
      trailerUrl: 'https://www.youtube.com/embed/Frp0zC4643U',
      featured: false,
      priceTier: { standard: 220, premium: 350, vip: 700 }
    }
  ],

  cinemas: [
    {
      id: 'cinema-1',
      name: 'PVR INOX: Phoenix Marketcity IMAX & LUXE',
      address: 'LBS Marg, Kurla West, Mumbai',
      distance: '2.4 km away',
      amenities: ['IMAX Laser 3D', 'Dolby Atmos 64-Channel', 'PVR LUXE Recliner Dining', 'Celebrity Chef Menu', 'Valet Parking'],
      showtimes: [
        { time: '11:15 AM', format: 'IMAX Laser 3D', screen: 'Audi 1 (IMAX Giant)', status: 'available' },
        { time: '02:45 PM', format: 'Dolby Atmos 2D', screen: 'Audi 4 (LUXE Recliner)', status: 'filling' },
        { time: '06:30 PM', format: 'IMAX Laser 3D', screen: 'Audi 1 (IMAX Giant)', status: 'filling' },
        { time: '10:15 PM', format: 'Standard Laser', screen: 'Audi 6', status: 'available' }
      ]
    },
    {
      id: 'cinema-2',
      name: 'Cinépolis: Grand Megaplex & VIP Lounge',
      address: 'Andheri West, Near Metro Station, Mumbai',
      distance: '4.8 km away',
      amenities: ['4DX Motion Effects & Water', 'VIP Motorized Leather Recliners', 'Dolby Atmos', 'At-Seat Waiter Service'],
      showtimes: [
        { time: '12:00 PM', format: '4DX Motion 3D', screen: 'Screen 2 (4DX)', status: 'available' },
        { time: '03:30 PM', format: 'VIP Recliner Atmos', screen: 'VIP Lounge 1', status: 'available' },
        { time: '07:45 PM', format: 'VIP Recliner Atmos', screen: 'VIP Lounge 1', status: 'filling' },
        { time: '11:00 PM', format: 'Standard Laser', screen: 'Screen 5', status: 'available' }
      ]
    },
    {
      id: 'cinema-3',
      name: 'Miraj Cinemas: Maximum Dolby Atmos',
      address: 'R-Mall, Mulund West, Mumbai',
      distance: '6.5 km away',
      amenities: ['Dolby 7.1 Surround', 'Plush Sofa Seating', 'Live Gourmet Food Counter', 'Express QR Entry'],
      showtimes: [
        { time: '01:30 PM', format: 'Dolby Atmos 2D', screen: 'Screen 3', status: 'available' },
        { time: '05:15 PM', format: 'Dolby Atmos 2D', screen: 'Screen 3', status: 'filling' },
        { time: '08:45 PM', format: 'Standard Laser', screen: 'Screen 2', status: 'available' }
      ]
    }
  ],

  // Seat tiers configuration
  seatLayout: {
    rows: [
      { row: 'A', tier: 'vip', name: 'LUXE Gold Recliner', isAccessible: false },
      { row: 'B', tier: 'vip', name: 'LUXE Gold Recliner', isAccessible: false },
      { row: 'C', tier: 'premium', name: 'Prime Executive', isAccessible: false },
      { row: 'D', tier: 'premium', name: 'Prime Executive', isAccessible: false },
      { row: 'E', tier: 'premium', name: 'Prime Executive', isAccessible: false },
      { row: 'F', tier: 'premium', name: 'Prime Executive', isAccessible: false },
      { row: 'G', tier: 'standard', name: 'Classic Silver', isAccessible: false },
      { row: 'H', tier: 'standard', name: 'Classic Silver', isAccessible: false },
      { row: 'J', tier: 'standard', name: 'Classic Silver', isAccessible: false },
      { row: 'K', tier: 'standard', name: 'Wheelchair / Companion', isAccessible: true }
    ],
    seatsPerRow: 14,
    aisleIndices: [3, 11]
  },

  // Indian gourmet concessions menu
  concessions: [
    {
      id: 'snack-popcorn-duo',
      name: 'Gourmet Cheese & Caramel Popcorn Duo',
      category: 'Popcorn',
      price: 380,
      description: 'Signature mix of savory English Cheddar and crisp Golden Salted Caramel popcorn.',
      calories: '490 cal',
      badge: 'Bestseller',
      icon: '🍿'
    },
    {
      id: 'snack-samosa-trio',
      name: 'Crispy Punjabi Samosas (2 Pcs)',
      category: 'Hot Bites',
      price: 180,
      description: 'Golden spiced potato & green pea filling served hot with fresh Saunth & Mint Chutney.',
      calories: '340 cal',
      badge: 'Cinema Classic',
      icon: '🥟'
    },
    {
      id: 'snack-nachos-salsa',
      name: 'Nachos Grande with Warm Queso & Salsa',
      category: 'Savory',
      price: 290,
      description: 'Crisp corn tortilla nachos layered with warm melted jalapeño cheese and tangy salsa dip.',
      calories: '560 cal',
      icon: '🧀'
    },
    {
      id: 'snack-combo-ultimate',
      name: 'Dhamaka Blockbuster Combo (Save 25%)',
      category: 'Combos',
      price: 640,
      description: '1 Jumbo Tub Butter Popcorn + 2 Large Fountain Pepsis (600ml) + 2 Crispy Samosas.',
      calories: '1150 cal',
      badge: 'Best Value',
      icon: '🎬'
    },
    {
      id: 'snack-chai-coffee',
      name: 'Cutting Masala Chai / Artisan Cappuccino',
      category: 'Beverages',
      price: 160,
      description: 'Brewed with cardamom, ginger, and rich whole milk or freshly ground Arabica beans.',
      calories: '120 cal',
      icon: '☕'
    },
    {
      id: 'snack-gulab-jamun',
      name: 'Shahi Gulab Jamun with Rabdi (2 Pcs)',
      category: 'Desserts',
      price: 220,
      description: 'Warm melt-in-the-mouth mawa dumplings soaked in saffron syrup, served with creamy rabdi.',
      calories: '390 cal',
      icon: '🍨'
    }
  ],

  // Working Indian coupon codes
  promoCodes: {
    'DESI100': { flatDiscount: 100, minSeats: 2, description: 'Flat ₹100 Off on 2+ Tickets' },
    'RUPAY20': { discountPercent: 20, maxDiscount: 200, description: '20% Off via RuPay & UPI (Up to ₹200)' },
    'SNACKS50': { flatDiscount: 50, description: 'Flat ₹50 Off on Food & Beverages' }
  }
};

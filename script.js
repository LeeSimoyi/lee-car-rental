/* ═══════════════════════════════════════════════════════════════
   LCR — MAIN WEBSITE SCRIPT
   Handles: hero, counters, nav, drawer, fleet filter, car detail
   page, service modal, FAQ accordion, contact form, scroll-to-top
═══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   HERO SCROLL-REVEAL
══════════════════════════════════════════ */
(function () {
  const heroEls     = document.querySelectorAll('.hero-fade');
  const heroSection = document.getElementById('home');
  function revealHero() { heroEls.forEach(el => el.classList.add('visible')); }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { setTimeout(revealHero, 120); obs.unobserve(heroSection); } });
  }, { threshold: 0.1 });
  if (heroSection) obs.observe(heroSection);
})();

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
(function () {
  function animateCounter(el) {
    const target    = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === 'true';
    const steps     = 60, duration = 1800, stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      const current  = target * progress;
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
      if (step >= steps) {
        clearInterval(timer);
        el.textContent = isDecimal ? target.toFixed(1) : Math.floor(target);
      }
    }, stepTime);
  }
  const counted = new Set();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !counted.has(e.target)) {
        counted.add(e.target);
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.count-num').forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════
   CAR DATA
══════════════════════════════════════════ */
const CAR_DATA = {
  camry: {
    name: 'Toyota Camry', subtitle: 'Mid-Size Sedan · 2023 Model',
    price: '$45', bookingName: 'Toyota Camry',
    badge: { text: 'Most Popular', color: '#f59e0b' },
    images: [
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1400&q=85', label: 'Exterior – Front' },
      { url: 'imgs/Toyota Side.png', label: 'Side Profile' },
      { url: 'imgs/Toyota Exterior.png',    label: 'Dynamic – On Road' },
      { url: 'imgs/Toyota Dashboard.png', label: 'Dashboard' },
      { url: 'imgs/Toyota Interior.png', label: 'Interior – Cabin' },
      { url: 'imgs/Toyota night drive.png', label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group',  label: 'Passengers',   value: '5 Adults' },
      { icon: 'fa-gears',       label: 'Transmission', value: 'Automatic' },
      { icon: 'fa-gas-pump',    label: 'Fuel Type',    value: 'Petrol' },
      { icon: 'fa-gauge-high',  label: 'Engine',       value: '2.5L 4-Cylinder' },
      { icon: 'fa-suitcase',    label: 'Luggage',      value: '3 Large Bags' },
      { icon: 'fa-road',        label: 'Drive',        value: 'Front-Wheel Drive' },
      { icon: 'fa-snowflake',   label: 'Climate',      value: 'Dual-Zone A/C' },
      { icon: 'fa-car-side',    label: 'Body Style',   value: 'Sedan' },
    ],
    features: [
      'Apple CarPlay & Android Auto', 'Adaptive Cruise Control',
      'Lane Departure Warning', 'Pre-Collision Safety System',
      'Wireless Phone Charging', 'Leather-Trimmed Seats',
      'Backup Camera with Guidelines', 'Rain-Sensing Wipers',
    ],
    pricing: [
      { duration: 'Daily',          price: '$45',  per: '/day',   note: '200 km included',        highlight: false },
      { duration: 'Weekly (7 days)',price: '$280', per: '/week',  note: 'Save $35 vs daily rate', highlight: true  },
      { duration: 'Monthly',        price: '$900', per: '/month', note: 'Best long-term value',   highlight: false },
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80', label: 'Exterior',         large: true  },
      { url: 'imgs/Toyota Side.png', label: 'Side Profile',     large: false },
      { url: 'imgs/Toyota Exterior.png',    label: 'Dynamic – On Road',         large: false },
      { url: 'imgs/Toyota Dashboard.png', label: 'Dashboard',       large: false },
      { url: 'imgs/Toyota Interior.png', label: 'Interior – Cabin',        large: false },
      { url: 'imgs/Toyota night drive.png', label: 'Night Shot',     large: false },
    ],
  },
  explorer: {
    name: 'Ford Explorer', subtitle: 'Full-Size SUV · 2023 Model',
    price: '$75', bookingName: 'Ford Explorer',
    badge: { text: 'Family Choice', color: '#f59e0b' },
    images: [
      { url: 'imgs/Ford Explorer.png', label: 'Exterior – Front' },
      { url: 'imgs/Ford rear or side.png', label: 'Side Profile' },
      { url: 'imgs/Ford Explorer.png',    label: 'Dynamic – Off Road' },
      { url: 'imgs/Ford dashbord.png', label: 'Dashboard' },
      { url: 'imgs/Ford interior.png', label: 'Interior – Cabin' },
      { url: 'imgs/Ford night drive.png', label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group', label: 'Passengers',   value: '7 Adults' },
      { icon: 'fa-gears',      label: 'Transmission', value: 'Automatic' },
      { icon: 'fa-gas-pump',   label: 'Fuel Type',    value: 'Diesel' },
      { icon: 'fa-gauge-high', label: 'Engine',       value: '3.0L EcoBoost V6' },
      { icon: 'fa-suitcase',   label: 'Luggage',      value: '5 Large Bags' },
      { icon: 'fa-road',       label: 'Drive',        value: 'All-Wheel Drive' },
      { icon: 'fa-snowflake',  label: 'Climate',      value: 'Tri-Zone A/C' },
      { icon: 'fa-car-side',   label: 'Body Style',   value: 'SUV' },
    ],
    features: [
      '3rd Row Seating (7 passengers)', 'SYNC 4 Infotainment 13.2" Screen',
      'Adaptive Cruise Control w/ Stop & Go', 'Ford Co-Pilot360 Safety Suite',
      'Terrain Management System', 'Power-Folding 3rd Row Seats',
      'Panoramic Vista Roof', 'Class III Tow Capability',
    ],
    pricing: [
      { duration: 'Daily',          price: '$75',   per: '/day',   note: '200 km included',        highlight: false },
      { duration: 'Weekly (7 days)',price: '$470',  per: '/week',  note: 'Save $55 vs daily rate', highlight: true  },
      { duration: 'Monthly',        price: '$1,500',per: '/month', note: 'Best long-term value',   highlight: false },
    ],
    photos: [
      { url: 'imgs/Ford Explorer.png', label: 'Exterior – Front',         large: true  },
      { url: 'imgs/Ford rear or side.png', label: 'Side Profile',     large: false },
      { url: 'imgs/Ford Explorer.png',    label: 'Dynamic – Off Road',         large: false },
      { url: 'imgs/Ford dashbord.png', label: 'Dashboard',       large: false },
      { url: 'imgs/Ford interior.png', label: 'Interior – Cabin',        large: false },
      { url: 'imgs/Ford night drive.png', label: 'Night Shot',      large: false },
    ],
  },
  mercedes: {
    name: 'Mercedes-Benz C300', subtitle: 'Luxury Sedan · 2024 Model',
    price: '$120', bookingName: 'Mercedes-Benz C300',
    badge: { text: 'Premium', color: '#8b5cf6' },
    images: [
      { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1400&q=85', label: 'Exterior – Front' },
      { url: 'imgs/Mercedes-Benz Profile.png', label: 'Side Profile' },
      { url: 'imgs/Mercedes-Benz Rear.png', label: 'Dynamic – Rear' },
      { url: 'imgs/Mercedes-Benz Dashboard.png',    label: 'Dashboard' },
      { url: 'imgs/Mercedes-Benz Interior.png', label: 'Interior – Cabin' },
      { url: 'imgs/Mercedes-Benz Night Drive.png', label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group', label: 'Passengers',   value: '5 Adults' },
      { icon: 'fa-gears',      label: 'Transmission', value: '9G-TRONIC Auto' },
      { icon: 'fa-gas-pump',   label: 'Fuel Type',    value: 'Petrol' },
      { icon: 'fa-gauge-high', label: 'Engine',       value: '2.0L Turbo I4' },
      { icon: 'fa-suitcase',   label: 'Luggage',      value: '3 Large Bags' },
      { icon: 'fa-road',       label: 'Drive',        value: '4MATIC All-Wheel' },
      { icon: 'fa-snowflake',  label: 'Climate',      value: 'Dual-Zone Thermotronic' },
      { icon: 'fa-car-side',   label: 'Body Style',   value: 'Luxury Sedan' },
    ],
    features: [
      'MBUX Multimedia System with AI', 'Burmester® Surround Sound',
      'Heated & Ventilated Front Seats', 'Massage Function (Driver Seat)',
      'Ambient Lighting (64 Colours)', 'Active Distance Assist DISTRONIC',
      'Parking Package with 360° Camera', 'KEYLESS GO Start System',
    ],
    pricing: [
      { duration: 'Daily',          price: '$120',  per: '/day',   note: '200 km included',        highlight: false },
      { duration: 'Weekly (7 days)',price: '$750',  per: '/week',  note: 'Save $90 vs daily rate', highlight: true  },
      { duration: 'Monthly',        price: '$2,400',per: '/month', note: 'Best long-term value',   highlight: false },
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&q=80', label: 'Exterior',     large: true  },
      { url: 'imgs/Mercedes-Benz Profile.png', label: 'Side Profile', large: false },
      { url: 'imgs/Mercedes-Benz Rear.png', label: 'Dynamic – Rear',     large: false },
      { url: 'imgs/Mercedes-Benz Dashboard.png',    label: 'Dashboard',   large: false },
      { url: 'imgs/Mercedes-Benz Interior.png', label: 'Interior – Cabin',large: false },
      { url: 'imgs/Mercedes-Benz Night Drive.png', label: 'Night Shot',  large: false },
    ],
  },
  tesla: {
    name: 'Tesla Model 3', subtitle: 'Electric Sedan · 2024 Model',
    price: '$95', bookingName: 'Tesla Model 3',
    badge: { text: 'New', color: '#ef4444' },
    images: [
      { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1400&q=85', label: 'Exterior – Front' },
      { url: 'imgs/Tesla side.png', label: 'Side Profile' },
      { url: 'imgs/Tesla exterior.png', label: 'Dynamic – On Road' },
      { url: 'imgs/Tesla dashboard.png',label: 'Dashboard' },
      { url: 'imgs/Tesla interior.png',label: 'Interior – Cabin' },
      { url: 'imgs/Tesla night.png', label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group', label: 'Passengers',   value: '5 Adults' },
      { icon: 'fa-gears',      label: 'Transmission', value: 'Single-Speed Auto' },
      { icon: 'fa-bolt',       label: 'Fuel Type',    value: 'Electric (BEV)' },
      { icon: 'fa-gauge-high', label: 'Range',        value: '570 km per charge' },
      { icon: 'fa-suitcase',   label: 'Luggage',      value: '2 Large Bags + Frunk' },
      { icon: 'fa-road',       label: 'Drive',        value: 'Rear-Wheel Drive' },
      { icon: 'fa-snowflake',  label: 'Climate',      value: 'Heat Pump A/C' },
      { icon: 'fa-car-side',   label: 'Body Style',   value: 'Electric Sedan' },
    ],
    features: [
      '15.4" Cinematic Touchscreen', 'Autopilot (Full Self-Drive Capable)',
      'Over-The-Air Software Updates', 'Sentry Mode & Dashcam',
      'Glass Roof (UV Protected)', '0–100 km/h in 3.1 seconds',
      'Premium Audio System (17 Speakers)', 'Wireless Phone Charging',
    ],
    pricing: [
      { duration: 'Daily',          price: '$95',   per: '/day',   note: 'Unlimited electric charge', highlight: false },
      { duration: 'Weekly (7 days)',price: '$595',  per: '/week',  note: 'Save $70 vs daily rate',    highlight: true  },
      { duration: 'Monthly',        price: '$1,900',per: '/month', note: 'Best long-term value',      highlight: false },
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80', label: 'Exterior',     large: true  },
      { url: 'imgs/Tesla side.png', label: 'Side Profile',large: false },
      { url: 'imgs/Tesla exterior.png', label: 'Dynamic – On Road',    large: false },
      { url: 'imgs/Tesla dashboard.png',label: 'Dashboard',   large: false },
      { url: 'imgs/Tesla interior.png',label: 'Interior – Cabin',    large: false },
      { url: 'imgs/Tesla night.png', label: 'Night Shot',  large: false },
    ],
  },
  bmw: {
    name: 'BMW X5', subtitle: 'Luxury SUV · 2023 Model',
    price: '$140', bookingName: 'BMW X5',
    badge: { text: 'Luxury', color: '#4169E1' },
    images: [
      { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85', label: 'Exterior – Front' },
      { url: 'imgs/BMW Rear.png',label: 'Side Profile' },
      { url: 'imgs/BMW Exterior.png',label: 'Dynamic – Road' },
      { url: 'imgs/BMW Dashboard.png',  label: 'Dashboard' },
      { url: 'imgs/BMW Entirior.png',label: 'Interior – Cabin' },
      { url: 'imgs/BMW Night drive.png',label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group', label: 'Passengers',   value: '5 Adults' },
      { icon: 'fa-gears',      label: 'Transmission', value: '8-Speed Steptronic' },
      { icon: 'fa-gas-pump',   label: 'Fuel Type',    value: 'Petrol' },
      { icon: 'fa-gauge-high', label: 'Engine',       value: '3.0L TwinPower Turbo I6' },
      { icon: 'fa-suitcase',   label: 'Luggage',      value: '4 Large Bags' },
      { icon: 'fa-road',       label: 'Drive',        value: 'xDrive All-Wheel' },
      { icon: 'fa-snowflake',  label: 'Climate',      value: '4-Zone Auto Climate' },
      { icon: 'fa-car-side',   label: 'Body Style',   value: 'Luxury SUV' },
    ],
    features: [
      'BMW Live Cockpit Professional', 'Harman Kardon Surround Sound',
      'Panoramic Sunroof', 'Driving Assistant Professional',
      'Parking Assistant Plus w/ Surround View', 'Heated Front & Rear Seats',
      'Executive Drive Active Roll Stabilisation', 'BMW Head-Up Display',
    ],
    pricing: [
      { duration: 'Daily',          price: '$140',  per: '/day',   note: '200 km included',          highlight: false },
      { duration: 'Weekly (7 days)',price: '$875',  per: '/week',  note: 'Save $105 vs daily rate',  highlight: true  },
      { duration: 'Monthly',        price: '$2,800',per: '/month', note: 'Best long-term value',     highlight: false },
    ],
    photos: [
      { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80',  label: 'Exterior',     large: true  },
      { url: 'imgs/BMW Rear.png',label: 'Side Profile', large: false },
      { url: 'imgs/BMW Exterior.png',label: 'Dynamic – Road',     large: false },
      { url: 'imgs/BMW Dashboard.png',  label: 'Dashboard',  label: 'Dashboard',   large: false },
      { url: 'imgs/BMW Entirior.png',label: 'Interior – Cabin',    large: false },
      { url: 'imgs/BMW Night drive.png',label: 'Night Shot',  large: false },
    ],
  },
  civic: {
    name: 'Honda Civic', subtitle: 'Compact Sedan · 2023 Model',
    price: '$35', bookingName: 'Honda Civic',
    badge: { text: 'Economy', color: '#10b981' },
    images: [
      { url: 'imgs/Honda civic Interior.png', label: 'Exterior – Front' },
      { url: 'imgs/Honda rear.png', label: 'Side Profile' },
      { url: 'imgs/Honda civic Interior.png',    label: 'Dynamic – On Road' },
      { url: 'imgs/Honda dashboard.png', label: 'Dashboard' },
      { url: 'imgs/Honda intirior.png', label: 'Interior – Cabin' },
      { url: 'imgs/Honda night drive.png', label: 'Night Shot' },
    ],
    specs: [
      { icon: 'fa-user-group', label: 'Passengers',   value: '5 Adults' },
      { icon: 'fa-gears',      label: 'Transmission', value: '6-Speed Manual' },
      { icon: 'fa-gas-pump',   label: 'Fuel Type',    value: 'Petrol' },
      { icon: 'fa-gauge-high', label: 'Engine',       value: '1.5L VTEC Turbo' },
      { icon: 'fa-suitcase',   label: 'Luggage',      value: '2 Large Bags' },
      { icon: 'fa-road',       label: 'Drive',        value: 'Front-Wheel Drive' },
      { icon: 'fa-snowflake',  label: 'Climate',      value: 'Single-Zone A/C' },
      { icon: 'fa-car-side',   label: 'Body Style',   value: 'Compact Sedan' },
    ],
    features: [
      'Honda Sensing Safety Suite', '9" Touchscreen with Apple CarPlay',
      'Lane Keeping Assist', 'Automatic Emergency Braking',
      'Adaptive Cruise Control', 'Backup Camera',
      'Honda CONNECT Wi-Fi Hotspot', 'Fuel Economy: 7.4L/100km',
    ],
    pricing: [
      { duration: 'Daily',          price: '$35', per: '/day',   note: '200 km included',        highlight: false },
      { duration: 'Weekly (7 days)',price: '$210',per: '/week',  note: 'Save $35 vs daily rate', highlight: true  },
      { duration: 'Monthly',        price: '$700',per: '/month', note: 'Best long-term value',   highlight: false },
    ],
    photos: [
      { url: 'imgs/Honda civic Interior.png', label: 'Exterior – Front',     large: true  },
      { url: 'imgs/Honda rear.png', label: 'Side Profile' , large: false },
      { url: 'imgs/Honda civic Interior.png',    label: 'Dynamic – On Road',     large: false },
      { url: 'imgs/Honda dashboard.png', label: 'Dashboard',   large: false },
      { url: 'imgs/Honda intirior.png', label: 'Interior – Cabin',large: false },
      { url: 'imgs/Honda night drive.png', label: 'Night Shot',  large: false },
    ],
  },
};

/* ══════════════════════════════════════════
   SERVICE DATA
══════════════════════════════════════════ */
const SVC_DATA = {
  daily:     { title:'Daily & Long-Term Rental',    cat:'Flexible Rental Plans',             bannerImg:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80',  iconClass:'si-blue',   iconHtml:'<i class="fa-solid fa-calendar-days"></i>',     desc:'Our daily and long-term rental plans are designed to give you maximum flexibility at the best possible price. Whether you need a car for a quick day trip around Mutare or an extended multi-month assignment, LCR has a plan that fits your life — with no hidden costs and transparent pricing from day one.', features:[{icon:'fa-check-circle',text:'Day rates from just $35/day on economy vehicles'},{icon:'fa-check-circle',text:'Weekly discounts averaging 10–15% savings'},{icon:'fa-check-circle',text:'Monthly rates starting from $700/month'},{icon:'fa-check-circle',text:'200 km/day free mileage on all plans'},{icon:'fa-check-circle',text:'Free vehicle swap on plans over 30 days'},{icon:'fa-check-circle',text:'Full insurance and roadside assistance included'}], price:'$35', priceSub:'/ day · economy vehicles', priceLabel:'Starting from', includes:['Insurance Included','Free Cancellation (24hr)','EcoCash Accepted'] },
  airport:   { title:'Airport Transfers',           cat:'Meet & Greet · Door-to-Door',       bannerImg:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80',  iconClass:'si-amber',  iconHtml:'<i class="fa-solid fa-plane-arrival"></i>',      desc:'Skip the stress of arriving in an unfamiliar city. Our airport transfer service monitors your flight in real-time and ensures a professional driver is waiting for you — name board in hand — the moment you clear customs. Available 24/7, 365 days a year at Mutare Airport.', features:[{icon:'fa-check-circle',text:'Real-time flight tracking — we adjust for delays'},{icon:'fa-check-circle',text:'Meet-and-greet with personalised name board'},{icon:'fa-check-circle',text:'Available 24/7 including public holidays'},{icon:'fa-check-circle',text:'All vehicle classes: economy to luxury'},{icon:'fa-check-circle',text:'Free 60-minute wait time after landing'},{icon:'fa-check-circle',text:'Fixed pricing — no surge charges'}], price:'$25', priceSub:'/ transfer · one-way', priceLabel:'From', includes:['Fixed Price','60-min Wait Included','Meet & Greet'] },
  corporate: { title:'Corporate & Business Rental', cat:'NGOs · Embassies · Companies',      bannerImg:'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',  iconClass:'si-purple', iconHtml:'<i class="fa-solid fa-briefcase"></i>',           desc:'LCR is the preferred fleet partner for dozens of NGOs, mining corporations, diplomatic missions, and government departments across Zimbabwe. We offer fully managed corporate mobility solutions — from a single vehicle to a dedicated fleet of 50+ units — with consolidated monthly invoicing and priority support.', features:[{icon:'fa-check-circle',text:'Dedicated account manager and fleet coordinator'},{icon:'fa-check-circle',text:'Monthly consolidated invoicing in USD or ZiG'},{icon:'fa-check-circle',text:'Priority vehicle availability and emergency swaps'},{icon:'fa-check-circle',text:'Custom branding and livery options available'},{icon:'fa-check-circle',text:'Driver training and compliance support'},{icon:'fa-check-circle',text:'GPS fleet tracking and monthly reports'}], price:'Custom', priceSub:'tailored to your fleet size', priceLabel:'Pricing', includes:['Dedicated Manager','Monthly Invoicing','Priority Fleet Access'] },
  chauffeur: { title:'Chauffeur & Driver Services', cat:'VIP · Weddings · Executive',        bannerImg:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80',  iconClass:'si-teal',   iconHtml:'<i class="fa-solid fa-user-tie"></i>',            desc:"LCR's professional chauffeur service is second to none. Our licensed, background-checked drivers are immaculately presented and possess intimate knowledge of every road in Manicaland. Perfect for weddings, VIP airport runs, corporate events, and government dignitaries.", features:[{icon:'fa-check-circle',text:'Licensed, uniformed, background-checked drivers'},{icon:'fa-check-circle',text:'Luxury sedans and executive SUVs available'},{icon:'fa-check-circle',text:'Hourly hire from 2 hours minimum'},{icon:'fa-check-circle',text:'Half-day (4hr) and full-day (8hr) packages'},{icon:'fa-check-circle',text:'Wedding car decoration included on request'},{icon:'fa-check-circle',text:'Strict punctuality and discretion guaranteed'}], price:'$60', priceSub:'/ hour · executive vehicle + driver', priceLabel:'From', includes:['Uniformed Driver','Vehicle + Fuel','Complimentary Water'] },
  safari:    { title:'Safari & Outstation Tours',   cat:'Nyanga · Chimanimani · Gonarezhou', bannerImg:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',  iconClass:'si-green',  iconHtml:'<i class="fa-solid fa-map-location-dot"></i>',    desc:"Zimbabwe's eastern highlands and safari destinations are some of Africa's best-kept secrets. LCR provides capable 4x4 vehicles and optional certified tour guides to take you through Nyanga National Park, Chimanimani's dramatic mountains, Vumba Botanical Gardens, and all the way to Gonarezhou.", features:[{icon:'fa-check-circle',text:"4x4 vehicles built for Zimbabwe's terrain"},{icon:'fa-check-circle',text:'Optional certified ZTA tour guides'},{icon:'fa-check-circle',text:'Unlimited kilometres on all tour packages'},{icon:'fa-check-circle',text:'Camping gear and cooler box hire available'},{icon:'fa-check-circle',text:'Multi-day itineraries from 1 to 14 days'},{icon:'fa-check-circle',text:'Cross-border permits arranged on request'}], price:'$120', priceSub:'/ day · 4x4 with unlimited km', priceLabel:'From', includes:['Unlimited Mileage','Full Insurance','24/7 Support'] },
  roadside:  { title:'24/7 Roadside Assistance',    cat:'All of Manicaland Province',        bannerImg:'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900&q=80',  iconClass:'si-red',    iconHtml:'<i class="fa-solid fa-truck-medical"></i>',       desc:'No matter where you are in Manicaland, help is never more than one call away. Every LCR rental comes with complimentary 24/7 roadside assistance. Our rapid-response team averages under 45 minutes to reach you — day or night, weekday or public holiday.', features:[{icon:'fa-check-circle',text:'Average 45-minute response across Manicaland'},{icon:'fa-check-circle',text:"Free replacement vehicle if yours can't be fixed"},{icon:'fa-check-circle',text:'Tyre change, jump-start, fuel delivery included'},{icon:'fa-check-circle',text:'Emergency towing to nearest LCR depot'},{icon:'fa-check-circle',text:'Dedicated WhatsApp emergency line'},{icon:'fa-check-circle',text:'Included free with every rental — no add-on cost'}], price:'Free', priceSub:'included with every rental', priceLabel:'Cost', includes:['Free Replacement Car','Free Towing','24/7 WhatsApp'] },
};

/* ══════════════════════════════════════════
   CAR DETAIL PAGE STATE
══════════════════════════════════════════ */
let currentGalleryIdx = 0;
let currentCarId      = null;
let currentCarData    = null;

/* ── Open ── */
function openCarDetailPage(carId) {
  const car = CAR_DATA[carId];
  if (!car) return;
  currentCarId      = carId;
  currentCarData    = car;
  currentGalleryIdx = 0;
  const page = document.getElementById('carDetailPage');
  populateCarDetailPage(car, carId);
  page.classList.add('open');
  document.body.style.overflow = 'hidden';
  page.scrollTop = 0;
  document.getElementById('cdpTopbarTitle').textContent = car.name;
  document.getElementById('cdpBreadName').textContent   = car.name;
}

/* ── Close ── */
function closeCarDetailPage() {
  document.getElementById('carDetailPage').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Populate ── */
function populateCarDetailPage(car, carId) {
  renderDetailGallery(car, 0);

  document.getElementById('cdpBadgeRow').innerHTML =
    `<span class="cdp-cat-badge" style="background:${car.badge.color}20;color:${car.badge.color};border:1.5px solid ${car.badge.color}40">${car.badge.text}</span>`;
  document.getElementById('cdpTitle').textContent    = car.name;
  document.getElementById('cdpSubtitle').textContent = car.subtitle;
  document.getElementById('cdpPrice').textContent    = car.price;

  document.getElementById('cdpSpecsList').innerHTML = car.specs.map(s =>
    `<div class="cdp-spec-row">
       <span class="cdp-spec-label"><i class="fa-solid ${s.icon}"></i> ${s.label}</span>
       <span class="cdp-spec-val">${s.value}</span>
     </div>`
  ).join('');

  document.getElementById('cdpFeaturesList').innerHTML = car.features.map(f =>
    `<li><i class="fa-solid fa-check-circle"></i> ${f}</li>`
  ).join('');

  document.getElementById('cdpPhotoGrid').innerHTML = car.photos.map(p =>
    `<div class="cdp-photo-item${p.large ? ' large' : ''}">
       <img src="${p.url}" alt="${car.name} – ${p.label}" loading="lazy">
       <span class="cdp-photo-label">${p.label}</span>
     </div>`
  ).join('');

  document.getElementById('cdpPricingGrid').innerHTML = car.pricing.map(p =>
    `<div class="cdp-pricing-card${p.highlight ? ' highlight' : ''}">
       ${p.highlight ? '<span class="cdp-best-label">Best Value</span>' : ''}
       <div class="dur">${p.duration}</div>
       <div class="price">${p.price}<span>${p.per}</span></div>
       <div class="note">${p.note}</div>
     </div>`
  ).join('');

  const others = Object.entries(CAR_DATA).filter(([id]) => id !== carId).slice(0, 3);
  document.getElementById('cdpAlsoGrid').innerHTML = others.map(([id, c]) =>
    `<div class="cdp-also-card" onclick="switchCarDetail('${id}')">
       <img class="cdp-also-img" src="${c.images[0].url.replace('w=1400','w=600')}" alt="${c.name}">
       <div class="cdp-also-info">
         <div class="cdp-also-name">${c.name}</div>
         <div class="cdp-also-price">${c.price} <span>/ day</span></div>
       </div>
     </div>`
  ).join('');

  /* Reset tabs */
  document.querySelectorAll('.cdp-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cdp-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.cdp-tab[data-tab="overview"]').classList.add('active');
  document.getElementById('cdp-tab-overview').classList.add('active');
}

function switchCarDetail(carId) {
  currentGalleryIdx = 0;
  currentCarId      = carId;
  currentCarData    = CAR_DATA[carId];
  populateCarDetailPage(currentCarData, carId);
  document.getElementById('cdpTopbarTitle').textContent = currentCarData.name;
  document.getElementById('cdpBreadName').textContent   = currentCarData.name;
  document.getElementById('carDetailPage').scrollTop = 0;
}

/* ── Gallery ── */
function renderDetailGallery(car, idx) {
  const img     = document.getElementById('cdpHeroImg');
  const label   = document.getElementById('cdpImgLabel');
  const counter = document.getElementById('cdpImgCounter');
  const thumbs  = document.getElementById('cdpThumbs');

  img.style.opacity   = '0';
  img.style.transform = 'scale(1.04)';
  setTimeout(() => {
    img.src             = car.images[idx].url;
    img.alt             = car.name + ' – ' + car.images[idx].label;
    img.style.opacity   = '1';
    img.style.transform = 'scale(1)';
  }, 130);

  label.textContent   = car.images[idx].label;
  counter.textContent = `${idx + 1} / ${car.images.length}`;

  thumbs.innerHTML = car.images.map((im, i) =>
    `<div class="cdp-thumb${i === idx ? ' active' : ''}" data-idx="${i}">
       <img src="${im.url.replace('w=1400','w=200')}" alt="${im.label}" loading="lazy">
     </div>`
  ).join('');

  thumbs.querySelectorAll('.cdp-thumb').forEach(th => {
    th.addEventListener('click', () => {
      currentGalleryIdx = parseInt(th.dataset.idx);
      renderDetailGallery(currentCarData, currentGalleryIdx);
    });
  });
}

function changeDetailGallery(dir) {
  if (!currentCarData) return;
  const total       = currentCarData.images.length;
  currentGalleryIdx = (currentGalleryIdx + dir + total) % total;
  renderDetailGallery(currentCarData, currentGalleryIdx);
}

/* ── Bind gallery controls ── */
document.getElementById('cdpPrev').addEventListener('click', () => changeDetailGallery(-1));
document.getElementById('cdpNext').addEventListener('click', () => changeDetailGallery(1));
document.getElementById('cdpBackBtn').addEventListener('click', closeCarDetailPage);

document.getElementById('cdpTopbarBookBtn').addEventListener('click', () => {
  closeCarDetailPage();
  if (currentCarData) setTimeout(() => BookingModal.open(currentCarId), 450);
});
document.getElementById('cdpBookBig').addEventListener('click', () => {
  closeCarDetailPage();
  if (currentCarData) setTimeout(() => BookingModal.open(currentCarId), 450);
});

document.querySelectorAll('.cdp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cdp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cdp-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('cdp-tab-' + tab.dataset.tab).classList.add('active');
  });
});

document.getElementById('cdpHeroImg').style.transition = 'opacity .35s ease, transform .5s ease';

/* ══════════════════════════════════════════
   SERVICE MODAL
══════════════════════════════════════════ */
function openSvcModal(svcId) {
  const svc = SVC_DATA[svcId];
  if (!svc) return;
  document.getElementById('svcModalBannerImg').src      = svc.bannerImg;
  document.getElementById('svcModalIcon').className     = 'svc-modal-banner-icon ' + svc.iconClass;
  document.getElementById('svcModalIcon').innerHTML     = svc.iconHtml;
  document.getElementById('svcModalTitle').textContent  = svc.title;
  document.getElementById('svcModalCat').textContent    = svc.cat;
  document.getElementById('svcModalDesc').textContent   = svc.desc;
  document.getElementById('svcModalFeatGrid').innerHTML = svc.features.map(f =>
    `<div class="svc-modal-feat-item"><i class="fa-solid ${f.icon}"></i><span>${f.text}</span></div>`
  ).join('');
  document.getElementById('svcModalPriceLabel').textContent  = svc.priceLabel;
  document.getElementById('svcModalPrice').textContent       = svc.price;
  document.getElementById('svcModalPriceSub').textContent    = svc.priceSub;
  document.getElementById('svcModalIncludesRow').innerHTML   = svc.includes.map(inc =>
    `<span class="svc-modal-include-chip"><i class="fa-solid fa-circle-check"></i> ${inc}</span>`
  ).join('');
  document.getElementById('svcModalBarLabel').textContent    = svc.title;
  document.getElementById('svcModalBookBtn').onclick = () => {
    closeSvcModal();
    setTimeout(() => BookingModal.open(), 350);
  };
  document.getElementById('svcModalScroll').scrollTop = 0;
  document.getElementById('svcModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSvcModal() {
  document.getElementById('svcModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('svcModalClose').addEventListener('click', closeSvcModal);
document.getElementById('svcModalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('svcModalOverlay')) closeSvcModal();
});

/* ══════════════════════════════════════════
   HERO THUMBNAILS
══════════════════════════════════════════ */
document.querySelectorAll('.hero-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.hero-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    const img = document.getElementById('heroMainImg');
    img.style.opacity   = '0';
    img.style.transform = 'scale(1.05)';
    setTimeout(() => {
      img.src                                              = thumb.dataset.img;
      document.getElementById('heroCarName').textContent  = thumb.dataset.name;
      document.getElementById('heroCarSub').textContent   = thumb.dataset.sub;
      img.style.opacity   = '1';
      img.style.transform = 'scale(1)';
    }, 200);
  });
});
document.getElementById('heroMainImg').style.transition = 'opacity .35s ease, transform .5s ease';

/* ══════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════ */
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function showToast(title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent   = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5000);
}

/* ══════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
══════════════════════════════════════════ */
const sections     = document.querySelectorAll('section[id]');
const navLinksEl   = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = 'home';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navLinksEl.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}, { passive: true });

/* ══════════════════════════════════════════
   HAMBURGER & MOBILE DRAWER
══════════════════════════════════════════ */
const hamburger   = document.getElementById('hamburger');
const navDrawer   = document.getElementById('navDrawer');
const drawerBg    = document.getElementById('drawerBg');
const drawerClose = document.getElementById('drawerClose');
const drawerLinks = document.querySelectorAll('.drawer-link');

function openDrawer()  {
  navDrawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  navDrawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click',   () => navDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
drawerBg.addEventListener('click',    closeDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeDrawer();
    drawerLinks.forEach(l => l.classList.remove('drawer-active'));
    link.classList.add('drawer-active');
  });
});

document.getElementById('drawerBookBtn').addEventListener('click', () => {
  closeDrawer();
  setTimeout(() => BookingModal.open(), 300);
});
document.getElementById('drawerContactBtn').addEventListener('click', () => {
  closeDrawer();
  setTimeout(() => scrollToSection('#contact'), 300);
});

/* ══════════════════════════════════════════
   SCROLL-TO-TOP
══════════════════════════════════════════ */
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 400);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('up'); });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ══════════════════════════════════════════
   FLEET FILTER
══════════════════════════════════════════ */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.car-card').forEach(card => {
      card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
    });
  });
});

/* ══════════════════════════════════════════
   FAQ — ADVANCED ACCORDION + CATEGORY TABS
══════════════════════════════════════════ */

/* ── Accordion toggle ── */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    // Remove any existing listener by cloning
    const q = item.querySelector('.faq-q');
    if (!q) return;
    const clone = q.cloneNode(true);
    q.parentNode.replaceChild(clone, q);
    clone.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all other open items
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });
}

/* ── Category filter tabs ── */
function initFaqTabs() {
  const tabs = document.querySelectorAll('.faq-tab-btn');
  if (!tabs.length) return;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat;
      document.querySelectorAll('.faq-item').forEach(item => {
        const itemCat = item.dataset.cat || 'all';
        const show = cat === 'all' || itemCat === cat;
        item.classList.toggle('faq-hidden', !show);
        // Close any open item when switching tabs
        if (!show) item.classList.remove('open');
      });

      // Animate visible items
      const visible = document.querySelectorAll('.faq-item:not(.faq-hidden)');
      visible.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(12px)';
        setTimeout(() => {
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = '1';
          item.style.transform = 'none';
        }, i * 40);
      });
    });
  });
}

/* ── Open a specific FAQ item by index (used by popular links) ── */
function openFaqItem(index) {
  // Reset to "All" tab first
  const allTab = document.querySelector('.faq-tab-btn[data-cat="all"]');
  if (allTab) allTab.click();

  const items = document.querySelectorAll('.faq-item');
  if (!items[index]) return;
  // Close all, open the target
  items.forEach(i => i.classList.remove('open'));
  items[index].classList.add('open');
  // Smooth scroll to FAQ section then to item
  setTimeout(() => {
    items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 150);
}

// Initialise on DOM ready
initFaqAccordion();
initFaqTabs();

/* ══════════════════════════════════════════
   CONTACT TOPIC CHIPS
══════════════════════════════════════════ */
document.querySelectorAll('.topic-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    document.getElementById('contactTopic').value = chip.dataset.topic;
  });
});

/* ══════════════════════════════════════════
   CONTACT FORM SUBMIT
══════════════════════════════════════════ */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const topic = document.getElementById('contactTopic').value;
  showToast('Message Sent! ✉️', `We received your "${topic}" enquiry and will reply within 2 hours.`);
  this.reset();
  document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.topic-chip[data-topic="General Enquiry"]').classList.add('active');
  document.getElementById('contactTopic').value = 'General Enquiry';
});

/* ══════════════════════════════════════════
   GLOBAL KEYBOARD HANDLER
══════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCarDetailPage();
    closeSvcModal();
    closeDrawer();
  }
  const page = document.getElementById('carDetailPage');
  if (page.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  changeDetailGallery(-1);
    if (e.key === 'ArrowRight') changeDetailGallery(1);
  }
});

/* ══════════════════════════════════════════
   HERO TRACK BUTTON (legacy support)
══════════════════════════════════════════ */
function openStatusChecker() {
  if (typeof BookingModal !== 'undefined') BookingModal.openStatusChecker();
}

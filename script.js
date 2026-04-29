/* =====================================================
   1. HEADER & MOBILE NAVIGATION
===================================================== */

const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
const navClose = document.getElementById("navClose");
const navOverlay = document.getElementById("navOverlay");
const navLinks = document.querySelectorAll(".nav a");

/* OPEN NAV */
navToggle.addEventListener("click", () => {
  nav.classList.add("open");
  navOverlay.classList.add("active");
  navToggle.classList.add("hide");   // hide hamburger icon
  document.body.style.overflow = "hidden";
});

/* CLOSE NAV */
function closeNav() {
  nav.classList.remove("open");
  navOverlay.classList.remove("active");
  navToggle.classList.remove("hide"); // show hamburger again
  document.body.style.overflow = "";
}

/* CLOSE EVENTS */
navClose.addEventListener("click", closeNav);
navOverlay.addEventListener("click", closeNav);

navLinks.forEach(link => {
  link.addEventListener("click", closeNav);
});

/* Header scroll */
const header = document.querySelector(".header");

function handleHeader(){
  header.classList.toggle("scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", handleHeader);
window.addEventListener("load", handleHeader);



/* =====================================================
   2. FLEET DATA
===================================================== */

const cars = [
  {
    name:"Range Rover",
    type:"suv",
    category:"premium",
    price:360,
    img:"imgs/Range Rover.png",
    images:[
      "imgs/Range Rover.png",
      "imgs/range2.jpg",
      "imgs/range3.jpg"
    ],
    transmission:"Automatic",
    seats:"5 seats",
    ac:true,
    fuel:"Petrol",
    rating:4.8,
    reviews:124,
    description:"Luxury SUV with premium comfort, powerful performance, and cutting-edge technology.",
    features:["Sunroof","Leather Seats","GPS","Reverse Camera","Bluetooth"]
  },
  {
    name:"Toyota Fortuner",
    type:"suv",
    category:"premium",
    price:272,
    img:"imgs/Toyota Fortuner.png",
    images:[
      "imgs/Toyota Fortuner.png",
      "imgs/fortuner2.png",
      "imgs/fortuner3.png"
    ],
    transmission:"Automatic",
    seats:"7 seats",
    ac:true,
    fuel:"Diesel",
    rating:4.7,
    reviews:98,
    description:"Rugged and reliable SUV perfect for long trips and off-road adventures.",
    features:["4x4 Drive","Cruise Control","Rear AC","Touchscreen","Parking Sensors"]
  },
  {
    name:"Land Cruiser",
    type:"suv",
    category:"premium",
    price:240,
    img:"imgs/landcruiser.png",
    images:[
      "imgs/landcruiser.png",
      "imgs/land2.png",
      "imgs/land3.png"
    ],
    transmission:"Automatic",
    seats:"7 seats",
    ac:true,
    fuel:"Diesel",
    rating:4.9,
    reviews:150,
    description:"Iconic luxury SUV built for performance, durability, and extreme comfort.",
    features:["4WD","Luxury Interior","Navigation","Sunroof","Premium Audio"]
  },
  {
    name:"Mercedes-Benz Maybach",
    type:"premium",
    category:"premium",
    price:480,
    img:"imgs/Mercedes-Maybach_S680.png",
    images:[
      "imgs/Mercedes-Maybach_S680.png",
      "imgs/maybach2.png",
      "imgs/maybach3.png"
    ],
    transmission:"Automatic",
    seats:"4 seats",
    ac:true,
    fuel:"Petrol",
    rating:5.0,
    reviews:60,
    description:"Ultra-luxury sedan offering unmatched comfort, elegance, and prestige.",
    features:["Massage Seats","Ambient Lighting","Executive Rear Seats","Panoramic Roof","Voice Control"]
  },
  {
    name:"BMW Sedan",
    type:"premium",
    category:"premium",
    price:240,
    img:"imgs/BMW.jpeg",
    images:[
      "imgs/BMW.jpeg",
      "imgs/bmw2.jpeg",
      "imgs/bmw3.jpeg"
    ],
    transmission:"Automatic",
    seats:"5 seats",
    ac:true,
    fuel:"Petrol",
    rating:4.6,
    reviews:85,
    description:"Sporty and elegant sedan with dynamic performance and modern tech.",
    features:["Sport Mode","iDrive System","Parking Assist","Bluetooth","Dual AC"]
  },
  {
    name:"Mercedes-Benz G63 AMG",
    type:"suv",
    category:"premium",
    price:720,
    img:"imgs/G wagon.jpeg",
    images:[
      "imgs/G wagon.jpeg",
      "imgs/g63-2.jpeg",
      "imgs/g63-3.jpeg"
    ],
    transmission:"Automatic",
    seats:"5 seats",
    ac:true,
    fuel:"Petrol",
    rating:4.9,
    reviews:110,
    description:"High-performance luxury SUV with bold design and extreme power.",
    features:["AMG Engine","4MATIC AWD","Luxury Cabin","LED Lights","Digital Display"]
  },
  {
    name:"Toyota Aqua",
    type:"compact",
    category:"economy",
    price:96,
    img:"imgs/Toyota Aqua.jpeg",
    images:[
      "imgs/Toyota Aqua.jpeg",
      "imgs/aqua2.jpeg",
      "imgs/aqua3.jpeg"
    ],
    transmission:"Automatic",
    seats:"4 seats",
    ac:true,
    fuel:"Hybrid",
    rating:4.3,
    reviews:70,
    description:"Fuel-efficient compact car ideal for city driving and daily use.",
    features:["Eco Mode","Bluetooth","Airbags","Touchscreen","Rear Camera"]
  },
  {
    name:"Toyota Quantum",
    type:"van",
    category:"economy",
    price:180,
    img:"imgs/Toyota Quantam.jpeg",
    images:[
      "imgs/Toyota Quantam.jpeg",
      "imgs/quantum2.jpeg",
      "imgs/quantum3.jpeg"
    ],
    transmission:"Manual",
    seats:"12 seats",
    ac:true,
    fuel:"Diesel",
    rating:4.5,
    reviews:55,
    description:"Spacious van perfect for group travel, tours, and family trips.",
    features:["Large Capacity","Rear AC","Comfort Seats","Sliding Door","Luggage Space"]
  },
  {
    name:"Honda Civic",
    type:"sedan",
    category:"economy",
    price:168,
    img:"imgs/Honda Civic.png",
    images:[
      "imgs/Honda Civic.png",
      "imgs/civic2.png",
      "imgs/civic3.png"
    ],
    transmission:"Automatic",
    seats:"5 seats",
    ac:true,
    fuel:"Petrol",
    rating:4.6,
    reviews:90,
    description:"Stylish sedan with smooth performance and excellent fuel efficiency.",
    features:["Cruise Control","Touchscreen","Rear Camera","Bluetooth","Eco Mode"]
  }
];

/* =====================================================
   3. FLEET UI
===================================================== */

const fleetGrid = document.getElementById("fleetGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const categoryTitle = document.getElementById("fleetCategoryTitle");

function updateCategoryText(filter){
  if(filter==="all") categoryTitle.textContent="Cars";
  if(filter==="premium") categoryTitle.textContent="Luxury Sedans";
  if(filter==="suv") categoryTitle.textContent="Spacious and Powerful";
  if(filter==="economy") categoryTitle.textContent="Budget Friendly";
}

/* =====================================================
   4. RENDER CARS
===================================================== */

function renderCars(filter="all", query=""){

  const q=query.toLowerCase().trim();
  fleetGrid.innerHTML="";

  const filtered=cars.filter(car=>{
    const matchesFilter = filter==="all" || car.category===filter || car.type===filter;
    const matchesQuery = !q || car.name.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  if(!filtered.length){
    fleetGrid.innerHTML='<p class="empty-state">No cars found.</p>';
    return;
  }

  filtered.forEach(car=>{

    const card=document.createElement("article");
    card.className="car-card";

    if(car.category === "premium"){
      card.classList.add("premium");
    }

    card.innerHTML=`
      <div class="car-image">
        <img src="${car.img}" alt="${car.name}">
      </div>

      <div class="car-meta">
        <span class="car-title">${car.name}</span>
        <span class="car-tag">${car.category}</span>
      </div>

      <div class="car-price-row">
        <div class="car-price">
          $${car.price}<span>/day</span>
        </div>

        <div class="car-icons">
          <span><i class="fa-solid fa-gear"></i> ${car.transmission}</span>
          <span><i class="fa-solid fa-users"></i> ${car.seats}</span>
          <span><i class="fa-solid fa-snowflake"></i> ${car.ac ? "AC":"No AC"}</span>
        </div>
      </div>

      <div class="car-actions">
        <button class="btn btn-outline btn-details">Car Details</button>
        <button class="btn btn-primary btn-book">Book Now</button>
      </div>
    `;

    fleetGrid.appendChild(card);
  });
}

renderCars();

/* =====================================================
   5. FILTER + SEARCH
===================================================== */

filterButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    filterButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    const filter=btn.dataset.filter;
    updateCategoryText(filter);
    renderCars(filter, searchInput.value);
  });
});

searchInput.addEventListener("input",()=>{
  const active=document.querySelector(".filter-btn.active");
  renderCars(active?.dataset.filter || "all", searchInput.value);
});


/* =====================================================
   6. BOOKING MODAL
===================================================== */

const bookingModal = document.getElementById("bookingModal");
const bookingClose = document.getElementById("bookingClose");

const bookingCarName = document.getElementById("bookingCarName");
const bookingCarImg = document.getElementById("bookingCarImg");
const bookingCarPrice = document.getElementById("bookingCarPrice");

const bookingForm = document.getElementById("bookingForm");
const bookingSuccess = document.getElementById("bookingSuccess");

/* NEW CALCULATOR ELEMENTS */
const daysInputBooking = document.getElementById("days");
const bookingTotal = document.getElementById("bookingTotal");

let selectedCar = null;

/* OPEN BOOKING MODAL */
document.addEventListener("click", (e) => {
  if (e.target.closest(".btn-book")) {
    const card = e.target.closest(".car-card");
    const name = card.querySelector(".car-title").textContent;

    const car = cars.find(c => c.name === name);
    if (!car) return;

    selectedCar = car;

    bookingCarName.textContent = car.name;
    bookingCarImg.src = car.img;
    bookingCarPrice.textContent = "$" + car.price + "/day";

    /* RESET CALCULATOR */
    daysInputBooking.value = 1;
    updateBookingTotal();

    bookingModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
});

/* CALCULATOR FUNCTION */
function updateBookingTotal() {
  if (!selectedCar) return;

  const days = parseInt(daysInputBooking.value) || 1;
  const total = days * selectedCar.price;

  bookingTotal.textContent = "$" + total;
}

/* Listen to input */
daysInputBooking.addEventListener("input", updateBookingTotal);

/* SUBMIT FORM */
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  bookingModal.classList.remove("active");
  document.body.style.overflow = "";

  bookingSuccess.classList.add("show");
  bookingForm.reset();

  setTimeout(() => {
    bookingSuccess.classList.remove("show");
  }, 3500);
});

/* CLOSE MODAL */
function closeBookingModal() {
  bookingModal.classList.remove("active");
  document.body.style.overflow = "";
}

/* Close button */
bookingClose.addEventListener("click", closeBookingModal);

/* Click outside */
bookingModal.addEventListener("click", (e) => {
  if (e.target === bookingModal) {
    closeBookingModal();
  }
});

const pickupDate = document.getElementById("pickupDate");
const returnDate = document.getElementById("returnDate");
const confirmBtn = document.getElementById("confirmBooking");

/* AUTO CALCULATE DAYS */
function calculateDays() {
  if (!pickupDate.value || !returnDate.value) return;

  const start = new Date(pickupDate.value);
  const end = new Date(returnDate.value);

  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    daysInputBooking.value = diffDays;
  } else {
    daysInputBooking.value = 1;
  }

  updateBookingTotal();
}

/* Listen to changes */
pickupDate.addEventListener("change", calculateDays);
returnDate.addEventListener("change", calculateDays);

/* CONFIRM BOOKING */
confirmBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!pickupDate.value || !returnDate.value) {
    alert("Please select dates");
    return;
  }

  bookingModal.classList.remove("active");
  document.body.style.overflow = "";

  bookingSuccess.classList.add("show");

  setTimeout(() => {
    bookingSuccess.classList.remove("show");
  }, 3000);
});


/* =====================================================
   7. DETAILS MODAL
===================================================== */

const detailsModal = document.getElementById("carDetailsModal");
const detailsClose = document.getElementById("detailsClose");
const detailsBookBtn = document.getElementById("detailsBookBtn");

const detailsName = document.getElementById("detailsName");
const detailsDesc = document.getElementById("detailsDesc");
const detailsPrice = document.getElementById("detailsPrice");

const specTrans = document.getElementById("specTrans");
const specSeats = document.getElementById("specSeats");
const specFuel = document.getElementById("specFuel");

const mainImage = document.getElementById("mainCarImage");
const thumbContainer = document.getElementById("thumbContainer");

const featuresList = document.getElementById("featuresList");

const daysInput = document.getElementById("daysInput");
const totalPrice = document.getElementById("totalPrice");

let currentCarPrice = 0;

/* Open details */
document.addEventListener("click",(e)=>{
  if(e.target.closest(".btn-details")){
    const card = e.target.closest(".car-card");
    const name = card.querySelector(".car-title").textContent;

    const car = cars.find(c=>c.name===name);
    if(!car) return;

    selectedCar = car;

    detailsName.textContent = car.name;
    detailsDesc.textContent = car.description;
    detailsPrice.textContent = car.price;

    specTrans.textContent = car.transmission;
    specSeats.textContent = car.seats;
    specFuel.textContent = car.fuel;

    currentCarPrice = car.price;

    mainImage.src = car.images?.[0] || car.img;

    /* thumbnails */
    thumbContainer.innerHTML="";
    (car.images || [car.img]).forEach(img=>{
      const el=document.createElement("img");
      el.src=img;
      el.onclick=()=>mainImage.src=img;
      thumbContainer.appendChild(el);
    });

    /* features */
    featuresList.innerHTML="";
    (car.features||[]).forEach(f=>{
      featuresList.innerHTML+=`<span>${f}</span>`;
    });

    daysInput.value=1;
    updateTotal();

    detailsModal.classList.add("active");
    document.body.style.overflow="hidden";
  }
});

/* price calc */
function updateTotal(){
  totalPrice.textContent = "$" + ((daysInput.value||1)*currentCarPrice);
}
daysInput.addEventListener("input",updateTotal);

/* book from details */
detailsBookBtn.addEventListener("click",()=>{
  if(!selectedCar) return;

  detailsModal.classList.remove("active");

  bookingCarName.textContent = selectedCar.name;
  bookingCarImg.src = selectedCar.img;
  bookingCarPrice.textContent = "$" + selectedCar.price + "/day";

  bookingModal.classList.add("active");
});

/* close */
function closeDetails(){
  detailsModal.classList.remove("active");
  document.body.style.overflow="";
}

detailsClose.onclick=closeDetails;
detailsModal.onclick=(e)=>{
  if(e.target===detailsModal) closeDetails();
};


/* =====================================================
   8. SERVICE MODAL
===================================================== */

const serviceModal = document.getElementById("serviceModal");
const modalClose = document.querySelector(".modal-close");

const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

/* Service Data */
const servicesData = {
  airport: {
    title: "Airport Transfers",
    img: "imgs/Aiport transfer.jpg",
    text: "Enjoy stress-free airport pickups and drop-offs with our professional chauffeurs. Always on time, always comfortable."
  },
  wedding: {
    title: "Wedding Events",
    img: "imgs/wedding events.jpg",
    text: "Make your special day unforgettable with our luxury fleet, perfect for grand entrances and elegant travel."
  },
  business: {
    title: "Business Meetings",
    img: "imgs/business events.jpg",
    text: "Arrive in style and on time with executive vehicles designed for professionals and corporate travel."
  },
  intercity: {
    title: "Intercity Trips",
    img: "imgs/intercity.jpg",
    text: "Travel long distances comfortably with our reliable cars and flexible rental packages."
  }
};

/* Open Modal */
document.addEventListener("click", (e) => {
  const link = e.target.closest(".service-link");

  if (link) {
    const key = link.dataset.service;
    const service = servicesData[key];

    if (!service) return;

    modalTitle.textContent = service.title;
    modalText.textContent = service.text;
    modalImage.src = service.img;

    serviceModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
});

/* Close Modal */
modalClose.addEventListener("click", () => {
  serviceModal.classList.remove("active");
  document.body.style.overflow = "";
});

/* Close on outside click */
serviceModal.addEventListener("click", (e) => {
  if (e.target === serviceModal) {
    serviceModal.classList.remove("active");
    document.body.style.overflow = "";
  }
});


/* =====================================================
   9. FAQ
===================================================== */

document.querySelectorAll(".faq-item").forEach(item => {
  const icon = item.querySelector(".icon");

  item.addEventListener("click", () => {

    document.querySelectorAll(".faq-item").forEach(el => {
      if (el !== item) {
        el.classList.remove("active");
        el.querySelector(".icon").textContent = "+";
      }
    });

    item.classList.toggle("active");

    if (item.classList.contains("active")) {
      icon.textContent = "-";
    } else {
      icon.textContent = "+";
    }
  });
});


/* =====================================================
   10. CONTACT FORM
===================================================== */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = new FormData(contactForm).get("name");

    formStatus.textContent = `Thank you, ${name}. We’ve received your message.`;

    formStatus.classList.add("show");
    contactForm.reset();

    setTimeout(() => {
      formStatus.classList.remove("show");
    }, 4000);
  });
}


/* =====================================================
   11. SCROLL REVEAL
===================================================== */

const reveals = document.querySelectorAll(".reveal");

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.15});

  reveals.forEach(el=>observer.observe(el));
} else {
  reveals.forEach(el => el.classList.add("show"));
}




// ================= AUTH UI =================
const signinBtn   = document.getElementById("signinBtn");
const authPopup   = document.getElementById("authPopup");
const authOverlay = document.getElementById("authOverlay");
const authClose   = document.getElementById("authClose");

function openAuth(){
  authPopup.classList.add("active");
  authOverlay.classList.add("active");
}

function closeAuth(){
  authPopup.classList.remove("active");
  authOverlay.classList.remove("active");
}

signinBtn.onclick = openAuth;
authClose.onclick = closeAuth;
authOverlay.onclick = closeAuth;

document.addEventListener("keydown",(e)=>{
  if(e.key === "Escape") closeAuth();
});

// ================= TABS =================
const tabs  = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");

tabs.forEach(tab=>{
  tab.onclick = ()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    forms.forEach(f=>f.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab + "Form").classList.add("active");
  };
});


// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

// ================= INIT FIREBASE =================
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// keep user logged in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);


// ================= GOOGLE LOGIN =================
const googleBtn = document.getElementById("googleLogin");

googleBtn.addEventListener("click", async ()=>{

  googleBtn.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Connecting...
  `;
  googleBtn.disabled = true;

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {

    let result;

    // mobile devices use redirect
    if(window.innerWidth <= 768){
      await auth.signInWithRedirect(provider);
      return;
    }

    // desktop popup
    result = await auth.signInWithPopup(provider);

    const user = result.user;

    alert("Welcome " + user.displayName);
    closeAuth();

  } catch(error){
    console.error(error);
    alert(error.message);
  }

  googleBtn.innerHTML = `
    <i class="fa-brands fa-google"></i>
    Continue with Google
  `;
  googleBtn.disabled = false;
});


// ================= HANDLE REDIRECT RESULT =================
auth.getRedirectResult()
.then((result)=>{
  if(result.user){
    alert("Welcome " + result.user.displayName);
    closeAuth();
  }
})
.catch((error)=>{
  console.error(error);
});


// ================= AUTO LOGIN CHECK =================
auth.onAuthStateChanged((user)=>{
  if(user){
    signinBtn.innerHTML = `
      <img src="${user.photoURL}" 
      style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
      ${user.displayName.split(" ")[0]}
    `;
  }
});
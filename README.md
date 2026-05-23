<div align="center">

<br/>

<img src="https://cdn-icons-png.flaticon.com/512/744/744465.png" width="80"/>

<br/>

# LCR — Lee Car Rental

<p><em>Premium car rental experience · Mutare, Zimbabwe</em></p>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=flat-square&logo=fontawesome&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_View_Live_Site-4169E1?style=for-the-badge&logoColor=white)](https://lee-car-rental-cqtj60zyl-lee-simoyis-projects.vercel.app)
&nbsp;
[![Source Code](https://img.shields.io/badge/📂_Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/Lee-Car-Rental)

<br/>

![LCR Banner](imgs/ReadMe.png)

</div>

<br/>

---

## 👋 About This Project

**LCR — Lee Car Rental** is a fully responsive, single-page car rental website I built from scratch using only HTML, CSS, and vanilla JavaScript — no frameworks, no build tools.

The goal was to design and develop a polished, production-quality product that delivers a premium feel: smooth animations, rich interactivity, a complete booking flow, and a design system that scales cleanly across every device size.

> Everything you see — the UI, the data layer, the animation system, the responsive layout — is hand-written.

---

## ✨ Highlights

<table>
<tr>
<td width="50%">

### 🎨 Design System
- CSS custom properties for full-site theming
- Poppins typeface · 9 font weights
- Glassmorphism booking form
- Consistent spacing, radius & shadow tokens

</td>
<td width="50%">

### ⚡ Interactions
- Scroll-reveal with `IntersectionObserver`
- Animated number counters with easing
- Smooth section transitions throughout
- Toast notifications on form submit

</td>
</tr>
<tr>
<td width="50%">

### 🚗 Car Detail Page
- Full-screen slide-over (`translateX` transition)
- 6-image gallery per vehicle with label overlays
- Thumbnail strip + arrow navigation + keyboard support
- Tabbed content: Overview · Gallery · Pricing

</td>
<td width="50%">

### 📱 Responsive Layout
- 5 breakpoints from 390px to 1440px+
- Mobile drawer with backdrop blur
- Adaptive grids across all sections
- Touch-friendly targets throughout

</td>
</tr>
</table>

---

## 🛠️ Built With

| Technology | Purpose |
|:-----------|:--------|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Semantic page structure — 10 sections in one file |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | 1,800+ lines — design system, animations, 5 breakpoints |
| ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | All interactivity, data rendering, event handling |
| ![Font Awesome](https://img.shields.io/badge/-Font_Awesome_6.5-528DD7?style=flat-square&logo=fontawesome&logoColor=white) | 60+ icons across the UI |
| ![Google Fonts](https://img.shields.io/badge/-Google_Fonts-4285F4?style=flat-square&logo=google&logoColor=white) | Poppins (300–900 weights) |
| ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white) | Hosting & continuous deployment |

---

## 🗂️ What's Inside

```
Lee-Car-Rental/
├── 📄 index.html          # Full page — navbar, 10 sections, modals, footer
├── 🎨 style.css           # Design system + all component styles
├── ⚡ script.js           # CAR_DATA · SVC_DATA · UI logic · animations
└── 🖼️  imgs/              # Local vehicle photography (30+ images)
```

---

## 🚘 Fleet System

Six vehicles, each with a complete data object powering the detail page:

```js
CAR_DATA.camry = {
  name, subtitle, price, badge,
  images:   [ /* 6 labelled gallery shots */ ],
  specs:    [ /* 8 technical rows */ ],
  features: [ /* 8 key highlights */ ],
  pricing:  [ /* daily · weekly · monthly cards */ ],
  photos:   [ /* gallery tab images */ ],
}
```

| Vehicle | Class | From |
|:--------|:------|-----:|
| 🔵 BMW X5 | Luxury SUV | $140/day |
| 🟣 Mercedes-Benz C300 | Luxury Sedan | $120/day |
| ⚡ Tesla Model 3 | Electric Sedan | $95/day |
| 🟠 Ford Explorer | Full-Size SUV | $75/day |
| 🟡 Toyota Camry | Mid-Size Sedan | $45/day |
| 🟢 Honda Civic | Compact Sedan | $35/day |

---

## 📸 Key Pages & Features

### Hero Section
Full-viewport banner with animated headline, live stat counters, glass-morphism floating badges, and an interactive thumbnail strip that swaps the featured car with a crossfade transition.

### Car Detail Page
A full-screen slide-over triggered per vehicle. Includes a 6-shot image gallery (exterior, side, dynamic, dashboard, interior, night), spec table, features checklist, three pricing tiers, and an "Also Available" strip — all driven by the `CAR_DATA` object.

### Services Modal
Six service cards (Daily Rental · Airport Transfer · Corporate · Chauffeur · Safari · Roadside) each open a centred popup with a banner image, feature grid, pricing block, and CTA buttons.

### Booking Form
Dark glassmorphism card with vehicle pre-selection (passed from car cards), date pickers with automatic min-date enforcement, and a toast confirmation on submit.

### Contact Section
Google Maps embed with hover greyscale-to-colour effect, dark business hours panel, topic chip selector, and a full enquiry form — all in a two-column responsive layout.

---

## 📐 Responsive Breakpoints

| Breakpoint | What Changes |
|:-----------|:-------------|
| `≤ 1024px` | Hero & About collapse to single column · Fleet goes 2-col |
| `≤ 900px` | Desktop nav replaced by hamburger + slide-in drawer |
| `≤ 720px` | Fleet · Services · Reviews all go single column |
| `≤ 600px` | Date row stacks · Form grid collapses · Separators hidden |
| `≤ 390px` | Final font and padding reductions |

---

## 🗺️ Roadmap

- [x] Full responsive layout across 5 breakpoints
- [x] Car Detail Page — slide-over with gallery + tabs
- [x] Service Modal popup system
- [x] Mobile drawer navigation
- [x] Booking form with date logic
- [x] FAQ accordion · Reviews · Contact form
- [ ] Firebase Authentication
- [ ] Real-time booking API
- [ ] Admin dashboard

---

<div align="center">

<br/>

<img src="https://cdn-icons-png.flaticon.com/512/744/744465.png" width="32"/>

**LCR Lee Car Rental** · Mutare, Zimbabwe · © 2026

*Built entirely by hand — HTML, CSS & JavaScript*

<br/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

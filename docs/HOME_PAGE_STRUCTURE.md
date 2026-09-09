# Cancer Aware Bharat - Home Page Structure & Elements

This document provides a detailed itemized breakdown of all sections, subsections, components, buttons, cards, form fields, modal triggers, and interactive elements present on the **Cancer Aware Bharat** home page.

---

## 🌐 Global Layout Elements (Present on Home Page View)

### 1. Top Campaign Alert Marquee Banner
* **Alert Badge & Icon**: 📢 `Campaign Alert:`
* **Marquee Message**: *"Free Early Detection & Screening Camps active across New Delhi & Pune."* (Auto-scrolling ticker, pauses on hover)
* **Interactive Button**: `Register Now →` (Triggers Patient Support / Enquiry Modal)

### 2. Sticky Header Navbar
* **Brand Logo & Title**:
  * Circular logo image (`/brand-logo.jpeg`)
  * Brand Name: **Cancer Aware Bharat** (Links to `/`)
  * Subtitle: **कैंसर जागरूकता अभियान**
* **Desktop Navigation Links**:
  * `Home` (Active tab indicator)
  * `About` (Navigates to `/about`)
  * `Events` (Dropdown menu with: *Event Details*, *Event Gallery*)
  * `Health Centres` (Navigates to `/hospitals`)
  * `More` (Dropdown menu with: *Health Centres*, *Blogs & Articles*, *Gallery*, *Our Mission*, *Our Doctors / हमारे डॉक्टर*, *Cancer Awareness*, *Health Camps*, *Join Us / मिशन से जुड़ें*, *Contact Us*)
* **Desktop Action Buttons**:
  * **User Profile / Portal Status** (Displays active portal badge or login dropdown with *Volunteer Login* and *Hospital Login*)
  * `Donate` Button 🎁 (Opens Donation Modal)
  * `Become a Volunteer` Button ❤️ (Navigates to `/volunteer/login?mode=register`)
* **Mobile Navbar Controls**:
  * `Donate` Button
  * `Enquiry` Button
  * Hamburger Menu Toggle Button ☰ (Opens Mobile Off-Canvas Drawer with navigation accordions, user auth actions, and social links)

### 3. Floating Action Button (FAB)
* **Get Patient Support** Floating Button (Fixed bottom-right corner with pulsing animated status dot; opens Chat Assistant / Enquiry Modal)

### 4. Global Footer
* **Emergency Contact Bar**:
  * 24/7 Cancer Helpline: `+91 11 4055 9200`
  * Active status indicator (*Average response time: 2 minutes*)
* **Brand Column**:
  * Logo & Title (*Cancer Aware Bharat - कैंसर जागरूकता अभियान*)
  * Mission statement summary
  * Social Media Links: Facebook, Twitter, Instagram, LinkedIn, YouTube
* **Quick Links**:
  * *About Us*, *Our Mission*, *Screening Camps*, *Hospital Network*, *Educational Blogs*, *Impact Gallery*
* **Useful Links**:
  * *Patient Enquiry*, *Become a Volunteer*, *Join Us*, *Our Doctors*, *Interactive Sitemap*, *Hospital Partner Portal*
* **Contact & Newsletter**:
  * Address: *Sector 7, Dwarka, New Delhi, Delhi 110075, India*
  * Email: `info@awarebharat.org`
  * Phone: `+91 11 4055 9200`
  * Footer Newsletter Email Input + Submit Arrow Button
* **Bottom Bar**:
  * Copyright notice
  * Interactive Links: *Sitemap* (Opens Sitemap Modal), *Privacy Policy*, *Terms of Service*

---

## 🏠 Main Home Page Body (`HomeTab`)

### Section 1: Hero Banner (Cinematic Carousel)
* **Background Carousel**: 4 auto-rotating background slides with Ken Burns zoom effect and left-to-right gradient overlay:
  1. **डॉक्टर नेटवर्क**: *विशेषज्ञ कैंसर देखभाल आपके निकट*
  2. **सामुदायिक जागरूकता**: *जागरूकता से सशक्त बनता भारत*
  3. **निःशुल्क जांच शिविर**: *सुलभ कैंसर जांच हर गांव और शहर में*
  4. **मरीज सहायता केंद्र**: *स्वास्थ्य और जीवन की नई किरण*
* **Text & Badge Elements**:
  * Category Tag Pill
  * 2-Line Bold Animated Headline
  * Descriptive Subtitle Text
* **Hero Call-to-Action Buttons**:
  * **Primary Action Button** (Dynamic label: *विशेषज्ञ खोजें* / *अभियान देखें* / *नजदीकी कैंप खोजें* / *अभी मदद पाएं*)
  * **Secondary Action Button** (Dynamic label: *मरीज पूछताछ* / *हमारे साथ जुड़ें* / *सहयोग करें* / *मिशन से जुड़ें*)
* **Carousel Controls**:
  * Left (`<`) & Right (`>`) Arrow Navigation Buttons
  * Slide Position Dots (Bottom right)

### Section 1.1: Floating Action Bar
* **Card 1: Book Appointment**:
  * Badge: ✨ *EXPERT CARE & ASSISTANCE*
  * Headline: *Feel free to book an appointment*
  * Call-to-Action Button: `Book an Appointment` 📅 (Triggers Enquiry Modal)
* **Card 2: Social Media FABs**:
  * Heading: *Follow Us On Social Media*
  * Quick-launch Social Buttons: `Instagram` 📸, `Facebook` 📘, `YouTube` ▶️

### Section 1.5: Trusted By & Collaboration Strip
* **Label**: *TRUSTED BY & IN COLLABORATION WITH*
* **Infinite Logo Marquee**: Auto-scrolling partner logos (*Apex Oncology, National Health Org, CareWell Centers, MediTech Diagnostics, Global Care Foundation, OncoShield, Regional Cancer Registry*)

### Section 2: Impact Statistics Counter
* **Animated Counter Grid** (4 Cards with animated numbers on scroll):
  1. **Free Screenings**: `14,250+` (*Across 6 states*)
  2. **Hospital Partners**: `4` (*Apex, CareWell & more*)
  3. **Awareness Camps**: `180+` (*Active community outreach*)
  4. **Navigation Cases**: `1,240+` (*Complete therapy navigation*)

### Section 3: Core Programs / Key Initiatives
* **Section Header**: Badge (*OUR CORE PROGRAMS*), Title (*Our Key Initiatives That Save Lives*), Description.
* **3 Program Cards**:
  1. **Early Cancer Screening** (Microscope icon, description of free camps)
  2. **Patient Navigation & Support** (HeartPulse icon, caseworker assistance description)
  3. **Cancer Education & Prevention** (BookOpen icon, workshops & self-exam training)

### Section 4: Upcoming Screening Camps (Carousel)
* **Header & Controls**:
  * Badge: *UPCOMING CAMPS*
  * Title: *Upcoming Screening Camps*
  * Navigation Arrows (`<` / `>`)
* **Camp Cards**:
  * Camp Image with Category Badge
  * Title & Description
  * Details: Date 📅, Time ⏰, Location 📍
  * Capacity Progress Bar & Status Badge (*Registration Open*, *Almost Full*, or *Fully Booked*)
  * `Register Now` Button → (Opens Enquiry Modal)
* **Pagination Dots Indicator**

### Section 5: Panoramic Photo Gallery
* **Header**: Badge (*PHOTO GALLERY*), Title (*Moments That Inspire Hope*), Description.
* **Infinite Sliding Panorama Banner**:
  * Interactive image cards showcasing field camps (*Jaipur, Pune, Ahmedabad, Lucknow, Bhopal*)
  * Hover effects with Location badges & Arrow button overlay (Navigates to `/gallery`)
* **Manual Navigation Buttons** (`<` / `>`)

### Section 6: Why Choose Cancer Aware Bharat (Split Feature Showcase)
* **Left Image Column**:
  * Main Hero Photo with Play button overlay
  * 2 Overlapping Floating Image Cards (Doctor consultation & camp)
  * Vertical Ribbon Badge: *Cancer Awareness Saves Lives* ❤️
* **Right Content Column**:
  * Headline: *Helping Every Patient Live With Hope*
  * Feature Blocks:
    * *Compassionate Patient Support* (Caseworkers & guidance)
    * *Trusted Medical Network* (Partner hospitals & specialists)
  * Checklist:
    * ✓ *Free Cancer Screening Camps*
    * ✓ *Hospital & Referral Support*
    * ✓ *Expert Medical Guidance*
    * ✓ *Cancer Awareness Programs*
  * CTA Buttons: `Explore Our Mission` Button → and `Call Us` Phone Link Button 📞

### Section 7: Testimonials (Carousel)
* **Header**: Badge (*TESTIMONIALS*), Title (*What People Say About Us*), Description.
* **Review Cards Carousel**:
  * Star Rating Bar (5 Stars) & Quote Icon
  * Review Text Quote
  * Reviewer Profile: Avatar Photo, Name, Designation, and Organization
* **Navigation Buttons** (`<` / `>`)

### Section 8: Partnerships Continuous Banner (3-Panel Split)
* **Left Panel**: *Become A Volunteer* (Background image, description, `Become a Volunteer` button →)
* **Center Panel**: High-impact Video Play Button Overlay ▶️
* **Right Panel**: *Become A Health Centre Partner* (Background image, description, `Partner as Health Centre` button →)

### Section 9: Medical Advisory Board (Team Showcase)
* **Header**: Badge (👨‍⚕️ *Medical Experts*), Title (*Meet Our Medical Advisory Board*), Description.
* **3 Doctor Cards**:
  * Doctor Photo with hover-reveal social icons & Plus icon
  * Name, Specialization, and Hospital name
* **Action Button**: `View All Doctors` Button → (Navigates to `/our-team`)

### Section 10: Latest Cancer News & Articles
* **Header**: Badge (*CANCER AWARENESS*), Title (*Latest Cancer News & Awareness*), Description.
* **3 Article Tilt Cards**:
  * Image with Category Badge (*Prevention*, *Awareness*, *Screening*)
  * Title & Description
  * Metadata: Date 📅, Read Time ⏱️, Arrow link
* **Action Button**: `View All Articles` Button →

### Section 11: Frequently Asked Questions (FAQ)
* **Header**: Badge (*FAQ*), Title (*Frequently Asked Questions*), Subtitle.
* **6 Interactive Accordion Items** (Expandable questions & answers):
  1. *Are the screening camps really free?*
  2. *How do I register for a screening camp near me?*
  3. *Can I volunteer if I don't have a medical background?*
  4. *How does the patient navigation service work?*
  5. *Which states does Cancer Aware Bharat operate in?*
  6. *How can hospitals partner with Cancer Aware Bharat?*

### Section 12: Newsletter Subscription Box
* **Header**: Badge (*Newsletter*), Title (*Stay Updated*), Subtitle (*No spam. Unsubscribe anytime.*)
* **Form Elements**:
  * Email Input Field ✉️ (*Enter your email address*)
  * `Subscribe` Button
  * Success Confirmation Message (displayed upon submitting valid email)

### Section 13: Join Our Mission Call-To-Action
* **Left Text Column**:
  * Badge: ❤️ *JOIN OUR MISSION*
  * Title: *Together We Can Fight Cancer Across India*
  * Description & Action Buttons: `Become a Volunteer` Button and `Patient Enquiry` Button
* **Right Feature Photo**:
  * High-res imagery with floating hover-arrow trigger

---

## 💬 Interactive Modals Triggered from Home Page

1. **Chat Assistant / Patient Support Modal (`ChatAssistant.tsx`)**:
   * Interactive conversational assistant with symptom screening form, appointment requesting, and helpline contact options.
2. **Donation Modal (`DonateModal.tsx`)**:
   * Multi-amount selection buttons, custom donation input, UPI / NetBanking / Card payment selection, and tax exemption info.
3. **Interactive Sitemap Modal (`SitemapModal.tsx`)**:
   * Visual directory tree mapping out public portals, hospital networks, volunteer workflows, and resources.

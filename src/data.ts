import { Hospital, Event, BlogArticle } from './types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Apex Oncology Institute',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfAmubkh_DDHQqTm_TOQvS-OuyqwJVwXEzaIxqITTSlmKD1ugZbmSNyRW7z68T7KjhocaKflJtP_YSYj6AXWOnuIuLSIQiynQWZ_WA27x3tUS5Rp5_VUmrBIYgcGhza5pr2uqqkP3SsRcJwE02N0AGuwrRu9-SoWLx0cpTHxZ88nwxsepXOrX9OVmd6f4Q5SHzgzuT4LGyNez84A1p2PuRNTHnkUOiQPFaFoiOrBFfpFvbAvsj6Abq9A',
    type: 'Center of Excellence',
    region: 'north',
    city: 'New Delhi',
    state: 'Delhi',
    specialties: ['Radiation Therapy', 'Surgical Oncology', 'Palliative Care'],
    phone: '+91 11 4055 9200',
    email: 'contact@apexoncology.in',
    address: 'Sector 7, Dwarka, New Delhi, Delhi 110075',
    lat: 28.5921,
    lng: 77.0460,
    description: 'Apex Oncology Institute is a world-class facility dedicated to advanced cancer care. Equipped with state-of-the-art linear accelerators, a robotic surgery suite, and a dedicated team of medical oncologists, it serves as a cornerstone of our high-quality cancer screening and treatment network.'
  },
  {
    id: 'hosp-2',
    name: 'CareWell Cancer Hospital',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
    type: 'Community Partner',
    region: 'west',
    city: 'Mumbai',
    state: 'Maharashtra',
    specialties: ['Chemotherapy', 'Support Groups', 'Immunotherapy'],
    phone: '+91 22 2640 4500',
    email: 'care@carewellcancer.org',
    address: 'SV Road, Bandra West, Mumbai, Maharashtra 400050',
    lat: 19.0596,
    lng: 72.8295,
    description: 'CareWell Cancer Hospital specializes in patient-centric care models, bridging clinical excellence with holistic community support programs. They host weekly survivor support circles, psychological counseling sessions, and affordable chemotherapy treatments for families from all backgrounds.'
  },
  {
    id: 'hosp-3',
    name: 'Tata Cancer Care & Research Center',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfAmubkh_DDHQqTm_TOQvS-OuyqwJVwXEzaIxqITTSlmKD1ugZbmSNyRW7z68T7KjhocaKflJtP_YSYj6AXWOnuIuLSIQiynQWZ_WA27x3tUS5Rp5_VUmrBIYgcGhza5pr2uqqkP3SsRcJwE02N0AGuwrRu9-SoWLx0cpTHxZ88nwxsepXOrX9OVmd6f4Q5SHzgzuT4LGyNez84A1p2PuRNTHnkUOiQPFaFoiOrBFfpFvbAvsj6Abq9A',
    type: 'Center of Excellence',
    region: 'east',
    city: 'Kolkata',
    state: 'West Bengal',
    specialties: ['Hematology', 'Bone Marrow Transplant', 'Screening Centers'],
    phone: '+91 33 2432 8000',
    email: 'info@tatacancercare.org',
    address: 'Rajarhat, New Town, Kolkata, West Bengal 700156',
    lat: 22.5726,
    lng: 88.3639,
    description: 'Tata Cancer Care & Research Center is a pioneering institution in Eastern India. It leads groundbreaking clinical trials in pediatric and hematological malignancies, and supports mobile screening clinics operating in rural parts of Bengal and Assam.'
  },
  {
    id: 'hosp-4',
    name: 'Narayana Health City',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
    type: 'Community Partner',
    region: 'south',
    city: 'Bangalore',
    state: 'Karnataka',
    specialties: ['Pediatric Oncology', 'Surgical Oncology', 'Nuclear Medicine'],
    phone: '+91 80 7122 2222',
    email: 'oncology@narayanahealth.org',
    address: 'Hosur Road, Bommasandra, Bangalore, Karnataka 560099',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Narayana Health City represents one of India’s largest specialized cancer campuses. Famous for its high-volume, low-cost operational efficiency, they offer cutting-edge immunotherapy and advanced precision nuclear medicine to thousands of patients annually.'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Mega Rural Cancer Screening & Blood Drive',
    type: 'Screening Camp',
    image: '/events/event-1.jpeg',
    date: 'Sat, 15 Oct 2024',
    time: '9:00 AM',
    location: 'City Hospital Community Hall, New Delhi',
    description: 'Free mammography screening, oral examination, and blood donation drive supported by specialized oncologists and certified caseworkers.',
    category: 'Screening Camps',
    registeredCount: 184,
    capacity: 250
  },
  {
    id: 'event-2',
    title: 'Free Early Detection & Pap Screening Camp',
    type: 'Screening Camp',
    image: '/events/event-2.jpeg',
    date: 'Sun, 22 Oct 2024',
    time: '10:00 AM',
    location: 'Lions Club Grounds, Mumbai',
    description: 'Comprehensive screening for oral, breast, and cervical cancers entirely free of charge with on-spot specialist consultations.',
    category: 'Screening Camps',
    registeredCount: 145,
    capacity: 200
  },
  {
    id: 'event-3',
    title: 'Nutrition Post-Treatment & Holistic Recovery Workshop',
    type: 'Workshop',
    image: '/events/event-3.jpeg',
    date: 'Wed, 25 Oct 2024',
    time: '4:00 PM',
    location: 'District Health Center Auditorium, Varanasi',
    description: 'Interactive workshop focusing on post-chemotherapy dietary guidance, yoga, and holistic patient recovery.',
    category: 'Workshops',
    registeredCount: 68,
    capacity: 100
  },
  {
    id: 'event-4',
    title: 'Mobile Mammography & Oral Health Rally',
    type: 'Screening Camp',
    image: '/events/event-4.jpeg',
    date: 'Sun, 05 Nov 2024',
    time: '8:30 AM',
    location: 'Panchayat Bhavan, Pune Rural',
    description: 'Mobile diagnostic van screening over 300 village residents for early warning signs with direct referral slips.',
    category: 'Screening Camps',
    registeredCount: 210,
    capacity: 300
  },
  {
    id: 'event-5',
    title: 'Volunteer First-Aid & Patient Navigation Seminar',
    type: 'Workshop',
    image: '/events/event-5.jpeg',
    date: 'Sat, 18 Nov 2024',
    time: '11:00 AM',
    location: 'Community Hall, Lucknow',
    description: 'Orientation and safety protocol training for grassroot volunteer advocates on guiding rural patients.',
    category: 'Workshops',
    registeredCount: 95,
    capacity: 150
  },
  {
    id: 'event-6',
    title: 'District Blood & Platelet Donor Drive',
    type: 'Blood Donation',
    image: '/events/event-6.jpeg',
    date: 'Sun, 26 Nov 2024',
    time: '9:00 AM',
    location: 'Civil Hospital Grounds, Jaipur',
    description: 'Blood and platelet collection drive for chemotherapy units. Health checkup certificates provided for all donors.',
    category: 'Blood Donation',
    registeredCount: 130,
    capacity: 200
  }
];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: 'blog-1',
    title: '5 Warning Signs of Breast Cancer You Should Never Ignore',
    summary: 'Breast cancer is the most common cancer in Indian women. Early identification can increase survival rates to over 90%. Learn how to conduct self-exams.',
    content: `Breast cancer is currently the leading cancer among women in India, accounting for nearly 14% of all cancer cases. However, the most important truth is this: **early detection saves lives**. When detected early, breast cancer is highly treatable, and the five-year survival rate can exceed 90%.

Here are the five critical warning signs that should never be ignored:

1. **A New Lump in the Breast or Underarm:** This is the most common sign. A lump that is hard, painless, and has uneven edges is more likely to be cancer, but any lump—painful or painless—needs medical evaluation.
2. **Changes in Breast Size or Shape:** Unexplained swelling, shrinkage, or asymmetrical changes to one of your breasts.
3. **Dimpling or Skin Irritation:** The skin of the breast may look like an orange peel (dimpling) or exhibit redness, flaking, or thickening.
4. **Nipple Changes or Discharge:** A nipple that turns inward (retraction), develops itching/crusting, or leaks discharge that is bloody or clear (other than breast milk).
5. **Persistent Pain in One Spot:** While most breast cancers do not cause localized breast pain initially, any focal pain that does not fluctuate with your menstrual cycle should be reported.

### How to Conduct a Breast Self-Examination (BSE)
Every woman over the age of 20 should perform a breast self-exam once a month, preferably 3 to 5 days after her period ends:
- **In the Mirror:** Look at your breasts with shoulders straight and arms on your hips. Check for visual changes in size, dimpling, or redness. Raise your arms and look for the same.
- **Lying Down:** Feel your breasts using your opposite hand (right hand for left breast, left hand for right breast). Use a firm, smooth touch with the finger pads in circular movements, covering the entire breast from collarbone to abdomen, and armpit to cleavage.
- **In the Shower:** Repeat the manual check while soapy, as skin slips more easily.

If you find a lump or notice any change, **do not panic**. Eight out of ten lumps are benign (not cancerous). However, schedule an appointment immediately with a healthcare provider for a clinical exam or a mammogram.`,
    author: 'Dr. Ramesh Sharma',
    role: 'Founder & Chief Medical Advisor',
    date: 'July 12, 2026',
    readTime: '5 min read',
    category: 'Prevention',
    image: '/events/event-2.jpeg',
    tags: ['Breast Cancer', 'Self-Exam', 'Women\'s Health', 'Prevention']
  },
  {
    id: 'blog-2',
    title: 'Healing Foods: Designing a Chemo-Friendly Diet',
    summary: 'How targeted nutrition can rebuild strength, manage side effects like nausea, and support cellular healing during and after chemotherapy sessions.',
    content: `Chemotherapy is a powerful tool in dismantling cancer cells, but it also places a significant toll on the healthy, fast-growing cells of your body, including those lining your digestive tract. Correct nutrition is not just complementary—it is an active partner in your recovery, maintaining energy levels and accelerating recovery.

Here are expert guidelines on how to structure a therapeutic, chemo-friendly diet:

### 1. Rebuilding with Clean Protein
Your body needs amino acids to rebuild tissue damaged by radiation and chemotherapy.
- **Vegetarian Sources:** Dal (lentils), khichdi, paneer, tofu, sprout salads (well-cooked to prevent infection), and curd (yogurt).
- **Non-Vegetarian Sources:** Eggs, boiled chicken broth, and lean steamed fish.
- **Tip:** If solid food is hard to swallow, blend lentils or make a light split-pea soup.

### 2. Combating Nausea and Metallic Taste
Nausea is a common side effect of systemic cancer treatments.
- **Ginger & Lemon:** Sip warm ginger tea or suck on lemon candies. Gingerols in ginger are clinically proven to lessen chemotherapy-induced nausea.
- **Small, Frequent Meals:** Avoid eating three heavy meals. Instead, eat 6 to 8 miniature meals throughout the day.
- **Avoid Strong Odors:** Serve foods at room temperature or cold. Hot foods have a stronger aroma, which can trigger a nausea response.
- **Handling Metal Mouth:** Chemotherapy can leave a metallic or bitter taste. Switch to wooden or plastic cutlery, and marinate foods with mild citrus elements.

### 3. Boosting Immune Health with Antioxidants
We focus on foods rich in Vitamin C, E, and beta-carotene:
- Consuming a rainbow of vegetables: cooked carrots, beetroot soup, pumpkin puree, and cooked spinach.
- **Crucial Caution:** Ensure all raw vegetables and fruits are washed thoroughly. Peel all skin. During chemotherapy, your white blood cell count drops (neutropenia), making you highly vulnerable to foodborne pathogens. Avoid raw sprouts completely.

### 4. Hydration is Mandatory
Chemotherapy drugs must be flushed through your kidneys. Aim to consume at least 2.5 to 3 liters of fluids daily. Good choices include coconut water (high in electrolytes), buttermilk (chaas), clear barley water, and warm vegetable broths.

Remember, every patient\'s digestive tract responds differently. Consult your oncologist or a dedicated oncology dietitian before introducing any major herbal or highly concentrated nutritional supplement.`,
    author: 'Dr. Anjali Deshmukh',
    role: 'Lead Oncological Nutritionist',
    date: 'July 15, 2026',
    readTime: '8 min read',
    category: 'Nutrition',
    image: '/events/event-3.jpeg',
    tags: ['Nutrition', 'Chemotherapy', 'Dietary Care', 'Wellness']
  },
  {
    id: 'blog-3',
    title: 'The Victory Within: Rajeshwar\'s Triumph Over Stage III Lymphoma',
    summary: 'A moving testament to early intervention, familial support, and the relentless spirit of a 34-year-old software engineer who became an advocate.',
    content: `Meet Rajeshwar Sen. In November 2024, he was a busy 34-year-old software developer in Pune, juggling late-night code releases and raising a toddler. When he first noticed a swollen, painless lymph node in his neck, he attributed it to fatigue or a minor tooth infection. It was only when a persistent low-grade fever and night sweats accompanied the swelling that he decided to consult a general physician.

What followed was a whirlwind of diagnostic blood tests, a biopsy, and a PET scan that delivered a sobering diagnosis: **Stage III Hodgkin Lymphoma**.

"The word 'Cancer' immediately sounded like a death sentence," Rajeshwar recalls. "I looked at my three-year-old daughter and felt an overwhelming sense of helplessness. The fear of treatment and financial strain was paralyzing."

### The Power of Patient Navigation
A friend referred Rajeshwar to **Cancer Aware Bharat**. Within 48 hours, a dedicated patient navigator was assigned to him. They helped translate complex medical jargon, assisted in securing a second opinion from the *Apex Oncology Institute*, and mapped out his chemotherapy protocol so his family knew exactly what to expect.

"Our navigator didn't just help with doctors; she helped with hope," says his wife, Meera. "She told us: 'We cannot control the storm, but we will help you steer the ship.' That human connection was everything."

### The Treatment and the Triumph
Rajeshwar underwent six cycles (12 sessions) of ABVD chemotherapy over six grueling months. There were days of intense fatigue, hair loss, and muscle weakness. Yet, his family established a strict 'Healing Protocol': celebrating small milestones, curating a colorful, soft-cooked organic diet, and holding daily short, positive walks.

In May 2025, his post-treatment PET scan showed complete remission—there was no metabolic trace of active lymphoma cells.

### Rajeshwar\'s Message to You:
Today, Rajeshwar is completely cancer-free and serves as a volunteer coordinator at Cancer Aware Bharat. He shares three key lessons from his journey:
1. **Never Wait on Swellings:** A painless lump is often the most dangerous because it doesn't hurt. Get any swelling checked if it persists for more than two weeks.
2. **Accept Help:** You don't have to walk this dark tunnel alone. Lean on support groups, patient advocates, and professional navigators.
3. **Keep Your Mind Engaged:** Your attitude doesn't cure cancer, but it defines your capacity to endure the treatment. Keep finding small things that make you smile every day.

*Rajeshwar\'s story is a reminder that clinical expertise combined with deep community support can turn fear into active healing. Every life touched is indeed a victory.*`,
    author: 'Amit Kumar',
    role: 'Patient Navigation Lead',
    date: 'July 18, 2026',
    readTime: '12 min read',
    category: 'Survivors',
    image: '/events/event-8.jpeg',
    tags: ['Lymphoma', 'Survivor Story', 'Patient Navigator', 'Remission']
  }
];

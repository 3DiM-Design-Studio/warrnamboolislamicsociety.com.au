// Content migrated from https://warrnamboolislamicsociety.com.au (WordPress REST API, Nov 2026).
// News posts, office bearers, phones and email are now managed in the admin panel (Supabase).
// The copies below are the starting content and the fallback if the database cannot be reached.

export const site = {
  name: "Warrnambool Islamic Society",
  short: "WIS",
  tagline: "Serving Warrnambool and neighbouring communities through service, education and empowerment.",
  email: "warrnambool.is@gmail.com",
  phones: ["+61 3 5907 1724", "+61 493 187 858", "+61 408 307 364", "+61 407 975 314"],
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export const mission: { title: string; body: string; short?: string }[] = [
  {
    title: "Community services",
    short:
      "We serve everyone regardless of race, religion or background, offering relief to those in need and a welcoming space for connection, support and worship.",
    body: "Our commitment is to serve our local communities regardless of race, religion, or background. Guided by Islamic principles of benevolence, generosity, and kindness, we aim to provide relief to those in need and foster a safe, welcoming space for connection, support, and to fulfil religious duties and obligations.",
  },
  {
    title: "Education",
    body: "Our aim is to educate communities with the knowledge and understanding of Islamic teaching, and to promote peace, tolerance and dialogue.",
  },
  {
    title: "Community empowerment",
    body: "We help communities develop a sense of togetherness and social cohesion, collaborating with partners to promote stability, education and healthcare.",
  },
  {
    title: "Social justice",
    body: "We stand against injustice and inequality, advocate for the rights of the less privileged, and create a forum to raise voice for a more just and equitable society.",
  },
  {
    title: "Build bridges",
    body: "We help develop understanding and cooperation among our diverse communities, embracing diversity as our strength so everyone is respected, valued and supported.",
  },
];

export const officeBearers = [
  { role: "Honorary Chairman", names: ["Mr. Manzoor Khanyari"] },
  { role: "President", names: ["Dr. Rashid Mahmood"] },
  { role: "Vice Presidents", names: ["Mr. Mohammad Shamim", "Mr. Iqbal Wahyudi"] },
  { role: "General Secretaries", names: ["Mr. Mohammad Fawad", "Mr. Mohammed Zaid Fuzlul Haq"] },
  { role: "Treasurer", names: ["Mr. Jawaid Hakimi"] },
  { role: "Information Secretary", names: ["Dr. Sheeraz Ahmed"] },
  { role: "IT and Website Support", names: ["Mr. Syed Usama Shahid Zaidi"] },
];

export const prayerNotes = [
  "Our centre opens for Isha prayer followed by Taraweeh during the month of Ramadan.",
  "Jumu'ah prayer is conducted every Friday at 12:30 PM (autumn and winter) and 1:30 PM (spring and summer).",
  "We welcome everyone to visit us and show your support.",
];

export type Post = {
  slug: string;
  title: string;
  date: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "wis-registered-charity-acnc",
    title: "WIS is now a registered charity with the ACNC, Alhamdulillah",
    date: "2026-03-31",
    body: [
      "On behalf of the Warrnambool Islamic Society (WIS) and its committee, I am pleased to share some positive news with our brothers and sisters in the community. WIS has now been successfully registered with the Australian Charities and Not-for-profits Commission (ACNC). This means that we are officially recognised as a registered charitable not-for-profit organisation.",
      "We are currently in the process of obtaining planning permission from the local city council. Due to an objection raised by a neighbouring business, the matter has been referred to the Victorian Civil and Administrative Tribunal (VCAT) for determination. As a result, the planning approval process will now proceed through VCAT.",
      "Once this matter is resolved, we look forward to moving ahead with the next phase of the renovation so that we can establish a fit-for-purpose facility to support the ongoing charitable, educational, and community activities of our society.",
      "We kindly ask for your ongoing prayers and support, including donations where possible. May Allah reward you for your efforts. JazakAllah Khairan.",
      "Dr Rashid Mahmood, President, Warrnambool Islamic Society",
    ],
  },
  {
    slug: "anzac-day-2025",
    title: "ANZAC Day 2025",
    date: "2025-04-26",
    body: ["The Warrnambool Islamic Society was honoured to attend the ANZAC Day commemorations."],
  },
  {
    slug: "special-ramadan-sermon-2025",
    title: "Special Ramadan sermon with Imam Muhammad Edwars",
    date: "2025-02-25",
    body: [
      "Date: 1 March 2025. Time: 6:30 PM, at Warrnambool Musalah.",
      "The Warrnambool Islamic Society is honoured to welcome Imam Muhammad Edwars from Melbourne for a special Ramadan-themed sermon. The evening will include Quran recitation, a talk on Ramadan in Australia, a Q&A session, and Maghrib prayer, iftar dinner, Isha and Taraweeh prayers.",
      "Please bring some food to share, preferably divided into two portions: one for brothers and one for sisters.",
    ],
  },
  {
    slug: "annual-general-meeting-2024",
    title: "Annual General Meeting 2024",
    date: "2024-06-25",
    body: [
      "The AGM has been brought forward to Friday 28 June at Isha time, instead of Sunday 30 June, due to non-availability of members. The Eid lunch has been postponed and a new date will be announced.",
    ],
  },
  {
    slug: "eid-ul-azha-2024",
    title: "Eid-ul-Azha 2024",
    date: "2024-06-11",
    body: [
      "The Board of Imams of Australia has announced Eid-ul-Azha on Sunday 16 June 2024. Eid prayer will be at 8:30 AM sharp at the Musallah, followed by the Khutbah.",
      "There is no parking at the Musallah; please park outside on the green or along the road, and maintain the sanctity of the Musallah at all times.",
      "Notice of AGM and Eid lunch: the AGM will be held at 12 PM on Sunday 30 June 2024, followed by Dhuhr prayer and Eid lunch. Nominations are sought for office bearers (president, general secretary and treasurer).",
    ],
  },
  {
    slug: "jumuah-time",
    title: "Jumu'ah time",
    date: "2024-04-30",
    body: ["The Jumu'ah time has been fixed to 12:30 PM (during the spring). We look forward to seeing all of our brothers and sisters in attendance. JazakAllah."],
  },
  {
    slug: "ramadan-iftar-programme-2024",
    title: "Ramadan Iftar Programme, 16-03-2024",
    date: "2024-03-16",
    body: ["Join us for the community iftar at the Musallah. Please bring food to share."],
  },
  {
    slug: "ramadhan-2024",
    title: "Ramadhan programme 1445H / 2024",
    date: "2024-03-11",
    body: [
      "The Musallah opens for Isha followed by Taraweeh each night from Monday 11 March 2024, with the first day of fasting on 12 March 2024 as announced by the Australian National Imams Council.",
      "We plan to have iftar together every Saturday at the Musallah, followed by Maghrib, Isha and Taraweeh, and to open the Musallah for Fajr every Saturday. Please bring food to share.",
    ],
  },
  {
    slug: "warrnambool-beauty-and-nature",
    title: "Warrnambool, a place with extreme beauty and nature",
    date: "2023-11-07",
    body: ["A look at the natural beauty of the Warrnambool region that our community calls home."],
  },
];

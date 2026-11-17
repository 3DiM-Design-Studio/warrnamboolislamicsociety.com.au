// The words of the admin guide. Short on purpose: people look at the pictures first.
import type { IconName } from "@/components/admin/icons";

export type Field = {
  label: string;
  /** What the box could look like once filled in. */
  example?: string;
  kind?: "text" | "long" | "select" | "date" | "time" | "photo" | "switch";
  /** True when the form will not save without it. */
  need?: boolean;
  /** Two small boxes can sit side by side. */
  half?: boolean;
};

export type Block =
  | { t: "p"; text: string }
  | { t: "steps"; items: string[] }
  | { t: "list"; items: string[] }
  | { t: "tip"; text: string }
  | { t: "warn"; text: string }
  | { t: "map"; id: "dashboard" | "list" }
  | { t: "legend"; items: string[] }
  | { t: "flow"; items: string[] }
  | { t: "form"; title: string; open: string; fields: Field[]; button?: string }
  | { t: "cards"; items: { icon: IconName; title: string; text: string }[] }
  | { t: "confirm"; text: string };

export type Part = { heading: string; blocks: Block[] };

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  parts: Part[];
};

export type Group = { title: string; topics: Topic[] };

export const GUIDE: Group[] = [
  {
    title: "Getting started",
    topics: [
      {
        slug: "start-here",
        title: "Start here",
        summary: "Find the right place in a few seconds.",
        parts: [
          {
            heading: "I want to…",
            blocks: [
              {
                t: "cards",
                items: [
                  { icon: "posts", title: "Write news", text: "News posts" },
                  { icon: "events", title: "Add an event", text: "Events" },
                  { icon: "events", title: "Remind people about an event", text: "Events → Send reminder" },
                  { icon: "members", title: "See who joined", text: "Members" },
                  { icon: "donations", title: "See donations", text: "Donations" },
                  { icon: "messages", title: "Read a message", text: "Messages" },
                  { icon: "newsletter", title: "See the email list", text: "Newsletter" },
                  { icon: "prayer", title: "Change an Iqamah time", text: "Prayer times" },
                  { icon: "jumuah", title: "Change the Friday time", text: "Jumu’ah" },
                  { icon: "info", title: "Change phone, email or top message", text: "Website info" },
                  { icon: "info", title: "Change the FAQ questions", text: "Website info → FAQ" },
                  { icon: "team", title: "Change the committee", text: "Team" },
                  { icon: "admins", title: "Let someone log in", text: "Admin users → Add someone" },
                ],
              },
            ],
          },
          {
            heading: "The screen at a glance",
            blocks: [
              { t: "map", id: "dashboard" },
              {
                t: "legend",
                items: [
                  "Menu. Press a name to open that section.",
                  "Page title. Shows where you are.",
                  "Who is logged in.",
                  "Quick numbers.",
                  "Today’s prayer times.",
                  "Quick actions.",
                  "To do. What needs your attention.",
                  "View website and Log out.",
                  "This guide button. It opens the right page.",
                ],
              },
            ],
          },
          {
            heading: "Log in, log out, phone",
            blocks: [
              { t: "flow", items: ["Admin address", "Email + password", "Sign in"] },
              { t: "flow", items: ["Forgot it?", "Press “Forgot your password?”", "Open the email link", "Choose a new one"] },
              { t: "flow", items: ["New here?", "Press “First time here?”", "Type your name + email", "Open the email link (or wait for approval)", "Choose a password"] },
              { t: "flow", items: ["Phone: tap ☰ (top left)", "Pick a section", "Menu closes"] },
              { t: "tip", text: "Log out when you use a shared computer. It is at the bottom of the menu. If nobody touches the page for 8 hours, you are signed out automatically." },
              { t: "tip", text: "To change your password any time, press “Change password” at the bottom of the menu." },
            ],
          },
        ],
      },
      {
        slug: "overview",
        title: "Overview",
        summary: "A summary of today. You cannot break anything here.",
        parts: [
          {
            heading: "What you see",
            blocks: [
              { t: "list", items: ["Alert bars at the top: new messages, new members, new donations, and people asking to become admins. Open that page (from the bar, the menu, or any way) and the bar disappears.", "4 number cards: next prayer, Jumu’ah, news posts, members.", "Today’s prayer times with a Change button.", "To do: things to fix. “All good” means nothing to do."] },
              { t: "tip", text: "Look at the To do box when you log in. Each line has a button that takes you straight to the fix." },
            ],
          },
          {
            heading: "Alerts",
            blocks: [
              { t: "flow", items: ["Something new arrives", "A bar and a number appear", "You open that page", "They disappear"] },
              { t: "list", items: ["New messages, new members, new donations and people asking to become admins each have an alert.", "The number sits beside that item in the menu. The bar sits at the top of Overview.", "It clears for you as soon as you open the page, by the bar, the menu, or the address. Other admins keep their own alerts.", "New alerts show up by themselves while the panel is open."] },
            ],
          },
        ],
      },
      {
        slug: "lists",
        title: "How lists work",
        summary: "Posts, Events, Members and more all work the same way.",
        parts: [
          {
            heading: "Every list looks like this",
            blocks: [
              { t: "map", id: "list" },
              {
                t: "legend",
                items: ["Search. Type a few letters.", "Filters and sorting.", "Add button. Opens a form.", "The items.", "Edit or Delete.", "Page buttons (10 per page)."],
              },
            ],
          },
          {
            heading: "Add or change",
            blocks: [
              { t: "flow", items: ["Press Add (or Edit)", "A form opens", "Fill it in", "Save"] },
              { t: "tip", text: "Cancel closes the form without saving. A red line under a box tells you what to fix." },
            ],
          },
          {
            heading: "Delete always asks first",
            blocks: [
              { t: "confirm", text: "Delete “Winter working bee”? This cannot be undone." },
              { t: "tip", text: "Not sure? Choose No, keep it. For posts and events you can also use Draft to hide them without losing them." },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Website content",
    topics: [
      {
        slug: "posts",
        title: "News posts",
        summary: "Stories on the News page and home page.",
        parts: [
          {
            heading: "Write a post",
            blocks: [
              {
                t: "form",
                title: "New post",
                open: "News posts → press New post (or Edit on a row)",
                fields: [
                  { label: "Title", example: "Eid prayer times", need: true },
                  { label: "Short summary", example: "One or two lines shown on the card" },
                  { label: "Story", kind: "long", example: "Write the full story. Use the buttons above for bold, lists and links." },
                  { label: "Photo", kind: "photo" },
                  { label: "Date", kind: "date", example: "16 Nov 2026", need: true, half: true },
                  { label: "Show on the website", kind: "switch", example: "Turn on when ready", half: true },
                  { label: "Show this post first (up to 2)", kind: "switch", example: "Pins it to the top" },
                ],
              },
              { t: "tip", text: "Leave “Show on the website” off to keep it as a draft." },
            ],
          },
        ],
      },
      {
        slug: "events",
        title: "Events",
        summary: "Add events, email subscribers, send reminders.",
        parts: [
          {
            heading: "Add an event",
            blocks: [
              {
                t: "form",
                title: "Add event",
                open: "Events → press Add event (or Edit on a row)",
                fields: [
                  { label: "What kind of event is it?", kind: "select", example: "Sermon", need: true },
                  { label: "Event name", example: "Friday Evening Sermon", need: true },
                  { label: "Speaker or teacher", example: "Moulavi Ahmed" },
                  { label: "Short description", example: "Shown on the event card" },
                  { label: "Full description", kind: "long" },
                  { label: "Event picture", kind: "photo" },
                  { label: "Starts: date", kind: "date", example: "20 Nov 2026", need: true, half: true },
                  { label: "Starts: time", kind: "time", example: "6:00 PM", need: true, half: true },
                  { label: "Ends: date", kind: "date", half: true },
                  { label: "Ends: time", kind: "time", half: true },
                  { label: "Where", example: "Masjid hall" },
                  { label: "Map link", example: "Paste the Google Maps link" },
                  { label: "Who is it for?", example: "Everyone" },
                  { label: "Special notes", kind: "long", example: "Bring a dish" },
                  { label: "Show on the website?", kind: "select", example: "Yes, show it", need: true },
                  { label: "Email the newsletter subscribers", kind: "switch", example: "On for a new event" },
                ],
              },
              { t: "tip", text: "Ends date and time go together: fill in both, or leave both empty. The speaker box only shows for Sermon, Lecture, Quran class and Youth." },
            ],
          },
          {
            heading: "Email the subscribers",
            blocks: [
              { t: "flow", items: ["Switch on “Email subscribers”", "Save", "The whole Newsletter list gets an email"] },
              { t: "warn", text: "The announcement goes out once per event. Check the date and time first." },
            ],
          },
          {
            heading: "Send a reminder",
            blocks: [
              { t: "flow", items: ["Events", "Send reminder", "Yes, send it"] },
              { t: "list", items: ["1 reminder per day, until the event ends.", "The button turns grey (“Reminder sent today”) until tomorrow.", "Not on the day you announced it. Try tomorrow."] },
            ],
          },
          {
            heading: "Show on the website?",
            blocks: [{ t: "list", items: ["Yes, show it: visible to everyone.", "Draft: hidden while you finish.", "Cancelled: the page says it is cancelled."] }],
          },
        ],
      },
      {
        slug: "team",
        title: "Team",
        summary: "The committee shown on the About page.",
        parts: [
          {
            heading: "Add a person",
            blocks: [
              {
                t: "form",
                title: "Add person",
                open: "Team → press Add person (or Edit)",
                fields: [
                  { label: "Name", example: "Abdul Rahman", need: true },
                  { label: "Role", example: "President", need: true },
                  { label: "Photo", kind: "photo" },
                ],
              },
              { t: "tip", text: "Use the up and down arrows beside each person to change the order on the website." },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "People and money",
    topics: [
      {
        slug: "members",
        title: "Members",
        summary: "Everyone who joined on the website, or who you added.",
        parts: [
          {
            heading: "How people appear",
            blocks: [
              { t: "flow", items: ["Visitor fills the Membership form", "They appear here", "Nothing to approve"] },
              { t: "tip", text: "Use the suburb filter and the sort choice above the list to find people. A bar on Overview and a number beside Members show new joiners until you open this page." },
            ],
          },
          {
            heading: "Add or fix a member",
            blocks: [
              {
                t: "form",
                title: "Add member",
                open: "Members → press Add member (or Edit on a row)",
                fields: [
                  { label: "First name", example: "Ali", need: true, half: true },
                  { label: "Last name", example: "Khan", need: true, half: true },
                  { label: "Email", example: "ali@example.com", need: true, half: true },
                  { label: "Phone", example: "0412 345 678", half: true },
                  { label: "Street address", example: "12 Main Street" },
                  { label: "Suburb", example: "Warrnambool", half: true },
                  { label: "Postcode", example: "3280", half: true },
                  { label: "Spouse", example: "Aisha" },
                  { label: "Children", example: "Separate with ; like Ali; Aisha" },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "donations",
        title: "Donations",
        summary: "A record of gifts made on the Donate page.",
        parts: [
          {
            heading: "How it works",
            blocks: [
              { t: "flow", items: ["Visitor donates on the website", "Payment goes through", "A line appears here"] },
              { t: "list", items: ["Top cards: total, this month, monthly givers.", "View opens the full details: phone, email, dedication.", "Anonymous: never show this name in public.", "Receipt wanted: the donor is emailed a thank-you receipt automatically. You do not need to send one."] },
              { t: "warn", text: "Delete only removes the line here. It does not refund money. Refunds are done in Stripe." },
            ],
          },
        ],
      },
      {
        slug: "messages",
        title: "Messages",
        summary: "Notes sent through the Contact page.",
        parts: [
          {
            heading: "Read and reply",
            blocks: [
              { t: "flow", items: ["Press Read (it is marked Read, and the alert clears)", "Reply by email", "Mark as replied"] },
              { t: "tip", text: "A number beside Messages in the menu and a bar on Overview show new messages. Both disappear as soon as you open the Messages page. “Not replied” tags stay until you press Mark as replied." },
            ],
          },
        ],
      },
      {
        slug: "newsletter",
        title: "Newsletter",
        summary: "Emails collected from the website footer.",
        parts: [
          {
            heading: "How it works",
            blocks: [
              { t: "flow", items: ["Visitor types email in the footer", "It appears here", "They get your event emails"] },
              { t: "list", items: ["Unsubscribe stops emails to that person. Subscribe again brings them back.", "Delete removes the email completely.", "Download spreadsheet saves the whole list.", "Every email has an Unsubscribe link. Those people are marked here automatically."] },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Settings",
    topics: [
      {
        slug: "prayer",
        title: "Prayer times",
        summary: "Azan comes from the timetable. You choose the Iqamah.",
        parts: [
          {
            heading: "Iqamah times",
            blocks: [
              {
                t: "form",
                title: "Iqamah times",
                open: "Prayer times (the form is on the page itself)",
                button: "Save",
                fields: [
                  { label: "Each prayer: type", kind: "select", example: "Minutes after Azan", need: true, half: true },
                  { label: "Minutes or time", example: "10 minutes, or 1:30 PM", need: true, half: true },
                  { label: "Show Iqamah times on the website", kind: "switch", example: "Keep off until checked" },
                ],
              },
              { t: "tip", text: "The Preview for today updates as you type, before you save." },
            ],
          },
          {
            heading: "Ramadan",
            blocks: [
              {
                t: "form",
                title: "Ramadan",
                open: "Prayer times → Ramadan box → press Add",
                fields: [
                  { label: "Name", example: "Ramadan", need: true },
                  { label: "First day", kind: "date", need: true, half: true },
                  { label: "Last day", kind: "date", need: true, half: true },
                  { label: "Isha Iqamah", kind: "time", example: "9:15 PM", need: true, half: true },
                  { label: "Taraweeh", kind: "time", example: "9:45 PM", need: true, half: true },
                ],
              },
              { t: "tip", text: "The website uses these times on those days, then goes back to normal by itself." },
            ],
          },
        ],
      },
      {
        slug: "jumuah",
        title: "Jumu’ah",
        summary: "The Friday time for each season. It repeats every year.",
        parts: [
          {
            heading: "Add a season",
            blocks: [
              {
                t: "form",
                title: "Add season",
                open: "Jumu’ah → press Add season (or Edit)",
                fields: [
                  { label: "Name", example: "Autumn and winter", need: true },
                  { label: "From (month + day)", example: "April 1", need: true, half: true },
                  { label: "Until (month + day)", example: "September 30", need: true, half: true },
                  { label: "Jumu’ah time", kind: "time", example: "12:30 PM", need: true },
                ],
              },
              { t: "warn", text: "Every day of the year needs exactly one season. If days are missing or overlap, a red note appears." },
            ],
          },
        ],
      },
      {
        slug: "info",
        title: "Website info",
        summary: "Phone, email, Facebook, the top message and the FAQ questions.",
        parts: [
          {
            heading: "The form",
            blocks: [
              {
                t: "form",
                title: "Website info",
                open: "Website info (the form is on the page itself)",
                button: "Save",
                fields: [
                  { label: "Phone numbers", kind: "long", example: "One number on each line", need: true },
                  { label: "Email", example: "info@example.com", need: true },
                  { label: "Facebook page link", example: "https://www.facebook.com/yourpage" },
                  { label: "Message at the top of the website", example: "Eid prayer is at 8:30 AM" },
                  { label: "Show this message", kind: "switch", example: "Turn off when it is old news" },
                ],
              },
            ],
          },
          {
            heading: "Frequently asked questions",
            blocks: [
              { t: "flow", items: ["Website info", "Scroll to “Frequently asked questions”", "Add question (or Edit)", "Save"] },
              {
                t: "form",
                title: "Add question",
                open: "Website info → scroll down → press Add question beside Home page or Donate page",
                fields: [
                  { label: "Question", example: "Who can attend?", need: true },
                  { label: "Answer", kind: "long", example: "Everyone. We welcome people of all backgrounds.", need: true },
                ],
              },
              { t: "list", items: ["There are two lists: one for the Home page and one for the Donate page.", "Use the up and down arrows to change the order the website shows them in.", "Delete asks Yes or No first.", "An empty list hides the whole question section on that page.", "Changes show on the website straight away."] },
            ],
          },
        ],
      },
      {
        slug: "admins",
        title: "Admin users",
        summary: "Who can log in. Two ways to join: you add them, or they ask.",
        parts: [
          {
            heading: "Add an admin",
            blocks: [
              {
                t: "form",
                title: "Add someone to the admin list",
                open: "Admin users → press Add someone",
                fields: [{ label: "Email", example: "newadmin@example.com", need: true }],
              },
              { t: "flow", items: ["You add their email", "They get an email straight away", "Open the link", "Choose a password"] },
              { t: "warn", text: "Admins can change and delete everything. Only add people you trust." },
            ],
          },
          {
            heading: "When someone asks to join",
            blocks: [
              { t: "flow", items: ["They press “First time here?” on the sign-in page", "A yellow alert shows on your Overview page", "You open Admin users and press Approve (or Deny)", "They get the email link"] },
              { t: "tip", text: "The alert on Overview and the number beside Admin users disappear as soon as you open Admin users. The request stays in the box until you press Approve or Deny. Press Deny if you do not know them." },
            ],
          },
          {
            heading: "Link missing or too old?",
            blocks: [
              { t: "flow", items: ["Admin users", "Press “Send link” beside their name", "They open the new email"] },
              { t: "tip", text: "The link works once and lasts 1 hour. Check spam if it is slow. To remove someone, press Remove, then Yes, remove." },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Help",
    topics: [
      {
        slug: "faq",
        title: "Quick fixes",
        summary: "Common problems and what to do.",
        parts: [
          {
            heading: "Saved, but not on the website",
            blocks: [{ t: "list", items: ["“Show on the website” must be on.", "Events must be in the future.", "Refresh the website page."] }],
          },
          {
            heading: "I forgot my password",
            blocks: [
              { t: "flow", items: ["Sign-in page", "Forgot your password?", "Type your email", "Open the link", "Choose a new password"] },
              { t: "tip", text: "The link works once. If it says “expired”, ask for a new one." },
            ],
          },
          {
            heading: "A bar or number will not go away",
            blocks: [
              { t: "list", items: ["Open the page it points to (Messages, Members, Donations or Admin users). It clears for you.", "If it comes back, something new arrived since you looked.", "Another admin's alerts are separate from yours."] },
            ],
          },
          {
            heading: "A red message under a box",
            blocks: [{ t: "p", text: "It says exactly what to fix. Fix it and press Save again." }],
          },
          {
            heading: "A subscriber did not get the email",
            blocks: [{ t: "list", items: ["Ask them to check spam or junk.", "Check they are on the Newsletter list and not unsubscribed."] }],
          },
          {
            heading: "Deleted by mistake",
            blocks: [{ t: "p", text: "It cannot be brought back from the panel. Tell the person who looks after the website straight away." }],
          },
        ],
      },
    ],
  },
];

export const ALL_TOPICS = GUIDE.flatMap((g) => g.topics);

export function topicBySlug(slug?: string | null) {
  return ALL_TOPICS.find((t) => t.slug === slug) ?? ALL_TOPICS[0];
}

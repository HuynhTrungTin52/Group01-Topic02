

import { ACTIVITY_TAGS } from "./constants";

export const habits = [
  { id: "h1", title: "Observing", time: "6:00 - 7:30", accent: "from-sky-200 to-indigo-200" },
  { id: "h2", title: "Cooking",   time: "7:30 - 9:00", accent: "from-blue-200 to-sky-300"   },
  { id: "h3", title: "Study",     time: "9:30 - 12:30", accent: "from-indigo-200 to-blue-300" },
  { id: "h4", title: "Reading",   time: "17:00 - 18:30", accent: "from-sky-300 to-violet-200" },
];

export const reminders = [
  { id: "r1", title: "E-Learning Assignment", due: "Today · 20:00" },
  { id: "r2", title: "Call with Advisor",     due: "Tomorrow · 10:00" },
  { id: "r3", title: "Submit Midterm Report", due: "Fri · 23:59" },
];

// export const weather = {
//   time: "14:45",
//   temp: "30°C",
//   condition: "Sunny",
//   city: "Ho Chi Minh - City",
//   forecast: "Clear skies through the evening",
// };

export const currentActivity = {
  id: "default",
  title: "Team Meeting",
  location: "Tan Hung, District 7",
  time: "14:30",
  tag: ACTIVITY_TAGS.IN_PROGRESS,
};

export const schedule = [
  { id: "s1", time: "6:45",  label: "F501 Web Fundamentals" },
  { id: "s2", time: "8:30",  label: "F501 Web Lab Session"  },
  { id: "s3", time: "10:15", label: "F501 Web Project Sync" },
  { id: "s4", time: "13:00", label: "F501 Web Design Review"},
];

export const initialTasks = {
  todo: [
    { id: "t1", text: "Draft midterm presentation slides", list: "learning", tags: ["important"] },
    { id: "t2", text: "Finish PWA service worker setup",   list: "work",     tags: ["work"] },
  ],
  inProgress: [
    { id: "t3", text: "Polish glassmorphism styling", list: "freelance", tags: ["work"] },
  ],
  completed: [
    { id: "t4", text: "Wireframe the 3-column layout", list: "learning", tags: [] },
  ],
};

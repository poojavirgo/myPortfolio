// All page content lives here. Edit this file to update the site; no component changes needed.

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const profile = {
  name: 'Pooja Pathak',
  title: 'Senior software engineer',
  location: 'Oslo, Norway',
  headline: 'frontend, full‑stack and AI.',
  summary:
    '9+ years building production apps with React, TypeScript, Next.js and Node.js for energy, IoT and financial-services products.',
  photo: asset('img/pooja.jpg'),
  email: 'pooja.pathak09sept@gmail.com',
};

export const links = [
  { label: 'GitHub', href: 'https://github.com/poojavirgo' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pooja-p-09774b79' },
  { label: 'Medium', href: 'https://medium.com/@poojapathak' },
];

export const marquee = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'Redux Toolkit', 'Highcharts',
  'D3.js', 'Python', 'FastAPI', 'RAG', 'Azure', 'AWS',
];

export interface ExpertiseArea { title: string; text: string; tags: string[] }

export const expertiseIntro =
  'Frontend architecture, API integrations and end-to-end product delivery, with hands-on AI work. I care about performance, code reviews and mentoring.';

export const expertise: ExpertiseArea[] = [
  {
    title: 'Frontend Development',
    text: 'I build scalable, responsive and user-friendly web applications with React, Next.js, TypeScript and modern frontend patterns: dashboards, customer-facing flows, data-driven interfaces and production-ready UI components.',
    tags: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Redux Toolkit', 'RTK Query', 'HTML5', 'CSS3', 'SASS', 'Material UI', 'Tailwind CSS', 'Highcharts', 'D3.js'],
  },
  {
    title: 'Testing, Tooling & Delivery',
    text: 'I care about clean code, maintainable components, reliable user flows and smooth delivery: frontend testing, design-system workflows, CI/CD, monitoring, code reviews and production releases.',
    tags: ['Git', 'GitHub Actions', 'Playwright', 'Vitest', 'Jest', 'React Testing Library', 'Storybook', 'Chromatic', 'Azure', 'AWS', 'Datadog', 'Sentry', 'Jira', 'Figma'],
  },
  {
    title: 'Backend, Full-Stack & AI',
    text: 'Frontend is my main strength, and I also work hands-on with Node.js, Python and FastAPI: APIs, authentication, Redis caching and AI features with LLMs and RAG for document retrieval and grounded answers.',
    tags: ['Node.js', 'Python', 'FastAPI', 'Go', 'REST APIs', 'GraphQL', 'WebSocket', 'Authentication', 'Redis', 'MongoDB', 'PostgreSQL', 'LLM · RAG'],
  },
];

export interface Job { when: string; where: string; role: string; company: string; badge?: string; text: string }

export const historyIntro = 'From banking platforms in India to energy and air-quality products in the Nordics.';

export const history: Job[] = [
  {
    when: 'Jan 2026 – Jul 2026', where: 'Oslo, Norway', role: 'Senior Software Developer', company: 'Fortum',
    text: 'B2C customer dashboards for Nordic energy markets with Next.js, TypeScript, Highcharts and GraphQL. Built auth flows with refresh tokens and Redis-backed caching, and contributed to AI features with Python, FastAPI and RAG.',
  },
  {
    when: 'Nov 2024 – Sep 2025', where: 'Oslo, Norway', role: 'Lead Frontend Developer', company: 'Airthings', badge: 'BBC StoryWorks',
    text: 'Led RadonMap from idea to production, turning large geospatial radon datasets into an interactive map. Led B2B and B2C dashboards, reports and real-time analytics for the US, Canada and Europe.',
  },
  {
    when: 'Dec 2022 – Oct 2024', where: 'Oslo, Norway', role: 'Lead Frontend Developer', company: 'Skyfri Technologies',
    text: 'Built a solar asset monitoring dashboard from scratch, migrated Redux-Saga to RTK Query with caching and request deduplication, designed a Lobby Screen for operations, and mentored junior developers.',
  },
  {
    when: 'Jul 2021 – Nov 2022', where: 'Noida, India', role: 'Senior Software Engineer', company: 'HCL Technologies',
    text: 'Production React banking modules for UOB, with Jest and React Testing Library tests, and faster page loads through dynamic imports.',
  },
  {
    when: 'Mar 2019 – Jul 2021', where: 'Bengaluru, India', role: 'Technology Analyst', company: 'Infosys',
    text: 'React and Redux banking apps for home loans, KYC, deposits and personal loans, plus Node.js widgets including an Australian visa portal.',
  },
  {
    when: 'Dec 2016 – Oct 2018', where: 'Bengaluru, India', role: 'Project Engineer', company: 'Wipro Technologies',
    text: 'Customer-facing apps with React, Redux and Node.js, and a real-time market-trend visualisation with D3.js.',
  },
];

export const education = 'B.Tech (Hons.) in Information Technology, JSS Academy of Technical Education, Noida, 2016';
export const languages = 'English, Hindi, French (A1), Norwegian (basic)';

export interface Project {
  id: string; title: string; kind: string; year?: string; href?: string;
  image: string; alt: string; text: string; stack?: string[];
}

export const projectsIntro =
  'Production work and side projects, from a map featured by BBC StoryWorks to apps built on public APIs.';

export const projects: Project[] = [
  {
    id: 'radon', title: 'RadonMap', kind: 'Airthings · Production', year: '2025',
    href: 'https://www.airthings.com/air-quality-map',
    image: asset('img/radonmap.jpg'), alt: 'RadonMap showing indoor radon levels on a world map',
    text: 'A public map of indoor radon levels worldwide. I led it from idea to production, owning the architecture, interactive map layers and data visualisation of large geospatial datasets. Featured by BBC StoryWorks.',
    stack: ['Next.js', 'TypeScript', 'Node.js', 'Mapbox GL', 'Highcharts', 'AWS S3'],
  },
  {
    id: 'nasa', title: 'NASA Explorer', kind: 'Side project',
    image: asset('img/nasa-explorer.jpg'), alt: 'NASA Explorer showing the Astronomy Picture of the Day',
    text: "A React and TypeScript app that visualises data from NASA's public APIs, including the Astronomy Picture of the Day and near-Earth objects, with modern state management, routing and tests.",
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'RTK Query', 'React Router', 'Material UI', 'Jest'],
  },
  {
    id: 'chat', title: 'Real-Time Chat App', kind: 'Side project',
    image: asset('img/chat-app.jpg'), alt: 'Real-time chat app with several participants in a standup meeting',
    text: 'A real-time, multi-participant chat application with live messages, participant lists and timestamps.',
  },
  {
    id: 'food', title: 'Food Panda App', kind: 'Side project',
    image: asset('img/food-panda.jpg'), alt: 'Food ordering app landing page with a menu card',
    text: 'A Swiggy and Foodpanda-style food ordering application with a menu, sign up and login.',
  },
];

export const contact = {
  heading: 'Got a project waiting to be realised?',
  text: "Let's collaborate and make it happen.",
  // Set VITE_FORM_ENDPOINT in .env (Formspree, Web3Forms or your own API) to receive messages.
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT as string | undefined,
};

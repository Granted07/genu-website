import { createClient } from "@supabase/supabase-js";
import { ArticlePage } from "@/components/article-page";
import { normalizeCategories } from "@/lib/utils";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MOCK_WORKSHOPS = [
  {
    uuid: "workshop-1",
    number: "1",
    title: "Digital Literacy Workshop",
    location: "At Institute Of Social Work",
    category: "Community Workshop",
    summary:
      "Empowering local communities with essential digital skills, computer operational basics, internet usage, online safety, and digital tool navigation for daily productivity.",
    content:
      "# Digital Literacy Workshop\n\nWelcome to the Digital Literacy Workshop. In this session, we cover the essentials of operating computers, navigating the internet safely, using email, and leveraging digital tools to improve your daily productivity.\n\n## What you will learn\n- Computer basics\n- Internet navigation & safety\n- Email productivity\n- Essential tools like Google Workspace",
  },
  {
    uuid: "workshop-2",
    number: "2",
    title: "Design Thinking & UI/UX",
    location: "At Creative Studio East",
    category: "Design Masterclass",
    summary:
      "A hands-on workshop focused on user-centered design methodologies, wireframing, prototyping, user testing, and crafting intuitive user interfaces for mobile and web environments.",
    content:
      "# Design Thinking & UI/UX Masterclass\n\nThis hands-on workshop walks you through the core stages of design thinking:\n\n1. **Empathize**: Understand user needs.\n2. **Define**: State the user's problems.\n3. **Ideate**: Challenge assumptions and create ideas.\n4. **Prototype**: Start creating solutions.\n5. **Test**: Try your solutions out.\n\nWe will also cover visual design principles, typography, grids, and prototyping tools like Figma.",
  },
  {
    uuid: "workshop-3",
    number: "3",
    title: "Web Development Bootcamp",
    location: "At Tech Lab & Incubation Center",
    category: "Technical Workshop",
    summary:
      "Dive deep into modern front-end technologies. Learn HTML, CSS, React, and responsive layouts to build and deploy your own interactive web applications from scratch.",
    content:
      "# Web Development Bootcamp\n\nLearn to build modern, responsive web applications from scratch using HTML, CSS, JavaScript, and React.\n\n## Course Outline\n- **Week 1**: HTML5 semantic structure & CSS3 layout (Flexbox, Grid)\n- **Week 2**: JavaScript essentials (DOM manipulation, ES6+, Fetch API)\n- **Week 3**: React fundamentals (Components, Props, State, Hooks)\n- **Week 4**: Project deployment and hosting (Vercel, Netlify)",
  },
  {
    uuid: "workshop-4",
    number: "4",
    title: "Machine Learning & AI",
    location: "At Scientific Research Institute",
    category: "Advanced Technology",
    summary:
      "An introductory session on machine learning algorithms, artificial intelligence applications, data preprocessing, and training basic neural networks using Python and modern libraries.",
    content:
      "# Machine Learning & AI\n\nAn entry point into the world of artificial intelligence and machine learning. This course covers core concepts, math foundations, and hands-on programming with Python.\n\n## Core Concepts Covered\n- Supervised vs Unsupervised learning\n- Regression, classification, and clustering\n- Training basic neural networks with TensorFlow\n- Ethics in Artificial Intelligence",
  },
  {
    uuid: "workshop-5",
    number: "5",
    title: "Cybersecurity Fundamentals",
    location: "At Security Operations Center",
    category: "Technical Workshop",
    summary:
      "Understanding the threat landscape, defensive security principles, password security, secure coding practices, and basic network traffic analysis techniques.",
    content:
      "# Cybersecurity Fundamentals\n\nKeep your systems safe and understand the defensive landscape in modern computing.\n\n## Core Topics\n- Introduction to threats, malware, and social engineering\n- Network defense and traffic monitoring\n- Secure programming and defensive software practices\n- Password management and multi-factor authentication",
  },
  {
    uuid: "workshop-6",
    number: "6",
    title: "Social Innovation Lab",
    location: "At Community Hub West",
    category: "Community Workshop",
    summary:
      "Collaborative brainstorming and problem-solving framework to address local social challenges using creative thinking, stakeholder mapping, and rapid prototyping.",
    content:
      "# Social Innovation Lab\n\nUnlock creative problem solving for the community. We work together to analyze systemic problems and design viable solutions.\n\n## What to expect\n- Group brainstorming sessions\n- Stakeholder interviews and empathy mapping\n- Design sprints and rapid paper prototyping\n- Mentorship from local community leaders",
  },
];

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: uuid } = await params;
  try {
    let row: any = null;

    // 1. Try fetching from Supabase table
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (!error && data) {
      row = data;
    } else {
      // 2. Fall back to mock data
      row = MOCK_WORKSHOPS.find((w) => w.uuid === uuid);
    }

    if (!row) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white/60 bg-black">
          Workshop not found
        </div>
      );
    }

    const title = row.title || "Untitled Workshop";
    const dek = row.summary || row.description || null;
    const author = row.location ? `Location: ${row.location}` : null;
    const publishedAt = row.created_at || null;
    const content = row.content || "";
    const categories = normalizeCategories(row.category);

    return (
      <ArticlePage
        sectionLabel="Workshops"
        title={title}
        dek={dek}
        author={author}
        publishedAt={publishedAt}
        content={content}
        categories={categories}
      />
    );
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60 bg-black">
        Error loading workshop details
      </div>
    );
  }
}

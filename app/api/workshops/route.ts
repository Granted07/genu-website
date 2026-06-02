import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOCK_WORKSHOPS = [
  {
    uuid: "workshop-1",
    number: "1",
    title: "Digital Literacy Workshop",
    location: "At Institute Of Social Work",
    category: "Community Workshop",
    summary:
      "Empowering local communities with essential digital skills, computer operational basics, internet usage, online safety, and digital tool navigation for daily productivity.",
  },
  {
    uuid: "workshop-2",
    number: "2",
    title: "Design Thinking & UI/UX",
    location: "At Creative Studio East",
    category: "Design Masterclass",
    summary:
      "A hands-on workshop focused on user-centered design methodologies, wireframing, prototyping, user testing, and crafting intuitive user interfaces for mobile and web environments.",
  },
  {
    uuid: "workshop-3",
    number: "3",
    title: "Web Development Bootcamp",
    location: "At Tech Lab & Incubation Center",
    category: "Technical Workshop",
    summary:
      "Dive deep into modern front-end technologies. Learn HTML, CSS, React, and responsive layouts to build and deploy your own interactive web applications from scratch.",
  },
  {
    uuid: "workshop-4",
    number: "4",
    title: "Machine Learning & AI",
    location: "At Scientific Research Institute",
    category: "Advanced Technology",
    summary:
      "An introductory session on machine learning algorithms, artificial intelligence applications, data preprocessing, and training basic neural networks using Python and modern libraries.",
  },
  {
    uuid: "workshop-5",
    number: "5",
    title: "Cybersecurity Fundamentals",
    location: "At Security Operations Center",
    category: "Technical Workshop",
    summary:
      "Understanding the threat landscape, defensive security principles, password security, secure coding practices, and basic network traffic analysis techniques.",
  },
  {
    uuid: "workshop-6",
    number: "6",
    title: "Social Innovation Lab",
    location: "At Community Hub West",
    category: "Community Workshop",
    summary:
      "Collaborative brainstorming and problem-solving framework to address local social challenges using creative thinking, stakeholder mapping, and rapid prototyping.",
  },
];

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ data: MOCK_WORKSHOPS });
  }

  try {
    const { data, error } = await supabase
      .from("workshops")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ data: MOCK_WORKSHOPS });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ data: MOCK_WORKSHOPS });
  }
}

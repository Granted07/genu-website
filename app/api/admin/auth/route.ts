import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const hash = "$2a$12$Phl7cW3wqDDLRtVvsaRuo.fxCNvfE0Hk8cK4tYPyK6ba/yL91wdge";
    console.log(hash)
    if (!hash) {
      console.log("No admin password configured");
      return NextResponse.json(
        { ok: false, error: "No admin password configured" },
        { status: 500 }
      );
    }

    const match = await bcrypt.compare(password, hash);
    if (match) {
      console.log("Admin authenticated successfully");
      return NextResponse.json({ ok: true });
    }
    console.log("Invalid password attempt");
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (err) {
    console.log("Error during authentication:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

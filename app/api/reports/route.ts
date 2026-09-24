import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ status: "foundation-ready", resource: "reports" }); }

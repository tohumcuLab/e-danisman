import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/services/searchService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ questions: [], users: [] });
    }

    const results = await searchAll(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

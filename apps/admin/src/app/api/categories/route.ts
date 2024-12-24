import { readAllDocs } from "@/lib/commonQuery";
import { BlogCategory } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (
    request.cookies.get("Authenticated")?.value !==
    process.env.SECRET_COOKIE_VALUE2
  ) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthenticated",
      },
      { status: 401 }
    );
  }

  const data: BlogCategory[] = await readAllDocs(Collections.CATEGORY_METADATA);
  return NextResponse.json(data);
}

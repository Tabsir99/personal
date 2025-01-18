import { readAllDocs } from "@/lib/commonQuery";
import { BlogCategory } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const data: BlogCategory[] = await readAllDocs(Collections.CATEGORY_METADATA);
  return NextResponse.json(data);
}

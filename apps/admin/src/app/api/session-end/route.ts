import { createData } from "@/lib/commonQuery";
import { Session } from "@/types/dashboardTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const countryCode = request.headers.get("xCountry") || "unknown";
  const ipAdd = request.headers.get("xIp") || "unknown";


  // console.log("Recived request in session end")
  // return NextResponse.json({})
  
  try {
    const session = await request.json();

    const newSession: Session = {
      ...session,
      country: countryCode!,
      ipAdd: ipAdd!,
    };

    await createData({
      collectionName: Collections.SESSIONS,
      docId: newSession.sessionId,
      data: newSession,
    });

    return NextResponse.json({});
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({}, { status: 500 });
  }
}

import { createData } from "@/lib/commonQuery";
import { Session } from "@/types/dashboardTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const countryCode = request.headers.get("CF-IPCountry") || "unknown";
  const ipAdd = request.headers.get("CF-Connecting-IP") || "unknown";

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

    console.log("Session created,",ipAdd)
    return NextResponse.json({});
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({}, { status: 500 });
  }
}
// export async function OPTIONS(_: NextRequest) {
//   console.log("Options method executin,")
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': 'http://localhost:3000',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Allow-Credentials': 'true',
//       'Access-Control-Max-Age': '86400',
//     },
//   })
// }

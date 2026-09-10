import { NextResponse } from "next/server";
import { z } from "zod";
import { demoOrganizations } from "@/data/demo-organizations";

const schema = z.object({
  query: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(100).max(50000).default(16093),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const key = process.env.GOOGLE_MAPS_API_KEY;

    if (!key || process.env.DEMO_MODE === "true") {
      return NextResponse.json({
        source: "demo",
        places: demoOrganizations.map((org) => ({
          id: `demo-${org.id}`,
          displayName: { text: org.name },
          formattedAddress: org.address,
          location: { latitude: org.latitude, longitude: org.longitude },
        })),
      });
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery: input.query,
        maxResultCount: 12,
        locationBias: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: input.radiusMeters,
          },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(data);
      return NextResponse.json({ error: "Google Places search failed." }, { status: response.status });
    }

    return NextResponse.json({ source: "google", places: data.places ?? [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid search." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to search organizations." }, { status: 500 });
  }
}

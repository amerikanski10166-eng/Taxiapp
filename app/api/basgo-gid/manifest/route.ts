import { NextResponse } from "next/server";
import { BASGO_GID_DATA_VERSION, basgoMapLayers, basgoRegions } from "../../../../lib/basgo-gid/data";

export function GET() {
  return NextResponse.json({ product: "BASGO GID", scope: "Kazakhstan", dataVersion: BASGO_GID_DATA_VERSION, regions: basgoRegions, layers: basgoMapLayers, offline: { strategy: "regional-vector-packages", status: "architecture-ready", packageFormat: "vector-tiles + routing graph + address index" } });
}

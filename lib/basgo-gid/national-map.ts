export type BasgoMapRegionId =
  | "abai" | "akmola" | "aktobe" | "almaty-region" | "atyrau" | "east-kazakhstan"
  | "zhambyl" | "zhetisu" | "west-kazakhstan" | "karaganda" | "kostanay"
  | "kyzylorda" | "mangystau" | "pavlodar" | "north-kazakhstan" | "turkistan"
  | "ulytau" | "astana" | "almaty" | "shymkent";

export type BasgoLayerPackageStatus = "planned" | "pilot" | "ready";

export type BasgoMapPackage = {
  regionId: BasgoMapRegionId;
  name: string;
  status: BasgoLayerPackageStatus;
  source: "basgo-curated-pilot" | "ingestion-pipeline" | "osm-overpass-ingestion";
  roads: boolean;
  buildings: boolean;
  addresses: boolean;
  poi: boolean;
  routingGraph: boolean;
  offline: boolean;
};

export const BASGO_NATIONAL_SCOPE = {
  country: "KZ",
  name: "Казахстан",
  administrativeLevel: "области + города республиканского значения",
  regionCount: 20,
  layerModel: "national-vector-schema",
} as const;

export const BASGO_NATIONAL_PACKAGES: BasgoMapPackage[] = [
  { regionId: "abai", name: "Абайская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "akmola", name: "Акмолинская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "aktobe", name: "Актюбинская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "almaty-region", name: "Алматинская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "atyrau", name: "Атырауская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "east-kazakhstan", name: "Восточно-Казахстанская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "zhambyl", name: "Жамбылская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "zhetisu", name: "Жетысуская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "west-kazakhstan", name: "Западно-Казахстанская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "karaganda", name: "Карагандинская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "kostanay", name: "Костанайская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "kyzylorda", name: "Кызылординская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "mangystau", name: "Мангистауская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "pavlodar", name: "Павлодарская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "north-kazakhstan", name: "Северо-Казахстанская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "turkistan", name: "Туркестанская область", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "ulytau", name: "Ұлытау облысы", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "astana", name: "Астана", status: "pilot", source: "basgo-curated-pilot", roads: true, buildings: true, addresses: false, poi: true, routingGraph: false, offline: false },
  { regionId: "almaty", name: "Алматы", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
  { regionId: "shymkent", name: "Шымкент", status: "pilot", source: "osm-overpass-ingestion", roads: true, buildings: true, addresses: false, poi: false, routingGraph: false, offline: false },
];

export const BASGO_MAP_LAYERS = [
  "roads", "buildings", "addresses", "settlements", "poi", "traffic", "restrictions",
  "fuel", "repair", "food", "tourism", "public-transport", "courier-entrances", "winter-walkways",
] as const;

export const BASGO_INGESTION_PIPELINE = [
  "source-data",
  "normalization",
  "quality-control",
  "basgo-vector-tiles",
  "routing-graph",
  "address-index",
  "offline-package",
] as const;

export function getBasgoPackage(regionId: BasgoMapRegionId | string) {
  return BASGO_NATIONAL_PACKAGES.find((item) => item.regionId === regionId);
}

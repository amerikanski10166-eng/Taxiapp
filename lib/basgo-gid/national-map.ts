export type BasgoMapRegionId =
  | "abai" | "akmola" | "aktobe" | "almaty-region" | "atyrau" | "east-kazakhstan"
  | "zhambyl" | "zhetisu" | "west-kazakhstan" | "karaganda" | "kostanay"
  | "kyzylorda" | "mangystau" | "pavlodar" | "north-kazakhstan" | "turkistan"
  | "ulytau" | "astana" | "almaty" | "shymkent";

export type BasgoLayerPackageStatus = "planned" | "city-pilot" | "regional-pilot" | "ready";

export type BasgoMapPackage = {
  regionId: BasgoMapRegionId;
  name: string;
  status: BasgoLayerPackageStatus;
  coverage: "city" | "region";
  source: "basgo-curated-pilot" | "ingestion-pipeline" | "preloaded-basgo-storage";
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

const cityPilot = (regionId: BasgoMapRegionId, name: string): BasgoMapPackage => ({
  regionId,
  name,
  status: "city-pilot",
  coverage: "city",
  source: "preloaded-basgo-storage",
  roads: true,
  buildings: true,
  addresses: false,
  poi: false,
  routingGraph: false,
  offline: false,
});

export const BASGO_NATIONAL_PACKAGES: BasgoMapPackage[] = [
  cityPilot("abai", "Абайская область"),
  cityPilot("akmola", "Акмолинская область"),
  cityPilot("aktobe", "Актюбинская область"),
  cityPilot("almaty-region", "Алматинская область"),
  cityPilot("atyrau", "Атырауская область"),
  cityPilot("east-kazakhstan", "Восточно-Казахстанская область"),
  cityPilot("zhambyl", "Жамбылская область"),
  cityPilot("zhetisu", "Жетысуская область"),
  cityPilot("west-kazakhstan", "Западно-Казахстанская область"),
  cityPilot("karaganda", "Карагандинская область"),
  cityPilot("kostanay", "Костанайская область"),
  cityPilot("kyzylorda", "Кызылординская область"),
  cityPilot("mangystau", "Мангистауская область"),
  cityPilot("pavlodar", "Павлодарская область"),
  cityPilot("north-kazakhstan", "Северо-Казахстанская область"),
  cityPilot("turkistan", "Туркестанская область"),
  cityPilot("ulytau", "Ұлытау облысы"),
  { ...cityPilot("astana", "Астана"), source: "basgo-curated-pilot", poi: true },
  cityPilot("almaty", "Алматы"),
  cityPilot("shymkent", "Шымкент"),
];

export const BASGO_MAP_LAYERS = [
  "roads", "buildings", "addresses", "settlements", "poi", "traffic", "restrictions",
  "fuel", "repair", "food", "tourism", "public-transport", "courier-entrances", "winter-walkways",
] as const;

export const BASGO_INGESTION_PIPELINE = [
  "source-data",
  "normalization",
  "quality-control",
  "preloaded-basgo-storage",
  "basgo-vector-tiles",
  "routing-graph",
  "address-index",
  "offline-package",
] as const;

export function getBasgoPackage(regionId: BasgoMapRegionId | string) {
  return BASGO_NATIONAL_PACKAGES.find((item) => item.regionId === regionId);
}

export type BasgoRegion = {
  id: string;
  name: string;
  kind: "region" | "city";
  packageId: string;
  status: "planned" | "pilot";
};

export const BASGO_GID_DATA_VERSION = "2026.07";

export const basgoRegions: BasgoRegion[] = [
  ["abai","Абайская область","region"],["akmola","Акмолинская область","region"],["aktobe","Актюбинская область","region"],
  ["almaty-region","Алматинская область","region"],["atyrau","Атырауская область","region"],["east-kazakhstan","Восточно-Казахстанская область","region"],
  ["zhambyl","Жамбылская область","region"],["zhetisu","Жетысуская область","region"],["west-kazakhstan","Западно-Казахстанская область","region"],
  ["karaganda","Карагандинская область","region"],["kostanay","Костанайская область","region"],["kyzylorda","Кызылординская область","region"],
  ["mangystau","Мангистауская область","region"],["pavlodar","Павлодарская область","region"],["north-kazakhstan","Северо-Казахстанская область","region"],
  ["turkistan","Туркестанская область","region"],["ulytau","Ұлытау облысы","region"],["astana","Астана","city"],["almaty","Алматы","city"],["shymkent","Шымкент","city"],
].map(([id,name,kind]) => ({ id, name, kind: kind as "region"|"city", packageId: `kz-${id}`, status: id === "astana" ? "pilot" : "planned" }));

export const basgoMapLayers = [
  "roads","buildings","addresses","settlements","poi","traffic","restrictions","fuel","repair","food","tourism","public-transport","courier-entrances","winter-walkways"
] as const;

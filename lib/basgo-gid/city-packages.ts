export type BasgoCityPackage = { id: string; name: string; regionId: string; center: [number, number]; bbox: [number, number, number, number] };

export const BASGO_CITY_PACKAGES: BasgoCityPackage[] = [
  { id: "astana", name: "Астана", regionId: "astana", center: [71.43, 51.13], bbox: [71.24, 51.01, 71.62, 51.25] },
  { id: "almaty", name: "Алматы", regionId: "almaty", center: [76.89, 43.24], bbox: [76.68, 43.12, 77.10, 43.36] },
  { id: "shymkent", name: "Шымкент", regionId: "shymkent", center: [69.59, 42.32], bbox: [69.40, 42.22, 69.78, 42.43] },
  { id: "karaganda", name: "Караганда", regionId: "karaganda", center: [73.10, 49.80], bbox: [72.88, 49.68, 73.32, 49.94] },
  { id: "aktobe", name: "Актобе", regionId: "aktobe", center: [57.17, 50.28], bbox: [56.96, 50.15, 57.38, 50.41] },
  { id: "taraz", name: "Тараз", regionId: "zhambyl", center: [71.37, 42.90], bbox: [71.20, 42.79, 71.54, 43.01] },
  { id: "pavlodar", name: "Павлодар", regionId: "pavlodar", center: [76.95, 52.29], bbox: [76.78, 52.19, 77.12, 52.39] },
  { id: "oskemen", name: "Өскемен", regionId: "east-kazakhstan", center: [82.61, 49.95], bbox: [82.43, 49.84, 82.79, 50.06] },
  { id: "semey", name: "Семей", regionId: "abai", center: [80.25, 50.41], bbox: [80.07, 50.30, 80.43, 50.52] },
  { id: "kostanay", name: "Костанай", regionId: "kostanay", center: [63.62, 53.21], bbox: [63.44, 53.10, 63.80, 53.32] },
  { id: "kyzylorda", name: "Кызылорда", regionId: "kyzylorda", center: [65.52, 44.85], bbox: [65.34, 44.74, 65.70, 44.96] },
  { id: "atyrau", name: "Атырау", regionId: "atyrau", center: [51.92, 47.12], bbox: [51.72, 47.01, 52.12, 47.23] },
  { id: "aktau", name: "Актау", regionId: "mangystau", center: [51.16, 43.65], bbox: [50.98, 43.53, 51.34, 43.77] },
  { id: "oral", name: "Уральск", regionId: "west-kazakhstan", center: [51.37, 51.23], bbox: [51.18, 51.12, 51.56, 51.34] },
  { id: "petropavl", name: "Петропавл", regionId: "north-kazakhstan", center: [69.15, 54.87], bbox: [68.98, 54.76, 69.32, 54.98] },
  { id: "kokshetau", name: "Кокшетау", regionId: "akmola", center: [69.39, 53.28], bbox: [69.22, 53.17, 69.56, 53.39] },
  { id: "turkistan", name: "Туркестан", regionId: "turkistan", center: [68.25, 43.30], bbox: [68.10, 43.20, 68.40, 43.40] },
  { id: "taldykorgan", name: "Талдыкорган", regionId: "zhetisu", center: [78.37, 45.02], bbox: [78.20, 44.91, 78.54, 45.13] },
  { id: "konaev", name: "Қонаев", regionId: "almaty-region", center: [77.06, 43.87], bbox: [76.91, 43.77, 77.21, 43.98] },
  { id: "zhezkazgan", name: "Жезказган", regionId: "ulytau", center: [67.71, 47.80], bbox: [67.55, 47.69, 67.87, 47.91] },
];

export const getBasgoCityPackage = (id: string) => BASGO_CITY_PACKAGES.find((city) => city.id === id);

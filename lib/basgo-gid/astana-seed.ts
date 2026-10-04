export type BasgoSeedFeature = {
  id: string;
  name: string;
  kind: "landmark" | "transport" | "service";
  coordinates: [number, number];
};

export const ASTANA_BASGO_SEED: BasgoSeedFeature[] = [
  { id: "baiterek", name: "Байтерек", kind: "landmark", coordinates: [71.4304, 51.1282] },
  { id: "khan-shatyr", name: "Хан Шатыр", kind: "landmark", coordinates: [71.4049, 51.1325] },
  { id: "hazret-sultan", name: "Мечеть Хазрет Султан", kind: "landmark", coordinates: [71.4586, 51.1240] },
  { id: "expo", name: "EXPO", kind: "landmark", coordinates: [71.4091, 51.0900] },
  { id: "astana-baiterek-bus", name: "Остановка у Байтерека", kind: "transport", coordinates: [71.4300, 51.1297] },
];

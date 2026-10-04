export type BasgoLineFeature = {
  id: string;
  name: string;
  className: "motorway" | "primary" | "secondary" | "local";
  coordinates: [number, number][];
};

export type BasgoBuildingFeature = {
  id: string;
  name: string;
  kind: "landmark" | "public" | "commercial" | "residential";
  polygon: [number, number][];
};

export const ASTANA_BASGO_ROADS: BasgoLineFeature[] = [
  { id: "qabanbay-batyr", name: "проспект Кабанбай батыра", className: "primary", coordinates: [[71.385,51.105],[71.405,51.105],[71.425,51.106],[71.445,51.108],[71.468,51.111],[71.49,51.114]] },
  { id: "turann", name: "проспект Туран", className: "primary", coordinates: [[71.375,51.135],[71.398,51.134],[71.42,51.132],[71.445,51.131],[71.47,51.13],[71.495,51.128]] },
  { id: "saryarka", name: "проспект Сарыарка", className: "primary", coordinates: [[71.35,51.19],[71.375,51.18],[71.4,51.17],[71.425,51.16],[71.45,51.15],[71.475,51.142]] },
  { id: "respublika", name: "проспект Республики", className: "primary", coordinates: [[71.38,51.18],[71.4,51.165],[71.415,51.15],[71.425,51.135],[71.435,51.12],[71.445,51.105]] },
  { id: "b-momyshuly", name: "проспект Бауыржана Момышулы", className: "secondary", coordinates: [[71.385,51.08],[71.392,51.1],[71.4,51.12],[71.405,51.14],[71.41,51.16],[71.415,51.18]] },
  { id: "sarayshyk", name: "улица Сарайшык", className: "secondary", coordinates: [[71.415,51.105],[71.42,51.12],[71.425,51.135],[71.43,51.15],[71.435,51.165]] },
  { id: "dinmukhamed", name: "улица Динмухамед Кунаев", className: "secondary", coordinates: [[71.425,51.105],[71.425,51.12],[71.426,51.135],[71.428,51.15]] },
  { id: "dostyk", name: "улица Достык", className: "secondary", coordinates: [[71.425,51.09],[71.428,51.105],[71.43,51.12],[71.432,51.135],[71.435,51.15]] },
  { id: "koshkarbayev", name: "проспект Рахимжана Кошкарбаева", className: "secondary", coordinates: [[71.45,51.075],[71.448,51.095],[71.447,51.115],[71.445,51.135]] },
  { id: "zhumabayev", name: "проспект Магжана Жумабаева", className: "secondary", coordinates: [[71.33,51.14],[71.355,51.145],[71.38,51.15],[71.405,51.155],[71.43,51.16]] },
  { id: "aken-sary", name: "улица Акена Сары", className: "local", coordinates: [[71.395,51.115],[71.41,51.115],[71.425,51.116],[71.44,51.117]] },
  { id: "kunayev-east", name: "улица Кунаева — северный участок", className: "local", coordinates: [[71.426,51.14],[71.44,51.14],[71.455,51.141]] },
  { id: "sauran", name: "улица Сауран", className: "secondary", coordinates: [[71.39,51.12],[71.41,51.122],[71.43,51.123],[71.45,51.124],[71.47,51.125]] },
  { id: "akmeshit", name: "улица Акмешит", className: "local", coordinates: [[71.405,51.11],[71.42,51.111],[71.435,51.112],[71.45,51.113]] },
  { id: "aryndy", name: "улица Арыңды", className: "local", coordinates: [[71.4,51.128],[71.415,51.129],[71.43,51.13],[71.445,51.131]] },
];

export const ASTANA_BASGO_BUILDINGS: BasgoBuildingFeature[] = [
  { id: "baiterek-building", name: "Байтерек", kind: "landmark", polygon: [[71.4299,51.1279],[71.4309,51.1279],[71.4309,51.1287],[71.4299,51.1287],[71.4299,51.1279]] },
  { id: "khan-shatyr-building", name: "Хан Шатыр", kind: "commercial", polygon: [[71.4035,51.1316],[71.4065,51.1316],[71.4065,51.1335],[71.4035,51.1335],[71.4035,51.1316]] },
  { id: "hazret-sultan-building", name: "Мечеть Хазрет Султан", kind: "landmark", polygon: [[71.4565,51.1228],[71.4605,51.1228],[71.4605,51.1252],[71.4565,51.1252],[71.4565,51.1228]] },
  { id: "expo-building", name: "EXPO", kind: "commercial", polygon: [[71.4077,51.0892],[71.4105,51.0892],[71.4105,51.0912],[71.4077,51.0912],[71.4077,51.0892]] },
  { id: "akorda", name: "Акорда", kind: "public", polygon: [[71.4425,51.1228],[71.4452,51.1228],[71.4452,51.1250],[71.4425,51.1250],[71.4425,51.1228]] },
  { id: "palace-peace", name: "Дворец мира и согласия", kind: "public", polygon: [[71.4480,51.1190],[71.4500,51.1190],[71.4500,51.1210],[71.4480,51.1210],[71.4480,51.1190]] },
  { id: "national-museum", name: "Национальный музей Казахстана", kind: "public", polygon: [[71.4540,51.1180],[71.4575,51.1180],[71.4575,51.1200],[71.4540,51.1200],[71.4540,51.1180]] },
  { id: "keruen", name: "ТРЦ Керуен", kind: "commercial", polygon: [[71.4268,51.1282],[71.4290,51.1282],[71.4290,51.1300],[71.4268,51.1300],[71.4268,51.1282]] },
  { id: "grand-alatau", name: "ЖК Grand Alatau", kind: "residential", polygon: [[71.4160,51.1580],[71.4180,51.1580],[71.4180,51.1610],[71.4160,51.1610],[71.4160,51.1580]] },
  { id: "moscow-business", name: "ЖК Москва", kind: "residential", polygon: [[71.4115,51.1350],[71.4132,51.1350],[71.4132,51.1370],[71.4115,51.1370],[71.4115,51.1350]] },
  { id: "nazarbayev-university", name: "Nazarbayev University", kind: "public", polygon: [[71.3980,51.0915],[71.4025,51.0915],[71.4025,51.0940],[71.3980,51.0940],[71.3980,51.0915]] },
];

const API_KEY = 'Bx2mfQIjgUngXFiUPBtJ2Ar9f1jRw3tyM1zAwqqN';
const BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export interface ApiCarResult {
  make: string;
  model: string;
  year: number;
  cylinders: number;
  displacement: number;
  drive: string;
  fuel_type: string;
  transmission: string;
  city_mpg: number;
  highway_mpg: number;
  class: string;
}

// Common brand name aliases the API uses
const MAKE_ALIASES: Record<string, string> = {
  'mercedes': 'mercedes-benz',
  'mercedes benz': 'mercedes-benz',
  'vw': 'volkswagen',
  'chevy': 'chevrolet',
  'vette': 'chevrolet',
  'bimmer': 'bmw',
  'merc': 'mercedes-benz',
  'lambo': 'lamborghini',
  'fezza': 'ferrari',
};

function normaliseMake(make: string): string {
  const lower = make.toLowerCase().trim();
  return MAKE_ALIASES[lower] ?? lower;
}

function normaliseDrive(drive: string): string {
  const d = (drive ?? '').toLowerCase();
  if (d.includes('rwd') || d.includes('rear')) return 'RWD';
  if (d.includes('fwd') || d.includes('front')) return 'FWD';
  if (d.includes('awd') || d.includes('all')) return 'AWD';
  if (d.includes('4wd') || d.includes('four')) return '4WD';
  return drive ? drive.toUpperCase() : '';
}

function buildEngineString(car: ApiCarResult): string {
  const parts: string[] = [];
  if (car.displacement) parts.push(`${car.displacement.toFixed(1)}L`);
  if (car.cylinders) parts.push(`${car.cylinders}-cyl`);
  if (car.fuel_type === 'electricity') parts.push('Electric');
  if (car.transmission === 'm') parts.push('Manual');
  return parts.join(' ') || 'See specs';
}

// Variants for popular model families — keyed by NHTSA model name
const MODEL_VARIANTS: Record<string, string[]> = {
  // Mercedes-Benz
  'C-Class': ['C 180','C 200','C 250','C 300','C 300 4MATIC','C 350','C 400','C 43 AMG','C 63 AMG','C 63 AMG S'],
  'E-Class': ['E 200','E 250','E 300','E 350','E 400','E 43 AMG','E 53 AMG','E 63 AMG','E 63 AMG S'],
  'S-Class': ['S 350','S 450','S 500','S 550','S 560','S 600','S 63 AMG','S 65 AMG'],
  'G-Class': ['G 500','G 550','G 63 AMG','G 65 AMG'],
  'GLE': ['GLE 300d','GLE 350','GLE 400','GLE 450','GLE 53 AMG','GLE 63 AMG','GLE 63 AMG S'],
  'GLC': ['GLC 200','GLC 250','GLC 300','GLC 350e','GLC 43 AMG','GLC 63 AMG','GLC 63 AMG S'],
  'AMG GT': ['AMG GT','AMG GT S','AMG GT C','AMG GT R','AMG GT Black Series'],
  'CLA': ['CLA 200','CLA 220','CLA 250','CLA 35 AMG','CLA 45 AMG','CLA 45 AMG S'],
  'A-Class': ['A 180','A 200','A 220','A 250','A 35 AMG','A 45 AMG','A 45 AMG S'],
  'SL': ['SL 400','SL 450','SL 500','SL 550','SL 55 AMG','SL 63 AMG','SL 65 AMG'],
  'SLC': ['SLC 180','SLC 200','SLC 300','SLC 43 AMG'],
  // BMW
  '2 Series': ['218i','220i','230i','M235i','M240i','M2','M2 Competition','M2 CS'],
  '3 Series': ['318i','320i','325i','328i','330i','330e','335i','340i','M3','M3 Competition','M3 CS','M3 CSL'],
  '4 Series': ['420i','428i','430i','435i','440i','M4','M4 Competition','M4 CS','M4 GTS','M4 CSL'],
  '5 Series': ['520i','528i','530i','530e','535i','540i','545i','550i','M5','M5 Competition','M5 CS'],
  '6 Series': ['630i','640i','645Ci','650i','M6','M6 Gran Coupe'],
  '7 Series': ['730i','740i','740Li','745i','750i','750Li','760i','Alpina B7'],
  '8 Series': ['840i','M850i','M8','M8 Competition','Alpina B8'],
  'M2': ['M2','M2 Competition','M2 CS'],
  'M3': ['M3','M3 Competition','M3 CS','M3 CSL','M3 Tour'],
  'M4': ['M4','M4 Competition','M4 CS','M4 GTS','M4 CSL'],
  'M5': ['M5','M5 Competition','M5 CS'],
  'X5': ['X5 xDrive35i','X5 xDrive40i','X5 xDrive50i','X5 M','X5 M Competition'],
  'X6': ['X6 xDrive35i','X6 xDrive50i','X6 M','X6 M Competition'],
  // Audi
  'A3': ['A3 1.4T','A3 1.8T','A3 2.0T','S3','RS3'],
  'A4': ['A4 1.8T','A4 2.0T','A4 3.0','A4 allroad','S4','RS4','RS4 Avant'],
  'A5': ['A5 2.0T','A5 3.0T','S5','RS5','RS5 Sportback'],
  'A6': ['A6 2.0T','A6 3.0T','A6 allroad','S6','RS6','RS6 Avant'],
  'A7': ['A7 2.0T','A7 3.0T','S7','RS7'],
  'A8': ['A8 3.0T','A8 4.0T','A8 L','S8','S8 Plus'],
  'R8': ['R8 V8','R8 V10','R8 V10 Plus','R8 V10 GT','R8 GT','R8 Spyder'],
  'TT': ['TT 2.0','TTS','TT RS'],
  'Q5': ['Q5 2.0T','Q5 3.0T','SQ5','RSQ5'],
  'Q7': ['Q7 2.0T','Q7 3.0T','SQ7','RSQ7'],
  // Porsche
  '911': ['911 Carrera','911 Carrera S','911 Carrera 4','911 Carrera 4S','911 Targa 4','911 Targa 4S','911 Turbo','911 Turbo S','911 GT3','911 GT3 RS','911 GT2 RS','911 R','911 Speedster'],
  'Cayenne': ['Cayenne','Cayenne S','Cayenne GTS','Cayenne Turbo','Cayenne Turbo S','Cayenne Turbo S E-Hybrid'],
  'Panamera': ['Panamera','Panamera 4','Panamera 4S','Panamera GTS','Panamera Turbo','Panamera Turbo S','Panamera Turbo S E-Hybrid'],
  'Cayman': ['Cayman','Cayman S','Cayman GTS','Cayman GT4','Cayman GT4 RS'],
  'Boxster': ['Boxster','Boxster S','Boxster GTS','Boxster Spyder'],
  'Macan': ['Macan','Macan S','Macan GTS','Macan Turbo'],
  // Ford
  'Mustang': ['Mustang EcoBoost','Mustang EcoBoost Premium','Mustang GT','Mustang GT Premium','Mustang Bullitt','Mustang Mach 1','Shelby GT350','Shelby GT350R','Shelby GT500'],
  'F-150': ['F-150 XL','F-150 XLT','F-150 Lariat','F-150 King Ranch','F-150 Platinum','F-150 Limited','F-150 Raptor','F-150 Tremor'],
  'Focus': ['Focus S','Focus SE','Focus ST','Focus RS'],
  // Chevrolet
  'Camaro': ['Camaro LS','Camaro LT','Camaro LT1','Camaro SS','Camaro 1LE','Camaro ZL1','Camaro ZL1 1LE','Camaro Z/28'],
  'Corvette': ['Corvette Stingray','Corvette Grand Sport','Corvette Z06','Corvette ZR1','Corvette E-Ray'],
  // Nissan
  'GT-R': ['GT-R Premium','GT-R Track Edition','GT-R NISMO'],
  'Z': ['Z Sport','Z Performance','Z Proto Spec','NISMO'],
  '370Z': ['370Z','370Z Touring','370Z NISMO','370Z Roadster'],
  '350Z': ['350Z','350Z Touring','350Z Performance','350Z Track','350Z NISMO','350Z Roadster'],
  // Subaru
  'WRX': ['WRX','WRX Premium','WRX Limited','WRX STI','WRX STI Limited','WRX STI S209'],
  'BRZ': ['BRZ Premium','BRZ Limited','BRZ tS','BRZ STI Sport'],
  // Honda
  'Civic': ['Civic LX','Civic Sport','Civic EX','Civic EX-L','Civic Touring','Civic Si','Civic Type R'],
  'Accord': ['Accord LX','Accord Sport','Accord EX','Accord EX-L','Accord Touring'],
  // Toyota
  'Supra': ['GR Supra 2.0','GR Supra 3.0','GR Supra 3.0 Premium','GR Supra A91 Edition','GR Supra MKIV'],
  'Corolla': ['Corolla L','Corolla LE','Corolla SE','Corolla XSE','Corolla XLE','GR Corolla'],
  // Lamborghini
  'Huracan': ['Huracan LP 610-4','Huracan LP 580-2','Huracan Performante','Huracan Evo','Huracan Evo RWD','Huracan STO','Huracan Tecnica'],
  'Aventador': ['Aventador LP 700-4','Aventador S','Aventador SVJ','Aventador Ultimae'],
  'Urus': ['Urus','Urus S','Urus Performante'],
  // Ferrari
  '488': ['488 GTB','488 Spider','488 Pista','488 Pista Spider'],
  'F8': ['F8 Tributo','F8 Spider'],
  '296': ['296 GTB','296 GTS'],
  'Roma': ['Roma','Roma Spider'],
  '812': ['812 Superfast','812 GTS','812 Competizione','812 Competizione A'],
  'SF90': ['SF90 Stradale','SF90 Spider','SF90 XX Stradale','SF90 XX Spider'],
  // McLaren
  '570S': ['570S Coupe','570S Spider','570GT'],
  '720S': ['720S Coupe','720S Spider','720S Track Pack'],
  '765LT': ['765LT Coupe','765LT Spider'],
  'Artura': ['Artura','Artura Spider'],
  'GT': ['GT'],
  // Dodge
  'Charger': ['Charger SXT','Charger GT','Charger R/T','Charger R/T Scat Pack','Charger SRT 392','Charger SRT Hellcat','Charger SRT Hellcat Widebody','Charger SRT Super Stock'],
  'Challenger': ['Challenger SXT','Challenger GT','Challenger R/T','Challenger R/T Scat Pack','Challenger SRT 392','Challenger SRT Hellcat','Challenger SRT Hellcat Widebody','Challenger SRT Super Stock','Challenger SRT Demon'],
  'Viper': ['Viper SRT','Viper ACR','Viper GTC','Viper GTS-R'],
};

export function getVariantsForModel(model: string): string[] {
  return MODEL_VARIANTS[model] ?? [];
}

// NHTSA year-filtered endpoint — returns specific trims sold in that year (e.g. C 300, C 63 AMG)
export async function getModelsFromApi(make: string, year: number): Promise<string[]> {
  const encoded = encodeURIComponent(make.trim());
  const url = `${NHTSA_BASE}/GetModelsForMakeYear/make/${encoded}/modelyear/${year}?format=json`;
  console.log(`[carApi] NHTSA GET ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[carApi] NHTSA failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const models: string[] = (data.Results ?? []).map((r: any) => r.Model_Name as string);
    const unique = [...new Set(models)].sort();
    console.log(`[carApi] NHTSA models for ${make} ${year} (${unique.length}):`, unique);
    return unique;
  } catch (e) {
    console.error(`[carApi] NHTSA error:`, e);
    return [];
  }
}

export async function getCarSpec(make: string, model: string, year: number) {
  const normMake = normaliseMake(make);
  const params = new URLSearchParams({
    make: normMake,
    model: model.toLowerCase(),
    year: String(year),
  });
  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  if (!res.ok) return null;
  const data: ApiCarResult[] = await res.json();
  if (!data.length) return null;

  const car = data[0];
  return {
    drivetrain: normaliseDrive(car.drive ?? ''),
    engine: buildEngineString(car),
    cylinders: car.cylinders,
    displacement: car.displacement,
  };
}

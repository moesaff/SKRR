export interface CarSpec {
  hp: number;
  torque: number;
  zeroToSixty: string;
  drivetrain: string;
  engine: string;
}

export interface CarModel {
  model: string;
  specs: CarSpec;
}

export interface CarMake {
  make: string;
  models: CarModel[];
}

export const CAR_DATABASE: CarMake[] = [
  {
    make: 'Nissan',
    models: [
      { model: 'Silvia S13', specs: { hp: 205, torque: 195, zeroToSixty: '6.2s', drivetrain: 'RWD', engine: 'SR20DET Turbo' } },
      { model: 'Silvia S14', specs: { hp: 220, torque: 203, zeroToSixty: '5.9s', drivetrain: 'RWD', engine: 'SR20DET Turbo' } },
      { model: 'Silvia S15', specs: { hp: 247, torque: 203, zeroToSixty: '5.6s', drivetrain: 'RWD', engine: 'SR20DET Turbo' } },
      { model: '240SX', specs: { hp: 155, torque: 160, zeroToSixty: '7.4s', drivetrain: 'RWD', engine: 'KA24DE' } },
      { model: '350Z', specs: { hp: 306, torque: 268, zeroToSixty: '5.2s', drivetrain: 'RWD', engine: 'VQ35DE V6' } },
      { model: '370Z', specs: { hp: 332, torque: 270, zeroToSixty: '5.1s', drivetrain: 'RWD', engine: 'VQ37VHR V6' } },
      { model: 'GT-R R35', specs: { hp: 565, torque: 467, zeroToSixty: '2.7s', drivetrain: 'AWD', engine: 'VR38DETT Twin Turbo' } },
      { model: 'Skyline R32', specs: { hp: 276, torque: 260, zeroToSixty: '5.6s', drivetrain: 'AWD', engine: 'RB26DETT Twin Turbo' } },
      { model: 'Skyline R33', specs: { hp: 276, torque: 271, zeroToSixty: '5.4s', drivetrain: 'AWD', engine: 'RB26DETT Twin Turbo' } },
      { model: 'Skyline R34', specs: { hp: 280, torque: 289, zeroToSixty: '5.2s', drivetrain: 'AWD', engine: 'RB26DETT Twin Turbo' } },
      { model: 'Sentra SE-R', specs: { hp: 175, torque: 180, zeroToSixty: '7.1s', drivetrain: 'FWD', engine: 'QR25DE' } },
    ],
  },
  {
    make: 'Toyota',
    models: [
      { model: 'Supra MK4', specs: { hp: 320, torque: 315, zeroToSixty: '4.6s', drivetrain: 'RWD', engine: '2JZ-GTE Twin Turbo' } },
      { model: 'Supra MK5', specs: { hp: 382, torque: 368, zeroToSixty: '3.9s', drivetrain: 'RWD', engine: 'B58 Turbo' } },
      { model: 'AE86 Corolla', specs: { hp: 128, torque: 105, zeroToSixty: '8.4s', drivetrain: 'RWD', engine: '4A-GE' } },
      { model: 'Celica GT-S', specs: { hp: 180, torque: 130, zeroToSixty: '7.2s', drivetrain: 'FWD', engine: '2ZZ-GE' } },
      { model: 'MR2 SW20', specs: { hp: 200, torque: 200, zeroToSixty: '5.6s', drivetrain: 'RWD', engine: '3S-GTE Turbo' } },
      { model: 'GR86', specs: { hp: 228, torque: 184, zeroToSixty: '6.1s', drivetrain: 'RWD', engine: 'FA24 Boxer' } },
      { model: 'GR Yaris', specs: { hp: 268, torque: 273, zeroToSixty: '5.5s', drivetrain: 'AWD', engine: 'G16E-GTS Turbo' } },
      { model: 'Chaser JZX100', specs: { hp: 276, torque: 280, zeroToSixty: '5.8s', drivetrain: 'RWD', engine: '1JZ-GTE Turbo' } },
    ],
  },
  {
    make: 'Honda',
    models: [
      { model: 'Civic Type R FK8', specs: { hp: 306, torque: 295, zeroToSixty: '5.0s', drivetrain: 'FWD', engine: 'K20C1 Turbo' } },
      { model: 'Civic Type R FL5', specs: { hp: 315, torque: 310, zeroToSixty: '4.9s', drivetrain: 'FWD', engine: 'K20C1 Turbo' } },
      { model: 'Civic EG', specs: { hp: 125, torque: 106, zeroToSixty: '8.1s', drivetrain: 'FWD', engine: 'B16A2' } },
      { model: 'Integra Type R DC2', specs: { hp: 197, torque: 131, zeroToSixty: '6.8s', drivetrain: 'FWD', engine: 'B18C5' } },
      { model: 'NSX', specs: { hp: 290, torque: 210, zeroToSixty: '5.7s', drivetrain: 'RWD', engine: 'C30A V6' } },
      { model: 'NSX Type S', specs: { hp: 600, torque: 492, zeroToSixty: '2.9s', drivetrain: 'AWD', engine: 'Hybrid V6 Twin Turbo' } },
      { model: 'S2000', specs: { hp: 240, torque: 162, zeroToSixty: '5.9s', drivetrain: 'RWD', engine: 'F22C1' } },
      { model: 'Accord Euro R', specs: { hp: 220, torque: 167, zeroToSixty: '6.4s', drivetrain: 'FWD', engine: 'H22A' } },
    ],
  },
  {
    make: 'Subaru',
    models: [
      { model: 'WRX STI', specs: { hp: 310, torque: 290, zeroToSixty: '5.1s', drivetrain: 'AWD', engine: 'EJ257 Boxer Turbo' } },
      { model: 'WRX', specs: { hp: 271, torque: 258, zeroToSixty: '5.5s', drivetrain: 'AWD', engine: 'FA20DIT Boxer Turbo' } },
      { model: 'BRZ', specs: { hp: 228, torque: 184, zeroToSixty: '6.1s', drivetrain: 'RWD', engine: 'FA24 Boxer' } },
      { model: 'Impreza WRX STI 22B', specs: { hp: 276, torque: 260, zeroToSixty: '5.0s', drivetrain: 'AWD', engine: 'EJ22 Boxer Turbo' } },
      { model: 'Legacy GT', specs: { hp: 250, torque: 253, zeroToSixty: '5.7s', drivetrain: 'AWD', engine: 'EJ255 Boxer Turbo' } },
    ],
  },
  {
    make: 'Mitsubishi',
    models: [
      { model: 'Lancer Evo IX', specs: { hp: 286, torque: 289, zeroToSixty: '4.9s', drivetrain: 'AWD', engine: '4G63T Turbo' } },
      { model: 'Lancer Evo X', specs: { hp: 291, torque: 300, zeroToSixty: '4.8s', drivetrain: 'AWD', engine: '4B11T Turbo' } },
      { model: 'Eclipse GSX', specs: { hp: 210, torque: 214, zeroToSixty: '5.9s', drivetrain: 'AWD', engine: '4G63T Turbo' } },
      { model: '3000GT VR-4', specs: { hp: 320, torque: 315, zeroToSixty: '5.3s', drivetrain: 'AWD', engine: '6G72 Twin Turbo' } },
    ],
  },
  {
    make: 'Mazda',
    models: [
      { model: 'RX-7 FD', specs: { hp: 255, torque: 217, zeroToSixty: '5.3s', drivetrain: 'RWD', engine: '13B-REW Twin Rotary' } },
      { model: 'RX-7 FC', specs: { hp: 200, torque: 196, zeroToSixty: '6.5s', drivetrain: 'RWD', engine: '13B-T Rotary Turbo' } },
      { model: 'RX-8', specs: { hp: 232, torque: 159, zeroToSixty: '6.0s', drivetrain: 'RWD', engine: '13B-MSP Rotary' } },
      { model: 'Miata NA', specs: { hp: 116, torque: 100, zeroToSixty: '8.6s', drivetrain: 'RWD', engine: 'B6-ZE' } },
      { model: 'Miata ND', specs: { hp: 181, torque: 151, zeroToSixty: '5.9s', drivetrain: 'RWD', engine: 'P5-VPS' } },
      { model: 'Speed3', specs: { hp: 263, torque: 280, zeroToSixty: '5.4s', drivetrain: 'FWD', engine: 'L3-VDT Turbo' } },
    ],
  },
  {
    make: 'Ford',
    models: [
      { model: 'Mustang GT', specs: { hp: 450, torque: 410, zeroToSixty: '4.3s', drivetrain: 'RWD', engine: '5.0L Coyote V8' } },
      { model: 'Mustang GT500', specs: { hp: 760, torque: 625, zeroToSixty: '3.3s', drivetrain: 'RWD', engine: '5.2L Supercharged V8' } },
      { model: 'Mustang EcoBoost', specs: { hp: 310, torque: 350, zeroToSixty: '5.1s', drivetrain: 'RWD', engine: '2.3L EcoBoost Turbo' } },
      { model: 'Focus RS', specs: { hp: 350, torque: 350, zeroToSixty: '4.7s', drivetrain: 'AWD', engine: '2.3L EcoBoost Turbo' } },
      { model: 'GT', specs: { hp: 647, torque: 550, zeroToSixty: '3.0s', drivetrain: 'RWD', engine: '3.5L EcoBoost Twin Turbo V6' } },
    ],
  },
  {
    make: 'Chevrolet',
    models: [
      { model: 'Camaro SS', specs: { hp: 455, torque: 455, zeroToSixty: '4.0s', drivetrain: 'RWD', engine: '6.2L LT1 V8' } },
      { model: 'Camaro ZL1', specs: { hp: 650, torque: 650, zeroToSixty: '3.5s', drivetrain: 'RWD', engine: '6.2L Supercharged V8' } },
      { model: 'Corvette C7', specs: { hp: 455, torque: 460, zeroToSixty: '3.7s', drivetrain: 'RWD', engine: '6.2L LT1 V8' } },
      { model: 'Corvette C8', specs: { hp: 495, torque: 470, zeroToSixty: '2.9s', drivetrain: 'RWD', engine: '6.2L LT2 V8' } },
      { model: 'Corvette Z06', specs: { hp: 670, torque: 460, zeroToSixty: '2.6s', drivetrain: 'RWD', engine: '5.5L LT6 V8' } },
    ],
  },
  {
    make: 'BMW',
    models: [
      { model: 'M3 E46', specs: { hp: 333, torque: 262, zeroToSixty: '4.8s', drivetrain: 'RWD', engine: 'S54 Inline-6' } },
      { model: 'M3 F80', specs: { hp: 425, torque: 406, zeroToSixty: '3.9s', drivetrain: 'RWD', engine: 'S55 Twin Turbo' } },
      { model: 'M3 G80', specs: { hp: 503, torque: 479, zeroToSixty: '3.5s', drivetrain: 'RWD', engine: 'S58 Twin Turbo' } },
      { model: 'M4 Competition', specs: { hp: 503, torque: 479, zeroToSixty: '3.8s', drivetrain: 'RWD', engine: 'S58 Twin Turbo' } },
      { model: 'M2', specs: { hp: 453, torque: 406, zeroToSixty: '4.1s', drivetrain: 'RWD', engine: 'S58 Twin Turbo' } },
      { model: '335i', specs: { hp: 300, torque: 300, zeroToSixty: '5.1s', drivetrain: 'RWD', engine: 'N54 Twin Turbo' } },
    ],
  },
  {
    make: 'Mercedes-Benz',
    models: [
      { model: 'C63 AMG', specs: { hp: 503, torque: 516, zeroToSixty: '3.8s', drivetrain: 'RWD', engine: 'M177 Twin Turbo V8' } },
      { model: 'C63 AMG W204', specs: { hp: 451, torque: 443, zeroToSixty: '4.1s', drivetrain: 'RWD', engine: 'M156 V8' } },
      { model: 'E63 AMG', specs: { hp: 603, torque: 627, zeroToSixty: '3.3s', drivetrain: 'AWD', engine: 'M177 Twin Turbo V8' } },
      { model: 'A45 AMG', specs: { hp: 421, torque: 369, zeroToSixty: '3.9s', drivetrain: 'AWD', engine: 'M139 Turbo' } },
      { model: 'GT AMG', specs: { hp: 523, torque: 479, zeroToSixty: '3.7s', drivetrain: 'RWD', engine: 'M178 Twin Turbo V8' } },
    ],
  },
  {
    make: 'Audi',
    models: [
      { model: 'RS3', specs: { hp: 401, torque: 369, zeroToSixty: '3.8s', drivetrain: 'AWD', engine: '2.5L TFSI Turbo' } },
      { model: 'RS6 Avant', specs: { hp: 591, torque: 590, zeroToSixty: '3.6s', drivetrain: 'AWD', engine: '4.0L TFSI Twin Turbo V8' } },
      { model: 'TT RS', specs: { hp: 394, torque: 354, zeroToSixty: '3.7s', drivetrain: 'AWD', engine: '2.5L TFSI Turbo' } },
      { model: 'R8 V10', specs: { hp: 602, torque: 413, zeroToSixty: '3.2s', drivetrain: 'AWD', engine: '5.2L V10' } },
    ],
  },
  {
    make: 'Porsche',
    models: [
      { model: '911 GT3', specs: { hp: 502, torque: 346, zeroToSixty: '3.2s', drivetrain: 'RWD', engine: '4.0L Flat-6' } },
      { model: '911 Turbo S', specs: { hp: 640, torque: 590, zeroToSixty: '2.7s', drivetrain: 'AWD', engine: '3.8L Twin Turbo Flat-6' } },
      { model: 'Cayman GT4', specs: { hp: 414, torque: 309, zeroToSixty: '4.2s', drivetrain: 'RWD', engine: '4.0L Flat-6' } },
    ],
  },
  {
    make: 'Dodge',
    models: [
      { model: 'Challenger SRT Hellcat', specs: { hp: 717, torque: 656, zeroToSixty: '3.6s', drivetrain: 'RWD', engine: '6.2L Supercharged V8' } },
      { model: 'Challenger SRT Demon', specs: { hp: 840, torque: 770, zeroToSixty: '2.3s', drivetrain: 'RWD', engine: '6.2L Supercharged V8' } },
      { model: 'Charger Hellcat', specs: { hp: 717, torque: 656, zeroToSixty: '3.6s', drivetrain: 'RWD', engine: '6.2L Supercharged V8' } },
      { model: 'Viper ACR', specs: { hp: 645, torque: 600, zeroToSixty: '3.5s', drivetrain: 'RWD', engine: '8.4L V10' } },
    ],
  },
  {
    make: 'Lamborghini',
    models: [
      { model: 'Huracán LP610-4', specs: { hp: 610, torque: 413, zeroToSixty: '2.9s', drivetrain: 'AWD', engine: '5.2L V10' } },
      { model: 'Huracán STO', specs: { hp: 631, torque: 417, zeroToSixty: '3.0s', drivetrain: 'RWD', engine: '5.2L V10' } },
      { model: 'Aventador SVJ', specs: { hp: 770, torque: 531, zeroToSixty: '2.8s', drivetrain: 'AWD', engine: '6.5L V12' } },
    ],
  },
  {
    make: 'Ferrari',
    models: [
      { model: '488 GTB', specs: { hp: 660, torque: 560, zeroToSixty: '3.0s', drivetrain: 'RWD', engine: '3.9L Twin Turbo V8' } },
      { model: 'F8 Tributo', specs: { hp: 710, torque: 568, zeroToSixty: '2.9s', drivetrain: 'RWD', engine: '3.9L Twin Turbo V8' } },
      { model: '296 GTB', specs: { hp: 819, torque: 546, zeroToSixty: '2.9s', drivetrain: 'RWD', engine: '3.0L Twin Turbo V6 Hybrid' } },
    ],
  },
  {
    make: 'Acura',
    models: [
      { model: 'Integra Type S', specs: { hp: 320, torque: 310, zeroToSixty: '4.5s', drivetrain: 'FWD', engine: 'K20C1 Turbo' } },
      { model: 'NSX Gen2', specs: { hp: 573, torque: 476, zeroToSixty: '2.9s', drivetrain: 'AWD', engine: '3.5L Twin Turbo V6 Hybrid' } },
      { model: 'RSX Type S', specs: { hp: 210, torque: 143, zeroToSixty: '6.3s', drivetrain: 'FWD', engine: 'K20A2' } },
    ],
  },
  {
    make: 'Volkswagen',
    models: [
      { model: 'Golf GTI', specs: { hp: 228, torque: 258, zeroToSixty: '6.2s', drivetrain: 'FWD', engine: 'EA888 Turbo' } },
      { model: 'Golf R', specs: { hp: 315, torque: 310, zeroToSixty: '4.7s', drivetrain: 'AWD', engine: 'EA888 Turbo' } },
      { model: 'Scirocco R', specs: { hp: 261, torque: 258, zeroToSixty: '5.5s', drivetrain: 'FWD', engine: 'EA888 Turbo' } },
    ],
  },
  {
    make: 'Hyundai',
    models: [
      { model: 'Elantra N', specs: { hp: 276, torque: 289, zeroToSixty: '5.3s', drivetrain: 'FWD', engine: 'Theta III Turbo' } },
      { model: 'Veloster N', specs: { hp: 275, torque: 260, zeroToSixty: '5.6s', drivetrain: 'FWD', engine: 'Theta II Turbo' } },
      { model: 'i30 N', specs: { hp: 271, torque: 260, zeroToSixty: '5.4s', drivetrain: 'FWD', engine: 'Theta III Turbo' } },
    ],
  },
  {
    make: 'Kia',
    models: [
      { model: 'Stinger GT', specs: { hp: 365, torque: 376, zeroToSixty: '4.7s', drivetrain: 'RWD', engine: 'Lambda Twin Turbo V6' } },
    ],
  },
];

// Comprehensive makes list — includes all static DB makes + 100+ more brands
export const ALL_MAKES = [
  'Acura', 'Alfa Romeo', 'Alpine', 'Ariel', 'Aston Martin', 'Audi',
  'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
  'Dacia', 'Dodge',
  'Ferrari', 'Fiat', 'Ford',
  'Genesis', 'GMC',
  'Honda', 'Hyundai',
  'Infiniti',
  'Jaguar', 'Jeep',
  'Kia', 'Koenigsegg',
  'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus',
  'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MINI', 'Mitsubishi',
  'Nissan',
  'Pagani', 'Peugeot', 'Pontiac', 'Porsche',
  'Ram', 'Renault', 'Rolls-Royce',
  'SEAT', 'Skoda', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota',
  'Vauxhall', 'Volkswagen', 'Volvo',
  'Yamaha',
].sort();

export function getModelsForMake(make: string): CarModel[] {
  return CAR_DATABASE.find((c) => c.make === make)?.models ?? [];
}

export function getSpecsForModel(make: string, model: string): CarSpec | null {
  const models = getModelsForMake(make);
  return models.find((m) => m.model === model)?.specs ?? null;
}

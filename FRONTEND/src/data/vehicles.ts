export interface Vehicle {
  brand: string;
  model: string;
  fuel_type: string;
  transmission: string;
  year: number;
  engine_size_l: number;
  seats: number;
  body_type: string;
  price_range_lakh: string;
}

export const vehicles: Vehicle[] = [
  {
    brand: "Ashok Leyland",
    model: "Partner",
    fuel_type: "Diesel",
    transmission: "Manual",
    year: 2025,
    engine_size_l: 1.5,
    seats: 3,
    body_type: "Commercial",
    price_range_lakh: "6.50-8.50",
  },
  {
    brand: "Ashok Leyland",
    model: "Dost+",
    fuel_type: "Diesel",
    transmission: "Manual",
    year: 2025,
    engine_size_l: 1.5,
    seats: 3,
    body_type: "Commercial",
    price_range_lakh: "7.50-9.50",
  },
  {
    brand: "Aston Martin",
    model: "Vantage",
    fuel_type: "Petrol",
    transmission: "AT",
    year: 2025,
    engine_size_l: 4,
    seats: 2,
    body_type: "Coupe",
    price_range_lakh: "399.00-450.00",
  },
];
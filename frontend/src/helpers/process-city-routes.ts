export interface CityConnection {
  id: string
  name: string
  routeId: string
  departureDate: Date
}

export interface ProcessedCity {
  id: string
  name: string
  connections: CityConnection[]
}

export function processCityRoutes(data: any | undefined): ProcessedCity[] {
  // If data is undefined, return an empty array
  if (!data) return []

  // Create a map to store all cities and their connections
  const cityMap = new Map<string, ProcessedCity>()

  // Process each route
  for (const route of data.routes) {
    const departureCity = route.departureCity
    const arrivalCity = route.arrivalCity

    // Skip if either city is null
    if (!departureCity || !arrivalCity) continue

    // Add departure city if not already in the map
    if (!cityMap.has(departureCity.id)) {
      cityMap.set(departureCity.id, {
        id: departureCity.id,
        name: departureCity.name,
        connections: [],
      })
    }

    // Add arrival city if not already in the map
    if (!cityMap.has(arrivalCity.id)) {
      cityMap.set(arrivalCity.id, {
        id: arrivalCity.id,
        name: arrivalCity.name,
        connections: [],
      })
    }

    // Add the connection from departure to arrival
    cityMap.get(departureCity.id)?.connections.push({
      id: arrivalCity.id,
      name: arrivalCity.name,
      routeId: route.id,
      departureDate: route.departureDate,
    })

    // Add the connection from arrival to departure
    cityMap.get(arrivalCity.id)?.connections.push({
      id: departureCity.id,
      name: departureCity.name,
      routeId: route.id,
      departureDate: route.departureDate,
    })
  }

  // Convert the map to an array
  return Array.from(cityMap.values())
}

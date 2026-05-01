/**
 * ZeroLink Core Engine
 * Deterministic logic for food rescue logistics.
 */

import { addHours, differenceInMinutes, isAfter } from 'date-fns';

export enum FoodCategory {
  COOKED_MEALS = 'Cooked Meals',
  BAKERY = 'Bakery',
  PRODUCE = 'Fresh Produce',
  DAIRY = 'Dairy',
  PACKAGED = 'Packaged Goods',
}

export enum StorageType {
  ROOM_TEMP = 'Room Temp',
  REFRIGERATED = 'Refrigerated',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Donor {
  id: string;
  name: string;
  location: Location;
}

export interface DemandNode {
  id: string;
  name: string;
  type: 'NGO' | 'HUNGER_SPOT';
  location: Location;
  capacityServings: number;
  remainingCapacity: number;
  priority: Priority;
  operatingHours?: { start: number; end: number }; // 0-23
}

export interface FoodBatch {
  id: string;
  donorId: string;
  foodType: FoodCategory;
  quantityKg: number;
  servings: number;
  cookingTime: Date;
  storage: StorageType;
  packaging: 'Open' | 'Sealed';
  ambientTemp: number; // Celsius
  humidity: number; // Percent
}

export interface ExpiryAnalysis {
  expiryTime: Date;
  remainingSafeMinutes: number;
  priorityLevel: Priority;
}

/**
 * 1. FOOD EXPIRY ENGINE
 */
export function calculateExpiry(batch: FoodBatch): ExpiryAnalysis {
  let baseShelfLifeHours = 4; // Default for cooked meals room temp

  switch (batch.foodType) {
    case FoodCategory.COOKED_MEALS:
      baseShelfLifeHours = batch.storage === StorageType.REFRIGERATED ? 48 : 4;
      break;
    case FoodCategory.BAKERY:
      baseShelfLifeHours = 72;
      break;
    case FoodCategory.PRODUCE:
      baseShelfLifeHours = 120;
      break;
    case FoodCategory.DAIRY:
      baseShelfLifeHours = batch.storage === StorageType.REFRIGERATED ? 24 : 2;
      break;
    case FoodCategory.PACKAGED:
      baseShelfLifeHours = 720; // 30 days
      break;
  }

  // Environmental degradation factors
  if (batch.ambientTemp > 30) baseShelfLifeHours *= 0.7; // High heat
  if (batch.humidity > 70) baseShelfLifeHours *= 0.8; // High humidity
  if (batch.packaging === 'Open') baseShelfLifeHours *= 0.6; // Exposed

  const expiryTime = addHours(batch.cookingTime, baseShelfLifeHours);
  const now = new Date();
  const remainingSafeMinutes = differenceInMinutes(expiryTime, now);

  let priorityLevel = Priority.LOW;
  if (remainingSafeMinutes < 60) priorityLevel = Priority.CRITICAL;
  else if (remainingSafeMinutes < 120) priorityLevel = Priority.HIGH;
  else if (remainingSafeMinutes < 240) priorityLevel = Priority.MEDIUM;

  return { expiryTime, remainingSafeMinutes, priorityLevel };
}

/**
 * distance in km (Haversine approximation)
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 3. MATCHING ENGINE
 */
export function findBestMatch(
  batch: FoodBatch,
  donor: Donor,
  nodes: DemandNode[],
  expiryAnalysis: ExpiryAnalysis
): DemandNode | null {
  const validNodes = nodes.filter((node) => node.remainingCapacity >= batch.servings);

  if (validNodes.length === 0) return null;

  // Urgent matching rule: Expiry < 2 hours
  if (expiryAnalysis.remainingSafeMinutes < 120) {
    return validNodes.sort(
      (a, b) => calculateDistance(donor.location, a.location) - calculateDistance(donor.location, b.location)
    )[0];
  }

  // General scoring
  const scoredNodes = validNodes.map((node) => {
    const dist = calculateDistance(donor.location, node.location);
    let score = dist * 10; // lower score is better

    // Priority bonus
    if (node.priority === Priority.CRITICAL) score -= 50;
    if (node.priority === Priority.HIGH) score -= 20;

    // Type preference: NGOs first for non-critical expiry
    if (node.type === 'NGO') score -= 10;

    return { node, score };
  });

  return scoredNodes.sort((a, b) => a.score - b.score)[0].node;
}

/**
 * 4. ROUTING ENGINE
 */
export function generateRoute(donor: Donor, target: DemandNode) {
  const distance = calculateDistance(donor.location, target.location);
  const speedKmh = 25; // average city delivery speed
  const travelMinutes = (distance / speedKmh) * 60;
  
  const pickupTime = new Date();
  const dropTime = new Date(pickupTime.getTime() + (travelMinutes + 10) * 60000); // +10 min buffer

  return {
    distanceKm: distance.toFixed(2),
    travelTimeMinutes: Math.round(travelMinutes),
    pickupTime,
    dropTime,
    steps: [`Pickup from ${donor.name}`, `En-route to ${target.name}`, `Delivery completion`],
  };
}

/**
 * 6. IMPACT METRICS
 */
export function calculateImpact(deliveries: any[]) {
  return {
    mealsSaved: deliveries.reduce((acc, d) => acc + d.batch.servings, 0),
    foodWastePreventedKg: deliveries.reduce((acc, d) => acc + d.batch.quantityKg, 0),
    highPriorityDeliveries: deliveries.filter((d) => d.expiryAnalysis.priorityLevel === Priority.CRITICAL || d.expiryAnalysis.priorityLevel === Priority.HIGH).length,
    hungerSpotsServed: deliveries.filter((d) => d.node.type === 'HUNGER_SPOT').length,
  };
}

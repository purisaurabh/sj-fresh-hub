export function isSelectableBuilding(building: {
  id: string;
  is_active: boolean;
} | null): building is { id: string; is_active: true } {
  return Boolean(building && building.is_active);
}

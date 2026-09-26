/**
 * Da formato a un nombre escrito todo en mayúsculas o todo en minúsculas
 * ("JUAN JOSE" o "juan jose" → "Juan Jose"). Si ya tiene mayúsculas y minúsculas
 * se respeta tal cual, para no romper nombres como "McDonald" o "de la Cruz".
 */
export function displayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const isSingleCase = trimmed === trimmed.toUpperCase() || trimmed === trimmed.toLowerCase();
  if (!isSingleCase) {
    return trimmed;
  }
  return trimmed
    .toLocaleLowerCase('es')
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase('es') + word.slice(1))
    .join(' ');
}

export function firstName(name: string): string {
  return displayName(name).split(' ')[0] ?? '';
}

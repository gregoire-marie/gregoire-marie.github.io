export const PROJECT_CATEGORIES = [
  { id: 'space', label: 'AI in space' },
  { id: 'aviation', label: 'AI in aviation' },
  { id: 'medicine', label: 'AI in medicine' },
  { id: 'finance', label: 'AI in finance' },
  { id: 'social', label: 'AI in social science' },
  { id: 'tools', label: 'AI as a tool' },
  { id: 'engineering', label: 'Engineering' }
] as const;

export function getProjectCategory(project: any) {
  const selected = String(project.category || '').toLowerCase();
  return PROJECT_CATEGORIES.find((category) => (
    category.id === selected || category.label.toLowerCase() === selected
  )) || PROJECT_CATEGORIES.find((category) => category.id === 'engineering')!;
}

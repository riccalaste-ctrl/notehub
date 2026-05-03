export const subjectIcons: Record<string, string> = {
  matematica: '∑',
  fisica: '⚛',
  chimica: '⬡',
  biologia: '🧬',
  italiano: '📖',
  latino: '🏛',
  storia: '📜',
  filosofia: '🧠',
  inglese: '🌍',
  informatica: '💻',
  arte: '🎨',
  scienze: '🔬',
};

export const subjectGradients: Record<string, string> = {
  matematica: 'from-[#6366F1] to-[#4F46E5]',
  fisica: 'from-[#10B981] to-[#059669]',
  chimica: 'from-[#F59E0B] to-[#D97706]',
  biologia: 'from-[#EF4444] to-[#DC2626]',
  italiano: 'from-[#8B5CF6] to-[#7C3AED]',
  latino: 'from-[#06B6D4] to-[#0891B2]',
  storia: 'from-[#F97316] to-[#EA580C]',
  filosofia: 'from-[#EC4899] to-[#DB2777]',
  inglese: 'from-[#14B8A6] to-[#0D9488]',
  informatica: 'from-[#6366F1] to-[#4F46E5]',
  arte: 'from-[#F59E0B] to-[#D97706]',
  scienze: 'from-[#10B981] to-[#059669]',
};

export function getSubjectGradient(slug: string): string {
  return subjectGradients[slug.toLowerCase()] || 'from-[#6366F1] to-[#4F46E5]';
}

export function getSubjectIcon(slug: string): string {
  return subjectIcons[slug.toLowerCase()] || '📚';
}

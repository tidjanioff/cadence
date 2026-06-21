export const COURSE_COLORS = [
  { background: '#EAF3FF', color: '#075EAE' },
  { background: '#EAF8F2', color: '#166B4D' },
  { background: '#F4EEFF', color: '#6941A5' },
  { background: '#FFF3E6', color: '#9A5700' },
  { background: '#EAF7F8', color: '#17656B' },
  { background: '#FCEEF3', color: '#93425F' },
]

export function courseColor(index: number) {
  return COURSE_COLORS[index % COURSE_COLORS.length]
}

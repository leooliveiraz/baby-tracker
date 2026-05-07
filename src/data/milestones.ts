export interface MilestoneDef {
  id: string
  ageMonths: number
  category: 'motor' | 'cognitive' | 'language' | 'social'
  title: string
  description: string
}

export const categoryConfig: Record<MilestoneDef['category'], { icon: string; label: string }> = {
  motor: { icon: '🏃', label: 'Motor' },
  cognitive: { icon: '🧠', label: 'Cognitivo' },
  language: { icon: '🗣', label: 'Linguagem' },
  social: { icon: '🧒', label: 'Social/Emocional' },
}

export const milestones: MilestoneDef[] = [
  // ── 2 Meses ─────────────────────────────
  { id: 'm2-1', ageMonths: 2, category: 'motor', title: 'Levanta a cabeça', description: 'Levanta a cabeça quando de bruços' },
  { id: 'm2-2', ageMonths: 2, category: 'motor', title: 'Movimenta membros', description: 'Movimenta braços e pernas igualmente' },
  { id: 'm2-3', ageMonths: 2, category: 'cognitive', title: 'Segue objetos', description: 'Acompanha objetos com os olhos' },
  { id: 'm2-4', ageMonths: 2, category: 'language', title: 'Emiti sons', description: 'Emiti sons tipo "ah-goo"' },
  { id: 'm2-5', ageMonths: 2, category: 'language', title: 'Reage a sons', description: 'Se vira na direção de sons' },
  { id: 'm2-6', ageMonths: 2, category: 'social', title: 'Sorri', description: 'Sorri para pessoas' },
  { id: 'm2-7', ageMonths: 2, category: 'social', title: 'Se acalma', description: 'Fica quieto quando pego no colo' },

  // ── 4 Meses ─────────────────────────────
  { id: 'm4-1', ageMonths: 4, category: 'motor', title: 'Rola', description: 'Rola de bruços para costas' },
  { id: 'm4-2', ageMonths: 4, category: 'motor', title: 'Sustenta cabeça', description: 'Sustenta a cabeça sem apoio' },
  { id: 'm4-3', ageMonths: 4, category: 'cognitive', title: 'Alcança objetos', description: 'Tenta alcançar objetos próximos' },
  { id: 'm4-4', ageMonths: 4, category: 'cognitive', title: 'Leva à boca', description: 'Leva objetos à boca para explorar' },
  { id: 'm4-5', ageMonths: 4, category: 'language', title: 'Balbucia', description: 'Balbucia sons variados' },
  { id: 'm4-6', ageMonths: 4, category: 'social', title: 'Sorri espontâneo', description: 'Sorri espontaneamente sem estímulo' },
  { id: 'm4-7', ageMonths: 4, category: 'social', title: 'Gosta de brincar', description: 'Gosta de brincar com pessoas' },

  // ── 6 Meses ─────────────────────────────
  { id: 'm6-1', ageMonths: 6, category: 'motor', title: 'Senta com apoio', description: 'Senta com apoio (travesseiros, colo)' },
  { id: 'm6-2', ageMonths: 6, category: 'motor', title: 'Rola dois lados', description: 'Rola para os dois lados' },
  { id: 'm6-3', ageMonths: 6, category: 'cognitive', title: 'Transfere objetos', description: 'Passa objetos de uma mão para outra' },
  { id: 'm6-4', ageMonths: 6, category: 'cognitive', title: 'Explora boca', description: 'Explora objetos com a boca' },
  { id: 'm6-5', ageMonths: 6, category: 'language', title: 'Responde ao nome', description: 'Responde quando chamado pelo nome' },
  { id: 'm6-6', ageMonths: 6, category: 'language', title: 'Imita sons', description: 'Imita sons de adultos' },
  { id: 'm6-7', ageMonths: 6, category: 'social', title: 'Reconhece rostos', description: 'Reconhece rostos familiares' },
  { id: 'm6-8', ageMonths: 6, category: 'social', title: 'Estranha', description: 'Estranha pessoas desconhecidas' },

  // ── 9 Meses ─────────────────────────────
  { id: 'm9-1', ageMonths: 9, category: 'motor', title: 'Engatinha', description: 'Engatinha (barriga para cima ou para baixo)' },
  { id: 'm9-2', ageMonths: 9, category: 'motor', title: 'Fica em pé com apoio', description: 'Fica em pé segurando em móveis' },
  { id: 'm9-3', ageMonths: 9, category: 'cognitive', title: 'Pinça', description: 'Usa polegar e indicador para pegar objetos' },
  { id: 'm9-4', ageMonths: 9, category: 'cognitive', title: 'Procura objetos', description: 'Procura objetos que foram escondidos' },
  { id: 'm9-5', ageMonths: 9, category: 'language', title: 'Entende "não"', description: 'Entende o significado de "não"' },
  { id: 'm9-6', ageMonths: 9, category: 'language', title: 'Mama/Papa', description: 'Faz sons tipo "mama" ou "papa"' },
  { id: 'm9-7', ageMonths: 9, category: 'social', title: 'Esconde-achou', description: 'Brinca de esconde-achou (cadê?)' },
  { id: 'm9-8', ageMonths: 9, category: 'social', title: 'Tchau', description: 'Acena dando tchau' },

  // ── 12 Meses ────────────────────────────
  { id: 'm12-1', ageMonths: 12, category: 'motor', title: 'Fica em pé', description: 'Fica em pé sozinho sem apoio' },
  { id: 'm12-2', ageMonths: 12, category: 'motor', title: 'Anda com apoio', description: 'Anda segurando em móveis' },
  { id: 'm12-3', ageMonths: 12, category: 'cognitive', title: 'Entrega objetos', description: 'Entrega objetos quando solicitado' },
  { id: 'm12-4', ageMonths: 12, category: 'cognitive', title: 'Coloca em recipiente', description: 'Coloca objetos dentro de recipientes' },
  { id: 'm12-5', ageMonths: 12, category: 'language', title: 'Fala 1-2 palavras', description: 'Fala 1 ou 2 palavras com sentido' },
  { id: 'm12-6', ageMonths: 12, category: 'language', title: 'Aponta', description: 'Aponta para objetos que quer ou vê' },
  { id: 'm12-7', ageMonths: 12, category: 'social', title: 'Tchau', description: 'Acena tchau quando solicitado' },
  { id: 'm12-8', ageMonths: 12, category: 'social', title: 'Imita gestos', description: 'Imita gestos simples (bater palmas)' },

  // ── 18 Meses ────────────────────────────
  { id: 'm18-1', ageMonths: 18, category: 'motor', title: 'Anda sozinho', description: ' Anda sozinho sem apoio' },
  { id: 'm18-2', ageMonths: 18, category: 'motor', title: 'Sobe degraus', description: 'Sobe degraus baixos com ajuda' },
  { id: 'm18-3', ageMonths: 18, category: 'cognitive', title: 'Rabisca', description: 'Rabisca no papel com lápis/giz' },
  { id: 'm18-4', ageMonths: 18, category: 'language', title: 'Fala 3+ palavras', description: 'Fala 3 ou mais palavras' },
  { id: 'm18-5', ageMonths: 18, category: 'language', title: 'Aponta partes', description: 'Aponta partes do corpo quando perguntado' },
  { id: 'm18-6', ageMonths: 18, category: 'social', title: 'Aponta para mostrar', description: 'Aponta objetos para chamar atenção' },

  // ── 24 Meses ────────────────────────────
  { id: 'm24-1', ageMonths: 24, category: 'motor', title: 'Chuta bola', description: 'Chuta uma bola sem apoio' },
  { id: 'm24-2', ageMonths: 24, category: 'motor', title: 'Sobe/desce degraus', description: 'Sobe e desce degraus segurando no corrimão' },
  { id: 'm24-3', ageMonths: 24, category: 'cognitive', title: 'Frases de 2 palavras', description: 'Fala frases curtas de 2 palavras' },
  { id: 'm24-4', ageMonths: 24, category: 'cognitive', title: 'Segue 2 passos', description: 'Segue instruções de 2 passos (pegue a bola e me dê)' },
  { id: 'm24-5', ageMonths: 24, category: 'language', title: 'Fala 50+ palavras', description: 'Tem um vocabulário de 50 palavras ou mais' },
  { id: 'm24-6', ageMonths: 24, category: 'social', title: 'Brinca ao lado', description: 'Brinca ao lado de outras crianças' },

  // ── 36 Meses ────────────────────────────
  { id: 'm36-1', ageMonths: 36, category: 'motor', title: 'Pula', description: 'Pula com os dois pés simultaneamente' },
  { id: 'm36-2', ageMonths: 36, category: 'motor', title: 'Sobe escadas alternando', description: 'Sobe escadas alternando os pés' },
  { id: 'm36-3', ageMonths: 36, category: 'cognitive', title: '"Por quê?"', description: 'Pergunta frequentemente "por quê?"' },
  { id: 'm36-4', ageMonths: 36, category: 'language', title: 'Frases completas', description: 'Fala frases de 3 a 4 palavras' },
  { id: 'm36-5', ageMonths: 36, category: 'language', title: 'Conversa', description: 'Consegue manter pequenas conversas' },
  { id: 'm36-6', ageMonths: 36, category: 'social', title: 'Banheiro', description: 'Pede para ir ao banheiro' },
]

export const ageGroups = [
  { months: 2, label: '2 meses' },
  { months: 4, label: '4 meses' },
  { months: 6, label: '6 meses' },
  { months: 9, label: '9 meses' },
  { months: 12, label: '12 meses' },
  { months: 18, label: '18 meses' },
  { months: 24, label: '24 meses' },
  { months: 36, label: '36 meses' },
]

export function getMilestonesForAge(babyAgeMonths: number): { current: MilestoneDef[]; previous: MilestoneDef[]; next: MilestoneDef[] } {
  const sorted = [...ageGroups].sort((a, b) => a.months - b.months)
  let currentAge = sorted[0].months
  let prevAge: number | null = null
  let nextAge: number | null = sorted.length > 1 ? sorted[1].months : null

  for (let i = 0; i < sorted.length; i++) {
    if (babyAgeMonths >= sorted[i].months) {
      currentAge = sorted[i].months
      prevAge = i > 0 ? sorted[i - 1].months : null
      nextAge = i < sorted.length - 1 ? sorted[i + 1].months : null
    }
  }

  return {
    current: milestones.filter(m => m.ageMonths === currentAge),
    previous: prevAge ? milestones.filter(m => m.ageMonths === prevAge) : [],
    next: nextAge ? milestones.filter(m => m.ageMonths === nextAge) : [],
  }
}

export function getAgeGroupLabel(months: number): string {
  return ageGroups.find(g => g.months === months)?.label ?? `${months} meses`
}

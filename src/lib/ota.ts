export interface Channel {
  id: string
  name: string
  /** comissão da OTA sobre a diária, em % */
  commission: number
  enabled: boolean
}

export interface Inputs {
  /** diária publicada, em R$ */
  price: number
  /** noites vendidas por mês */
  nights: number
  /** custo de recebimento na venda direta (gateway/PIX), em % */
  directCost: number
  channels: Channel[]
}

export interface ChannelResult {
  id: string
  name: string
  commission: number
  feePerNight: number
  netPerNight: number
  feeMonthly: number
  netMonthly: number
  /** diária direta que entrega o mesmo líquido que este canal */
  breakEvenDirectPrice: number
  /** desconto máximo na venda direta sem perder dinheiro vs. este canal, em % */
  breakEvenDiscount: number
}

export const DEFAULT_CHANNELS: Channel[] = [
  { id: 'booking', name: 'Booking.com', commission: 15, enabled: true },
  { id: 'expedia', name: 'Expedia', commission: 18, enabled: true },
  { id: 'airbnb', name: 'Airbnb', commission: 15.5, enabled: true },
  { id: 'decolar', name: 'Decolar', commission: 17, enabled: true },
]

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))

export function netAfterFee(price: number, feePct: number): number {
  return price * (1 - clamp(feePct, 0, 99) / 100)
}

/** Diária a publicar para que o líquido seja `target` depois da comissão. */
export function grossUp(target: number, feePct: number): number {
  return target / (1 - clamp(feePct, 0, 99) / 100)
}

/** Desconto direto (%) em que o líquido empata com o do canal. */
export function breakEvenDiscount(commissionPct: number, directCostPct: number): number {
  const c = clamp(commissionPct, 0, 99) / 100
  const k = clamp(directCostPct, 0, 99) / 100
  return (1 - (1 - c) / (1 - k)) * 100
}

export function calculate(input: Inputs): { channels: ChannelResult[]; direct: { netPerNight: number; netMonthly: number } } {
  const price = Math.max(0, input.price || 0)
  const nights = Math.max(0, Math.round(input.nights || 0))

  const channels = input.channels
    .filter((c) => c.enabled)
    .map<ChannelResult>((c) => {
      const net = netAfterFee(price, c.commission)
      const disc = breakEvenDiscount(c.commission, input.directCost)
      return {
        id: c.id,
        name: c.name,
        commission: c.commission,
        feePerNight: price - net,
        netPerNight: net,
        feeMonthly: (price - net) * nights,
        netMonthly: net * nights,
        breakEvenDirectPrice: price * (1 - disc / 100),
        breakEvenDiscount: disc,
      }
    })

  const directNet = netAfterFee(price, input.directCost)
  return { channels, direct: { netPerNight: directNet, netMonthly: directNet * nights } }
}

export const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

export const brlRound = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

export const pct =(n: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(n) + '%'

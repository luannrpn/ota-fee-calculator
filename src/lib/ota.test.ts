import { describe, expect, it } from 'vitest'
import { breakEvenDiscount, calculate, DEFAULT_CHANNELS, grossUp, netAfterFee } from './ota'

describe('ota', () => {
  it('desconta a comissão da diária', () => {
    expect(netAfterFee(200, 15)).toBeCloseTo(170)
  })

  it('grossUp inverte netAfterFee', () => {
    expect(netAfterFee(grossUp(170, 15), 15)).toBeCloseTo(170)
  })

  it('desconto de equilíbrio sem custo direto é igual à comissão', () => {
    expect(breakEvenDiscount(15, 0)).toBeCloseTo(15)
  })

  it('desconto de equilíbrio considera o custo de recebimento direto', () => {
    // 1 - 0.85 / 0.97
    expect(breakEvenDiscount(15, 3)).toBeCloseTo(12.371, 2)
  })

  it('calcula mensal e preço direto de equilíbrio', () => {
    const r = calculate({ price: 200, nights: 100, directCost: 0, channels: DEFAULT_CHANNELS.slice(0, 1) })
    expect(r.channels[0].feeMonthly).toBeCloseTo(3000)
    expect(r.channels[0].breakEvenDirectPrice).toBeCloseTo(170)
    expect(r.direct.netMonthly).toBeCloseTo(20000)
  })

  it('ignora canais desativados e entradas inválidas', () => {
    const channels = DEFAULT_CHANNELS.map((c, i) => ({ ...c, enabled: i === 0 }))
    const r = calculate({ price: NaN, nights: -4, directCost: 0, channels })
    expect(r.channels).toHaveLength(1)
    expect(r.channels[0].netMonthly).toBe(0)
  })
})

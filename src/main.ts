import '@fontsource-variable/instrument-sans'
import './styles/main.css'
import { brl, brlRound, calculate, DEFAULT_CHANNELS, grossUp, pct, type Channel } from './lib/ota'
import { countTo, initMotion } from './motion'

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T

const channels: Channel[] = DEFAULT_CHANNELS.map((c) => ({ ...c }))
const num = (id: string) => parseFloat($<HTMLInputElement>(id).value) || 0

function renderChannelInputs() {
  $('channel-list').innerHTML = channels
    .map(
      (c) => `
      <div class="ch">
        <input type="checkbox" id="on-${c.id}" ${c.enabled ? 'checked' : ''} />
        <label for="on-${c.id}">${c.name}</label>
        <div class="pct">
          <input type="number" id="fee-${c.id}" aria-label="Comissão ${c.name} em porcentagem" min="0" max="50" step="0.5" value="${c.commission}" />
          <span>%</span>
        </div>
      </div>`,
    )
    .join('')

  channels.forEach((c) => {
    $<HTMLInputElement>(`on-${c.id}`).addEventListener('change', (e) => {
      c.enabled = (e.target as HTMLInputElement).checked
      update()
    })
    $<HTMLInputElement>(`fee-${c.id}`).addEventListener('input', (e) => {
      c.commission = Math.min(50, Math.max(0, parseFloat((e.target as HTMLInputElement).value) || 0))
      update()
    })
  })
}

function update() {
  const price = num('price')
  const nights = num('nights')
  const directCost = num('direct')
  const res = calculate({ price, nights, directCost, channels })

  // total pago às OTAs: soma das comissões, assumindo as noites divididas igualmente entre os canais ativos
  const n = res.channels.length
  const totalFee = n ? res.channels.reduce((s, c) => s + c.feeMonthly, 0) / n : 0
  countTo($('total-fee'), totalFee, brlRound)
  $('total-fee-sub').textContent = n
    ? `Com as ${nights} noites divididas entre ${n} canal(is). Em um ano: ${brl(totalFee * 12)}.`
    : 'Ative pelo menos um canal.'

  $('rows').innerHTML = n
    ? res.channels
        .map(
          (c) => `
        <li class="row">
          <div class="row-head"><strong>${c.name}</strong><span>${pct(c.commission)} · ${brl(c.feePerNight)} por noite</span></div>
          <div class="bar" role="img" aria-label="Você recebe ${pct(100 - c.commission)} da diária"><i style="--net:${(c.netPerNight / (price || 1)).toFixed(4)}"></i></div>
          <div class="legend"><span>Líquido <b>${brl(c.netPerNight)}</b>/noite</span><span>Mês <b>${brl(c.netMonthly)}</b></span></div>
        </li>`,
        )
        .join('')
    : '<li class="empty">Nenhum canal ativo.</li>'

  $('eq-list').innerHTML = res.channels
    .map(
      (c) => `
      <li class="eq-item">
        <div><h3>${c.name}</h3><p>Reserva direta a ${brl(c.breakEvenDirectPrice)} rende o mesmo líquido que ${brl(price)} na OTA.</p></div>
        <span class="num">${pct(c.breakEvenDiscount)}</span>
      </li>`,
    )
    .join('')

  const target = num('target')
  $('target-list').innerHTML = channels
    .filter((c) => c.enabled)
    .map((c) => `<li><span>${c.name}</span><strong>${brl(grossUp(target, c.commission))}</strong></li>`)
    .concat(`<li><span>Venda direta</span><strong>${brl(grossUp(target, directCost))}</strong></li>`)
    .join('')
}

renderChannelInputs()
;['price', 'nights', 'direct', 'target'].forEach((id) => $(id).addEventListener('input', update))
update()
initMotion()

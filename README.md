# OTA Fee Calculator

Calculadora de taxas de OTAs para pequenos hotéis e pousadas. Mostra quanto Booking, Expedia, Airbnb e Decolar levam da diária, o líquido por noite e por mês, e quanto desconto dá para oferecer na reserva direta sem perder dinheiro.

**Demo:** https://luannrpn.github.io/ota-fee-calculator/

## O que faz

- **Custo mensal das OTAs** a partir da diária, noites vendidas e comissão de cada canal (editável).
- **Desconto de equilíbrio no direto:** `1 − (1 − comissão) / (1 − custo de recebimento)`.
- **Preço alvo:** quanto publicar em cada canal para receber um líquido desejado.
- 100% client-side: nada é enviado a servidor algum.

As comissões padrão são valores de referência. Confira o contrato de cada canal.

## Rodar localmente

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes das fórmulas (vitest)
npm run build    # build de produção
```

## Tecnologias

Vite, TypeScript, GSAP + ScrollTrigger, Lenis e [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) (via `@fontsource-variable/instrument-sans`, licença OFL).

## Autoria

Autor: **Luann Neves** ([@luannrpn](https://github.com/luannrpn)). Veja [AUTHORS.md](AUTHORS.md), [LICENSE](LICENSE) (MIT) e [CITATION.cff](CITATION.cff).

import { describe, it, expect } from 'vitest'
import {
  TIPUS_LABELS,
  ENCARREGAT_LABELS,
  ENCARREGAT_COLORS,
} from '../treballadors'

describe('TIPUS_LABELS', () => {
  it('retorna etiqueta correcta per cada tipus', () => {
    expect(TIPUS_LABELS['oficial']).toBe('Oficial 1a')
    expect(TIPUS_LABELS['oficial_2a']).toBe('Oficial 2a')
    expect(TIPUS_LABELS['peo']).toBe('Peó')
    expect(TIPUS_LABELS['altre']).toBe('Altre')
  })
})

describe('ENCARREGAT_LABELS', () => {
  it('retorna les etiquetes correctes per nandu i pare', () => {
    expect(ENCARREGAT_LABELS['nandu']).toBe('Equip Nandu')
    expect(ENCARREGAT_LABELS['pare']).toBe('Equip Pare')
  })
})

describe('ENCARREGAT_COLORS', () => {
  it('retorna classes de color per nandu', () => {
    expect(ENCARREGAT_COLORS['nandu']).toContain('stone')
  })

  it('retorna classes de color per pare', () => {
    expect(ENCARREGAT_COLORS['pare']).toContain('amber')
  })

  it('els dos valors son strings no buits', () => {
    expect(ENCARREGAT_COLORS['nandu']).toBeTruthy()
    expect(ENCARREGAT_COLORS['pare']).toBeTruthy()
  })
})

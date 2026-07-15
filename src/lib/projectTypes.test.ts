import { describe, expect, it } from 'vitest'
import { asStoredProject, projectToRow, rowToStoredProject } from '../../api/_lib/projectTypes'

describe('projectTypes', () => {
  it('strips icon fields when converting to a DB row', () => {
    const stored = asStoredProject({
      id: 'p1',
      name: 'Demo',
      url: 'https://demo.dev',
      description: 'd',
      status: 'ready',
      analyzedAt: '2026-07-15T00:00:00.000Z',
      sourceCount: 1,
      nodes: [{ id: 'n1', title: 'A', icon: () => null }],
      edges: [],
      docs: [],
      sources: [],
    })
    const row = projectToRow(stored)
    expect((row.nodes as Array<Record<string, unknown>>)[0].icon).toBeUndefined()
    expect(rowToStoredProject(row).id).toBe('p1')
  })
})

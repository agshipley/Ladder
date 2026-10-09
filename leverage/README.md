# Leverage

The leverage layer offers a company automation it is ready for. Its board is the qualification
engine: each automation opportunity has prerequisites expressed as board areas, and a deterministic
resolver checks them against the company's actual verdicts.

| File | What it is |
|---|---|
| [`MENU-CATALOG.md`](MENU-CATALOG.md) | The ten automation opportunities: what each one is, its prerequisites, disposition logic and delivery options |
| [`RESOLVER-MAPPING.md`](RESOLVER-MAPPING.md) | How each board state resolves a prerequisite, and how an item becomes *available*, *not yet*, *not offered* or *pilot* |
| [`rung-closure.json`](rung-closure.json) | For each prerequisite, whether Ladder can draft the missing piece or it is the company's own action |
| [`templates/menu.html`](templates/menu.html) | The customer-facing menu surface |

The resolver itself is [`scripts/leverage/resolve-menu.ts`](../scripts/leverage/resolve-menu.ts). It
reads a board run and a short intake, then writes the resolved menu. Each "not yet" lists every
unmet prerequisite and links back to the board tile that gates it.

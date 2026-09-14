// GTD draw blueprint — server-side only.
//
// Run only after a project reaches ends_at.
// 1. Load all verified mission_submissions for the project.
// 2. Exclude users already selected.
// 3. Read project.gtd_slots.
// 4. Randomly choose min(gtd_slots, eligible.length).
// 5. Insert winners into gtd_winners in one transaction.
// 6. Lock the project draw so it cannot be run twice.
//
// Never select winners in browser JavaScript.
// Never trust a client-provided winner list.
//
// For stronger auditability, store:
// - draw_started_at
// - eligible_count
// - winner_count
// - draw_seed / randomness method
// - completed_at
// in a separate draw_audits table.

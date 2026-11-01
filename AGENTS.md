# Bellewood project workflow

Project context and brand guidance live in `AGENT.md`. The user's current
instructions take precedence over older implementation notes.

## Git checkpoints

The project owner requested on 1 November 2026 that substantial website updates
be committed and pushed to the existing GitHub repository so they can be accessed
and reverted later. This is an ongoing workflow preference.

- Before a substantial experiment, save the current working version as a checkpoint
  if it contains unsaved project changes. Preserve existing work.
- After each substantial completed update, review the diff, run the checks relevant
  to that update, and create a descriptive commit. Build website changes before
  calling a checkpoint verified.
- Push completed checkpoints to the intended branch on the existing `origin`.
  Verify the remote contains the commit, then report the short commit ID/link.
  If pushing fails, distinguish the local checkpoint from the remote backup.
- Keep separate updates in separate commits. Do not invent historical checkpoints
  for earlier changes that were never committed.
- Prefer a new revert commit when undoing a shared update. Do not force-push,
  rewrite shared history, or discard unrelated working changes.
- Keep `Knowledge/`, `crm/`, original `src/assets/project_photos/`, `.tmp/`, secrets,
  dependencies and build output out of commits. Commit the approved, anonymously
  named web assets needed to build a fresh checkout.
- Committing and pushing source is not permission to deploy the public website.

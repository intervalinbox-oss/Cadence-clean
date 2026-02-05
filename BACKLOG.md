# Cadence product backlog

Items here are for post-MVP or when we have capacity. Not in priority order unless noted.

---

## User profile & personalization

- **Optional profile (department, function, role)**  
  Add optional “About you” fields (e.g. in Settings or onboarding): department, function, role. Use for segmentation and future personalization. Keep signup minimal; profile is optional.

- **Personalization by role/function (post-MVP)**  
  If we see clear use cases (e.g. different defaults or copy by role), use profile data to personalize recommendations, tips, or benchmarks. Depends on having optional profile and enough usage to segment.

- **User research: role/department**  
  Collect role/department via separate channels (short survey, interview screener, or optional in-app profile), not as required signup fields. Use for research and prioritization, not for blocking MVP.

---

## Suggest improvements (in-app)

- **Suggestions / feedback area**  
  In-app area where users can suggest improvements (e.g. `/feedback` or “Suggest an improvement” in nav). Form submits to Firestore `suggestions` for review. Implemented: page + nav link + Firestore write; backlog: triage process, optional “we’re considering this” updates.

---

## Other ideas

- **Optional display name**  
  Store optional name for “Hi, [name]” and in generated content. Low effort; improves perceived personalization without role/department.

- **Benchmarks or insights by segment**  
  After we have optional profile and enough data, show comparisons like “People in your function usually choose meeting for X” (anonymized). Post-MVP.

---

## Notes

- MVP does not require department, function, or role for the product to succeed; recommendations are scenario-based.
- Keep signup and core flow minimal; add optional profile and suggestions so we can learn without adding friction.

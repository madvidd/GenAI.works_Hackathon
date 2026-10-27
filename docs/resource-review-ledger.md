# Resource review ledger

Review date: **27 October 2026**. Sources were accessed through the signed-in [HackOS dashboard](https://hackathon.genai.works/dashboard). This ledger records reading coverage and interpretation, not completion of the required engineering work. Authenticated source documents are not redistributed in this public repository.

## Completed full-text reading

| Resource | Coverage | Consequential finding |
| --- | --- | --- |
| Participant Setup Guide | All 30 PDF pages; key REST and Nightshift code visually checked | Local Zetaris setup; documented REST payload; Nightshift URL/token and NVIDIA provider placement |
| Zetaris Scoring Methodology | Entire one-page PDF | 3+ sources, per-source exploration, USL, DQ execution, three reflections |
| Pre-Submission Self-Check (`disqualification-checklist.md`) | Full document | Current mandatory stack, executable sample mode, trace integrity, tested engine feature |
| Team Formation Rules | Full document | 1–5, one team/submission, roster lock at first submission, accurate contributor information |
| Code of Conduct | Full document | Fair conduct, permission for personal likeness/content, no unsafe or unauthorized use |
| AI Usage Policy | Full document | AI coding allowed; tool/third-party/data/limitation disclosure; no fabricated traces or outputs |
| Weak Submission Examples | Full document | Decorative integration, generic outputs, inaccessible demos, and fake agent collaboration fail the intended bar |
| Submission Form Preview | Full document | Project, track, contributors/contact, repo, applicable Colab, video, deck, sponsor and pre-existing work fields |
| Strong Submission Examples | Full document | Evidence-validating critic, rejection authority, useful bounded output, reproducibility |
| Demo Video Guide | Full document | Audio required; 1–4 minutes; show actual operation and sponsor evidence; 2:30–3:30 recommended |
| Mentor Playbook | Full document | Scope tightly, cap loops, prioritize runnable evidence; contains stale stack guidance |
| Mentor Office Hours Guide | Full document | Clean clone, programmatic path, sample mode, real logs, support triage |
| Troubleshooting Guide | Full document | Timeouts, budgets, Docker host networking, exact Zetaris REST body; some older provider examples |
| Help Desk Guide | Full document | Support routing, redacted error evidence, no secret posting; old Cursor checklist |
| Escalation Path | Full document | Rules/platform/private concerns go through organizers; timestamp final submission artifacts |
| Community Moderation Guide | Full document | Current announcements govern clarification; old Cursor/provider sections conflict with newer docs |
| Channel Directory / Where to Get Help | Full document | HackOS is event support; source authority and deadline; old Cursor requirement |
| Winner Next Steps | Full document | Nov 6 results; post-award materials and retained public repo; current Nightshift/Nemotron language |
| NVIDIA Sponsor Overview | Full document | Disclose actual role in README and metadata; access section still TBC |
| Cursor Sponsor Overview | Full document | Disclose only actual tool use; access section still TBC |
| Meterless Sponsor Overview | Full document | Engines/index links and metadata attribution |
| Vibe Coding Starter Guide | Full document | Current stack, Cursor optional, meaningful engine feature test, actual returned model logging |
| Creating Better Agents / Day 4 Weekly Check-In | All 19 PDF pages, including image-only instructor content | Explicit bounded loop specification, tool failure modes, stop conditions, and an accuracy/appropriateness/actionability review rubric |
| Participant Orientation | All 16 PDF pages | Confirms track wording, rubric, at least three judges, and Impact then submission-time tie break; older sponsor and prize text is superseded |
| Five GitHub Repositories | All 7 image-only PDF pages rendered and read | Optional Appwrite, Supabase, PocketBase, Coolify, and n8n examples; no new required technology |

Coverage above: **20 Markdown documents and 5 PDFs**.

## Recording transcript review

The complete available auto-generated English text was read for each recording below. This is transcript review, not a claim that every video frame was watched. Transcription errors in names and SQL identifiers were checked against the written sources; examples are not treated as new binding rules. Copyrighted transcripts stay outside this public repository.

| Recording | Coverage | Consequential finding |
| --- | --- | --- |
| [Zetaris Getting Started Repository Walkthrough](https://www.youtube.com/watch?v=jnMyNKTyqmw) | Entire supplied transcript, 7:23 | Use connection/preflight helpers, create/select pairs, manifest status and known-to-fail source guidance; the JDBC driver comes from the installation |
| [Zetaris Create a REST Source](https://www.youtube.com/watch?v=eRJ2PGfArUk) | Entire supplied transcript, 13:27 | Register raw REST JSON, explicitly flatten nested fields, verify row counts, explore with meaningful questions, and inspect query plans; caching trades freshness for repeated-query speed |
| [Creating and Analysing a Semantic Layer with Claude Code](https://www.youtube.com/watch?v=NCf_0dO1HsI) | Entire supplied transcript, 14:35 | Dry-run onboarding, execute source/USL activation, verify row counts and DQ failures, then independently compare the rendered topology with actual platform objects; a failed DQ row is useful evidence, not something to hide |
| [Data Day with Zetaris](https://iframe.mediadelivery.net/embed/778121/aeb37722-34b9-4222-841c-a6c6651ff60e) | Entire English caption track, 42,535 text characters after cue removal | USL is a named model plus relationships and activation SQL; focus on an actionable business question, govern freshness/permissions, separate application runtime from the data platform, and practice setup before judging |

Data Day is an earlier workshop. Its references to unpublished challenges, pre-event dates and older track descriptions do not override current rules. Speaker anecdotes about lines of code, customer infrastructure and savings are not measurements for TraceHarbor and are not reused as project performance claims.

## Additional review streams

The dashboard's official rules, announcements, track statements, current judging rubric, submission instructions, and sponsor resources are reviewed separately in the build session. Public implementation references include the [Zetaris getting-started repository](https://github.com/zetaris/getting-started) and [Meterless engine repository](https://github.com/Meterless/Meterless). See source revisions in the architecture/sponsor documents.

**Review limits:** six Bunny-hosted recordings did not expose accessible captions in the inspected player: Opening Ceremony; Onboarding; Power Day with Meterless and NVIDIA; Build Day with Cursor and Meterless; Build with Meterless and Cursor Session 2; and Onboarding Call. Their spoken contents remain unreviewed. The other four recording transcripts and all supplied decks have been reviewed as listed. Additional engine source documents are handled in the implementation review stream. This ledger must not be described as proof that every video was watched or every linked resource was readable.

## Conflicts resolved

| Conflict | Interpretation used |
| --- | --- |
| Older mentor guidance says sponsor technology is optional | Current rules and recent self-check/Vibe/AI policy require Zetaris, a working Meterless Engine, and Nightshift as primary provider |
| Older setup/community/help/preview text says Cursor required | Current AI Usage Policy and Vibe Coding guide explicitly allow other coding tools; disclose Codex and do not claim Cursor |
| Older direct NVIDIA examples vs Nightshift requirement | Product requests go through Nightshift; provider key remains in Nightshift; record the actual returned model |
| Mentor/office-hour registration says 23:59 vs current 23:45 | Current rules/announcements control; submission deadline consistently 27 Oct, 23:45 UTC |
| Some checklists suggest a 2–3 minute video | Binding range is 1–4 minutes; target three with audio |
| `meterless/auto` treated as NVIDIA proof | An alias is insufficient; retain the model returned by each real request |
| Sample mode vs real sponsor requirement | Sample mode is a reproducibility path with real local logic; real sponsor integration still needs separate execution evidence |
| Orientation deck lists $15,000 cash / $5,000 in-kind rewards | Newer Winner Next Steps and current rules list $13,000 cash / $7,000 in-kind; the current official terms control |

No source guarantees a win. The reviewed guidance explicitly warns against promises about judging outcomes. The project is aligned to published criteria and must earn its claims through working evidence.

## Final platform check

The signed-in dashboard and the latest hackathon-wide announcement were rechecked at approximately 20:04 UTC on 27 October. The organizer's 17:18 announcement explicitly confirms **23:45 UTC tonight** and says judges see the last submitted version. The dashboard still contains an older 23:59 status line alongside its 23:45 upcoming deadline; this project continues to use the earlier cutoff. The dashboard showed two Vengers members and **submission not started**. No submission was created by the build workflow. The already-reviewed required Zetaris scoring guide was marked read.

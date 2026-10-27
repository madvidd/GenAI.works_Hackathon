# Final judges-readiness check

[Project overview](../README.md) · [Submitted entry](submission-confirmation.md) · [Presentation assets](../submission/README.md)

**Result: no blocking issues found in the checks below.** Verification finished on **27 October 2026 at 23:03 UTC**. The tested repository revision is `43b39d3c4834f8bb48cabc1cf10456f8d7b956f9`; the application, data and presentation artifacts are unchanged from the deployed release. The later documentation commit publishes these results and corrects three wording inconsistencies.

| Area | Final verification | Evidence |
| --- | --- | --- |
| HackOS | The saved entry shows Submitted 1 / 1 under The Agent That Can Explain Why. Team, description, sponsor explanation, video, repository and deck fields match the archived submission. | [Browser receipt](judges-final-browser-validation.json), [submitted fields](../submission/hackos-entry.json) |
| Website | All four cases, search, source inspection, evidence withholding/reset, recomputation, dossier download, dataset export/import, edited readings, restoration, navigation and 320px layout passed. No browser error logs were observed. | [Browser receipt](judges-final-browser-validation.json) |
| Repository | Public, readable while logged out, with loaded README images. A fresh isolated clone passed all 33 tests, the production build and four sample CLI cases. All 14 hosted files matched the fresh build by bytes, SHA-256 and expected MIME type. | [Technical receipt](judges-final-technical-validation.json) |
| Video | The uploaded HackOS player ran beyond 45 seconds at 1920×1080 without a media error. The canonical 188.48-second MP4 passed complete decoding, audio checks, 42-caption timing checks and review of all nine scene frames. | [Browser receipt](judges-final-browser-validation.json), [media receipt](judges-final-media-validation.json) |
| Pitch deck | All eight PDF pages were rendered and reviewed. The editable PowerPoint passed package/XML/layout checks and contains eight speaker-note sections and two native tables. Public PDF/PPTX files match the reviewed originals. | [Media receipt](judges-final-media-validation.json), [technical receipt](judges-final-technical-validation.json) |

## Corrections made during this review

The release notes and submission checklist now distinguish the eight tasks open at submission from the later **six Done and two optional** board state. The requirements matrix now distinguishes the portal's expected one entry from its capacity for three entries on different tracks. TraceHarbor has one submitted entry. No application, dataset, video, deck or HackOS submission field needed changing.

## Scope of readiness

The public website performs deterministic analysis on synthetic records. Running the actual Zetaris, World Model and Nightshift agent requires the documented local services. The final audit did not make fresh sponsor requests; [archived actual live runs](live-revision-validation.json) retain their own execution evidence.

Dependency installation used the existing npm cache in a new checkout; it did not test uncached registry downloads. Video playback in the browser was a smoke check, complemented by full canonical-file decoding, not uninterrupted human audiovisual review. The submitted PDF is image-based; its slide text and links are not selectable. The PowerPoint retains editable text and notes, but native Microsoft PowerPoint rendering was not tested. The deck's `logs/runs` reference describes locally generated output; public examples are in [examples](../examples/README.md).

The two optional board follow-ups are a mentor check-in and a human presentation rehearsal. Neither is recorded as completed. Technical readiness does not establish a judging result or guarantee an award.

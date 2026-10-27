# Published release verification

[Project overview](../README.md) · [Evidence guide](evidence-guide.md) · [Submission checklist](submission-checklist.md)

The verified source and presentation-artifact commit is [`1c71b1cfdd051119f347443ef4d9209b652478ca`](https://github.com/madvidd/GenAI.works_Hackathon/commit/1c71b1cfdd051119f347443ef4d9209b652478ca), published on `main`. It contains analysis version **1.0.2**, the redesigned interface and the reviewed MP4/SRT/PDF/PPTX files. The public application is [traceharbor.web.app](https://traceharbor.web.app).

## What was verified

| Check | Observed result | Receipt |
| --- | --- | --- |
| Isolated remote clone | Exact commit checked out from the expected GitHub origin; clean before and after verification; no private environment file or sponsor environment variables | [Clone receipt](clean-clone-redesign-validation.json) |
| Dependency installation and build | Node 24.22.1; fresh `npm ci --offline --no-audit --no-fund`; production build passed | [Clone phases](clean-clone-redesign-validation.json) |
| Regression suite | 33 passed, zero failed | [Test result](clean-clone-redesign-validation.json) |
| Four sample CLI cases | Excursion, sensor bias, insufficient evidence and within-range outcomes; all citations resolved; each consumed 46 World Model records with zero model/SQL calls | [Sample results](clean-clone-redesign-validation.json) |
| Public files | All 14 production-build files returned HTTP 200 and matched their intended SHA-256 hashes, including all four feeds and all four presentation artifacts | [Deployment receipt](deployment-redesign-validation.json) |
| Public interaction smoke checks | Search, citation drawer, withholding/reset, sample recomputation/export, runtime disclosure, disabled local-live mode on Firebase, 320px layout and browser error logs checked | [Public deployment section](ui-validation.json) |
| Public repository presentation | Logged-out README inspection confirmed the banner, workspace image and rendered Mermaid diagram | [Actual GitHub capture](images/published-readme.png) |
| Public video playback | 1920×1080, 188.480 seconds; playback observed past 23.25 seconds and paused at 41.08 seconds without a media error | [Browser playback record](ui-validation.json) |

The clone completed at **21:38:55 UTC on 27 October 2026**. The file comparison completed at **21:39:05 UTC**, followed by public browser checks. Offline dependency installation used the existing npm package cache to create a fresh `node_modules` directory; it was not a test of uncached package downloads.

The browser record distinguishes 28 earlier interaction groups from five targeted final regressions and the final public smoke checks. It does not imply that every earlier interaction was repeated after every edit. Full video/audio decoding and all nine scene layouts were separately checked; public playback was a smoke test, not uninterrupted human audiovisual review. Native Microsoft PowerPoint rendering remains unverified; all eight slide renders and exported PDF pages were reviewed.

## Why receipt commits follow the source commit

Verification identifies the source/artifact commit above. The resulting receipts can only be written after those checks finish, so subsequent commits that add receipts, metadata and explanatory Markdown document that tested commit. Their different Git hashes do not imply a different deployed application, and they must not be described as having independently rerun the application checks.

The receipt fields `commit` and `sourceCommit` remain the authoritative tested identities. Any later change to application code, dependencies, fixtures or public artifacts requires its own applicable checks and deployment comparison. Earlier `ca1f6b7` [clone](clean-clone-validation.json) and [deployment](deployment-validation.json) receipts remain unchanged historical records.

## Boundaries that remain

The hosted application performs deterministic sample computation on synthetic data. Actual local sponsor execution is separately recorded in [final TH-1042](../examples/live-agent/attempt-06-final-decimal/) and [final TH-1043](../examples/live-agent/attempt-07-final-abstention/) runs. These use the same 1.0.2 evidence core; their manifests retain the browser assets and timings actually observed at execution, while later interface guards have separate tests.

Four feeds on one demonstration host do not establish production federation across independent providers. Two current live scenarios do not establish broad reliability, and no measured analyst-time saving, customer adoption, commercial return or guaranteed competition outcome is claimed.

The official entry is now **submitted**, separately confirmed after reload at **22:13 UTC on 27 October 2026**. This observation time is not a server submission timestamp. Contributor roles and Seyed Mohammad Salehi’s primary-contact role are confirmed; the actual form had no separate contact or email fields. [The submission record](submission-confirmation.md) preserves the portal status and submitted links. Eight starter tasks were open at submission; the [later board review](board-review.md) verified six Done and two optional follow-ups.

# TraceHarbor documentation

Start with the question you want to answer.

| I want to… | Read |
| --- | --- |
| Understand the problem and practical value | [Project overview](../README.md) |
| Walk through an investigation as an analyst | [Product guide](product-guide.md) |
| Run the sample or configure actual local services | [Getting started](getting-started.md) |
| Understand model decisions, evidence rules and API boundaries | [Architecture](architecture.md) |
| Inspect the source records and calculation assumptions | [Data contract](../data/README.md) |
| Register sources, activate the USL and inspect data quality | [Zetaris SQL setup](../sql/README.md) |
| Configure the verified local inference lane | [Nightshift local model](local-model-setup.md) |
| Check what actually ran | [Evidence guide](evidence-guide.md) · [Example index](../examples/README.md) |
| Verify the published source, website and media | [Release verification](release-validation.md) |
| Assess quality and intended operational value | [Evaluation plan](evaluation.md) |
| Review sponsor contributions and third-party attribution | [Sponsor technology](sponsor-technology.md) |
| Watch or reproduce the presentation artifacts | [Submission assets](../submission/README.md) |

## Hackathon record

[Requirements and rubric](requirements-matrix.md) · [Resource review and limits](resource-review-ledger.md) · [Zetaris reflections](zetaris-reflections.md) · [Submission checklist](submission-checklist.md) · [Demo narration](demo-script.md) · [Slide content](slide-deck.md)

The [official submission confirmation](submission-confirmation.md) records the persisted **Submitted 1 / 1** status observed after reload on **27 October 2026 at 22:13 UTC**. This is an observation time; the server submission timestamp was not displayed. The [submitted form record](../submission/hackos-entry.json) preserves the actual description, sponsor explanation and links.

## How to read verification claims

The [current readiness review](readiness-review.md) tracks implementation checkpoints. The [release verification](release-validation.md) identifies the exact source/artifact commit, isolated clone and public deployment checks; historical receipts retain their original scope.

JSON receipts identify the actual source revision, run, timestamps and scope. A passing historical run does not validate subsequent code changes. Sample execution, mocked transport tests, actual local service execution and public hosting checks are separate kinds of evidence; the [evidence guide](evidence-guide.md) explains the distinction. Never put private tokens in documentation or selected public logs.

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
| Assess quality and intended operational value | [Evaluation plan](evaluation.md) |
| Review sponsor contributions and third-party attribution | [Sponsor technology](sponsor-technology.md) |
| Watch or reproduce the presentation artifacts | [Submission assets](../submission/README.md) |

## Hackathon record

[Requirements and rubric](requirements-matrix.md) · [Resource review and limits](resource-review-ledger.md) · [Zetaris reflections](zetaris-reflections.md) · [Submission checklist](submission-checklist.md) · [Demo narration](demo-script.md) · [Slide content](slide-deck.md)

The official entry is unsubmitted until a platform confirmation is retained. Public source, hosting and presentation assets do not establish submission.

## How to read verification claims

The [current readiness review](readiness-review.md) tracks the revised checkout. It is separate from historical clean-clone, live-service and deployment receipts.

JSON receipts identify the actual source revision, run, timestamps and scope. A passing historical run does not validate subsequent code changes. Sample execution, mocked transport tests, actual local service execution and public hosting checks are separate kinds of evidence; the [evidence guide](evidence-guide.md) explains the distinction. Never put private tokens in documentation or selected public logs.

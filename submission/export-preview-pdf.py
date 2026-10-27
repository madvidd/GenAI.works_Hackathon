"""Package the eight actual artifact-tool slide renders into a 16:9 PDF.

This is a fallback for a missing standard-font module in the Windows PDF
exporter. It does not recreate or modify the PowerPoint presentation.
"""
from pathlib import Path
import sys
from reportlab.pdfgen.canvas import Canvas

build = Path(sys.argv[1]).resolve()
pdf = Canvas(str(build / "traceharbor.pdf"), pagesize=(960, 540))
pdf.setTitle("TraceHarbor — Open Agent Hackathon 2026")
pdf.setAuthor("TraceHarbor")
pdf.setSubject("Eight-slide prototype presentation; synthetic evidence disclosed")
for index in range(1, 9):
    pdf.drawImage(str(build / f"slide-{index}.png"), 0, 0, width=960, height=540)
    pdf.showPage()
pdf.save()
print("PDF packaged from eight original artifact-tool slide renders.")

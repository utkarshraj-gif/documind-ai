import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

workspace_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
output_path = os.path.join(workspace_dir, "sample_service_agreement.pdf")

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    rightMargin=45,
    leftMargin=45,
    topMargin=45,
    bottomMargin=45
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#1C1917"),
    spaceAfter=12
)

heading_style = ParagraphStyle(
    'Heading',
    parent=styles['Heading2'],
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#C2410C"),
    spaceAfter=6
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontSize=9.5,
    leading=14,
    textColor=colors.HexColor("#292524")
)

bold_style = ParagraphStyle(
    'BoldText',
    parent=styles['Normal'],
    fontSize=9.5,
    leading=14,
    textColor=colors.HexColor("#1C1917"),
    fontName="Helvetica-Bold"
)

elements = []

# --- PAGE 1: Master Service Agreement ---
elements.append(Paragraph("MASTER PROFESSIONAL SERVICES AGREEMENT", title_style))
elements.append(Spacer(1, 8))

summary_meta = [
    [Paragraph("<b>AGREEMENT ID:</b>", bold_style), Paragraph("MSA-2026-8804", bold_style),
     Paragraph("<b>EFFECTIVE DATE:</b>", bold_style), Paragraph("October 1, 2026", normal_style := body_style)],
    [Paragraph("<b>SERVICE PROVIDER:</b>", bold_style), Paragraph("Proofline AI Technologies Inc.", normal_style),
     Paragraph("<b>TERM LENGTH:</b>", bold_style), Paragraph("24 Months", normal_style)],
    [Paragraph("<b>CLIENT:</b>", bold_style), Paragraph("Acme Global Logistics Corp.", normal_style),
     Paragraph("<b>ANNUAL VALUE:</b>", bold_style), Paragraph("$120,000 USD", bold_style)],
    [Paragraph("<b>GOVERNING LAW:</b>", bold_style), Paragraph("State of California, USA", normal_style),
     Paragraph("<b>PRIMARY JURISDICTION:</b>", bold_style), Paragraph("San Francisco County", normal_style)],
]

t_meta = Table(summary_meta, colWidths=[110, 160, 110, 140])
t_meta.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FBFBFA")),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E6E6E0")),
]))
elements.append(t_meta)
elements.append(Spacer(1, 14))

elements.append(Paragraph("SECTION 1: SCOPE OF WORK & SERVICES", heading_style))
elements.append(Paragraph(
    "Provider agrees to deploy and maintain its enterprise Document Verification and Grounding Platform "
    "for Client's internal freight and customs audit operations. Services include automated optical character recognition, "
    "deterministic semantic entity extraction, and multi-tenant audit verification with zero hallucination guarantee.",
    body_style
))
elements.append(Spacer(1, 10))

elements.append(Paragraph("SECTION 2: COMPENSATION & PAYMENT SCHEDULE", heading_style))
milestones = [
    [Paragraph("<b>Milestone</b>", bold_style), Paragraph("<b>Description</b>", bold_style), Paragraph("<b>Due Date</b>", bold_style), Paragraph("<b>Amount (USD)</b>", bold_style)],
    ["Phase 1", Paragraph("Architecture Setup & Pipeline Validation", body_style), "Nov 15, 2026", "$30,000"],
    ["Phase 2", Paragraph("Custom Extraction Rules & LLM Fine-Tuning", body_style), "Jan 30, 2027", "$45,000"],
    ["Phase 3", Paragraph("Enterprise Scale Launch & Staff Onboarding", body_style), "Apr 15, 2027", "$45,000"],
    ["", "", Paragraph("<b>Total Contract Value:</b>", bold_style), Paragraph("<b>$120,000</b>", bold_style)],
]
t_miles = Table(milestones, colWidths=[60, 260, 90, 110])
t_miles.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F4F4F0")),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E6E0")),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('ALIGN', (3,0), (3,-1), 'RIGHT'),
]))
elements.append(t_miles)
elements.append(Spacer(1, 10))

elements.append(Paragraph("SECTION 3: CONFIDENTIALITY & DATA PROTECTION", heading_style))
elements.append(Paragraph(
    "Both parties agree that all customer records, shipping manifests, and proprietary neural network weights "
    "constitute Protected Confidential Information. Client data shall never be stored unencrypted and shall never be "
    "utilized to train public foundation models without prior written consent.",
    body_style
))

# --- PAGE 2: Signatures and Warranty ---
elements.append(PageBreak())
elements.append(Paragraph("EXECUTION AND AUTHORIZED SIGNATURES (PAGE 2)", title_style))
elements.append(Spacer(1, 10))

elements.append(Paragraph("SECTION 4: SERVICE LEVEL AGREEMENT (SLA)", heading_style))
elements.append(Paragraph(
    "Provider guarantees 99.9% uptime for the Document Verification API endpoints. "
    "In the event of service degradation exceeding 15 minutes per calendar month, Client is entitled to a 5% billing credit. "
    "All document extraction jobs are guaranteed to complete within 12 seconds per page.",
    body_style
))
elements.append(Spacer(1, 15))

elements.append(Paragraph("SECTION 5: SIGNATURES & RATIFICATION", heading_style))
elements.append(Paragraph(
    "IN WITNESS WHEREOF, the parties hereto have executed this Master Professional Services Agreement "
    "as of the Effective Date written above.",
    body_style
))
elements.append(Spacer(1, 15))

sigs = [
    [Paragraph("<b>FOR PROVIDER:</b><br/>Proofline AI Technologies Inc.", body_style),
     Paragraph("<b>FOR CLIENT:</b><br/>Acme Global Logistics Corp.", body_style)],
    [Paragraph("<br/><br/>_______________________________<br/><b>Elena Rostova</b><br/>Chief Operating Officer", body_style),
     Paragraph("<br/><br/>_______________________________<br/><b>Marcus Vance</b><br/>VP Global Procurement", body_style)],
    [Paragraph("Date: October 1, 2026", body_style),
     Paragraph("Date: October 2, 2026", body_style)]
]
t_sigs = Table(sigs, colWidths=[260, 260])
t_sigs.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
]))
elements.append(t_sigs)

doc.build(elements)

# Also copy sample_invoice.pdf to the root workspace
import shutil
src_invoice = os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_invoice.pdf")
dst_invoice = os.path.join(workspace_dir, "sample_invoice.pdf")
if os.path.exists(src_invoice):
    shutil.copy2(src_invoice, dst_invoice)

print(f"Generated sample agreement: {output_path}")
print(f"Copied sample invoice: {dst_invoice}")

import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

output_dir = os.path.join(os.path.dirname(__file__), "..", "sample_data")
os.makedirs(output_dir, exist_ok=True)
pdf_path = os.path.join(output_dir, "sample_invoice.pdf")

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=40,
    leftMargin=40,
    topMargin=40,
    bottomMargin=40
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontSize=20,
    leading=24,
    textColor=colors.HexColor("#1C1917"),
    spaceAfter=12
)
heading_style = ParagraphStyle(
    'Heading',
    parent=styles['Heading2'],
    fontSize=13,
    leading=16,
    textColor=colors.HexColor("#C2410C"),
    spaceAfter=8
)
normal_style = ParagraphStyle(
    'NormalText',
    parent=styles['Normal'],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#292524")
)
bold_style = ParagraphStyle(
    'BoldText',
    parent=styles['Normal'],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#1C1917"),
    fontName="Helvetica-Bold"
)

elements = []

# --- PAGE 1 ---
elements.append(Paragraph("TAX INVOICE & SERVICE CONTRACT", title_style))
elements.append(Spacer(1, 10))

meta_data = [
    [Paragraph("<b>ISSUER:</b>", bold_style), Paragraph("Example Pvt Ltd", normal_style),
     Paragraph("<b>INVOICE NUMBER:</b>", bold_style), Paragraph("INV-2026-1042", bold_style)],
    [Paragraph("<b>REGISTRATION:</b>", bold_style), Paragraph("CIN: U72200KA2024PTC123456", normal_style),
     Paragraph("<b>ISSUE DATE:</b>", bold_style), Paragraph("17 Sep 2026", normal_style)],
    [Paragraph("<b>ADDRESS:</b>", bold_style), Paragraph("Level 4, Prestige Tech Park, Bangalore 560103", normal_style),
     Paragraph("<b>PAYMENT DUE DATE:</b>", bold_style), Paragraph("17 Oct 2026", normal_style)],
    [Paragraph("<b>BILLED TO:</b>", bold_style), Paragraph("Apex Global Solutions Ltd", normal_style),
     Paragraph("<b>CONTACT PERSON:</b>", bold_style), Paragraph("Rajesh Sharma (Director)", normal_style)],
]

t_meta = Table(meta_data, colWidths=[100, 180, 120, 130])
t_meta.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FBFBFA")),
    ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1C1917")),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E6E6E0")),
]))
elements.append(t_meta)
elements.append(Spacer(1, 15))

elements.append(Paragraph("DELIVERABLES & FINANCIAL BREAKDOWN", heading_style))

items_data = [
    [Paragraph("<b>#</b>", bold_style), Paragraph("<b>Item Description</b>", bold_style), Paragraph("<b>Period</b>", bold_style), Paragraph("<b>Amount (INR)</b>", bold_style)],
    ["1", Paragraph("Proofline AI Verification Engine Integration", normal_style), "Aug 2026", "₹45,000 / INR 30,000"],
    ["2", Paragraph("Cloud Infrastructure Setup & Security Hardening", normal_style), "Aug 2026", "INR 10,000"],
    ["3", Paragraph("Compliance & Deterministic Extraction Audit", normal_style), "Sep 2026", "INR 5,000"],
    ["", "", Paragraph("<b>Subtotal:</b>", bold_style), "INR 45,000"],
    ["", "", Paragraph("<b>Applicable Taxes (0% SEZ):</b>", normal_style), "INR 0"],
    ["", "", Paragraph("<b>Total Amount:</b>", bold_style), Paragraph("<b>₹45,000 (INR 45,000)</b>", bold_style)],
]

t_items = Table(items_data, colWidths=[30, 270, 100, 130])
t_items.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F4F4F0")),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E6E0")),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('ALIGN', (3,0), (3,-1), 'RIGHT'),
    ('BACKGROUND', (2, -1), (3, -1), colors.HexColor("#FFEDD5")),
]))
elements.append(t_items)
elements.append(Spacer(1, 15))

elements.append(Paragraph("TERMS OF PAYMENT", heading_style))
elements.append(Paragraph(
    "1. Payment of the Total Amount of ₹45,000 is strictly due on or before 17 Oct 2026.<br/>"
    "2. Remittance must be made to Example Pvt Ltd via bank wire transfer.<br/>"
    "3. Grounded verification guarantees zero fabricated data in all deliverables.",
    normal_style
))

# --- PAGE 2 ---
elements.append(PageBreak())
elements.append(Paragraph("VERIFICATION & SIGN-OFF SCHEDULE (PAGE 2)", title_style))
elements.append(Spacer(1, 10))

elements.append(Paragraph("AUDIT CONFIRMATION AND COMPLIANCE CERTIFICATION", heading_style))
elements.append(Paragraph(
    "This schedule certifies that Document INV-2026-1042 has been audited and approved "
    "by Example Pvt Ltd and Apex Global Solutions Ltd.<br/><br/>"
    "<b>Authorized Signatories:</b><br/>"
    "• Rajesh Sharma, Managing Director, Example Pvt Ltd<br/>"
    "• Priya Deshmukh, Chief Technology Officer, Apex Global Solutions Ltd<br/><br/>"
    "<b>Payment Wire Reference:</b> HDFC-NEFT-9948271<br/>"
    "<b>Verification Pin:</b> PL-VERIFY-88194",
    normal_style
))

doc.build(elements)
print(f"Sample document successfully generated at: {pdf_path}")

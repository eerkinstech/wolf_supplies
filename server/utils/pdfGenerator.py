from fpdf import FPDF

def generate_order_pdf(order):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Example content
    pdf.cell(200, 10, txt=f"Order ID: {order['orderId']}", ln=True)
    pdf.cell(200, 10, txt=f"Order Date: {order['createdAt']}", ln=True)

    # Add more content as needed
    return pdf.output(dest="S").encode("latin1")
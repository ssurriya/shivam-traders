// src/components/InvoiceTemplate.tsx
import type { Invoice } from "@/lib/types";
import { format } from "date-fns";

function toWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num === 0) return "Zero";
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  const [intPart, decPart] = num.toFixed(2).split(".");
  let result = convert(parseInt(intPart)) + " Rupees";
  if (parseInt(decPart) > 0) result += " and " + convert(parseInt(decPart)) + " Paise";
  return result + " Only";
}

export default function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const f = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fDate = (d: string) => { try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; } };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica', Arial, sans-serif", background: "#ffffff", color: "#1a1a1a", padding: "0", margin: "0", fontSize: "12px" }}>
      {/* Header */}
      <div style={{ background: "", padding: "28px 32px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "black", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              SHIVAM TRADERS
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6", fontWeight: "bold" }}>
              GSTIN : 33CNWPA3211L1Z1<br />
              Address : 2061, Servaikaran Street, Narayana Pillai Lane <br />
              Karanthai, Thanjavur. 613002 <br />
              Gpay No : +918248974991
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6", letterSpacing: "1px" }}>
              TAX INVOICE
            </div>
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#cbd5e1" }}>
              <div><strong style={{ color: "white" }}>Invoice No:</strong> {invoice.invoiceNumber}</div>
              <div><strong style={{ color: "white" }}>Date:</strong> {fDate(invoice.invoiceDate)}</div>
              {invoice.dueDate && <div><strong style={{ color: "white" }}>Due:</strong> {fDate(invoice.dueDate)}</div>}
            </div>
            {/* <div style={{ marginTop: "8px" }}>
              <span style={{
                display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "10px",
                fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase",
                background: invoice.status === "PAID" ? "#10b981" : invoice.status === "OVERDUE" ? "#ef4444" : "#f59e0b",
                color: "white",
              }}>{invoice.status}</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ flex: 1, padding: "20px 32px", borderRight: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
            BILL TO
          </div>
          <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>{invoice.buyerName}</div>
          {invoice.buyerAddress && <div style={{ color: "#475569", lineHeight: "1.6", fontSize: "11px" }}>{invoice.buyerAddress}</div>}
          {invoice.buyerGST && <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "11px", color: "#1e40af", background: "#eff6ff", padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>GSTIN: {invoice.buyerGST}</div>}
          {invoice.buyerPhone && <div style={{ marginTop: "4px", color: "#64748b", fontSize: "11px" }}>📞 {invoice.buyerPhone}</div>}
          {invoice.buyerEmail && <div style={{ color: "#64748b", fontSize: "11px" }}>✉ {invoice.buyerEmail}</div>}
        </div>
        <div style={{ flex: 1, padding: "20px 32px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
            Salesman Details
          </div>
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "2" }}>
            {invoice.salesmanName && <div><strong>Name:</strong> {invoice.salesmanName}</div>}
            {invoice.salesmanPhone && <div><strong>Mobile:</strong> {invoice.salesmanPhone}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: "0 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["#", "Product / Description", "HSN", "Qty", "Unit", "Rate incl. GST (₹)", "Taxable Amt (₹)",
                invoice.taxType === "INTRASTATE" ? "CGST" : "IGST",
                invoice.taxType === "INTRASTATE" ? "SGST" : "",
                "Total (₹)"].filter(Boolean).map((h, i) => (
                  <th key={i} style={{ padding: "10px 12px", textAlign: i <= 1 ? "left" : "right", fontWeight: "700", color: "#475569", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid #e2e8f0", borderTop: "2px solid #e2e8f0" }}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>{idx + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: "600", borderBottom: "1px solid #e2e8f0" }}>{item.productName}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{item.hsnCode}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #e2e8f0" }}>{item.quantity}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{item.unit}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", borderBottom: "1px solid #e2e8f0" }}>{f(item.price)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", borderBottom: "1px solid #e2e8f0" }}>{f(item.amount)}</td>
                {invoice.taxType === "INTRASTATE" ? (
                  <>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", color: "#d97706", borderBottom: "1px solid #e2e8f0" }}>
                      {f(item.cgst)} <span style={{ fontSize: "9px", color: "#94a3b8" }}>({item.gstRate / 2}%)</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", color: "#d97706", borderBottom: "1px solid #e2e8f0" }}>
                      {f(item.sgst)} <span style={{ fontSize: "9px", color: "#94a3b8" }}>({item.gstRate / 2}%)</span>
                    </td>
                  </>
                ) : (
                  <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", color: "#d97706", borderBottom: "1px solid #e2e8f0" }}>
                    {f(item.igst)} <span style={{ fontSize: "9px", color: "#94a3b8" }}>({item.gstRate}%)</span>
                  </td>
                )}
                <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "700", borderBottom: "1px solid #e2e8f0" }}>{f(item.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 32px 24px" }}>
        <div style={{ minWidth: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: "monospace" }}>₹{f(invoice.subtotal)}</span>
          </div>
          {invoice.taxType === "INTRASTATE" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#d97706" }}>
                <span>CGST</span><span style={{ fontFamily: "monospace" }}>₹{f(invoice.totalCGST)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#d97706" }}>
                <span>SGST</span><span style={{ fontFamily: "monospace" }}>₹{f(invoice.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#d97706" }}>
              <span>IGST</span><span style={{ fontFamily: "monospace" }}>₹{f(invoice.totalIGST)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "", borderRadius: "8px", marginTop: "8px", fontWeight: "800", fontSize: "15px" }}>
            <span style={{ color: "black" }}>GRAND TOTAL</span>
            <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>₹{f(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div style={{ margin: "0 32px 20px", padding: "12px 16px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
        <span style={{ fontWeight: "700", color: "#0369a1", fontSize: "11px" }}>Amount in Words: </span>
        <span style={{ color: "#0c4a6e", fontSize: "11px" }}>{toWords(invoice.grandTotal)}</span>
      </div>

      {/* Notes + Signature */}
      <div style={{ display: "flex", gap: "24px", padding: "0 32px 32px" }}>
        <div style={{ flex: 1 }}>
          {invoice.notes && (
            <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a" }}>
              <div style={{ fontWeight: "700", color: "#92400e", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Notes</div>
              <div style={{ color: "#78350f", fontSize: "11px", lineHeight: "1.6" }}>{invoice.notes}</div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", minWidth: "180px" }}>
          <div style={{ height: "48px", borderBottom: "2px solid #1e293b", marginBottom: "8px" }} />
          <div style={{ fontWeight: "700", fontSize: "12px" }}>Shivam Traders</div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>Authorised Signatory</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", padding: "12px 32px", textAlign: "center", color: "#94a3b8", fontSize: "10px" }}>
        This is a computer generated invoice. Thank you for your business! · GSTIN: 33CNWPA3211L1Z1
      </div>
    </div>
  );
}

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

  // INTRASTATE: 12 cols → #, Product, HSN, Qty, Unit, Rate, Taxable, CGST%, CGSTAmt, SGST%, SGSTAmt, Total
  // INTERSTATE:  9 cols → #, Product, HSN, Qty, Unit, Rate, Taxable, IGST%,  IGSTAmt,          Total
  const isIntra = invoice.taxType === "INTRASTATE";

  const thStyle: React.CSSProperties = {
    padding: "5px 5px",
    textAlign: "right",
    fontWeight: "700",
    fontSize: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1.5px solid #000",
    borderTop: "1.5px solid #000",
    color: "#000",
    background: "#f5f5f5",
    whiteSpace: "nowrap",
  };
  const thLeft: React.CSSProperties = { ...thStyle, textAlign: "left" };
  const tdStyle: React.CSSProperties = {
    padding: "7px 5px",
    textAlign: "right",
    borderBottom: "1px solid #d0d0d0",
    color: "#1a1a1a",
    fontSize: "10px",
  };
  const tdLeft: React.CSSProperties = { ...tdStyle, textAlign: "left", fontWeight: "600" };
  const tfStyle: React.CSSProperties = {
    padding: "7px 5px",
    borderTop: "1.5px solid #000",
    fontSize: "10px",
    fontWeight: "700",
    textAlign: "right",
    fontFamily: "monospace",
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica', Arial, sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      padding: "0",
      margin: "0",
      fontSize: "11px",
    }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 14px", borderBottom: "2px solid #000" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "4px", color: "#000" }}>
              SHIVAM TRADERS
            </div>
            <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.7" }}>
              GSTIN : 33CNWPA3211L1Z1<br />
              Address : 2061, Servaikaran Street, Narayana Pillai Lane<br />
              Karanthai, Thanjavur. 613002<br />
              Gpay No : +918248974991
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#000", letterSpacing: "1px" }}>
              TAX INVOICE
            </div>
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#000", lineHeight: "1.8" }}>
              <div><strong>Invoice No:</strong> {invoice.invoiceNumber}</div>
              <div><strong>Date:</strong> {fDate(invoice.invoiceDate)}</div>
              {invoice.dueDate && <div><strong>Due:</strong> {fDate(invoice.dueDate)}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Bill To / Salesman */}
      <div style={{ display: "flex", borderBottom: "1.5px solid #000" }}>
        <div style={{ flex: 1, padding: "12px 24px", borderRight: "1px solid #000" }}>
          <div style={{ fontSize: "8px", fontWeight: "700", color: "#333", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "5px" }}>BILL TO</div>
          <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "2px" }}>{invoice.buyerName}</div>
          {invoice.buyerAddress && <div style={{ color: "#333", lineHeight: "1.6", fontSize: "10px" }}>{invoice.buyerAddress}</div>}
          {invoice.buyerGST && <div style={{ marginTop: "4px", fontSize: "10px", fontFamily: "monospace" }}>GSTIN: {invoice.buyerGST}</div>}
          {invoice.buyerPhone && <div style={{ marginTop: "2px", color: "#333", fontSize: "10px" }}>Ph: {invoice.buyerPhone}</div>}
          {invoice.buyerEmail && <div style={{ color: "#333", fontSize: "10px" }}>{invoice.buyerEmail}</div>}
        </div>
        <div style={{ flex: 1, padding: "12px 24px" }}>
          <div style={{ fontSize: "8px", fontWeight: "700", color: "#333", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "5px" }}>SALESMAN DETAILS</div>
          <div style={{ fontSize: "10px", color: "#333", lineHeight: "1.9" }}>
            {invoice.salesmanName && <div><strong>Name:</strong> {invoice.salesmanName}</div>}
            {invoice.salesmanPhone && <div><strong>Mobile:</strong> {invoice.salesmanPhone}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: "0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "24px" }} />         {/* # */}
            <col style={{ width: "18%" }} />           {/* Product */}
            <col style={{ width: "7%" }} />            {/* HSN */}
            <col style={{ width: "5%" }} />            {/* Qty */}
            <col style={{ width: "5%" }} />            {/* Unit */}
            <col style={{ width: "9%" }} />            {/* Rate incl GST */}
            <col style={{ width: "9%" }} />            {/* Taxable Amt */}
            <col style={{ width: "6%" }} />            {/* CGST Rate % / IGST Rate % */}
            <col style={{ width: "8%" }} />            {/* CGST Amt / IGST Amt */}
            {isIntra && <col style={{ width: "6%" }} />}  {/* SGST Rate % */}
            {isIntra && <col style={{ width: "8%" }} />}  {/* SGST Amt */}
            <col style={{ width: "9%" }} />            {/* Total */}
          </colgroup>

          <thead>
            <tr>
              <th style={{ ...thLeft, overflow: "hidden" }}>#</th>
              <th style={{ ...thLeft }}>Product / Description</th>
              <th style={{ ...thStyle }}>HSN</th>
              <th style={{ ...thStyle }}>Qty</th>
              <th style={{ ...thStyle }}>Unit</th>
              <th style={{ ...thStyle }}>Rate incl. GST (₹)</th>
              <th style={{ ...thStyle }}>Taxable Amt (₹)</th>
              <th style={{ ...thStyle, borderLeft: "1px solid #ccc" }}>
                {isIntra ? "CGST %" : "IGST %"}
              </th>
              <th style={{ ...thStyle }}>
                {isIntra ? "CGST Amt (₹)" : "IGST Amt (₹)"}
              </th>
              {isIntra && <th style={{ ...thStyle, borderLeft: "1px solid #ccc" }}>SGST %</th>}
              {isIntra && <th style={{ ...thStyle, borderRight: "1px solid #ccc" }}>SGST Amt (₹)</th>}
              <th style={{ ...thStyle }}>Total (₹)</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ ...tdLeft, color: "#666" }}>{idx + 1}</td>
                <td style={{ ...tdLeft, wordBreak: "break-word" }}>{item.productName}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace" }}>{item.hsnCode}</td>
                <td style={{ ...tdStyle, fontWeight: "600" }}>{item.quantity}</td>
                <td style={{ ...tdStyle, color: "#555" }}>{item.unit}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace" }}>{f(item.price)}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace" }}>{f(item.amount)}</td>
                <td style={{ ...tdStyle, borderLeft: "1px solid #ccc", fontFamily: "monospace" }}>
                  {item.gstRate / 2}%
                </td>
                <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                  {isIntra ? f(item.cgst) : f(item.igst)}
                </td>
                {isIntra && (
                  <td style={{ ...tdStyle, borderLeft: "1px solid #ccc", fontFamily: "monospace" }}>
                    {item.gstRate / 2}%
                  </td>
                )}
                {isIntra && (
                  <td style={{ ...tdStyle, fontFamily: "monospace", borderRight: "1px solid #ccc", }}>{f(item.sgst)}</td>
                )}
                <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: "700" }}>{f(item.totalAmount)}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr style={{ background: "#f0f0f0" }}>
              {/* Col 1-2: Total label */}
              <td colSpan={2} style={{ ...tfStyle, textAlign: "left" }}>Total</td>
              {/* Col 3: HSN — blank */}
              <td style={tfStyle} />
              {/* Col 4: Qty — blank */}
              <td style={tfStyle} />
              {/* Col 5: Unit — blank */}
              <td style={tfStyle} />
              {/* Col 6: Rate — blank */}
              <td style={tfStyle} />
              {/* Col 7: Taxable Amt */}
              <td style={{ ...tfStyle, fontFamily: "monospace" }}>{f(invoice.subtotal)}</td>
              {/* Col 8: CGST%/IGST% — blank */}
              <td style={{ ...tfStyle, borderLeft: "1px solid #ccc" }} />
              {/* Col 9: CGST Amt / IGST Amt */}
              <td style={tfStyle} />
              {/* Col 10: SGST% — blank (intra only) */}
              {isIntra && <td style={{ ...tfStyle, borderLeft: "1px solid #ccc" }} />}
              {/* Col 11: SGST Amt (intra only) */}
              <td style={{ ...tfStyle, borderRight: "1px solid #ccc" }} />
              {/* Col 12 / 10: Grand Total */}
              <td style={{ ...tfStyle, fontFamily: "monospace" }}>{f(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Invoice Total — left side */}
      <div style={{ padding: "14px 24px 8px", borderTop: "1.5px solid #000" }}>
        <div style={{ fontSize: "8px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "5px", color: "#333" }}>
          Invoice Total
        </div>
        <table style={{ borderCollapse: "collapse", fontSize: "11px", border: "1px solid #000", minWidth: "240px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 10px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>TAXABLE AMT</td>
              <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #ccc", fontFamily: "monospace", minWidth: "110px" }}>₹{f(invoice.subtotal)}</td>
            </tr>
            {isIntra ? (
              <>
                <tr>
                  <td style={{ padding: "6px 10px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>CGST</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #ccc", fontFamily: "monospace" }}>₹{f(invoice.totalCGST)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 10px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>SGST</td>
                  <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #ccc", fontFamily: "monospace" }}>₹{f(invoice.totalSGST)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>IGST</td>
                <td style={{ padding: "6px 10px", textAlign: "right", borderBottom: "1px solid #ccc", fontFamily: "monospace" }}>₹{f(invoice.totalIGST)}</td>
              </tr>
            )}
            <tr style={{ background: "#f0f0f0" }}>
              <td style={{ padding: "8px 10px", fontWeight: "800", fontSize: "12px", borderRight: "1px solid #aaa", borderTop: "1px solid #000" }}>TOTAL</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "monospace", fontWeight: "800", fontSize: "12px", borderTop: "1px solid #000" }}>₹{f(invoice.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div style={{ margin: "8px 24px 14px", padding: "9px 12px", border: "1px solid #aaa", borderRadius: "4px" }}>
        <span style={{ fontWeight: "700", fontSize: "10px" }}>Amount in Words: </span>
        <span style={{ fontSize: "10px" }}>{toWords(invoice.grandTotal)}</span>
      </div>

      {/* Notes + Signature */}
      <div style={{ display: "flex", gap: "24px", padding: "0 24px 24px" }}>
        <div style={{ flex: 1 }}>
          {invoice.notes && (
            <div style={{ padding: "9px 12px", border: "1px solid #aaa", borderRadius: "4px" }}>
              <div style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Notes</div>
              <div style={{ fontSize: "10px", lineHeight: "1.6" }}>{invoice.notes}</div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", minWidth: "160px" }}>
          <div style={{ height: "44px", borderBottom: "2px solid #000", marginBottom: "6px" }} />
          <div style={{ fontWeight: "700", fontSize: "11px" }}>Shivam Traders</div>
          <div style={{ color: "#555", fontSize: "9px" }}>Authorised Signatory</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1.5px solid #000", padding: "9px 24px", textAlign: "center", color: "#555", fontSize: "9px" }}>
        This is a computer generated invoice. Thank you for your business! · GSTIN: 33CNWPA3211L1Z1
      </div>
    </div>
  );
}
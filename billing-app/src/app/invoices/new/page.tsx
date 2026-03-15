"use client";
// src/app/invoices/new/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Product, InvoiceItem, Invoice } from "@/lib/types";
import { Plus, Trash2, ArrowLeft, Save, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const today = () => new Date().toISOString().split("T")[0];

function calcItems(items: InvoiceItem[], taxType: string): InvoiceItem[] {
  return items.map((item) => {
    const amount = item.quantity * item.price;
    const tax = (amount * item.gstRate) / 100;
    const half = tax / 2;
    return {
      ...item,
      amount,
      cgst: taxType === "INTRASTATE" ? half : 0,
      sgst: taxType === "INTRASTATE" ? half : 0,
      igst: taxType === "INTERSTATE" ? tax : 0,
      totalAmount: amount + tax,
    };
  });
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  // Invoice meta
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Invoice["status"]>("UNPAID");
  const [taxType, setTaxType] = useState<"INTRASTATE" | "INTERSTATE">("INTRASTATE");
  const [notes, setNotes] = useState("");

  // Buyer
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerGST, setBuyerGST] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => { api.products.list().then(setProducts); }, []);

  const makeItem = (p: Product): InvoiceItem => {
    const amount = p.price;
    const tax = (amount * p.gstRate) / 100;
    const half = tax / 2;
    return {
      productId: p.id,
      productName: p.name,
      hsnCode: p.hsnCode,
      unit: p.unit,
      quantity: 1,
      price: p.price,
      gstRate: p.gstRate,
      amount,
      cgst: taxType === "INTRASTATE" ? half : 0,
      sgst: taxType === "INTRASTATE" ? half : 0,
      igst: taxType === "INTERSTATE" ? tax : 0,
      totalAmount: amount + tax,
    };
  };

  const addRow = () => {
    if (!products.length) { toast.error("Add products first"); return; }
    setItems((prev) => [...prev, makeItem(products[0])]);
  };

  const updateRow = (idx: number, field: string, value: string | number) => {
    setItems((prev) => {
      const updated = prev.map((item, i) => {
        if (i !== idx) return item;
        let next = { ...item, [field]: value };
        if (field === "productId") {
          const p = products.find((p) => p.id === value);
          if (p) {
            next = { ...next, productName: p.name, hsnCode: p.hsnCode, unit: p.unit, price: p.price, gstRate: p.gstRate };
          }
        }
        return next;
      });
      return calcItems(updated, taxType);
    });
  };

  // Recalculate tax when taxType changes
  useEffect(() => {
    setItems((prev) => calcItems(prev, taxType));
  }, [taxType]);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalCGST = items.reduce((s, i) => s + i.cgst, 0);
  const totalSGST = items.reduce((s, i) => s + i.sgst, 0);
  const totalIGST = items.reduce((s, i) => s + i.igst, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = subtotal + totalTax;

  const handleSave = async () => {
    if (!buyerName.trim()) { toast.error("Customer name is required"); return; }
    if (!items.length) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      const inv = await api.invoices.create({
        invoiceNumber: "",
        invoiceDate, dueDate: dueDate || null,
        buyerName, buyerAddress, buyerGST, buyerPhone, buyerEmail,
        taxType, items, notes, status,
        subtotal, totalCGST, totalSGST, totalIGST, totalTax, grandTotal,
      });
      toast.success("Invoice created!");
      router.push(`/invoices/${inv.id}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const f = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-8 max-w-7xl">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title">New Invoice</h1>
            <p className="page-sub">Fill in the details below</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-blue">
          <Save size={15} /> {saving ? "Saving..." : "Save Invoice"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Meta + Buyer */}
        <div className="space-y-5">
          <div className="card p-5">
            <p className="section-label">Invoice Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Invoice Date</label>
                <input className="input" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Due Date</label>
                <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Tax Type</label>
                <select className="input" value={taxType} onChange={(e) => setTaxType(e.target.value as any)}>
                  <option value="INTRASTATE">Intrastate (CGST + SGST)</option>
                  <option value="INTERSTATE">Interstate (IGST)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="DRAFT">Draft</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Bill To</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Customer Name *</label>
                <input className="input" placeholder="Customer / Company name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Address</label>
                <textarea className="input resize-none" rows={3} placeholder="Full billing address" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>GSTIN</label>
                <input className="input font-mono text-xs" placeholder="22AAAAA0000A1Z5" value={buyerGST} onChange={(e) => setBuyerGST(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Phone</label>
                <input className="input" placeholder="+91 XXXXX XXXXX" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                <input className="input" type="email" placeholder="email@example.com" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Notes</p>
            <textarea className="input resize-none" rows={3} placeholder="Payment terms, delivery notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {/* RIGHT: Items + Summary */}
        <div className="col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold text-white">Line Items</p>
              <button onClick={addRow} className="btn-blue text-xs px-3 py-1.5">
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ minWidth: 180 }}>Product</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate (₹)</th>
                    <th>GST%</th>
                    <th>Amount</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
                        Click "Add Item" to add products to this invoice
                      </td>
                    </tr>
                  ) : items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select className="input text-xs py-1.5 w-44"
                          value={item.productId}
                          onChange={(e) => updateRow(idx, "productId", e.target.value)}>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{item.hsnCode}</td>
                      <td>
                        <input type="number" min="1" step="0.01"
                          className="input text-xs py-1.5 text-center w-16"
                          value={item.quantity}
                          onChange={(e) => updateRow(idx, "quantity", parseFloat(e.target.value) || 1)} />
                      </td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>{item.unit}</td>
                      <td>
                        <input type="number" min="0" step="0.01"
                          className="input text-xs py-1.5 w-24"
                          value={item.price}
                          onChange={(e) => updateRow(idx, "price", parseFloat(e.target.value) || 0)} />
                      </td>
                      <td className="font-mono text-xs" style={{ color: "#60a5fa" }}>{item.gstRate}%</td>
                      <td className="font-mono text-xs text-white">₹{f(item.amount)}</td>
                      <td className="font-mono text-xs" style={{ color: "#fbbf24" }}>₹{f(item.cgst + item.sgst + item.igst)}</td>
                      <td className="font-mono text-xs font-semibold text-white">₹{f(item.totalAmount)}</td>
                      <td>
                        <button onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded transition-colors hover:bg-red-500/10"
                          style={{ color: "var(--text-muted)" }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="card p-5 ml-auto max-w-xs">
              <p className="section-label">Invoice Summary</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                  <span className="font-mono">₹{f(subtotal)}</span>
                </div>
                {taxType === "INTRASTATE" ? (
                  <>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-muted)" }}>CGST</span>
                      <span className="font-mono" style={{ color: "#fbbf24" }}>₹{f(totalCGST)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-muted)" }}>SGST</span>
                      <span className="font-mono" style={{ color: "#fbbf24" }}>₹{f(totalSGST)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>IGST</span>
                    <span className="font-mono" style={{ color: "#fbbf24" }}>₹{f(totalIGST)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Total Tax</span>
                  <span className="font-mono">₹{f(totalTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="text-white">Grand Total</span>
                  <span className="font-mono" style={{ color: "var(--accent)" }}>₹{f(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

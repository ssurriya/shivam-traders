"use client";
// src/app/invoices/[id]/page.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, CheckCircle2, Printer } from "lucide-react";
import toast from "react-hot-toast";
import InvoiceTemplate from "@/components/InvoiceTemplate";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      api.invoices.get(id)
        .then(setInvoice)
        .catch(() => toast.error("Invoice not found"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this invoice permanently?")) return;
    try {
      await api.invoices.delete(id);
      toast.success("Invoice deleted");
      router.push("/invoices");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleMarkPaid = async () => {
    try {
      await api.invoices.update(id, { status: "PAID" });
      setInvoice((prev) => prev ? { ...prev, status: "PAID" } : prev);
      toast.success("Marked as Paid!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: 0,
          filename: `${invoice?.invoiceNumber ?? "invoice"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(printRef.current)
        .save();
      toast.success("PDF downloaded!");
    } catch { toast.error("PDF generation failed"); }
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
      <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      Loading invoice...
    </div>
  );

  if (!invoice) return (
    <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
      Invoice not found. <Link href="/invoices" className="underline" style={{ color: "var(--accent)" }}>Go back</Link>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="page-header mb-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title">{invoice.invoiceNumber}</h1>
            <p className="page-sub flex items-center gap-2">
              {invoice.buyerName}
              <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== "PAID" && (
            <button onClick={handleMarkPaid} className="btn-success">
              <CheckCircle2 size={14} /> Mark Paid
            </button>
          )}
          <button onClick={handleDownloadPDF} className="btn-blue">
            <Download size={14} /> Download PDF
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: "var(--border)" }}>
        <div ref={printRef}>
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>
    </div>
  );
}

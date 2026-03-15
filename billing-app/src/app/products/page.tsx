"use client";
// src/app/products/page.tsx
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Check, Package, Search } from "lucide-react";
import toast from "react-hot-toast";

const GST_RATES = [0, 5, 12, 18, 28];
const UNITS = ["Pcs", "Kg", "Ltr", "Box", "Bag", "Set", "Nos", "Mtr", "Sqft", "Dozen"];
const empty = { name: "", hsnCode: "", unit: "Pcs", price: 0, gstRate: 18, description: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await api.products.list()); }
    catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, hsnCode: p.hsnCode, unit: p.unit, price: p.price, gstRate: p.gstRate, description: p.description || "" });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.hsnCode.trim() || !form.price) {
      toast.error("Name, HSN Code and Price are required"); return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.products.update(editId, form);
        toast.success("Product updated!");
      } else {
        await api.products.create(form);
        toast.success("Product added!");
      }
      setShowModal(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.products.delete(id);
      toast.success("Product deleted");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.hsnCode.includes(search)
  );

  return (
    <div className="p-8 max-w-7xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">{products.length} items in catalogue</p>
        </div>
        <button onClick={openAdd} className="btn-blue">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input className="input pl-9" placeholder="Search by name or HSN code..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4 shadow-2xl" style={{ background: "var(--surface)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {editId ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface3)] transition-colors" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="section-label block">Product Name *</label>
                  <input className="input" placeholder="e.g. Premium Basmati Rice" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="section-label block">HSN / SAC Code *</label>
                  <input className="input font-mono" placeholder="e.g. 1006" value={form.hsnCode}
                    onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} />
                </div>
                <div>
                  <label className="section-label block">Unit of Measure</label>
                  <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label block">Base Price (₹) *</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="section-label block">GST Rate</label>
                  <select className="input" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: parseInt(e.target.value) })}>
                    {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="section-label block">Description (optional)</label>
                  <textarea className="input resize-none" rows={2} placeholder="Brief description..."
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-blue">
                <Check size={14} /> {saving ? "Saving..." : editId ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Package size={15} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold text-white">Product Catalogue</h2>
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--surface3)", color: "var(--text-muted)" }}>
            {filtered.length} items
          </span>
        </div>
        {loading ? (
          <div className="p-10 text-center" style={{ color: "var(--text-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <Package size={40} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }} className="mb-4">{search ? "No products match your search." : "No products yet."}</p>
            {!search && <button onClick={openAdd} className="btn-blue mx-auto"><Plus size={14} /> Add First Product</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>HSN Code</th>
                  <th>Unit</th>
                  <th>Base Price</th>
                  <th>GST %</th>
                  <th>Price incl. GST</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const gstAmt = (p.price * p.gstRate) / 100;
                  return (
                    <tr key={p.id}>
                      <td className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                      <td>
                        <p className="font-medium text-white">{p.name}</p>
                        {p.description && <p className="text-xs truncate max-w-xs" style={{ color: "var(--text-muted)" }}>{p.description}</p>}
                      </td>
                      <td>
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--surface3)", color: "var(--text-dim)" }}>
                          {p.hsnCode}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-dim)" }}>{p.unit}</td>
                      <td className="font-mono font-medium text-white">₹{p.price.toLocaleString("en-IN")}</td>
                      <td>
                        <span className="badge" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                          {p.gstRate}%
                        </span>
                      </td>
                      <td className="font-mono font-semibold" style={{ color: "#34d399" }}>
                        ₹{(p.price + gstAmt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface3)]" style={{ color: "var(--text-muted)" }}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: "var(--text-muted)" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

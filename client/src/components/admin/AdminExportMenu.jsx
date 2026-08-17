/** Reusable CSV / Excel / PDF export controls for list-oriented admin pages. */
import { exportCsv, exportExcel, exportPdf } from "../../utils/adminExport.js";
export default function AdminExportMenu({ title, columns, rows = [] }) {
  const disabled=!rows.length;
  return <div className="mb-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-[6px] font-semibold uppercase tracking-[.14em] text-black/65">Export current data</span><button type="button" disabled={disabled} onClick={()=>exportCsv(title,columns,rows)} className="border border-black/10 bg-[#f7f3ed] px-3 py-2 text-[7px] font-semibold uppercase tracking-[.1em] disabled:opacity-30">CSV</button><button type="button" disabled={disabled} onClick={()=>exportExcel(title,columns,rows)} className="border border-black/10 bg-[#f7f3ed] px-3 py-2 text-[7px] font-semibold uppercase tracking-[.1em] disabled:opacity-30">Excel</button><button type="button" disabled={disabled} onClick={()=>exportPdf(title,columns,rows)} className="bg-black px-3 py-2 text-[7px] font-semibold uppercase tracking-[.1em] text-white disabled:opacity-30">PDF</button></div>;
}

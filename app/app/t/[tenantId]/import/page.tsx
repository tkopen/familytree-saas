"use client";

import { useState } from "react";

export default function ImportPage({ params }: { params: { tenantId: string } }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function uploadCsv(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch(`/api/import/csv?tenantId=${params.tenantId}`, {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || "导入失败");
      else setMsg(`导入完成：新增 ${data.inserted} 条，跳过 ${data.skipped} 条（示例：按姓名为空跳过）`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{maxWidth: 760}}>
      <h2>批量导入（CSV）</h2>
      <p className="small">
        这是“可直接上线”的简化版导入：支持 CSV 上传并写入 persons 表。你后续可以升级为：字段映射预览、重名冲突处理、关系导入等。
      </p>

      <div className="card" style={{background:"#f9fafb"}}>
        <div className="small">CSV 表头建议：</div>
        <pre className="small" style={{whiteSpace:"pre-wrap"}}>
full_name,gender,birth_date,death_date,notes,custom_fields_json
张三,male,1990-01-01,,备注,"{{""字辈"":""德"",""房派"":""一房""}}"
        </pre>
        <div className="small">gender 可填：male/female/unknown；custom_fields_json 是 JSON 字符串（可空）。</div>
      </div>

      <form onSubmit={uploadCsv} style={{display:"grid", gap:10, marginTop: 12}}>
        <input className="input" name="file" type="file" accept=".csv,text/csv" required />
        <button className="btn" type="submit" disabled={busy}>{busy ? "导入中…" : "上传并导入"}</button>
        {msg ? <div className="small">{msg}</div> : null}
      </form>
    </div>
  );
}

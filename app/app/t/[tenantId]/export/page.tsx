"use client";

import { useState } from "react";

export default function ExportPage({ params }: { params: { tenantId: string } }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function downloadPdf() {
    setMsg(null);
    const res = await fetch(`/api/export/pdf?tenantId=${params.tenantId}`);
    if (!res.ok) {
      const data = await res.json().catch(()=>({}));
      return setMsg(data.error || "导出失败");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "族谱导出.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg("已开始下载 PDF（简化版模板）");
  }

  return (
    <div className="card" style={{maxWidth: 760}}>
      <h2>导出</h2>
      <p className="small">
        这里提供“最小可用”的服务端 PDF 导出：把当前家族空间的人物列表导出为 PDF。
        下一步可升级：封面/目录/世系图分页、无水印（付费）、导出族谱树图片等。
      </p>

      <button className="btn" onClick={downloadPdf}>导出 PDF</button>
      {msg ? <div className="small" style={{marginTop: 10}}>{msg}</div> : null}
    </div>
  );
}

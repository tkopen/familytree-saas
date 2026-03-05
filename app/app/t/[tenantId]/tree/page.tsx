"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Person = { id: string; full_name: string; gender: string };
type Rel = { id: string; from_person_id: string; to_person_id: string; type: string };

export default function TreePage({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseBrowser();
  const [persons, setPersons] = useState<Person[]>([]);
  const [rels, setRels] = useState<Rel[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await supabase.from("persons")
        .select("id,full_name,gender")
        .eq("tenant_id", params.tenantId)
        .limit(200);
      if (p.error) setMsg(p.error.message);
      else setPersons((p.data || []) as any);

      const r = await supabase.from("relationships")
        .select("id,from_person_id,to_person_id,type")
        .eq("tenant_id", params.tenantId)
        .limit(400);
      if (r.error) setMsg(r.error.message);
      else setRels((r.data || []) as any);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodes: Node[] = useMemo(() => {
    return persons.map((p, idx) => ({
      id: p.id,
      position: { x: (idx % 5) * 220, y: Math.floor(idx / 5) * 120 },
      data: { label: `${p.full_name} (${p.gender})` },
      style: { borderRadius: 12, border: "1px solid #e5e7eb", padding: 10, width: 180 }
    }));
  }, [persons]);

  const edges: Edge[] = useMemo(() => {
    return rels.map((r) => ({
      id: r.id,
      source: r.from_person_id,
      target: r.to_person_id,
      label: r.type,
      animated: false
    }));
  }, [rels]);

  return (
    <div className="card" style={{height: "75vh"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>族谱树（展示版）</h2>
        <span className="small">下一步：加入自动布局、关系编辑、拖拽连线</span>
      </div>

      {msg ? <div className="small">{msg}</div> : null}

      <div style={{height:"calc(75vh - 80px)", marginTop: 10}}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

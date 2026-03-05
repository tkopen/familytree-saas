"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Row = {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export default function Page() {
  const supabase = createSupabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    body: "",
    link_url: "",
    sort_order: 0,
    is_active: true,
  });

  async function load() {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(500);

    if (error) return setMsg(error.message);
    setRows((data || []) as Row[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    const { error } = await supabase.from("announcements").insert({
      title: form.title,
      body: form.body || null,
      link_url: form.link_url || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    });

    if (error) return setMsg(error.message);

    setForm({
      title: "",
      body: "",
      link_url: "",
      sort_order: 0,
      is_active: true,
    });

    load();
  }

  async function remove(id: string) {
    await supabase.from("announcements").delete().eq("id", id);
    load();
  }

  return (
    <div className="card" style={{ maxWidth: 1000 }}>
      <h2>公告管理</h2>

      <Link className="badge" href="/app/admin/content">
        ← 返回内容管理
      </Link>

      <div className="card" style={{ marginTop: 10 }}>
        <h3>新增公告</h3>

        <input
          className="input"
          placeholder="标题"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="input"
          placeholder="内容"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />

        <input
          className="input"
          placeholder="跳转链接"
          value={form.link_url}
          onChange={(e) => setForm({ ...form, link_url: e.target.value })}
        />

        <button className="btn" onClick={add}>
          新增
        </button>
      </div>

      {msg && <div className="small">{msg}</div>}

      <table style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>标题</th>
            <th>内容</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.title}</td>
              <td>{r.body}</td>
              <td>
                <button className="btn secondary" onClick={() => remove(r.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

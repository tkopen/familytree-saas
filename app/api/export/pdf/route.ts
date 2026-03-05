import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// 强制走 Node runtime（Buffer 可用、pdf-lib 更稳）
export const runtime = "nodejs";
// 如果你希望每次都实时生成，不走缓存：
// export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title: string = body?.title || "Family Tree Export";
    const lines: string[] = Array.isArray(body?.lines) ? body.lines : [];

    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const marginX = 50;
    let y = 800;

    // 标题
    page.drawText(title, {
      x: marginX,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 30;

    // 内容
    const fontSize = 11;
    const lineHeight = 16;

    const safeLines = lines.length
      ? lines.map((s) => String(s ?? ""))
      : ["(No content)"];

    for (const line of safeLines) {
      // 换页
      if (y < 60) {
        y = 800;
        doc.addPage([595.28, 841.89]);
      }

      const currentPage = doc.getPages()[doc.getPages().length - 1];
      currentPage.drawText(line, {
        x: marginX,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });

      y -= lineHeight;
    }

    const bytes = await doc.save();
    const pdfBuffer = Buffer.from(bytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="family-tree.pdf"',
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "PDF export failed" },
      { status: 500 }
    );
  }
}

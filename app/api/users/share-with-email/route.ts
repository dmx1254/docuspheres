import { getServerSession } from "next-auth";

import { Resend } from "resend";
import { options } from "../../auth/[...nextauth]/option";
import { NextResponse } from "next/server";
import EmailTemplate from "@/components/email-template";

const resend = new Resend(process.env.RESEND_DOCUSPHERE_API_KEY);

export async function POST(req: Request) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await req.json();

  const { toEmail, fileUrl, fileName, fileType, previewUrl } = data;

  try {
    const { data, error } = await resend.emails.send({
      from: "Docusphere <share@ibendouma.com>",
      to: toEmail,
      subject: `${session.user.name} a été partagé avec vous ce fichier ${fileName} `,
      react: EmailTemplate({
        fileUrl,
        fileName,
        fileType,
        previewUrl,
      }),
    });

    if (!error) {
      return NextResponse.json({ success: true, data }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

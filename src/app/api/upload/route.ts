import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { storageService } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const uploadType = formData.get("type") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Dosya yüklenmedi" }, { status: 400 });
    }

    if (!session?.user && uploadType !== "AD_IMAGE") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "En fazla 10 adet resim yükleyebilirsiniz" }, { status: 400 });
    }

    const isAdmin = session?.user?.role === "ADMIN";
    // For AD_IMAGE uploads, max size is 4 MB. Admins get up to 100 MB, standard users get 7 MB.
    const isAdUpload = uploadType === "AD_IMAGE";
    const MAX_SIZE = isAdUpload ? 4 * 1024 * 1024 : (isAdmin ? 100 * 1024 * 1024 : 7 * 1024 * 1024);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        const limitMb = isAdUpload ? 4 : (isAdmin ? 100 : 7);
        return NextResponse.json({ error: `${file.name} boyutu ${limitMb} MB'tan büyüktür.` }, { status: 400 });
      }

      // Use the storage abstraction layer to upload the file
      const url = await storageService.uploadFile(file);
      uploadedUrls.push(url);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

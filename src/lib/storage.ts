import path from "path";
import fs from "fs";
import { writeFile, unlink } from "fs/promises";

// Storage provider interface
export interface IStorageService {
  uploadFile(file: File, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

// Local File System Implementation
export class LocalStorageService implements IStorageService {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.join(process.cwd(), "public/uploads");
    // Ensure the base directory exists
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async uploadFile(file: File, folder: string = ""): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); // sanitize
    const filename = `${uniqueSuffix}-${originalName}`;

    // Ensure target folder exists
    const targetDir = path.join(this.baseUploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const urlPath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;
    return urlPath;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl.startsWith("/uploads/")) {
      return false; // We only handle local uploads in this implementation
    }

    try {
      const relativePath = fileUrl.replace("/uploads/", "");
      const filePath = path.join(this.baseUploadDir, relativePath);
      
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("File deletion error:", error);
      return false;
    }
  }
}

// Cloudflare R2 / AWS S3 Implementation (Skeleton)
export class R2StorageService implements IStorageService {
  async uploadFile(file: File, folder: string = ""): Promise<string> {
    console.log(`[R2StorageService] MOCK Uploading file ${file.name} to R2...`);
    
    // TODO: Gerçek entegrasyon için @aws-sdk/client-s3 paketini kurup burayı yapılandırın:
    // const client = new S3Client({ region: 'auto', endpoint: process.env.R2_ENDPOINT, credentials: {...} });
    // const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: filename, Body: buffer });
    // await client.send(command);
    
    console.warn("R2StorageService henüz tam olarak yapılandırılmadı. AWS SDK gerektirir.");
    throw new Error("R2StorageService upload functionality is not yet fully configured.");
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    console.log(`[R2StorageService] MOCK Deleting file ${fileUrl} from R2...`);
    // TODO: R2 üzerinden silme mantığı
    return true;
  }
}

// Storage Factory: .env üzerinden sağlayıcı seçimi
const getStorageService = (): IStorageService => {
  // .env dosyasındaki STORAGE_PROVIDER değerine bakar. (Örn: STORAGE_PROVIDER="r2")
  // Varsayılan olarak "local" kullanır.
  const provider = process.env.STORAGE_PROVIDER || "local";
  
  if (provider === "r2") {
    return new R2StorageService();
  }
  
  // Varsayılan sağlayıcı: Yerel dosya sistemi
  return new LocalStorageService();
};

// Singleton olarak dışarı aktarılır. Uygulamanın her yerinde tek bir nesne kullanılır.
export const storageService: IStorageService = getStorageService();

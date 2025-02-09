import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Interface pour la réponse de Cloudinary
interface CloudinaryResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export const uploadToCloudinary = async (
  file: string
): Promise<CloudinaryResponse> => {
  try {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto",
      folder: "app-files",
      // Pour les fichiers raw, on force le format
      ...(file.includes("application/") && {
        resource_type: "raw",
        format: file.split(";")[0].split("/")[1] || "raw",
      }),
      timeout: 120000, // 120 secondes
    };

    const result = (await cloudinary.uploader.upload(
      file,
      uploadOptions
    )) as CloudinaryResponse;

    // Pour les fichiers raw, on doit définir le format manuellement
    if (result.resource_type === "raw" && !result.format) {
      result.format = file.split(";")[0].split("/")[1] || "raw";
    }

    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      format: result.format || "raw", // Valeur par défaut pour les fichiers raw
      resource_type: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Erreur lors de l'upload sur Cloudinary:", error);
    throw new Error("Erreur lors de l'upload du fichier");
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Erreur lors de la suppression sur Cloudinary:", error);
    throw new Error("Erreur lors de la suppression du fichier");
  }
};

export default cloudinary;

import { ChangeEvent, useState } from "react";
import { Image, Loader2, Upload } from "lucide-react";
import { uploadMedia } from "../api";
import type { MediaUpload } from "../types";

export default function MediaUploadSection({
  slug,
  media,
  onUploaded
}: {
  slug: string;
  media: MediaUpload[];
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      await uploadMedia(slug, file);
      setMessage("Dosyanız yüklendi.");
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya yüklenemedi.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="content-section upload-section">
      <div className="section-title">
        <Image size={20} />
        <h2>Fotoğraflarınızı Paylaşın</h2>
      </div>
      <p>
        Etkinlikten çektiğiniz fotoğraf ve videoları yükleyin. Dosyalar lokal
        backend'de saklanır.
      </p>
      <label className="upload-dropzone">
        {uploading ? <Loader2 size={24} className="spin" /> : <Upload size={24} />}
        <span>{uploading ? "Yükleniyor..." : "Fotoğraf / Video Yükle"}</span>
        <input type="file" accept="image/*,video/*" onChange={onChange} disabled={uploading} />
      </label>
      {message ? <p className="success-message">{message}</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      {media.length ? (
        <div className="shared-media">
          <h3>Paylaşılan Anılar</h3>
          <div className="shared-grid">
            {media.map((item) =>
              item.mimeType.startsWith("video/") ? (
                <video src={item.fileUrl} controls key={item.id} />
              ) : (
                <img src={item.fileUrl} alt={item.originalName} key={item.id} />
              )
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

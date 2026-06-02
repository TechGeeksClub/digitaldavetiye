import { Image, Upload } from "lucide-react";

export default function MediaUploadSection({
  uploadUrl
}: {
  uploadUrl?: string;
}) {
  const hasUploadUrl = Boolean(uploadUrl);

  return (
    <section className="content-section upload-section">
      <div className="section-title">
        <Image size={20} />
        <h2>Fotoğraflarınızı Paylaşın</h2>
      </div>
      <p>
        Etkinlikten çektiğiniz fotoğraf ve videoları ortak albüm için paylaşabilirsiniz.
      </p>
      {hasUploadUrl ? (
        <a className="upload-dropzone" href={uploadUrl} target="_blank" rel="noreferrer">
          <Upload size={24} />
          <span>Fotoğraf / Video Yükle</span>
        </a>
      ) : (
        <button className="upload-dropzone" type="button" disabled>
          <Upload size={24} />
          <span>Yükleme Linki Hazırlanıyor</span>
        </button>
      )}
    </section>
  );
}

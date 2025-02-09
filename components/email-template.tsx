import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface EmailTemplateProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  previewUrl?: string; // URL d'une image de preview si disponible
}

const EmailTemplate = ({
  fileUrl,
  fileName,
  fileType,
  previewUrl,
}: EmailTemplateProps) => {
  // Déterminer quelle preview montrer selon le type de fichier
  const getPreviewContent = () => {
    if (fileName?.includes("pdf")) {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="https://docuspheres.vercel.app/pdf.png"
            alt="PDF"
            width={48}
            height={48}
          />
        </div>
      );
    } else if (fileName?.includes("image")) {
      return (
        <div className="w-16 h-16 mx-auto overflow-hidden rounded-lg">
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    } else if (
      fileName?.includes("word") ||
      fileName?.includes("document") ||
      fileName?.includes("application/doc") ||
      fileName?.includes("docx")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="https://docuspheres.vercel.app/word.png"
            alt="Word"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    } else if (
      fileName?.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) ||
      fileName?.includes("application/vnd.ms-excel") ||
      fileName?.includes("application/excel") ||
      fileName?.includes("application/x-excel") ||
      fileName?.includes("application/xlsx")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="https://docuspheres.vercel.app/excel.png"
            alt="excel"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    } else if (
      fileName?.includes("text/plain") ||
      fileName?.includes("text/html") ||
      fileName?.includes("text/css") ||
      fileName?.includes("text/javascript") ||
      fileName?.includes("txt")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="https://docuspheres.vercel.app/txt.png"
            alt="texte"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    } else if (
      fileName?.includes("text/csv") ||
      fileName?.includes("application/csv") ||
      fileName?.includes("csv")
    ) {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="/csv.png"
            alt="csv"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 mx-auto">
          <img
            src="https://docuspheres.vercel.app/text.png"
            alt="File"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      );
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Un fichier a été partagé avec vous: {fileName}</Preview>
      <Body
        style={{
          fontFamily: "sans-serif",
          backgroundColor: "#ffffff",
        }}
      >
        <Container>
          <Section style={{ padding: "20px" }}>
            <Text>Un fichier a été partagé avec vous</Text>

            {/* Zone de preview */}
            <Section
              style={{
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              {getPreviewContent()}
            </Section>

            {/* Informations sur le fichier */}
            <Section
              style={{
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Text style={{ margin: "0" }}>
                <strong>Nom:</strong> {fileName}
              </Text>
              <Text style={{ margin: "5px 0" }}>
                <strong>Type:</strong>{" "}
                {fileType === "file" ? "Fichier" : "Image"}
              </Text>
            </Section>

            {/* Bouton de téléchargement */}
            <Section style={{ textAlign: "center", marginTop: "20px" }}>
              <Link
                href={fileUrl}
                style={{
                  backgroundColor: "#0070f3",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Voir le fichier
              </Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailTemplate;

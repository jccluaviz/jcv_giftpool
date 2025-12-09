import { jsPDF } from "jspdf";
import { User, Contribution, Gift } from "../types";

export const generateContributionCertificate = (user: User, contributions: Contribution[], gifts: Gift[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(162, 28, 175); // Purple 700
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Certificado de Aportaciones", 105, 25, { align: "center" });

  // User Info
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  doc.text(`Usuario: ${user.name}`, 20, 55);
  doc.text(`Email: ${user.email}`, 20, 62);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 69);

  // Table Header
  let y = 85;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 8, 170, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Regalo", 25, y);
  doc.text("Fecha", 100, y);
  doc.text("Cantidad (€)", 160, y);

  // Table Body
  doc.setFont("helvetica", "normal");
  y += 10;
  
  let total = 0;

  contributions.forEach((contribution) => {
    const gift = gifts.find(g => g.id === contribution.giftId);
    const giftName = gift ? gift.name : "Regalo eliminado";
    const date = new Date(contribution.date).toLocaleDateString();
    
    doc.text(giftName.substring(0, 35) + (giftName.length > 35 ? "..." : ""), 25, y);
    doc.text(date, 100, y);
    doc.text(`${contribution.amount.toFixed(2)} €`, 160, y);
    
    total += contribution.amount;
    y += 8;
  });

  // Total
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.line(20, y, 190, y);
  y += 8;
  doc.text("TOTAL APORTADO:", 100, y);
  doc.text(`${total.toFixed(2)} €`, 160, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("GiftPool App - Gestionado por Vercel", 105, 280, { align: "center" });

  doc.save(`cert_aportaciones_${user.name.replace(/\s+/g, '_')}.pdf`);
};

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { StartupApplication } from "../types";

/**
 * Generates and downloads a general PDF report containing a table of all approved startup applications.
 */
export const downloadGeneralApprovedPDF = (applications: StartupApplication[]) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  // Title section
  doc.setFillColor(29, 78, 216); // Royal Blue
  doc.rect(0, 0, 297, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("JizPi STARTUP LIGASI", 15, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Tasdiqlangan jamoalar va startuplar umumiy ro'yxati", 15, 26);

  const currentDate = new Date().toLocaleDateString("uz-UZ");
  doc.text(`Sana: ${currentDate}`, 250, 18);

  // Table header & rows
  const tableHeaders = [
    ["T/r", "Jamoa nomi", "Sardor", "Hudud", "A'zolar soni", "Sardor bandligi", "Loyiha qisqacha mazmuni"]
  ];

  const tableData = applications.map((app, index) => [
    index + 1,
    app.teamName,
    app.applicantName,
    `${app.residenceRegion}, ${app.residenceCityDistrict}`,
    `${app.teamSize} nafar`,
    app.applicantOccupation,
    app.projectSummary.length > 120 
      ? app.projectSummary.substring(0, 120) + "..."
      : app.projectSummary
  ]);

  // Generate Table
  autoTable(doc, {
    startY: 42,
    head: tableHeaders,
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [29, 78, 216],
      textColor: [255, 255, 255],
      fontSize: 10,
      halign: "center",
      valign: "middle"
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak"
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 35, fontStyle: "bold" },
      2: { cellWidth: 30 },
      3: { cellWidth: 45 },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 40 },
      6: { cellWidth: 90 }
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Sahifa ${data.pageNumber} / ${pageCount}`,
        275,
        200,
        { align: "right" }
      );
      doc.text(
        "Jizzax Politexnika Instituti - StartUp Loyihalarni Qo'llab-quvvatlash Markazi",
        15,
        200
      );
    }
  });

  // Signature lines below table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  if (finalY < 180) {
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("Mas'ul shaxslar imsolari:", 15, finalY);

    doc.setFont("helvetica", "normal");
    doc.text("Loyiha koordinatori: _____________________  (U. Abdullayev)", 15, finalY + 10);
    doc.text("Komissiya raisi:        _____________________  (JizPi Rektorati)", 15, finalY + 18);
  }

  doc.save(`JizPi_StartUp_Ligasi_Umumiy_Ruyxat_${currentDate.replace(/\./g, "_")}.pdf`);
};

/**
 * Generates and downloads a detailed single PDF report for a selected startup application.
 */
export const downloadIndividualTeamPDF = (app: StartupApplication) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const currentDate = new Date().toLocaleDateString("uz-UZ");

  // Modern Top Border Style
  doc.setFillColor(30, 58, 138); // Navy Blue
  doc.rect(0, 0, 210, 10, "F");

  // Title / Institution
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(12);
  doc.text("JIZZAX POLITEXNIKA INSTITUTI", 105, 20, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("STARTUP LOYIHALARNI QO'LLAB-QUVVATLASH MARKAZI", 105, 25, { align: "center" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 30, 195, 30);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`LOYIHA BAYONNOMASI (PASPORTI)`, 105, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ro'yxatga olingan sana: ${new Date(app.createdAt).toLocaleDateString("uz-UZ")}`, 105, 45, { align: "center" });

  // Box 1: Team & Project details
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 52, 180, 50, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(15, 52, 180, 50, "S");

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  
  // Section Row titles
  doc.setFont("helvetica", "bold");
  doc.text("StartUp Jamoa Nomi:", 20, 60);
  doc.setFont("helvetica", "normal");
  doc.text(app.teamName, 65, 60);

  doc.setFont("helvetica", "bold");
  doc.text("Jamoa Sardori:", 20, 68);
  doc.setFont("helvetica", "normal");
  doc.text(app.applicantName, 65, 68);

  doc.setFont("helvetica", "bold");
  doc.text("Sardor bandligi:", 20, 76);
  doc.setFont("helvetica", "normal");
  doc.text(app.applicantOccupation, 65, 76);

  doc.setFont("helvetica", "bold");
  doc.text("Yashash manzili:", 20, 84);
  doc.setFont("helvetica", "normal");
  doc.text(`${app.residenceRegion}, ${app.residenceCityDistrict}`, 65, 84);

  doc.setFont("helvetica", "bold");
  doc.text("Loyiha holati (Status):", 20, 92);
  doc.setFont("helvetica", "bold");
  if (app.status === "approved") {
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text("TASDIQLANGAN", 65, 92);
  } else if (app.status === "rejected") {
    doc.setTextColor(244, 63, 94); // Rose Red
    doc.text("RAD ETILGAN", 65, 92);
  } else {
    doc.setTextColor(245, 158, 11); // Amber
    doc.text("KO'RIB CHIQILMOQDA (Kutilmoqda)", 65, 92);
  }

  // Restore defaults
  doc.setTextColor(15, 23, 42);

  // Project Summary Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Loyiha haqida qisqacha mazmuni:", 15, 111);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  
  // Split long project summary into lines
  const splitSummary = doc.splitTextToSize(app.projectSummary, 175);
  doc.text(splitSummary, 15, 117);

  // Team Members Table
  const memberYOffset = 117 + (splitSummary.length * 5) + 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Jamoa a'zolari ro'yxati (${app.teamSize} nafar):`, 15, memberYOffset);

  const memberHeaders = [["T/r", "F.I.Sh (Ism-familiya)", "Telefon raqami", "Ish yoki o'qish manzili"]];
  const memberRows = app.members.map((member, i) => [
    i + 1,
    member.fullName,
    member.phone,
    member.occupation
  ]);

  autoTable(doc, {
    startY: memberYOffset + 4,
    head: memberHeaders,
    body: memberRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 9,
      halign: "left"
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55, fontStyle: "bold" },
      2: { cellWidth: 40 },
      3: { cellWidth: 75 }
    },
    margin: { left: 15, right: 15 }
  });

  // Signature stamp
  const lastY = (doc as any).lastAutoTable.finalY + 15;
  if (lastY < 260) {
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("Mas'ullar:", 15, lastY);
    
    doc.setFont("helvetica", "normal");
    doc.text("Loyiha Sardori:  _________________ / _________________", 15, lastY + 8);
    doc.text("Admin (Koordinator): _______________ (U. Abdullayev)", 15, lastY + 16);

    // Mini Approved Stamp visual
    if (app.status === "approved") {
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.6);
      doc.rect(140, lastY + 2, 45, 16, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text("JizPi StartUp LIGASI", 162, lastY + 8, { align: "center" });
      doc.text("TASDIQLANDI", 162, 12 + lastY, { align: "center" });
    }
  }

  // Page bottom label
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Hujjat avtomatik ravishda JizPi StartUp Ligasi platformasi orqali tayyorlandi.", 105, 287, { align: "center" });

  doc.save(`Startup_Pasporti_${app.teamName.replace(/\s+/g, "_")}.pdf`);
};

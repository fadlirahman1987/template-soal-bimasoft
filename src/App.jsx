import { useState, useCallback, useRef, useEffect } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";

const INITIAL_QUESTION = () => ({
  id: Date.now() + Math.random(),
  question: "",
  questionImage: null, // Base64 image untuk pertanyaan
  questionImageName: "", // Nama file gambar
  options: ["", "", "", "", ""],
  kunciJawaban: "A",
});

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

// ─── XML helper ───────────────────────────────────────────────────────────────
function escXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper to escape HTML characters
function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── HTML Table Helper for Bimasoft ───────────────────────────────────────────
function generateHtmlTable(questions) {
  let html = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: \'Times New Roman\', serif; font-size: 12pt;">';
  
  questions.forEach((q, idx) => {
    // Question row
    html += `<tr><td style="width: 8%; text-align: center; font-weight: bold; vertical-align: top;">${idx + 1}</td><td colspan="2" style="width: 92%; padding: 6px;">${escHtml(q.question)}</td></tr>`;
    
    // Options
    const labels = ["A", "B", "C", "D", "E"];
    labels.forEach((label, oIdx) => {
      html += `<tr><td style="width: 8%;"></td><td style="width: 8%; text-align: center; font-weight: bold; vertical-align: top;">${label}</td><td style="width: 84%; padding: 6px;">${escHtml(q.options[oIdx])}</td></tr>`;
    });
  });
  
  html += '</table>';
  return html;
}

// ─── Build docm XML rows ───────────────────────────────────────────────────────
function buildQuestionRow(questionText, imageXml = "") {
  return `<w:tr><w:tc><w:tcPr><w:tcW w:w="886" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:autoSpaceDE w:val="0"/><w:autoSpaceDN w:val="0"/><w:adjustRightInd w:val="0"/><w:spacing w:after="0"/><w:ind w:left="360" w:hanging="360"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="8810" w:type="dxa"/><w:gridSpan w:val="2"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/><w:spacing w:after="0" w:line="360" w:lineRule="atLeast"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr>${imageXml ? imageXml + '<w:r><w:br/></w:r>' : ''}<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>${escXml(questionText)}</w:t></w:r></w:p></w:tc></w:tr>`;
}

function buildOptionRow(letter, answerText) {
  return `<w:tr><w:tc><w:tcPr><w:tcW w:w="886" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:autoSpaceDE w:val="0"/><w:autoSpaceDN w:val="0"/><w:adjustRightInd w:val="0"/><w:spacing w:after="0"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr></w:pPr></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="919" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:autoSpaceDE w:val="0"/><w:autoSpaceDN w:val="0"/><w:adjustRightInd w:val="0"/><w:spacing w:after="0"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr><w:t>${escXml(letter)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="7891" w:type="dxa"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr><w:p><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>${escXml(answerText)}</w:t></w:r></w:p></w:tc></w:tr>`;
}

// ─── JSZip-based DOCM generator dengan support gambar ─────────────────────────
async function generateDocm(templateBase64, title, questions) {
  const binaryStr = atob(templateBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const zip = await JSZip.loadAsync(bytes);
  let docXml = await zip.file("word/document.xml").async("string");
  let relsXml = await zip.file("word/_rels/document.xml.rels").async("string");
  let contentTypesXml = await zip.file("[Content_Types].xml").async("string");

  // Hitung rId maksimum yang sudah ada di template
  const rIdMatches = relsXml.match(/Id="rId(\d+)"/g) || [];
  let maxRId = 10;
  rIdMatches.forEach(m => {
    const n = parseInt(m.match(/\d+/)[0]);
    if (n > maxRId) maxRId = n;
  });
  let nextRId = maxRId + 1;

  // Hitung index media yang sudah ada
  const mediaFiles = Object.keys(await zip.files).filter(f => f.startsWith('word/media/'));
  let nextMediaIndex = mediaFiles.length + 1;

  // Build table rows
  let tableRows = "";
  const imageRels = []; // simpan mapping: { rId, mediaFilename, qIndex }

  for (let qIndex = 0; qIndex < questions.length; qIndex++) {
    const q = questions[qIndex];
    let imageXml = "";

    if (q.questionImage) {
      const rId = `rId${nextRId}`;
      const imgNum = imageRels.length + 1;
      const ext = (q.questionImageName.split('.').pop() || 'png').toLowerCase();
      const mediaFilename = `image${nextMediaIndex}.${ext}`;

      imageRels.push({ rId, mediaFilename, qIndex });
      nextRId++;
      nextMediaIndex++;

      // XML gambar dengan namespace inline (WAJIB agar Word bisa buka)
      imageXml = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="3657600" cy="2743200"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${imgNum}" name="Picture ${imgNum}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${imgNum}" name="Picture ${imgNum}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="3657600" cy="2743200"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
    }

    tableRows += buildQuestionRow(q.question, imageXml);
    for (let i = 0; i < OPTION_LABELS.length; i++) {
      tableRows += buildOptionRow(OPTION_LABELS[i], q.options[i] || "");
    }
  }

  const tableXml = `<w:tbl><w:tblPr><w:tblW w:w="9696" w:type="dxa"/><w:tblInd w:w="-2" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/></w:tblPr><w:tblGrid><w:gridCol w:w="886"/><w:gridCol w:w="919"/><w:gridCol w:w="7891"/></w:tblGrid>${tableRows}</w:tbl>`;

  // Update title dynamically by targeting the Content Control (Post Title)
  const postTitleRegex = /(<w:sdt>(?:(?!<\/w:sdt>)[\s\S])*?<w:alias w:val="Post Title"\/>[\s\S]*?<w:sdtContent>)[\s\S]*?(<\/w:sdtContent>\s*<\/w:sdt>)/;
  if (postTitleRegex.test(docXml)) {
    docXml = docXml.replace(
      postTitleRegex,
      `$1<w:p><w:pPr><w:pStyle w:val="Publishwithline"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>${escXml(title)}</w:t></w:r></w:p>$2`
    );
  } else {
    // Fallback if not inside Content Control
    docXml = docXml.replace(
      /<w:t>HELITA EKONOMI KELAS 10 123-SMAN3TGR<\/w:t>/,
      `<w:t>${escXml(title)}</w:t>`
    );
  }

  // Update timestamp
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  docXml = docXml.replace(
    /This post was published to Publikasi Bimasoft at [^<]*/,
    `This post was published to Publikasi Bimasoft at ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`
  );

  // Replace tabel
  docXml = docXml.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/, tableXml);

  // Update Custom XML databinding value untuk PostTitle jika ada
  const customXmlFiles = Object.keys(zip.files).filter(f => f.startsWith('customXml/') && f.endsWith('.xml') && !f.includes('itemProps'));
  for (const xmlFile of customXmlFiles) {
    let xmlContent = await zip.file(xmlFile).async("string");
    if (xmlContent.includes("<BlogPostInfo") || xmlContent.includes("<PostTitle")) {
      if (xmlContent.includes("<PostTitle/>")) {
        xmlContent = xmlContent.replace("<PostTitle/>", `<PostTitle>${escXml(title)}</PostTitle>`);
      } else {
        xmlContent = xmlContent.replace(/<PostTitle>[\s\S]*?<\/PostTitle>/, `<PostTitle>${escXml(title)}</PostTitle>`);
      }
      zip.file(xmlFile, xmlContent);
    }
  }

  // Tambahkan gambar ke dalam zip
  for (const rel of imageRels) {
    const q = questions[rel.qIndex];
    const base64 = q.questionImage.includes(',') ? q.questionImage.split(',')[1] : q.questionImage;
    const binary = atob(base64);
    const imgBytes = new Uint8Array(binary.length);
    for (let j = 0; j < binary.length; j++) imgBytes[j] = binary.charCodeAt(j);

    // Tambah file gambar ke word/media/
    zip.file(`word/media/${rel.mediaFilename}`, imgBytes);

    // Tambah relationship (masukkan sebelum </Relationships>)
    const closeTag = relsXml.lastIndexOf('</Relationships>');
    const newRel = `<Relationship Id="${rel.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${rel.mediaFilename}"/>`;
    relsXml = relsXml.substring(0, closeTag) + newRel + relsXml.substring(closeTag);

    // Tambah content type jika belum ada
    const ext = rel.mediaFilename.split('.').pop();
    if (!contentTypesXml.includes(`Extension="${ext}"`)) {
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const closeTypes = contentTypesXml.lastIndexOf('</Types>');
      const newType = `<Default Extension="${ext}" ContentType="${mimeType}"/>`;
      contentTypesXml = contentTypesXml.substring(0, closeTypes) + newType + contentTypesXml.substring(closeTypes);
    }
  }

  zip.file("word/document.xml", docXml);
  zip.file("word/_rels/document.xml.rels", relsXml);
  zip.file("[Content_Types].xml", contentTypesXml);

  return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.ms-word.document.macroEnabled.12" });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [title, setTitle] = useState(() => {
    return localStorage.getItem("bimasoft_title") || "HELITA EKONOMI KELAS 10 123-SMAN3TGR";
  });
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("bimasoft_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading questions from localStorage", e);
    }
    return [INITIAL_QUESTION()];
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateBase64, setTemplateBase64] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const fileInputRef = useRef();

  // WordPress / Bimasoft CBT site publishing states
  const [wpUrl, setWpUrl] = useState(() => localStorage.getItem("bimasoft_wp_url") || "");
  const [wpUser, setWpUser] = useState(() => localStorage.getItem("bimasoft_wp_user") || "");
  const [wpPassword, setWpPassword] = useState(() => localStorage.getItem("bimasoft_wp_pwd") || "");
  const [wpPublishing, setWpPublishing] = useState(false);
  const [showWpPassword, setShowWpPassword] = useState(false);

  // Auto-save title and questions to localStorage
  useEffect(() => {
    localStorage.setItem("bimasoft_title", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem("bimasoft_questions", JSON.stringify(questions));
  }, [questions]);

  // Auto-save WordPress credentials
  useEffect(() => {
    localStorage.setItem("bimasoft_wp_url", wpUrl);
  }, [wpUrl]);

  useEffect(() => {
    localStorage.setItem("bimasoft_wp_user", wpUser);
  }, [wpUser]);

  useEffect(() => {
    localStorage.setItem("bimasoft_wp_pwd", wpPassword);
  }, [wpPassword]);

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTemplateFile(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result.split(",")[1];
      setTemplateBase64(b64);
      setStatus({ type: "success", msg: `Template "${file.name}" berhasil dimuat.` });
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    const newQ = INITIAL_QUESTION();
    setQuestions((prev) => [...prev, newQ]);
    setActiveQuestion(questions.length);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setActiveQuestion(Math.max(0, idx - 1));
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateQuestionImage = (idx, base64, filename) => {
    setQuestions((prev) =>
      prev.map((q, i) => 
        i === idx 
          ? { ...q, questionImage: base64, questionImageName: filename }
          : q
      )
    );
  };

  const removeQuestionImage = (idx) => {
    setQuestions((prev) =>
      prev.map((q, i) => 
        i === idx 
          ? { ...q, questionImage: null, questionImageName: "" }
          : q
      )
    );
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = [...q.options];
        newOptions[optIdx] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleGenerate = async () => {
    if (!templateBase64) {
      setStatus({ type: "error", msg: "Harap upload file template .docm terlebih dahulu." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const blob = await generateDocm(templateBase64, title, questions);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = title.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 50);
      a.download = `${safeName}.docm`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: "success", msg: `File "${safeName}.docm" berhasil diunduh!` });
    } catch (err) {
      setStatus({ type: "error", msg: `Gagal: ${err.message}` });
    }
    setLoading(false);
  };

  const handleExportExcel = () => {
    try {
      const data = questions.map((q, i) => {
        const keyLetter = q.kunciJawaban || "A";
        const keyIndex = OPTION_LABELS.indexOf(keyLetter);
        const keyText = keyIndex !== -1 ? q.options[keyIndex] : "";

        return {
          "No": i + 1,
          "Pertanyaan": q.question || "",
          "Kunci Jawaban": keyLetter,
          "Teks Kunci": keyText,
          "Pilihan A": q.options[0] || "",
          "Pilihan B": q.options[1] || "",
          "Pilihan C": q.options[2] || "",
          "Pilihan D": q.options[3] || "",
          "Pilihan E": q.options[4] || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kunci Jawaban");

      const safeName = title.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 50);
      XLSX.writeFile(workbook, `Kunci_Jawaban_${safeName}.xlsx`);
      setStatus({ type: "success", msg: `File kunci jawaban "Kunci_Jawaban_${safeName}.xlsx" berhasil diekspor!` });
    } catch (err) {
      setStatus({ type: "error", msg: `Gagal ekspor Excel: ${err.message}` });
    }
  };

  const handleExportJSON = () => {
    try {
      const data = {
        title,
        questions
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = title.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 50);
      a.download = `Backup_Soal_${safeName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: "success", msg: "Draf berhasil disimpan sebagai file JSON di komputer Anda!" });
    } catch (err) {
      setStatus({ type: "error", msg: `Gagal menyimpan draf: ${err.message}` });
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.title !== undefined) setTitle(parsed.title);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
          setActiveQuestion(0);
          setStatus({ type: "success", msg: "Draf berhasil dimuat dari file JSON!" });
        } else {
          throw new Error("Format file draf tidak valid.");
        }
      } catch (err) {
        setStatus({ type: "error", msg: `Gagal memuat draf: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua ketikan soal dan memulai dari awal?")) {
      setTitle("HELITA EKONOMI KELAS 10 123-SMAN3TGR");
      setQuestions([INITIAL_QUESTION()]);
      setActiveQuestion(0);
      localStorage.removeItem("bimasoft_title");
      localStorage.removeItem("bimasoft_questions");
      setStatus({ type: "success", msg: "Semua soal berhasil di-reset!" });
    }
  };

  const handlePublishToCbt = async () => {
    if (!wpUrl) {
      setStatus({ type: "error", msg: "Harap masukkan URL XML-RPC WordPress terlebih dahulu." });
      return;
    }
    if (!wpUser || !wpPassword) {
      setStatus({ type: "error", msg: "Harap isi Username dan Password Bimasoft/WordPress Anda." });
      return;
    }
    if (!title.trim()) {
      setStatus({ type: "error", msg: "Harap isi Judul Postingan / Kode Test terlebih dahulu." });
      return;
    }

    setWpPublishing(true);
    setStatus(null);

    try {
      const htmlContent = generateHtmlTable(questions);
      
      // Ensure URL ends with xmlrpc.php
      let targetUrl = wpUrl.trim();
      if (!targetUrl.endsWith("xmlrpc.php")) {
        if (targetUrl.endsWith("/")) {
          targetUrl += "xmlrpc.php";
        } else {
          targetUrl += "/xmlrpc.php";
        }
      }

      // Construct XML-RPC payload for wp.newPost
      const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.newPost</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${escXml(wpUser)}</string></value></param>
    <param><value><string>${escXml(wpPassword)}</string></value></param>
    <param>
      <value>
        <struct>
          <member>
            <name>post_title</name>
            <value><string>${escXml(title)}</string></value>
          </member>
          <member>
            <name>post_content</name>
            <value><string>${escXml(htmlContent)}</string></value>
          </member>
          <member>
            <name>post_status</name>
            <value><string>publish</string></value>
          </member>
          <member>
            <name>post_type</name>
            <value><string>post</string></value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml",
        },
        body: xmlPayload,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const responseText = await response.text();

      if (responseText.includes("<fault>")) {
        const faultMatch = responseText.match(/<member><name>faultString<\/name><value><string>([^<]+)/);
        const faultMsg = faultMatch ? faultMatch[1] : "Gagal otentikasi atau kesalahan XML-RPC.";
        throw new Error(faultMsg);
      }

      setStatus({ type: "success", msg: "Soal berhasil diunggah langsung ke website CBT Bimasoft!" });
    } catch (err) {
      setStatus({ type: "error", msg: `Gagal mengirim ke website: ${err.message}` });
    } finally {
      setWpPublishing(false);
    }
  };

  const q = questions[activeQuestion];

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 50% 0%, #111827 0%, #030712 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#f1f5f9",
      padding: "0",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-panel:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(99, 102, 241, 0.25);
          transform: translateY(-2px);
        }
        .text-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .text-input:focus {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .sidebar-item {
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }
        .sidebar-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
          border: none;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
          filter: brightness(1.1);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(1px);
        }
        .btn-excel {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
          border: none;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-excel:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
          filter: brightness(1.1);
        }
        .btn-excel:active:not(:disabled) {
          transform: translateY(1px);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: #fff;
        }
        .btn-danger {
          background: rgba(244, 63, 94, 0.05);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fca5a5;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .btn-danger:hover {
          background: rgba(244, 63, 94, 0.12);
          border-color: rgba(244, 63, 94, 0.4);
          color: #fff;
        }
        .option-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #94a3b8;
          flex-shrink: 0;
        }
        .option-circle:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
          transform: scale(1.05);
        }
        .option-circle.active {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #34d399;
          color: #fff;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.55);
        }
        .alert-success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.05);
        }
        .alert-error {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #f43f5e;
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.05);
        }
        .dropzone {
          padding: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        .dropzone:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
          color: #fff;
        }
        .dropzone.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          color: #a7f3d0;
          border-style: solid;
        }
        .image-uploader {
          padding: 20px;
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .image-uploader:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.04);
          color: #fff;
        }
        .image-preview-bar {
          padding: 12px 16px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "rgba(10, 15, 30, 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
          }}>📝</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px" }}>
              Generator Template Soal Bimasoft v.1.4.0
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Sistem Pengolah Ujian & Ekspor Docx/Excel</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            color: "#a5b4fc",
            fontWeight: "600",
          }}>
            {questions.length} Soal
          </span>
          <span style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            color: "#34d399",
            fontWeight: "600",
          }}>
            Format .docm & .xlsx
          </span>
          <button
            onClick={() => setShowAboutModal(true)}
            className="btn-secondary"
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ℹ️ Tentang Aplikasi
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 73px)" }}>
        {/* Left sidebar - Question list */}
        <div style={{
          width: "240px",
          flexShrink: 0,
          background: "rgba(9, 13, 22, 0.6)",
          backdropFilter: "blur(8px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxHeight: "calc(100vh - 73px)",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", paddingLeft: "8px", fontWeight: "700" }}>
            Daftar Soal
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flex: 1, paddingRight: "2px" }}>
            {questions.map((q, i) => {
              const isKeySet = !!q.kunciJawaban;
              return (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestion(i)}
                  className={`sidebar-item ${activeQuestion === i ? "active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      width: "20px", height: "20px",
                      borderRadius: "50%",
                      background: activeQuestion === i ? "#6366f1" : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold",
                      color: activeQuestion === i ? "#fff" : "#94a3b8",
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ 
                      fontWeight: activeQuestion === i ? "600" : "500",
                      color: activeQuestion === i ? "#fff" : "#cbd5e1"
                    }}>
                      Soal {i + 1}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {isKeySet && (
                      <span 
                        style={{
                          width: "6px", height: "6px",
                          borderRadius: "50%",
                          background: "#10b981",
                          boxShadow: "0 0 8px #10b981",
                        }} 
                        title={`Kunci: ${q.kunciJawaban}`}
                      />
                    )}
                    {questions.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                        style={{
                          background: "none", border: "none", color: "#64748b",
                          cursor: "pointer", fontSize: "14px", padding: "0 2px",
                          lineHeight: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#f43f5e"}
                        onMouseLeave={(e) => e.target.style.color = "#64748b"}
                        title="Hapus soal"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addQuestion}
            style={{
              marginTop: "12px",
              padding: "10px",
              borderRadius: "10px",
              border: "1px dashed rgba(99, 102, 241, 0.4)",
              background: "rgba(99, 102, 241, 0.05)",
              color: "#a5b4fc",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.7)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.05)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
              e.currentTarget.style.color = "#a5b4fc";
            }}
          >
            ➕ Tambah Soal
          </button>

          <div style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            margin: "16px 0 12px 0"
          }} />

          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px", paddingLeft: "8px", fontWeight: "700" }}>
            Penyimpanan & Draf
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={handleExportJSON}
              className="btn-secondary"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                fontSize: "12px",
                fontWeight: "500",
              }}
              title="Unduh draf ketikan ke komputer Anda"
            >
              💾 Simpan Berkas Draf
            </button>

            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = handleImportJSON;
                input.click();
              }}
              className="btn-secondary"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                fontSize: "12px",
                fontWeight: "500",
              }}
              title="Unggah berkas draf (.json) yang tersimpan sebelumnya"
            >
              📂 Unggah Berkas Draf
            </button>

            <button
              onClick={handleReset}
              className="btn-danger"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "6px",
                width: "100%",
                fontSize: "12px",
                fontWeight: "600",
              }}
              title="Hapus semua ketikan dan mulai ulang"
            >
              🧹 Reset Semua Soal
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          
          {/* Template Upload & Config */}
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f59e0b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              ⚙️ Konfigurasi Dokumen
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Upload template */}
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
                  File Template .docm *
                </label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`dropzone ${templateBase64 ? "active" : ""}`}
                >
                  {templateBase64 ? "🟢" : "📁"} {templateFile || "Klik untuk upload template..."}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docm,.docx"
                  onChange={handleTemplateUpload}
                  style={{ display: "none" }}
                />
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
                  Judul Postingan (Post Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-input"
                />
              </div>
            </div>
          </div>

          {/* Question editor */}
          {q && (
            <div className="glass-panel" style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f59e0b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                📌 Soal Nomor {activeQuestion + 1}
              </div>

              {/* Question text */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
                  Teks Pertanyaan
                </label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(activeQuestion, "question", e.target.value)}
                  rows={4}
                  className="text-input"
                  style={{ resize: "vertical", lineHeight: "1.6" }}
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>

              {/* Upload Gambar */}
              <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "8px", fontWeight: "700" }}>
                  🖼️ Gambar Pertanyaan (Opsional)
                </label>
                {!q.questionImage ? (
                  <div
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/png,image/jpeg,image/jpg';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateQuestionImage(activeQuestion, ev.target.result, file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="image-uploader"
                  >
                    📁 Klik untuk upload gambar (PNG/JPG)
                  </div>
                ) : (
                  <div className="image-preview-bar">
                    <span style={{ color: "#a7f3d0", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                      🟢 {q.questionImageName}
                    </span>
                    <button
                      onClick={() => removeQuestionImage(activeQuestion)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fca5a5",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "0 8px",
                      }}
                      title="Hapus gambar"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Options */}
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  Pilihan Jawaban — Kunci: 
                  <select
                    value={q.kunciJawaban}
                    onChange={(e) => updateQuestion(activeQuestion, "kunciJawaban", e.target.value)}
                    style={{
                      background: "rgba(9, 13, 22, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "6px",
                      color: "#fff",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {OPTION_LABELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {OPTION_LABELS.map((label, i) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div 
                        className={`option-circle ${q.kunciJawaban === label ? "active" : ""}`}
                        onClick={() => updateQuestion(activeQuestion, "kunciJawaban", label)}
                      >
                        {label}
                      </div>
                      <input
                        type="text"
                        value={q.options[i]}
                        onChange={(e) => updateOption(activeQuestion, i, e.target.value)}
                        className="text-input"
                        style={{
                          border: q.kunciJawaban === label ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
                          background: q.kunciJawaban === label ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.02)",
                        }}
                        placeholder={`Pilihan ${label}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="glass-panel" style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700" }}>
              Preview Ringkas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {questions.map((q, i) => (
                <div 
                  key={q.id} 
                  style={{ 
                    padding: "12px 16px", 
                    background: "rgba(255,255,255,0.01)", 
                    borderRadius: "10px", 
                    borderLeft: "4px solid #6366f1",
                    borderTop: "1px solid rgba(255, 255, 255, 0.02)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.02)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", overflow: "hidden" }}>
                    <span style={{ color: "#6366f1", fontWeight: "700", fontSize: "13px" }}>{i + 1}. </span>
                    <span style={{ color: "#cbd5e1", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {q.question ? q.question : <em style={{ color: "#64748b" }}>Soal belum diisi</em>}
                    </span>
                  </div>
                  <span style={{ 
                    color: "#34d399", 
                    fontSize: "11px", 
                    background: "rgba(16, 185, 129, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    flexShrink: 0,
                  }}>
                    Kunci: {q.kunciJawaban}
                  </span>
                </div>
              ))}
            </div>
          </div>

    {/* Kirim Langsung ke CBT (WordPress XML-RPC) */}
    <div className="glass-panel" style={{ marginBottom: "24px" }}>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        📤 Kirim Langsung ke Website CBT Bimasoft
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
            URL Blog / Website CBT Bimasoft *
          </label>
          <input 
            type="text" 
            value={wpUrl}
            onChange={(e) => setWpUrl(e.target.value)}
            className="text-input"
            placeholder="https://cbt.sekolah.sch.id/xmlrpc.php"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
              Username *
            </label>
            <input 
              type="text" 
              value={wpUser}
              onChange={(e) => setWpUser(e.target.value)}
              className="text-input"
              placeholder="Username Anda"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type={showWpPassword ? "text" : "password"} 
                value={wpPassword}
                onChange={(e) => setWpPassword(e.target.value)}
                className="text-input"
                style={{ paddingRight: "35px" }}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowWpPassword(!showWpPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {showWpPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePublishToCbt}
        disabled={wpPublishing}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(135deg, #0284c7, #0369a1)",
          color: "#fff",
          fontWeight: "700",
          fontSize: "13px",
          cursor: wpPublishing ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.2)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!wpPublishing) {
            e.currentTarget.style.background = "linear-gradient(135deg, #0369a1, #075985)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!wpPublishing) {
            e.currentTarget.style.background = "linear-gradient(135deg, #0284c7, #0369a1)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {wpPublishing ? "⏳ Sedang Mengirim..." : "🚀 Kirim Soal ke Website Bimasoft"}
      </button>
    </div>

          {/* Status Alert */}
          {status && (
            <div 
              className={status.type === "success" ? "alert-success" : "alert-error"}
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {status.type === "success" ? "🟢" : "🔴"} {status.msg}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary"
              style={{
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                letterSpacing: "0.5px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Membuat file..." : "⬇️  Generate .docm"}
            </button>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              className="btn-excel"
              style={{
                padding: "16px",
                borderRadius: "12px",
                fontSize: "14px",
                letterSpacing: "0.5px",
              }}
            >
              📊 Ekspor Kunci (.xlsx)
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: "11px", color: "#64748b", marginTop: "16px", fontWeight: "500" }}>
            File .docm kompatibel dengan Bimasoft, dan file .xlsx dapat dibuka langsung di Microsoft Excel.
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
        onClick={() => setShowAboutModal(false)}
        >
          <div 
            className="glass-panel" 
            style={{
              width: "550px",
              maxWidth: "90%",
              background: "rgba(17, 24, 39, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "32px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAboutModal(false)}
              style={{
                position: "absolute",
                top: "20px", right: "20px",
                background: "none", border: "none", color: "#94a3b8",
                fontSize: "18px", cursor: "pointer",
              }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
            >
              ✕
            </button>

            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#fff", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
              ℹ️ Tentang Aplikasi
            </h2>

            <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <strong>Generator Template Soal Bimasoft</strong> adalah alat bantu berbasis web interaktif untuk membuat berkas template soal ujian dalam format <code>.docm</code> (Word Macro-Enabled) yang kompatibel secara instan dengan sistem Bimasoft, serta mendukung ekspor kunci jawaban ke format Excel <code>.xlsx</code>.
              </div>

              {/* Grid for Developer & Donation Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Developer Box */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <h3 style={{ fontSize: "10px", fontWeight: "700", color: "#6366f1", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                    👤 Pengembang
                  </h3>
                  <div style={{ color: "#fff", fontWeight: "600", fontSize: "14px", marginTop: "4px" }}>Fadli Rahman, S.Pd</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "2px" }}>SMK Negeri 2 Sebulu</div>
                </div>

                {/* Donation Box */}
                <div style={{
                  background: "rgba(251, 191, 36, 0.02)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(251, 191, 36, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "10px"
                }}>
                  <h3 style={{ fontSize: "10px", fontWeight: "700", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                    ☕ Dukung via Saweria
                  </h3>
                  
                  {/* Styled Saweria Button */}
                  <a
                    href="https://saweria.co/fadlirahman87"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "linear-gradient(135deg, #faae2b, #f68c1e)",
                      color: "#1e1b4b",
                      fontWeight: "700",
                      fontSize: "11px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      boxShadow: "0 4px 10px rgba(246, 140, 30, 0.2)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 14px rgba(246, 140, 30, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(246, 140, 30, 0.2)";
                    }}
                  >
                    ☕ Klik Donasi Saweria
                  </a>
                </div>

                {/* Bank Transfer Card */}
                <div style={{
                  gridColumn: "span 2",
                  background: "rgba(56, 189, 248, 0.03)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Decorative faint glow */}
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
                    pointerEvents: "none"
                  }} />

                  <h3 style={{ fontSize: "10px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    💳 Transfer Bank (Alternatif)
                  </h3>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bank Kaltimtara</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "16px", fontWeight: "700", letterSpacing: "1px" }}>0062322853</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("0062322853");
                            const btn = document.getElementById("copy-btn");
                            if (btn) {
                              btn.textContent = "Tersalin! ✓";
                              btn.style.background = "rgba(16, 185, 129, 0.2)";
                              btn.style.color = "#10b981";
                              btn.style.borderColor = "rgba(16, 185, 129, 0.3)";
                              setTimeout(() => {
                                btn.textContent = "Salin";
                                btn.style.background = "rgba(56, 189, 248, 0.1)";
                                btn.style.color = "#38bdf8";
                                btn.style.borderColor = "rgba(56, 189, 248, 0.2)";
                              }, 1500);
                            }
                          }}
                          id="copy-btn"
                          style={{
                            background: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            borderRadius: "6px",
                            color: "#38bdf8",
                            padding: "3px 10px",
                            fontSize: "10px",
                            cursor: "pointer",
                            fontWeight: "700",
                            transition: "all 0.2s ease",
                            outline: "none"
                          }}
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Atas Nama</div>
                      <div style={{ color: "#fff", fontWeight: "600", fontSize: "13px", marginTop: "4px" }}>Fadli Rahman</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version Logs */}
              <div>
                <h3 style={{ fontSize: "11px", fontWeight: "700", color: "#f59e0b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  📅 Catatan Versi (Change Log)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", color: "#94a3b8" }}>
                  <div>
                    <strong style={{ color: "#cbd5e1" }}>v1.4.0 (Juni 2026)</strong>
                    <ul style={{ paddingLeft: "16px", marginTop: "2px" }}>
                      <li>Pembungkusan aplikasi desktop (.exe) mandiri menggunakan Electron.</li>
                      <li>Integrasi pembaruan otomatis (Auto-Updater) via GitHub Releases.</li>
                      <li>Pengiriman soal ujian secara langsung ke website CBT Bimasoft (WordPress XML-RPC).</li>
                      <li>Penyimpanan aman kredensial username dan password di memori lokal (Local Storage) sekali pengisian.</li>
                      <li>Pemuatan hybrid online-offline otomatis untuk mendukung update instan tanpa unduhan besar.</li>
                    </ul>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                    <strong style={{ color: "#cbd5e1" }}>v1.3.0 (Juni 2026)</strong>
                    <ul style={{ paddingLeft: "16px", marginTop: "2px" }}>
                      <li>Desain ulang antarmuka menjadi SaaS Dashboard modern (Glassmorphism).</li>
                      <li>Penambahan tombol informasi pengembang & donasi.</li>
                    </ul>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                    <strong style={{ color: "#cbd5e1" }}>v1.2.0 (Juni 2026)</strong>
                    <ul style={{ paddingLeft: "16px", marginTop: "2px" }}>
                      <li>Fitur Auto-Save dan Auto-Load otomatis melalui browser Local Storage.</li>
                      <li>Fitur ekspor/impor berkas draf (.json) untuk pencadangan di komputer.</li>
                    </ul>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                    <strong style={{ color: "#cbd5e1" }}>v1.1.0 (Juni 2026)</strong>
                    <ul style={{ paddingLeft: "16px", marginTop: "2px" }}>
                      <li>Fitur ekspor kunci jawaban ke format Excel (.xlsx) murni menggunakan pustaka SheetJS.</li>
                    </ul>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                    <strong style={{ color: "#cbd5e1" }}>v1.0.0 (Juni 2026)</strong>
                    <ul style={{ paddingLeft: "16px", marginTop: "2px" }}>
                      <li>Rilis perdana generator draf soal .docm kompatibel Bimasoft.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

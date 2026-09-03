import { Request, Response } from "express";
import { getDbState } from "../services/dbService";

export class IndexingController {
  /**
   * GET /api/indexing/:paperId/export
   * Scholarly metadata exporter for Scopus (XML) and Google Scholar (JSON-LD)
   */
  static exportMetadata(req: Request, res: Response) {
    const { paperId } = req.params;
    const { format } = req.query; // 'xml' or 'json'
    const state = getDbState();

    const paper = state.papers.find((p) => p.id === paperId);
    if (!paper) return res.status(404).json({ error: "Manuscript index not resolved." });

    const cleanTitle = paper.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cleanAbstract = paper.abstractText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (format === "xml") {
      const scopusXml = `<?xml version="1.0" encoding="UTF-8"?>
<scopus-article-record xmlns="http://www.elsevier.com/xml/svapi/article/dtd" version="5.4">
  <coredata>
    <dc:title>${cleanTitle}</dc:title>
    <dc:creator>${paper.authorName}</dc:creator>
    <dc:publisher>ConfHub Global Indexing Agency</dc:publisher>
    <dc:identifier>scopus-id:${paper.id}</dc:identifier>
    <dc:description>${cleanAbstract}</dc:description>
    <dc:subject>${paper.domainTags.join(", ")}</dc:subject>
    <dc:date>${paper.submittedAt.split("T")[0]}</dc:date>
    <indexing-status>INDEX_READY_ACCEPTED</indexing-status>
  </coredata>
  <doaj-compliance>
    <license-type>CC-BY-NC</license-type>
    <indexing-tags>
       ${paper.domainTags.map((tag: string) => `<tag>${tag}</tag>`).join("\n       ")}
    </indexing-tags>
  </doaj-compliance>
</scopus-article-record>`;
      res.setHeader("Content-Type", "application/xml");
      return res.send(scopusXml);
    } else {
      // Metadata repository JSON standard (Google Scholar query compatibility)
      const googleMetadata = {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        headline: paper.title,
        author: {
          "@type": "Person",
          name: paper.authorName,
          email: paper.authorEmail,
        },
        description: paper.abstractText,
        keywords: paper.domainTags,
        datePublished: paper.submittedAt.split("T")[0],
        publisher: {
          "@type": "Organization",
          name: "ConfHub Nepal Publishing Platform",
        },
        indexingStatus: "Scopus & DOAJ Compliant",
      };
      return res.json(googleMetadata);
    }
  }
}

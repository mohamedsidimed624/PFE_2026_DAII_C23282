package com.onmm.backend.dto.election;

public class CandidatureDocumentDto {
    private Long id;
    private String typeDocument;
    private String fileUrl;
    private String originalFilename;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTypeDocument() { return typeDocument; }
    public void setTypeDocument(String typeDocument) { this.typeDocument = typeDocument; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
}

package com.ferreteria.repository;

import com.ferreteria.model.SalesWorkflowDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalesWorkflowDocumentRepository extends JpaRepository<SalesWorkflowDocument, UUID> {
    List<SalesWorkflowDocument> findByDocumentKindOrderByCreatedAtDesc(String documentKind);
}

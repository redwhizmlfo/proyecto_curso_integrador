package com.ferreteria.controller;

import com.ferreteria.dto.SunatRucRecordRequestDTO;
import com.ferreteria.dto.SunatRucImportResultDTO;
import com.ferreteria.model.SunatRucRecord;
import com.ferreteria.repository.SunatRucRecordRepository;
import com.ferreteria.service.SunatRucImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/sunat-ruc-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SunatRucRecordController {

    private final SunatRucRecordRepository sunatRucRecordRepository;
    private final SunatRucImportService sunatRucImportService;

    @GetMapping("/{ruc}")
    public ResponseEntity<SunatRucRecord> getByRuc(@PathVariable String ruc) {
        return ResponseEntity.ok(sunatRucRecordRepository.findById(normalizeRuc(ruc))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "RUC no encontrado en padron SUNAT local")));
    }

    @PostMapping
    public ResponseEntity<SunatRucRecord> upsert(@RequestBody SunatRucRecordRequestDTO request) {
        String ruc = normalizeRuc(request.getRuc());
        if (request.getBusinessName() == null || request.getBusinessName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "La razon social es obligatoria");
        }

        SunatRucRecord record = sunatRucRecordRepository.findById(ruc)
                .orElse(SunatRucRecord.builder().ruc(ruc).build());
        record.setBusinessName(request.getBusinessName().trim());
        record.setTaxpayerStatus(textOrDefault(request.getTaxpayerStatus(), "ACTIVO"));
        record.setDomicileCondition(textOrDefault(request.getDomicileCondition(), "HABIDO"));
        record.setUbigeo(textOrDefault(request.getUbigeo(), ""));
        record.setFiscalAddress(textOrDefault(request.getFiscalAddress(), ""));
        record.setSource("SUNAT_PADRON_REDUCIDO");

        return ResponseEntity.ok(sunatRucRecordRepository.save(record));
    }

    @PostMapping("/import/local")
    public ResponseEntity<SunatRucImportResultDTO> importLocal(
            @RequestParam String path,
            @RequestParam(defaultValue = "0") long limit
    ) {
        return ResponseEntity.ok(sunatRucImportService.importFromPath(path, limit));
    }

    @PostMapping("/import/sunat")
    public ResponseEntity<SunatRucImportResultDTO> importOfficialSunat(
            @RequestParam(defaultValue = "0") long limit
    ) {
        return ResponseEntity.ok(sunatRucImportService.importFromOfficialSunat(limit));
    }

    private String normalizeRuc(String rawRuc) {
        String ruc = rawRuc == null ? "" : rawRuc.replaceAll("\\D", "");
        if (ruc.length() != 11) {
            throw new ResponseStatusException(BAD_REQUEST, "El RUC debe tener 11 digitos");
        }
        return ruc;
    }

    private String textOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}

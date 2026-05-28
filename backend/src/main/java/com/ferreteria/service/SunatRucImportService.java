package com.ferreteria.service;

import com.ferreteria.dto.SunatRucImportResultDTO;
import com.ferreteria.model.SunatRucRecord;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.BAD_GATEWAY;

@Service
public class SunatRucImportService {

    private static final Charset SUNAT_CHARSET = Charset.forName("ISO-8859-1");

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${sunat.ruc.padron-url:https://www2.sunat.gob.pe/padron_reducido_ruc.zip}")
    private String defaultPadronUrl;

    @Transactional
    public SunatRucImportResultDTO importFromOfficialSunat(long limit) {
        try {
            Path tempFile = Files.createTempFile("sunat-padron-ruc-", ".zip");
            download(defaultPadronUrl, tempFile);
            SunatRucImportResultDTO result = importFromPath(tempFile, limit, defaultPadronUrl);
            Files.deleteIfExists(tempFile);
            return result;
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_GATEWAY, "No se pudo descargar/importar el Padron Reducido SUNAT");
        }
    }

    @Transactional
    public SunatRucImportResultDTO importFromPath(String rawPath, long limit) {
        if (rawPath == null || rawPath.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "La ruta del archivo SUNAT es obligatoria");
        }
        return importFromPath(Path.of(rawPath), limit, rawPath);
    }

    private SunatRucImportResultDTO importFromPath(Path path, long limit, String source) {
        if (!Files.exists(path)) {
            throw new ResponseStatusException(BAD_REQUEST, "No existe el archivo SUNAT: " + path);
        }

        try {
            if (path.getFileName().toString().toLowerCase().endsWith(".zip")) {
                return importFromZip(path, limit, source);
            }
            return importFromTxt(path, limit, source);
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "No se pudo leer el archivo SUNAT");
        }
    }

    private SunatRucImportResultDTO importFromZip(Path zipPath, long limit, String source) throws IOException {
        try (ZipInputStream zipInput = new ZipInputStream(new BufferedInputStream(Files.newInputStream(zipPath)))) {
            ZipEntry entry;
            while ((entry = zipInput.getNextEntry()) != null) {
                if (!entry.isDirectory() && entry.getName().toLowerCase().endsWith(".txt")) {
                    Path tempTxt = Files.createTempFile("sunat-padron-ruc-", ".txt");
                    Files.copy(zipInput, tempTxt, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    SunatRucImportResultDTO result = importFromTxt(tempTxt, limit, source);
                    Files.deleteIfExists(tempTxt);
                    return result;
                }
            }
        }
        throw new ResponseStatusException(BAD_REQUEST, "El ZIP SUNAT no contiene archivo TXT");
    }

    private SunatRucImportResultDTO importFromTxt(Path txtPath, long limit, String source) throws IOException {
        long processed = 0;
        long imported = 0;
        long skipped = 0;

        try (BufferedReader reader = Files.newBufferedReader(txtPath, SUNAT_CHARSET)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (limit > 0 && processed >= limit) {
                    break;
                }
                processed++;

                SunatRucRecord record = parseLine(line);
                if (record == null) {
                    skipped++;
                    continue;
                }

                entityManager.merge(record);
                imported++;

                if (imported % 1000 == 0) {
                    entityManager.flush();
                    entityManager.clear();
                }
            }
        }

        entityManager.flush();
        entityManager.clear();

        return SunatRucImportResultDTO.builder()
                .processed(processed)
                .imported(imported)
                .skipped(skipped)
                .source(source)
                .message("Importacion SUNAT finalizada")
                .build();
    }

    private SunatRucRecord parseLine(String line) {
        if (line == null || line.isBlank()) {
            return null;
        }

        String[] parts = line.split("\\|", -1);
        if (parts.length < 2) {
            return null;
        }

        String ruc = clean(parts[0]).replaceAll("\\D", "");
        String businessName = clean(parts[1]);
        if (ruc.length() != 11 || businessName.isBlank()) {
            return null;
        }

        String taxpayerStatus = parts.length > 2 ? clean(parts[2]) : "";
        String domicileCondition = parts.length > 3 ? clean(parts[3]) : "";
        String ubigeo = parts.length > 4 ? clean(parts[4]) : "";
        String fiscalAddress = buildAddress(parts);

        return SunatRucRecord.builder()
                .ruc(ruc)
                .businessName(businessName)
                .taxpayerStatus(taxpayerStatus.isBlank() ? "NO INFORMADO" : taxpayerStatus)
                .domicileCondition(domicileCondition.isBlank() ? "NO INFORMADO" : domicileCondition)
                .ubigeo(ubigeo)
                .fiscalAddress(fiscalAddress)
                .source("SUNAT_PADRON_REDUCIDO")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private String buildAddress(String[] parts) {
        if (parts.length <= 5) {
            return "";
        }

        StringBuilder address = new StringBuilder();
        for (int i = 5; i < parts.length; i++) {
            String value = clean(parts[i]);
            if (!value.isBlank() && !"-".equals(value)) {
                if (!address.isEmpty()) {
                    address.append(' ');
                }
                address.append(value);
            }
        }
        return address.toString().trim();
    }

    private String clean(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private void download(String url, Path destination) throws IOException {
        URL sourceUrl = URI.create(url).toURL();
        try (var input = sourceUrl.openStream()) {
            Files.copy(input, destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
    }
}

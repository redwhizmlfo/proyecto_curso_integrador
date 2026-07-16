package com.ferreteria.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferreteria.dto.SalesWorkflowDocumentRequestDTO;
import com.ferreteria.dto.SalesWorkflowDocumentResponseDTO;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.model.SalesWorkflowDocument;
import com.ferreteria.repository.ProductoModeloRepository;
import com.ferreteria.repository.SalesWorkflowDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesWorkflowDocumentService {

    private static final String KIND_QUOTATION = "quotation";
    private static final String KIND_ORDER = "order";
    private static final String KIND_DISPATCH = "dispatch";

    private final SalesWorkflowDocumentRepository repository;
    private final ProductoModeloRepository productoModeloRepository;
    private final ObjectMapper objectMapper;

    public List<SalesWorkflowDocumentResponseDTO> getQuotations() {
        return getByKind(KIND_QUOTATION);
    }

    public List<SalesWorkflowDocumentResponseDTO> getOrders() {
        return getByKind(KIND_ORDER);
    }

    public List<SalesWorkflowDocumentResponseDTO> getDispatches() {
        return getByKind(KIND_DISPATCH);
    }

    @Transactional
    public SalesWorkflowDocumentResponseDTO createQuotation(SalesWorkflowDocumentRequestDTO request) {
        return toResponse(repository.save(fromRequest(KIND_QUOTATION, request)));
    }

    @Transactional
    public SalesWorkflowDocumentResponseDTO createOrder(SalesWorkflowDocumentRequestDTO request) {
        SalesWorkflowDocument order = fromRequest(KIND_ORDER, request);
        order.setStatus(valueOrDefault(order.getStatus(), "PENDIENTE"));
        return toResponse(repository.save(order));
    }

    @Transactional
    public void delete(UUID id, String expectedKind) {
        SalesWorkflowDocument document = findDocument(id);
        ensureKind(document, expectedKind);
        repository.delete(document);
    }

    @Transactional
    public SalesWorkflowDocumentResponseDTO updateDispatchStatus(UUID id, String status) {
        SalesWorkflowDocument dispatch = findDocument(id);
        ensureKind(dispatch, KIND_DISPATCH);
        dispatch.setStatus(status);
        return toResponse(repository.save(dispatch));
    }

    @Transactional
    public SalesWorkflowDocumentResponseDTO createDispatchFromOrder(UUID orderId) {
        SalesWorkflowDocument order = findDocument(orderId);
        ensureKind(order, KIND_ORDER);

        List<Map<String, Object>> items = readItems(order.getItemsJson());
        if (items.isEmpty()) {
            throw new RuntimeException("El pedido no tiene items para despachar.");
        }

        for (Map<String, Object> item : items) {
            ProductoModelo modelo = findModelForItem(item);
            int qty = asBigDecimal(item.get("qty"), "cantidad").intValue();
            if (qty <= 0) {
                throw new RuntimeException("La cantidad de despacho debe ser mayor a cero.");
            }
            if (modelo.getStock() < qty) {
                throw new RuntimeException("Stock insuficiente para " + item.getOrDefault("name", modelo.getModelo()));
            }
            modelo.setStock(modelo.getStock() - qty);
            productoModeloRepository.save(modelo);
        }

        SalesWorkflowDocument dispatch = SalesWorkflowDocument.builder()
                .documentKind(KIND_DISPATCH)
                .docNumber(order.getDocNumber().replace("PED-", "DESP-"))
                .orderNumber(order.getDocNumber())
                .date(OffsetDateTime.now())
                .customerJson(order.getCustomerJson())
                .itemsJson(order.getItemsJson())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentReference(order.getPaymentReference())
                .paymentEvidenceName(order.getPaymentEvidenceName())
                .paymentBankName(order.getPaymentBankName())
                .paymentBankAccountAlias(order.getPaymentBankAccountAlias())
                .paymentBankAccountNumber(order.getPaymentBankAccountNumber())
                .subtotal(order.getSubtotal())
                .igv(order.getIgv())
                .total(order.getTotal())
                .discountPct(order.getDiscountPct())
                .discountAmount(order.getDiscountAmount())
                .status("Preparando Embalaje")
                .originAddress("Almacen Central (Lurin)")
                .destinationAddress(resolveDestination(readCustomer(order.getCustomerJson())))
                .build();

        repository.delete(order);
        return toResponse(repository.save(dispatch));
    }

    private List<SalesWorkflowDocumentResponseDTO> getByKind(String kind) {
        return repository.findByDocumentKindOrderByCreatedAtDesc(kind).stream()
                .map(this::toResponse)
                .toList();
    }

    private SalesWorkflowDocument fromRequest(String kind, SalesWorkflowDocumentRequestDTO request) {
        try {
            return SalesWorkflowDocument.builder()
                    .documentKind(kind)
                    .docNumber(request.getDocNumber())
                    .orderNumber(request.getOrderNumber())
                    .date(request.getDate() != null ? request.getDate() : OffsetDateTime.now())
                    .customerJson(objectMapper.writeValueAsString(request.getCustomer()))
                    .itemsJson(objectMapper.writeValueAsString(request.getItems()))
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus(request.getPaymentStatus())
                    .paymentReference(request.getPaymentReference())
                    .paymentEvidenceName(request.getPaymentEvidenceName())
                    .paymentBankName(request.getPaymentBankName())
                    .paymentBankAccountAlias(request.getPaymentBankAccountAlias())
                    .paymentBankAccountNumber(request.getPaymentBankAccountNumber())
                    .subtotal(request.getSubtotal())
                    .igv(request.getIgv())
                    .total(request.getTotal())
                    .discountPct(request.getDiscountPct())
                    .discountAmount(request.getDiscountAmount())
                    .status(request.getStatus())
                    .originAddress(request.getOriginAddress())
                    .destinationAddress(request.getDestinationAddress())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("No se pudo serializar el documento de ventas.");
        }
    }

    private SalesWorkflowDocumentResponseDTO toResponse(SalesWorkflowDocument document) {
        return SalesWorkflowDocumentResponseDTO.builder()
                .id(document.getId())
                .docNumber(document.getDocNumber())
                .orderNumber(document.getOrderNumber())
                .date(document.getDate())
                .customer(readCustomer(document.getCustomerJson()))
                .items(readItems(document.getItemsJson()))
                .paymentMethod(document.getPaymentMethod())
                .paymentStatus(document.getPaymentStatus())
                .paymentReference(document.getPaymentReference())
                .paymentEvidenceName(document.getPaymentEvidenceName())
                .paymentBankName(document.getPaymentBankName())
                .paymentBankAccountAlias(document.getPaymentBankAccountAlias())
                .paymentBankAccountNumber(document.getPaymentBankAccountNumber())
                .subtotal(document.getSubtotal())
                .igv(document.getIgv())
                .total(document.getTotal())
                .discountPct(document.getDiscountPct())
                .discountAmount(document.getDiscountAmount())
                .status(document.getStatus())
                .originAddress(document.getOriginAddress())
                .destinationAddress(document.getDestinationAddress())
                .build();
    }

    private SalesWorkflowDocument findDocument(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento de ventas no encontrado"));
    }

    private void ensureKind(SalesWorkflowDocument document, String expectedKind) {
        if (!expectedKind.equals(document.getDocumentKind())) {
            throw new RuntimeException("El documento no pertenece al modulo solicitado.");
        }
    }

    private ProductoModelo findModelForItem(Map<String, Object> item) {
        Object productId = item.get("productId");
        if (productId != null && !String.valueOf(productId).isBlank()) {
            try {
                return productoModeloRepository.findById(UUID.fromString(String.valueOf(productId)))
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado para despacho."));
            } catch (IllegalArgumentException ignored) {
                // Fallback to SKU below.
            }
        }

        Object sku = item.get("barcode");
        if (sku != null && !String.valueOf(sku).isBlank()) {
            return productoModeloRepository.findBySku(String.valueOf(sku))
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado para despacho."));
        }

        throw new RuntimeException("El item no tiene productId ni SKU para validar stock.");
    }

    private BigDecimal asBigDecimal(Object value, String fieldName) {
        if (value == null) {
            throw new RuntimeException("Falta " + fieldName + " en el item.");
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException e) {
            throw new RuntimeException("El campo " + fieldName + " no es numerico.");
        }
    }

    private Map<String, Object> readCustomer(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("No se pudo leer el cliente del documento.");
        }
    }

    private List<Map<String, Object>> readItems(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("No se pudieron leer los items del documento.");
        }
    }

    private String resolveDestination(Map<String, Object> customer) {
        String docType = String.valueOf(customer.getOrDefault("docType", ""));
        return "RUC".equalsIgnoreCase(docType)
                ? "Obra Principal Constructora S.A.C."
                : "Direccion Domiciliaria Cliente";
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

package com.ferreteria.controller;

import com.ferreteria.model.BankAccountConfig;
import com.ferreteria.repository.BankAccountConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-config")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentConfigController {

    private final BankAccountConfigRepository bankAccountRepository;

    @GetMapping("/bank-accounts")
    public ResponseEntity<List<BankAccountConfig>> getActiveBankAccounts(
            @RequestParam(required = false, defaultValue = "PEN") String currency
    ) {
        return ResponseEntity.ok(
                bankAccountRepository.findByActiveTrueAndCurrencyIgnoreCaseOrderByBankNameAscAccountAliasAsc(currency)
        );
    }

    @PostMapping("/bank-accounts")
    public ResponseEntity<BankAccountConfig> createBankAccount(@RequestBody BankAccountConfig request) {
        request.setActive(true);
        return new ResponseEntity<>(bankAccountRepository.save(request), HttpStatus.CREATED);
    }
}

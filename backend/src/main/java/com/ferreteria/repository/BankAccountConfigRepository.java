package com.ferreteria.repository;

import com.ferreteria.model.BankAccountConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BankAccountConfigRepository extends JpaRepository<BankAccountConfig, UUID> {
    List<BankAccountConfig> findByActiveTrueOrderByBankNameAscAccountAliasAsc();
    List<BankAccountConfig> findByActiveTrueAndCurrencyIgnoreCaseOrderByBankNameAscAccountAliasAsc(String currency);
    boolean existsByBankNameIgnoreCaseAndAccountNumber(String bankName, String accountNumber);
}

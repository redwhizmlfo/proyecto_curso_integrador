package com.ferreteria.config;

import com.ferreteria.model.BankAccountConfig;
import com.ferreteria.repository.BankAccountConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentConfigInitializer implements CommandLineRunner {

    private final BankAccountConfigRepository bankAccountRepository;

    @Override
    public void run(String... args) {
        seedBankAccount("BCP", "Cuenta soles BCP", "MEPS GROUP PERU S.A.C.",
                "191-12345678-0-00", "00219100123456780000", "BCP_API", true);
        seedBankAccount("INTERBANK", "Cuenta ventas Interbank", "MEPS GROUP PERU S.A.C.",
                "200-300400500600", "00320030040050060000", "INTERBANK_API", true);
        seedBankAccount("BBVA", "Cuenta soles BBVA", "MEPS GROUP PERU S.A.C.",
                "0011-0123-01-00098765", "01112300010009876500", "BBVA_API", true);
    }

    private void seedBankAccount(
            String bankName,
            String alias,
            String holderName,
            String accountNumber,
            String cci,
            String providerCode,
            boolean supportsApi
    ) {
        if (bankAccountRepository.existsByBankNameIgnoreCaseAndAccountNumber(bankName, accountNumber)) {
            return;
        }

        BankAccountConfig account = BankAccountConfig.builder()
                .bankName(bankName)
                .accountAlias(alias)
                .accountHolderName(holderName)
                .accountNumber(accountNumber)
                .cci(cci)
                .currency("PEN")
                .documentType("RUC")
                .documentNumber("20601234567")
                .supportsApi(supportsApi)
                .providerCode(providerCode)
                .active(true)
                .build();

        bankAccountRepository.saveAll(List.of(account));
    }
}

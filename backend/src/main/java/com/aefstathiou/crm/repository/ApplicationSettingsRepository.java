package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.ApplicationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ApplicationSettingsRepository extends JpaRepository<ApplicationSettings, Long> {

    @Query("SELECT s FROM ApplicationSettings s ORDER BY s.id LIMIT 1")
    Optional<ApplicationSettings> findFirst();
}

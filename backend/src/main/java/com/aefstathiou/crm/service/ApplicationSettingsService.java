package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.ApplicationSettingsDTO;
import com.aefstathiou.crm.dto.request.ApplicationSettingsUpdateRequest;
import com.aefstathiou.crm.mapper.ApplicationSettingsDTOMapper;
import com.aefstathiou.crm.model.ApplicationSettings;
import com.aefstathiou.crm.repository.ApplicationSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationSettingsService {

    private final ApplicationSettingsRepository applicationSettingsRepository;
    private final ApplicationSettingsDTOMapper applicationSettingsDTOMapper;
    private final AttachmentService attachmentService;

    @Value("${com.aefstathiou.app-name}")
    private String defaultAppName;

    @Transactional
    public ApplicationSettingsDTO getApplicationSettings() {
        ApplicationSettings settings = applicationSettingsRepository.findFirst().orElseGet(() -> {
            ApplicationSettings newSettings = new ApplicationSettings();
            newSettings.setAppName(defaultAppName);
            return applicationSettingsRepository.save(newSettings);
        });

        return applicationSettingsDTOMapper.apply(settings);
    }

    @Transactional
    public ApplicationSettingsDTO updateApplicationSettings(ApplicationSettingsUpdateRequest settingsDto) {
        ApplicationSettings settings = applicationSettingsRepository.findFirst().orElse(new ApplicationSettings());

        settings.setAppName(settingsDto.appName());

        ApplicationSettings updatedApplicationSettings = applicationSettingsRepository.save(settings);

        return applicationSettingsDTOMapper.apply(updatedApplicationSettings);
    }

    @Transactional
    public void updateLogoUrl(String logoUrl) {
        ApplicationSettings settings = applicationSettingsRepository.findFirst().orElseThrow(
                () -> new IllegalStateException("Application settings not found.")
        );
        settings.setLogoUrl(logoUrl);
        applicationSettingsRepository.save(settings);
    }

    public UrlResource getLogoAsResource() {
        ApplicationSettings settings = applicationSettingsRepository.findFirst().orElse(null);

        if (settings == null || settings.getLogoUrl() == null || settings.getLogoUrl().isBlank()) {
            return null;
        }

        return attachmentService.loadFileAsResourceByPath(settings.getLogoUrl());
    }
}
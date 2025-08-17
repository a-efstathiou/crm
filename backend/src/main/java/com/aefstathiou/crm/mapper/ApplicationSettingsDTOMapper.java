package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.ApplicationSettingsDTO;
import com.aefstathiou.crm.model.ApplicationSettings;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class ApplicationSettingsDTOMapper implements Function<ApplicationSettings, ApplicationSettingsDTO> {

    @Override
    public ApplicationSettingsDTO apply(ApplicationSettings applicationSettings) {
        return new ApplicationSettingsDTO(
                applicationSettings.getAppName()
        );
    }
}

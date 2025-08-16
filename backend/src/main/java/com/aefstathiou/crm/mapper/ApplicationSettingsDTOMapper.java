package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.ApplicationSettingsDTO;
import com.aefstathiou.crm.dto.UserDTO;
import com.aefstathiou.crm.model.ApplicationSettings;
import com.aefstathiou.crm.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ApplicationSettingsDTOMapper implements Function<ApplicationSettings, ApplicationSettingsDTO> {

    @Override
    public ApplicationSettingsDTO apply(ApplicationSettings applicationSettings) {
        return new ApplicationSettingsDTO(
                applicationSettings.getAppName()
        );
    }
}

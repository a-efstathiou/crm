package com.aefstathiou.crm.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "application_settings")
@Getter
@Setter
public class ApplicationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Integer singleton = 1;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "logo_url")
    private String logoUrl;

}

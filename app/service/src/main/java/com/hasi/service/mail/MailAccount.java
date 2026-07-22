package com.hasi.service.mail;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mail_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MailAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long Id;
    //임시Id
    private String userId;
    private String email;
    private String password;
    private String provider;
    private String imapHost;
    private int imapPort;


}

package com.aefstathiou.crm.event;

import com.aefstathiou.crm.model.SupportTicket;

import java.util.List;

public record AttachmentAddedEvent(
        SupportTicket ticket,
        List<String> newFileNames
) {
}

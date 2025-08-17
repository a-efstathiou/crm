package com.aefstathiou.crm.event;

import com.aefstathiou.crm.model.SupportTicket;

public record TicketCreatedEvent(
        SupportTicket ticket
) {
}

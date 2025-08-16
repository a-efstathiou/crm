package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.CommentDTO;
import com.aefstathiou.crm.dto.request.CommentCreateRequest;
import com.aefstathiou.crm.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long ticketId,
            @RequestBody @Valid CommentCreateRequest request,
            Principal principal
    ) {
        CommentDTO newComment = commentService.createComment(ticketId, request, principal);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getCommentsForTicket(
            @PathVariable Long ticketId,
            Principal principal
    ) {
        List<CommentDTO> comments = commentService.getCommentsForTicket(ticketId, principal);
        return ResponseEntity.ok(comments);
    }
}

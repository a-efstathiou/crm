package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.CommentDTO;
import com.aefstathiou.crm.model.Comment;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class CommentDTOMapper implements Function<Comment, CommentDTO> {
    @Override
    public CommentDTO apply(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.isInternalNote(),
                comment.getCreatedAt()
        );
    }
}

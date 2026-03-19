package com.web.service;

import com.web.dto.comment.CommentResponse;
import com.web.dto.comment.CreateCommentRequest;
import com.web.entity.Comment;
import com.web.entity.Project;
import com.web.entity.Task;
import com.web.entity.User;
import com.web.repository.CommentRepository;
import com.web.repository.TaskRepository;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentResponse> listComments(Integer projectId, Integer taskId, String requesterEmail) {
        Task task = findTask(projectId, taskId);
        User requester = findUser(requesterEmail);
        ensureCanManageComment(task, requesterEmail, requester.getId(),
                "Ban khong co quyen xem comment trong task nay");

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CommentResponse createComment(Integer projectId, Integer taskId, CreateCommentRequest req,
            String requesterEmail) {
        Task task = findTask(projectId, taskId);
        User requester = findUser(requesterEmail);
        ensureCanManageComment(task, requesterEmail, requester.getId(), "Ban khong co quyen comment trong task nay");

        Comment comment = new Comment();
        comment.setContent(req.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setTask(task);
        comment.setUser(requester);

        Comment saved = commentRepository.save(comment);
        return toResponse(saved);
    }

    public void deleteComment(Integer projectId, Integer taskId, Integer commentId, String requesterEmail) {
        Task task = findTask(projectId, taskId);
        User requester = findUser(requesterEmail);
        ensureCanManageComment(task, requesterEmail, requester.getId(),
                "Ban khong co quyen xoa comment trong task nay");

        Comment comment = commentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay comment id=" + commentId));

        commentRepository.delete(comment);
    }

    private Task findTask(Integer projectId, Integer taskId) {
        return taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay task id=" + taskId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + email));
    }

    private void ensureCanManageComment(Task task, String requesterEmail, Long requesterId, String errorMessage) {
        if (!isOwner(task.getProject(), requesterEmail) && !isAssignee(task, requesterId)) {
            throw new AccessDeniedException(errorMessage);
        }
    }

    private boolean isOwner(Project project, String email) {
        return project != null
                && project.getOwner() != null
                && project.getOwner().getEmail() != null
                && project.getOwner().getEmail().equalsIgnoreCase(email);
    }

    private boolean isAssignee(Task task, Long userId) {
        return task != null
                && task.getAssignee() != null
                && task.getAssignee().getId() != null
                && task.getAssignee().getId().equals(userId);
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse res = new CommentResponse();
        res.setId(comment.getId());
        res.setContent(comment.getContent());
        res.setCreatedAt(comment.getCreatedAt());
        if (comment.getTask() != null) {
            res.setTaskId(comment.getTask().getId());
            if (comment.getTask().getProject() != null) {
                res.setProjectId(comment.getTask().getProject().getId());
            }
        }
        if (comment.getUser() != null) {
            res.setUserId(comment.getUser().getId());
            res.setUserName(comment.getUser().getName());
            res.setUserEmail(comment.getUser().getEmail());
        }
        return res;
    }
}

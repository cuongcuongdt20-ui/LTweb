package com.web.service;

import com.web.dto.task.TaskHistoryResponse;
import com.web.dto.task.TaskResponse;
import com.web.entity.Project;
import com.web.entity.ProjectMember;
import com.web.entity.Task;
import com.web.entity.TaskHistory;
import com.web.entity.User;
import com.web.repository.CommentRepository;
import com.web.repository.ProjectMemberRepository;
import com.web.repository.ProjectRepository;
import com.web.repository.TaskHistoryRepository;
import com.web.repository.TaskRepository;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
public class TaskService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    @Autowired
    private CommentRepository commentRepository;

    public TaskResponse createTask(Integer projectId, Map<String, Object> req, String requesterEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay project id=" + projectId));

        if (!isOwner(project, requesterEmail)) {
            throw new AccessDeniedException("Ban khong co quyen tao task trong project nay");
        }

        User reporter = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + requesterEmail));

        String title = requireText(req, "title", "Tieu de task khong duoc de trong");
        if (title.length() > 255) {
            throw new IllegalArgumentException("Tieu de toi da 255 ky tu");
        }

        String description = optionalText(req, "description");
        if (description != null && description.length() > 2000) {
            throw new IllegalArgumentException("Mo ta toi da 2000 ky tu");
        }

        String assigneeEmail = requireText(req, "assigneeEmail", "Email nguoi duoc giao khong duoc de trong");
        validateEmail(assigneeEmail);

        String priority = optionalText(req, "priority");
        Double estimatedHours = optionalDouble(req, "estimatedHours");
        LocalDateTime startedAt = optionalDateTime(req, "startedAt");
        LocalDateTime dueDate = optionalDateTime(req, "dueDate");

        User assignee = resolveAssignee(project, assigneeEmail);

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(Task.TaskStatus.TODO.name());
        if (priority != null) {
            task.setPriority(priority);
        }
        task.setEstimatedHours(estimatedHours);
        task.setStartedAt(startedAt);
        task.setDueDate(dueDate);
        task.setProject(project);
        task.setAssignee(assignee);
        task.setReporter(reporter);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public List<TaskResponse> listMyTasks(Integer projectId, String requesterEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay project id=" + projectId));

        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + requesterEmail));

        if (isOwner(project, requesterEmail)) {
            return taskRepository.findByProjectId(projectId)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (!isActiveMember(projectId, user.getId())) {
            throw new AccessDeniedException("Ban khong co quyen xem task trong project nay");
        }

        return taskRepository.findByProjectIdAndAssigneeId(projectId, user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> listAssignedTasks(String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + requesterEmail));

        return taskRepository.findByAssigneeId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskHistoryResponse> listTaskHistories(Integer projectId, Integer taskId, String requesterEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay task id=" + taskId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + requesterEmail));

        if (!canAccessTask(task, requesterEmail, requester.getId())) {
            throw new AccessDeniedException("Ban khong co quyen xem lich su task nay");
        }

        return taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId)
                .stream()
                .map(this::toTaskHistoryResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTask(Integer projectId, Integer taskId, Map<String, Object> req, String requesterEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay task id=" + taskId));

        if (!isOwner(task.getProject(), requesterEmail)) {
            throw new AccessDeniedException("Chi owner project moi duoc cap nhat thong tin task");
        }

        if (req.containsKey("title")) {
            String title = requireText(req, "title", "Tieu de task khong duoc de trong");
            if (title.length() > 255) {
                throw new IllegalArgumentException("Tieu de toi da 255 ky tu");
            }
            task.setTitle(title);
        }

        if (req.containsKey("description")) {
            String description = optionalText(req, "description");
            if (description != null && description.length() > 2000) {
                throw new IllegalArgumentException("Mo ta toi da 2000 ky tu");
            }
            task.setDescription(description);
        }

        if (req.containsKey("priority")) {
            String priority = optionalText(req, "priority");
            if (priority == null) {
                task.setPriority("MEDIUM");
            } else {
                task.setPriority(priority);
            }
        }

        if (req.containsKey("estimatedHours")) {
            task.setEstimatedHours(optionalDouble(req, "estimatedHours"));
        }

        if (req.containsKey("actualHours")) {
            task.setActualHours(optionalDouble(req, "actualHours"));
        }

        if (req.containsKey("startedAt")) {
            task.setStartedAt(optionalDateTime(req, "startedAt"));
        }

        if (req.containsKey("dueDate")) {
            task.setDueDate(optionalDateTime(req, "dueDate"));
        }

        if (req.containsKey("assigneeEmail")) {
            task.setAssignee(resolveAssignee(task.getProject(), requireText(req, "assigneeEmail",
                    "Email nguoi duoc giao khong duoc de trong")));
        }

        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public TaskResponse updateStatus(Integer projectId, Integer taskId, Map<String, Object> req,
            String requesterEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay task id=" + taskId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalStateException("Khong tim thay user: " + requesterEmail));

        boolean owner = isOwner(task.getProject(), requesterEmail);
        boolean assignee = isAssignee(task, requester.getId());
        if (!owner && !assignee) {
            throw new AccessDeniedException("Chi owner project hoac nguoi duoc giao task moi duoc cap nhat trang thai");
        }

        if (!owner && !isActiveMember(projectId, requester.getId())) {
            throw new AccessDeniedException("Ban khong con la thanh vien cua project nay");
        }

        Task.TaskStatus newStatus = Task.TaskStatus
                .fromRequest(requireText(req, "status", "Trang thai khong duoc de trong"));
        String normalizedNewStatus = newStatus.name();
        String oldStatus = normalizeStatus(task.getStatus());
        boolean statusChanged = oldStatus == null || !oldStatus.equals(normalizedNewStatus);
        LocalDateTime now = LocalDateTime.now();
        if (statusChanged) {
            task.setStatus(normalizedNewStatus);
        }
        task.setUpdatedAt(now);
        updateTaskTimeline(task, oldStatus, newStatus, now);

        Task saved = taskRepository.save(task);
        if (statusChanged) {
            createTaskHistory(saved, requester, oldStatus, normalizedNewStatus, now);
        }
        return toResponse(saved);
    }

    @Transactional
    public void deleteTask(Integer projectId, Integer taskId, String requesterEmail) {
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay task id=" + taskId));

        if (!isOwner(task.getProject(), requesterEmail)) {
            throw new AccessDeniedException("Ban khong co quyen xoa task trong project nay");
        }

        try {
            commentRepository.clearTaskByTaskId(taskId);
            taskHistoryRepository.clearTaskByTaskId(taskId);
            taskRepository.delete(task);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Khong the xoa task dang duoc tham chieu");
        }
    }

    private boolean isOwner(Project project, String email) {
        return project != null
                && project.getOwner() != null
                && project.getOwner().getEmail() != null
                && project.getOwner().getEmail().equalsIgnoreCase(email);
    }

    private boolean isActiveMember(Integer projectId, Long userId) {
        Optional<ProjectMember> pmOpt = projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
        return pmOpt.isPresent() && pmOpt.get().getLeftAt() == null;
    }

    private boolean canAccessTask(Task task, String requesterEmail, Long requesterId) {
        return isOwner(task.getProject(), requesterEmail) || isAssignee(task, requesterId);
    }

    private boolean isAssignee(Task task, Long userId) {
        return task != null
                && task.getAssignee() != null
                && task.getAssignee().getId() != null
                && task.getAssignee().getId().equals(userId);
    }

    private User resolveAssignee(Project project, String assigneeEmail) {
        validateEmail(assigneeEmail);

        User assignee = userRepository.findByEmail(assigneeEmail)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay user voi email: " + assigneeEmail));

        if (!isOwner(project, assignee.getEmail()) && !isActiveMember(project.getId(), assignee.getId())) {
            throw new IllegalStateException("Nguoi duoc giao khong la thanh vien cua project");
        }

        return assignee;
    }

    private void createTaskHistory(Task task, User user, String oldStatus, String newStatus, LocalDateTime changedAt) {
        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setUser(user);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setProgressAtThatTime(task.getProgress());
        history.setChangedAt(changedAt);
        taskHistoryRepository.save(history);
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        return Task.TaskStatus.fromStoredValue(status).name();
    }

    private void updateTaskTimeline(Task task, String oldStatus, Task.TaskStatus newStatus, LocalDateTime now) {
        if ((newStatus == Task.TaskStatus.IN_PROGRESS || newStatus == Task.TaskStatus.DONE)
                && task.getStartedAt() == null) {
            task.setStartedAt(now);
        }

        if (newStatus == Task.TaskStatus.DONE) {
            if (!Task.TaskStatus.DONE.name().equals(oldStatus) || task.getCompletedAt() == null) {
                task.setCompletedAt(now);
            }
            return;
        }

        if (task.getCompletedAt() != null) {
            task.setCompletedAt(null);
        }
    }

    private String requireText(Map<String, Object> payload, String field, String message) {
        String value = optionalText(payload, field);
        if (value == null) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private String optionalText(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        if (value == null) {
            return null;
        }

        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private Double optionalDouble(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        String text = value.toString().trim();
        if (text.isEmpty()) {
            return null;
        }

        try {
            return Double.valueOf(text);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Gia tri " + field + " khong hop le");
        }
    }

    private LocalDateTime optionalDateTime(Map<String, Object> payload, String field) {
        Object value = payload.get(field);
        if (value == null) {
            return null;
        }

        String text = value.toString().trim();
        if (text.isEmpty()) {
            return null;
        }

        try {
            return LocalDateTime.parse(text);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Gia tri " + field + " khong hop le, dung dinh dang ISO-8601");
        }
    }

    private void validateEmail(String email) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Email khong hop le");
        }
    }

    private TaskResponse toResponse(Task task) {
        TaskResponse res = new TaskResponse();
        res.setId(task.getId());
        if (task.getProject() != null) {
            res.setProjectId(task.getProject().getId());
        }
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setStatus(task.getStatus());
        res.setPriority(task.getPriority());
        res.setProgress(task.getProgress());
        res.setEstimatedHours(task.getEstimatedHours());
        res.setActualHours(task.getActualHours());
        res.setStartedAt(task.getStartedAt());
        res.setCompletedAt(task.getCompletedAt());
        res.setDueDate(task.getDueDate());
        res.setCreatedAt(task.getCreatedAt());
        res.setUpdatedAt(task.getUpdatedAt());
        if (task.getAssignee() != null) {
            res.setAssigneeId(task.getAssignee().getId());
            res.setAssigneeName(task.getAssignee().getName());
            res.setAssigneeEmail(task.getAssignee().getEmail());
        }
        if (task.getReporter() != null) {
            res.setReporterId(task.getReporter().getId());
            res.setReporterName(task.getReporter().getName());
        }
        return res;
    }

    private TaskHistoryResponse toTaskHistoryResponse(TaskHistory history) {
        TaskHistoryResponse res = new TaskHistoryResponse();
        res.setId(history.getId());
        res.setOldStatus(history.getOldStatus());
        res.setNewStatus(history.getNewStatus());
        res.setProgressAtThatTime(history.getProgressAtThatTime());
        res.setChangedAt(history.getChangedAt());
        if (history.getTask() != null) {
            res.setTaskId(history.getTask().getId());
            if (history.getTask().getProject() != null) {
                res.setProjectId(history.getTask().getProject().getId());
            }
        }
        if (history.getUser() != null) {
            res.setUserId(history.getUser().getId());
            res.setUserName(history.getUser().getName());
            res.setUserEmail(history.getUser().getEmail());
        }
        return res;
    }
}

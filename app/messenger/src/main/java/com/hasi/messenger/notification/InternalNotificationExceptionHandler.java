package com.hasi.messenger.notification;

import com.hasi.messenger.model.InternalErrorDetail;
import com.hasi.messenger.model.InternalErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 잘못된 알림 요청에 ErrorResponse 돌려줍니다.
 *
 * @author Jinwoo Jeong
 */
@RestControllerAdvice(assignableTypes = InternalNotificationController.class)
public class InternalNotificationExceptionHandler {

    @ExceptionHandler({
            MethodArgumentNotValidException.class,          // 필수 필드 누락
            ConstraintViolationException.class,             // dedupKeys 비어 있음 (@Size(min = 1))
            MissingServletRequestParameterException.class,  // dedupKeys 자체가 없음
            TypeMismatchException.class                     // 알 수 없는 type 등
    })
    public ResponseEntity<InternalErrorResponse> handleInvalidRequest(Exception exception){
        return badRequest("VALID_001", "알림 요청이 올바르지 않습니다");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<InternalErrorResponse> handleRejected(IllegalArgumentException exception){
        return badRequest("NOTIF_001", exception.getMessage());
    }

    private ResponseEntity<InternalErrorResponse> badRequest(String code, String message){
        InternalErrorResponse body = new InternalErrorResponse();
        body.setSuccess(false);
        body.setData(null);
        body.setError(new InternalErrorDetail(code, message));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}

package com.hasi.messenger.channel;

import com.hasi.messenger.model.InternalErrorDetail;
import com.hasi.messenger.model.InternalErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 잘못된 channelIds 요청에 ErrorResponse 돌려줍니다.
 *
 * @author Jinwoo Jeong
 */
@RestControllerAdvice(assignableTypes = InternalMessageController.class)
public class InternalMessageExceptionHandler {

    @ExceptionHandler({
            ConstraintViolationException.class,             // channelIds 비어 있음 (@Size(min = 1))
            MissingServletRequestParameterException.class,  // channelIds 자체가 없음
            TypeMismatchException.class                     // channelIds가 숫자가 아님
    })
    public ResponseEntity<InternalErrorResponse> handleInvalidChannelIds(Exception exception){
        InternalErrorResponse body = new InternalErrorResponse();
        body.setSuccess(false);
        body.setData(null);
        body.setError(new InternalErrorDetail("VALID_001", "channelIds가 올바르지 않습니다"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}

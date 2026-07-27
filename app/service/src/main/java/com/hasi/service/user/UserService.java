package com.hasi.service.user;

import com.hasi.collab.model.UserData;
import com.hasi.collab.model.UserSearchResponse;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserSearchResponse searchByNickname(String nickname) {
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_001));

        return new UserSearchResponse()
                .uid(user.getUid())
                .nickname(user.getNickname());
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApiException(ErrorCode.AUTH_003);
        }
        return Long.valueOf(authentication.getName());
    }

    public UserData getMyInfo() {
        Long uid = getCurrentUserId();   // 없으면 SocialAccountService와 같은 방식으로 추가
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        return new UserData()
                .uid(user.getUid())
                .nickname(user.getNickname())
                .createdAt(user.getCreatedAt().atOffset(ZoneOffset.UTC))
                .updatedAt(user.getUpdatedAt().atOffset(ZoneOffset.UTC));
    }

    @Transactional
    public void updateNickname(String nickname){
        Long uid = getCurrentUserId();
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        if (!user.getNickname().equals(nickname)
                && userRepository.findByNickname(nickname).isPresent()) {
            throw new ApiException(ErrorCode.USER_002);
        }

        user.updateNickname(nickname);
    }

    @Transactional
    public void updateStatusMessage(String statusMessage) {
        Long uid = getCurrentUserId();
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        user.updateStatusMessage(statusMessage);
    }

    @Transactional
    public String updateAvatar(MultipartFile file) {
        Long uid = getCurrentUserId();
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        String avatarUrl = fileStorageService.uploadAvatar(uid, file);
        user.updateAvatarUrl(avatarUrl);

        return avatarUrl;
    }
}
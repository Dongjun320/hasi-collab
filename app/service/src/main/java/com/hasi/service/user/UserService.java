package com.hasi.service.user;

import com.hasi.collab.model.UserData;
import com.hasi.collab.model.UserSearchResponse;
import com.hasi.service.auth.entity.User;
import com.hasi.service.auth.repository.UserRepository;
import com.hasi.service.common.ApiException;
import com.hasi.service.common.ErrorCode;
import com.hasi.service.user.entity.UserMemo;
import com.hasi.service.user.repository.UserMemoRepository;
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
    private final UserMemoRepository userMemoRepository;

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
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .statusMessage(user.getStatusMessage())
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

    @Transactional
    public void deleteAvatar() {
        Long uid = getCurrentUserId();
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_001));

        String avatarUrl = user.getAvatarUrl();
        if (avatarUrl != null) {
            fileStorageService.deleteAvatar(avatarUrl);   // 스토리지에서 삭제
            user.updateAvatarUrl(null);                    // DB 컬럼 null 처리
        }
    }

    @Transactional
    public void upsertMemo(Long targetId, String content) {
        Long ownerId = getCurrentUserId();

        if (ownerId.equals(targetId)) {
            throw new ApiException(ErrorCode.USER_004); // 자기 자신에게 메모 불가
        }

        userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_001));

        UserMemo memo = userMemoRepository.findByOwnerIdAndTargetId(ownerId, targetId)
                .orElse(null);

        if (memo == null) {
            userMemoRepository.save(
                    UserMemo.builder()
                            .ownerId(ownerId)
                            .targetId(targetId)
                            .content(content)
                            .build()
            );
        } else {
            memo.updateContent(content);
        }
    }

    public String getMemo(Long targetId) {
        Long ownerId = getCurrentUserId();
        return userMemoRepository.findByOwnerIdAndTargetId(ownerId, targetId)
                .map(UserMemo::getContent)
                .orElse(null);
    }

    @Transactional
    public void deleteMemo(Long targetId) {
        Long ownerId = getCurrentUserId();
        userMemoRepository.deleteByOwnerIdAndTargetId(ownerId, targetId);
    }
}
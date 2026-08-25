package com.hasi.service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final S3Client s3Client;

    @Value("${ncp.object-storage.bucket}")
    private String bucket;

    @Value("${ncp.object-storage.endpoint}")
    private String endpoint;

    public String uploadAvatar(Long uid, MultipartFile file) {
        String extension = getExtension(file.getOriginalFilename());
        String key = "profile/" + uid + "_" + UUID.randomUUID() + extension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .acl("public-read")
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }

        return endpoint + "/" + bucket + "/" + key;   // 공개 접근 URL
    }

    public String uploadWorkspaceIcon(Long workspaceId, MultipartFile file) {
        String extension = getExtension(file.getOriginalFilename());
        String key = "workspace/" + workspaceId + "_" + UUID.randomUUID() + extension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .acl("public-read")
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }

        return endpoint + "/" + bucket + "/" + key;   // 공개 접근 URL
    }

    // URL로 저장소 객체 삭제 (아바타/워크스페이스 아이콘 공용)
    public void deleteByUrl(String url) {
        String key = extractKeyFromUrl(url);
        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .build()
        );
    }

    private String extractKeyFromUrl(String url) {
        // endpoint + "/" + bucket + "/" 부분을 제거하면 key만 남음
        String prefix = endpoint + "/" + bucket + "/";
        return url.replace(prefix, "");
    }

    public void deleteAvatar(String avatarUrl){
        String key = extractKeyFromUrl(avatarUrl);   // URL에서 "profile/xxx.png" 부분만 추출

        s3Client.deleteObject(
                DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .build()
        );

    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
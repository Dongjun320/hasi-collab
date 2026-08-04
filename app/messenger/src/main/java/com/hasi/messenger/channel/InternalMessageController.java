package com.hasi.messenger.channel;

import com.hasi.messenger.api.InternalMessageApi;
import com.hasi.messenger.model.ChannelMessagesDeleteData;
import com.hasi.messenger.model.ChannelMessagesDeleteResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Service -> Messenger 내부 호출용 REST 엔드포인트.
 *
 * @author Jinwoo Jeong
 */
@RestController
public class InternalMessageController implements InternalMessageApi {

    private final ChannelService channelService;

    public InternalMessageController(ChannelService channelService){
        this.channelService = channelService;
    }

    @Override
    public ResponseEntity<ChannelMessagesDeleteResponse> deleteChannelMessages(List<Long> channelIds){
        ChannelDtos.DeletedCounts counts = channelService.deleteChannelMessages(channelIds);

        ChannelMessagesDeleteData data = new ChannelMessagesDeleteData();
        data.setDeletedMessages(counts.messages());
        data.setDeletedReadStates(counts.readStates());

        ChannelMessagesDeleteResponse response = new ChannelMessagesDeleteResponse();
        response.setSuccess(true);
        response.setData(data);
        response.setError(null);
        return ResponseEntity.ok(response);
    }
}

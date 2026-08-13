package com.hasi.service.workspace.channel.event;

import java.util.List;

public record ChannelMessagesPurgeEvent(List<Long> channelIds) {
}

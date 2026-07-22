package com.hasi.service.config;

import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueSerializer;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.boot.jackson.JacksonComponent;

@JacksonComponent
public class JsonNullableSerializer extends ValueSerializer<JsonNullable<?>> {

    @Override
    public void serialize(JsonNullable<?> value, JsonGenerator gen, SerializationContext ctxt) {
        if (value.isPresent()) {
            gen.writePOJO(value.get());
        } else {
            gen.writeNull();
        }
    }
}
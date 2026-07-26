package com.hasi.service.config;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.BeanProperty;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ValueDeserializer;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.boot.jackson.JacksonComponent;

@JacksonComponent
public class JsonNullableDeserializer extends ValueDeserializer<JsonNullable<?>> {

    private final JavaType valueType;

    public JsonNullableDeserializer() {
        this(null);
    }

    private JsonNullableDeserializer(JavaType valueType) {
        this.valueType = valueType;
    }

    // 프로퍼티별로 JsonNullable<T>의 T를 알아내서 전용 인스턴스 생성
    @Override
    public ValueDeserializer<?> createContextual(DeserializationContext ctxt, BeanProperty property) {
        JavaType wrapperType = (property != null) ? property.getType() : ctxt.getContextualType();
        JavaType contained = (wrapperType != null && wrapperType.containedTypeCount() > 0)
                ? wrapperType.containedType(0)
                : ctxt.constructType(Object.class);
        return new JsonNullableDeserializer(contained);
    }

    @Override
    public JsonNullable<?> deserialize(JsonParser p, DeserializationContext ctxt) {
        Object value = (valueType == null)
                ? ctxt.readValue(p, Object.class)
                : ctxt.readValue(p, valueType);
        return JsonNullable.of(value);
    }

    // JSON에 "field": null 로 명시된 경우
    @Override
    public JsonNullable<?> getNullValue(DeserializationContext ctxt) {
        return JsonNullable.of(null);
    }

    // JSON에 필드 자체가 없는 경우 (주로 creator/생성자 바인딩 경로에서 사용됨)
    @Override
    public Object getAbsentValue(DeserializationContext ctxt) {
        return JsonNullable.undefined();
    }
}
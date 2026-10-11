#include "stdafx.h"

#include "V8Helpers.h"
#include "V8ResourceImpl.h"
#include "helpers/BindHelpers.h"

using namespace alt;

static void Constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
{
    V8_GET_ISOLATE_CONTEXT_RESOURCE();
    V8_CHECK_CONSTRUCTOR();
    V8_CHECK_ARGS_LEN_MIN_MAX(3, 6);

    uint32_t model;
    if(info[0]->IsString())
    {
        V8_ARG_TO_STRING(1, modelStr);
        model = alt::ICore::Instance().Hash(modelStr);
    }
    else if(info[0]->IsNumber())
    {
        V8_ARG_TO_UINT(1, modelHash);
        model = modelHash;
    }

    V8_ARG_TO_VECTOR3(2, pos);
    V8_ARG_TO_VECTOR3(3, rot);

    uint8_t alpha = 255;
    if(info[3]->IsNumber())
    {
        V8_ARG_TO_UINT(4, alphaVal);
        alpha = alphaVal;
    }

    uint8_t textureVariation = 0;
    if(info[4]->IsNumber())
    {
        V8_ARG_TO_UINT(5, textureVariationVal);
        textureVariation = textureVariationVal;
    }

    uint16_t lodDistance = 100;
    if(info[5]->IsNumber())
    {
        V8_ARG_TO_UINT(6, lodDistanceVal);
        lodDistance = lodDistanceVal;
    }

    alt::IObject* object = alt::ICore::Instance().CreateObject(model, pos, rot, alpha, textureVariation, lodDistance);
    V8_CHECK(object, "Failed to create object");
    resource->BindEntity(info.This(), object);
}

static void AllGetter(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value>& info)
{
    V8_GET_ISOLATE_CONTEXT_RESOURCE();

    std::vector<alt::IBaseObject*> objects = alt::ICore::Instance().GetBaseObjects(alt::IBaseObject::Type::OBJECT);
    v8::Local<v8::Array> arr = v8::Array::New(isolate, objects.size());
    for(size_t i = 0; i < objects.size(); ++i)
    {
        arr->Set(resource->GetContext(), i, resource->GetBaseObjectOrNull(objects[i]));
    }
    V8_RETURN(arr);
}

static void CountGetter(v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value>& info)
{
    V8_RETURN_UINT(alt::ICore::Instance().GetBaseObjects(alt::IBaseObject::Type::OBJECT).size());
}

// clang-format off
extern V8Class v8Entity;
extern V8Class v8NetworkObject("NetworkObject", v8Entity, Constructor, [](v8::Local<v8::FunctionTemplate> tpl)
{
    v8::Isolate* isolate = v8::Isolate::GetCurrent();

    V8Helpers::SetStaticAccessor(isolate, tpl, "all", &AllGetter);
    V8Helpers::SetStaticAccessor(isolate, tpl, "count", &CountGetter);

    V8Helpers::SetMethod<alt::IObject, &alt::IObject::ActivatePhysics>(isolate, tpl, "activatePhysics");
    V8Helpers::SetMethod<alt::IObject, &alt::IObject::PlaceOnGroundProperly>(isolate, tpl, "placeOnGroundProperly");

    V8Helpers::SetAccessor<alt::IObject, uint8_t, &alt::IObject::GetAlpha, &alt::IObject::SetAlpha>(isolate, tpl, "alpha");
    V8Helpers::SetAccessor<alt::IObject, uint8_t, &alt::IObject::GetTextureVariation, &alt::IObject::SetTextureVariation>(isolate, tpl, "textureVariation");
    V8Helpers::SetAccessor<alt::IObject, uint16_t, &alt::IObject::GetLodDistance, &alt::IObject::SetLodDistance>(isolate, tpl, "lodDistance");
});


if(NOT SDK_PROJECT_NAME)
    set(SDK_PROJECT_NAME alt-sdk)
endif()

add_custom_target(${SDK_PROJECT_NAME}
    COMMAND ${CMAKE_COMMAND} -E echo "SDK Version generated"
)

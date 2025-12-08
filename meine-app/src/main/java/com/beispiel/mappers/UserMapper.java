package com.beispiel.mappers;

import com.beispiel.entities.UserEntity;
import com.beispiel.dtos.UserDto;

public class UserMapper { // UserEntity => (umwandeln in) UserDto

    public static UserDto toUserDto(UserEntity userEntity) {
        if (userEntity == null) {
            return null;
        }

        UserDto userDto = new UserDto();
        userDto.setId(userEntity.getId());
        userDto.setEmail(userEntity.getEmail());
        userDto.setRole(userEntity.getRole());
        userDto.setCreatedAt(userEntity.getCreatedAt());

        return userDto;
    }
}
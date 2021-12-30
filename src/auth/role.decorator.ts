import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
export type AllowedRoles = keyof typeof UserRole | 'Any'; //enum은 런타임에서 Object로 실행되므로(컴파일시에는 type으로 취급지만)
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
//메타데이터는 resolver에게 제공되는 일종의 추가적인 데이터

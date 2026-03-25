import { IsString, MinLength } from "class-validator";

export class SigninDto {
  @IsString({ message: "아이디를 입력하세요." })
  @MinLength(1, { message: "아이디를 입력하세요." })
  username: string;

  @IsString({ message: "아이디를 입력하세요." })
  @MinLength(1, { message: "아이디를 입력하세요." })
  password: string;
}

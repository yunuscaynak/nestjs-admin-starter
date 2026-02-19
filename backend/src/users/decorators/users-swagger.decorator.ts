import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '../../common/dto/http-error-response.dto';
import { UserSortOption } from '../dto/list-users-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';

function ApiUserIdParam(description: string) {
  return ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description,
  });
}

function ApiQueryOrBodyValidationError() {
  return ApiBadRequestResponse({
    description: 'Istek dogrulanamadi. Gecersiz query ya da body alani var.',
    type: ValidationErrorResponseDto,
  });
}

function ApiPathParamValidationError() {
  return ApiBadRequestResponse({
    description: 'Path parametresi dogrulanamadi.',
    type: HttpErrorResponseDto,
  });
}

function ApiPathAndBodyValidationError() {
  return applyDecorators(
    ApiExtraModels(HttpErrorResponseDto, ValidationErrorResponseDto),
    ApiBadRequestResponse({
      description:
        'Istek dogrulanamadi. Path parametresi veya body alani gecersiz.',
      schema: {
        oneOf: [
          { $ref: getSchemaPath(HttpErrorResponseDto) },
          { $ref: getSchemaPath(ValidationErrorResponseDto) },
        ],
      },
    }),
  );
}

function ApiEmailConflict() {
  return ApiConflictResponse({
    description: 'E-posta zaten kullanimda.',
    type: HttpErrorResponseDto,
  });
}

function ApiDbUnavailable() {
  return ApiServiceUnavailableResponse({
    description: 'Veritabani baglantisi su anda kullanilamiyor.',
    type: HttpErrorResponseDto,
  });
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Yeni kullanici olustur',
      description:
        'Body uzerindeki alanlar dogrulandiysa yeni bir kullanici acilir.',
    }),
    ApiCreatedResponse({
      description: 'Kullanici basariyla olusturuldu.',
      type: UserResponseDto,
    }),
    ApiQueryOrBodyValidationError(),
    ApiEmailConflict(),
    ApiDbUnavailable(),
  );
}

export function ApiFindAllUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Kullanicilari listele',
      description:
        'Sayfalama, metin arama ve siralama parametreleri ile kullanici listesi doner.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Sayfa numarası (varsayılan: 1).',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
      description: 'Sayfa başına kayıt sayısı (varsayılan: 20, maksimum: 100).',
    }),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'yunus',
      description: 'Ad veya e-posta üzerinde metin araması.',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      enum: UserSortOption,
      enumName: 'UserSortOption',
      example: UserSortOption.CreatedAtDesc,
      description: 'Siralama bicimi.',
    }),
    ApiOkResponse({
      description: 'Kullanici listesi donduruldu.',
      type: UserResponseDto,
      isArray: true,
    }),
    ApiQueryOrBodyValidationError(),
    ApiDbUnavailable(),
  );
}

export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tek kullanici getir',
      description: 'Verilen id ile tek bir kullanici kaydi doner.',
    }),
    ApiUserIdParam('Detayi istenen kullanicinin ID degeri.'),
    ApiOkResponse({
      description: 'Kullanici bulundu.',
      type: UserResponseDto,
    }),
    ApiPathParamValidationError(),
    ApiNotFoundResponse({
      description: 'Kullanici bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiDbUnavailable(),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Kullaniciyi guncelle',
      description:
        'Verilen id ile eslesen kayitta body ile gelen alanlari kismi olarak gunceller.',
    }),
    ApiUserIdParam('Guncellenecek kullanicinin ID degeri.'),
    ApiOkResponse({
      description: 'Kullanici basariyla guncellendi.',
      type: UserResponseDto,
    }),
    ApiPathAndBodyValidationError(),
    ApiNotFoundResponse({
      description: 'Kullanici bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiEmailConflict(),
    ApiDbUnavailable(),
  );
}

export function ApiRemoveUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Kullaniciyi sil',
      description: 'Verilen id ile eslesen kullanici kaydini siler.',
    }),
    ApiUserIdParam('Silinecek kullanicinin ID degeri.'),
    ApiOkResponse({
      description: 'Kullanici basariyla silindi.',
      type: UserResponseDto,
    }),
    ApiPathParamValidationError(),
    ApiNotFoundResponse({
      description: 'Kullanici bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiDbUnavailable(),
  );
}

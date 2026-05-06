import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  HttpErrorResponseDto,
  ValidationErrorResponseDto,
} from '../../common/dto/http-error-response.dto';
import { PostSortOption } from '../dto/list-posts-query.dto';
import { PostResponseDto } from '../dto/post-response.dto';

function ApiPostIdParam(description: string) {
  return ApiParam({
    name: 'id',
    type: String,
    example: 'cmab12cd30000xyz123456789',
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

function ApiDbUnavailable() {
  return ApiServiceUnavailableResponse({
    description: 'Veritabani baglantisi su anda kullanilamiyor.',
    type: HttpErrorResponseDto,
  });
}

function ApiAdminAuth() {
  return applyDecorators(
    ApiBearerAuth('bearer'),
    ApiUnauthorizedResponse({
      description: 'Bearer token eksik veya gecersiz.',
      type: HttpErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Bu endpoint sadece admin kullanicilar icin aciktir.',
      type: HttpErrorResponseDto,
    }),
  );
}

export function ApiCreatePost() {
  return applyDecorators(
    ApiAdminAuth(),
    ApiOperation({
      summary: 'Yeni post olustur',
      description:
        'Body uzerindeki alanlar dogrulandiysa yeni bir post kaydi acilir.',
    }),
    ApiCreatedResponse({
      description: 'Post basariyla olusturuldu.',
      type: PostResponseDto,
    }),
    ApiQueryOrBodyValidationError(),
    ApiDbUnavailable(),
  );
}

export function ApiFindAllPosts() {
  return applyDecorators(
    ApiAdminAuth(),
    ApiOperation({
      summary: 'Postlari listele',
      description:
        'Sayfalama, arama, yazar ve yayin durumu filtreleriyle post listesi doner.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Sayfa numarasi.',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
      description: 'Sayfa basina kayit sayisi.',
    }),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'nestjs',
      description: 'Baslik veya icerik uzerinde arama.',
    }),
    ApiQuery({
      name: 'authorId',
      required: false,
      type: String,
      example: 'cmab12cd30000xyz123456789',
      description: 'Belirli bir yazarin postlarini filtreler.',
    }),
    ApiQuery({
      name: 'published',
      required: false,
      type: Boolean,
      example: true,
      description: 'Yayin durumu filtresi.',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      enum: PostSortOption,
      enumName: 'PostSortOption',
      example: PostSortOption.CreatedAtDesc,
      description: 'Siralama bicimi.',
    }),
    ApiOkResponse({
      description: 'Post listesi donduruldu.',
      type: PostResponseDto,
      isArray: true,
    }),
    ApiQueryOrBodyValidationError(),
    ApiDbUnavailable(),
  );
}

export function ApiFindOnePost() {
  return applyDecorators(
    ApiAdminAuth(),
    ApiOperation({
      summary: 'Tek post getir',
      description: 'Verilen id ile tek bir post kaydi doner.',
    }),
    ApiPostIdParam('Detayi istenen postun ID degeri.'),
    ApiOkResponse({
      description: 'Post bulundu.',
      type: PostResponseDto,
    }),
    ApiPathParamValidationError(),
    ApiNotFoundResponse({
      description: 'Post bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiDbUnavailable(),
  );
}

export function ApiUpdatePost() {
  return applyDecorators(
    ApiAdminAuth(),
    ApiOperation({
      summary: 'Postu guncelle',
      description:
        'Verilen id ile eslesen kayitta body ile gelen alanlari kismi olarak gunceller.',
    }),
    ApiPostIdParam('Guncellenecek postun ID degeri.'),
    ApiOkResponse({
      description: 'Post basariyla guncellendi.',
      type: PostResponseDto,
    }),
    ApiPathAndBodyValidationError(),
    ApiNotFoundResponse({
      description: 'Post bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiDbUnavailable(),
  );
}

export function ApiRemovePost() {
  return applyDecorators(
    ApiAdminAuth(),
    ApiOperation({
      summary: 'Postu sil',
      description: 'Verilen id ile eslesen post kaydini siler.',
    }),
    ApiPostIdParam('Silinecek postun ID degeri.'),
    ApiOkResponse({
      description: 'Post basariyla silindi.',
      type: PostResponseDto,
    }),
    ApiPathParamValidationError(),
    ApiNotFoundResponse({
      description: 'Post bulunamadi.',
      type: HttpErrorResponseDto,
    }),
    ApiDbUnavailable(),
  );
}
